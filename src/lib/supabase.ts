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
    
    // First, try to create execute_sql function
    try {
      const { error: sqlFnError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE OR REPLACE FUNCTION execute_sql(sql_query text) 
          RETURNS text AS $$
          BEGIN
            EXECUTE sql_query;
            RETURN 'SQL executed successfully';
          EXCEPTION 
            WHEN others THEN
              RETURN 'Error: ' || SQLERRM;
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      
      if (sqlFnError) {
        console.log('execute_sql function may already exist or failed to create:', sqlFnError);
      }
    } catch (fnError) {
      console.error('Error creating execute_sql function:', fnError);
    }
    
    // Create users table with direct SQL if possible
    try {
      const { error: directSqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL,
            isadmin BOOLEAN NOT NULL DEFAULT false,
            isapproved BOOLEAN NOT NULL DEFAULT false,
            department TEXT DEFAULT 'general',
            role TEXT DEFAULT 'user',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
          CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
        `
      });
      
      if (directSqlError) {
        console.error("Error creating users table directly:", directSqlError);
      } else {
        console.log("Successfully created/verified users table directly");
      }
    } catch (directError) {
      console.error('Error with direct SQL for users table:', directError);
    }
    
    // Try with the function approach as fallback
    const { error: usersError } = await supabase.rpc('create_users_table', {});
    if (usersError && !usersError.message?.includes('already exists')) {
      console.error('Error creating users table:', usersError);
    }

    // Create guides table if it doesn't exist
    const { error: guidesError } = await supabase.rpc('create_guides_table', {});
    if (guidesError && !guidesError.message?.includes('already exists')) {
      console.error('Error creating guides table:', guidesError);
    }

    // Create drivers table if it doesn't exist
    const { error: driversError } = await supabase.rpc('create_drivers_table', {});
    if (driversError && !driversError.message?.includes('already exists')) {
      console.error('Error creating drivers table:', driversError);
    }

    // Create requests table if it doesn't exist
    const { error: requestsError } = await supabase.rpc('create_requests_table', {});
    if (requestsError && !requestsError.message?.includes('already exists')) {
      console.error('Error creating requests table:', requestsError);
    }

    // Create test_tools table if it doesn't exist
    const { error: toolsError } = await supabase.rpc('create_test_tools_table', {});
    if (toolsError && !toolsError.message?.includes('already exists')) {
      console.error('Error creating test_tools table:', toolsError);
    }

    // Create disassembly_guides table if it doesn't exist
    const { error: disassemblyError } = await supabase.rpc('create_disassembly_guides_table', {});
    if (disassemblyError && !disassemblyError.message?.includes('already exists')) {
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
  try {
    console.log("Checking for admin users...");
    
    // First check using lowercase column name
    const { data: existingAdmins, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('isadmin', true) // Using lowercase column name
      .limit(1);

    if (fetchError) {
      console.error('Error checking for admin users:', fetchError);
      
      // Try alternative approach - direct SQL
      try {
        const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            SELECT COUNT(*) as admin_count FROM users WHERE isadmin = true LIMIT 1;
          `
        });
        
        if (sqlError) {
          console.error('SQL error checking for admin users:', sqlError);
          throw sqlError;
        }
        
        // If we found admins, return
        if (sqlData && sqlData.length > 0 && sqlData[0].admin_count > 0) {
          console.log('Admin users exist (SQL check)');
          return;
        }
      } catch (sqlCheckError) {
        console.error('Error with SQL check for admin users:', sqlCheckError);
      }
    }

    // If no admin users found or error checking, try to create one
    if (!existingAdmins || existingAdmins.length === 0) {
      console.log('No admin users found, creating one...');
      
      // Try to create admin user in auth first
      try {
        // Check if admin auth user exists
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        let adminUserId = null;
        
        if (authError) {
          console.error('Error checking for admin auth users:', authError);
        } else if (authData.users.some(u => u.email === 'admin@techsuptet.com')) {
          // Admin auth user exists
          adminUserId = authData.users.find(u => u.email === 'admin@techsuptet.com')?.id;
          console.log('Found existing admin auth user:', adminUserId);
        } else {
          // Create admin auth user
          const { data: adminUser, error: createError } = await supabase.auth.admin.createUser({
            email: 'admin@techsuptet.com',
            password: 'admin123',
            email_confirm: true,
            user_metadata: { username: 'admin' }
          });
          
          if (createError) {
            console.error('Error creating admin auth user:', createError);
          } else {
            adminUserId = adminUser.user?.id;
            console.log('Created admin auth user:', adminUserId);
          }
        }
        
        // Now create or update the admin user in the users table
        if (adminUserId) {
          // Use upsert to either insert or update
          const { error: insertError } = await supabase
            .from('users')
            .upsert({
              id: adminUserId,
              email: 'admin@techsuptet.com',
              username: 'admin',
              isadmin: true, // Using lowercase column name
              isapproved: true // Using lowercase column name
            }, { onConflict: 'id' });

          if (insertError) {
            console.error('Error creating admin user in users table:', insertError);
            
            // Try direct SQL as fallback
            const { error: sqlError } = await supabase.rpc('execute_sql', {
              sql_query: `
                INSERT INTO users (id, email, username, isadmin, isapproved)
                VALUES ('${adminUserId}', 'admin@techsuptet.com', 'admin', true, true)
                ON CONFLICT (id) DO UPDATE SET
                  email = EXCLUDED.email,
                  username = EXCLUDED.username,
                  isadmin = EXCLUDED.isadmin,
                  isapproved = EXCLUDED.isapproved;
              `
            });
            
            if (sqlError) {
              console.error('SQL error creating admin user:', sqlError);
            } else {
              console.log('Admin user created/updated using SQL');
            }
          } else {
            console.log('Admin user created/updated successfully in users table');
          }
        }
      } catch (authCreateError) {
        console.error('Error handling admin auth user:', authCreateError);
      }
    } else {
      console.log('Admin users already exist');
    }
    
    // Always update localStorage as fallback
    try {
      const storedUsers = localStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Check if admin user exists in localStorage
      const adminExists = users.some((u: UserWithPassword) => u.isAdmin);
      
      if (!adminExists) {
        // Add admin user to localStorage
        users.push({
          id: '1',
          email: 'admin@techsuptet.com',
          username: 'admin',
          password: 'admin123', // In localStorage only
          isAdmin: true,
          isApproved: true
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Admin user added to localStorage');
      }
    } catch (localStorageError) {
      console.error('Error updating localStorage:', localStorageError);
    }
  } catch (error) {
    console.error('Unexpected error in ensureAdminUser:', error);
  }
}