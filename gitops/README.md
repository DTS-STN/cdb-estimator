# CDB Estimator GitOps Manifests

This repository contains the configuration and application manifests used to
manage both the production and non-production CDB Estimator Kubernetes clusters.

## Requirements

This project has been tested with the following toolchain:

| Tool                                               | Version  |
| -------------------------------------------------- | -------- |
| [Kubectl](https://kubernetes.io/docs/tasks/tools/) | ≥ 1.29.x |
| [Kustomize](https://kustomize.io/)                 | ≥ 5.0.x  |

## Running the project

1. Clone this repository to your local development environment.
1. Navigate to the `cdb-estimator-gitops` directory.
1. Run the following command to apply the kustomize manifests to the target environment:

    ``` shell
    kubectl --kubeconfig {path-to-kubeconfig} apply \
            --kustomize ./overlays/{target-environment}
    ```
