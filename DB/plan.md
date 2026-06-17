
## new branch

```
  my-bio-db-project/
  ├── infrastructure/          # Terraform or AWS CDK
  │   ├── dev.tfvars
  │   ├── prod.tfvars
  │   └── main.tf
  ├── scripts/
  │   ├── migrate/
  │   ├── backfill/
  │   └── seed/
  ├── src/                     # Application code
  ├── tests/
  ├── docs/
  └── .github/workflows/       # CI/CD
```

- For local development → Use Local DynamoDB (Docker) + simple scripts
- For real testing / staging → Use dev.tfvars to deploy a real dev table on AWS
- For production → Use prod.tfvars
  
## local set up for development
Step-by-step Setup

- Install Local DynamoDBBash# Using Docker (easiest)
  - `docker pull amazon/dynamodb-local`
  - `docker run -p 8000:8000 amazon/dynamodb-local`
- Create Dev Table: Use AWS CLI pointed to local endpoint:
```
aws dynamodb create-table \
     --table-name citrus \
     --attribute-definitions AttributeName=pKey,AttributeType=S AttributeName=sKey,AttributeType=S \
     --key-schema AttributeName=pKey,KeyType=HASH AttributeName=sKey,KeyType=RANGE \
     --billing-mode PAY_PER_REQUEST \
     --endpoint-url http://localhost:8000
```
- Run Your Backend
`Configure your app to connect to http://localhost:8000`
