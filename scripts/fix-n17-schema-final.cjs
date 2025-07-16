// fix-n17-schema-final.cjs - A CommonJS version to fix the N17 driver issue
// This script will directly use SQL to create the app-specific table

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
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
    console.log("=== Starting Final Fix for N17 Driver ===");
    
    // Step 1: Create or recreate the app-specific table with correct schema using execute_sql
    console.log("Step 1: Creating app_drivers table with correct schema...");
    
    // First, check if the 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers' table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .rpc('get_schema_tables')
      .eq('table_name', 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers');
    
    if (tableCheckError) {
      console.log("Cannot check table existence, will try to create it directly:", tableCheckError);
    }
    
    // Directly execute SQL using Supabase REST API
    console.log("Creating app_drivers table via SQL...");
    const { error: sqlError } = await supabase
      .from('drivers')
      .select('*')
      .limit(1)
      .then(async () => {
        // The table exists, let's get its structure
        const { data: mainDriverColumns } = await supabase
          .from('drivers')
          .select('*')
          .limit(1);
        
        if (mainDriverColumns && mainDriverColumns.length > 0) {
          const driverSample = mainDriverColumns[0];
          console.log("Main drivers table columns:", Object.keys(driverSample).join(", "));
        }
        
        // Now find the N17V2C4WH128 driver
        const { data: n17Driver, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('name', 'N17V2C4WH128')
          .limit(1);
        
        if (driverError) {
          console.error("Error fetching N17 driver:", driverError);
        } else if (n17Driver && n17Driver.length > 0) {
          console.log("Found N17 driver:", n17Driver[0].name);
          
          // Now let's try to insert it into the app table
          // First, check if the app table exists by attempting to select from it
          const { error: appTableCheckError } = await supabase
            .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
            .select('*')
            .limit(1);
          
          if (appTableCheckError && appTableCheckError.code === '42P01') {
            console.log("App table doesn't exist, we'll create it");
            
            // Create the app table (only if it doesn't exist)
            const { error: createTableError } = await supabase
              .from('_db_create_tables')
              .insert({
                name: 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers',
                columns: [
                  { name: 'id', type: 'uuid', primary: true, nullable: false, default: 'uuid_generate_v4()' },
                  { name: 'name', type: 'text', nullable: false },
                  { name: 'version', type: 'text' },
                  { name: 'description', type: 'text' },
                  { name: 'os_version', type: 'text' },
                  { name: 'device_model', type: 'text' },
                  { name: 'download_url', type: 'text' },
                  { name: 'image_url', type: 'text' },
                  { name: 'manufacturer', type: 'text' },
                  { name: 'size', type: 'text' },
                  { name: 'category', type: 'text' },
                  { name: 'created_at', type: 'timestamptz', default: 'now()' }
                ]
              });
            
            if (createTableError) {
              console.error("Failed to create app table:", createTableError);
            } else {
              console.log("Successfully created app table!");
            }
          }
          
          // Now try to insert the N17 driver into the app table
          // We'll manually construct the driver data based on what we've found
          const driverData = {
            id: n17Driver[0].id,
            name: n17Driver[0].name,
            version: n17Driver[0].version || '3.3.1.2',
            description: n17Driver[0].description || 'Driver Package',
            os_version: n17Driver[0].os_version || 'windows10, windows11',
            download_url: n17Driver[0].download_url || 'http://gofile.me/5wnJP/N8ELay1Zl',
            image_url: n17Driver[0].image_url || '/assets/wtpth/PC/N17V2C4WH128.jpg',
            manufacturer: n17Driver[0].manufacturer || 'Thomson',
            size: n17Driver[0].size || '1.05 GB',
            category: n17Driver[0].category || 'laptops'
          };
          
          // Try to insert into app table
          const { error: insertError } = await supabase
            .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
            .upsert([driverData], { onConflict: 'id' });
          
          if (insertError) {
            console.error("Error inserting into app table:", insertError);
            
            // Let's try a simpler approach - direct insert with minimal fields
            const { error: simpleInsertError } = await supabase
              .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
              .insert({
                name: 'N17V2C4WH128',
                version: '3.3.1.2',
                description: 'Driver Package',
                os_version: 'windows10, windows11',
                download_url: 'http://gofile.me/5wnJP/N8ELay1Zl',
                image_url: '/assets/wtpth/PC/N17V2C4WH128.jpg',
                manufacturer: 'Thomson',
                size: '1.05 GB'
              });
            
            if (simpleInsertError) {
              console.error("Simple insert also failed:", simpleInsertError);
            } else {
              console.log("Successfully added N17 driver with simple insert!");
            }
          } else {
            console.log("Successfully added N17 driver to app table!");
          }
        } else {
          console.log("N17 driver not found in main table");
          
          // Create it directly in the app table
          const { error: directInsertError } = await supabase
            .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
            .insert({
              name: 'N17V2C4WH128',
              version: '3.3.1.2',
              description: 'Driver Package',
              os_version: 'windows10, windows11',
              download_url: 'http://gofile.me/5wnJP/N8ELay1Zl',
              image_url: '/assets/wtpth/PC/N17V2C4WH128.jpg',
              manufacturer: 'Thomson',
              size: '1.05 GB',
              category: 'laptops'
            });
          
          if (directInsertError) {
            console.error("Error with direct insert:", directInsertError);
          } else {
            console.log("Successfully created N17 driver directly in app table!");
          }
        }
        
        // Check what's in the app table now
        const { data: appDrivers, error: appError } = await supabase
          .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
          .select('*');
        
        if (appError) {
          console.error("Error checking app table:", appError);
        } else {
          console.log(`App table now has ${appDrivers.length} total drivers`);
          const n17inApp = appDrivers.filter(d => d.name === 'N17V2C4WH128');
          console.log(`App table has ${n17inApp.length} N17V2C4WH128 drivers`);
          if (n17inApp.length > 0) {
            console.log("N17 driver in app table:", n17inApp[0]);
          }
        }
        
        return { error: null };
      })
      .catch(error => {
        console.error("Error in SQL execution:", error);
        return { error };
      });
    
    if (sqlError) {
      console.error("Failed to execute SQL:", sqlError);
    }
    
    console.log("\n✅ N17 driver fix process completed!");
    
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

main();