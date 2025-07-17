// Simple script to fix the driver image issue
// This fixes the "Could not find the 'image' column" error

// Get all drivers from localStorage
const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');

// Make sure each driver has an image field
const updatedDrivers = drivers.map(driver => {
  // If driver doesn't have image field but has image_url field
  if (!driver.image && driver.image_url) {
    // Copy image_url to image field
    driver.image = driver.image_url;
    console.log(`Fixed driver: ${driver.name}`);
  } else if (!driver.image && !driver.image_url) {
    // If neither exists, use placeholder
    driver.image = '/placeholder-driver.png';
    driver.image_url = '/placeholder-driver.png';
    console.log(`Set default image for driver: ${driver.name}`);
  }
  return driver;
});

// Save back to localStorage
localStorage.setItem('drivers', JSON.stringify(updatedDrivers));

console.log(`Fixed ${updatedDrivers.length} drivers in localStorage`);
alert(`Driver image fields have been fixed. Please refresh the page.`);