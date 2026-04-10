#!/bin/bash
set -e

# Usage: ./deploy/deploy.sh <SERVER-IP> [SSH-KEY-PATH]
# Example: ./deploy/deploy.sh 129.151.xxx.xxx ~/.ssh/oracle_key

if [ -z "$1" ]; then
    echo "Usage: ./deploy/deploy.sh <SERVER-IP> [SSH-KEY-PATH]"
    echo "Example: ./deploy/deploy.sh 129.151.42.100 ~/.ssh/oracle_key"
    exit 1
fi

SERVER="$1"
KEY="${2:-~/.ssh/id_rsa}"
USER="ubuntu"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Deploying Solar Dashboard to ${SERVER} ==="

# Upload app files (excluding venv, db, git)
echo "[1/3] Uploading files..."
ssh -i "$KEY" "${USER}@${SERVER}" "sudo rm -rf /tmp/solar-deploy && mkdir -p /tmp/solar-deploy"

rsync -avz --progress \
    --exclude='venv/' \
    --exclude='data/*.db' \
    --exclude='data/*.log' \
    --exclude='.git/' \
    --exclude='anker-solix-api/' \
    --exclude='__pycache__/' \
    --exclude='.DS_Store' \
    -e "ssh -i $KEY" \
    "${APP_DIR}/" "${USER}@${SERVER}:/tmp/solar-deploy/"

# Run setup
echo "[2/3] Running setup on server..."
ssh -i "$KEY" "${USER}@${SERVER}" "chmod +x /tmp/solar-deploy/deploy/setup.sh && sudo bash /tmp/solar-deploy/deploy/setup.sh"

# Status check
echo "[3/3] Checking status..."
ssh -i "$KEY" "${USER}@${SERVER}" "sudo systemctl status solar-dashboard --no-pager || true"

echo ""
echo "=== Done! ==="
echo "Dashboard: http://${SERVER}:8420"
echo ""
echo "Logs: ssh -i $KEY ${USER}@${SERVER} 'sudo journalctl -u solar-dashboard -f'"
