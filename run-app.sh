#!/bin/bash

#
# AI FreeBusy Calendar - Complete Setup and Start Script
# This script:
# 1. Prepares all environments (Node.js, npm dependencies, Python venv)
# 2. Sets up environment variables (.env files)
# 3. Starts three processes:
#    - Python Flask server (Google Calendar agent) in the background
#    - Express server (Node.js backend) in the background  
#    - React frontend (`npm run dev`) in the foreground
# When the foreground process is stopped (e.g., with Ctrl+C),
# the script automatically kills both background processes.
#
# Usage:
#   ./start.sh              # Full setup and start
#   ./start.sh --start-only # Skip setup, start services only
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -so, --start-only    Skip environment preparation and setup, start services only"
    echo "  -h, --help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0              # Full setup and start"
    echo "  $0 -so # Start services only (skip setup)"
}

# Parse command line arguments
START_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -so|--start-only)
            START_ONLY=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# --- Cleanup Function ---

# This function will be called when the script exits.
# Its purpose is to ensure all background processes are terminated.
cleanup() {
    echo # Add a newline for cleaner output
    echo "🔴 Terminating background processes..."
    
    # Check if the PYTHON_PID variable is set and not empty
    if [ -n "$PYTHON_PID" ]; then
        echo "   - Stopping Python server (PID: $PYTHON_PID)..."
        kill $PYTHON_PID > /dev/null 2>&1
        echo "   ✅ Python server stopped."
    fi
    
    # Check if the EXPRESS_PID variable is set and not empty
    if [ -n "$EXPRESS_PID" ]; then
        echo "   - Stopping Express server (PID: $EXPRESS_PID)..."
        kill $EXPRESS_PID > /dev/null 2>&1
        echo "   ✅ Express server stopped."
    fi
    
    echo "✅ All background processes have been stopped."
}

# --- Main Script ---

if [ "$START_ONLY" = true ]; then
    echo "🚀 AI FreeBusy Calendar - Start Services Only"
    echo "=================================================="
    print_warning "Skipping environment preparation and setup"
    echo
else
    echo "🚀 AI FreeBusy Calendar - Complete Setup and Start"
    echo "=================================================="
fi

# Set up a 'trap'. This command listens for signals that would cause the script to exit.
# When signals like INT (Interrupt, from Ctrl+C) or TERM (Terminate) are caught,
# the 'cleanup' function is executed before the script finally exits.
trap cleanup INT TERM EXIT

# --- Step 1: Environment Preparation (skip if --start-only) ---
if [ "$START_ONLY" = false ]; then
    print_status "Step 1: Preparing environments..."
    if [ -f "scripts/prepare.sh" ]; then
        print_status "Running prepare.sh..."
        chmod +x scripts/prepare.sh
        ./scripts/prepare.sh
        print_success "Environment preparation completed"
    else
        print_error "scripts/prepare.sh not found. Please ensure you're in the correct directory."
        exit 1
    fi

    echo

    # --- Step 2: Environment Variables Setup ---
    print_status "Step 2: Setting up environment variables..."
    if [ -f "scripts/create-env.sh" ]; then
        print_status "Running create-env.sh..."
        chmod +x scripts/create-env.sh
        ./scripts/create-env.sh
        print_success "Environment variables setup completed"
    else
        print_error "scripts/create-env.sh not found. Please ensure you're in the correct directory."
        exit 1
    fi

    echo
fi

# --- Step 3: Start Services ---
lsof -i :8000 -t | xargs -r kill && lsof -i :8090 -t | xargs -r kill

print_status "Step 3: Starting all services..."

# Start the Python Flask server in the background
print_status "Starting Python Flask server (Google Calendar agent) in the background..."
cd aifbc-google-calendar-agent && source .venv/bin/activate
python server.py &
PYTHON_PID=$!
print_success "Python server running with PID: $PYTHON_PID"
print_status "Python server should be available at: http://localhost:8090"
echo

# Start the Express server in the background
print_status "Starting Express server (Node.js backend) in the background..."
cd ../aifbc-agent
npm start &
EXPRESS_PID=$!
print_success "Express server running with PID: $EXPRESS_PID"
print_status "Express server should be available at: http://localhost:8000"
echo

# Wait a moment for servers to start up
print_status "Waiting for servers to initialize..."
sleep 3
echo

# Start the React frontend in the foreground
print_status "Starting React frontend in the foreground..."
echo "   (Press Ctrl+C to stop all processes)"
echo "=================================================="
cd ../aifbc-frontend
npm run dev

# This final line is usually only reached if `npm run dev` exits on its own
# without a signal (which is less common for development servers).
# The 'trap' on EXIT will still ensure the cleanup function is called.
echo "=================================================="
print_success "Frontend process has finished. Script is exiting."