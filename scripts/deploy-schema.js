import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Validate credentials
if (!supabaseUrl || !supabaseKey || 
    supabaseUrl === 'https://supabase-project-url.supabase.co' ||
    supabaseKey === 'your-supabase-anon-key') {
  console.error('Error: Supabase URL and/or anon key not configured properly.');
  console.error('Please update the .env file with your Supabase credentials.');
  console.error('If you don\'t have a Supabase project, create one at https://supabase.com/dashboard');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the schema SQL file
const schemaFilePath = path.join(process.cwd(), 'src', 'lib', 'supabase-schema.sql');
const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');

// Function to execute the SQL schema
async function deploySchema() {
  console.log('Deploying database schema to Supabase...');
  
  try {
    // Split SQL into individual statements (simplistic approach)
    const statements = schemaSql
      .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '') // Remove comments
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // Some errors are expected (e.g., table already exists)
          if (error.message.includes('already exists')) {
            console.log(`  Info: ${error.message}`);
          } else {
            console.error(`  Error: ${error.message}`);
          }
        }
      }
    }
    
    console.log('Schema deployment completed successfully.');
  } catch (err) {
    console.error('Error deploying schema:', err);
    process.exit(1);
  }
}

// Execute the script
deploySchema();