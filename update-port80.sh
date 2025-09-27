#!/bin/bash

# Custom Dashboard - Debian Update Script (Port 80)
# This script updates the Custom Dashboard on Debian/Ubuntu systems running on port 80

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="custom-dashboard"
APP_USER="dashboard"
APP_DIR="/opt/custom-dashboard"
SERVICE_NAME="custom-dashboard"
PORT=80
BACKUP_DIR="/opt/dashboard-backups"

# Logging
LOG_FILE="/var/log/dashboard-update.log"

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Show help
show_help() {
    echo "Custom Dashboard Update Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --backup-only    Create backup only, don't update"
    echo "  --no-backup      Skip backup creation"
    echo "  --status         Show service status"
    echo "  --help           Show this help message"
    echo
    echo "Examples:"
    echo "  sudo $0                    # Full update with backup"
    echo "  sudo $0 --backup-only      # Create backup only"
    echo "  sudo $0 --status           # Check service status"
}

# Parse command line arguments
BACKUP_ONLY=false
NO_BACKUP=false
STATUS_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backup-only)
            BACKUP_ONLY=true
            shift
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --status)
            STATUS_ONLY=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            error "Unknown option: $1. Use --help for usage information."
            ;;
    esac
done

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Show service status
show_status() {
    echo -e "${BLUE}=== Custom Dashboard Status ===${NC}"
    echo
    
    # Service status
    echo -e "${YELLOW}Systemd Service:${NC}"
    systemctl status "$SERVICE_NAME" --no-pager || true
    echo
    
    # PM2 status
    echo -e "${YELLOW}PM2 Process:${NC}"
    sudo -u "$APP_USER" pm2 status 2>/dev/null || echo "PM2 not running or not configured"
    echo
    
    # Port status
    echo -e "${YELLOW}Port Status:${NC}"
    if netstat -tuln | grep -q ":80 "; then
        echo -e "${GREEN}✓${NC} Port 80 is listening"
    else
        echo -e "${RED}✗${NC} Port 80 is not listening"
    fi
    echo
    
    # Application response
    echo -e "${YELLOW}HTTP Response:${NC}"
    if curl -f -s "http://localhost:80" > /dev/null; then
        echo -e "${GREEN}✓${NC} Application responding on port 80"
    else
        echo -e "${RED}✗${NC} Application not responding"
    fi
    echo
    
    # Disk usage
    echo -e "${YELLOW}Disk Usage:${NC}"
    df -h "$APP_DIR" 2>/dev/null || true
    echo
    
    # Recent logs
    echo -e "${YELLOW}Recent Logs (last 10 lines):${NC}"
    journalctl -u "$SERVICE_NAME" --no-pager -n 10 || true
}

# Create backup
create_backup() {
    if [[ "$NO_BACKUP" == true ]]; then
        log "Skipping backup creation"
        return
    fi
    
    log "Creating backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Create timestamped backup
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/dashboard_backup_$TIMESTAMP.tar.gz"
    
    # Stop service for consistent backup
    systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    
    # Create backup
    tar -czf "$BACKUP_FILE" -C "$(dirname "$APP_DIR")" "$(basename "$APP_DIR")" 2>/dev/null || {
        warn "Backup creation failed, continuing anyway..."
    }
    
    if [[ -f "$BACKUP_FILE" ]]; then
        log "Backup created: $BACKUP_FILE"
        
        # Keep only last 5 backups
        cd "$BACKUP_DIR"
        ls -t dashboard_backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    
    apt-get update -y
    apt-get upgrade -y
    
    # Update Node.js if needed
    CURRENT_NODE=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ "$CURRENT_NODE" -lt 18 ]]; then
        log "Updating Node.js to version 20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    log "System packages updated"
}

# Update application
update_application() {
    log "Updating application..."
    
    cd "$APP_DIR"
    
    # Backup current .env file
    if [[ -f ".env" ]]; then
        cp ".env" ".env.backup"
        log "Environment file backed up"
    fi
    
    # Update dependencies
    log "Updating dependencies..."
    sudo -u "$APP_USER" npm update
    
    # Rebuild application
    log "Rebuilding application..."
    sudo -u "$APP_USER" npm run build
    
    # Restore .env file if it was backed up
    if [[ -f ".env.backup" ]]; then
        mv ".env.backup" ".env"
        chown "$APP_USER:$APP_USER" ".env"
        log "Environment file restored"
    fi
    
    log "Application updated successfully"
}

# Restart services
restart_services() {
    log "Restarting services..."
    
    # Reload PM2 processes
    sudo -u "$APP_USER" pm2 reload ecosystem.config.js 2>/dev/null || {
        log "PM2 reload failed, doing full restart..."
        sudo -u "$APP_USER" pm2 delete all 2>/dev/null || true
        sudo -u "$APP_USER" pm2 start ecosystem.config.js
    }
    
    # Restart systemd service
    systemctl restart "$SERVICE_NAME"
    
    # Wait for service to start
    sleep 5
    
    # Verify service is running
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log "Service restarted successfully"
    else
        error "Service failed to restart. Check logs: journalctl -u $SERVICE_NAME"
    fi
}

# Verify update
verify_update() {
    log "Verifying update..."
    
    # Check service status
    if ! systemctl is-active --quiet "$SERVICE_NAME"; then
        error "Service is not running after update"
    fi
    
    # Check port
    sleep 3
    if ! netstat -tuln | grep -q ":80 "; then
        error "Application is not listening on port 80"
    fi
    
    # Test HTTP response
    if curl -f -s "http://localhost:80" > /dev/null; then
        log "Application responding correctly on port 80"
    else
        warn "Application not responding. Check logs: journalctl -u $SERVICE_NAME -f"
    fi
    
    log "Update verification completed"
}

# Cleanup old files
cleanup() {
    log "Cleaning up..."
    
    cd "$APP_DIR"
    
    # Clean npm cache
    sudo -u "$APP_USER" npm cache clean --force 2>/dev/null || true
    
    # Clean old PM2 logs
    sudo -u "$APP_USER" pm2 flush 2>/dev/null || true
    
    # Clean system packages
    apt-get autoremove -y
    apt-get autoclean
    
    # Clean old log files (keep last 7 days)
    find /var/log/custom-dashboard -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    log "Cleanup completed"
}

# Print update summary
print_summary() {
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                     UPDATE COMPLETE                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}Dashboard URL:${NC} http://$(hostname -I | awk '{print $1}'):80"
    echo -e "${BLUE}Service Status:${NC} $(systemctl is-active $SERVICE_NAME)"
    echo -e "${BLUE}Last Updated:${NC} $(date)"
    echo
    echo -e "${YELLOW}MANAGEMENT COMMANDS:${NC}"
    echo "• Status:  systemctl status $SERVICE_NAME"
    echo "• Logs:    journalctl -u $SERVICE_NAME -f"
    echo "• Restart: systemctl restart $SERVICE_NAME"
    echo "• PM2:     sudo -u $APP_USER pm2 status"
    echo
    echo -e "${GREEN}Update completed successfully!${NC}"
    echo
}

# Main update function
main() {
    if [[ "$STATUS_ONLY" == true ]]; then
        show_status
        exit 0
    fi
    
    log "Starting Custom Dashboard update..."
    
    check_root
    
    if [[ "$BACKUP_ONLY" == true ]]; then
        create_backup
        log "Backup completed"
        exit 0
    fi
    
    create_backup
    update_system
    update_application
    restart_services
    verify_update
    cleanup
    print_summary
    
    log "Update completed successfully"
}

# Handle script interruption
trap 'error "Update interrupted"' INT TERM

# Run main function
main "$@"