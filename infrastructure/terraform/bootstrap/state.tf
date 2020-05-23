# data "terraform_remote_state" "network" {
#   backend = "s3"
#   config = {
#     bucket = "mooneleaf-terraform-state"
#     key    = "network/terraform.tfstate"
#     region = "us-east-1"
#   }
# }

resource "aws_s3_bucket" "terraform_state" {
  bucket = "catarse-terraform-up-and-running-state"
  # Enable versioning so we can see the full revision history of our
  # state files
  versioning {
    enabled = true
  }
  # Enable server-side encryption by default
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "catarse-terraform-up-and-running-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}
