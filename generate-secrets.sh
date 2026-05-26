#!/usr/bin/env bash
set -euo pipefail

TFVARS="terraform/terraform.tfvars"

if [[ -f "$TFVARS" ]]; then
  echo "ERROR: $TFVARS already exists. Delete it first if you want to regenerate secrets."
  exit 1
fi

# db_password: base64 with +/= replaced so the value is URL-safe (no encoding
# needed when it appears in postgresql:// connection strings).
DB_PASSWORD=$(openssl rand -base64 24 | tr '+/=' 'XYZ' | head -c 32)

# jwt_secret / session_secret: 256-bit hex strings (64 hex chars).
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

cat > "$TFVARS" <<EOF
db_password    = "$DB_PASSWORD"
jwt_secret     = "$JWT_SECRET"
session_secret = "$SESSION_SECRET"
EOF

echo "Wrote $TFVARS"
echo ""
echo "Save these values — you will need them for Step 2 (Lambda env vars):"
echo ""
echo "  DB_PASSWORD    : $DB_PASSWORD"
echo "  JWT_SECRET     : $JWT_SECRET"
echo "  SESSION_SECRET : $SESSION_SECRET"
echo ""
echo "Step 2 aws lambda update-function-configuration snippet:"
echo ""
echo "  DATABASE_URL=postgresql://sampleAdmin:${DB_PASSWORD}@<db_endpoint>/sample"
echo "  SECRET_KEY=${JWT_SECRET}"
echo "  SESSION_SECRET=${SESSION_SECRET}"
