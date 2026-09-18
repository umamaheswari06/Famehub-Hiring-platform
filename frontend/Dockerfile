# Stage 1: Build the React/Vite app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx SPA config with API proxy to backend
RUN printf 'server {\n    listen 80;\n    server_name _;\n    root /usr/share/nginx/html;\n    index index.html;\n    gzip on;\n    gzip_types text/plain text/css application/json application/javascript text/xml;\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n    location /api/ {\n        proxy_pass http://backend:8080;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_read_timeout 300;\n    }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
