#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

tf_out() { terraform -chdir="$SCRIPT_DIR/terraform" output -raw "$1"; }

S3_LAMBDA=$(tf_out lambda_code_bucket)
LAMBDA_NAME=$(tf_out lambda_function_name)
REGION=$(tf_out region)

echo "Building Lambda package for Linux x86_64..."

rm -rf "$SCRIPT_DIR/lambda_build" "$SCRIPT_DIR/lambda_package.zip"
mkdir "$SCRIPT_DIR/lambda_build"

docker run --rm \
  --platform linux/amd64 \
  -v "$SCRIPT_DIR:/app" \
  -w /app \
  --entrypoint pip \
  public.ecr.aws/lambda/python:3.11 \
  install -r backend/requirements.txt \
  -t lambda_build/ \
  --upgrade \
  --quiet

cp -r "$SCRIPT_DIR/backend/app" "$SCRIPT_DIR/lambda_build/"
(cd "$SCRIPT_DIR/lambda_build" && zip -r "$SCRIPT_DIR/lambda_package.zip" .)
rm -rf "$SCRIPT_DIR/lambda_build"

echo "Uploading to S3..."
aws s3 cp "$SCRIPT_DIR/lambda_package.zip" "s3://${S3_LAMBDA}/lambda_package.zip"

echo "Updating Lambda function code..."
aws lambda update-function-code \
  --function-name "$LAMBDA_NAME" \
  --s3-bucket "$S3_LAMBDA" \
  --s3-key lambda_package.zip \
  --region "$REGION" \
  --output text --query 'FunctionName'

echo "Done! Backend deployed."
