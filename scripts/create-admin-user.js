#!/usr/bin/env node

// This script creates an admin user in Supabase
// Usage: node scripts/create-admin-user.js

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
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
// Get custom credentials from command line arguments
const customUsername = process.argv[2] || 'admin';
const customPassword = process.argv[3] || 'admin123';
const customEmail = `${customUsername.toLowerCase()}@techsuptet.com`;

const adminUser = {
  id: crypto.randomUUID(),
  email: customEmail,
  username: customUsername,
  password: hashPassword(customPassword), // In a real app, use a better hashing method
  isAdmin: true,
  isApproved: true
};

console.log(`Creating admin with username: ${customUsername} and email: ${customEmail}`);

async function createAdminUser() {
  try {
    console.log('Checking if users table exists...');
    
    // Check if users table exists
    const { error: tableCheckError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    
    if (tableCheckError) {
      console.log('Users table not found, creating it...');
      
      // Create users table
      const { error: createTableError } = await supabase.rpc('create_users_table', {});
      
      if (createTableError) {
        console.error('Failed to create users table:', createTableError);
        
        // Try to create the table directly with SQL
        const { error: sqlError } = await supabase.sql(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            isAdmin BOOLEAN DEFAULT FALSE,
            isApproved BOOLEAN DEFAULT FALSE
          );
        `);
        
        if (sqlError) {
          console.error('Failed to create users table with SQL:', sqlError);
          return;
        }
      }
    }
    
    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminUser.email)
      .single();
    
    if (checkError && !checkError.message.includes('No rows found')) {
      console.error('Error checking for existing admin:', checkError);
      return;
    }
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating...');
      
      // Update the existing admin user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: adminUser.username,
          password: adminUser.password,
          isAdmin: true,
          isApproved: true
        })
        .eq('email', adminUser.email);
      
      if (updateError) {
        console.error('Failed to update admin user:', updateError);
        return;
      }
      
      console.log('Admin user updated successfully!');
    } else {
      console.log('Creating new admin user...');
      
      // Insert the admin user
      const { error: insertError } = await supabase
        .from('users')
        .insert(adminUser);
      
      if (insertError) {
        console.error('Failed to insert admin user:', insertError);
        return;
      }
      
      console.log('Admin user created successfully!');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createAdminUser().catch(console.error);