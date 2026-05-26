# ── Lambda function — start / stop RDS ───────────────────────────────────────

resource "aws_iam_role" "rds_scheduler_lambda" {
  name = "${var.app_name}-rds-scheduler-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "rds_scheduler_lambda" {
  role = aws_iam_role.rds_scheduler_lambda.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["rds:StartDBInstance", "rds:StopDBInstance"]
        Resource = aws_db_instance.main.arn
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

data "archive_file" "rds_scheduler" {
  type        = "zip"
  output_path = "${path.module}/rds_scheduler_lambda.zip"

  source {
    filename = "handler.py"
    content  = <<-PYTHON
      import os
      import boto3
      from botocore.exceptions import ClientError

      def handler(event, context):
          rds = boto3.client("rds")
          action = event["action"]
          db_id  = os.environ["DB_INSTANCE_ID"]

          try:
              if action == "start":
                  rds.start_db_instance(DBInstanceIdentifier=db_id)
                  print(f"Started {db_id}")
              elif action == "stop":
                  rds.stop_db_instance(DBInstanceIdentifier=db_id)
                  print(f"Stopped {db_id}")
              else:
                  raise ValueError(f"Unknown action: {action}")
          except ClientError as e:
              if e.response["Error"]["Code"] == "InvalidDBInstanceState":
                  print(f"{db_id} already in target state, skipping.")
              else:
                  raise
    PYTHON
  }
}

resource "aws_lambda_function" "rds_scheduler" {
  function_name    = "${var.app_name}-rds-scheduler"
  role             = aws_iam_role.rds_scheduler_lambda.arn
  handler          = "handler.handler"
  runtime          = "python3.11"
  timeout          = 60
  filename         = data.archive_file.rds_scheduler.output_path
  source_code_hash = data.archive_file.rds_scheduler.output_base64sha256

  environment {
    variables = {
      DB_INSTANCE_ID = aws_db_instance.main.id
    }
  }
}

# ── IAM role for EventBridge Scheduler → Lambda ───────────────────────────────

resource "aws_iam_role" "rds_eventbridge" {
  name = "${var.app_name}-rds-eventbridge-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "scheduler.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "rds_eventbridge" {
  role = aws_iam_role.rds_eventbridge.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = aws_lambda_function.rds_scheduler.arn
    }]
  })
}

# ── Schedules (Australia/Sydney handles daylight saving automatically) ─────────

resource "aws_scheduler_schedule" "rds_start" {
  name       = "${var.app_name}-rds-start"
  group_name = "default"
  state      = var.rds_schedule_enabled ? "ENABLED" : "DISABLED"

  flexible_time_window { mode = "OFF" }

  schedule_expression          = "cron(0 8 ? * MON-FRI *)"
  schedule_expression_timezone = "Australia/Sydney"

  target {
    arn      = aws_lambda_function.rds_scheduler.arn
    role_arn = aws_iam_role.rds_eventbridge.arn
    input    = jsonencode({ action = "start" })
  }
}

resource "aws_scheduler_schedule" "rds_stop" {
  name       = "${var.app_name}-rds-stop"
  group_name = "default"
  state      = var.rds_schedule_enabled ? "ENABLED" : "DISABLED"

  flexible_time_window { mode = "OFF" }

  schedule_expression          = "cron(0 15 ? * MON-FRI *)"
  schedule_expression_timezone = "Australia/Sydney"

  target {
    arn      = aws_lambda_function.rds_scheduler.arn
    role_arn = aws_iam_role.rds_eventbridge.arn
    input    = jsonencode({ action = "stop" })
  }
}
