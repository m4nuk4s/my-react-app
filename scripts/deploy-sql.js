import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
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

// Read the schema SQL file
const schemaFilePath = path.join(__dirname, '..', 'src', 'lib', 'supabase-schema.sql');
const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');

// Function to execute SQL queries
async function executeQuery(query) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: query });
    if (error) {
      // Some errors are expected (e.g., table already exists)
      if (error.message && error.message.includes('already exists')) {
        console.log(`  Info: ${error.message}`);
        return true;
      } else {
        console.error(`  Error: ${error.message}`);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('  Error executing query:', err.message);
    return false;
  }
}

// Execute SQL directly using pgAdmin-style SQL
async function deploySchemaManually() {
  console.log('Deploying database schema to Supabase...');
  
  // Enable UUID extension
  await executeQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  
  // Create users table
  console.log('Creating users table...');
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL,
      isAdmin BOOLEAN NOT NULL DEFAULT false,
      isApproved BOOLEAN NOT NULL DEFAULT false,
      department TEXT DEFAULT 'general',
      role TEXT DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  
  // Create tickets table
  console.log('Creating tickets table...');
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS public.tickets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      priority TEXT NOT NULL DEFAULT 'medium',
      created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
      department TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  
  // Create comments table
  console.log('Creating comments table...');
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS public.comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  
  // Create departments table
  console.log('Creating departments table...');
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS public.departments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );
  `);
  
  // Create additional tables for guides and drivers if needed
  console.log('Creating guides table...');
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS public.guides (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      thumbnail TEXT,
      author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  
  console.log('Creating drivers table...');
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS public.drivers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      description TEXT,
      os_version TEXT,
      device_model TEXT,
      download_url TEXT,
      author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  
  console.log('Creating disassembly_guides table...');
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS public.disassembly_guides (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      device_model TEXT NOT NULL,
      difficulty TEXT,
      estimated_time TEXT,
      thumbnail TEXT,
      author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  
  // Enable Row Level Security
  console.log('Enabling Row Level Security...');
  await executeQuery('ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;');
  await executeQuery('ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;');
  await executeQuery('ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;');
  await executeQuery('ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;');
  await executeQuery('ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;');
  await executeQuery('ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;');
  await executeQuery('ALTER TABLE public.disassembly_guides ENABLE ROW LEVEL SECURITY;');
  
  // Create RLS policies for users
  console.log('Creating RLS policies for users...');
  await executeQuery(`
    CREATE POLICY "Admins can do anything with users" ON public.users
      FOR ALL TO authenticated
      USING ((SELECT isAdmin FROM public.users WHERE id = auth.uid()));
  `);
  
  await executeQuery(`
    CREATE POLICY "Users can read approved users" ON public.users
      FOR SELECT TO authenticated
      USING (isApproved = true OR id = auth.uid());
  `);
  
  await executeQuery(`
    CREATE POLICY "Users can read their own data" ON public.users
      FOR SELECT TO authenticated
      USING (id = auth.uid());
  `);
  
  // Create RLS policies for tickets
  console.log('Creating RLS policies for tickets...');
  await executeQuery(`
    CREATE POLICY "Admins can do anything with tickets" ON public.tickets
      FOR ALL TO authenticated
      USING ((SELECT isAdmin FROM public.users WHERE id = auth.uid()));
  `);
  
  await executeQuery(`
    CREATE POLICY "Users can create tickets" ON public.tickets
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL);
  `);
  
  await executeQuery(`
    CREATE POLICY "Users can read all tickets" ON public.tickets
      FOR SELECT TO authenticated
      USING (true);
  `);
  
  await executeQuery(`
    CREATE POLICY "Users can update their own tickets" ON public.tickets
      FOR UPDATE TO authenticated
      USING (created_by = auth.uid());
  `);
  
  await executeQuery(`
    CREATE POLICY "Assigned users can update assigned tickets" ON public.tickets
      FOR UPDATE TO authenticated
      USING (assigned_to = auth.uid());
  `);
  
  // Create RLS policies for comments
  console.log('Creating RLS policies for comments...');
  await executeQuery(`
    CREATE POLICY "Admins can do anything with comments" ON public.comments
      FOR ALL TO authenticated
      USING ((SELECT isAdmin FROM public.users WHERE id = auth.uid()));
  `);
  
  await executeQuery(`
    CREATE POLICY "Users can create comments" ON public.comments
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL);
  `);
  
  await executeQuery(`
    CREATE POLICY "Users can read all comments" ON public.comments
      FOR SELECT TO authenticated
      USING (true);
  `);
  
  await executeQuery(`
    CREATE POLICY "Users can update their own comments" ON public.comments
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid());
  `);
  
  // Create RLS policies for departments
  console.log('Creating RLS policies for departments...');
  await executeQuery(`
    CREATE POLICY "Everyone can read departments" ON public.departments
      FOR SELECT TO authenticated
      USING (true);
  `);
  
  await executeQuery(`
    CREATE POLICY "Only admins can modify departments" ON public.departments
      FOR ALL TO authenticated
      USING ((SELECT isAdmin FROM public.users WHERE id = auth.uid()));
  `);
  
  // Create RLS policies for guides, drivers, and disassembly guides
  console.log('Creating RLS policies for other tables...');
  await executeQuery(`
    CREATE POLICY "Everyone can read guides" ON public.guides
      FOR SELECT TO authenticated
      USING (true);
  `);
  
  await executeQuery(`
    CREATE POLICY "Everyone can read drivers" ON public.drivers
      FOR SELECT TO authenticated
      USING (true);
  `);
  
  await executeQuery(`
    CREATE POLICY "Everyone can read disassembly guides" ON public.disassembly_guides
      FOR SELECT TO authenticated
      USING (true);
  `);
  
  await executeQuery(`
    CREATE POLICY "Only admins can modify guides" ON public.guides
      FOR ALL TO authenticated
      USING ((SELECT isAdmin FROM public.users WHERE id = auth.uid()));
  `);
  
  await executeQuery(`
    CREATE POLICY "Only admins can modify drivers" ON public.drivers
      FOR ALL TO authenticated
      USING ((SELECT isAdmin FROM public.users WHERE id = auth.uid()));
  `);
  
  await executeQuery(`
    CREATE POLICY "Only admins can modify disassembly guides" ON public.disassembly_guides
      FOR ALL TO authenticated
      USING ((SELECT isAdmin FROM public.users WHERE id = auth.uid()));
  `);
  
  // Create indexes for better performance
  console.log('Creating indexes...');
  await executeQuery('CREATE INDEX IF NOT EXISTS tickets_created_by_idx ON public.tickets (created_by);');
  await executeQuery('CREATE INDEX IF NOT EXISTS tickets_assigned_to_idx ON public.tickets (assigned_to);');
  await executeQuery('CREATE INDEX IF NOT EXISTS tickets_status_idx ON public.tickets (status);');
  await executeQuery('CREATE INDEX IF NOT EXISTS tickets_priority_idx ON public.tickets (priority);');
  await executeQuery('CREATE INDEX IF NOT EXISTS comments_ticket_id_idx ON public.comments (ticket_id);');
  await executeQuery('CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments (user_id);');
  
  console.log('Schema deployment completed.');
}

// Execute the script
deploySchemaManually();