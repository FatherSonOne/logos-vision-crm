#!/bin/bash

# ==============================================================================
# CONTACTS REDESIGN - DATABASE MIGRATION SCRIPT
# ==============================================================================
# Description: Execute all Pulse integration migrations in sequence
# Version: 1.0.0
# Date: 2026-01-25
# Author: DevOps Automator
#
# Usage:
#   ./migrate.sh                    # Run all migrations
#   ./migrate.sh --dry-run          # Show what would be executed
#   ./migrate.sh --rollback         # Rollback all migrations
#   ./migrate.sh --rollback 002     # Rollback specific migration
# ==============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# ==============================================================================
# CONFIGURATION
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATION_DIR="${SCRIPT_DIR}"
LOG_DIR="${SCRIPT_DIR}/logs"
BACKUP_DIR="${SCRIPT_DIR}/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create directories
mkdir -p "${LOG_DIR}" "${BACKUP_DIR}"

# Timestamp for logs
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/migration_${TIMESTAMP}.log"

# ==============================================================================
# LOGGING FUNCTIONS
# ==============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "${LOG_FILE}"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "${LOG_FILE}"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "${LOG_FILE}"
}

# ==============================================================================
# DATABASE CONNECTION
# ==============================================================================

# Load environment variables
if [ -f "${SCRIPT_DIR}/../.env.production" ]; then
  export $(grep -v '^#' "${SCRIPT_DIR}/../.env.production" | xargs)
  log_info "Loaded .env.production"
elif [ -f "${SCRIPT_DIR}/../.env.local" ]; then
  export $(grep -v '^#' "${SCRIPT_DIR}/../.env.local" | xargs)
  log_warning "Using .env.local (production not found)"
else
  log_error "No environment file found. Create .env.production or .env.local"
  exit 1
fi

# Extract database URL from Supabase URL
if [ -z "${VITE_SUPABASE_URL:-}" ]; then
  log_error "VITE_SUPABASE_URL not set in environment"
  exit 1
fi

# Prompt for database password
echo -e "${YELLOW}Enter database password:${NC}"
read -s DB_PASSWORD
echo

# Construct connection string
PROJECT_ID=$(echo "${VITE_SUPABASE_URL}" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres"

log_info "Connecting to database: ${PROJECT_ID}"

# ==============================================================================
# PRE-MIGRATION CHECKS
# ==============================================================================

check_database_connection() {
  log_info "Testing database connection..."

  if psql "${DB_URL}" -c "SELECT 1;" &>/dev/null; then
    log_success "Database connection successful"
    return 0
  else
    log_error "Database connection failed"
    exit 1
  fi
}

check_contacts_table() {
  log_info "Verifying contacts table exists..."

  if psql "${DB_URL}" -c "SELECT COUNT(*) FROM contacts LIMIT 1;" &>/dev/null; then
    local count=$(psql "${DB_URL}" -t -c "SELECT COUNT(*) FROM contacts;")
    log_success "Found contacts table with ${count} records"
    return 0
  else
    log_error "contacts table not found"
    exit 1
  fi
}

create_backup() {
  log_info "Creating database backup..."

  local backup_file="${BACKUP_DIR}/contacts_backup_${TIMESTAMP}.sql"

  if pg_dump "${DB_URL}" -t contacts -t pulse_contact_interactions -t entity_mappings > "${backup_file}" 2>/dev/null; then
    log_success "Backup created: ${backup_file}"
    echo "${backup_file}"
  else
    log_warning "Backup failed (tables may not exist yet)"
    echo ""
  fi
}

# ==============================================================================
# MIGRATION EXECUTION
# ==============================================================================

run_migration() {
  local migration_file="$1"
  local migration_name=$(basename "${migration_file}" .sql)

  log_info "Running migration: ${migration_name}"

  if psql "${DB_URL}" -f "${migration_file}" >> "${LOG_FILE}" 2>&1; then
    log_success "Migration ${migration_name} completed"
    return 0
  else
    log_error "Migration ${migration_name} failed"
    log_error "Check log file: ${LOG_FILE}"
    return 1
  fi
}

run_all_migrations() {
  log_info "Starting migration sequence..."
  echo

  local migrations=(
    "migration-001-contacts-pulse-integration.sql"
    "migration-002-pulse-interactions.sql"
    "migration-003-entity-mappings.sql"
  )

  for migration in "${migrations[@]}"; do
    local migration_path="${MIGRATION_DIR}/${migration}"

    if [ ! -f "${migration_path}" ]; then
      log_error "Migration file not found: ${migration}"
      exit 1
    fi

    if ! run_migration "${migration_path}"; then
      log_error "Migration sequence failed at: ${migration}"
      exit 1
    fi

    echo
  done

  log_success "All migrations completed successfully!"
}

# ==============================================================================
# ROLLBACK EXECUTION
# ==============================================================================

run_rollback() {
  local specific_migration="${1:-}"

  if [ -n "${specific_migration}" ]; then
    log_warning "Rolling back migration: ${specific_migration}"
    local rollback_file="${MIGRATION_DIR}/migration-${specific_migration}-rollback.sql"

    if [ ! -f "${rollback_file}" ]; then
      log_error "Rollback file not found: ${rollback_file}"
      exit 1
    fi

    if psql "${DB_URL}" -f "${rollback_file}" >> "${LOG_FILE}" 2>&1; then
      log_success "Rollback completed: ${specific_migration}"
    else
      log_error "Rollback failed: ${specific_migration}"
      exit 1
    fi
  else
    log_warning "Rolling back ALL migrations..."
    echo -e "${RED}This will delete all Pulse integration data!${NC}"
    echo -e "${YELLOW}Type 'yes' to confirm:${NC}"
    read -r confirmation

    if [ "${confirmation}" != "yes" ]; then
      log_info "Rollback cancelled"
      exit 0
    fi

    # Rollback in reverse order
    local rollbacks=(
      "migration-003-rollback.sql"
      "migration-002-rollback.sql"
      "migration-001-rollback.sql"
    )

    for rollback in "${rollbacks[@]}"; do
      local rollback_path="${MIGRATION_DIR}/${rollback}"

      if [ -f "${rollback_path}" ]; then
        if psql "${DB_URL}" -f "${rollback_path}" >> "${LOG_FILE}" 2>&1; then
          log_success "Rolled back: ${rollback}"
        else
          log_warning "Rollback failed or already completed: ${rollback}"
        fi
      fi
    done

    log_success "All rollbacks completed"
  fi
}

# ==============================================================================
# DRY RUN
# ==============================================================================

dry_run() {
  log_info "DRY RUN MODE - No changes will be made"
  echo

  log_info "Would execute the following migrations:"
  echo "  1. migration-001-contacts-pulse-integration.sql"
  echo "  2. migration-002-pulse-interactions.sql"
  echo "  3. migration-003-entity-mappings.sql"
  echo

  log_info "Current database state:"
  psql "${DB_URL}" -c "
    SELECT
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename IN ('contacts', 'pulse_contact_interactions', 'entity_mappings')
    ORDER BY tablename;
  "
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
  echo "===================================================================="
  echo "Logos Vision CRM - Contacts Redesign Migration"
  echo "===================================================================="
  echo

  local mode="${1:-migrate}"

  # Pre-flight checks
  check_database_connection

  case "${mode}" in
    --dry-run)
      dry_run
      ;;

    --rollback)
      check_contacts_table
      local backup=$(create_backup)
      run_rollback "${2:-}"
      ;;

    migrate|--migrate)
      check_contacts_table
      local backup=$(create_backup)
      run_all_migrations
      ;;

    *)
      log_error "Unknown option: ${mode}"
      echo "Usage:"
      echo "  ./migrate.sh                    # Run all migrations"
      echo "  ./migrate.sh --dry-run          # Show what would be executed"
      echo "  ./migrate.sh --rollback         # Rollback all migrations"
      echo "  ./migrate.sh --rollback 002     # Rollback specific migration"
      exit 1
      ;;
  esac

  echo
  echo "===================================================================="
  log_success "Migration script completed"
  log_info "Log file: ${LOG_FILE}"
  echo "===================================================================="
}

# Run main function with all arguments
main "$@"
