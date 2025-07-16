// Fix driver duplicates script

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
    console.log("Starting driver cleanup process...");

    // Step 1: Check for duplicates in main drivers table
    console.log("Step 1: Checking for N17V2C4WH128 duplicates in main table...");
    const { data: mainTableDrivers, error: mainError } = await supabase
      .from('drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128');

    if (mainError) throw mainError;

    console.log(`Main drivers table: ${mainTableDrivers.length} N17V2C4WH128 drivers`);
    
    // Clean main table if duplicates exist
    if (mainTableDrivers.length > 1) {
      console.log('Keeping first record and deleting others from main table...');
      const keepId = mainTableDrivers[0].id;
      
      for (let i = 1; i < mainTableDrivers.length; i++) {
        const { error } = await supabase
          .from('drivers')
          .delete()
          .eq('id', mainTableDrivers[i].id);
          
        if (error) console.error(`Error deleting duplicate ${mainTableDrivers[i].id}:`, error);
      }
      console.log('Done cleaning main drivers table');
    }
    
    // Step 2: Check for duplicates in app table
    console.log("Step 2: Checking app-specific drivers table...");
    const { data: appDrivers, error: appError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .select('*');

    if (appError) throw appError;
    console.log(`App drivers table: ${appDrivers ? appDrivers.length : 0} total drivers`);

    // Step 3: Clean and resync the app-specific table
    console.log("Step 3: Cleaning app-specific drivers table...");
    const { error: deleteError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .delete()
      .not('id', 'is', null);  // Delete all records
      
    if (deleteError) throw deleteError;
    console.log("All records deleted from app-specific table");

    // Step 4: Get all cleaned drivers from main table
    console.log("Step 4: Getting all drivers from main table...");
    const { data: allDrivers, error: allDriversError } = await supabase
      .from('drivers')
      .select('*');
      
    if (allDriversError) throw allDriversError;
    console.log(`Found ${allDrivers.length} drivers to import`);

    // Step 5: Import all drivers to app-specific table
    console.log("Step 5: Importing drivers to app-specific table...");
    
    // We'll insert in small batches to avoid potential issues
    const batchSize = 5;
    for (let i = 0; i < allDrivers.length; i += batchSize) {
      const batch = allDrivers.slice(i, i + batchSize);
      const mappedBatch = batch.map(driver => ({
        id: driver.id,
        name: driver.name,
        description: driver.description,
        version: driver.version,
        os: driver.os,
        downloadUrl: driver.downloadUrl,
        imageUrl: driver.imageUrl
      }));
      
      const { error: insertError } = await supabase
        .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
        .insert(mappedBatch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i}-${i+batchSize}:`, insertError);
        // Continue with next batch
      }
    }

    // Step 6: Verify the results
    console.log("Step 6: Verifying results...");
    const { data: finalCheck, error: checkError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128');
      
    if (checkError) throw checkError;
    console.log(`Final count in app table: ${finalCheck ? finalCheck.length : 0} N17V2C4WH128 drivers`);
    
    console.log("✅ Driver cleanup and import completed successfully!");
  } catch (error) {
    console.error("Error during driver cleanup process:", error);
  }
}

main();