// modelManager.ts - Utility to manage computer models

/**
 * Initialize default computer models if none exist
 */
export const initializeModels = () => {
  try {
    // Get existing models or initialize
    const existingModels = localStorage.getItem('computerModels');
    if (!existingModels) {
      // Set default models
      const defaultModels = [
        "UKN15I711-8GR512",
        "UKN15I310-8DG256-IF1599445",
        "UA-N15C8SL512"
      ];
      
      // Save to localStorage
      localStorage.setItem('computerModels', JSON.stringify(defaultModels));
      console.log('Default computer models initialized');
      return defaultModels;
    }
    return JSON.parse(existingModels);
  } catch (error) {
    console.error('Error initializing computer models:', error);
    return [];
  }
};

/**
 * Add a new computer model
 * @param model Model ID to add
 * @returns Updated models array
 */
export const addModel = (model: string): string[] => {
  try {
    if (!model.trim()) {
      throw new Error('Model ID cannot be empty');
    }
    
    // Get current models
    const storedModels = localStorage.getItem('computerModels') || '[]';
    const models = JSON.parse(storedModels);
    
    // Check if model already exists
    if (models.includes(model.trim())) {
      throw new Error('Model already exists');
    }
    
    // Add new model
    const updatedModels = [...models, model.trim()];
    localStorage.setItem('computerModels', JSON.stringify(updatedModels));
    
    return updatedModels;
  } catch (error) {
    console.error('Error adding model:', error);
    throw error;
  }
};

/**
 * Delete a computer model
 * @param model Model ID to delete
 * @returns Updated models array
 */
export const deleteModel = (model: string): string[] => {
  try {
    // Get current models
    const storedModels = localStorage.getItem('computerModels') || '[]';
    const models = JSON.parse(storedModels);
    
    // Filter out the model
    const updatedModels = models.filter((m: string) => m !== model);
    
    // Save updated list
    localStorage.setItem('computerModels', JSON.stringify(updatedModels));
    
    return updatedModels;
  } catch (error) {
    console.error('Error deleting model:', error);
    throw error;
  }
};

/**
 * Get all computer models
 * @returns Array of model IDs
 */
export const getAllModels = (): string[] => {
  try {
    const storedModels = localStorage.getItem('computerModels') || '[]';
    return JSON.parse(storedModels);
  } catch (error) {
    console.error('Error getting models:', error);
    return [];
  }
};