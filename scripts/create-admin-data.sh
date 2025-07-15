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

# Check if environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ] ||
   [ "$VITE_SUPABASE_URL" = "https://supabase-project-url.supabase.co" ] ||
   [ "$VITE_SUPABASE_ANON_KEY" = "your-supabase-anon-key" ]; then
  echo "Error: Supabase URL and/or anon key not configured properly."
  echo "Please update the .env file with your Supabase credentials."
  exit 1
fi

# Get custom username and password from command line arguments
USERNAME=${1:-"Administrador"}
PASSWORD=${2:-"manukas1993"}

# Install dependencies if needed
if [ ! -d "node_modules/@supabase" ]; then
  echo "Installing Supabase dependencies..."
  pnpm add @supabase/supabase-js
fi

# Run the admin data creation script
echo "Creating admin user and initial data in Supabase..."
echo "Username: $USERNAME"
echo "Email: ${USERNAME,,}@techsuptet.com"

node scripts/create-admin-data.js "$USERNAME" "$PASSWORD"