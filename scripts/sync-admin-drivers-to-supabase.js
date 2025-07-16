/**
 * Script to sync drivers added through the admin interface to the Supabase app-specific table
 * This addresses the issue where drivers added in the admin panel don't appear on the Drivers page
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// App-specific table name for drivers
const APP_DRIVERS_TABLE = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers';

/**
 * Main function to sync drivers from localStorage to Supabase
 */
async function syncDriversToSupabase() {
  console.log('Starting driver sync process...');

  try {
    // 1. Get drivers from localStorage
    const driversJson = localStorage.getItem('drivers');
    if (!driversJson) {
      console.log('No drivers found in localStorage');
      return { success: false, message: 'No drivers found in localStorage' };
    }

    const drivers = JSON.parse(driversJson);
    console.log(`Found ${drivers.length} drivers in localStorage`);

    // 2. Get existing drivers from Supabase app table
    const { data: existingDrivers, error: fetchError } = await supabase
      .from(APP_DRIVERS_TABLE)
      .select('name');
      
    if (fetchError) {
      console.error('Error fetching existing drivers:', fetchError.message);
      return { success: false, message: `Error fetching existing drivers: ${fetchError.message}` };
    }
    
    const existingNames = (existingDrivers || []).map(d => d.name);
    console.log(`Found ${existingNames.length} existing drivers in app table`);
    
    // 3. Process and insert/update each driver
    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const driver of drivers) {
      try {
        // Skip entries without required data
        if (!driver.name || !driver.drivers || driver.drivers.length === 0) {
          console.log(`Skipping driver with invalid data: ${driver.name || 'unnamed'}`);
          continue;
        }
        
        // Map driver to the format required for app table
        const driverData = {
          name: driver.name,
          version: driver.drivers[0].version || '1.0',
          description: driver.drivers[0].name || driver.name,
          os_version: Array.isArray(driver.os) ? driver.os.join(', ') : 'windows11',
          download_url: driver.drivers[0].link || '#',
          image_url: driver.image || '/placeholder-driver.png',
          manufacturer: driver.manufacturer || 'Unknown',
          size: driver.drivers[0].size || 'Unknown',
          category: driver.category || 'laptops'
        };
        
        // Check if driver already exists
        if (existingNames.includes(driver.name)) {
          // Update existing driver
          const { error: updateError } = await supabase
            .from(APP_DRIVERS_TABLE)
            .update(driverData)
            .eq('name', driver.name);
            
          if (updateError) {
            console.error(`Error updating driver "${driver.name}":`, updateError.message);
            errorCount++;
          } else {
            console.log(`Successfully updated driver "${driver.name}" in app table`);
            updatedCount++;
          }
        } else {
          // Insert new driver
          const { error: insertError } = await supabase
            .from(APP_DRIVERS_TABLE)
            .insert([driverData]);
            
          if (insertError) {
            console.error(`Error inserting driver "${driver.name}":`, insertError.message);
            errorCount++;
          } else {
            console.log(`Successfully inserted driver "${driver.name}" into app table`);
            insertedCount++;
          }
        }
      } catch (err) {
        console.error(`Error processing driver "${driver.name}":`, err);
        errorCount++;
      }
    }
    
    const result = { 
      success: true,
      inserted: insertedCount,
      updated: updatedCount, 
      errors: errorCount,
      message: `Sync complete: ${insertedCount} drivers inserted, ${updatedCount} drivers updated, ${errorCount} errors`
    };
    
    console.log(result.message);
    return result;
    
  } catch (error) {
    console.error('Unexpected error during driver sync:', error);
    return { success: false, message: `Unexpected error: ${error.message || 'Unknown error'}` };
  }
}

// For Node.js environment
if (typeof module !== 'undefined' && require.main === module) {
  // Running as a standalone script
  syncDriversToSupabase()
    .then(result => {
      console.log('Sync completed with result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

// For browser environment
if (typeof window !== 'undefined') {
  // Make the function available globally for use in browser console
  window.syncDriversToSupabase = syncDriversToSupabase;
}

// Export for CommonJS environments
if (typeof module !== 'undefined') {
  module.exports = { syncDriversToSupabase };
}