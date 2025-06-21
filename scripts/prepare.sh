#!/bin/bash

#
# AI FreeBusy Calendar - Environment Preparation Script
# This script prepares all environments needed for the project:
# 1. Check Node.js version (>=18 on macOS)
# 2. Install npm dependencies for all Node.js projects
# 3. Create and setup Python virtual environment
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

echo "🚀 AI FreeBusy Calendar - Environment Preparation"
echo "=================================================="

# --- 1. Check Node.js Version ---
print_status "Checking Node.js version..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    print_status "You can install it using Homebrew: brew install node"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18 or higher."
    print_status "You can upgrade using Homebrew: brew upgrade node"
    exit 1
fi

print_success "Node.js version $NODE_VERSION is compatible (>=18)"

# Check npm version
NPM_VERSION=$(npm --version)
print_success "npm version $NPM_VERSION"

echo

# --- 2. Install npm dependencies for all Node.js projects ---
print_status "Installing npm dependencies for all Node.js projects..."

# Frontend dependencies
print_status "Installing frontend dependencies..."
cd aifbc-frontend
if [ -f "package-lock.json" ]; then
    print_status "Using package-lock.json for faster installation..."
    npm ci
else
    print_status "Installing dependencies..."
    npm ci
fi
print_success "Frontend dependencies installed"
cd ..

# Agent dependencies
print_status "Installing agent dependencies..."
cd aifbc-agent
if [ -f "package-lock.json" ]; then
    print_status "Using package-lock.json for faster installation..."
    npm ci
else
    print_status "Installing dependencies..."
    npm ci
fi
print_success "Agent dependencies installed"
cd ..

echo

# --- 3. Python Virtual Environment Setup ---
print_status "Setting up Python virtual environment..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    print_status "You can install it using Homebrew: brew install python"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
print_success "Python version $PYTHON_VERSION found"

cd aifbc-google-calendar-agent

# Check if virtual environment already exists
if [ -d ".venv" ]; then
    print_warning "Virtual environment already exists. Removing old one..."
    rm -rf .venv
fi

# Create virtual environment
print_status "Creating virtual environment..."
python3 -m venv .venv
print_success "Virtual environment created"

# Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."
source .venv/bin/activate

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install requirements
print_status "Installing requirements from requirements.txt..."
pip install -r requirements.txt
print_success "Python dependencies installed"

# Deactivate virtual environment
deactivate

cd ..

echo

# --- 4. Final Status Check ---
print_status "Performing final status check..."

# Check if all required files exist
if [ -f "aifbc-frontend/node_modules/.package-lock.json" ] || [ -d "aifbc-frontend/node_modules" ]; then
    print_success "Frontend dependencies ✓"
else
    print_error "Frontend dependencies not found"
fi

if [ -f "aifbc-agent/node_modules/.package-lock.json" ] || [ -d "aifbc-agent/node_modules" ]; then
    print_success "Agent dependencies ✓"
else
    print_error "Agent dependencies not found"
fi

if [ -d "aifbc-google-calendar-agent/.venv" ]; then
    print_success "Python virtual environment ✓"
else
    print_error "Python virtual environment not found"
fi

echo
echo "=================================================="
print_success "Environment preparation completed successfully!"
echo
print_status "Next steps:"
echo "  1. Run './create-env.sh' to set up environment variables"
echo "  2. Run './start.sh' to start all services"
echo
print_status "Service URLs (after starting):"
echo "  - Frontend: http://localhost:5173"
echo "  - Express API: http://localhost:8000"
echo "  - Python API: http://localhost:8090"
echo 