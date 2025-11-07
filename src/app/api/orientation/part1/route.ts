// src/app/api/orientation/part1/route.ts
// This is a NEW FILE

import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Body will contain all data from Step 0 + the isNoEmail flag
    const body = await request.json();
    const { isNoEmail, ...formData } = body;

    // 1. Get Group ID from the secure cookie
    const groupIdCookie = request.cookies.get('pending_group_id');
    if (!groupIdCookie) {
      return NextResponse.json({ error: 'Session expired. Please start over.' }, { status: 401 });
    }
    const groupId = groupIdCookie.value;
    const today = new Date().toISOString().split('T')[0];

    if (isNoEmail) {
      // --- "NO-EMAIL" LOGIC ---
      // This user has no member_id. Save their info directly to the register.
      const { error } = await supabase.from('attendance_register').insert({
        id: uuidv4(),
        group_id: groupId,
        attendance_date: today,
        is_no_email_check_in: true,
        member_id: null,
        
        // Save generic data from the form
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        dob: formData.dateOfBirth || null,
        ethnicity: formData.ethnicity,
        gender: formData.gender,
        reason_for_attending: formData.reasonForAttending,
      });

      if (error) {
        console.error('Error creating no-email attendance:', error);
        return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
      }

    } else {
      // --- "EMAIL" LOGIC (Part 1) ---
      // This user has a member_id. Update their member record
      // and create a LINKED attendance record.
      const memberIdCookie = request.cookies.get('member_id');
      if (!memberIdCookie) {
        return NextResponse.json({ error: 'Member session not found. Please sign in again.' }, { status: 401 });
      }
      const memberId = memberIdCookie.value;

      // 1. Update the member's basic info
      const { error: memberError } = await supabase
        .from('members')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender,
          ethnicity: formData.ethnicity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId);

      if (memberError) {
        console.error('Error updating member (Part 1):', memberError);
        return NextResponse.json({ error: 'Failed to update member details.' }, { status: 500 });
      }

      // 2. Create the initial orientation_details row (will be updated in Part 2)
      const { error: detailsError } = await supabase
        .from('orientation_details')
        .insert({
          member_id: memberId,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender,
          ethnicity: formData.ethnicity,
          reason_for_attending: formData.reasonForAttending,
        });

      if (detailsError) {
         console.error('Error creating orientation details (Part 1):', detailsError);
         return NextResponse.json({ error: 'Failed to save orientation details.' }, { status: 500 });
      }
      
      // 3. Create the attendance record (as requested)
      const { error: attendanceError } = await supabase
        .from('attendance_register')
        .insert({
          id: uuidv4(),
          member_id: memberId, // <-- Linked to the member
          group_id: groupId,
          attendance_date: today,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          dob: formData.dateOfBirth || null,
          gender: formData.gender,
          ethnicity: formData.ethnicity,
          reason_for_attending: formData.reasonForAttending,
          is_no_email_check_in: false,
        });

      if (attendanceError) {
         console.error('Error creating attendance record (Part 1):', attendanceError);
         return NextResponse.json({ error: 'Failed to log attendance.' }, { status: 500 });
      }
    }

    // --- Success ---
    // For "No-Email" users, this is the end. Clear all cookies.
    // For "Email" users, we only clear app_status, but keep member_id and group_id
    // for Part 2.
    const response = NextResponse.json({ status: 'SUCCESS' });
    if (isNoEmail) {
      response.cookies.set('app_status', '', { path: '/', maxAge: -1 });
      response.cookies.set('pending_group_id', '', { path: '/', maxAge: -1 });
    }
    
    return response;

  } catch (error) {
    console.error('Unhandled error in orientation part1 route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}