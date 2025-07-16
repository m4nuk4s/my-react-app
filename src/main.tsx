import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './lib/supabase';
import './pages/models.js'; // Initialize computer models

// Log Supabase connection status for debugging
console.log('Supabase client initialized:', !!supabase);

createRoot(document.getElementById('root')!).render(<App />);