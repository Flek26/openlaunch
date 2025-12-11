#!/bin/bash
#
# OpenLaunch Kiosk Startup Script
# Starts the radar server and launches Chromium in kiosk mode
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PORT=8080
HOST="localhost"
MOCK_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mock|-m)
            MOCK_MODE=true
            shift
            ;;
        --port|-p)
            PORT="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[OpenLaunch]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[OpenLaunch]${NC} $1"
}

error() {
    echo -e "${RED}[OpenLaunch]${NC} $1"
}

cleanup() {
    log "Shutting down..."
    if [ -n "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    if [ -n "$BROWSER_PID" ]; then
        kill $BROWSER_PID 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

cd "$PROJECT_DIR"

# Check if venv exists
if [ ! -d ".venv" ]; then
    error "Virtual environment not found. Run: uv venv && uv pip install -e '.[ui]'"
    exit 1
fi

# Activate venv
source .venv/bin/activate

# Check if UI is built
if [ ! -d "ui/dist" ]; then
    warn "UI not built. Building now..."
    cd ui
    npm install
    npm run build
    cd ..
fi

# Start the server
if [ "$MOCK_MODE" = true ]; then
    log "Starting OpenLaunch server on port $PORT (MOCK MODE)..."
    openlaunch-server --web-port $PORT --mock &
else
    log "Starting OpenLaunch server on port $PORT..."
    openlaunch-server --web-port $PORT &
fi
SERVER_PID=$!

# Wait for server to be ready
log "Waiting for server to start..."
for i in {1..30}; do
    if curl -s "http://$HOST:$PORT" > /dev/null 2>&1; then
        break
    fi
    sleep 0.5
done

if ! curl -s "http://$HOST:$PORT" > /dev/null 2>&1; then
    error "Server failed to start"
    cleanup
    exit 1
fi

log "Server is running!"

# Launch browser in kiosk mode
log "Launching kiosk browser..."

# Try different browsers in order of preference
# DISPLAY=:0 allows running on Pi's display when SSHed in
if command -v chromium-browser &> /dev/null; then
    DISPLAY=:0 chromium-browser --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble "http://$HOST:$PORT" &
    BROWSER_PID=$!
elif command -v chromium &> /dev/null; then
    DISPLAY=:0 chromium --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble "http://$HOST:$PORT" &
    BROWSER_PID=$!
elif command -v google-chrome &> /dev/null; then
    DISPLAY=:0 google-chrome --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble "http://$HOST:$PORT" &
    BROWSER_PID=$!
elif command -v firefox &> /dev/null; then
    DISPLAY=:0 firefox --kiosk "http://$HOST:$PORT" &
    BROWSER_PID=$!
else
    warn "No supported browser found. Open http://$HOST:$PORT manually."
    warn "Supported browsers: chromium-browser, chromium, google-chrome, firefox"
fi

log "OpenLaunch is running! Press Ctrl+C to stop."

# Wait for server process
wait $SERVER_PID
