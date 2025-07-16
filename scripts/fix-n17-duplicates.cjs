// Fix N17 driver duplicates script - Single purpose script

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
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

async function createDriverTable() {
  console.log("Creating app_drivers table with correct schema...");
  
  try {
    // SQL must be a simple string, not a template literal with backticks
    const sql = "DROP TABLE IF EXISTS app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers; CREATE TABLE IF NOT EXISTS app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, name TEXT NOT NULL, description TEXT, version TEXT, os TEXT, download_url TEXT, image_url TEXT); ALTER TABLE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS \"Allow anyone to read drivers\" ON app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers; CREATE POLICY \"Allow anyone to read drivers\" ON app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers FOR SELECT USING (true);";
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error("Error creating table:", error);
      return false;
    }
    
    console.log("Table created successfully!");
    return true;
  } catch (err) {
    console.error("Exception creating table:", err);
    return false;
  }
}

async function cleanupN17Duplicates() {
  console.log("Cleaning up N17V2C4WH128 driver duplicates...");
  
  try {
    // Step 1: Check if there are duplicates in the drivers table
    const { data: n17Drivers, error: fetchError } = await supabase
      .from('drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128');
      
    if (fetchError) {
      console.error("Error fetching N17 drivers:", fetchError);
      return false;
    }
    
    console.log(`Found ${n17Drivers.length} N17V2C4WH128 drivers in main table`);
    
    // Step 2: Keep only the first one, delete the rest
    if (n17Drivers.length > 1) {
      console.log("Keeping first record and removing others...");
      const keepDriver = n17Drivers[0];
      
      for (let i = 1; i < n17Drivers.length; i++) {
        const { error: deleteError } = await supabase
          .from('drivers')
          .delete()
          .eq('id', n17Drivers[i].id);
          
        if (deleteError) {
          console.error(`Error deleting driver ${i}:`, deleteError);
        }
      }
      
      console.log(`Deleted ${n17Drivers.length - 1} duplicate records`);
    }
    
    return true;
  } catch (err) {
    console.error("Exception cleaning up duplicates:", err);
    return false;
  }
}

async function copyToAppTable() {
  console.log("Copying N17 driver to app-specific table...");
  
  try {
    // Get the N17 driver (should be only one now)
    const { data: n17Driver, error: fetchError } = await supabase
      .from('drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128')
      .single();
      
    if (fetchError) {
      console.error("Error fetching N17 driver:", fetchError);
      return false;
    }
    
    console.log("Found N17 driver:", n17Driver.name);
    
    // Insert into app table with correct column names
    const { error: insertError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .insert({
        id: n17Driver.id,
        name: n17Driver.name,
        description: n17Driver.description,
        version: n17Driver.version,
        os: n17Driver.os,
        download_url: n17Driver.downloadUrl, // Note the different column name format
        image_url: n17Driver.imageUrl       // Note the different column name format
      });
      
    if (insertError) {
      console.error("Error inserting into app table:", insertError);
      return false;
    }
    
    console.log("N17 driver copied to app table successfully");
    return true;
  } catch (err) {
    console.error("Exception copying to app table:", err);
    return false;
  }
}

async function verifyResults() {
  console.log("Verifying results...");
  
  try {
    // Check main drivers table
    const { data: mainN17, error: mainError } = await supabase
      .from('drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128');
      
    if (mainError) {
      console.error("Error checking main table:", mainError);
    } else {
      console.log(`Main drivers table: ${mainN17.length} N17V2C4WH128 drivers`);
    }
    
    // Check app drivers table
    const { data: appN17, error: appError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128');
      
    if (appError) {
      console.error("Error checking app table:", appError);
    } else {
      console.log(`App drivers table: ${appN17.length} N17V2C4WH128 drivers`);
    }
    
    return true;
  } catch (err) {
    console.error("Exception verifying results:", err);
    return false;
  }
}

async function main() {
  try {
    console.log("=== Starting N17V2C4WH128 Driver Cleanup Process ===");
    
    // Step 1: Create/recreate app drivers table with proper schema
    await createDriverTable();
    
    // Step 2: Clean up N17 driver duplicates in main table
    await cleanupN17Duplicates();
    
    // Step 3: Copy N17 driver to app-specific table
    await copyToAppTable();
    
    // Step 4: Verify results
    await verifyResults();
    
    console.log("✅ N17V2C4WH128 driver cleanup process completed!");
    
  } catch (err) {
    console.error("Unexpected error during cleanup:", err);
  }
}

// Execute the script
main();