// Script to reset guides in localStorage to force reload from initialGuides with images
localStorage.removeItem('disassemblyGuides');
console.log('Disassembly guides reset - new guides with images will be loaded on next page visit');