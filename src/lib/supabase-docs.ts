import { supabase } from './supabase';

// Document type definition
export interface Document {
  id: string;
  title: string;
  type: string; // pdf, word, pptx
  desc: string;
  down: string; // download URL
  category?: string;
  dateAdded?: string;
  fileSize?: string;
}

// Setup the documents table in Supabase
export async function setupDocsTable() {
  try {
    // Create docs table using execute_sql RPC
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS docs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          desc TEXT,
          down TEXT NOT NULL,
          category TEXT DEFAULT 'general',
          fileSize TEXT,
          dateAdded TIMESTAMPTZ DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS docs_title_idx ON docs(title);
        CREATE INDEX IF NOT EXISTS docs_type_idx ON docs(type);
        CREATE INDEX IF NOT EXISTS docs_category_idx ON docs(category);
      `
    });
    
    if (error) {
      console.error("Error creating docs table:", error);
      return false;
    }
    
    console.log("Docs table setup completed");
    return true;
  } catch (error) {
    console.error('Error setting up docs table:', error);
    return false;
  }
}

// Fetch all documents
export async function fetchDocuments(): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('docs')
      .select('*')
      .order('dateAdded', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    // Fallback to localStorage
    const localDocs = localStorage.getItem('protectedDocuments');
    return localDocs ? JSON.parse(localDocs) : [];
  }
}

// Add a new document
export async function addDocument(document: Omit<Document, 'id' | 'dateAdded'>): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from('docs')
      .insert({
        title: document.title,
        type: document.type,
        desc: document.desc,
        down: document.down,
        category: document.category || 'general',
        fileSize: document.fileSize,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    // Also update localStorage as fallback
    updateLocalStorage(data);
    
    return data;
  } catch (error) {
    console.error('Error adding document:', error);
    
    // Fallback to localStorage
    try {
      const localDocs = JSON.parse(localStorage.getItem('protectedDocuments') || '[]');
      const newDoc = {
        ...document,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString().split('T')[0]
      };
      localDocs.push(newDoc);
      localStorage.setItem('protectedDocuments', JSON.stringify(localDocs));
      return newDoc;
    } catch (e) {
      console.error('Error with localStorage fallback:', e);
      return null;
    }
  }
}

// Update a document
export async function updateDocument(document: Document): Promise<Document | null> {
  try {
    const { data, error } = await supabase
      .from('docs')
      .update({
        title: document.title,
        type: document.type,
        desc: document.desc,
        down: document.down,
        category: document.category || 'general',
        fileSize: document.fileSize
      })
      .eq('id', document.id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    // Also update localStorage as fallback
    updateLocalStorage(data);
    
    return data;
  } catch (error) {
    console.error('Error updating document:', error);
    
    // Fallback to localStorage
    try {
      const localDocs = JSON.parse(localStorage.getItem('protectedDocuments') || '[]');
      const docIndex = localDocs.findIndex((doc: Document) => doc.id === document.id);
      if (docIndex >= 0) {
        localDocs[docIndex] = { ...document };
        localStorage.setItem('protectedDocuments', JSON.stringify(localDocs));
        return document;
      }
      return null;
    } catch (e) {
      console.error('Error with localStorage fallback:', e);
      return null;
    }
  }
}

// Delete a document
export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('docs')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    // Also update localStorage as fallback
    try {
      const localDocs = JSON.parse(localStorage.getItem('protectedDocuments') || '[]');
      const updatedDocs = localDocs.filter((doc: Document) => doc.id !== id);
      localStorage.setItem('protectedDocuments', JSON.stringify(updatedDocs));
    } catch (e) {
      console.error('Error updating localStorage after delete:', e);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    
    // Fallback to localStorage
    try {
      const localDocs = JSON.parse(localStorage.getItem('protectedDocuments') || '[]');
      const updatedDocs = localDocs.filter((doc: Document) => doc.id !== id);
      localStorage.setItem('protectedDocuments', JSON.stringify(updatedDocs));
      return true;
    } catch (e) {
      console.error('Error with localStorage fallback:', e);
      return false;
    }
  }
}

// Helper to update localStorage when changes are made in Supabase
function updateLocalStorage(document: Document) {
  try {
    const localDocs = JSON.parse(localStorage.getItem('protectedDocuments') || '[]');
    const docIndex = localDocs.findIndex((doc: Document) => doc.id === document.id);
    
    if (docIndex >= 0) {
      // Update existing document
      localDocs[docIndex] = document;
    } else {
      // Add new document
      localDocs.push(document);
    }
    
    localStorage.setItem('protectedDocuments', JSON.stringify(localDocs));
  } catch (e) {
    console.error('Error updating localStorage:', e);
  }
}