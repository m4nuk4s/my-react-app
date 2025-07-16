// modelManager.ts - Utility to manage computer models
import { supabase } from "../lib/supabase";

// App-specific table name for computer models
const APP_MODELS_TABLE = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_models';

/**
 * Save models to Supabase
 * @param models Array of model IDs
 */
const saveModelsToSupabase = async (models: string[]): Promise<boolean> => {
  try {
    // First delete all existing models to avoid duplicates
    await supabase
      .from(APP_MODELS_TABLE)
      .delete()
      .neq('model_name', '');

    // Then insert all models
    const modelsToInsert = models.map(model => ({
      model_name: model,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from(APP_MODELS_TABLE)
      .insert(modelsToInsert);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving models to Supabase:', error);
    return false;
  }
};

/**
 * Initialize default computer models if none exist
 */
export const initializeModels = async (): Promise<string[]> => {
  try {
    // First try to get models from Supabase
    const { data: supabaseModels, error } = await supabase
      .from(APP_MODELS_TABLE)
      .select('model_name');
    
    if (!error && supabaseModels && supabaseModels.length > 0) {
      // Models found in Supabase
      const modelNames = supabaseModels.map(item => item.model_name);
      // Update localStorage for offline access
      localStorage.setItem('computerModels', JSON.stringify(modelNames));
      return modelNames;
    }
    
    // If no models in Supabase or there was an error, check localStorage
    const existingModels = localStorage.getItem('computerModels');
    if (existingModels) {
      const models = JSON.parse(existingModels);
      // Try to sync these models back to Supabase
      await saveModelsToSupabase(models);
      return models;
    } 
    
    // No models found anywhere, initialize defaults
    const defaultModels = [
      "UKN15I711-8GR512",
      "UKN15I310-8DG256-IF1599445",
      "UA-N15C8SL512"
    ];
    
    // Save to localStorage
    localStorage.setItem('computerModels', JSON.stringify(defaultModels));
    
    // Save to Supabase
    await saveModelsToSupabase(defaultModels);
    
    console.log('Default computer models initialized');
    return defaultModels;
  } catch (error) {
    console.error('Error initializing computer models:', error);
    // Fallback to local storage only
    const storedModels = localStorage.getItem('computerModels');
    if (storedModels) {
      return JSON.parse(storedModels);
    }
    
    const defaultModels = [
      "UKN15I711-8GR512",
      "UKN15I310-8DG256-IF1599445",
      "UA-N15C8SL512"
    ];
    localStorage.setItem('computerModels', JSON.stringify(defaultModels));
    return defaultModels;
  }
};

/**
 * Add a new computer model
 * @param model Model ID to add
 * @returns Updated models array
 */
export const addModel = async (model: string): Promise<string[]> => {
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
    
    // Save to localStorage
    localStorage.setItem('computerModels', JSON.stringify(updatedModels));
    
    // Save to Supabase
    try {
      const { error } = await supabase
        .from(APP_MODELS_TABLE)
        .insert([{ model_name: model.trim(), created_at: new Date().toISOString() }]);
        
      if (error) {
        console.error('Error adding model to Supabase:', error);
      }
    } catch (supabaseError) {
      console.error('Failed to add model to Supabase:', supabaseError);
    }
    
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
export const deleteModel = async (model: string): Promise<string[]> => {
  try {
    // Get current models
    const storedModels = localStorage.getItem('computerModels') || '[]';
    const models = JSON.parse(storedModels);
    
    // Filter out the model
    const updatedModels = models.filter((m: string) => m !== model);
    
    // Save updated list to localStorage
    localStorage.setItem('computerModels', JSON.stringify(updatedModels));
    
    // Remove from Supabase
    try {
      const { error } = await supabase
        .from(APP_MODELS_TABLE)
        .delete()
        .eq('model_name', model);
        
      if (error) {
        console.error('Error deleting model from Supabase:', error);
      }
    } catch (supabaseError) {
      console.error('Failed to delete model from Supabase:', supabaseError);
    }
    
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
export const getAllModels = async (): Promise<string[]> => {
  try {
    // First try to get models from Supabase
    const { data: supabaseModels, error } = await supabase
      .from(APP_MODELS_TABLE)
      .select('model_name');
    
    if (!error && supabaseModels && supabaseModels.length > 0) {
      // Models found in Supabase
      const modelNames = supabaseModels.map(item => item.model_name);
      // Update localStorage for offline access
      localStorage.setItem('computerModels', JSON.stringify(modelNames));
      return modelNames;
    }
    
    // Fallback to localStorage if Supabase fails
    const storedModels = localStorage.getItem('computerModels') || '[]';
    return JSON.parse(storedModels);
  } catch (error) {
    console.error('Error getting models:', error);
    // Fallback to localStorage
    const storedModels = localStorage.getItem('computerModels') || '[]';
    return JSON.parse(storedModels);
  }
};