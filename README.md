### under development

# services core [![CircleCI](https://circleci.com/gh/common-group/services-core.svg?style=svg)](https://circleci.com/gh/common-group/services-core)
This repo contains docker files to setup the Catarse environment. All dependendent repos are included as git subtrees mounted on the ```services``` folder.

## setup
For every service described on `docker-compose.yml` we have multiple env_files `compose_env/.*.env.sample`. Just make a copy off all of them on the same directory removing .sample.

Start Database:
`$ docker-compose up -d service_core_db`

Run the migrations and seed database with sample data:
```
$ docker-compose up migrations
// database service mapping the 5444 to postgres container
$ psql -h localhost -p 5444 -U postgres service_core < services/service-core-db/sample.seed.sql
```

Start services:
`$ docker-compose up -d`

## Skaffold notes

Using Verdaccio (an open source private NPM registry) to be able to create intermediary builds of catarse.js. See services/private-npm-registry for details on setting up

After generating an ~/.npmrc file, add it to the env for the build:
`export NPM_AUTH=$(cat ~/.npmrc)`

Start with running the base profile:
`skaffold run`

Start the migration job:
`skaffold run -p migrations`

Now seed the DB:
`skaffold run -p prime`

Next load default/demo settings
`skaffold run -p setup`

Wait for migrations job to re-run and be succesful, or force start it. To check the status of the migration run `kubectl logs job/catarse-migrations`

Restart catarse:
`kubectl scale deploy/catarse --replicas=0`
`kubectl scale deploy/catarse --replicas=1`

# Provisioning

You will need the following tools installed:
 - kubectl
 - terraform
 - AWS CLI w/ default credentials configured for the account you want to deploy to

Inside `/infrastructure/terraform/cluster` run the following commands:

```
terraform init
terraform plan --var provision=true --out plan
terraform apply plan
```

Configure kubectl to talk to cluster:

```
aws eks --region $(terraform output region) update-kubeconfig --name $(terraform output cluster_name)
```

Check that your `kubectl` is connected to the cluster:

```
$ kubectl cluster-info
Kubernetes master is running at https://38B74DBEA9E95716E5E724B719EFADF7.yl4.us-east-1.eks.amazonaws.com
CoreDNS is running at https://38B74DBEA9E95716E5E724B719EFADF7.yl4.us-east-1.eks.amazonaws.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

Finish the provisioning:

```
terraform plan --out plan
terraform apply plan
```

Next add the metrics server (to enable system monitor dashboards):

```
wget -O v0.3.6.tar.gz https://codeload.github.com/kubernetes-sigs/metrics-server/tar.gz/v0.3.6 && tar -xzf v0.3.6.tar.gz
kubectl apply -f metrics-server-0.3.6/deploy/1.8+/
```

Wait for the deployment to show 1/1 READY

```
kubectl get deployment metrics-server -n kube-system
```

Install the default Kubernetes dashboard:

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta8/aio/deploy/recommended.yaml
kubectl apply -f https://raw.githubusercontent.com/hashicorp/learn-terraform-provision-eks-cluster/master/kubernetes-dashboard-admin.rbac.yaml
```

Install AWS storage drivers:

```
kubectl apply -k "github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=master"
```

Install AWS ELB drivers:

Install eksctl if needed: https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html#installing-eksctl

```
eksctl utils associate-iam-oidc-provider --region $(terraform output region) --cluster $(terraform output cluster_name) --approve
```

Now some env vars:
```
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
export OIDC_PROVIDER=$(aws eks describe-cluster --name $(terraform output cluster_name) --query "cluster.identity.oidc.issuer" --output text | sed -e "s/^https:\/\///")
export ISSUER_URL=$(aws eks describe-cluster \
                       --name $(terraform output cluster_name) \
                       --query cluster.identity.oidc.issuer \
                       --output text)
export ISSUER_HOSTPATH=$(echo $ISSUER_URL | cut -f 3- -d'/')
export PROVIDER_ARN="arn:aws:iam::$ACCOUNT_ID:oidc-provider/$ISSUER_HOSTPATH"
cat > irp-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "$PROVIDER_ARN"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${ISSUER_HOSTPATH}:sub": "system:serviceaccount:kube-system:alb-ingress-controller",
          "${ISSUER_HOSTPATH}:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
EOF
export ROLE_NAME=catarse-elb-assume-role
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document file://irp-trust-policy.json
aws iam update-assume-role-policy \
  --role-name $ROLE_NAME \
  --policy-document file://irp-trust-policy.json
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn $(terraform output elb_policy_arn)
export ELB_ROLE_ARN=$(aws iam get-role \
  --role-name $ROLE_NAME \
  --query Role.Arn --output text)
kubectl create -n kube-system sa alb-ingress-controller
kubectl annotate -n kube-system sa alb-ingress-controller eks.amazonaws.com/role-arn=$ELB_ROLE_ARN
```

To login, you'll need a token. Generate one:

```
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep service-controller-token | awk '{print $1}')
```

To log into the dashboard, you need to create a local proxy:

```
kubectl proxy
```

While the proxy is running, visist http://127.0.0.1:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/ and enter the token retrieved earlier.

