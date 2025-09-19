-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  isAdmin BOOLEAN NOT NULL DEFAULT false,
  isApproved BOOLEAN NOT NULL DEFAULT false,
  department TEXT DEFAULT 'general',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Insert default departments
INSERT INTO departments (name, description) VALUES
  ('IT', 'Information Technology'),
  ('HR', 'Human Resources'),
  ('Finance', 'Finance and Accounting'),
  ('Support', 'Customer Support'),
  ('General', 'General Inquiries')
ON CONFLICT (name) DO NOTHING;

-- Set up Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Admins can do anything
CREATE POLICY "Admins can do anything with users" ON users
  USING (
    (SELECT isAdmin FROM users WHERE id = auth.uid())
  );

-- Users can read approved users
CREATE POLICY "Users can read approved users" ON users
  FOR SELECT
  USING (isApproved = true OR id = auth.uid());

-- Users can read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Tickets policies
-- Admins can do anything
CREATE POLICY "Admins can do anything with tickets" ON tickets
  USING (
    (SELECT isAdmin FROM users WHERE id = auth.uid())
  );

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can read all tickets
CREATE POLICY "Users can read all tickets" ON tickets
  FOR SELECT
  USING (true);

-- Users can update their own tickets
CREATE POLICY "Users can update their own tickets" ON tickets
  FOR UPDATE
  USING (created_by = auth.uid());

-- Assigned users can update assigned tickets
CREATE POLICY "Assigned users can update assigned tickets" ON tickets
  FOR UPDATE
  USING (assigned_to = auth.uid());

-- Comments policies
-- Admins can do anything
CREATE POLICY "Admins can do anything with comments" ON comments
  USING (
    (SELECT isAdmin FROM users WHERE id = auth.uid())
  );

-- Users can create comments
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can read all comments
CREATE POLICY "Users can read all comments" ON comments
  FOR SELECT
  USING (true);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE
  USING (user_id = auth.uid());

-- Departments policies
-- Everyone can read departments
CREATE POLICY "Everyone can read departments" ON departments
  FOR SELECT
  USING (true);

-- Only admins can modify departments
CREATE POLICY "Only admins can modify departments" ON departments
  USING (
    (SELECT isAdmin FROM users WHERE id = auth.uid())
  );

-- Create functions and triggers
-- Function to convert snake_case to camelCase for JSON output
CREATE OR REPLACE FUNCTION to_camel_case(snake_case text) 
RETURNS text AS $$
  SELECT string_agg(
    CASE 
      WHEN ordinality = 1 THEN word
      ELSE INITCAP(word)
    END,
    ''
  )
  FROM unnest(string_to_array(snake_case, '_')) WITH ORDINALITY AS t(word, ordinality);
$$ LANGUAGE SQL IMMUTABLE;

-- Create trigger function to automatically update the username in comments when a user's username changes
CREATE OR REPLACE FUNCTION update_comment_username() RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET username = NEW.username WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update comment username when user username changes
CREATE TRIGGER update_comment_username_trigger
AFTER UPDATE OF username ON users
FOR EACH ROW
WHEN (OLD.username IS DISTINCT FROM NEW.username)
EXECUTE FUNCTION update_comment_username();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tickets_created_by_idx ON tickets (created_by);
CREATE INDEX IF NOT EXISTS tickets_assigned_to_idx ON tickets (assigned_to);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status);
CREATE INDEX IF NOT EXISTS tickets_priority_idx ON tickets (priority);
CREATE INDEX IF NOT EXISTS comments_ticket_id_idx ON comments (ticket_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments (user_id);