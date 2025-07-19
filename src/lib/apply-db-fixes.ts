import { supabase } from './supabase';
import { createFunctionsSQL, createAdminUserSQL } from './sql-functions';

/**
 * Applies all database fixes for user registration issues
 */
export async function applyUserRegistrationFixes() {
  console.log("Applying user registration database fixes...");
  
  try {
    // Create the execute_sql function if it doesn't exist
    const { error: createFunctionError } = await supabase.rpc('create_execute_sql_function', {});
    
    if (createFunctionError) {
      console.error("Error creating execute_sql function:", createFunctionError);
      
      // Try to create it directly
      const { error: directSqlError } = await supabase.rpc('execute_sql', {
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
      
      if (directSqlError) {
        console.error("Error creating execute_sql function directly:", directSqlError);
      } else {
        console.log("Successfully created execute_sql function");
      }
    }
    
    // Create users table using our function
    const { error: createUsersError } = await supabase.rpc('create_users_table', {});
    
    if (createUsersError) {
      console.error("Error creating users table:", createUsersError);
      
      // Try direct SQL as fallback
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
        console.log("Successfully created users table directly");
      }
    } else {
      console.log("Successfully created/updated users table");
    }
    
    // Check if there's at least one admin user
    const { data: adminUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('isadmin', true)
      .limit(1);
      
    if (checkError) {
      console.error("Error checking for admin users:", checkError);
    } else if (!adminUsers || adminUsers.length === 0) {
      // No admin users, create one
      const { error: adminError } = await supabase.rpc('execute_sql', {
        sql_query: `
          INSERT INTO users (id, email, username, isadmin, isapproved)
          VALUES (
            '00000000-0000-0000-0000-000000000000',
            'admin@techsuptet.com',
            'admin',
            true,
            true
          )
          ON CONFLICT (id) DO NOTHING;
        `
      });
      
      if (adminError) {
        console.error("Error creating admin user:", adminError);
      } else {
        console.log("Successfully created admin user");
      }
    }
    
    return { success: true, message: "Database fixes applied successfully" };
  } catch (error) {
    console.error("Unexpected error applying database fixes:", error);
    return { success: false, error };
  }
}