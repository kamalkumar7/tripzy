#!/bin/bash

# Tripzy - Start both backend and frontend from root directory
# Usage: bash start.sh

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Starting Tripzy...${NC}"
echo ""

# Check .env exists
if [ ! -f "$ROOT_DIR/.env" ]; then
  echo -e "${RED}❌ .env file not found in $ROOT_DIR${NC}"
  exit 1
fi

# Export .env variables so both processes inherit them
# (safe parsing — handles unquoted values with spaces, comments, blank lines)
while IFS= read -r line || [ -n "$line" ]; do
  # Strip carriage returns (Windows line endings)
  line="${line//$'\r'/}"
  # Skip blank lines and comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  # Extract key and value
  key="${line%%=*}"
  value="${line#*=}"
  export "$key=$value"
done < "$ROOT_DIR/.env"
echo -e "${GREEN}✅ Loaded .env${NC}"

# --- Start Backend ---
echo -e "${YELLOW}⚙️  Starting Flask backend...${NC}"
cd "$ROOT_DIR/backend"

# Activate venv if it exists
if [ -d "venv" ]; then
  source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
  echo -e "${GREEN}✅ Activated backend venv${NC}"
elif [ -d "$ROOT_DIR/venv" ]; then
  source "$ROOT_DIR/venv/bin/activate" 2>/dev/null || source "$ROOT_DIR/venv/Scripts/activate" 2>/dev/null
  echo -e "${GREEN}✅ Activated root venv${NC}"
fi

python app.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend running (PID: $BACKEND_PID)${NC}"

# --- Start Frontend ---
echo -e "${YELLOW}⚙️  Starting Next.js frontend...${NC}"
cd "$ROOT_DIR/frontend/tripzy"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend running (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Tripzy is running!${NC}"
echo -e "${CYAN}  Backend:  http://localhost:${FLASK_PORT:-5000}${NC}"
echo -e "${CYAN}  Frontend: http://localhost:3000${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${YELLOW}  Press Ctrl+C to stop both servers${NC}"
echo ""

# Cleanup function to kill both on exit
cleanup() {
  echo ""
  echo -e "${RED}🛑 Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID 2>/dev/null
  wait $FRONTEND_PID 2>/dev/null
  echo -e "${GREEN}✅ Both servers stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
