output "cloudfront_url" {
  description = "Frontend URL"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "api_gateway_url" {
  description = "Backend API URL"
  value       = aws_api_gateway_deployment.main.invoke_url
}

output "s3_frontend_bucket" {
  description = "S3 bucket for frontend"
  value       = aws_s3_bucket.frontend.id
}

output "lambda_code_bucket" {
  description = "S3 bucket for Lambda code"
  value       = aws_s3_bucket.lambda_code.id
}

output "db_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_username" {
  description = "Database master username"
  value       = var.db_username
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.backend.function_name
}

output "rds_sg_id" {
  description = "RDS security group ID (used to grant temporary direct access)"
  value       = aws_security_group.rds.id
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.frontend.id
}