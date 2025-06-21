#!/bin/bash

#
# Script to create .env files for all AI FreeBusy Calendar projects
# with GEMINI_API_KEY and GOOGLE_API_KEY
#

# --- Functions ---

# Function to display a separator line for better readability
print_separator() {
  echo "--------------------------------------------------"
}

# Function to read existing value from .env file
get_existing_value() {
  local env_file="$1"
  local key="$2"
  
  if [[ -f "$env_file" ]]; then
    grep "^${key}=" "$env_file" | cut -d'=' -f2- | tr -d '"' | tr -d "'"
  else
    echo ""
  fi
}

# Function to create .env file for a project
create_env_file() {
  local project_dir="$1"
  local env_file="$project_dir/.env"
  
  echo "📝 Creating .env file for: $project_dir"
  
  # Create the project directory if it doesn't exist
  mkdir -p "$project_dir"
  
  # Check if .env file already exists
  if [[ -f "$env_file" ]]; then
    echo "   ℹ️  .env file already exists"
    
    # Read existing values
    local existing_gemini=$(get_existing_value "$env_file" "GEMINI_API_KEY")
    local existing_google=$(get_existing_value "$env_file" "GOOGLE_API_KEY")
    
    # Use existing values if new ones are not provided
    if [[ -n "$existing_gemini" && -z "$GEMINI_API_KEY" ]]; then
      GEMINI_API_KEY="$existing_gemini"
      echo "   🔄 Using existing GEMINI_API_KEY: ${existing_gemini:0:10}..."
    fi
    
    if [[ -n "$existing_google" && -z "$GOOGLE_API_KEY" ]]; then
      GOOGLE_API_KEY="$existing_google"
      echo "   🔄 Using existing GOOGLE_API_KEY: ${existing_google:0:10}..."
    fi
  fi
  
  # Clear the .env file to start fresh
  > "$env_file"
  
  # Add the API keys to the .env file
  echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> "$env_file"
  echo "GOOGLE_API_KEY=$GOOGLE_API_KEY" >> "$env_file"
  
  echo "✅ Created: $env_file"
}

# --- Main Script ---

echo "🚀 AI FreeBusy Calendar Environment Setup"
print_separator
echo "This script will create .env files for all projects with your API keys."
echo "You can press Enter to skip and keep existing values (if any)."
echo

# Check if any .env files exist
env_files_exist=false
for project in "./aifbc-agent" "./aifbc-frontend" "./aifbc-google-calendar-agent"; do
  if [[ -f "$project/.env" ]]; then
    env_files_exist=true
    break
  fi
done

if [[ "$env_files_exist" == true ]]; then
  echo "📁 Found existing .env files. You can skip input to preserve current values."
  echo
fi

# 1. GET GEMINI API KEY
echo "🔑 Step 1: Gemini API Key"
echo "Get your Gemini API key from: https://makersuite.google.com/app/apikey"
read -p "Enter your GEMINI_API_KEY (or press Enter to skip): " GEMINI_API_KEY

# Check if user wants to skip
if [[ -z "$GEMINI_API_KEY" ]]; then
  echo "⏭️  Skipping Gemini API Key input"
  GEMINI_API_KEY=""  # Will be filled from existing .env files if available
else
  echo "✅ Gemini API Key received"
fi

print_separator

# 2. GET GOOGLE API KEY
echo "🔑 Step 2: Google API Key"
echo "Get your Google API key from: https://console.cloud.google.com/apis/credentials"
read -p "Enter your GOOGLE_API_KEY (or press Enter to skip): " GOOGLE_API_KEY

# Check if user wants to skip
if [[ -z "$GOOGLE_API_KEY" ]]; then
  echo "⏭️  Skipping Google API Key input"
  GOOGLE_API_KEY=""  # Will be filled from existing .env files if available
else
  echo "✅ Google API Key received"
fi

print_separator

# 3. CREATE .ENV FILES FOR ALL PROJECTS
echo "📁 Creating .env files for all projects..."
echo

# Create .env file for aifbc-agent
create_env_file "./aifbc-agent"

# Create .env file for aifbc-frontend
create_env_file "./aifbc-frontend"

# Create .env file for aifbc-google-calendar-agent
create_env_file "./aifbc-google-calendar-agent"

print_separator
echo "🎉 Environment setup complete!"
echo

# Show what was used for each project
echo "Summary of .env files created:"
for project in "./aifbc-agent" "./aifbc-frontend" "./aifbc-google-calendar-agent"; do
  env_file="$project/.env"
  if [[ -f "$env_file" ]]; then
    echo "   📄 $project/.env"
    gemini_key=$(get_existing_value "$env_file" "GEMINI_API_KEY")
    google_key=$(get_existing_value "$env_file" "GOOGLE_API_KEY")
    
    if [[ -n "$gemini_key" ]]; then
      echo "      • GEMINI_API_KEY: ${gemini_key:0:10}..."
    else
      echo "      • GEMINI_API_KEY: (not set)"
    fi
    
    if [[ -n "$google_key" ]]; then
      echo "      • GOOGLE_API_KEY: ${google_key:0:10}..."
    else
      echo "      • GOOGLE_API_KEY: (not set)"
    fi
  fi
done

echo
echo "Next steps:"
echo "   1. Download credentials.json from Google Cloud Console"
echo "   2. Place it in ./aifbc-google-calendar-agent/"
echo "   3. Run ./start.sh to start all services"
echo
echo "Exiting script. Goodbye! 👋"

