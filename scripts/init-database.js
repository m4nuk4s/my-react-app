import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Simple function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Read the schema SQL file
const schemaFilePath = path.join(__dirname, '..', 'src', 'lib', 'supabase-schema.sql');
const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');

// Sample data
const defaultDepartments = [
  { name: 'IT', description: 'Information Technology' },
  { name: 'HR', description: 'Human Resources' },
  { name: 'Finance', description: 'Finance and Accounting' },
  { name: 'Support', description: 'Customer Support' },
  { name: 'General', description: 'General Inquiries' }
];

// Admin user data
const adminUsername = process.argv[2] || 'Administrador';
const adminPassword = process.argv[3] || 'manukas1993';
const adminEmail = `${adminUsername.toLowerCase()}@techsuptet.com`;

// Function to execute the SQL schema and initialize data
async function initDatabase() {
  console.log('Initializing database...');
  
  try {
    // 1. Create admin user in auth
    console.log(`Creating admin user: ${adminUsername} (${adminEmail})`);
    
    // First check if the user already exists
    const { data: existingAuthUser, error: lookupError } = await supabase.auth.admin.listUsers();
    
    if (lookupError) {
      console.error('Error looking up existing users:', lookupError.message);
    }
    
    const userExists = existingAuthUser?.users?.some(user => user.email === adminEmail);
    
    if (userExists) {
      console.log(`User with email ${adminEmail} already exists. Skipping user creation.`);
    } else {
      // Create the user in Auth
      const { data: authUser, error: signUpError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { 
          username: adminUsername,
          isAdmin: true,
          isApproved: true
        }
      });
      
      if (signUpError) {
        console.error('Error creating admin user in auth:', signUpError.message);
      } else {
        console.log(`Admin user created in auth: ${authUser.user.id}`);
        
        // 2. Create admin user in users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            email: adminEmail,
            username: adminUsername,
            isAdmin: true,
            isApproved: true,
            department: 'IT',
            role: 'admin'
          });
          
        if (insertError) {
          console.error('Error inserting admin into users table:', insertError.message);
        } else {
          console.log('Admin user added to users table');
        }
      }
    }
    
    // 3. Insert default departments if they don't exist
    for (const dept of defaultDepartments) {
      const { data: existingDept } = await supabase
        .from('departments')
        .select('name')
        .eq('name', dept.name)
        .single();
        
      if (!existingDept) {
        const { error } = await supabase
          .from('departments')
          .insert(dept);
          
        if (error) {
          console.error(`Error inserting department ${dept.name}:`, error.message);
        }
      }
    }
    
    console.log('Default departments inserted');
    console.log('Database initialization completed successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

// Execute the script
initDatabase();