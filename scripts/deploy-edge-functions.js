import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
if (!SUPABASE_PROJECT_ID) {
  console.error('Missing SUPABASE_PROJECT_ID environment variable');
  process.exit(1);
}

// Directory containing the edge functions
const edgeFunctionsDir = path.join(process.cwd(), 'src', 'lib', 'edge-functions');

// Ensure the directory exists
if (!fs.existsSync(edgeFunctionsDir)) {
  console.error(`Edge functions directory not found at: ${edgeFunctionsDir}`);
  process.exit(1);
}

// Get all JS files in the edge functions directory
const edgeFunctionFiles = fs.readdirSync(edgeFunctionsDir)
  .filter(file => file.endsWith('.js'));

if (edgeFunctionFiles.length === 0) {
  console.error('No edge function files found');
  process.exit(1);
}

console.log('Deploying edge functions to Supabase...');

// Deploy each edge function
for (const file of edgeFunctionFiles) {
  const functionName = path.basename(file, '.js');
  const filePath = path.join(edgeFunctionsDir, file);
  
  try {
    console.log(`Deploying ${functionName}...`);
    
    // Create a temporary directory for the function
    const tempDir = path.join(process.cwd(), 'temp', functionName);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Copy the function file to the temp directory
    fs.copyFileSync(filePath, path.join(tempDir, 'index.js'));
    
    // Deploy the function using Supabase CLI
    execSync(`npx supabase functions deploy ${functionName} --project-ref ${SUPABASE_PROJECT_ID}`, {
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    console.log(`Successfully deployed edge function: ${functionName}`);
    
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error(`Error deploying ${functionName}:`, error.message);
  }
}

console.log('Edge function deployment completed');