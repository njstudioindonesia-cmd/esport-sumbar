#!/usr/bin/env bash
# ==============================================================================
# ESPORT SUMBAR v2 - VPS Bootstrap & Server Hardening Script
# Target: Ubuntu 22.04 / 24.04 LTS (4 vCPU / 8 GB VPS)
# Configures: Docker, UFW, Fail2ban, 4GB Swap, Non-root user, Kernel tuning
# ==============================================================================

set -euo pipefail

# ANSI Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 1. Root check
if [ "$(id -u)" -ne 0 ]; then
  log_error "This script must be run as root (or with sudo)."
  exit 1
fi

log_info "=== Starting ESPORT SUMBAR Server Bootstrap ==="

# 2. System update
log_info "Updating package lists and upgrading system packages..."
apt-get update && apt-get upgrade -y
apt-get install -y --no-install-recommends \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  ufw \
  fail2ban \
  htop \
  git \
  unzip \
  jq \
  tar

# 3. Swap Creation (4GB swapfile for 8GB VPS resilience)
if [ ! -f /swapfile ]; then
  log_info "Creating 4GB swap space to prevent Out-Of-Memory spikes..."
  fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  log_success "Swap allocated and enabled."
else
  log_warn "Swapfile already exists. Skipping allocation."
fi

# Sysctl Tuning (swappiness & file descriptors)
cat <<EOF > /etc/sysctl.d/99-esport-sumbar.conf
vm.swappiness=10
vm.vfs_cache_pressure=50
vm.max_map_count=262144
fs.file-max=2097152
net.core.somaxconn=1024
EOF
sysctl --system > /dev/null 2>&1
log_success "Kernel parameters tuned."

# 4. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
  log_info "Installing official Docker Engine and Docker Compose plugin..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  log_success "Docker installed successfully."
else
  log_warn "Docker is already installed. Skipping."
fi

# 5. Non-root Deployer User Setup
DEPLOY_USER="${DEPLOY_USER:-deployer}"
if ! id "$DEPLOY_USER" &> /dev/null; then
  log_info "Creating deployment user: $DEPLOY_USER"
  useradd -m -s /bin/bash -G sudo,docker "$DEPLOY_USER"
  
  # Copy authorized_keys from root if present
  if [ -f /root/.ssh/authorized_keys ]; then
    mkdir -p "/home/$DEPLOY_USER/.ssh"
    cp /root/.ssh/authorized_keys "/home/$DEPLOY_USER/.ssh/"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
    chmod 700 "/home/$DEPLOY_USER/.ssh"
    chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
    log_success "SSH keys copied from root to $DEPLOY_USER"
  fi
  
  # Passwordless sudo for deployment automation
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/$DEPLOY_USER"
  chmod 440 "/etc/sudoers.d/$DEPLOY_USER"
else
  log_warn "User $DEPLOY_USER already exists. Ensuring docker group membership..."
  usermod -aG docker "$DEPLOY_USER"
fi

# 6. Firewall Configuration (UFW)
log_info "Configuring UFW Firewall (SSH, HTTP, HTTPS only)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP Let Encrypt'
ufw allow 443/tcp comment 'HTTPS Caddy'
ufw --force enable
log_success "UFW firewall active and configured."

# 7. Fail2ban Configuration
log_info "Enabling Fail2ban for SSH protection..."
cat <<EOF > /etc/fail2ban/jail.local
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port    = ssh
EOF
systemctl restart fail2ban
systemctl enable fail2ban
log_success "Fail2ban enabled."

# 8. Create Application Target Directory
APP_DIR="/opt/esport-sumbar"
mkdir -p "$APP_DIR"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"
chmod 755 "$APP_DIR"
log_success "Application directory created at $APP_DIR"

log_info "=== Server Bootstrap Completed Successfully! ==="
echo ""
echo "Next steps:"
echo "1. Log in as deployer: ssh $DEPLOY_USER@<SERVER_IP>"
echo "2. Clone or rsync repo into: $APP_DIR"
echo "3. Copy .env.production into $APP_DIR/.env (chmod 600)"
echo "4. Run: bash infra/scripts/deploy.sh"
