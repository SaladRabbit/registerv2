import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// This interface defines the structure of the data we expect from the frontend
interface FormData {
  firstName: string; lastName: string; phone: string; dateOfBirth: string; gender: string; ethnicity: string;
  emergencyContactName: string; emergencyContactPhone: string; emergencyContactEmail: string;
  reasonForAttending: string; sourceOfDiscovery: string; problematicSubstances: string;
  currentlyInTreatment: string; currentTreatmentProgramme: string; previousTreatment: string;
  previousTreatmentProgrammes: string; previousRecoveryGroups: string; previousRecoveryGroupsNames: string;
  goalsForAttending: string; anythingElseImportant: string; howElseHelp: string;
  consentWhatsapp: boolean; consentConfidentiality: boolean; consentAnonymity: boolean;
  consentLiability: boolean; consentVoluntary: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body: FormData = await request.json()

    // 1. Get the user ID and group ID from the secure cookies
    const memberIdCookie = request.cookies.get('member_id')
    const groupIdCookie = request.cookies.get('pending_group_id')

    if (!memberIdCookie || !groupIdCookie) {
      return NextResponse.json({ error: 'User session not found. Please sign in again.' }, { status: 401 })
    }
    
    const memberId = memberIdCookie.value;
    const groupId = groupIdCookie.value;

    // 2. Destructure ALL data from the body
    const {
      firstName, lastName, phone, dateOfBirth, gender, ethnicity,
      emergencyContactName, emergencyContactPhone, emergencyContactEmail,
      reasonForAttending, sourceOfDiscovery, problematicSubstances,
      currentlyInTreatment, currentTreatmentProgramme, previousTreatment,
      previousTreatmentProgrammes, previousRecoveryGroups, previousRecoveryGroupsNames,
      goalsForAttending, anythingElseImportant, howElseHelp,
      consentWhatsapp, consentConfidentiality, consentAnonymity,
      consentLiability, consentVoluntary
    } = body;

    // --- Database Transaction ---
    
    // 3. Update the 'members' table with personal info
    const { error: memberError } = await supabase
      .from('members')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        date_of_birth: dateOfBirth || null, // Save to the new column
        gender: gender,                       // Save to the new column
        ethnicity: ethnicity,                   // Save to the new column
        orientation_complete: true, // Mark orientation as complete
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)

    if (memberError) {
      console.error('Error updating member:', memberError)
      return NextResponse.json({ error: 'Failed to update member details' }, { status: 500 })
    }

    // 4. Insert into the 'orientation_details' table (with ALL new fields)
    const { error: detailsError } = await supabase
      .from('orientation_details')
      .insert({
        member_id: memberId,
        // These fields were in the original schema
        date_of_birth: dateOfBirth || null, 
        gender: gender,
        ethnicity: ethnicity,
        reason_for_attending: reasonForAttending,
        
        // These are all the new fields from the migration
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_email: emergencyContactEmail,
        source_of_discovery: sourceOfDiscovery,
        problematic_substances: problematicSubstances,
        currently_in_treatment: currentlyInTreatment,
        current_treatment_programme: currentTreatmentProgramme,
        previous_treatment: previousTreatment,
        previous_treatment_programmes: previousTreatmentProgrammes,
        previous_recovery_groups: previousRecoveryGroups,
        previous_recovery_groups_names: previousRecoveryGroupsNames,
        goals_for_attending: goalsForAttending,
        anything_else_important: anythingElseImportant,
        how_else_help: howElseHelp,
        consent_whatsapp: consentWhatsapp,
        consent_confidentiality: consentConfidentiality,
        consent_anonymity: consentAnonymity,
        consent_liability: consentLiability,
        consent_voluntary: consentVoluntary,
      })

    if (detailsError) {
      console.error('Error inserting orientation details:', detailsError)
      // Note: In a real production app, you'd "rollback" the member update here.
      return NextResponse.json({ error: 'Failed to save orientation details' }, { status: 500 })
    }

    // 5. Create the 'attendance_register' record
    const today = new Date().toISOString().split('T')[0];
    const { error: attendanceError } = await supabase
      .from('attendance_register')
      .insert({
        member_id: memberId,
        group_id: groupId,
        attendance_date: today,
      })

    if (attendanceError) {
      console.error('Error creating attendance record:', attendanceError)
      return NextResponse.json({ error: 'Failed to create attendance record' }, { status: 500 })
    }

    // --- Success: Update the Cookies ---
    const response = NextResponse.json({ status: 'SUCCESS' })
    response.cookies.set('app_status', 'CHECKIN_COMPLETE', { path: '/', httpOnly: true });
    response.cookies.set('member_id', '', { path: '/', maxAge: -1 });
    response.cookies.set('pending_group_id', '', { path: '/', maxAge: -1 });

    return response;

  } catch (error) {
    console.error('Unhandled error in orientation submit:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}