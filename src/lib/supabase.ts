import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the types for users
export type User = {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isApproved?: boolean;
};

export type UserWithPassword = User & {
  password: string;
};

// Create database tables and schema
export async function setupSupabaseSchema() {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-supabase-project-url.supabase.co') {
      console.warn('Supabase not properly configured. Using localStorage fallback.');
      throw new Error('Supabase configuration missing or invalid');
    }
    
    // Create users table if it doesn't exist
    const { error: usersError } = await supabase.rpc('create_users_table', {});
    if (usersError && !usersError.message.includes('already exists')) {
      console.error('Error creating users table:', usersError);
    }

    // Create guides table if it doesn't exist
    const { error: guidesError } = await supabase.rpc('create_guides_table', {});
    if (guidesError && !guidesError.message.includes('already exists')) {
      console.error('Error creating guides table:', guidesError);
    }

    // Create drivers table if it doesn't exist
    const { error: driversError } = await supabase.rpc('create_drivers_table', {});
    if (driversError && !driversError.message.includes('already exists')) {
      console.error('Error creating drivers table:', driversError);
    }

    // Create requests table if it doesn't exist
    const { error: requestsError } = await supabase.rpc('create_requests_table', {});
    if (requestsError && !requestsError.message.includes('already exists')) {
      console.error('Error creating requests table:', requestsError);
    }

    // Create test_tools table if it doesn't exist
    const { error: toolsError } = await supabase.rpc('create_test_tools_table', {});
    if (toolsError && !toolsError.message.includes('already exists')) {
      console.error('Error creating test_tools table:', toolsError);
    }

    // Create disassembly_guides table if it doesn't exist
    const { error: disassemblyError } = await supabase.rpc('create_disassembly_guides_table', {});
    if (disassemblyError && !disassemblyError.message.includes('already exists')) {
      console.error('Error creating disassembly_guides table:', disassemblyError);
    }
    
    console.log('Supabase schema setup completed');
  } catch (error) {
    console.error('Error setting up Supabase schema:', error);
    throw error; // Rethrow to trigger fallback
  }
}

// Add initial admin user if none exists
export async function ensureAdminUser() {
  const { data: existingAdmins, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('isAdmin', true)
    .limit(1);

  if (fetchError) {
    console.error('Error checking for admin users:', fetchError);
    return;
  }

  if (!existingAdmins || existingAdmins.length === 0) {
    // No admin users found, create one
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        email: 'admin@techsuptet.com',
        username: 'admin',
        password: 'admin123', // In a real app, this would be hashed
        isAdmin: true,
        isApproved: true
      });

    if (insertError) {
      console.error('Error creating admin user:', insertError);
    } else {
      console.log('Initial admin user created');
    }
  }
}