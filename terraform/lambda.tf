# IAM role for Lambda
resource "aws_iam_role" "lambda" {
  name = "${var.app_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_s3" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

# S3 bucket for Lambda code
resource "aws_s3_bucket" "lambda_code" {
  bucket = "${var.app_name}-lambda-${random_id.suffix.hex}"
}

# Placeholder zip uploaded on first apply so the Lambda resource can be created.
# deploy.sh overwrites this with the real package; ignore_changes prevents
# Terraform from reverting it on subsequent applies.
data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/lambda_placeholder.zip"
  source {
    filename = "handler.py"
    content  = "def handler(event, context):\n    return {\"statusCode\": 503, \"body\": \"Not yet deployed\"}\n"
  }
}

resource "aws_s3_object" "lambda_placeholder" {
  bucket = aws_s3_bucket.lambda_code.id
  key    = "lambda_package.zip"
  source = data.archive_file.lambda_placeholder.output_path
  etag   = data.archive_file.lambda_placeholder.output_base64sha256

  lifecycle {
    ignore_changes = [source, etag]
  }
}

resource "aws_s3_bucket_public_access_block" "lambda_code" {
  bucket                  = aws_s3_bucket.lambda_code.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lambda function
resource "aws_lambda_function" "backend" {
  function_name = "${var.app_name}-backend"
  role          = aws_iam_role.lambda.arn
  handler       = "app.main.handler"
  runtime       = "python3.11"
  timeout       = 30
  memory_size   = 512

  s3_bucket = aws_s3_bucket.lambda_code.id
  s3_key    = "lambda_package.zip"

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DATABASE_URL = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.endpoint}/sample"
      SESSION_SECRET = var.session_secret
      FRONTEND_URL   = "https://${aws_cloudfront_distribution.frontend.domain_name}"
    }
  }

  tags = { Name = "${var.app_name}-backend" }

  depends_on = [aws_db_instance.main, aws_s3_object.lambda_placeholder]
}