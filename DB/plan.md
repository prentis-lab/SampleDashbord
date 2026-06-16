
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

- Use Terraform to manage production infrastructure
- Use Local DynamoDB + simple scripts for development
  
## local set up for development
Step-by-step Setup

- Install Local DynamoDBBash# Using Docker (easiest)
`docker run -p 8000:8000 amazon/dynamodb-local`
- Create Dev Table: Use AWS CLI pointed to local endpoint:
```
aws dynamodb create-table \
  --table-name BioData \
  --attribute-definitions AttributeName=PartitionKey,AttributeType=S \
  --key-schema AttributeName=PartitionKey,KeyType=HASH AttributeName=SortKey,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
```
-Run Your Backend
`Configure your app to connect to http://localhost:8000`
