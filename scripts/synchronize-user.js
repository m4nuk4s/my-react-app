import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yjjvppiknlutenhoonqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqanZwcGlrbmx1dGVuaG9vbnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIzODQsImV4cCI6MjA2ODE4ODM4NH0.1xxIerxoOM89NIjEHQEjp_d1Nv4ncqhVCPSt0fP7cD4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function synchronizeAdminUser() {
  console.log('Starting admin user synchronization...');
  
  try {
    // Admin credentials
    const email = 'administrador@techsuptet.com';
    const password = 'manukas1993';
    
    // 1. Sign in with admin credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.error('Admin login failed:', signInError.message);
      return;
    }
    
    console.log('Admin authenticated successfully:', signInData.user.id);
    
    // 2. Check if user record exists in the database
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user.id);
      
    if (checkError) {
      console.error('Error checking for existing user record:', checkError.message);
      return;
    }
    
    if (existingUser && existingUser.length > 0) {
      console.log('Admin user record already exists, updating...');
      
      // 3a. Update the user record if it exists
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: email,
          username: 'Administrador',
          // Use lowercase column names to match the database schema
          isadmin: true,
          isapproved: true,
          department: 'IT',
          role: 'Administrator'
        })
        .eq('id', signInData.user.id);
        
      if (updateError) {
        console.error('Error updating admin user record:', updateError.message);
        return;
      }
      
      console.log('Admin user record updated successfully');
    } else {
      console.log('Admin user record does not exist, creating...');
      
      // 3b. Create the user record if it doesn't exist
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: signInData.user.id,
          email: email,
          username: 'Administrador',
          // Use lowercase column names to match the database schema
          isadmin: true,
          isapproved: true,
          department: 'IT',
          role: 'Administrator'
        });
        
      if (insertError) {
        console.error('Error creating admin user record:', insertError.message);
        return;
      }
      
      console.log('Admin user record created successfully');
    }
    
    // 4. Verify the user record
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user.id)
      .single();
      
    if (verifyError) {
      console.error('Error verifying user record:', verifyError.message);
      return;
    }
    
    console.log('Verified admin user record:', verifyUser);
    
    // 5. Try login again
    await testAdminLogin();
    
  } catch (error) {
    console.error('Unexpected error during user synchronization:', error);
  }
}

async function testAdminLogin() {
  console.log('\nTesting login after synchronization...');
  
  // Admin credentials
  const email = 'administrador@techsuptet.com';
  const password = 'manukas1993';
  
  try {
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login test failed:', error.message);
      return;
    }
    
    console.log('Auth successful:', data.user?.id);
    
    // Check user profile in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single();
      
    if (userError) {
      console.error('User profile lookup failed:', userError.message);
      return;
    }
    
    console.log('User profile found:', userData);
    console.log('Login test successful!');
    
  } catch (error) {
    console.error('Unexpected error during login test:', error);
  }
}

// Run the synchronization
synchronizeAdminUser().then(() => {
  console.log('Synchronization completed');
});