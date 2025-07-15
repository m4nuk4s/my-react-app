// Save all drivers from existingDrivers.ts to Supabase
// This script maps the imported images to their paths in the public directory

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Map of image imports to their file paths
const imagePathMap = {
  'N15Grey': '/assets/wtpth/PC/N15Grey.jpg',
  'N15C8SL512': '/assets/wtpth/PC/N15C8SL512.jpg',
  'TH17V2': '/assets/wtpth/PC/TH17V2.jpg',
  'n14c4': '/assets/wtpth/PC/n14c4.jpg',
  'n14128': '/assets/wtpth/PC/n14128.jpg',
  'N17V2C4WH128': '/assets/wtpth/PC/N17V2C4WH128.jpg',
  'n17i712img': '/assets/wtpth/PC/N17I712.jpg',
  'N17I5108SLIMG': '/assets/wtpth/PC/N17I5108SL.jpg',
  'N15C12SL512IMG': '/assets/wtpth/PC/N15C12SL512.jpg',
  'N14C4BK128IMG': '/assets/wtpth/PC/N14C4BK128.jpg',
  'K14C4T128IMG': '/assets/wtpth/PC/K14C4T128.jpg',
  'HUN14C4BK128IMG': '/assets/wtpth/PC/HUN14C4BK128.jpg',
  'PX14C4SL128IMG': '/assets/wtpth/PC/PX14C4SL128.jpg'
};

// Parse the existingDrivers.ts file to extract driver data
async function parseExistingDrivers() {
  try {
    const filePath = path.resolve('../src/utils/existingDrivers.ts');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract the drivers array content
    const driversMatch = fileContent.match(/export const existingDrivers: ExistingDriver\[\] = \[([\s\S]*?)\];/);
    
    if (!driversMatch || !driversMatch[1]) {
      throw new Error("Could not extract drivers data from the file");
    }
    
    // Raw string containing all driver objects
    const driversString = driversMatch[1];
    
    // Parse each driver object
    const drivers = [];
    let currentDriver = null;
    let bracketCount = 0;
    let buffer = "";
    
    for (let i = 0; i < driversString.length; i++) {
      const char = driversString[i];
      
      // Start of a new driver object
      if (char === '{' && bracketCount === 0) {
        currentDriver = {};
        bracketCount = 1;
        buffer = "{";
      }
      // Inside the driver object
      else if (bracketCount > 0) {
        buffer += char;
        
        if (char === '{') {
          bracketCount++;
        }
        else if (char === '}') {
          bracketCount--;
          
          // End of the current driver object
          if (bracketCount === 0) {
            // Parse the driver object safely
            try {
              const cleanedBuffer = buffer
                .replace(/(\w+):/g, '"$1":') // Convert property names to strings
                .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                .replace(/(\w+)(?=\s*:)/g, '"$1"') // Ensure all property names are quoted
                .replace(/:\s*([A-Za-z][A-Za-z0-9_]*)(,|\s*\})/g, ':"$1"$2') // Quote string values like 'N15Grey'
                .replace(/:\s*\[([^\]]*)\]/g, (match, content) => {
                  // Handle arrays like ["windows10", "windows11"]
                  const quotedContent = content
                    .split(',')
                    .map(item => `"${item.trim()}"`)
                    .join(',');
                  return `:[${quotedContent}]`;
                });
              
              // Make it valid JSON
              const validJson = cleanedBuffer
                .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Ensure property names are quoted
                .replace(/:\s*([A-Za-z0-9_]+)(,|\s*})/g, ':"$1"$2'); // Ensure string values are quoted
              
              try {
                const driverObj = JSON.parse(validJson);
                
                // Extract and map image reference
                let imagePath = '';
                for (const [key, path] of Object.entries(imagePathMap)) {
                  if (driverObj.image && driverObj.image.includes(key)) {
                    imagePath = path;
                    break;
                  }
                }
                
                // Format the driver for Supabase
                drivers.push({
                  id: driverObj.id,
                  name: driverObj.name,
                  category: driverObj.category,
                  manufacturer: driverObj.manufacturer,
                  image_url: imagePath, // Use the mapped path
                  os_version: driverObj.os.join(', '),
                  device_model: driverObj.category,
                  download_url: driverObj.drivers[0].link,
                  version: driverObj.drivers[0].version,
                  description: driverObj.drivers[0].name,
                  size: driverObj.drivers[0].size,
                  created_at: new Date(driverObj.drivers[0].date).toISOString()
                });
              } catch (parseError) {
                console.error(`Failed to parse driver object: ${cleanedBuffer}`, parseError);
              }
            } catch (err) {
              console.error("Error processing driver:", err);
            }
            
            buffer = "";
          }
        }
      }
    }
    
    return drivers;
  } catch (error) {
    console.error("Failed to parse existingDrivers.ts:", error);
    throw error;
  }
}

// Save drivers to Supabase
async function saveDriversToSupabase(drivers) {
  console.log(`Attempting to save ${drivers.length} drivers to Supabase...`);
  
  // Create or update drivers table schema if needed
  const { error: schemaError } = await supabase.rpc('create_drivers_table', {});
  if (schemaError) {
    console.log("Note: Driver table may already exist or there was an error:", schemaError.message);
  }
  
  // First check which drivers already exist in Supabase
  const { data: existingDrivers, error: fetchError } = await supabase
    .from('drivers')
    .select('id, name');
    
  if (fetchError) {
    console.error("Error fetching existing drivers:", fetchError);
    return;
  }
  
  const existingDriversMap = new Map();
  if (existingDrivers) {
    existingDrivers.forEach(driver => {
      existingDriversMap.set(driver.name, driver.id);
    });
  }
  
  // Process each driver
  for (const driver of drivers) {
    try {
      // Check if driver already exists by name
      if (existingDriversMap.has(driver.name)) {
        // Update existing driver
        const { error: updateError } = await supabase
          .from('drivers')
          .update({
            name: driver.name,
            category: driver.category,
            manufacturer: driver.manufacturer,
            image_url: driver.image_url,
            os_version: driver.os_version,
            device_model: driver.device_model,
            download_url: driver.download_url,
            version: driver.version,
            description: driver.description,
            size: driver.size,
            created_at: driver.created_at
          })
          .eq('name', driver.name);
          
        if (updateError) {
          console.error(`Error updating driver ${driver.name}:`, updateError);
        } else {
          console.log(`Updated driver: ${driver.name}`);
        }
      } else {
        // Insert new driver
        const { error: insertError } = await supabase
          .from('drivers')
          .insert({
            name: driver.name,
            category: driver.category,
            manufacturer: driver.manufacturer,
            image_url: driver.image_url,
            os_version: driver.os_version,
            device_model: driver.device_model,
            download_url: driver.download_url,
            version: driver.version,
            description: driver.description,
            size: driver.size,
            created_at: driver.created_at
          });
          
        if (insertError) {
          console.error(`Error inserting driver ${driver.name}:`, insertError);
        } else {
          console.log(`Inserted new driver: ${driver.name}`);
        }
      }
    } catch (error) {
      console.error(`Error processing driver ${driver.name}:`, error);
    }
  }
  
  console.log("Driver save operation completed!");
}

// Main function
async function main() {
  try {
    const drivers = await parseExistingDrivers();
    console.log(`Parsed ${drivers.length} drivers from existingDrivers.ts`);
    await saveDriversToSupabase(drivers);
  } catch (error) {
    console.error("Failed to save drivers to Supabase:", error);
  }
}

main();