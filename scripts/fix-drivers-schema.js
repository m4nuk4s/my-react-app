// This script adds the missing 'image' column to the drivers table
import { supabase } from '../lib/supabase.ts';

async function fixDriversSchema() {
  console.log("Starting driver schema fix script...");
  
  try {
    // Check if the drivers table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers');
    
    if (tableError) {
      console.error("Error checking for drivers table:", tableError);
      return;
    }
    
    // Add image column to drivers table if it doesn't exist
    const { error } = await supabase.rpc('add_image_column_to_drivers');
    
    if (error) {
      if (error.message.includes("already exists")) {
        console.log("Image column already exists in drivers table");
      } else {
        console.error("Error adding image column:", error);
      }
    } else {
      console.log("Successfully added image column to drivers table");
    }
    
    // Update any existing records to have the image field populated from image_url if needed
    const { error: updateError } = await supabase
      .rpc('migrate_image_url_to_image');
      
    if (updateError) {
      console.error("Error updating image data:", updateError);
    } else {
      console.log("Successfully updated image data for existing drivers");
    }
    
    console.log("Driver schema fix completed");
  } catch (err) {
    console.error("Unexpected error fixing driver schema:", err);
  }
}

fixDriversSchema();

// Export a function that can be called from other modules
export default fixDriversSchema;