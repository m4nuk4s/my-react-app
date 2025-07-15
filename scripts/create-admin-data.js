import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

// Admin user data
const adminUsername = process.argv[2] || 'Administrador';
const adminPassword = process.argv[3] || 'manukas1993';
const adminEmail = `${adminUsername.toLowerCase()}@techsuptet.com`;

// Sample departments
const departments = [
  { name: 'IT', description: 'Information Technology' },
  { name: 'HR', description: 'Human Resources' },
  { name: 'Finance', description: 'Finance and Accounting' },
  { name: 'Support', description: 'Customer Support' },
  { name: 'General', description: 'General Inquiries' }
];

// Function to create admin user and initialize data
async function createAdminAndData() {
  try {
    console.log(`Creating admin user: ${adminUsername} (${adminEmail})`);
    
    // 1. Sign up the admin user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          username: adminUsername,
          isAdmin: true,
          isApproved: true
        }
      }
    });
    
    if (signUpError) {
      console.error('Error creating auth user:', signUpError.message);
      
      // Try to get the user by email - they might already exist
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError.message);
        return;
      }
      
      const existingUser = users?.find(u => u.email === adminEmail);
      
      if (!existingUser) {
        console.error('Could not create or find admin user');
        return;
      }
      
      console.log('Admin user already exists in auth:', existingUser.id);
      
      // 2. Check if admin exists in users table
      const { data: existingUserData } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail)
        .single();
        
      if (existingUserData) {
        console.log('Admin user already exists in users table');
      } else {
        // Add admin to users table using the existing auth id
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: existingUser.id,
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
    } else {
      console.log('Admin user created in auth');
      
      // 2. Insert admin into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
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
    
    // 3. Insert default departments
    console.log('Creating default departments...');
    for (const dept of departments) {
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
        } else {
          console.log(`Department ${dept.name} created`);
        }
      } else {
        console.log(`Department ${dept.name} already exists`);
      }
    }
    
    console.log('Admin user and initial data setup completed');
  } catch (err) {
    console.error('Error setting up admin and data:', err);
  }
}

// Execute the function
createAdminAndData();