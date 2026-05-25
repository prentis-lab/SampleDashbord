#!/bin/bash
echo "Building frontend..."
cd frontend/my-app
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://sample-frontend-271918ab --delete

echo "Done! Frontend deployed at https://d2kn251rzy9pud.cloudfront.net"