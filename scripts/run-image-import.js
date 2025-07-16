// This script runs the necessary steps to import all driver data and images to Supabase

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Direct way to load env vars
const envPath = path.resolve(process.cwd(), '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    acc[match[1]] = match[2];
  }
  return acc;
}, {});

// Initialize Supabase client
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseAnonKey ? "****" + supabaseAnonKey.slice(-4) : "missing");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase credentials. Check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  try {
    console.log("Starting driver import process...");
    
    // Step 1: Save driver data to Supabase
    console.log("Step 1: Importing driver data to Supabase...");
    await execAsync('node save-drivers-to-supabase.js');
    
    // Step 2: Copy images to public folder and update image URLs in Supabase
    console.log("Step 2: Processing driver images...");
    await execAsync('node upload-driver-images.js');
    
    // Step 3: Run the stored procedure to import into app-specific table
    console.log("Step 3: Importing data to app-specific table...");
    await supabase.rpc('app_8e3e8a4d8d0e442280110fd6f6c2cd95_import_drivers');
    
    console.log("✅ Driver import completed successfully!");
  } catch (error) {
    console.error("Error in import process:", error);
  }
}

main();