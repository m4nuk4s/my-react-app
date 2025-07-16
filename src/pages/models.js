// Import the modelManager utility for consistent model management
import { initializeModels } from '../utils/modelManager';

// Initialize the computer models in localStorage if they don't exist
function initializeComputerModels() {
  try {
    // Use the modelManager utility for initialization
    initializeModels();
    console.log('Computer models initialized');
  } catch (error) {
    console.error('Error initializing computer models:', error);
  }
}

// Execute initialization when the file is loaded
initializeComputerModels();