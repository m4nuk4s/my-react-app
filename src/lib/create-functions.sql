-- Function to create users table
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  -- Create users table if it doesn't exist
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

  -- Create index for better performance
  CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
  CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);

  -- Set up Row Level Security (RLS)
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  
  -- Admins can do anything with users
  DROP POLICY IF EXISTS "Admins can do anything with users" ON users;
  CREATE POLICY "Admins can do anything with users" ON users
    USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND isadmin = true)
    );
  
  -- Users can read approved users
  DROP POLICY IF EXISTS "Users can read approved users" ON users;
  CREATE POLICY "Users can read approved users" ON users
    FOR SELECT
    USING (isapproved = true OR id = auth.uid());
  
  -- Users can read their own data
  DROP POLICY IF EXISTS "Users can read their own data" ON users;
  CREATE POLICY "Users can read their own data" ON users
    FOR SELECT
    USING (id = auth.uid());
END;
$$ LANGUAGE plpgsql;

-- Function to create execute_sql function (if it doesn't exist)
-- This allows us to execute arbitrary SQL for schema fixes
CREATE OR REPLACE FUNCTION create_execute_sql_function()
RETURNS void AS $$
BEGIN
  -- Create execute_sql function if it doesn't exist
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
END;
$$ LANGUAGE plpgsql;