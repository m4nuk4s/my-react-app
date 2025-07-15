#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules/@supabase" ]; then
  echo "Installing Supabase dependencies..."
  pnpm add @supabase/supabase-js
fi

# Get custom username and password from command line arguments
USERNAME=${1:-"admin"}
PASSWORD=${2:-"admin123"}

# Run the admin creation script
echo "Creating admin user in Supabase with username: $USERNAME..."
node scripts/create-admin-user.js "$USERNAME" "$PASSWORD"