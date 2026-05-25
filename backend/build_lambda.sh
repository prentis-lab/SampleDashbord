#!/bin/bash
echo "Building Lambda package..."

# Clean previous build
rm -rf backend/lambda_package
mkdir -p backend/lambda_package

# Install dependencies into package
pip install -r backend/requirements.txt -t backend/lambda_package/ --quiet

# Copy app code
cp -r backend/app backend/lambda_package/
cp backend/app/main.py backend/lambda_package/

echo "Lambda package built successfully"