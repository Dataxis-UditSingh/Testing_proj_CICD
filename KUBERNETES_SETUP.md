# Kubernetes Deployment Setup for React App with Flux and Minikube

This document details the Kubernetes configuration for deploying the React/Vite application using Kustomize, Flux CD, and Minikube, integrated with GitHub for GitOps.

## Overview

The setup uses a hierarchical Kustomize structure to manage Kubernetes manifests. Flux CD monitors the GitHub repository and automatically deploys changes to the Minikube cluster.

## Directory Structure

```
src/clusters/my-cluster/
├── kustomization.yaml          # Root kustomization for the cluster
└── apps/
    └── react-app/
        ├── kustomization.yaml  # App-specific kustomization
        ├── deployment.yaml     # Deployment manifest
        └── service.yaml        # Service manifest
```

## Files Breakdown

### Root Kustomization: `src/clusters/my-cluster/kustomization.yaml`

```yaml
resources:
  - ./apps/react-app
```

**Purpose**: This is the entry point for the cluster configuration. It includes all applications to be deployed.

### App Kustomization: `src/clusters/my-cluster/apps/react-app/kustomization.yaml`

```yaml
resources:
  - deployment.yaml
  - service.yaml
```

**Purpose**: Groups the Kubernetes resources for the React app deployment.

### Deployment: `src/clusters/my-cluster/apps/react-app/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: react-app
  template:
    metadata:
      labels:
        app: react-app
    spec:
      containers:
        - name: react-app
          image: uditdataxis12345/react-app:1.0
          ports:
            - containerPort: 80
```

**Key Components**:
- **Replicas**: Set to 1 for development/testing
- **Image**: Uses the Docker image pushed to Docker Hub (`uditdataxis12345/react-app:1.0`)
- **Ports**: Exposes container port 80 (matches NGINX in the Docker image)
- **Labels**: Used by the Service to route traffic

### Service: `src/clusters/my-cluster/apps/react-app/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: react-app-service
spec:
  type: NodePort
  selector:
    app: react-app
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30007
```

**Key Components**:
- **Type**: NodePort for external access in Minikube
- **Selector**: Matches pods with `app: react-app` label
- **Ports**: Maps service port 80 to container port 80
- **NodePort**: Exposes on port 30007 on the Minikube node

## Deployment Steps

### 1. Prerequisites

- Minikube installed and running
- kubectl configured to use Minikube
- Docker image built and pushed (`uditdataxis12345/react-app:1.0`)

### 2. Manual Deployment (without Flux)

From the project root:

```bash
cd src/clusters/my-cluster
kubectl apply -k .
```

Verify deployment:

```bash
kubectl get pods
kubectl get services
```

Access the app:

```bash
minikube service react-app-service --url
```

### 3. Flux CD Integration

Install Flux in Minikube:

```bash
flux install
```

Create a GitRepository source:

```bash
flux create source git react-app-repo \
  --url=https://github.com/yourusername/yourrepo \
  --branch=main \
  --interval=30s
```

Create a Kustomization:

```bash
flux create kustomization react-app \
  --source=react-app-repo \
  --path=./src/clusters/my-cluster \
  --prune=true \
  --interval=5m
```

## GitOps Workflow

1. **Push Changes**: Commit and push manifest changes to GitHub
2. **Flux Detection**: Flux detects changes via GitRepository
3. **Automatic Deployment**: Kustomization applies changes to Minikube
4. **Verification**: Check pod status and service accessibility

## Image Management

- **Build**: `docker build -t uditdataxis12345/react-app:1.0 .`
- **Push**: `docker push uditdataxis12345/react-app:1.0`
- **Update**: Modify `deployment.yaml` with new tag and commit

## Networking

- **Internal**: Service routes traffic to pods on port 80
- **External**: NodePort 30007 exposes the app outside Minikube
- **Minikube URL**: Use `minikube service react-app-service --url` for access

## Scaling and Configuration

- **Replicas**: Increase `replicas` in `deployment.yaml` for scaling
- **Environment Variables**: Add `env` section to container spec if needed
- **Resources**: Add `resources` limits/requests for production

## Troubleshooting

- **Pod Status**: `kubectl describe pod <pod-name>`
- **Logs**: `kubectl logs <pod-name>`
- **Flux Status**: `flux get kustomizations` and `flux get sources git`

## Security Considerations

- Use image scanning for vulnerabilities
- Implement RBAC for Flux operations
- Consider using sealed secrets for sensitive data
- Enable network policies for pod-to-pod communication

---

This setup provides a solid foundation for GitOps-driven deployments of the React application using Flux CD and Minikube.