#!/usr/bin/env bash
set -euo pipefail

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

function info() { echo -e "${BLUE}ℹ${NC}  $1"; }
function success() { echo -e "${GREEN}✔${NC}  $1"; }

echo -e "${GREEN}RTSP Stream Tool — Stopping...${NC}"
echo

info "Stopping containers..."
docker compose down

echo
success "All services stopped."
echo "To start again, run: ./start.sh"
