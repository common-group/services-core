#!/bin/sh

eksctl create iamserviceaccount \
    --region us-east-1 \
    --name alb-ingress-controller \
    --namespace kube-system \
    --cluster catarse-eksctl-test \
    --attach-policy-arn arn:aws:iam::892910702142:policy/ALBIngressControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --approve