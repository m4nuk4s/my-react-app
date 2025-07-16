#!/bin/bash

# Set directory to script's location
cd "$(dirname "$0")"

# Load environment variables if .env file exists
if [ -f ../.env ]; then
  source ../.env
fi

# Check if VITE_SUPABASE_URL is set in environment
if [ -z "$VITE_SUPABASE_URL" ]; then
  export VITE_SUPABASE_URL="https://yjjvppiknlutenhoonqh.supabase.co"
  echo "Setting default Supabase URL: $VITE_SUPABASE_URL"
fi

# Check if VITE_SUPABASE_ANON_KEY is set in environment
if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqanZwcGlrbmx1dGVuaG9vbnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIzODQsImV4cCI6MjA2ODE4ODM4NH0.1xxIerxoOM89NIjEHQEjp_d1Nv4ncqhVCPSt0fP7cD4"
  echo "Setting default Supabase Anon Key"
fi

# Deploy SQL schema to Supabase
echo "Deploying schema to Supabase directly..."
node --experimental-modules deploy-sql-direct.js

exit 0