#!/bin/bash

# Custom Dashboard - Debian Installation Script (Port 80)
# This script installs the Custom Dashboard on Debian/Ubuntu systems to run on port 80

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
NODE_VERSION="20"

# Logging
LOG_FILE="/var/log/dashboard-install.log"

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

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check OS
    if ! grep -q "debian\|ubuntu" /etc/os-release; then
        error "This script is designed for Debian/Ubuntu systems"
    fi
    
    # Check architecture
    ARCH=$(uname -m)
    if [[ "$ARCH" != "x86_64" && "$ARCH" != "aarch64" ]]; then
        warn "Untested architecture: $ARCH. Proceeding anyway..."
    fi
    
    # Check available disk space (minimum 2GB)
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    if [[ $AVAILABLE_SPACE -lt 2097152 ]]; then
        error "Insufficient disk space. At least 2GB required."
    fi
    
    # Check if port 80 is available
    if netstat -tuln | grep -q ":80 "; then
        error "Port 80 is already in use. Please stop the service using it first."
    fi
    
    log "System requirements check passed"
}

# Update system packages
update_system() {
    log "Updating system packages..."
    apt-get update -y
    apt-get upgrade -y
    apt-get install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js ${NODE_VERSION}..."
    
    # Remove existing Node.js installations
    apt-get remove -y nodejs npm || true
    
    # Install Node.js from NodeSource
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    
    # Verify installation
    NODE_VER=$(node --version)
    NPM_VER=$(npm --version)
    log "Node.js installed: $NODE_VER, npm: $NPM_VER"
    
    # Install PM2 globally
    npm install -g pm2@latest
    log "PM2 installed: $(pm2 --version)"
}

# Create application user
create_user() {
    log "Creating application user..."
    
    if id "$APP_USER" &>/dev/null; then
        log "User $APP_USER already exists"
    else
        useradd --system --shell /bin/bash --home "$APP_DIR" --create-home "$APP_USER"
        log "Created user: $APP_USER"
    fi
    
    # Add user to necessary groups
    usermod -a -G www-data "$APP_USER"
}

# Download and setup application
setup_application() {
    log "Setting up application..."
    
    # Create application directory
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    
    # For demo purposes, we'll create the basic structure
    # In production, you would clone from your git repository
    log "Creating application structure..."
    
    # Create package.json
    cat > package.json << 'EOF'
{
  "name": "custom-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 80",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 80",
    "start": "vite preview --host 0.0.0.0 --port 80"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@supabase/supabase-js": "^2.57.4",
    "@tanstack/react-query": "^5.83.0",
    "@types/google.accounts": "^0.0.18",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "lovable-tagger": "^1.1.9",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.38.0",
    "vite": "^5.4.19"
  }
}
EOF
    
    # Create basic vite config for production
    cat > vite.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 80,
  },
  preview: {
    host: "0.0.0.0",
    port: 80,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: true,
  },
});
EOF
    
    # Set ownership
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    
    log "Application structure created"
}

# Install dependencies and build
build_application() {
    log "Installing dependencies and building application..."
    
    cd "$APP_DIR"
    
    # Install dependencies as app user
    sudo -u "$APP_USER" npm install --production=false
    
    # Build application
    sudo -u "$APP_USER" npm run build
    
    log "Application built successfully"
}

# Create environment file
create_environment() {
    log "Creating environment configuration..."
    
    cat > "$APP_DIR/.env" << 'EOF'
# Custom Dashboard Environment Configuration
NODE_ENV=production
PORT=80
HOST=0.0.0.0

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Weather API (OpenWeatherMap)
VITE_WEATHER_API_KEY=your_openweather_api_key_here

# Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# News API (optional)
VITE_NEWS_API_KEY=your_news_api_key_here

# Home Assistant (optional)
VITE_HOME_ASSISTANT_URL=http://homeassistant.local:8123
VITE_HOME_ASSISTANT_TOKEN=your_ha_token_here
EOF
    
    chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
    chmod 600 "$APP_DIR/.env"
    
    log "Environment file created at $APP_DIR/.env"
}

# Setup PM2 ecosystem
setup_pm2() {
    log "Setting up PM2 process management..."
    
    cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'custom-dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/opt/custom-dashboard',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 80,
      HOST: '0.0.0.0'
    },
    error_file: '/var/log/custom-dashboard/error.log',
    out_file: '/var/log/custom-dashboard/out.log',
    log_file: '/var/log/custom-dashboard/combined.log',
    time: true
  }]
};
EOF
    
    # Create log directory
    mkdir -p /var/log/custom-dashboard
    chown "$APP_USER:$APP_USER" /var/log/custom-dashboard
    
    chown "$APP_USER:$APP_USER" "$APP_DIR/ecosystem.config.js"
    
    log "PM2 ecosystem configured"
}

# Create systemd service
create_service() {
    log "Creating systemd service..."
    
    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=Custom Dashboard - Free DAKboard Alternative
Documentation=https://github.com/your-repo/custom-dashboard
After=network.target

[Service]
Type=forking
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
Environment=PORT=80
ExecStart=/usr/bin/pm2 start ecosystem.config.js --no-daemon
ExecReload=/usr/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
PIDFile=$APP_DIR/custom-dashboard.pid
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR /var/log/custom-dashboard /tmp

# Allow binding to port 80
AmbientCapabilities=CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    log "Systemd service created and enabled"
}

# Configure firewall
setup_firewall() {
    log "Configuring firewall..."
    
    # Install UFW if not present
    apt-get install -y ufw
    
    # Configure UFW
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (important!)
    ufw allow ssh
    
    # Allow HTTP on port 80
    ufw allow 80/tcp comment "Custom Dashboard HTTP"
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall configured - HTTP (80) and SSH allowed"
}

# Set up log rotation
setup_logging() {
    log "Setting up log rotation..."
    
    cat > "/etc/logrotate.d/$SERVICE_NAME" << EOF
/var/log/custom-dashboard/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 $APP_USER $APP_USER
    postrotate
        systemctl reload $SERVICE_NAME > /dev/null 2>&1 || true
    endscript
}
EOF
    
    log "Log rotation configured"
}

# Start services
start_services() {
    log "Starting services..."
    
    # Start PM2 as app user first
    sudo -u "$APP_USER" pm2 start "$APP_DIR/ecosystem.config.js"
    sudo -u "$APP_USER" pm2 save
    
    # Start systemd service
    systemctl start "$SERVICE_NAME"
    
    # Wait for service to start
    sleep 5
    
    # Check service status
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log "Service started successfully"
    else
        error "Service failed to start. Check logs: journalctl -u $SERVICE_NAME"
    fi
}

# Verify installation
verify_installation() {
    log "Verifying installation..."
    
    # Check if service is running
    if ! systemctl is-active --quiet "$SERVICE_NAME"; then
        error "Service is not running"
    fi
    
    # Check if port is listening
    sleep 3
    if ! netstat -tuln | grep -q ":80 "; then
        error "Application is not listening on port 80"
    fi
    
    # Test HTTP response
    if curl -f -s "http://localhost:80" > /dev/null; then
        log "HTTP server responding correctly"
    else
        warn "HTTP server not responding. Check application logs."
    fi
    
    log "Installation verification completed"
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    apt-get autoremove -y
    apt-get autoclean
    npm cache clean --force 2>/dev/null || true
}

# Print post-installation information
print_info() {
    echo
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    INSTALLATION COMPLETE                     ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}Dashboard URL:${NC} http://$(hostname -I | awk '{print $1}'):80"
    echo -e "${BLUE}Service Status:${NC} systemctl status $SERVICE_NAME"
    echo -e "${BLUE}Service Logs:${NC} journalctl -u $SERVICE_NAME -f"
    echo -e "${BLUE}PM2 Status:${NC} sudo -u $APP_USER pm2 status"
    echo -e "${BLUE}PM2 Logs:${NC} sudo -u $APP_USER pm2 logs"
    echo
    echo -e "${YELLOW}IMPORTANT NEXT STEPS:${NC}"
    echo "1. Edit configuration: nano $APP_DIR/.env"
    echo "2. Add your Supabase URL and API keys"
    echo "3. Restart service: systemctl restart $SERVICE_NAME"
    echo "4. Access dashboard at: http://your-server-ip:80"
    echo
    echo -e "${YELLOW}MANAGEMENT COMMANDS:${NC}"
    echo "• Start:   systemctl start $SERVICE_NAME"
    echo "• Stop:    systemctl stop $SERVICE_NAME"
    echo "• Restart: systemctl restart $SERVICE_NAME"
    echo "• Status:  systemctl status $SERVICE_NAME"
    echo "• Logs:    journalctl -u $SERVICE_NAME -f"
    echo
    echo -e "${GREEN}Installation completed successfully!${NC}"
    echo
}

# Main installation function
main() {
    log "Starting Custom Dashboard installation..."
    
    check_root
    check_requirements
    update_system
    install_nodejs
    create_user
    setup_application
    build_application
    create_environment
    setup_pm2
    create_service
    setup_firewall
    setup_logging
    start_services
    verify_installation
    cleanup
    print_info
    
    log "Installation completed successfully"
}

# Handle script interruption
trap 'error "Installation interrupted"' INT TERM

# Run main function
main "$@"