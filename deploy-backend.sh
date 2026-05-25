#!/bin/bash
echo "Building Lambda package for Linux x86_64..."

rm -rf lambda_build lambda_package.zip
mkdir lambda_build

docker run --rm \
  --platform linux/amd64 \
  -v $(pwd):/app \
  -w /app \
  --entrypoint pip \
  public.ecr.aws/lambda/python:3.11 \
  install -r backend/requirements.txt \
  -t lambda_build/ \
  --upgrade \
  --quiet

cp -r backend/app lambda_build/
cd lambda_build && zip -r ../lambda_package.zip . && cd ..

echo "Uploading to S3..."
aws s3 cp lambda_package.zip s3://bairu-lab-lambda-271918ab/lambda_package.zip

echo "Updating Lambda function..."
aws lambda update-function-code \
  --function-name bairu-lab-backend \
  --s3-bucket bairu-lab-lambda-271918ab \
  --s3-key lambda_package.zip \
  --region ap-southeast-2

echo "Done! Backend deployed."