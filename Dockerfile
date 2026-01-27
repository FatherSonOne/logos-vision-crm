# Multi-stage build for Logos Vision CRM
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GEMINI_API_KEY
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_REDIRECT_URI
ARG VITE_APP_URL
ARG VITE_LOGOS_SUPABASE_KEY
ARG VITE_LOGOS_SUPABASE_URL
ARG VITE_RESEND_API_KEY
ARG VITE_DEV_MODE
ARG VITE_API_KEY
ARG VITE_GOOGLE_MAPS_KEY
ARG VITE_SUPABASE_URL_PROD
ARG HUB_SUPABASE_URL
ARG HUB_SUPABASE_ANON_KEY
ARG HUB_SUPABASE_SERVICE_KEY
ARG JWT_SECRET
ARG LOGOS_CRM_SUPABASE_URL
ARG LOGOS_CRM_SUPABASE_KEY
ARG PORT

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_REDIRECT_URI=$VITE_GOOGLE_REDIRECT_URI
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_LOGOS_SUPABASE_KEY=$VITE_LOGOS_SUPABASE_KEY
ENV VITE_LOGOS_SUPABASE_URL=$VITE_LOGOS_SUPABASE_URL
ENV VITE_RESEND_API_KEY=$VITE_RESEND_API_KEY
ENV VITE_DEV_MODE=$VITE_DEV_MODE
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_GOOGLE_MAPS_KEY=$VITE_GOOGLE_MAPS_KEY
ENV VITE_SUPABASE_URL_PROD=$VITE_SUPABASE_URL_PROD

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
