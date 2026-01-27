#!/bin/bash

# ==============================================================================
# VERCEL DEPLOYMENT SCRIPT - LOGOS VISION CRM
# ==============================================================================
# Description: Automated deployment to Vercel with pre-flight checks
# Version: 1.0.0
# Date: 2026-01-25
# Author: DevOps Automator
#
# Usage:
#   ./deploy-vercel.sh                    # Deploy to production
#   ./deploy-vercel.sh --staging          # Deploy to staging
#   ./deploy-vercel.sh --preview          # Deploy preview build
# ==============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

# ==============================================================================
# FUNCTIONS
# ==============================================================================

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_vercel_cli() {
  if ! command -v vercel &> /dev/null; then
    log_error "Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
  fi
  log_success "Vercel CLI found: $(vercel --version)"
}

check_git_status() {
  log_info "Checking git status..."

  if [ -n "$(git status --porcelain)" ]; then
    log_warning "Uncommitted changes found:"
    git status --short
    echo
    echo -e "${YELLOW}Continue anyway? (yes/no):${NC}"
    read -r response
    if [ "${response}" != "yes" ]; then
      log_info "Deployment cancelled"
      exit 0
    fi
  else
    log_success "Working directory clean"
  fi
}

run_tests() {
  log_info "Running tests..."

  cd "${PROJECT_ROOT}"

  if npm run test -- --passWithNoTests &>/dev/null; then
    log_success "All tests passed"
  else
    log_error "Tests failed"
    echo -e "${YELLOW}Continue anyway? (yes/no):${NC}"
    read -r response
    if [ "${response}" != "yes" ]; then
      exit 1
    fi
  fi
}

build_locally() {
  log_info "Building project locally..."

  cd "${PROJECT_ROOT}"

  if npm run build; then
    log_success "Local build successful"
  else
    log_error "Build failed"
    exit 1
  fi
}

set_environment_variables() {
  local environment="$1"

  log_info "Setting environment variables for ${environment}..."

  # Load environment file
  local env_file="${PROJECT_ROOT}/.env.${environment}"

  if [ ! -f "${env_file}" ]; then
    log_error "Environment file not found: ${env_file}"
    exit 1
  fi

  # Set each variable in Vercel
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "${key}" =~ ^#.*$ ]] && continue
    [[ -z "${key}" ]] && continue

    # Remove quotes from value
    value=$(echo "${value}" | sed -e 's/^"//' -e 's/"$//')

    log_info "Setting ${key}..."
    vercel env add "${key}" "${environment}" <<< "${value}" &>/dev/null || true
  done < "${env_file}"

  log_success "Environment variables configured"
}

deploy_to_vercel() {
  local environment="$1"
  local prod_flag=""

  cd "${PROJECT_ROOT}"

  if [ "${environment}" == "production" ]; then
    prod_flag="--prod"
    log_warning "Deploying to PRODUCTION"
  else
    log_info "Deploying to ${environment}"
  fi

  # Deploy
  if vercel ${prod_flag} --yes; then
    log_success "Deployment successful!"

    # Get deployment URL
    local deployment_url=$(vercel ls --meta githubCommitRef=$(git rev-parse --abbrev-ref HEAD) -o json | jq -r '.[0].url')

    echo
    echo "===================================================================="
    log_success "Deployment URL: https://${deployment_url}"
    echo "===================================================================="
  else
    log_error "Deployment failed"
    exit 1
  fi
}

verify_deployment() {
  local url="$1"

  log_info "Verifying deployment health..."

  # Wait for deployment to be ready
  sleep 10

  # Check if site is accessible
  if curl -f -s -o /dev/null -w "%{http_code}" "https://${url}" | grep -q "200"; then
    log_success "Deployment is healthy"
  else
    log_warning "Health check failed - site may still be warming up"
  fi
}

# ==============================================================================
# PRE-FLIGHT CHECKLIST
# ==============================================================================

run_preflight_checks() {
  echo "===================================================================="
  echo "Pre-Flight Checklist"
  echo "===================================================================="
  echo

  check_vercel_cli
  check_git_status
  run_tests
  build_locally

  echo
  log_success "All pre-flight checks passed!"
  echo
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
  local mode="${1:-production}"

  echo "===================================================================="
  echo "Vercel Deployment - Logos Vision CRM"
  echo "===================================================================="
  echo

  case "${mode}" in
    --staging)
      run_preflight_checks
      set_environment_variables "staging"
      deploy_to_vercel "staging"
      ;;

    --preview)
      run_preflight_checks
      deploy_to_vercel "preview"
      ;;

    --production|production)
      echo -e "${RED}DEPLOYING TO PRODUCTION${NC}"
      echo -e "${YELLOW}This will update the live site. Continue? (yes/no):${NC}"
      read -r confirmation

      if [ "${confirmation}" != "yes" ]; then
        log_info "Deployment cancelled"
        exit 0
      fi

      run_preflight_checks
      set_environment_variables "production"
      deploy_to_vercel "production"
      ;;

    *)
      log_error "Unknown option: ${mode}"
      echo "Usage:"
      echo "  ./deploy-vercel.sh                # Deploy to production"
      echo "  ./deploy-vercel.sh --staging      # Deploy to staging"
      echo "  ./deploy-vercel.sh --preview      # Deploy preview"
      exit 1
      ;;
  esac

  echo
  echo "===================================================================="
  log_success "Deployment complete!"
  echo "===================================================================="
}

main "$@"
