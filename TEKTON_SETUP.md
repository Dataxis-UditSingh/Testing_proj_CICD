# Tekton CI/CD Setup for Testing_proj_CICD

This document explains the Tekton-based CI flow added to this repository, what was added, how to install and run it, and how to verify the complete CI/CD pipeline.

---

## 1. What was added

The following Tekton resources were added to the repository:

### New folders and files

- `tekton/kustomization.yaml`
  - Applies the Tekton resources in `tekton/`
- `tekton/namespace.yaml`
  - Creates the `tekton-ci` namespace
- `tekton/pvc.yaml`
  - Creates a shared PVC for the source workspace
- `tekton/tasks/git-clone.yaml`
  - Clones the Git repository into the shared workspace
- `tekton/tasks/npm-build.yaml`
  - Runs `npm ci`, `npm run lint`, and `npm run build`
- `tekton/tasks/buildah-push.yaml`
  - Builds the Docker image with Buildah and pushes it to Docker Hub
- `tekton/pipeline.yaml`
  - Pipeline that runs clone → build → image push
- `tekton/pipelinerun-example.yaml`
  - Example `PipelineRun` that triggers the pipeline

### What the CI pipeline does

1. Clones the repository from Git
2. Installs dependencies with `npm ci`
3. Runs lint with `npm run lint`
4. Builds the app with `npm run build`
5. Builds the Docker image using `Dockerfile`
6. Pushes the image to Docker Hub

### Current repository behavior

- The app build already works locally with `npm run build`
- The Dockerfile already uses `npm ci` and builds the final image
- The existing GitHub Actions workflow in `.github/workflows/cd.yml` already builds and pushes multi-architecture images to Docker Hub and updates the deployment manifest in `clusters/my-cluster/apps/react-app/deployment.yaml`

> Tekton currently handles the build and image push part. It does **not** automatically update the deployment manifest yet.

---

## 2. Current pipeline architecture

### Tekton flow

```
PipelineRun
  -> git-clone-source
  -> npm-build
  -> buildah-push
```

### Important note about CI/CD

You now have two CI/CD paths:

1. **GitHub Actions path**
   - Builds and pushes the image
   - Updates the deployment manifest automatically
2. **Tekton path**
   - Builds and pushes the image
   - Does not update the manifest yet

If you want Tekton to fully replace GitHub Actions, the next step is to add a manifest update step or a GitOps update step after the image push.

---

## 3. Prerequisites

Before deploying Tekton, ensure the following are available:

- `kubectl`
- A Kubernetes cluster (Minikube or any reachable cluster)
- Access to Docker Hub
- A Docker Hub secret that contains credentials

### Recommended tools

- `kubectl`
- `docker`
- `buildah` (optional for local testing)
- `tkn` (optional but helpful for inspecting Tekton resources)

---

## 4. Install Tekton Pipelines

Run the following command to install the Tekton Pipelines CRDs and controllers:

```bash
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipelines/latest/release.yaml
```

Wait until the Tekton components are ready:

```bash
kubectl get pods -n tekton-pipelines
```

You should see the Tekton controller and webhook pods in `Running` state.

---

## 5. Create Docker Hub credentials

Create a secret named `dockerhub-creds` in the `tekton-ci` namespace.

Replace the placeholders with your real Docker Hub credentials:

```bash
kubectl create secret docker-registry dockerhub-creds \
  --docker-username=<your-dockerhub-username> \
  --docker-password=<your-dockerhub-password> \
  --docker-email=<your-email> \
  -n tekton-ci
```

If the namespace does not exist yet, create it first:

```bash
kubectl create namespace tekton-ci
```

---

## 6. Deploy the Tekton resources

Apply the Tekton manifests from the repository:

```bash
kubectl apply -k tekton
```

Verify the resources were created:

```bash
kubectl get namespace tekton-ci
kubectl get pvc -n tekton-ci
kubectl get pipeline -n tekton-ci
kubectl get task -n tekton-ci
```

You should see:

- the `tekton-ci` namespace
- the `tekton-source-pvc`
- the `testing-proj-ci` pipeline
- the `git-clone-source`, `npm-build`, and `buildah-push` tasks

---

## 7. Trigger the Tekton CI run

Apply the example PipelineRun:

```bash
kubectl apply -f tekton/pipelinerun-example.yaml
```

This will start a new PipelineRun named `testing-proj-ci-run`.

You can also customize the image tag by editing `tekton/pipelinerun-example.yaml`.

Example:

```yaml
params:
  - name: image-tag
    value: latest
```

If you want a unique tag, replace `latest` with a build-specific tag.

---

## 8. How to check the CI pipeline

### 8.1 Check the PipelineRun status

```bash
kubectl get pr -n tekton-ci
```

You should see `testing-proj-ci-run` in `Running`, `Succeeded`, or `Failed`.

### 8.2 Check the TaskRuns

```bash
kubectl get tr -n tekton-ci
```

This shows each task execution created by the PipelineRun.

### 8.3 Check the PipelineRun details

```bash
kubectl describe pr testing-proj-ci-run -n tekton-ci
```

Use this when a task fails and you want to inspect the reason.

### 8.4 Check the TaskRun details

```bash
kubectl describe tr <taskrun-name> -n tekton-ci
```

Replace `<taskrun-name>` with the actual TaskRun name from `kubectl get tr -n tekton-ci`.

### 8.5 View the logs from the running pods

Find the pod created by the TaskRun:

```bash
kubectl get pods -n tekton-ci
```

Then inspect logs:

```bash
kubectl logs -n tekton-ci -f <pod-name>
```

If you want to follow the logs for the most recent PipelineRun pod, use:

```bash
kubectl get pod -n tekton-ci -l tekton.dev/pipelineRun=testing-proj-ci-run -o name
```

Then pass the returned pod name to `kubectl logs -f`.

### 8.6 Check if the image was pushed successfully

After the `buildah-push` task completes, verify the image exists on Docker Hub.

You can also inspect the TaskRun output:

```bash
kubectl get tr -n tekton-ci
kubectl describe tr <taskrun-name> -n tekton-ci
```

If the task succeeded, the image push step completed successfully.

---

## 9. How to check the full CI/CD flow

### 9.1 Tekton CI path

Check all of the following:

1. `kubectl get pr -n tekton-ci`
2. `kubectl get tr -n tekton-ci`
3. `kubectl logs -n tekton-ci -f <pod-name>`
4. Docker Hub image exists for the pushed tag

### 9.2 Existing GitHub Actions path

The existing workflow in `.github/workflows/cd.yml` should also be checked separately:

1. Open GitHub Actions in the repository
2. Confirm the latest workflow run is `success`
3. Confirm the deployment manifest in `clusters/my-cluster/apps/react-app/deployment.yaml` is updated to the new image tag

### 9.3 Kubernetes deployment path

After the image is pushed and the deployment manifest is updated, verify the app is running:

```bash
kubectl get pods
kubectl get services
```

If using Minikube:

```bash
minikube service react-app-service --url
```

Then open the returned URL in your browser.

---

## 10. How to validate the Tekton YAML files

You can render and verify the manifests before applying them:

```bash
kubectl kustomize tekton
```

You can also do a client-side dry run:

```bash
kubectl apply --dry-run=client -k tekton
```

If Tekton CRDs are not installed, the dry run will fail with `no matches for kind "Pipeline"`. That is expected until Tekton is installed.

---

## 11. Current limitations

The current Tekton setup has these limitations:

- It builds and pushes the image
- It does **not** yet update the deployment manifest automatically
- It does **not** yet trigger Flux reconciliation directly

If you want the full end-to-end flow from Tekton all the way to the cluster, the next step is to add a post-push step that updates the image tag in `clusters/my-cluster/apps/react-app/deployment.yaml` or to integrate Tekton with a GitOps workflow.

---

## 12. Next steps

### Recommended next step

Add a manifest update step so Tekton can update the image tag in the Kubernetes deployment manifest.

Possible approaches:

1. **Use a Git commit step**
   - Update `clusters/my-cluster/apps/react-app/deployment.yaml`
   - Commit and push the new image tag back to the repository
2. **Use a separate automation job**
   - Trigger a script that edits the manifest after the image push
3. **Use GitOps-native automation**
   - Let Flux watch the repository and reconcile the updated manifest

### Additional improvements

- Add a `PipelineRun` parameter for `image-tag`
- Add a `buildah` multi-platform build for `linux/amd64` and `linux/arm64`
- Add integration with `docker/setup-buildx` style behavior
- Add a cleanup task to remove temporary artifacts

---

## 13. Quick command summary

### Install Tekton

```bash
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipelines/latest/release.yaml
```

### Create secret

```bash
kubectl create secret docker-registry dockerhub-creds \
  --docker-username=<your-dockerhub-username> \
  --docker-password=<your-dockerhub-password> \
  --docker-email=<your-email> \
  -n tekton-ci
```

### Apply Tekton resources

```bash
kubectl apply -k tekton
```

### Trigger the pipeline

```bash
kubectl apply -f tekton/pipelinerun-example.yaml
```

### Check PipelineRun

```bash
kubectl get pr -n tekton-ci
kubectl get tr -n tekton-ci
kubectl describe pr testing-proj-ci-run -n tekton-ci
```

### Check logs

```bash
kubectl get pods -n tekton-ci
kubectl logs -n tekton-ci -f <pod-name>
```

### Check deployment

```bash
kubectl get pods
kubectl get services
minikube service react-app-service --url
```

---

## 14. Final note

You now have a Tekton-based CI path added to the repository, and you also still have the existing GitHub Actions deployment path. The Tekton path is ready to build and push the image, and the next logical step is to complete the manifest update or GitOps handoff so the cluster is updated automatically from the Tekton-generated image.
