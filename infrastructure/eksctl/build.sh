#!/bin/sh

CLUSTER_NAME=$1
REGION=${2-us-east-1}

cat <<EOF | eksctl create cluster -f -
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: ${CLUSTER_NAME}
  region: ${REGION}
nodeGroups:
  - name: ng-1
    instanceType: t3.large
    desiredCapacity: 2
    ssh:
      allow: true
    iam:
      withAddonPolicies:
        autoScaler: true
        certManager: true
        ebs: true
        albIngress: true
EOF


eksctl utils associate-iam-oidc-provider \
    --region ${REGION} \
    --cluster ${CLUSTER_NAME} \
    --approve

kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.4/docs/examples/rbac-role.yaml

eksctl create iamserviceaccount \
    --region ${REGION} \
    --name alb-ingress-controller \
    --namespace kube-system \
    --cluster ${CLUSTER_NAME} \
    --attach-policy-arn arn:aws:iam::892910702142:policy/ALBIngressControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --approve

kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.4/docs/examples/alb-ingress-controller.yaml

kubectl patch deployment.apps/alb-ingress-controller -n kube-system --type json -p '[{ "op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--cluster-name=${CLUSTER_NAME}" }]'

eksctl create iamidentitymapping --cluster ${CLUSTER_NAME} --arn arn:aws:iam::892910702142:user/catarse-github-action --group system:masters --username github-actions