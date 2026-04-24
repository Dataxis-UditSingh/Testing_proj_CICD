# Docker Setup for React + Vite Project

This document explains the Docker implementation for the current `d:\DataAxis\Testing_Proj` React/Vite application.

## Files Created

- `Dockerfile`
- `.dockerignore`

## Goals

- Build the React/Vite application inside a container
- Produce a production-ready static build
- Serve the static site using `nginx`
- Keep the final runtime image small and secure

## File: `Dockerfile`

This is a multi-stage Dockerfile with two stages:

### Stage 1: Builder

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
```

Explanation:

1. `FROM node:20-alpine AS builder`
   - Uses the Node.js Alpine image for a small build environment.
   - This stage installs dependencies and builds the application.

2. `WORKDIR /app`
   - Sets the working directory in the container to `/app`.

3. `COPY package*.json ./`
   - Copies `package.json` and `package-lock.json` into the image.
   - This allows dependency installation before copying the full source tree.

4. `RUN npm ci`
   - Installs dependencies exactly as defined in `package-lock.json`.
   - `npm ci` is faster and more deterministic than `npm install`.

5. `COPY . .`
   - Copies the entire project into the container.
   - Source files, config files, and build scripts are included.

6. `RUN npm run build`
   - Runs the Vite production build.
   - Outputs static assets into the `dist` folder.

### Stage 2: Runtime

```dockerfile
FROM nginx:alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Explanation:

1. `FROM nginx:alpine AS runtime`
   - Uses a lightweight NGINX image to serve the static build.
   - This stage is separate from the builder to keep the final image small.

2. `COPY --from=builder /app/dist /usr/share/nginx/html`
   - Copies only the built static files from the builder stage.
   - The runtime image does not contain source code or build tools.

3. `EXPOSE 80`
   - Documents that the container listens on port `80`.

4. `CMD ["nginx", "-g", "daemon off;"]`
   - Starts NGINX in foreground mode so Docker keeps the container alive.

## File: `.dockerignore`

This file excludes unnecessary files and directories from the Docker build context:

```text
node_modules
npm-debug.log*
yarn-error.log*
pnpm-lock.yaml
.vscode
.git
.gitignore
Dockerfile
Dockerfile.*
*.log
.DS_Store
coverage
dist
build
```

Why these entries matter:

- `node_modules` prevents copying local dependencies into the image.
- `dist` and `build` exclude local build output, so the build uses fresh output from `npm run build`.
- `.git` and `.vscode` skip developer-only files.
- `Dockerfile` and `Dockerfile.*` prevent Docker from copying build definitions back into the context.

## Build and Run Commands

From the project root:

```powershell
docker build -t testing-proj .
docker run -d --name testing-proj-container -p 8080:80 testing-proj
```

Explanation:

- `docker build -t testing-proj .`
  - Builds the image using the `Dockerfile` in the current directory.
  - Tags the resulting image as `testing-proj`.

- `docker run -d --name testing-proj-container -p 8080:80 testing-proj`
  - Runs the container in detached mode.
  - Maps host port `8080` to container port `80`.
  - Names the container `testing-proj-container`.

## Accessing the App

Open this URL in your browser:

```
http://localhost:8080
```

## Why This Approach

- Builds assets inside a clean container environment.
- Avoids shipping dev dependencies into the runtime image.
- Uses `nginx` for stable, low-overhead static hosting.
- Keeps the final image minimal and production-ready.

## Notes

- If you change dependencies, re-run `docker build`.
- If you add files that should not be part of the build, add them to `.dockerignore`.
- The runtime image does not need Node.js installed.

---

This document contains the full setup and detailed explanation of the Docker implementation for this project.