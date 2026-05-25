variable "aws_region" {
  description = "AWS region"
  default     = "ap-southeast-2"
}

variable "app_name" {
  description = "Application name"
  default     = "dashbord"
}

variable "db_username" {
  description = "Database username"
  default     = "dashbordAmin"
}

variable "db_password" {
  description = "Database password"
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  sensitive   = true
}

variable "session_secret" {
  description = "Session secret key"
  sensitive   = true
}
