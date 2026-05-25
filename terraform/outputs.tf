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