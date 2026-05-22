# Running the Testing Project

This document explains how to run the project locally, with Docker, and on Kubernetes. It also explains Flux CD and the role it plays in this repository.

## 1. Prerequisites

Before running the project, make sure the following services and tools are available:

- Node.js and npm
- Docker (Docker Desktop or Docker Engine)
- kubectl
- Minikube or another Kubernetes cluster
- Flux CLI (only required if using Flux CD)

### Recommended service startup order

1. Start Docker
2. Start your Kubernetes cluster (`minikube start` if you are using Minikube)
3. Verify `kubectl` is pointed at the correct cluster
4. If using Flux, ensure Flux is installed and healthy

---

## 2. Run locally with Vite

This is the simplest development mode.

1. Open the project root:
   - `/Users/uditsingh/DataxisLabs/Testing_Project/Testing_proj`

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app in the browser:

```text
http://localhost:5173
```

> This runs the React + Vite app directly and is best for development and live reload.

---

## 3. Build and preview locally

Use this when you want to verify the production build without Docker.

1. Build the app:

```bash
npm run build
```

2. Preview the build:

```bash
npm run preview
```

3. Open the URL shown by Vite (commonly `http://localhost:4173`).

---

## 4. Run using Docker

Your repository contains a `Dockerfile` that builds the app and serves it with `nginx`.

1. Start Docker.

2. Build the Docker image:

```bash
docker build -t testing-proj .
```

3. Run the container:

```bash
docker run -d --name testing-proj-container -p 8080:80 testing-proj
```

4. Open the app:

```text
http://localhost:8080
```

### Notes

- If you change dependencies or source files, rebuild the image.
- The Docker runtime uses the static build output from `dist` and serves it from NGINX.

---

## 5. Run on Kubernetes

The Kubernetes manifests are under:

- `src/clusters/my-cluster/kustomization.yaml`
- `src/clusters/my-cluster/apps/react-app/deployment.yaml`
- `src/clusters/my-cluster/apps/react-app/service.yaml`

### Important details

- Deployment image: `uditdataxis12345/react-app:1.0`
- Service type: `NodePort`
- NodePort: `30007`

### Deploy steps

1. Start Minikube or your Kubernetes cluster.

```bash
minikube start
```

2. Verify cluster access:

```bash
kubectl get nodes
```

3. Apply the Kustomize configuration:

```bash
kubectl apply -k src/clusters/my-cluster
```

4. Check the deployment and service:

```bash
kubectl get pods
kubectl get services
```

5. Open the app on Minikube:

```bash
minikube service react-app-service --url
```

---

## 6. Flux CD and its role

Flux is a GitOps tool that automates deployments by watching a Git repository for manifest changes and applying them to a Kubernetes cluster.

### What Flux does in this project

- Tracks the repository state for Kubernetes manifests
- Applies `kustomize` changes automatically when the Git repo updates
- Keeps the cluster configuration synced with source control
- Helps deploy the React app to Kubernetes without manual `kubectl apply` every time

### Why Flux is useful here

- It enforces a GitOps workflow: manifest changes in Git become cluster changes.
- It removes the need to run deployment commands manually after each update.
- It is the CD (continuous delivery) part of your project stack.

### Role of Flux in starting the project

Flux is not required to run the app locally or via Docker. It is required only for the GitOps/Kubernetes deployment path.

If you want the cluster to stay in sync automatically, Flux should be installed and configured on your cluster.

### Basic Flux workflow

1. Install Flux on your cluster:

```bash
flux install
```

2. Create a Git source and Kustomization for the cluster (example commands from the docs):

```bash
flux create source git react-app-repo \
  --url=https://github.com/yourusername/yourrepo \
  --branch=main \
  --interval=30s

flux create kustomization react-app \
  --source=react-app-repo \
  --path=./src/clusters/my-cluster \
  --prune=true \
  --interval=5m
```

3. Push changes to Git. Flux will detect them and apply them to the cluster.

---

## 7. Known deployment issue and root cause

During the CD process, the GitHub Actions workflow was completing successfully, but the app did not update on Minikube. The root cause was an image architecture mismatch:

- The workflow built and pushed a Docker image from `ubuntu-latest`, which by default produced an `amd64` image.
- The Minikube cluster was running on an Apple Silicon machine or another `arm64` environment.
- Kubernetes tried to pull the new image tag, but the node could not find a matching `linux/arm64` manifest.
- This caused the pod to enter `ImagePullBackOff` with the error: `no matching manifest for linux/arm64/v8`.

### Why the old app still appeared

- Flux/CD updated the Deployment manifest with the new image tag.
- Kubernetes created a new ReplicaSet, but the new pod could not start because the image was incompatible with the node architecture.
- The old running pod stayed behind or the service still routed to the last healthy pod, so the app page continued to show the old content.

### Fix applied in this project

The workflow was updated to build a multi-architecture image using Buildx and QEMU:

- `docker/setup-qemu-action@v2` was added
- `platforms: linux/amd64,linux/arm64` was added to the `docker/build-push-action`

This ensures the pushed image contains both `amd64` and `arm64` variants, so Minikube can pull a compatible image and update the app correctly.

### What to check if this happens again

1. Confirm the deployment is using the correct image tag in `clusters/my-cluster/apps/react-app/deployment.yaml`.
2. Check the pod status:
   ```bash
   kubectl get pods -n default -l app=react-app
   kubectl describe pod -n default <pod-name>
   ```
3. Look for `ImagePullBackOff` and `no matching manifest for linux/arm64/v8`.
4. If Flux is not syncing immediately, reconcile manually or wait for the next sync interval.

This note explains why the workflow passed but the new app version did not appear on Minikube. It is a CD failure caused by image compatibility, not by GitHub Actions itself.

### GitHub Actions CI/CD

This repository now includes a GitHub Actions workflow at `.github/workflows/cd.yml`.
When you push to `main`, the workflow will:

- build the Docker image using `Dockerfile`
- push it to Docker Hub as `uditdataxis12345/react-app`
- update `clusters/my-cluster/apps/react-app/deployment.yaml` with the new image tag
- push the manifest change back to `main` using `[skip ci]` so the workflow does not loop
- allow Flux to detect the updated deployment manifest and apply it to the cluster

The image tag is generated from the Git commit SHA and written directly into `deployment.yaml`, so every successful push creates a uniquely tagged image and the Kubernetes manifest always points to the exact new build.

You must configure these repository secrets in GitHub:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

### When to start Flux

- Start Flux after your cluster is ready and `kubectl` is configured.
- Flux must be running in the cluster to reconcile the manifests.
- If `flux get all -n flux-system` fails, fix Flux installation before relying on automated deployment.

---

## 7. CD health check

Use these commands to verify Flux is working and your app is deployed:

```bash
kubectl get pods -n flux-system
kubectl get gitrepository flux-system -n flux-system
kubectl get kustomization flux-system -n flux-system
kubectl get deployment react-app -n default
kubectl get service react-app-service -n default
```

If any of these are not healthy, inspect the details:

```bash
kubectl describe gitrepository flux-system -n flux-system
kubectl describe kustomization flux-system -n flux-system
kubectl logs deployment/kustomize-controller -n flux-system
```

Expected healthy output:

- all Flux pods `Running`
- `GitRepository` `Ready` and artifact stored
- `Kustomization` `Ready` with `Applied revision`
- `react-app` deployment `1/1` ready
- `react-app-service` exists and exposes NodePort

---

## 8. Useful commands

- `npm run dev` — start Vite development server
- `npm run build` — build the production app
- `npm run preview` — preview the production build
- `docker build -t testing-proj .` — build Docker image
- `docker run -d --name testing-proj-container -p 8080:80 testing-proj` — run Docker container
- `kubectl apply -k src/clusters/my-cluster` — deploy to Kubernetes
- `kubectl get pods` — check pod status
- `kubectl get services` — check service exposure
- `minikube service react-app-service --url` — get the app URL
- `flux get all -n flux-system` — check Flux status

---

## 8. Troubleshooting

- If the app does not start locally, check that `npm install` completed successfully.
- If Docker cannot build, verify Docker Desktop is running.
- If Kubernetes deployment fails, verify the image `uditdataxis12345/react-app:1.0` is available in the cluster.
- If Flux status is not healthy, inspect Flux logs and cluster connectivity.
