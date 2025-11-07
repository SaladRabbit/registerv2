// src/app/api/check-in/route.ts
// This is the full, updated code for this file.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid' 

// --- Helper Functions ---
async function validateGeolocation(userLocation: any, groupLat: number, groupLon: number): Promise<boolean> {
  console.log('SERVER-SIDE VALIDATION: Checking location...');
  return true // Assume true for this draft
}

async function validateTime(groupDay: string): Promise<boolean> {
  console.log('SERVER-SIDE VALIDATION: Checking day of week...');
  return true // Assume true for this draft
}

async function checkForDuplicate(supabase: any, memberId: string, groupId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance_register')
    .select('id')
    .eq('member_id', memberId)
    .eq('group_id', groupId)
    .eq('attendance_date', today) 
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
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('latitude, longitude, meeting_day') 
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (!(await validateGeolocation(geolocation, group.latitude!, group.longitude!))) {
      return NextResponse.json({ error: 'User is outside the allowed radius' }, { status: 403 })
    }
    if (!(await validateTime(group.meeting_day))) {
      return NextResponse.json({ error: 'Group does not meet today' }, { status: 403 })
    }

    // --- 3. Handle the "No Email" Path ---
    if (isNoEmail) {
      const response = NextResponse.json({ status: 'NO_EMAIL_INFO_REQUIRED' })
      response.cookies.set('app_status', 'NO_EMAIL_INFO_REQUIRED', { path: '/' }); // This is client-readable
      response.cookies.set('pending_group_id', groupId, { path: '/', httpOnly: true });
      return response
    }

    // --- 4. Handle the "Email" Path ---
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, orientation_complete, first_name, last_name, phone, dob, gender, ethnicity, reason_for_attending')
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
        })
        .select('id') 
        .single()

      if (createError || !newMember) {
        return NextResponse.json({ error: 'Could not create new member' }, { status: 500 })
      }
      
      const response = NextResponse.json({ status: 'ORIENTATION_REQUIRED', isNewMember: true })
      
      // --- THIS IS THE FIX ---
      // Removed httpOnly so the client-side useEffect can read it
      response.cookies.set('app_status', 'ORIENTATION_REQUIRED', { path: '/' }); 
      
      // These remain httpOnly for security
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
      
      // --- THIS IS THE FIX ---
      // Removed httpOnly so the client-side useEffect can read it
      response.cookies.set('app_status', 'ORIENTATION_REQUIRED', { path: '/' });
      
      // These remain httpOnly for security
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
        attendance_date: today,
        is_no_email_check_in: false,
        first_name: member.first_name,
        last_name: member.last_name,
        phone: member.phone,
        dob: member.dob,
        gender: member.gender,
        ethnicity: member.ethnicity,
        reason_for_attending: member.reason_for_attending,
      })

    if (attendanceError) {
      return NextResponse.json({ error: 'Could not create attendance record' }, { status: 500 })
    }

    const response = NextResponse.json({ status: 'CHECKIN_COMPLETE' })
    response.cookies.set('app_status', 'CHECKIN_COMPLETE', { path: '/' });
    return response

  } catch (error) {
    console.error('Unhandled error in check-in route:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}