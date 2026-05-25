# Sample Dashbord App — AWS Deployment Guide

A full-stack genomic sample management app: **React** frontend + **FastAPI** backend, deployed serverlessly on AWS.

---

## Architecture

```
  Browser
    │
    ├── (static files) ──► CloudFront ──► S3 (React build)
    │
    └── (API calls) ──────► API Gateway ──► Lambda (FastAPI)
                                                    │
                                              RDS PostgreSQL
                                           (private VPC subnet)
```

---

## Prerequisites

| Tool | How to install |
|---|---|
| AWS CLI | `brew install awscli` then run `aws configure` |
| Terraform | `brew install hashicorp/tap/terraform` |
| Docker Desktop | [docker.com](https://www.docker.com/products/docker-desktop/) — must be **running** when deploying the backend |
| Node.js 18+ | `brew install node` |

---

## Step 1 — Create AWS Infrastructure

```bash
cd terraform

# Create secrets file (gitignored)
cat > terraform.tfvars <<EOF
db_password    = "YourStrongPassword123!"
jwt_secret     = "your-random-jwt-secret"
session_secret = "your-random-session-secret"
EOF

terraform init
terraform apply -var-file="terraform.tfvars"
```

Takes ~10–15 minutes. Copy the output values — you'll need them in the next steps:

```
api_gateway_url    = "https://xxxx.execute-api.ap-southeast-2.amazonaws.com/prod"
cloudfront_url     = "https://xxxx.cloudfront.net"
s3_frontend_bucket = "bairu-lab-frontend-xxxx"
lambda_code_bucket = "bairu-lab-lambda-xxxx"
db_endpoint        = "bairu-lab-db.xxxx.ap-southeast-2.rds.amazonaws.com:5432"
```

---

## Step 2 — Deploy the Backend

> Docker must be running. The build uses a Linux container to match Lambda's runtime.

From the repo root:

```bash
./deploy-backend.sh
```

Then set the Lambda environment variables (replace placeholders with your Terraform outputs):

```bash
aws lambda update-function-configuration \
  --function-name bairu-lab-backend \
  --region ap-southeast-2 \
  --environment "Variables={
    DATABASE_URL=postgresql://bairuadmin:YourStrongPassword123!@<db_endpoint>/sample,
    SECRET_KEY=your-random-jwt-secret,
    SESSION_SECRET=your-random-session-secret,
    FRONTEND_URL=https://<cloudfront_url>
  }"
```

---

## Step 3 — Deploy the Frontend

```bash
cd frontend/my-app

# Point the app at the API Gateway
echo "VITE_API_URL=https://<api_gateway_url>" > .env.production

npm install
npm run build

# Upload to S3
aws s3 sync dist/ s3://<s3_frontend_bucket> --delete
```

The app is now live at your CloudFront URL.

---

## Step 4 — Create the Admin Account

Register a user via the API:

```bash
curl -X POST https://<api_gateway_url>/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}'
```

Grant admin access — temporarily open RDS to your IP, update the flag, then close it:

```bash
MY_IP=$(curl -s ifconfig.me)

# Open
aws ec2 authorize-security-group-ingress \
  --group-id <rds_sg_id> --protocol tcp --port 5432 \
  --cidr $MY_IP/32 --region ap-southeast-2

# Set admin flag
psql "postgresql://bairuadmin:YourStrongPassword123!@<db_endpoint>/sample" \
  -c "UPDATE users SET is_admin = true WHERE email = 'admin@example.com';"

# Close
aws ec2 revoke-security-group-ingress \
  --group-id <rds_sg_id> --protocol tcp --port 5432 \
  --cidr $MY_IP/32 --region ap-southeast-2
```

---

## Redeploying After Changes

```bash
# Backend code changed
./deploy-backend.sh

# Frontend code changed
./deploy-frontend.sh

# Infrastructure changed
cd terraform && terraform apply -var-file="terraform.tfvars"
```

If the frontend looks stale after a redeploy, invalidate the CloudFront cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id <cf_distribution_id> --paths "/*"
```

---

## Tear Down

To delete everything and stop all AWS charges:

```bash
cd terraform
terraform destroy -var-file="terraform.tfvars"
```

> **Warning:** This permanently deletes the database and all data. Back up first.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Lambda `GLIBC` / `pydantic_core` error | Ensure Docker is running; `deploy-backend.sh` must build with `--platform linux/amd64` |
| `Internal server error` on API | `aws logs tail /aws/lambda/bairu-lab-backend --region ap-southeast-2` |
| CORS error in browser | Check `FRONTEND_URL` in Lambda env exactly matches your CloudFront URL |
| Frontend not updating | Invalidate CloudFront cache (see Redeploying section) |
