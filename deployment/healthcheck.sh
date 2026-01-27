#!/bin/sh

# ==============================================================================
# HEALTH CHECK SCRIPT
# ==============================================================================
# Description: Docker health check for Logos Vision CRM
# Version: 1.0.0
# ==============================================================================

# Check if nginx is running
if ! pgrep -x "nginx" > /dev/null; then
  echo "ERROR: nginx is not running"
  exit 1
fi

# Check if the app responds on port 80
if ! curl -f -s http://localhost:80/health > /dev/null; then
  echo "ERROR: App health check endpoint not responding"
  exit 1
fi

echo "OK: Application is healthy"
exit 0
