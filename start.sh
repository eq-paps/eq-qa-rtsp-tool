#!/usr/bin/env bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

function info() { echo -e "${BLUE}ℹ${NC}  $1"; }
function success() { echo -e "${GREEN}✔${NC}  $1"; }

echo -e "${GREEN}RTSP Stream Tool — Starting...${NC}"
echo

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "Docker doesn't seem to be running. Please open Docker Desktop first, then try again."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "No .env file found. Please create one first (see README for instructions)."
    exit 1
fi

info "Building and starting containers..."
docker compose up --build -d

echo
success "All services are running!"
echo
info "Open your browser to: http://localhost:5173"
echo
info "When you're done, run: ./stop.sh"
