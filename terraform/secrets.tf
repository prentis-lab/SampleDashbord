resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.app_name}/db-password-v2"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}