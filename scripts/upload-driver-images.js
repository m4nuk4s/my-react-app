// This script copies driver images to public folder and updates Supabase with correct paths

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

// Image mapping with file names
const imageFiles = [
  { name: 'N15Grey.jpg', path: '../src/assets/wtpth/PC/N15Grey.jpg', url: '/assets/wtpth/PC/N15Grey.jpg' },
  { name: 'N15C8SL512.jpg', path: '../src/assets/wtpth/PC/N15C8SL512.jpg', url: '/assets/wtpth/PC/N15C8SL512.jpg' },
  { name: 'TH17V2.jpg', path: '../src/assets/wtpth/PC/TH17V2.jpg', url: '/assets/wtpth/PC/TH17V2.jpg' },
  { name: 'n14c4.jpg', path: '../src/assets/wtpth/PC/n14c4.jpg', url: '/assets/wtpth/PC/n14c4.jpg' },
  { name: 'n14128.jpg', path: '../src/assets/wtpth/PC/n14128.jpg', url: '/assets/wtpth/PC/n14128.jpg' },
  { name: 'N17V2C4WH128.jpg', path: '../src/assets/wtpth/PC/N17V2C4WH128.jpg', url: '/assets/wtpth/PC/N17V2C4WH128.jpg' },
  { name: 'N17I712.jpg', path: '../src/assets/wtpth/PC/N17I712.jpg', url: '/assets/wtpth/PC/N17I712.jpg' },
  { name: 'N17I5108SL.jpg', path: '../src/assets/wtpth/PC/N17I5108SL.jpg', url: '/assets/wtpth/PC/N17I5108SL.jpg' },
  { name: 'N15C12SL512.jpg', path: '../src/assets/wtpth/PC/N15C12SL512.jpg', url: '/assets/wtpth/PC/N15C12SL512.jpg' },
  { name: 'N14C4BK128.jpg', path: '../src/assets/wtpth/PC/N14C4BK128.jpg', url: '/assets/wtpth/PC/N14C4BK128.jpg' },
  { name: 'K14C4T128.jpg', path: '../src/assets/wtpth/PC/K14C4T128.jpg', url: '/assets/wtpth/PC/K14C4T128.jpg' },
  { name: 'HUN14C4BK128.jpg', path: '../src/assets/wtpth/PC/HUN14C4BK128.jpg', url: '/assets/wtpth/PC/HUN14C4BK128.jpg' },
  { name: 'PX14C4SL128.jpg', path: '../src/assets/wtpth/PC/PX14C4SL128.jpg', url: '/assets/wtpth/PC/PX14C4SL128.jpg' }
];

// Make sure public folders exist
function ensureDirectoryExists(dirPath) {
  const fullPath = path.resolve(dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
}

// Copy images from src to public folder
async function copyImagesToPublic() {
  ensureDirectoryExists('../public/assets/wtpth/PC');
  
  for (const image of imageFiles) {
    try {
      const sourcePath = path.resolve(image.path);
      const destPath = path.resolve(`../public${image.url}`);
      
      // Check if source file exists
      if (fs.existsSync(sourcePath)) {
        // Copy file to public folder
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${image.name} to public folder`);
      } else {
        console.error(`Source file not found: ${sourcePath}`);
      }
    } catch (error) {
      console.error(`Error copying ${image.name}:`, error);
    }
  }
}

// Map driver objects in existingDrivers.ts to the correct Supabase image paths
async function updateDriverImageUrls() {
  // Get all drivers from Supabase
  const { data: drivers, error } = await supabase
    .from('drivers')
    .select('*');
  
  if (error) {
    console.error("Error fetching drivers:", error);
    return;
  }
  
  console.log(`Found ${drivers.length} drivers in Supabase`);
  
  // Update image URLs in Supabase
  for (const driver of drivers) {
    // Skip if already has an image_url
    if (driver.image_url && driver.image_url.startsWith('/assets/wtpth/PC/')) {
      console.log(`Driver ${driver.name} already has image_url: ${driver.image_url}`);
      continue;
    }
    
    // Try to find matching image based on driver name
    let matchedImage = null;
    
    // These are patterns to match driver names to image files
    const patterns = [
      { pattern: /N15Grey|N15I.*?8GR|N15I.*?16GR/, image: '/assets/wtpth/PC/N15Grey.jpg' },
      { pattern: /N15C8SL512/, image: '/assets/wtpth/PC/N15C8SL512.jpg' },
      { pattern: /TH17V2/, image: '/assets/wtpth/PC/TH17V2.jpg' },
      { pattern: /n14c4/, image: '/assets/wtpth/PC/n14c4.jpg' },
      { pattern: /n14128/, image: '/assets/wtpth/PC/n14128.jpg' },
      { pattern: /N17V2C4WH128/, image: '/assets/wtpth/PC/N17V2C4WH128.jpg' },
      { pattern: /N17I712|N17I310/, image: '/assets/wtpth/PC/N17I712.jpg' },
      { pattern: /N17I510/, image: '/assets/wtpth/PC/N17I5108SL.jpg' },
      { pattern: /N15C12SL512|N15C4SL128/, image: '/assets/wtpth/PC/N15C12SL512.jpg' },
      { pattern: /N14C.*?BK128/, image: '/assets/wtpth/PC/N14C4BK128.jpg' },
      { pattern: /K14C4T128/, image: '/assets/wtpth/PC/K14C4T128.jpg' },
      { pattern: /HUN14C.*?BK128/, image: '/assets/wtpth/PC/HUN14C4BK128.jpg' },
      { pattern: /PX14C4SL128/, image: '/assets/wtpth/PC/PX14C4SL128.jpg' }
    ];
    
    // Find a matching pattern for this driver
    for (const { pattern, image } of patterns) {
      if (pattern.test(driver.name)) {
        matchedImage = image;
        break;
      }
    }
    
    // Default image if no match found
    if (!matchedImage) {
      matchedImage = '/assets/wtpth/PC/N15Grey.jpg';
    }
    
    // Update the driver in Supabase
    const { error: updateError } = await supabase
      .from('drivers')
      .update({ image_url: matchedImage })
      .eq('id', driver.id);
    
    if (updateError) {
      console.error(`Error updating image for driver ${driver.name}:`, updateError);
    } else {
      console.log(`Updated image for ${driver.name} to ${matchedImage}`);
    }
  }
}

// Main function
async function main() {
  try {
    console.log("Starting driver image processing...");
    await copyImagesToPublic();
    await updateDriverImageUrls();
    console.log("Driver image processing completed successfully!");
  } catch (error) {
    console.error("Error in driver image processing:", error);
  }
}

main();