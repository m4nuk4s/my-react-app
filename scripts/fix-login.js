import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yjjvppiknlutenhoonqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqanZwcGlrbmx1dGVuaG9vbnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIzODQsImV4cCI6MjA2ODE4ODM4NH0.1xxIerxoOM89NIjEHQEjp_d1Nv4ncqhVCPSt0fP7cD4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAdminUser() {
  console.log('Starting admin user fix...');
  
  try {
    // 1. Check if the admin user exists in Supabase Auth
    const { data: authUserData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error listing auth users:', authError.message);
      return;
    }

    console.log(`Found ${authUserData?.users?.length || 0} auth users`);
    
    // 2. Check for admin user in the users table
    const { data: dbAdmins, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('isAdmin', true);
      
    if (dbError) {
      console.error('Error fetching admins from database:', dbError.message);
      return;
    }
    
    console.log(`Found ${dbAdmins?.length || 0} admin users in database`);
    
    // Find the Administrador user in auth
    const adminAuthUser = authUserData?.users?.find(u => 
      u.email === 'administrador@techsuptet.com' || u.email === 'admin@techsuptet.com');
      
    if (!adminAuthUser) {
      console.error('Admin user not found in auth system');
      return;
    }
    
    console.log('Admin auth user found:', adminAuthUser.id, adminAuthUser.email);
    
    // Check if this user exists in the database
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('id', adminAuthUser.id);
      
    if (existingError) {
      console.error('Error checking for existing user:', existingError.message);
      return;
    }
    
    if (existingUser && existingUser.length > 0) {
      console.log('Admin user already exists in database, updating...');
      
      // Update the user record
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: adminAuthUser.email,
          username: 'Administrador',
          isAdmin: true,
          isApproved: true
        })
        .eq('id', adminAuthUser.id);
        
      if (updateError) {
        console.error('Error updating admin user:', updateError.message);
        return;
      }
    } else {
      console.log('Admin user does not exist in database, creating...');
      
      // Insert the admin user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: adminAuthUser.id,
          email: adminAuthUser.email,
          username: 'Administrador',
          isAdmin: true,
          isApproved: true
        });
        
      if (insertError) {
        console.error('Error inserting admin user:', insertError.message);
        return;
      }
    }
    
    console.log('Admin user fixed successfully');
    
    // Verify the fix
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', adminAuthUser.id)
      .single();
      
    if (verifyError) {
      console.error('Error verifying user fix:', verifyError.message);
      return;
    }
    
    console.log('Verified user record:', verifyUser);
    
  } catch (error) {
    console.error('Unexpected error during user fix:', error);
  }
}

// Run the fix
fixAdminUser().then(() => {
  console.log('Fix operation completed');
});