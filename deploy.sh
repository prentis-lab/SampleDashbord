#!/usr/bin/env bash
# Runs Step 2 (backend), Step 3 (frontend), and Step 4 (admin account).
# Requires terraform apply to have completed first (Step 1).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TFVARS="$SCRIPT_DIR/terraform/terraform.tfvars"

# ── helpers ───────────────────────────────────────────────────────────────────

die()  { echo "ERROR: $*" >&2; exit 1; }
info() { echo; echo "==> $*"; }

parse_tfvar() {
  grep -E "^$1\s*=" "$TFVARS" | sed -E 's/^[^=]+= *"(.*)"/\1/'
}

tf_out() { terraform -chdir="$SCRIPT_DIR/terraform" output -raw "$1"; }

# ── pre-flight ────────────────────────────────────────────────────────────────

[[ -f "$TFVARS" ]]             || die "$TFVARS not found — run ./generate-secrets.sh first."
command -v docker &>/dev/null  || die "Docker not found (must be installed and running)."
command -v aws    &>/dev/null  || die "AWS CLI not found."
command -v npm    &>/dev/null  || die "npm not found."
command -v psql   &>/dev/null  || die "psql not found — install with: brew install libpq && brew link --force libpq"

# ── load secrets from terraform.tfvars ───────────────────────────────────────

DB_PASSWORD=$(parse_tfvar db_password)
JWT_SECRET=$(parse_tfvar jwt_secret)
SESSION_SECRET=$(parse_tfvar session_secret)

[[ -n "$DB_PASSWORD"    ]] || die "db_password not found in $TFVARS"
[[ -n "$JWT_SECRET"     ]] || die "jwt_secret not found in $TFVARS"
[[ -n "$SESSION_SECRET" ]] || die "session_secret not found in $TFVARS"

# ── load terraform outputs ────────────────────────────────────────────────────

info "Reading Terraform outputs..."

REGION=$(tf_out region)
API_URL=$(tf_out api_gateway_url)
CLOUDFRONT_URL=$(tf_out cloudfront_url)
S3_FRONTEND=$(tf_out s3_frontend_bucket)
S3_LAMBDA=$(tf_out lambda_code_bucket)
DB_ENDPOINT=$(tf_out db_endpoint)        # host:port
DB_USERNAME=$(tf_out db_username)
LAMBDA_NAME=$(tf_out lambda_function_name)
RDS_SG_ID=$(tf_out rds_sg_id)

DB_HOST=$(echo "$DB_ENDPOINT" | cut -d: -f1)
DB_PORT=$(echo "$DB_ENDPOINT" | cut -d: -f2)

echo "  Region   : $REGION"
echo "  API URL  : $API_URL"
echo "  Frontend : $CLOUDFRONT_URL"
echo "  Lambda   : $LAMBDA_NAME"
echo "  DB       : $DB_ENDPOINT"

# ── step 2 — deploy backend ───────────────────────────────────────────────────

info "Step 2 — Building Lambda package..."

rm -rf "$SCRIPT_DIR/lambda_build" "$SCRIPT_DIR/lambda_package.zip"
mkdir "$SCRIPT_DIR/lambda_build"

docker run --rm \
  --platform linux/amd64 \
  -v "$SCRIPT_DIR:/app" \
  -w /app \
  --entrypoint pip \
  public.ecr.aws/lambda/python:3.11 \
  install -r backend/requirements.txt \
  -t lambda_build/ \
  --upgrade \
  --quiet

cp -r "$SCRIPT_DIR/backend/app" "$SCRIPT_DIR/lambda_build/"
(cd "$SCRIPT_DIR/lambda_build" && zip -r "$SCRIPT_DIR/lambda_package.zip" . -q)
rm -rf "$SCRIPT_DIR/lambda_build"

echo "  Uploading to s3://${S3_LAMBDA}..."
aws s3 cp "$SCRIPT_DIR/lambda_package.zip" "s3://${S3_LAMBDA}/lambda_package.zip"

echo "  Updating Lambda function code..."
aws lambda update-function-code \
  --function-name "$LAMBDA_NAME" \
  --s3-bucket "$S3_LAMBDA" \
  --s3-key lambda_package.zip \
  --region "$REGION" \
  --output text --query 'FunctionName'

echo "  Waiting for code update to finish..."
aws lambda wait function-updated \
  --function-name "$LAMBDA_NAME" \
  --region "$REGION"

echo "  Setting Lambda environment variables..."

# Write env vars to a temp file so secrets never appear in shell process list.
ENV_JSON=$(mktemp)
trap 'rm -f "$ENV_JSON"' EXIT

cat > "$ENV_JSON" <<JSON
{
  "Variables": {
    "DATABASE_URL":   "postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}/sample",
    "SECRET_KEY":     "${JWT_SECRET}",
    "SESSION_SECRET": "${SESSION_SECRET}",
    "FRONTEND_URL":   "${CLOUDFRONT_URL}"
  }
}
JSON

aws lambda update-function-configuration \
  --function-name "$LAMBDA_NAME" \
  --region "$REGION" \
  --environment "file://$ENV_JSON" \
  --output text --query 'LastModified'

# ── step 3 — deploy frontend ──────────────────────────────────────────────────

info "Step 3 — Building frontend..."

echo "VITE_API_URL=${API_URL}" > "$SCRIPT_DIR/frontend/my-app/.env.production"

(
  cd "$SCRIPT_DIR/frontend/my-app"
  npm install --silent
  npm run build
  echo "  Uploading to s3://${S3_FRONTEND}..."
  aws s3 sync dist/ "s3://${S3_FRONTEND}" --delete
)

info "Frontend deployed at: ${CLOUDFRONT_URL}"

# ── step 4 — create admin account ─────────────────────────────────────────────

info "Step 4 — Create admin account"
echo ""
read -rp  "  Admin email:    " ADMIN_EMAIL
read -rsp "  Admin password: " ADMIN_PASSWORD
echo ""

echo "  Registering user..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "201" ]]; then
  echo "  Registered ${ADMIN_EMAIL} (HTTP ${HTTP_STATUS})"
else
  echo "  WARNING: Registration returned HTTP ${HTTP_STATUS} — user may already exist, continuing..."
fi

# Temporarily open RDS port 5432 to this machine's public IP so psql can connect.
# NOTE: This requires the RDS instance to be publicly_accessible = true in rds.tf.
#       If it is set to false, set it to true, run terraform apply, then re-run this script.
MY_IP=$(curl -s https://checkip.amazonaws.com)
echo "  Opening RDS port 5432 to ${MY_IP}/32..."
aws ec2 authorize-security-group-ingress \
  --group-id "$RDS_SG_ID" \
  --protocol tcp --port 5432 \
  --cidr "${MY_IP}/32" \
  --region "$REGION"

# Always revoke the SG rule on exit, even if psql fails.
cleanup_sg() {
  echo "  Closing RDS port 5432..."
  aws ec2 revoke-security-group-ingress \
    --group-id "$RDS_SG_ID" \
    --protocol tcp --port 5432 \
    --cidr "${MY_IP}/32" \
    --region "$REGION" 2>/dev/null || true
}
trap 'rm -f "$ENV_JSON"; cleanup_sg' EXIT

echo "  Setting is_admin = true for ${ADMIN_EMAIL}..."
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" -p "$DB_PORT" \
  -U "$DB_USERNAME" -d sample \
  -c "UPDATE users SET is_admin = true WHERE email = '${ADMIN_EMAIL}';"

info "All done! App is live at: ${CLOUDFRONT_URL}"
