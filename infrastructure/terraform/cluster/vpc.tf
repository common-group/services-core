variable "region" {
  default     = "us-east-1"
  description = "AWS region"
}

provider "aws" {
  version = ">= 2.28.1"
  region  = var.region
}

data "aws_availability_zones" "available" {}

locals {
  cluster_name = "catarse-eks-${random_string.suffix.result}"
}

resource "random_string" "suffix" {
  length  = 8
  special = false
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "2.6.0"

  name                 = "catarse-vpc"
  cidr                 = "10.0.0.0/16"
  azs                  = data.aws_availability_zones.available.names
  private_subnets      = ["10.0.44.0/22", "10.0.48.0/22", "10.0.52.0/22"]
  public_subnets       = ["10.0.17.0/24", "10.0.18.0/24", "10.0.19.0/24"]
  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true

  tags = "${merge(map(
    "Name", "catarse_vpc",
    "kubernetes.io/cluster/${local.cluster_name}", "shared"
  ), local.common_tags)}"

  public_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                      = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"             = "1"
  }
}