# Terraform Infrastructure

AWS infrastructure for the Sample Dashbord application. All resources are provisioned in `ap-southeast-2` (Sydney).

---

## Architecture Diagram

```
  ┌─────────────────────────────────────────────────────────────────────┐
  │                            Internet                                  │
  └───────────────────┬─────────────────────────┬────────────────────────┘
                      │                         │
           HTTPS (static files)       HTTPS (API calls)
                      │                         │
         ┌────────────▼──────────┐   ┌──────────▼─────────────┐
         │  CloudFront           │   │  API Gateway           │
         │  dashbord-cdn         │   │  dashbord-api          │
         │  PriceClass_100       │   │  /prod/{proxy+}        │
         └────────────┬──────────┘   └──────────┬─────────────┘
                      │ OAC (SigV4)              │ Lambda Proxy
                      │                         │
         ┌────────────▼──────────┐   ┌──────────▼─────────────┐
         │  S3 (Frontend)        │   │  Lambda                │
         │  dashbord-frontend-*  │   │  dashbord-backend      │
         │  Private bucket       │   │  Python 3.11 / Mangum  │
         │  index.html fallback  │   │  512 MB · 30 s timeout │
         └───────────────────────┘   └──────────┬─────────────┘
                                                │
  ┌─────────────────────────────────────────────┼──────────────────────┐
  │  VPC  dashbord-vpc  (10.0.0.0/16)           │                      │
  │                                             │                      │
  │  ┌──────────────────────┐      ┌────────────▼───────────────────┐  │
  │  │  Public Subnet       │      │  Private Subnets               │  │
  │  │  10.0.3.0/24 (AZ-a) │      │  10.0.1.0/24 (AZ-a)           │  │
  │  │  Internet Gateway    │      │  10.0.2.0/24 (AZ-b)           │  │
  │  └──────────────────────┘      │                                │  │
  │                                │  ┌──────────────────────────┐  │  │
  │                                │  │  RDS PostgreSQL 15        │  │  │
  │                                │  │  dashbord-db             │  │  │
  │                                │  │  db.t3.micro · 20 GB     │  │  │
  │                                │  │  Port 5432               │  │  │
  │                                │  │  Not publicly accessible  │  │  │
  │                                │  └──────────────────────────┘  │  │
  │                                └────────────────────────────────┘  │
  └────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │  Supporting Services                                                 │
  │                                                                      │
  │  ┌───────────────────────────┐   ┌─────────────────────────────┐   │
  │  │  S3 (Lambda code)         │   │  Secrets Manager            │   │
  │  │  dashbord-lambda-*        │   │  dashbord/db-password-v2    │   │
  │  │  Stores lambda_package.zip│   │                             │   │
  │  └───────────────────────────┘   └─────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────────────┘
```

---

## Deployed AWS Resources

| Resource | Name | Type | Key Details |
|---|---|---|---|
| VPC | `dashbord-vpc` | `aws_vpc` | CIDR `10.0.0.0/16`, DNS enabled |
| Public Subnet | `dashbord-public-a` | `aws_subnet` | `10.0.3.0/24`, AZ-a, public IPs on |
| Private Subnet A | `dashbord-private-a` | `aws_subnet` | `10.0.1.0/24`, AZ-a |
| Private Subnet B | `dashbord-private-b` | `aws_subnet` | `10.0.2.0/24`, AZ-b |
| Internet Gateway | `dashbord-igw` | `aws_internet_gateway` | Attached to VPC |
| Route Table | `dashbord-public-rt` | `aws_route_table` | Default route `0.0.0.0/0` → IGW |
| Lambda Security Group | `dashbord-lambda-sg` | `aws_security_group` | Unrestricted egress |
| RDS Security Group | `dashbord-rds-sg` | `aws_security_group` | Ingress port 5432 from Lambda SG only |
| Frontend S3 Bucket | `dashbord-frontend-<suffix>` | `aws_s3_bucket` | Private; served via CloudFront OAC |
| Lambda Code S3 Bucket | `dashbord-lambda-<suffix>` | `aws_s3_bucket` | Private; stores `lambda_package.zip` |
| CloudFront OAC | `dashbord-oac` | `aws_cloudfront_origin_access_control` | SigV4 signing for S3 origin |
| CloudFront Distribution | `dashbord-cdn` | `aws_cloudfront_distribution` | HTTPS redirect, SPA 404→200, `PriceClass_100` |
| Lambda IAM Role | `dashbord-lambda-role` | `aws_iam_role` | Allows `AWSLambdaVPCAccessExecutionRole` + `AmazonS3FullAccess` |
| Lambda Function | `dashbord-backend` | `aws_lambda_function` | Python 3.11, 512 MB, 30 s, VPC private subnets |
| API Gateway REST API | `dashbord-api` | `aws_api_gateway_rest_api` | `/{proxy+}` ANY → Lambda proxy |
| API Gateway Deployment | — | `aws_api_gateway_deployment` | Stage: `prod` |
| RDS DB Subnet Group | `dashbord-db-subnet` | `aws_db_subnet_group` | Spans private-a and private-b |
| RDS PostgreSQL | `dashbord-db` | `aws_db_instance` | PostgreSQL 15, `db.t3.micro`, 20 GB gp2, not public |
| Secrets Manager Secret | `dashbord/db-password-v2` | `aws_secretsmanager_secret` | Stores DB password, no recovery window |

---

## Outputs

| Output | Description |
|---|---|
| `cloudfront_url` | Frontend URL — `https://<id>.cloudfront.net` |
| `api_gateway_url` | Backend API base URL — `https://<id>.execute-api.ap-southeast-2.amazonaws.com/prod` |
| `s3_frontend_bucket` | Frontend S3 bucket name |
| `lambda_code_bucket` | Lambda code S3 bucket name |
| `db_endpoint` | RDS endpoint — `dashbord-db.<id>.ap-southeast-2.rds.amazonaws.com:5432` |

---

## Variables

| Name | Default | Sensitive | Description |
|---|---|---|---|
| `aws_region` | `ap-southeast-2` | No | AWS region for all resources |
| `app_name` | `dashbord` | No | Prefix applied to all resource names and tags |
| `db_username` | `dashbordAmin` | No | RDS master username |
| `db_password` | — | Yes | RDS master password |
| `jwt_secret` | — | Yes | JWT signing secret passed to Lambda |
| `session_secret` | — | Yes | Session middleware secret passed to Lambda |

---

## Usage

```bash
cd terraform

# Create secrets file (gitignored)
cat > terraform.tfvars <<EOF
db_password    = "YourStrongPassword123!"
jwt_secret     = "your-random-jwt-secret"
session_secret = "your-random-session-secret"
EOF

terraform init
terraform plan  -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

To destroy all resources:

```bash
terraform destroy -var-file="terraform.tfvars"
```

> **Warning:** `skip_final_snapshot = true` is set on the RDS instance — destroying the stack permanently deletes the database and all data.
