# =============================================================================
# Money Notebook - Production Dockerfile
# =============================================================================
# Sử dụng với: docker-compose.ssl.yml (production với SSL)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build API (NestJS)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS api-builder

WORKDIR /app/api

# Copy package files
COPY api/package.json api/package-lock.json* api/yarn.lock* ./

# Install dependencies (dùng npm registry để tránh lỗi yarn registry)
RUN yarn config set registry https://registry.npmjs.org && \
    yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY api/ .

# Build
RUN yarn build

# -----------------------------------------------------------------------------
# Stage 2: Build Frontend (Next.js SSR)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files
COPY frontend/package.json frontend/package-lock.json* frontend/yarn.lock* ./

# Install dependencies (dùng npm registry để tránh lỗi yarn registry)
RUN yarn config set registry https://registry.npmjs.org && \
    yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY frontend/ .

# Build Next.js (SSR mode với middleware)
RUN yarn build

# -----------------------------------------------------------------------------
# Stage 3: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Install PM2 globally
RUN npm install -g pm2

# Install nginx and envsubst (for template substitution)
RUN apk add --no-cache nginx gettext

# Create directories
RUN mkdir -p /var/log/pm2 /var/log/nginx /run/nginx /var/www/certbot /etc/nginx/templates

WORKDIR /app

# Copy API build
COPY --from=api-builder /app/api/dist ./api/dist
COPY --from=api-builder /app/api/node_modules ./api/node_modules
COPY --from=api-builder /app/api/package.json ./api/
COPY --from=api-builder /app/api/ecosystem.config.json ./api/

# Copy Frontend build (Next.js SSR)
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json ./frontend/

# Copy nginx config
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/ssl.conf.template /etc/nginx/templates/ssl.conf.template

# Copy startup script
COPY docker/start-ssl.sh /start.sh
RUN chmod +x /start.sh

# Expose ports
# 80  - HTTP (redirect to HTTPS)
# 443 - HTTPS (SSL)
# 2053 - API internal port
# 3000 - Next.js internal port
EXPOSE 80 443 2053 3000

# Start services
CMD ["/start.sh"]
