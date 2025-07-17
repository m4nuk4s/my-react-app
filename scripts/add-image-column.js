// This script fixes the missing 'image' column in the drivers table
import { supabase } from '../lib/supabase.ts';

async function addImageColumnToDriversTable() {
  console.log("Starting script to add image column to drivers table...");
  
  try {
    // First check if we can access the supabase client
    if (!supabase) {
      console.error("Supabase client not available");
      return false;
    }
    
    // Execute SQL to add the column if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', { 
      sql_query: `
        DO $$
        BEGIN
          -- Add the image column if it doesn't exist
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers' 
            AND column_name = 'image'
          ) THEN
            ALTER TABLE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers 
            ADD COLUMN image TEXT;
            
            -- Update existing records to set image from image_url if it exists
            UPDATE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers
            SET image = image_url
            WHERE image IS NULL AND image_url IS NOT NULL;
            
            RAISE NOTICE 'Added image column to drivers table';
          ELSE
            RAISE NOTICE 'Image column already exists in drivers table';
          END IF;
        END
        $$;
      `
    });

    if (error) {
      console.error("Error adding image column:", error);
      return false;
    }

    console.log("Successfully ran script to add image column");
    return true;
    
  } catch (error) {
    console.error("Unexpected error adding image column:", error);
    return false;
  }
}

// Execute the function
addImageColumnToDriversTable()
  .then(success => {
    if (success) {
      console.log("Script completed successfully");
    } else {
      console.log("Script completed with errors");
    }
  });