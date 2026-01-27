# ==============================================================================
# MULTI-STAGE DOCKERFILE - LOGOS VISION CRM
# ==============================================================================
# Description: Production-optimized Docker image
# Version: 1.0.0
# Date: 2026-01-25
# Author: DevOps Automator
#
# Build:
#   docker build -t logos-vision-crm:latest .
#
# Run:
#   docker run -p 80:80 --env-file .env.production logos-vision-crm:latest
# ==============================================================================

# ==============================================================================
# STAGE 1: DEPENDENCIES
# ==============================================================================
FROM node:18-alpine AS deps

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./

RUN npm ci --only=production && \
    npm cache clean --force

# ==============================================================================
# STAGE 2: BUILD
# ==============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_PULSE_API_URL
ARG VITE_PULSE_API_KEY
ARG VITE_GEMINI_API_KEY
ARG VITE_FEATURE_CONTACTS_REDESIGN=true

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_PULSE_API_URL=$VITE_PULSE_API_URL
ENV VITE_PULSE_API_KEY=$VITE_PULSE_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_FEATURE_CONTACTS_REDESIGN=$VITE_FEATURE_CONTACTS_REDESIGN

# Build application
RUN npm run build

# ==============================================================================
# STAGE 3: RUNNER
# ==============================================================================
FROM nginx:alpine AS runner

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY deployment/nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add health check script
COPY deployment/healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /usr/share/nginx/html && \
    chown -R nodejs:nodejs /var/cache/nginx && \
    chown -R nodejs:nodejs /var/log/nginx && \
    chown -R nodejs:nodejs /etc/nginx/conf.d

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ==============================================================================
# METADATA
# ==============================================================================
LABEL maintainer="devops@logosvision.com"
LABEL version="1.0.0"
LABEL description="Logos Vision CRM - Contacts Redesign Production Build"
