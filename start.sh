#!/bin/bash

#
# This script starts two Node.js processes.
# 1. `npm start` is run in the background.
# 2. `npm run dev` is run in the foreground.
# When the foreground process (`npm run dev`) is stopped (e.g., with Ctrl+C),
# the script automatically kills the background process (`npm start`).
#

# --- Cleanup Function ---

# This function will be called when the script exits.
# Its purpose is to ensure the background process is terminated.
cleanup() {
    echo # Add a newline for cleaner output
    echo "🔴 Terminating background process..."
    # Check if the CHILD_PID variable is set and not empty
    if [ -n "$CHILD_PID" ]; then
        # Kill the process with the stored PID.
        # The 'kill' command sends a termination signal.
        # The output is redirected to /dev/null to suppress "Terminated" messages.
        kill $CHILD_PID > /dev/null 2>&1
        echo "✅ Background process (PID: $CHILD_PID) has been stopped."
    fi
}

# --- Main Script ---

echo "🚀 Starting Node.js processes..."
echo "--------------------------------------------------"

# Set up a 'trap'. This command listens for signals that would cause the script to exit.
# When signals like INT (Interrupt, from Ctrl+C) or TERM (Terminate) are caught,
# the 'cleanup' function is executed before the script finally exits.
trap cleanup INT TERM EXIT

# Start the first process (`npm start`) in the background.
# The '&' at the end tells the shell to run the command in the background.
echo "-> Starting 'npm start' in the background..."
cd aifbc-agent && npm start &

# Immediately after starting the background process, its Process ID (PID) is
# captured into the CHILD_PID variable. '$!' is a special shell variable
# that holds the PID of the most recently executed background command.
CHILD_PID=$!
echo "   - Background process running with PID: $CHILD_PID"
echo

# Start the second process (`npm run dev`) in the foreground.
# The script will pause here and give control to this command.
# It will only continue once `npm run dev` has finished or been terminated.
echo "-> Starting 'npm run dev' in the foreground..."
echo "   (Press Ctrl+C to stop both processes)"
echo "--------------------------------------------------"
cd aifbc-frontend && npm run dev

# This final line is usually only reached if `npm run dev` exits on its own
# without a signal (which is less common for development servers).
# The 'trap' on EXIT will still ensure the cleanup function is called.
echo "--------------------------------------------------"
echo "🎉 Foreground process has finished. Script is exiting."