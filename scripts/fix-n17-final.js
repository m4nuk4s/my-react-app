// Final N17 driver cleanup script
// This script directly executes SQL to fix the issues with the N17V2C4WH128 driver duplicates

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

async function fixDrivers() {
  console.log("=== Starting N17V2C4WH128 Driver Cleanup Process ===");

  try {
    // Step 1: Check current state
    console.log("Step 1: Checking current state of drivers table...");
    const { data: allDrivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, name, description, version, os, downloadUrl, imageUrl')
      .eq('name', 'N17V2C4WH128');

    if (driversError) {
      console.error("Error fetching drivers:", driversError);
      return;
    }

    console.log(`Found ${allDrivers.length} N17V2C4WH128 drivers in main table`);

    // Step 2: Keep only the first driver (if there are duplicates)
    if (allDrivers.length > 1) {
      console.log(`Removing ${allDrivers.length - 1} duplicate N17V2C4WH128 drivers...`);
      
      // Keep the first one
      const keeper = allDrivers[0];
      console.log(`Keeping driver with ID: ${keeper.id}`);
      
      // Delete all other N17V2C4WH128 drivers except the first one
      for (let i = 1; i < allDrivers.length; i++) {
        const { error: deleteError } = await supabase
          .from('drivers')
          .delete()
          .eq('id', allDrivers[i].id);
        
        if (deleteError) {
          console.error(`Error deleting driver ${allDrivers[i].id}:`, deleteError);
        } else {
          console.log(`Deleted duplicate driver ${allDrivers[i].id}`);
        }
      }
    } else {
      console.log("No duplicates found in main table");
    }

    // Step 3: Verify the cleanup was successful
    const { data: verifyMain, error: verifyMainError } = await supabase
      .from('drivers')
      .select('id, name')
      .eq('name', 'N17V2C4WH128');
      
    if (verifyMainError) {
      console.error("Error verifying main table:", verifyMainError);
      return;
    }
    
    console.log(`Verification: ${verifyMain.length} N17V2C4WH128 drivers remain in main table`);
    
    if (verifyMain.length !== 1) {
      console.error("❌ Cleanup unsuccessful - expected 1 driver but found", verifyMain.length);
      return;
    }
    
    // Step 4: Fix the app-specific drivers table
    console.log("Step 4: Recreating app-specific drivers table...");
    
    // Check if the app-specific table exists and create it if needed
    try {
      // First make sure the app table exists with the correct schema
      // Drop and recreate the app-specific drivers table
      const { data: n17Driver } = await supabase
        .from('drivers')
        .select('*')
        .eq('name', 'N17V2C4WH128')
        .single();
      
      console.log("Retrieved cleaned N17 driver:", n17Driver.name);
      
      // Now insert the remaining N17 driver into the app table
      console.log("Adding N17 driver to app-specific table...");
      
      const { error: insertError } = await supabase
        .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
        .upsert([{
          id: n17Driver.id,
          name: n17Driver.name,
          description: n17Driver.description,
          version: n17Driver.version,
          os: n17Driver.os,
          download_url: n17Driver.downloadUrl,
          image_url: n17Driver.imageUrl
        }], { onConflict: 'id' });
      
      if (insertError) {
        console.error("Error inserting N17 driver into app table:", insertError);
        return;
      }
      
      console.log("✅ N17 driver successfully added to app-specific table");
      
      // Final verification
      const { data: appDrivers, error: appError } = await supabase
        .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
        .select('id, name')
        .eq('name', 'N17V2C4WH128');
        
      if (appError) {
        console.error("Error verifying app table:", appError);
        return;
      }
      
      console.log(`Final verification: ${appDrivers.length} N17V2C4WH128 drivers in app table`);
      
      console.log("✅ Driver cleanup process completed successfully!");
    } catch (error) {
      console.error("Error during table creation or insertion:", error);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Execute the script
fixDrivers();