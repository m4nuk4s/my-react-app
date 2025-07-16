/**
 * Script to fix the issue with admin-added drivers not showing in the Drivers page
 * This script:
 * 1. Retrieves drivers added through the admin interface
 * 2. Formats them correctly for the app-specific Supabase table
 * 3. Inserts them into the app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client setup with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// App-specific table name
const APP_TABLE = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers';

async function processAdminDrivers() {
  console.log('Starting admin driver sync process...');
  
  try {
    // 1. Get drivers from localStorage that were added through the admin panel
    const driversJson = localStorage.getItem('drivers');
    if (!driversJson) {
      console.error('No drivers found in localStorage');
      return;
    }
    
    const adminDrivers = JSON.parse(driversJson);
    console.log(`Found ${adminDrivers.length} drivers in localStorage`);
    
    // 2. Get existing drivers from Supabase app table to avoid duplicates
    const { data: existingDrivers, error: fetchError } = await supabase
      .from(APP_TABLE)
      .select('name');
      
    if (fetchError) {
      console.error('Error fetching existing drivers:', fetchError.message);
      return;
    }
    
    const existingNames = (existingDrivers || []).map(d => d.name);
    console.log(`Found ${existingNames.length} existing drivers in app table`);
    
    // 3. Process and insert each driver
    let insertedCount = 0;
    let errorCount = 0;
    
    for (const driver of adminDrivers) {
      // Skip if driver already exists in app table
      if (existingNames.includes(driver.name)) {
        console.log(`Driver "${driver.name}" already exists in app table, skipping`);
        continue;
      }
      
      // Map admin driver to the format required for app table
      const driverData = {
        name: driver.name,
        version: driver.drivers && driver.drivers[0] ? driver.drivers[0].version : '1.0',
        description: driver.drivers && driver.drivers[0] ? driver.drivers[0].name : driver.name,
        os_version: Array.isArray(driver.os) ? driver.os.join(', ') : 'windows11',
        download_url: driver.drivers && driver.drivers[0] ? driver.drivers[0].link : '#',
        image_url: driver.image || '/placeholder-driver.png',
        manufacturer: driver.manufacturer || 'Unknown',
        size: driver.drivers && driver.drivers[0] ? driver.drivers[0].size : 'Unknown',
        category: driver.category || 'laptops'
      };
      
      // Insert driver into app table
      const { error: insertError } = await supabase
        .from(APP_TABLE)
        .insert([driverData]);
        
      if (insertError) {
        console.error(`Error inserting driver "${driver.name}":`, insertError.message);
        errorCount++;
      } else {
        console.log(`Successfully inserted driver "${driver.name}" into app table`);
        insertedCount++;
      }
    }
    
    console.log(`Sync complete: ${insertedCount} drivers inserted, ${errorCount} errors`);
    return { insertedCount, errorCount };
    
  } catch (error) {
    console.error('Unexpected error during admin driver sync:', error);
    throw error;
  }
}

// For browser environment when imported as a module
if (typeof window !== 'undefined') {
  // Expose function globally for browser console
  window.syncAdminDrivers = processAdminDrivers;
}

// Export for CommonJS environments
if (typeof module !== 'undefined') {
  module.exports = { processAdminDrivers };
}