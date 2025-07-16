// fix-downloadurl-column.js
// Script to fix the downloadUrl vs download_url column issue in the Supabase database

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

// Initialize Supabase client
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey ? "****" + supabaseKey.slice(-4) : "missing");

async function checkTables() {
  console.log("=== Checking Tables Structure ===");
  
  try {
    // Get columns for drivers table
    const { data: driversColumns, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .limit(1);
      
    if (driversError) {
      console.error("Error accessing drivers table:", driversError);
      return;
    }
    
    if (driversColumns && driversColumns.length > 0) {
      const driverSample = driversColumns[0];
      console.log("Driver table columns:", Object.keys(driverSample).join(", "));
      
      // Check if we have the right columns
      const hasDownloadUrl = 'downloadUrl' in driverSample;
      const hasDownload_url = 'download_url' in driverSample;
      const hasImageUrl = 'imageUrl' in driverSample;
      const hasImage_url = 'image_url' in driverSample;
      
      console.log(`Column check - downloadUrl: ${hasDownloadUrl}, download_url: ${hasDownload_url}, imageUrl: ${hasImageUrl}, image_url: ${hasImage_url}`);
    }
    
    // Get columns for app drivers table
    const { data: appColumns, error: appError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .select('*')
      .limit(1);
      
    if (appError) {
      console.error("Error accessing app drivers table:", appError);
    } else if (appColumns && appColumns.length > 0) {
      const appSample = appColumns[0];
      console.log("App drivers table columns:", Object.keys(appSample).join(", "));
    } else {
      console.log("App drivers table exists but is empty");
    }
    
  } catch (error) {
    console.error("Error checking tables:", error);
  }
}

async function fixN17Driver() {
  console.log("\n=== Fixing N17V2C4WH128 Driver ===");
  
  try {
    // Find the N17 driver in the main table
    const { data: n17Driver, error: fetchError } = await supabase
      .from('drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
      
    if (fetchError) {
      console.error("Error fetching N17 driver:", fetchError);
      return;
    }
    
    console.log("Found N17 driver:", n17Driver.name);
    console.log("Driver details:", {
      id: n17Driver.id,
      name: n17Driver.name,
      download_url: n17Driver.download_url || 'missing',
      downloadUrl: n17Driver.downloadUrl || 'missing',
      image_url: n17Driver.image_url || 'missing',
      imageUrl: n17Driver.imageUrl || 'missing'
    });
    
    // Insert into app table with the correct column names
    console.log("\nAdding to app_drivers table...");
    const { error: insertError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .upsert([{
        id: n17Driver.id,
        name: n17Driver.name,
        description: n17Driver.description || "Driver Package",
        version: n17Driver.version || "1.0",
        os: n17Driver.os_version || "windows10, windows11",
        download_url: n17Driver.downloadUrl || n17Driver.download_url || "http://gofile.me/5wnJP/N8ELay1Zl",
        image_url: n17Driver.imageUrl || n17Driver.image_url || "/assets/wtpth/PC/N17V2C4WH128.jpg"
      }], { onConflict: 'id' });
      
    if (insertError) {
      console.error("Error inserting into app table:", insertError);
    } else {
      console.log("Successfully added N17 driver to app_drivers table!");
    }
    
    // Check the result
    const { data: appN17, error: appError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128');
      
    if (appError) {
      console.error("Error checking app table:", appError);
    } else {
      console.log(`\nVerification: ${appN17.length} N17V2C4WH128 drivers in app table`);
      if (appN17.length > 0) {
        console.log("App table driver data:", appN17[0]);
      }
    }
    
  } catch (error) {
    console.error("Error fixing N17 driver:", error);
  }
}

async function main() {
  try {
    // First check table structures
    await checkTables();
    
    // Then fix the N17 driver
    await fixN17Driver();
    
    console.log("\n✅ Driver fix process completed!");
    
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

main();