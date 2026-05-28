# Sample Dashboard — AWS Deployment Guide

A full-stack genomic sample management app: **React** frontend + **FastAPI** backend, deployed serverlessly on AWS.

```
Browser
  ├── (static files) ──► CloudFront ──► S3 (React build)
  └── (API calls)    ──► API Gateway ──► Lambda (FastAPI)
                                               │
                                         RDS PostgreSQL
                                      (private VPC subnet)
```

---

## Prerequisites

| Tool | Install |
|---|---|
| AWS CLI | `brew install awscli` then `aws configure` |
| Terraform | `brew install hashicorp/tap/terraform` |
| Docker Desktop | [docker.com](https://www.docker.com/products/docker-desktop/) — must be **running** during deployment |
| Node.js 18+ | `brew install node` |
| psql | `brew install libpq && brew link --force libpq` |

---

## Step 1 — Create secrets file

Create `terraform/terraform.tfvars` and set your own values:

```bash
cat > terraform/terraform.tfvars <<EOF
db_password    = "YourStrongPassword"
jwt_secret     = "YourJwtSecret"
session_secret = "YourSessionSecret"
EOF
```

The file is gitignored. **Store these values in a password manager** — you will need them if you redeploy.

> **Development / debugging only:** run `./generate-secrets.sh` to have the values generated for you automatically.

---

## Step 2 — Create AWS infrastructure

```bash
cd terraform
terraform init
terraform apply -var-file="terraform.tfvars"
cd ..
```

Takes ~10–15 minutes. Terraform provisions the VPC, RDS, Lambda, API Gateway, S3, and CloudFront.

> **Before continuing:** open `terraform/rds.tf` and set `publicly_accessible = true`, then run
> `terraform apply -var-file="terraform.tfvars"` again. This is required for the admin setup in
> the next step. You can set it back to `false` afterwards.

---

## Step 3 — Deploy backend, frontend, and create admin account

move your database file to /backend/data/samples.csv before run deploy schripts.
```bash
cp <db file> /backend/data/samples.csv
./deploy.sh
```

This script does everything in one run:

| What | How |
|---|---|
| Build Lambda package | Docker (linux/amd64) |
| Upload & update Lambda code | `aws lambda update-function-code` |
| Set Lambda env vars | `aws lambda update-function-configuration` (reads secrets from `terraform.tfvars`, URLs from `terraform output`) |
| Build frontend | `npm run build` inside `frontend/my-app` |
| Upload frontend | `aws s3 sync` to the S3 bucket |
| Register admin user | `POST /auth/register` |
| Grant admin flag | Opens RDS port 5432 to your IP → `psql UPDATE` → closes port |

The script will prompt for an admin email and password at the admin creation step.

To redeploy after code changes, re-run `./deploy.sh`. For infrastructure changes only, run `terraform apply -var-file="terraform.tfvars"` inside the `terraform/` directory.

---

## Tear down

```bash
cd terraform
terraform destroy -var-file="terraform.tfvars"
```

> **Warning:** This permanently deletes the database and all data. Back up first.

After destroy, your local `terraform/terraform.tfvars` and `terraform/terraform.tfstate` still contain
the secrets. Delete them when you no longer need them.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Lambda `GLIBC` / `pydantic_core` error | Ensure Docker is running; the build requires `--platform linux/amd64` |
| `Internal server error` on API | `aws logs tail /aws/lambda/dashbord-backend --region ap-southeast-2` |
| CORS error in browser | Check `FRONTEND_URL` in Lambda env matches the CloudFront URL exactly |
| Frontend not updating | `aws cloudfront create-invalidation --distribution-id $(terraform -chdir=./terraform output -raw cloudfront_distribution_id) --paths "/*"` |
| `psql: could not connect` in deploy.sh | Set `publicly_accessible = true` in `terraform/rds.tf` and re-apply |
