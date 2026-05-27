## cost of db.t3.micro
- db.t3.micro is already the smallest RDS instance class, so there's nothing cheaper in traditional RDS.
- Cost (ap-southeast-2, on-demand): ~$0.018/hr → roughly $13/month, plus ~$2.50/month for 20 GB storage. 
- Go to AWS Console → Billing and Cost Management → Free Tier, it shows no free tier for db.t3.micro
- Option A — Scheduled start/stop with EventBridge (recommended)
   - Simple, zero complexity, costs almost nothing (~$0.20/month for the Lambda invocations). You only pay for RDS during the hours it runs. Best for a demo app with predictable usage hours.
- Option B — Migrate to Aurora Serverless v2 with scale-to-zero
  - The tradeoff is cost: at active load it's more expensive than db.t3.micro.

## set RD start on 8am but stop on 3pm on weekday
scheduler.tf does it. it use eventBridge scheduler the instance

## Manually start/stop RDS:

  ### Start
  aws rds start-db-instance --db-instance-identifier dashbord-db --region ap-southeast-2

  #### Stop    
  aws rds stop-db-instance --db-instance-identifier dashbord-db --region ap-southeast-2

  #### Check status
  - aws lambda list-functions --region ap-southeast-2 --query 'Functions[].FunctionName' --output text
  - aws logs tail /aws/lambda/dashbord-backend --region ap-southeast-2 --since 10m  --follow
  - aws rds describe-db-instances --db-instance-identifier dashbord-db --region ap-southeast-2 --query 'DBInstances[0].DBInstanceStatus' --output text
     - Wait ~2 minutes after starting before testing the app.
     - The only visible effect is that API calls that touch the database will fail (500 error) while RDS is stopped. Purely static frontend pages still load fine since they are served from S3/CloudFront independently.
   
## trobule shooting
- The IP 10.0.2.7 is a private VPC address — RDS is not publicly accessible so your local machine can never reach it, regardless of the security group rule.
   - You need to set it to true first: Open terraform/rds.tf and change: `publicly_accessible = true`
   - cd terraform && terraform apply -var-file="terraform.tfvars" && cd ..
   — Re-run deploy.sh — the psql step will succeed this time.
   — set it back: publicly_accessible = false;
   - cd terraform && terraform apply -var-file="terraform.tfvars" && cd ..
- replace dataset
  - python3 convert_to_utf8.py eal_data.csv samples.csv
  - terraform destroy -target=aws_db_instance.main -var-file="terraform.tfvars"
  - terraform apply -var-file="terraform.tfvars" && ./deploy.sh
  
## results
- deploy.sh will set up admin account for app, eg. 
   - Admin email:    admin@admin.com   # email must follow email format 
   - Admin password: admin
- Frontend deployed at: https://dvq7mqqv2wef5.cloudfront.net


## Admin lifecycle:
  - First admin — deploy.sh registers via /auth/register then promotes via psql (one-time bootstrap)
  - More admins — first admin calls POST /admin/users with {"is_admin": true} using their JWT
  - Regular users — first admin calls POST /admin/users with {"is_admin": false}
# Custom Domain Setup — Porkbun + AWS CloudFront

Connect your Porkbun domain to the CloudFront distribution at
`dvq7mqqv2wef5.cloudfront.net`.

---

## Overview

| Step | Where | What |
|---|---|---|
| 1 | AWS ACM (us-east-1) | Request SSL certificate for your domain |
| 2 | Porkbun DNS | Add CNAME to validate certificate ownership |
| 3 | Terraform | Attach certificate and domain to CloudFront |
| 4 | Porkbun DNS | Point your domain at CloudFront |

---

## Step 1 — Request an SSL Certificate (AWS ACM)

> CloudFront requires certificates to be in **us-east-1** regardless of where
> your app is deployed.

```bash
aws acm request-certificate \
  --domain-name "yourdomain.com" \
  --subject-alternative-names "www.yourdomain.com" \
  --validation-method DNS \
  --region us-east-1
```

This returns a certificate ARN — save it:

```
arn:aws:acm:us-east-1:123456789012:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Get the DNS validation records AWS needs you to add:

```bash
aws acm describe-certificate \
  --certificate-arn <your-certificate-arn> \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[].ResourceRecord'
```

Output will look like:

```json
[
  {
    "Name": "_abc123.yourdomain.com",
    "Type": "CNAME",
    "Value": "_xyz789.acm-validations.aws."
  }
]
```

---

## Step 2 — Validate Certificate Ownership (Porkbun DNS)

1. Log in to [Porkbun](https://porkbun.com) → **Domain Management** → your domain → **DNS**
2. Add a new record:

| Field | Value |
|---|---|
| Type | `CNAME` |
| Host | `_abc123` (the part before `.yourdomain.com` from Step 1 output) |
| Answer | `_xyz789.acm-validations.aws.` (the Value from Step 1 output) |
| TTL | `600` |

3. Wait for the certificate to validate (usually 5–15 minutes):

```bash
aws acm wait certificate-validated \
  --certificate-arn <your-certificate-arn> \
  --region us-east-1

echo "Certificate validated"
```

---

## Step 3 — Attach Certificate and Domain to CloudFront (Terraform)

Add the following to `terraform/terraform.tfvars`:

```hcl
domain_name     = "yourdomain.com"
certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Add the variables to `terraform/variables.tf`:

```hcl
variable "domain_name" {
  description = "Custom domain for the CloudFront distribution (leave empty to use the default CloudFront URL)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN (must be in us-east-1). Required when domain_name is set."
  type        = string
  default     = ""
}
```

Update the CloudFront distribution in `terraform/cloudfront.tf` — replace the
`viewer_certificate` block and add `aliases`:

```hcl
# Add this block inside aws_cloudfront_distribution "frontend"
aliases = var.domain_name != "" ? [var.domain_name, "www.${var.domain_name}"] : []

viewer_certificate {
  acm_certificate_arn      = var.certificate_arn != "" ? var.certificate_arn : null
  cloudfront_default_certificate = var.certificate_arn == ""
  ssl_support_method       = var.certificate_arn != "" ? "sni-only" : null
  minimum_protocol_version = var.certificate_arn != "" ? "TLSv1.2_2021" : null
}
```

Apply the changes:

```bash
cd terraform
terraform apply -var-file="terraform.tfvars"
```

---

## Step 4 — Point Your Domain at CloudFront (Porkbun DNS)

Go back to Porkbun DNS and add the following records:

### Option A — Subdomain only (e.g. `app.yourdomain.com`)

| Type | Host | Answer | TTL |
|---|---|---|---|
| `CNAME` | `app` | `dvq7mqqv2wef5.cloudfront.net.` | `600` |

### Option B — Apex + www (e.g. `yourdomain.com` and `www.yourdomain.com`)

Porkbun supports `ALIAS` records for apex domains:

| Type | Host | Answer | TTL |
|---|---|---|---|
| `ALIAS` | *(leave blank)* | `dvq7mqqv2wef5.cloudfront.net.` | `600` |
| `CNAME` | `www` | `dvq7mqqv2wef5.cloudfront.net.` | `600` |

> **Note:** Standard DNS does not support `CNAME` on an apex domain (`yourdomain.com`
> with no subdomain). Porkbun's `ALIAS` record handles this transparently.

---

## Verification

After DNS propagates (5–30 minutes):

```bash
# Check DNS has propagated
dig yourdomain.com +short

# Check HTTPS works
curl -I https://yourdomain.com
```

The response should show `HTTP/2 200` and a certificate issued by Amazon.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Certificate stuck in `PENDING_VALIDATION` | Check the CNAME record in Porkbun matches exactly — trailing dot in the value is normal |
| CloudFront returns 403 after domain change | Invalidate cache: `aws cloudfront create-invalidation --distribution-id $(terraform -chdir=./terraform output -raw cloudfront_distribution_id) --paths "/*"` |
| Browser shows certificate warning | Ensure the certificate ARN in `terraform.tfvars` is correct and in `us-east-1` |
| `yourdomain.com` works but `www` does not | Confirm both are in the `aliases` list and both have DNS records in Porkbun |
