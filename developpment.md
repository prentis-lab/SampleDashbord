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
  aws rds describe-db-instances --db-instance-identifier dashbord-db --region ap-southeast-2 \
    --query 'DBInstances[0].DBInstanceStatus' --output text

  - Wait ~2 minutes after starting before testing the app.
  
  - The only visible effect is that API calls that touch the database will fail (500 error) while RDS is stopped. Purely static
  frontend pages still load fine since they are served from S3/CloudFront independently.
  
## results
- deploy.sh will set up admin account for app, eg. 
   - Admin email:    admin@example.com   # email must follow email format 
   - Admin password: admin
- Frontend deployed at: https://dvq7mqqv2wef5.cloudfront.net


## Admin lifecycle:
  - First admin — deploy.sh registers via /auth/register then promotes via psql (one-time bootstrap)
  - More admins — first admin calls POST /admin/users with {"is_admin": true} using their JWT
  - Regular users — first admin calls POST /admin/users with {"is_admin": false}
