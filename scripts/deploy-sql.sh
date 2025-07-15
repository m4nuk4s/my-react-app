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

# Install dependencies if needed
if [ ! -d "node_modules/@supabase" ]; then
  echo "Installing Supabase dependencies..."
  pnpm add @supabase/supabase-js
fi

# Run the schema deployment script
echo "Deploying schema to Supabase..."
node scripts/deploy-sql.js