// src/app/orientation/page.tsx
// This is the full, updated file.

"use client";

import { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; 

// --- 1. DEFINE DROPDOWN OPTIONS ---
const GENDERS = ["Please select...", "Male", "Female", "Non-binary", "Prefer not to say", "Other"];
const ETHNICITIES = ["Please select...", "Black", "Coloured", "Indian", "White", "Asian", "Prefer not to say", "Other"];
const REASONS_FOR_ATTENDING = [
  "Please select...",
  "Seeking Recovery",
  "Addiction Recovery",
  "Supporter Recovery",
  "Other",
];
// ... (All your other const dropdown arrays remain the same) ...
const SOURCES_OF_DISCOVERY = [
  "Please select...",
  "Social Media",
  "Google Search",
  "Friend",
  "Family",
  "Church",
  "Other",
];
const SUBSTANCE_BEHAVIOURS = [
  "Please select...",
  "Alcohol",
  "Cigarettes",
  "Cocaine",
  "Crack Cocaine",
  "Crystal Meth",
  "Drugs",
  "Ecstasy",
  "Gambling",
  "Heroin",
  "Kat",
  "Nicotine",
  "Pain medication",
  "Pornography",
  "Prostitutes",
  "Weed",
  "Food",
  "Other",
];
const TREATMENT_FACILITIES = [
  "Please select...",
  "None",
  "AC Wellness",
  "ACOC",
  "Akeso",
  "AMCUP",
  "ARCA",
  "Bethal",
  "Careline",
  "Cedars",
  "Havon of Rest",
  "Healing Wings",
  "Judo",
  "Lulama",
  "Palm Gardens",
  "Riverview Manor",
  "Sanca Horizon",
  "SCRC",
  "St Josephs",
  "Wedge Gardens",
  "White River",
  "Other",
];
const PREVIOUS_GROUPS = [
  "Please select...",
  "None",
  "Project Exodus",
  "Alcoholics Anonymous (AA)",
  "Narcotics Anonymous (NA)",
  "SMART Recovery",
  "Gamblers Anonymous",
  "Sex Addicts Anonymous",
  "Other",
];
const GOALS_FOR_ATTENDING = [
  "Please select...",
  "Community",
  "Coping Skills",
  "Prayer",
  "Accountability",
  "Supporter Skills",
  "A Better Life",
  "Sobriety",
  "A Better Relationship with God",
  "Healing",
  "Knowledge",
  "Other",
];

// Define the structure for all form data
interface FormData {
  // Step 0: Basic Info
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  ethnicity: string;
  
  // Step 1: Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;

  // Step 2: Research Questions
  reasonForAttending: string; 
  sourceOfDiscovery: string;
  problematicSubstances: string; 
  problematicSubstancesOther: string; 
  currentlyInTreatment: string;
  currentTreatmentProgramme: string;
  previousTreatment: string;
  previousTreatmentProgrammes: string;
  previousRecoveryGroups: string;
  previousRecoveryGroupsNames: string;
  goalsForAttending: string;
  goalsForAttendingOther: string; 
  anythingElseImportant: string;
  howElseHelp: string;

  // Step 3: Consents
  consentWhatsapp: boolean;
  consentConfidentiality: boolean;
  consentAnonymity: boolean;
  consentLiability: boolean;
  consentVoluntary: boolean;
}

export default function OrientationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); 
  const [isNoEmailMode, setIsNoEmailMode] = useState(false); 
  
  // Initialize all form fields
  const [formData, setFormData] = useState<FormData>({
    firstName: "", lastName: "", phone: "", dateOfBirth: "", gender: "", ethnicity: "",
    emergencyContactName: "", emergencyContactPhone: "", emergencyContactEmail: "",
    reasonForAttending: "", 
    sourceOfDiscovery: "", 
    problematicSubstances: "", problematicSubstancesOther: "",
    currentlyInTreatment: "No", currentTreatmentProgramme: "", previousTreatment: "No",
    previousTreatmentProgrammes: "", previousRecoveryGroups: "No", previousRecoveryGroupsNames: "",
    goalsForAttending: "", goalsForAttendingOther: "", anythingElseImportant: "", howElseHelp: "",
    consentWhatsapp: false, consentConfidentiality: false, consentAnonymity: false,
    consentLiability: false, consentVoluntary: false,
  });
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for "No Email" mode on page load
  useEffect(() => {
    const status = Cookies.get('app_status');
    if (status === 'NO_EMAIL_INFO_REQUIRED') {
      setIsNoEmailMode(true);
    }
  }, []); 

  // A single handler for all input types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Full Validation Logic (accepts a step number)
  const validateStep = (stepToValidate = step) => { 
    setError(""); 
    const Req = "Please select an option.";

    if (stepToValidate === 0) { 
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.dateOfBirth) {
        setError("Please fill in all required fields on this page.");
        return false;
      }
      if (formData.gender === "Please select...") { setError(`Gender: ${Req}`); return false; }
      if (formData.ethnicity === "Please select...") { setError(`Ethnicity: ${Req}`); return false; }
      
      // "Reason for attending" is now part of Step 0 for BOTH flows
      if (formData.reasonForAttending === "Please select...") {
        setError(`Reason for Attending: ${Req}`); 
        return false;
      }
    }
    
    if (stepToValidate === 1) { 
      if (!formData.emergencyContactName || !formData.emergencyContactPhone || !formData.emergencyContactEmail) {
        setError("Please fill in all required fields on this page.");
        return false;
      }
    }
    
    if (stepToValidate === 2) { 
      if (formData.sourceOfDiscovery === "Please select...") { setError(`Where did you hear about us?: ${Req}`); return false; }
      if (formData.problematicSubstances === "Please select...") { setError(`Substance or behaviour: ${Req}`); return false; }
      if (formData.goalsForAttending === "Please select...") { setError(`Goals for attending: ${Req}`); return false; }
      if (!formData.anythingElseImportant || !formData.howElseHelp) {
        setError("Please fill in all required fields on this page.");
        return false;
      }
      // ... (rest of step 2 validation is the same) ...
    }

    return true; 
  }

  // "Email" user "Back" button
  const prevStep = () => {
    setError(""); 
    setStep(prev => prev - 1);
  };

  // --- NEW: Handles "Next" button from Step 0 ---
  // This is the new "Part 1" submit for "Email" users
  const handlePart1Submit = async () => {
    if (validateStep(0)) {
      setIsSubmitting(true);
      setError("");

      try {
        const response = await fetch('/api/orientation/part1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, isNoEmail: false }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "An unknown error occurred.");
          setIsSubmitting(false);
          return;
        }

        // --- Success! Move to Step 1 ---
        setStep(1);
        setIsSubmitting(false);

      } catch (err) {
        setError("Could not connect to the server. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  // --- NEW: Handles the FINAL submit from Step 3 ---
  // This is the new "Part 2" submit for "Email" users
  const handlePart2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return; // This function should only be called from the form at Step 3

    // Final validation for consents
    if (!formData.consentConfidentiality || !formData.consentAnonymity || !formData.consentLiability || !formData.consentVoluntary) {
      setError("You must agree to all required consents to proceed.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/orientation/part2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Send ALL form data
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "An unknown error occurred.");
        setIsSubmitting(false);
        return;
      }

      router.push('/complete'); // All done!

    } catch (err) {
      setError("Could not connect to the server. Please try again.");
      setIsSubmitting(false);
    }
  };

  // --- "No-Email" user submit ---
  // This function is now simpler. It just calls Part 1.
  const handleNoEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep(0)) { // Only validate Step 0
      setIsSubmitting(true);
      setError("");

      try {
        const response = await fetch('/api/orientation/part1', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, isNoEmail: true }), 
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "An unknown error occurred.");
          setIsSubmitting(false);
          return;
        }

        router.push('/complete'); // Success!

      } catch (err) {
        setError("Could not connect to the server. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  // Renders the correct form step
  const renderStep = (currentStep = step) => { 
    const Req = () => <span className="text-red-600">*</span>;

    switch (currentStep) { 
      case 0: // --- STEP 0: BASIC INFO ---
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700">
              {isNoEmailMode ? 'Please fill in your details' : 'Part 1 of 4: Basic Info'}
            </h2>
            {/* ... (first_name, last_name, phone, dob, gender, ethnicity inputs) ... */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name <Req /></label>
              <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name <Req /></label>
              <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number <Req /></label>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <Req /></label>
              <input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender <Req /></label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                {GENDERS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 mb-1">Ethnicity <Req /></label>
              <select id="ethnicity" name="ethnicity" value={formData.ethnicity} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                {ETHNICITIES.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            
            {/* --- THIS FIELD IS NOW FOR EVERYONE IN STEP 0 --- */}
            <div>
              <label htmlFor="reasonForAttending" className="block text-sm font-medium text-gray-700 mb-1">Reason for Attending <Req /></label>
              <select id="reasonForAttending" name="reasonForAttending" value={formData.reasonForAttending} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                {REASONS_FOR_ATTENDING.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>
        );
      case 1: // --- STEP 1: EMERGENCY CONTACT ---
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700">Part 2 of 4: Emergency Contact</h2>
            {/* ... (emergencyContactName, emergencyContactPhone, emergencyContactEmail inputs) ... */}
             <div>
              <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Full Name <Req /></label>
              <input id="emergencyContactName" name="emergencyContactName" type="text" value={formData.emergencyContactName} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone <Req /></label>
              <input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="emergencyContactEmail" className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Email <Req /></label>
              <input id="emergencyContactEmail" name="emergencyContactEmail" type="email" value={formData.emergencyContactEmail} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
        );
      case 2: // --- STEP 2: RESEARCH QUESTIONS ---
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700">Part 3 of 4: Research Questions</h2>
            {/* ... (All other inputs for Step 2: sourceOfDiscovery, problematicSubstances, etc.) ... */}
            {/* Note: reasonForAttending is removed from here, as it's now in Step 0 */}
            <div>
              <label htmlFor="sourceOfDiscovery" className="block text-sm font-medium text-gray-700 mb-1">Where did you hear about us? <Req /></label>
              <select id="sourceOfDiscovery" name="sourceOfDiscovery" value={formData.sourceOfDiscovery} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                {SOURCES_OF_DISCOVERY.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="problematicSubstances" className="block text-sm font-medium text-gray-700 mb-1">Which substances and/or behaviours are problematic for you? <Req /></label>
              <select id="problematicSubstances" name="problematicSubstances" value={formData.problematicSubstances} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                {SUBSTANCE_BEHAVIOURS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            {formData.problematicSubstances.includes("Other") && (
              <div>
                <label htmlFor="problematicSubstancesOther" className="block text-sm font-medium text-gray-700 mb-1">Please specify: <Req /></label>
                <input id="problematicSubstancesOther" name="problematicSubstancesOther" type="text" value={formData.problematicSubstancesOther} onChange={handleChange} required={formData.problematicSubstances.includes("Other")} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            )}
            <div>
              <label htmlFor="currentlyInTreatment" className="block text-sm font-medium text-gray-700 mb-1">Are you currently in a treatment programme? <Req /></label>
              <select id="currentlyInTreatment" name="currentlyInTreatment" value={formData.currentlyInTreatment} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {formData.currentlyInTreatment === 'Yes' && (
              <div>
                <label htmlFor="currentTreatmentProgramme" className="block text-sm font-medium text-gray-700 mb-1">Which treatment programme are you currently in? <Req /></label>
                <input id="currentTreatmentProgramme" name="currentTreatmentProgramme" type="text" value={formData.currentTreatmentProgramme} onChange={handleChange} required={formData.currentlyInTreatment === 'Yes'} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            )}
             <div>
              <label htmlFor="previousTreatment" className="block text-sm font-medium text-gray-700 mb-1">Have you ever been in a treatment programme? <Req /></label>
              <select id="previousTreatment" name="previousTreatment" value={formData.previousTreatment} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {formData.previousTreatment === 'Yes' && (
              <div>
                <label htmlFor="previousTreatmentProgrammes" className="block text-sm font-medium text-gray-700 mb-1">Which treatment programme/s have you been in? <Req /></label>
                <select id="previousTreatmentProgrammes" name="previousTreatmentProgrammes" value={formData.previousTreatmentProgrammes} onChange={handleChange} required={formData.previousTreatment === 'Yes'} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                  {TREATMENT_FACILITIES.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="previousRecoveryGroups" className="block text-sm font-medium text-gray-700 mb-1">Have you attended Recovery Groups before? <Req /></label>
              <select id="previousRecoveryGroups" name="previousRecoveryGroups" value={formData.previousRecoveryGroups} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {formData.previousRecoveryGroups === 'Yes' && (
              <div>
                <label htmlFor="previousRecoveryGroupsNames" className="block text-sm font-medium text-gray-700 mb-1">Which Recovery groups have you attended? <Req /></label>
                <select id="previousRecoveryGroupsNames" name="previousRecoveryGroupsNames" value={formData.previousRecoveryGroupsNames} onChange={handleChange} required={formData.previousRecoveryGroups === 'Yes'} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                  {PREVIOUS_GROUPS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="goalsForAttending" className="block text-sm font-medium text-gray-700 mb-1">What do you hope to achieve by attending? <Req /></label>
              <select id="goalsForAttending" name="goalsForAttending" value={formData.goalsForAttending} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                {GOALS_FOR_ATTENDING.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            {formData.goalsForAttending.includes("Other") && (
              <div>
                <label htmlFor="goalsForAttendingOther" className="block text-sm font-medium text-gray-700 mb-1">Please specify your goals: <Req /></label>
                <input id="goalsForAttendingOther" name="goalsForAttendingOther" type="text" value={formData.goalsForAttendingOther} onChange={handleChange} required={formData.goalsForAttending.includes("Other")} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            )}
             <div>
              <label htmlFor="anythingElseImportant" className="block text-sm font-medium text-gray-700 mb-1">Is there anything important that we should know? <Req /></label>
              <textarea id="anythingElseImportant" name="anythingElseImportant" value={formData.anythingElseImportant} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows={2} />
            </div>
             <div>
              <label htmlFor="howElseHelp" className="block text-sm font-medium text-gray-700 mb-1">How else would you like to be helped? <Req /></label>
              <textarea id="howElseHelp" name="howElseHelp" value={formData.howElseHelp} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows={2} />
            </div>
          </div>
        );
      case 3: // --- STEP 3: CONSENTS ---
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center text-gray-700">Part 4 of 4: Consents</h2>
          <div className="flex items-start">
            <input id="consentWhatsapp" name="consentWhatsapp" type="checkbox" checked={formData.consentWhatsapp} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1" />
            <label htmlFor="consentWhatsapp" className="ml-2 block text-sm text-gray-700">I consent to be added to a WhatsApp Group. (Optional)</label>
          </div>
          <div className="flex items-start">
            <input id="consentConfidentiality" name="consentConfidentiality" type="checkbox" checked={formData.consentConfidentiality} onChange={handleChange} required className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1" />
            <label htmlFor="consentConfidentiality" className="ml-2 block text-sm text-gray-700">I agree to the <span className="font-bold">Confidentiality</span> guidelines. <Req /></label>
          </div>
          <div className="flex items-start">
            <input id="consentAnonymity" name="consentAnonymity" type="checkbox" checked={formData.consentAnonymity} onChange={handleChange} required className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1" />
            <label htmlFor="consentAnonymity" className="ml-2 block text-sm text-gray-700">I agree to the <span className="font-bold">Anonymity</span> guidelines. <Req /></label>
          </div>
          <div className="flex items-start">
            <input id="consentLiability" name="consentLiability" type="checkbox" checked={formData.consentLiability} onChange={handleChange} required className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1" />
            <label htmlFor="consentLiability" className="ml-2 block text-sm text-gray-700">I agree to the <span className="font-bold">Liability</span> waiver. <Req /></label>
          </div>
          <div className="flex items-start">
            <input id="consentVoluntary" name="consentVoluntary" type="checkbox" checked={formData.consentVoluntary} onChange={handleChange} required className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1" />
            <label htmlFor="consentVoluntary" className="ml-2 block text-sm text-gray-700">I confirm my attendance is <span className="font-bold">Voluntary</span>. <Req /></label>
          </div>
        </div>
        );
      default:
        return null; // Should never happen
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 pt-24 bg-gray-50 text-gray-900">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        {/* Conditional Title */}
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isNoEmailMode ? 'No-Email Check-in' : 'New Member Orientation'}
        </h1>
        
        {/* Conditional Progress Bar */}
        {!isNoEmailMode && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${((step + 1) / 4) * 100}%` }}
            ></div>
          </div>
        )}

        {/* --- NEW: Conditional Form Submit --- */}
        {/* This form is ONLY used for the *final* Part 2 submit or the No-Email submit */}
        <form onSubmit={isNoEmailMode ? handleNoEmailSubmit : handlePart2Submit} className="space-y-6">
          
          {/* Conditional Step Render */}
          {isNoEmailMode ? renderStep(0) : renderStep(step)}

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mt-4">
              {error}
            </div>
          )}

          {/* --- NEW: Conditional Navigation Buttons --- */}
          <div className="flex justify-between pt-4">
            {isNoEmailMode ? (
              // --- "NO EMAIL" MODE (Only Step 0) ---
              <button
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Complete Check-in"}
              </button>
            ) : (
              // --- "EMAIL" (Full Orientation) MODE ---
              <>
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 0 || isSubmitting}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium shadow-sm hover:bg-gray-400 disabled:opacity-50"
                >
                  Back
                </button>
                
                {step === 0 && (
                  <button
                    type="button" // This is NOT a submit button
                    onClick={handlePart1Submit} // Calls Part 1 API
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-blue-700"
                  >
                    {isSubmitting ? "Saving..." : "Next"}
                  </button>
                )}

                {step > 0 && step < 3 && (
                  <button
                    type="button" // This is just a simple "Next"
                    onClick={() => setStep(s => s + 1)}
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-blue-700"
                  >
                    Next
                  </button>
                )}

                {step === 3 && (
                  <button
                    type="submit" // This IS a submit button
                    disabled={isSubmitting}
                    className="bg-green-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Complete Registration"}
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}