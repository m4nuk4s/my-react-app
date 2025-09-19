// Edge function for user management operations
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the Auth context
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function approveUser(req) {
  try {
    const { userId } = await req.json()
    
    // Verify the user making the request is an admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Check if the current user is an admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('isAdmin')
      .eq('id', user.id)
      .single()
      
    if (adminError || !adminCheck || !adminCheck.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Update the user record
    const { data, error } = await supabase
      .from('users')
      .update({ isApproved: true })
      .eq('id', userId)
      .select()
      
    if (error) {
      throw error
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function getAllUsers(req) {
  try {
    // Verify the user making the request is an admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Check if the current user is an admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('isAdmin')
      .eq('id', user.id)
      .single()
      
    if (adminError || !adminCheck || !adminCheck.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get all users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      
    if (error) {
      throw error
    }
    
    // Remove sensitive information
    const safeUsers = data.map(user => {
      const { password, ...safeUser } = user
      return safeUser
    })
    
    return new Response(
      JSON.stringify({ users: safeUsers }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// This is the entry point for the Edge Function
Deno.serve(async (req) => {
  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }
  
  // Route the request to the appropriate function
  switch (path) {
    case 'approve-user':
      return await approveUser(req)
    case 'get-all-users':
      return await getAllUsers(req)
    default:
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
  }
})