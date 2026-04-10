#!/bin/bash
set -e

echo "=== Solar Dashboard Server Setup ==="

# Install Python 3.12
echo "[1/7] Installing Python..."
sudo apt update -qq
sudo apt install -y -qq software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update -qq
sudo apt install -y -qq python3.12 python3.12-venv python3.12-dev git

# Create user
echo "[2/7] Creating solar user..."
sudo useradd -r -s /bin/false -m -d /opt/solar-dashboard solar 2>/dev/null || true

# Setup app directory
echo "[3/7] Setting up app directory..."
sudo mkdir -p /opt/solar-dashboard/data
sudo cp -r /tmp/solar-deploy/* /opt/solar-dashboard/
sudo chown -R solar:solar /opt/solar-dashboard

# Clone anker-solix-api
echo "[4/7] Cloning anker-solix-api..."
sudo -u solar git clone https://github.com/thomluther/anker-solix-api.git /opt/solar-dashboard/anker-solix-api 2>/dev/null || \
    (cd /opt/solar-dashboard/anker-solix-api && sudo -u solar git pull)

# Create venv and install dependencies
echo "[5/7] Installing Python dependencies..."
sudo -u solar python3.12 -m venv /opt/solar-dashboard/venv
sudo -u solar /opt/solar-dashboard/venv/bin/pip install -q -r /opt/solar-dashboard/requirements.txt

# Install systemd service
echo "[6/7] Installing systemd service..."
sudo cp /opt/solar-dashboard/deploy/solar-dashboard.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable solar-dashboard

# Open firewall
echo "[7/7] Opening firewall port 8420..."
sudo iptables -I INPUT -p tcp --dport 8420 -j ACCEPT
sudo apt install -y -qq iptables-persistent
sudo netfilter-persistent save

# Check .env
if [ ! -f /opt/solar-dashboard/.env ] || grep -q "example.com" /opt/solar-dashboard/.env; then
    echo ""
    echo "!!! WICHTIG: .env Datei bearbeiten !!!"
    echo "sudo nano /opt/solar-dashboard/.env"
    echo "Trage deine Anker-Zugangsdaten ein, dann:"
    echo "sudo systemctl start solar-dashboard"
else
    sudo systemctl start solar-dashboard
    echo ""
    echo "=== Solar Dashboard laeuft! ==="
    IP=$(curl -s ifconfig.me)
    echo "Dashboard: http://${IP}:8420"
fi
