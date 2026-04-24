# Stage 1: build the React/Vite app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies based on package-lock for deterministic builds
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: serve the built app with nginx
FROM nginx:alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
