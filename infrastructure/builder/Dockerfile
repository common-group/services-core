# Download kustomize
FROM alpine:3.10 as download-kustomize
ENV KUSTOMIZE_VERSION 2.1.0
ENV KUSTOMIZE_URL https://github.com/kubernetes-sigs/kustomize/releases/download/v${KUSTOMIZE_VERSION}/kustomize_${KUSTOMIZE_VERSION}_linux_amd64
RUN wget -O kustomize "${KUSTOMIZE_URL}"
RUN chmod +x kustomize

# Download bazel
FROM alpine:3.10 as download-bazel
ENV BAZEL_VERSION 2.0.0
ENV BAZEL_URL https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-linux-x86_64
RUN wget -O bazel "${BAZEL_URL}"
RUN chmod +x bazel

# Download skaffold
FROM alpine:3.10 as download-skaffold
ENV SKAFFOLD_VERSION v1.2.0
ENV SKAFFOLD_URL https://storage.googleapis.com/skaffold/releases/${SKAFFOLD_VERSION}/skaffold-linux-amd64
RUN wget -O skaffold "${SKAFFOLD_URL}"
RUN chmod +x skaffold

FROM node:12

ENV DOCKER_CONFIG=/builder/home/.docker

COPY --from=docker:19 /usr/local/bin/docker /usr/local/bin/
COPY --from=download-kustomize kustomize /usr/local/bin/
COPY --from=download-skaffold skaffold /usr/local/bin/
COPY --from=amazon/aws-cli:2.0.10 /usr/local/bin/aws /usr/local/bin/
COPY --from=hashicorp/terraform:0.12.24 /bin/terraform /usr/local/bin
COPY --from=bitnami/kubectl:1.18.2 /opt/bitnami/kubectl /usr/local/bin/
COPY --from=mozilla/sops /go/bin/sops /usr/local/bin/

COPY kubectl.bash /builder/kubectl.bash
COPY skaffold.bash /builder/skaffold.bash

RUN chmod +700 /builder/skaffold.bash
RUN chmod +700 /builder/kubectl.bash

ENTRYPOINT ["/builder/skaffold.bash"]