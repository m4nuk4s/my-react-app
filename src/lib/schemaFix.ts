import { supabase } from './supabase';

/**
 * Force refresh the Supabase schema cache by creating and dropping a trigger
 * This is a workaround for schema cache issues that can occur with Supabase
 */
export async function forceSchemaRefresh() {
  console.log("Attempting to force refresh schema cache...");
  
  try {
    // First, clear the schema cache directly
    const { error: cacheClearError } = await supabase.rpc('pg_catalog.pg_invalidate_cache', {});
    if (cacheClearError) {
      console.warn("Failed to invalidate PostgreSQL cache:", cacheClearError);
    }
    
    // Execute SQL to ensure the release_date column exists and force schema refresh
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        DO $$
        DECLARE
          table_exists BOOLEAN;
        BEGIN
          -- Check if the drivers table exists
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers'
          ) INTO table_exists;
          
          IF table_exists THEN
            -- Force add the release_date column (will ignore if it already exists)
            BEGIN
              ALTER TABLE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers 
              ADD COLUMN release_date TIMESTAMPTZ DEFAULT NOW();
            EXCEPTION WHEN duplicate_column THEN
              -- Column already exists, ignore error
              RAISE NOTICE 'Column release_date already exists';
            END;
            
            -- Update any existing NULL values
            UPDATE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers
            SET release_date = NOW()
            WHERE release_date IS NULL;
            
            -- Create a temporary trigger to force metadata refresh
            BEGIN
              CREATE OR REPLACE TRIGGER refresh_schema_cache
              AFTER INSERT ON app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers
              FOR EACH ROW EXECUTE FUNCTION public.moddatetime('updated_at');
            EXCEPTION WHEN OTHERS THEN
              -- Function might not exist, ignore errors
              NULL;
            END;
            
            -- Immediately drop it to force metadata refresh
            DROP TRIGGER IF EXISTS refresh_schema_cache ON app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers;
          END IF;
        END
        $$;
      `
    });
    
    if (error) {
      console.error("Error forcing schema refresh:", error);
      return { success: false, error };
    }
    
    // Also try to recreate the table structure by directly copying and converting schema
    const { error: schemaError } = await supabase.rpc('execute_sql', {
      sql_query: `
        DO $$
        BEGIN
          -- Create a temporary table with the correct schema
          CREATE TABLE IF NOT EXISTS temp_drivers_fix (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            category TEXT,
            manufacturer TEXT,
            version TEXT,
            description TEXT,
            os_version TEXT,
            download_url TEXT,
            image TEXT,
            image_url TEXT,
            size TEXT,
            release_date TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          -- Insert data from original table if it exists
          INSERT INTO temp_drivers_fix (
            id, name, category, manufacturer, version, 
            description, os_version, download_url, image, 
            image_url, size, created_at, updated_at
          )
          SELECT 
            id, name, category, manufacturer, version, 
            description, os_version, download_url, image, 
            image_url, size, created_at, updated_at
          FROM app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers
          ON CONFLICT (id) DO NOTHING;
          
          -- Set release_date for inserted records
          UPDATE temp_drivers_fix 
          SET release_date = NOW() 
          WHERE release_date IS NULL;
          
          -- Drop old table and rename new one (only if necessary and if data was copied)
          -- Commented out for safety - uncomment if needed
          /*
          IF (SELECT COUNT(*) FROM temp_drivers_fix) > 0 THEN
            DROP TABLE IF EXISTS app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers;
            ALTER TABLE temp_drivers_fix RENAME TO app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers;
          END IF;
          */
        END
        $$;
      `
    });
    
    if (schemaError) {
      console.error("Error creating temp table for schema fix:", schemaError);
    }
    
    console.log("Schema refresh attempt completed");
    return { success: true };
    
  } catch (error) {
    console.error("Unexpected error during schema refresh:", error);
    return { success: false, error };
  }
}