import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

// This file handles GET requests to '/api/groups'.
export async function GET(request: Request) {
  // Create a Supabase client for this server-side request.
  const supabase = createClient()

  // Use the Supabase client to query the 'groups' table.
  // .select('*') fetches all columns for all rows.
  const { data: groups, error } = await supabase.from('groups').select('*')

  // If there was an error fetching the data, return a server error.
  if (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If the data was fetched successfully, return it as a JSON response.
  return NextResponse.json(groups)
}
