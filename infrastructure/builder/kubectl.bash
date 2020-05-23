#!/bin/bash
kubectl_cmd=kubectl${KUBECTL_VERSION:+.${KUBECTL_VERSION}}

echo "Running: ${kubectl_cmd}" "$@" >&2
exec "${kubectl_cmd}" "$@"