// fix-n17-schema-final.js - A final attempt to fix the N17 driver issue
// This script will create the app-specific drivers table with the correct schema and insert the N17 driver

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
    console.log("=== Starting Final Fix for N17 Driver ===");
    
    // Step 1: Create or recreate the app-specific table with correct schema
    console.log("Step 1: Creating app_drivers table with correct schema...");
    
    const { error: schemaError } = await supabase.rpc('execute_sql', { 
      sql: `
        -- First, drop the table if it exists to ensure clean creation
        DROP TABLE IF EXISTS app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers;
        
        -- Create the app-specific drivers table with the correct schema
        CREATE TABLE IF NOT EXISTS app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          version TEXT,
          description TEXT,
          os_version TEXT,
          device_model TEXT,
          download_url TEXT,
          image_url TEXT,
          manufacturer TEXT,
          size TEXT,
          category TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Enable RLS on the table
        ALTER TABLE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers ENABLE ROW LEVEL SECURITY;
        
        -- Create a policy that allows anyone to read from the table
        CREATE POLICY "Anyone can read app drivers" 
        ON app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers
        FOR SELECT USING (true);
      `
    });
    
    if (schemaError) {
      console.error("Error creating schema:", schemaError);
      return;
    }
    
    console.log("App drivers table created successfully");
    
    // Step 2: Find the N17 driver in the main table
    console.log("\nStep 2: Finding N17 driver in main drivers table...");
    
    const { data: n17Driver, error: fetchError } = await supabase
      .from('drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128')
      .limit(1)
      .single();
      
    if (fetchError) {
      console.error("Error fetching N17 driver:", fetchError);
      
      // Try to create a driver from the static data in Drivers.tsx
      console.log("Creating N17 driver from static data...");
      
      // Insert N17 driver with hardcoded data
      const { data: insertedDriver, error: insertError } = await supabase
        .from('drivers')
        .insert({
          name: 'N17V2C4WH128',
          version: '3.3.1.2',
          description: 'Driver Package',
          os_version: 'windows10, windows11',
          device_model: 'laptops',
          download_url: 'http://gofile.me/5wnJP/N8ELay1Zl',
          image_url: '/assets/wtpth/PC/N17V2C4WH128.jpg',
          manufacturer: 'Thomson',
          size: '1.05 GB',
          category: 'laptops',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (insertError) {
        console.error("Error creating N17 driver:", insertError);
        return;
      }
      
      console.log("Created N17 driver in main table:", insertedDriver);
      n17Driver = insertedDriver;
    } else {
      console.log("Found existing N17 driver in main table:", n17Driver.name);
    }
    
    // Step 3: Insert the N17 driver into the app-specific table
    console.log("\nStep 3: Adding N17 driver to app_drivers table...");
    
    const { data: appInsert, error: appError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .insert({
        id: n17Driver.id,
        name: n17Driver.name,
        version: n17Driver.version || '3.3.1.2',
        description: n17Driver.description || 'Driver Package',
        os_version: n17Driver.os_version || 'windows10, windows11',
        device_model: n17Driver.device_model || 'laptops',
        download_url: n17Driver.download_url || 'http://gofile.me/5wnJP/N8ELay1Zl',
        image_url: n17Driver.image_url || '/assets/wtpth/PC/N17V2C4WH128.jpg',
        manufacturer: n17Driver.manufacturer || 'Thomson',
        size: n17Driver.size || '1.05 GB',
        category: n17Driver.category || 'laptops',
        created_at: n17Driver.created_at || new Date().toISOString()
      })
      .select();
      
    if (appError) {
      console.error("Error inserting into app table:", appError);
    } else {
      console.log("Successfully added N17 driver to app_drivers table!");
    }
    
    // Step 4: Verify the results
    console.log("\nStep 4: Verifying results...");
    
    const { data: mainN17, error: mainError } = await supabase
      .from('drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128');
      
    if (mainError) {
      console.error("Error checking main table:", mainError);
    } else {
      console.log(`Found ${mainN17.length} N17 drivers in main table`);
      if (mainN17.length > 1) {
        console.log("⚠️ Multiple N17 drivers found in main table. Consider cleanup.");
      }
    }
    
    const { data: appN17, error: appCheckError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .select('*')
      .eq('name', 'N17V2C4WH128');
      
    if (appCheckError) {
      console.error("Error checking app table:", appCheckError);
    } else {
      console.log(`Found ${appN17.length} N17 drivers in app table`);
      if (appN17.length > 0) {
        console.log("App table driver data:", appN17[0]);
      }
    }
    
    console.log("\n✅ N17 driver fix process completed!");
    
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

main();