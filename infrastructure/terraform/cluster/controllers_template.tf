resource "template_dir" "controllers" {
  source_dir      = "${path.module}/controllers"
  destination_dir = "${path.module}/controllers_rendered"

  vars = {
    terraform_kiam_elb_role_arn   = aws_iam_policy.elb.arn
  }
}