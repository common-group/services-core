terraform {
  backend "s3" {
    # Replace this with your bucket name!
    bucket         = "catarse-terraform-up-and-running-state"
    key            = "cluster/terraform.tfstate"
    region         = "us-east-1"
    # Replace this with your DynamoDB table name!
    dynamodb_table = "catarse-terraform-up-and-running-locks"
    encrypt        = true
  }
}