# Tekton CI/CD Setup for Testing_proj_CICD

This document explains the current Tekton-based CI/CD flow for this repository, the required secrets, how to deploy it, and how to verify the full path from Tekton to Git and Kubernetes.

---

## 1. Current Tekton flow

The current Tekton pipeline runs these tasks in order:

1. `git-clone-source`
2. `npm-build`
3. `buildah-push`
4. `update-deployment-manifest`

### What each task does

- `git-clone-source`: clones the repository into the shared PVC using authenticated GitHub access
- `npm-build`: runs `npm ci`, `npm run lint`, and `npm run build`
- `buildah-push`: builds the image with Buildah and pushes it to Docker Hub
- `update-deployment-manifest`: updates `clusters/my-cluster/apps/react-app/deployment.yaml`, commits the change, and pushes it back to `main`

### Current verified behavior

The current Tekton flow is verified end-to-end:

- `clone-repo` -> `Succeeded`
- `npm-build` -> `Succeeded`
- `buildah-push` -> `Succeeded`
- `update-manifest` -> `Succeeded`

The latest successful PipelineRun pushed a manifest update commit and the live deployment now uses the updated image tag.

---

## 2. Required secrets

Create the following secrets in the `tekton-ci` namespace:

### Docker Hub secret

```bash
kubectl create secret docker-registry dockerhub-creds \
  --docker-username=<your-dockerhub-username> \
  --docker-password=<your-dockerhub-password> \
  --docker-email=<your-email> \
  -n tekton-ci
```

### GitHub auth secret

The `update-deployment-manifest` task uses a `github-auth` secret with `username` and `password` keys.

```bash
kubectl create secret generic github-auth \
  --from-literal=username=<your-github-username> \
  --from-literal=password=<your-github-pat> \
  -n tekton-ci
```

> Use a GitHub PAT that can write to the repository.

---

## 3. Install Tekton

Apply the Tekton Pipelines release:

```bash
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipelines/latest/release.yaml
```

Wait until the core controllers are ready:

```bash
kubectl get pods -n tekton-pipelines
```

---

## 4. Apply the repository Tekton resources

```bash
kubectl apply -k tekton
```

Verify the resources are present:

```bash
kubectl get namespace tekton-ci
kubectl get pvc -n tekton-ci
kubectl get pipeline -n tekton-ci
kubectl get task -n tekton-ci
```

You should see:

- `tekton-ci`
- `tekton-source-pvc`
- `testing-proj-ci`
- `git-clone-source`, `npm-build`, `buildah-push`, and `update-deployment-manifest`

---

## 5. Trigger the pipeline

```bash
kubectl apply -f tekton/pipelinerun-example.yaml
```

This creates a `PipelineRun` named `testing-proj-ci-run`.

You can change the image tag by editing `tekton/pipelinerun-example.yaml`.

---

## 6. How to verify the Tekton run

### 6.1 Check PipelineRun status

```bash
kubectl get pr -n tekton-ci
```

### 6.2 Check TaskRun status

```bash
kubectl get tr -n tekton-ci
```

### 6.3 Describe the PipelineRun if a task fails

```bash
kubectl describe pr testing-proj-ci-run -n tekton-ci
```

### 6.4 Inspect logs for the latest TaskRun

Find the pod for the task you want to inspect:

```bash
kubectl get pods -n tekton-ci
kubectl logs -n tekton-ci -f <pod-name>
```

For the current pipeline run, the task pods are labeled by `tekton.dev/pipelineRun=testing-proj-ci-run`.

---

## 7. How to verify the full CI/CD path

### 7.1 Verify the pipeline completed successfully

```bash
kubectl get pr -n tekton-ci
kubectl get tr -n tekton-ci
```

Expected outcome:

- `testing-proj-ci-run` -> `Succeeded`
- `clone-repo`, `npm-build`, `buildah-push`, and `update-manifest` -> `Succeeded`

### 7.2 Verify the manifest update in Git

The `update-deployment-manifest` task pushes a commit to `main`.

Refresh your local refs and inspect the latest remote commit:

```bash
git fetch origin
git log --oneline origin/main -n 5
```

Confirm the manifest file on `origin/main` is updated:

```bash
git show origin/main:clusters/my-cluster/apps/react-app/deployment.yaml
```

If your local workspace is behind `origin/main`, run `git pull` or `git reset --hard origin/main` before comparing files.

### 7.3 Verify the live cluster deployment

Check the image currently running in the cluster:

```bash
kubectl get deployment react-app -n default -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

You should see the same image tag that appears in the manifest on `origin/main`.

### 7.4 Confirm the Tekton task logs

Inspect the `update-manifest` TaskRun logs to prove the task pushed the manifest change:

```bash
TR=testing-proj-ci-run-update-manifest
POD=$(kubectl get taskrun $TR -n tekton-ci -o jsonpath='{.status.podName}')
kubectl logs $POD -n tekton-ci --all-containers=true
```

Expected log excerpts include:

- `git pull --rebase origin main`
- `ci: update deployment image to ...`
- `git push ... HEAD:main`

---

## 8. Validate the Tekton YAML before applying

```bash
kubectl kustomize tekton
kubectl apply --dry-run=client -k tekton
```

If Tekton CRDs are not installed, the dry run will fail until Tekton is installed.

---

## 9. Troubleshooting

### Buildah failure

The current task uses inline Docker Hub credentials with `--creds`. If `buildah-push` fails, inspect the TaskRun logs and confirm the `dockerhub-creds` secret exists and contains valid credentials.

### Manifest update failure

If `update-deployment-manifest` fails, inspect the TaskRun logs and confirm:

- `github-auth` exists in `tekton-ci`
- the secret contains `username` and `password`
- the task image is `alpine/git:2.47.1`

### Local manifest is stale

If the local file differs from the remote manifest, refresh the repo state first:

```bash
git fetch origin
git pull --ff-only
```

---

## 10. Current status

This repository now has a Tekton pipeline that:

- builds and pushes the image
- updates the deployment manifest in Git
- allows the cluster to reconcile the new image through the repository state

If you want Tekton to be the only automation path, avoid running the older GitHub Actions path for the same manifest updates, or disable the duplicate workflow.

---

## 11. Quick command summary

### Install Tekton

```bash
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipelines/latest/release.yaml
```

### Create secrets

```bash
kubectl create secret docker-registry dockerhub-creds \
  --docker-username=<your-dockerhub-username> \
  --docker-password=<your-dockerhub-password> \
  --docker-email=<your-email> \
  -n tekton-ci

kubectl create secret generic github-auth \
  --from-literal=username=<your-github-username> \
  --from-literal=password=<your-github-pat> \
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

### Check status

```bash
kubectl get pr -n tekton-ci
kubectl get tr -n tekton-ci
kubectl describe pr testing-proj-ci-run -n tekton-ci
```

### Check Git and cluster state

```bash
git fetch origin
git show origin/main:clusters/my-cluster/apps/react-app/deployment.yaml
kubectl get deployment react-app -n default -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

---

## 12. Final note

The Tekton pipeline now performs the full post-push manifest update step, so the CI flow is no longer limited to image build and push only. The remaining validation is to keep the repository-state and cluster-state aligned and to avoid running duplicate automation paths for the same manifest update.
