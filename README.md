# Sequencing App

A full-stack web application for managing genomic sequencing sample data, built with FastAPI (Python) and React. Supports local development, Docker, and serverless AWS deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Database | SQLite (local) / PostgreSQL RDS (AWS) |
| Auth | JWT + Sessions |
| Containerisation | Docker |
| Cloud | AWS (Lambda, RDS, S3, CloudFront, API Gateway) |
| Infrastructure | Terraform |

---

## Architecture

### Local / Docker
```
Browser → React (localhost:5173) → FastAPI (localhost:8000) → SQLite
```

### AWS Serverless (Production)
```
Browser → CloudFront (CDN) → S3 (React frontend)
                                    ↓
                          API Gateway → Lambda (FastAPI) → RDS PostgreSQL
```

---

## AWS Services Explained

| Service | Purpose | Cost |
|---|---|---|
| **S3** | Hosts the React frontend files | ~$0.02/month |
| **CloudFront** | CDN — serves frontend globally, fast | Free tier |
| **API Gateway** | Routes HTTP requests to Lambda | 1M requests free/month |
| **Lambda** | Runs FastAPI backend, scales to zero when idle | 1M requests free/month |
| **RDS PostgreSQL** | Persistent database (db.t3.micro) | ~$15/month |
| **Terraform** | Creates all AWS infrastructure with one command | Free |

**Why serverless?** Lambda only runs when someone uses the app. When idle it costs nothing. Perfect for a lab tool that isn't used 24/7.

---

## Project Structure

```
app/
├── README.md
├── docker-compose.yml
├── deploy-backend.sh         ← redeploy backend to AWS
├── deploy-frontend.sh        ← redeploy frontend to AWS
├── terraform/                ← AWS infrastructure as code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── rds.tf
│   ├── s3.tf
│   ├── cloudfront.tf
│   ├── lambda.tf
│   ├── api_gateway.tf
│   └── secrets.tf
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── data/
│   │   └── samples.xlsx          ← put your data file here
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── core/
│       ├── routers/
│       ├── schemas/
│       └── scripts/
└── frontend/
    └── my-app/
        ├── Dockerfile
        ├── nginx.conf
        └── src/
```

---

## Prerequisites

| Tool | Purpose | Required for |
|---|---|---|
| [Python 3.11+](https://www.python.org/downloads/) | Backend runtime | Local + Docker |
| [Node.js 22+](https://nodejs.org/) | Frontend runtime | Local + Docker |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Containerisation | Docker + AWS deploy |
| [AWS CLI](https://aws.amazon.com/cli/) | Deploy to AWS | AWS only |
| [Terraform](https://www.terraform.io/) | Create AWS infrastructure | AWS only |
| Git | Version control | All |

---

## Option A — Run Locally (Recommended for Development)

### 1. Clone the repo

```bash
git clone git@github.com:bairuvan/sequencing-app.git
cd sequencing-app
```

### 2. Add your data file

Place your `samples.xlsx` file in:
```
backend/data/samples.xlsx
```

### 3. Set up the backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
```

### 4. Start the backend

```bash
uvicorn app.main:app --reload
```

Backend starts at **http://localhost:8000**. You will see `Samples loaded successfully` on first run.

### 5. Set up and start the frontend

Open a new terminal:

```bash
cd frontend/my-app
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

### 6. Create the admin account

In the backend terminal (venv active):

```bash
python3 -c "
from app.database import SessionLocal
from app.models import User
from app.core.security import hash_password
db = SessionLocal()
admin = User(email='admin@admin.com', hashed_password=hash_password('admin'), is_admin=True, is_active=True)
db.add(admin)
db.commit()
print('Admin created')
db.close()
"
```

> ⚠️ Change these credentials before going to production.

---

## Option B — Run with Docker

### 1. Clone and add data file (same as Option A steps 1-2)

### 2. Build and run

```bash
docker compose up --build
```

First build takes 3-10 minutes. Subsequent builds are faster.

- Frontend → **http://localhost**
- Backend → **http://localhost:8000**

### 3. Create the admin account

```bash
docker exec -it sequencing-backend python3 -c "
import os
os.environ['DATABASE_URL'] = 'sqlite:////app/db/test.db'
from app.database import SessionLocal
from app.models import User
from app.core.security import hash_password
db = SessionLocal()
admin = User(email='admin@admin.com', hashed_password=hash_password('admin'), is_admin=True, is_active=True)
db.add(admin)
db.commit()
print('Admin created')
db.close()
"
```

### 4. Stop Docker

```bash
docker compose down
```

---

## Option C — Deploy to AWS (Serverless)

This deploys the app to AWS so it is accessible publicly 24/7 without managing servers.

### Prerequisites

1. AWS Account with an IAM user that has AdministratorAccess
2. AWS CLI configured:
```bash
aws configure
# Enter Access Key ID, Secret Access Key
# Region: ap-southeast-2
# Output: json
```
3. Terraform installed:
```bash
brew install hashicorp/tap/terraform
```
4. Docker Desktop running (needed to build Lambda packages)

---

### Step 1 — Create Terraform variables

Create `terraform/terraform.tfvars` (this file is gitignored):
```hcl
db_password    = "YourStrongPassword123!"
jwt_secret     = "your-long-random-jwt-secret-string"
session_secret = "your-long-random-session-secret-string"
```

---

### Step 2 — Create AWS infrastructure

```bash
cd terraform
terraform init
terraform apply -var-file="terraform.tfvars"
```

Type `yes` when prompted. Takes 10-15 minutes. Save the output values:

```
api_gateway_url    = "https://xxxx.execute-api.ap-southeast-2.amazonaws.com/prod"
cloudfront_url     = "https://xxxx.cloudfront.net"
s3_frontend_bucket = "bairu-lab-frontend-xxxx"
lambda_code_bucket = "bairu-lab-lambda-xxxx"
db_endpoint        = "bairu-lab-db.xxxx.ap-southeast-2.rds.amazonaws.com:5432"
```

---

### Step 3 — Build and deploy the backend

> **Important:** Must use Docker to build for Linux x86_64 (Lambda's architecture). Building on Mac ARM will produce incompatible binaries.

```bash
cd /path/to/app
./deploy-backend.sh
```

---

### Step 4 — Set Lambda environment variables

```bash
cat > /tmp/lambda-env.json << 'EOF'
{
  "Variables": {
    "DATABASE_URL": "postgresql://bairuadmin:YOUR_PASSWORD@YOUR_DB_ENDPOINT/bairulab",
    "SECRET_KEY": "your-jwt-secret",
    "SESSION_SECRET": "your-session-secret",
    "FRONTEND_URL": "https://YOUR_CLOUDFRONT_URL"
  }
}
EOF

aws lambda update-function-configuration \
  --function-name bairu-lab-backend \
  --environment file:///tmp/lambda-env.json \
  --region ap-southeast-2
```

---

### Step 5 — Deploy the frontend

```bash
cd frontend/my-app
echo "VITE_API_URL=https://YOUR_API_GATEWAY_URL" > .env.production
npm run build
aws s3 sync dist/ s3://YOUR_S3_FRONTEND_BUCKET --delete
```

---

### Step 6 — Create the admin account

```bash
curl https://YOUR_API_GATEWAY_URL/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"your-password"}'
```

Then connect to RDS to set admin flag:
```bash
MY_IP=$(curl -s ifconfig.me)

# Allow your IP temporarily
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_RDS_SECURITY_GROUP_ID \
  --protocol tcp --port 5432 \
  --cidr $MY_IP/32 --region ap-southeast-2

# Connect and update
psql "postgresql://bairuadmin:YOUR_PASSWORD@YOUR_DB_ENDPOINT/bairulab" \
  -c "UPDATE users SET is_admin = true WHERE email = 'admin@admin.com';"

# Revoke access when done
aws ec2 revoke-security-group-ingress \
  --group-id YOUR_RDS_SECURITY_GROUP_ID \
  --protocol tcp --port 5432 \
  --cidr $MY_IP/32 --region ap-southeast-2
```

---

## Redeploying After Code Changes

**Backend changes:**
```bash
./deploy-backend.sh
```

**Frontend changes:**
```bash
./deploy-frontend.sh
```

---

## Pages

| URL | Description | Access |
|---|---|---|
| `/` | Welcome page | Public |
| `/login` | User login / register | Public |
| `/admin` | Admin login | Public |
| `/dashboard` | User dashboard with page links and downloads | User |
| `/page1` | Sample Explorer — filter and SQL query | User |
| `/page2` | Edit by File Prefix | User |
| `/page3` | Compare Original vs Updated | User |
| `/admin/dashboard` | Admin dashboard | Admin |
| `/admin/users` | Online users and user management | Admin |
| `/admin/data` | Sample deletion and SQL queries | Admin |

---

## Default Credentials

| Account | Email | Password |
|---|---|---|
| Admin | admin@admin.com | admin |

> ⚠️ Change these immediately in production.

---

## Database

### Local / Docker
Uses **SQLite** stored at `backend/test.db`. Created automatically on first run.

### AWS
Uses **PostgreSQL on RDS** (db.t3.micro, free tier eligible for 12 months).

### Tables

| Table | Description |
|---|---|
| `users` | User accounts |
| `samples` | Sequencing sample data loaded from Excel |
| `session_logs` | Login/logout history for all users |

### Reset the database (local)

```bash
rm backend/test.db
# Restart the backend
```

---

## Environment Variables

| Variable | Description | Required for |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | AWS |
| `SECRET_KEY` | JWT signing key | All |
| `SESSION_SECRET` | Session cookie key | All |
| `FRONTEND_URL` | CloudFront URL for CORS | AWS |
| `VITE_API_URL` | API Gateway URL for frontend | AWS |

---

## Tear Down AWS Infrastructure

To delete all AWS resources and stop costs:

```bash
cd terraform
terraform destroy -var-file="terraform.tfvars"
```

> ⚠️ This permanently deletes the database and all data. Back up first.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ModuleNotFoundError` | Make sure venv is activated and ran `pip install -r requirements.txt` |
| `Address already in use` | Run `lsof -i :8000` and kill the process |
| CORS error in browser | Check CORS origins include your frontend URL in `main.py` |
| `Samples loaded successfully` not showing | Check `samples.xlsx` is in `backend/data/` |
| Port 80 in use with Docker | Stop other web servers or change port in `docker-compose.yml` |
| Database column errors | Delete `test.db` and restart the backend |
| Lambda `pydantic_core` error | Rebuild package using Docker with `--platform linux/amd64` |
| Lambda `GLIBC` error | Use `public.ecr.aws/lambda/python:3.11` image to build (not plain python image) |
| `Internal server error` on AWS | Check logs: `aws logs tail /aws/lambda/bairu-lab-backend --region ap-southeast-2` |
| Frontend not updating on CloudFront | Create an invalidation in the AWS CloudFront console |
