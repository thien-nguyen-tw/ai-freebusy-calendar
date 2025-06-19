#!/bin/bash

#
# A simple script for macOS to create a .env file in a specified project directory.
#

# --- Functions ---

# Function to display a separator line for better readability
print_separator() {
  echo "--------------------------------------------------"
}

# --- Main Script ---

echo "👋 Welcome to the .env file creator script!"
print_separator

# 1. CHOOSE PROJECT
echo "Please choose a project:"
echo "  1) aifbc-agent"
echo "  2) aifbc-frontend"
echo

# Read user input for the project choice
read -p "Enter the number of your choice: " project_choice

# Determine the project directory based on the user's choice
case $project_choice in
  1)
    PROJECT_DIR="./aifbc-agent"
    ;;
  2)
    PROJECT_DIR="./aifbc-frontend"
    ;;
  *)
    echo "❌ Invalid choice. Please run the script again and select either 1 or 2."
    exit 1
    ;;
esac

echo "✅ Project selected: $PROJECT_DIR"
print_separator

# Create the project directory if it doesn't already exist.
# The -p flag ensures that no error is thrown if the directory already exists.
mkdir -p "$PROJECT_DIR"

# Define the full path for the .env file
ENV_FILE="$PROJECT_DIR/.env"

echo "📝 We will now write to the file: $ENV_FILE"
echo "Any existing content in this file will be cleared."
print_separator

# Clear the .env file to start fresh. The '>' operator creates the file or overwrites it.
> "$ENV_FILE"

# 2. INPUT KEY-VALUE PAIRS
while true; do
  # Prompt for the key name
  read -p "Enter the key name (e.g. ONE_KEY) (or enter 'e' to exit): " key

  # Check if the user wants to exit the loop
  if [[ "$key" == "e" || "$key" == "E" ]]; then
    break
  fi

  # Check if the key is empty
  if [[ -z "$key" ]]; then
      echo "⚠️ Key cannot be empty. Please try again."
      continue
  fi

  # Prompt for the value
  read -p "Enter the value for '$key': " value

  # Append the key-value pair to the .env file in the format KEY="VALUE"
  # Quoting the value ensures that spaces or special characters are handled correctly.
  echo "$key=$value" >> "$ENV_FILE"
  echo "   -> Added: $key=\"$value\""
  echo # Add a newline for spacing
done

print_separator
echo "🎉 All done! Your .env file has been created/updated at:"
echo "   $ENV_FILE"
echo
echo "Exiting script. Goodbye!"

