import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yjjvppiknlutenhoonqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqanZwcGlrbmx1dGVuaG9vbnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIzODQsImV4cCI6MjA2ODE4ODM4NH0.1xxIerxoOM89NIjEHQEjp_d1Nv4ncqhVCPSt0fP7cD4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function for admin login
async function testAdminLogin() {
  // Admin credentials
  const email = 'administrador@techsuptet.com';
  const password = 'manukas1993';
  
  console.log(`Testing login for: ${email}`);
  
  try {
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Login failed:', error.message);
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
    
    // Also try the alternate admin credentials from the code
    console.log('\nTesting login for: admin@techsuptet.com');
    const { data: altData, error: altError } = await supabase.auth.signInWithPassword({
      email: 'admin@techsuptet.com',
      password: 'admin123'
    });
    
    if (altError) {
      console.error('Alternate admin login failed:', altError.message);
    } else {
      console.log('Alternate admin auth successful:', altData.user?.id);
    }
    
  } catch (error) {
    console.error('Unexpected error during login test:', error);
  }
}

// Run the test
testAdminLogin().then(() => {
  console.log('Test completed');
});