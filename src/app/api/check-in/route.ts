// src/app/api/check-in/route.ts
// This is a NEW FILE you need to create.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid' 

// --- Helper Functions (TODO: Implement these) ---

/**
 * AUTHORITATIVE geo-check.
 */
async function validateGeolocation(userLocation: any, groupLat: number, groupLon: number): Promise<boolean> {
  // TODO: Add your real distance calculation logic here.
  // This is the *real* security check.
  console.log('SERVER-SIDE VALIDATION: Checking location...');
  return true // Assume true for this draft
}

/**
 * AUTHORITATIVE time-check.
 */
async function validateTime(groupDay: string): Promise<boolean> {
  // TODO: Add your real day of week comparison logic here.
  // The logic from your 'get-groups-by-day' function can be reused.
  console.log('SERVER-SIDE VALIDATION: Checking day of week...');
  return true // Assume true for this draft
}

/**
 * Checks if a member has already checked in today.
 */
async function checkForDuplicate(supabase: any, memberId: string, groupId: string): Promise<boolean> {
  const todayStart = new Date().toISOString().split('T')[0] + 'T00:00:00Z'
  const todayEnd = new Date().toISOString().split('T')[0] + 'T23:59:59Z'

  // NOTE: Your schema uses 'attendance_date' as DATE.
  // We will check for any record on this day.
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance_register')
    .select('id')
    .eq('member_id', memberId)
    .eq('group_id', groupId)
    .eq('attendance_date', today) // Check for this specific date
    .limit(1)

  if (error) {
    console.error('Error checking for duplicate:', error)
    return false 
  }
  return data && data.length > 0
}

// --- The API Route ---

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, groupId, isNoEmail, geolocation } = body
    const supabase = createClient()

    // --- 2. Run "Guards" (Authoritative Server-Side Validation) ---
    // We fetch the group data matching your schema (latitude, longitude, meeting_day)
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('latitude, longitude, meeting_day') 
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // --- THIS IS THE REAL SECURITY CHECK ---
    if (!(await validateGeolocation(geolocation, group.latitude!, group.longitude!))) {
      return NextResponse.json({ error: 'User is outside the allowed radius' }, { status: 403 })
    }
    if (!(await validateTime(group.meeting_day))) {
      return NextResponse.json({ error: 'Group does not meet today' }, { status: 403 })
    }

    // --- 3. Handle the "No Email" Path ---
    if (isNoEmail) {
      const response = NextResponse.json({ status: 'NO_EMAIL_INFO_REQUIRED' })
      // ADDED: Set the cookie for the middleware
      response.cookies.set('app_status', 'NO_EMAIL_INFO_REQUIRED', { path: '/' });
      return response
    }

    // --- 4. Handle the "Email" Path ---
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, orientation_complete')
      .eq('email', email)
      .single()

    // --- 5A. Member NOT Found (New User) ---
    if (memberError || !member) {
      const newMemberId = uuidv4()
      
      const { data: newMember, error: createError } = await supabase
        .from('members')
        .insert({
          id: newMemberId,
          email: email,
          // first_name is now allowed to be NULL (thanks to Fix 1)
        })
        .select('id') // Select the new member to confirm
        .single()

      if (createError || !newMember) {
        return NextResponse.json({ error: 'Could not create new member' }, { status: 500 })
      }
      
      const response = NextResponse.json({ status: 'ORIENTATION_REQUIRED', isNewMember: true })
      // ADDED: Set the cookie for the middleware
      response.cookies.set('app_status', 'ORIENTATION_REQUIRED', { path: '/', httpOnly: true });
      response.cookies.set('member_id', newMember.id, { path: '/', httpOnly: true });
      response.cookies.set('pending_group_id', groupId, { path: '/', httpOnly: true });
      return response
    }

    // --- 5B. Member IS Found (Existing User) ---
    if (await checkForDuplicate(supabase, member.id, groupId)) {
      return NextResponse.json({ error: 'User has already checked in today' }, { status: 409 })
    }
    if (!member.orientation_complete) {
      const response = NextResponse.json({ status: 'ORIENTATION_REQUIRED', isNewMember: false })
      // ADDED: Set the cookies for the middleware and orientation page
      response.cookies.set('app_status', 'ORIENTATION_REQUIRED', { path: '/', httpOnly: true });
      response.cookies.set('member_id', member.id, { path: '/', httpOnly: true });
      response.cookies.set('pending_group_id', groupId, { path: '/', httpOnly: true });
      return response
    }

    // --- 6. The "Happy Path" (Check-in Complete) ---
    const today = new Date().toISOString().split('T')[0];
    const { error: attendanceError } = await supabase
      .from('attendance_register')
      .insert({
        id: uuidv4(),
        member_id: member.id,
        group_id: groupId,
        attendance_date: today, // Using the DATE field from your schema
      })

    if (attendanceError) {
      return NextResponse.json({ error: 'Could not create attendance record' }, { status: 500 })
    }

    // TODO: Trigger Supabase Edge Function for Glide Sync here
    // await supabase.functions.invoke('sync-to-glide', { ... })

    const response = NextResponse.json({ status: 'CHECKIN_COMPLETE' })
    // ADDED: Set the cookie for the middleware
    response.cookies.set('app_status', 'CHECKIN_COMPLETE', { path: '/' });
    return response

  } catch (error) {
    console.error('Unhandled error in check-in route:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}