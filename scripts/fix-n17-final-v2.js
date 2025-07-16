// Fix-n17-final-v2.js - A script to fix the N17V2C4WH128 driver duplicates
// This version has been updated to match the actual column names in the database

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

async function main() {
  try {
    console.log("=== Starting N17V2C4WH128 Driver Cleanup Process ===");
    
    // Step 1: Check for duplicate N17V2C4WH128 drivers in the main table
    console.log("Step 1: Checking for N17V2C4WH128 drivers in main drivers table...");
    const { data: n17Drivers, error: fetchError } = await supabase
      .from('drivers')
      .select('id, name, description, version, os_version, manufacturer, device_model, downloadUrl, imageUrl, created_at, size')
      .eq('name', 'N17V2C4WH128');
      
    if (fetchError) {
      console.error("Error fetching N17 drivers:", fetchError);
      return;
    }
    
    console.log(`Found ${n17Drivers.length} N17V2C4WH128 drivers in main table`);
    
    // Step 2: Keep only the first one (if there are duplicates)
    let keepDriver = null;
    if (n17Drivers.length > 1) {
      console.log("Cleaning up duplicates...");
      keepDriver = n17Drivers[0];
      console.log(`Keeping driver with ID: ${keepDriver.id}`);
      
      for (let i = 1; i < n17Drivers.length; i++) {
        const { error: deleteError } = await supabase
          .from('drivers')
          .delete()
          .eq('id', n17Drivers[i].id);
          
        if (deleteError) {
          console.error(`Error deleting driver ${i}:`, deleteError);
        } else {
          console.log(`Deleted duplicate driver ${n17Drivers[i].id}`);
        }
      }
    } else if (n17Drivers.length === 1) {
      keepDriver = n17Drivers[0];
    } else {
      console.log("No N17V2C4WH128 drivers found in main table");
      return;
    }
    
    // Step 3: Verify the main drivers table after cleanup
    const { data: verifyMain, error: verifyMainError } = await supabase
      .from('drivers')
      .select('id, name')
      .eq('name', 'N17V2C4WH128');
      
    if (verifyMainError) {
      console.error("Error verifying main table:", verifyMainError);
      return;
    }
    
    console.log(`Main table now has ${verifyMain.length} N17V2C4WH128 drivers`);
    
    // Step 4: Check the app table structure
    console.log("Step 4: Checking app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers table...");
    
    // Step 5: Insert/update the app table with the correct driver
    if (keepDriver) {
      console.log("Adding driver to app table with correct column names...");
      const { error: insertError } = await supabase
        .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
        .upsert([{
          id: keepDriver.id,
          name: keepDriver.name,
          description: keepDriver.description,
          version: keepDriver.version,
          os: keepDriver.os_version,
          download_url: keepDriver.downloadUrl,
          image_url: keepDriver.imageUrl
        }], { onConflict: 'id' });
        
      if (insertError) {
        console.error("Error inserting into app table:", insertError);
        console.log("Detailed error:", JSON.stringify(insertError));
      } else {
        console.log("Successfully added N17 driver to app table");
      }
    }
    
    // Step 6: Final verification
    const { data: appN17, error: appError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128');
      
    if (appError) {
      console.error("Error checking app table:", appError);
    } else {
      console.log(`App table has ${appN17.length} N17V2C4WH128 drivers`);
      if (appN17.length > 0) {
        console.log("App table driver data:", appN17[0]);
      }
    }
    
    console.log("✅ N17V2C4WH128 driver cleanup process completed!");
    
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

main();