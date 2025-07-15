#!/bin/bash

# Set directory to script's location
cd "$(dirname "$0")"

# Load environment variables if .env file exists
if [ -f ../.env ]; then
  source ../.env
fi

# Check for Supabase credentials and set defaults if needed
if [ -z "$VITE_SUPABASE_URL" ]; then
  export VITE_SUPABASE_URL="https://yjjvppiknlutenhoonqh.supabase.co"
  echo "Setting default Supabase URL: $VITE_SUPABASE_URL"
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqanZwcGlrbmx1dGVuaG9vbnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIzODQsImV4cCI6MjA2ODE4ODM4NH0.1xxIerxoOM89NIjEHQEjp_d1Nv4ncqhVCPSt0fP7cD4"
  echo "Setting default Supabase Anon Key"
fi

# Step 1: Deploy SQL schema to Supabase
echo "Step 1: Deploying SQL schema to Supabase directly..."
chmod +x ./deploy-sql-direct.sh
./deploy-sql-direct.sh

# Step 2: Create admin user and initial data in Supabase
echo "Step 2: Creating admin user and initial data in Supabase..."
chmod +x ./create-admin-data.sh
./create-admin-data.sh

echo "All setup scripts completed."
echo "You can now log in with:"
echo "Username: Administrador"
echo "Email: administrador@techsuptet.com"
echo "Password: manukas1993"