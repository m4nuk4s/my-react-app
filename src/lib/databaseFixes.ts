import { supabase } from './supabase';

/**
 * Fixes the drivers table schema by ensuring the 'image' column exists
 * This addresses the issue: "Could not find the 'image' column of 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers' in the schema cache"
 */
export async function fixDriversTableSchema() {
  console.log("Running drivers table schema fix...");
  
  try {
    // Try to directly add the column with SQL
    const { error: columnError } = await supabase.rpc(
      'execute_sql',
      { 
        sql_query: `
          -- Check if column exists first to prevent errors
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers' 
              AND column_name = 'image'
            ) THEN
              -- Add the missing image column
              ALTER TABLE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers 
              ADD COLUMN IF NOT EXISTS image TEXT;
              
              -- Update existing records to set image from image_url if it exists
              UPDATE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers
              SET image = image_url
              WHERE image IS NULL AND image_url IS NOT NULL;
            END IF;
            
            -- Check for release_date column and add if missing
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers' 
              AND column_name = 'release_date'
            ) THEN
              -- Add the missing release_date column
              ALTER TABLE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers 
              ADD COLUMN IF NOT EXISTS release_date TIMESTAMPTZ DEFAULT NOW();
              
              -- Set default value for existing records
              UPDATE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers
              SET release_date = NOW()
              WHERE release_date IS NULL;
              
              -- Force refresh the schema cache for this table
              COMMENT ON TABLE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers IS 'Driver catalog with added image and release_date columns';
            END IF;
          END
          $$;
        `
      }
    );

    if (columnError) {
      console.error("Error adding columns to drivers table:", columnError);
      
      // Fallback to local storage fix
      const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
      
      // Make sure each driver has an image field and release_date
      const updatedDrivers = drivers.map(driver => {
        // Fix image field
        if (!driver.image && driver.image_url) {
          // Copy image_url to image field
          driver.image = driver.image_url;
        } else if (!driver.image && !driver.image_url) {
          // Set default image if none exists
          driver.image = '/placeholder-driver.png';
        }
        
        // Make sure driver files have release_date
        if (driver.drivers && Array.isArray(driver.drivers)) {
          driver.drivers = driver.drivers.map(file => {
            if (!file.date) {
              file.date = new Date().toISOString().split('T')[0];
            }
            return file;
          });
        }
        
        return driver;
      });
      
      // Save updated drivers back to localStorage
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
      console.log("Fixed drivers in localStorage as fallback");
      
      return { success: false, error: columnError };
    }

    console.log("Successfully fixed drivers table schema");
    return { success: true };
    
  } catch (error) {
    console.error("Unexpected error fixing drivers table schema:", error);
    return { success: false, error };
  }
}

/**
 * Creates or fixes the down1 table schema for additional driver files
 */
export async function fixDown1TableSchema() {
  console.log("Running down1 table schema fix...");
  
  try {
    // Create down1 table if it doesn't exist
    const { error: tableError } = await supabase.rpc(
      'execute_sql',
      { 
        sql_query: `
          -- Create down1 table if it doesn't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_name = 'down1'
            ) THEN
              -- Create the down1 table for additional driver files
              CREATE TABLE down1 (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                file_name TEXT NOT NULL,
                version TEXT NOT NULL,
                release_date TEXT,
                file_size TEXT,
                download_link TEXT NOT NULL,
                model TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
              );
              
              -- Add comments to force schema refresh
              COMMENT ON TABLE down1 IS 'Additional driver files for download';
              COMMENT ON COLUMN down1.model IS 'Driver Name linked to app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers';
            END IF;
          END
          $$;
        `
      }
    );

    if (tableError) {
      console.error("Error creating down1 table:", tableError);
      return { success: false, error: tableError };
    }

    console.log("Successfully created/fixed down1 table schema");
    return { success: true };
    
  } catch (error) {
    console.error("Unexpected error fixing down1 table schema:", error);
    return { success: false, error };
  }
}

/**
 * Fix all known database issues
 */
export async function fixAllDatabaseIssues() {
  console.log("Running all database fixes...");
  
  // Fix drivers table schema
  const driversFix = await fixDriversTableSchema();
  
  // Fix down1 table schema
  const down1Fix = await fixDown1TableSchema();
  
  return {
    success: driversFix.success && down1Fix.success,
    fixes: {
      drivers: driversFix,
      down1: down1Fix
    }
  };
}