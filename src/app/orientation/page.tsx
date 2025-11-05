"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  currentlyInTreatment: string;
  currentTreatmentProgramme: string;
  previousTreatment: string;
  previousTreatmentProgrammes: string;
  previousRecoveryGroups: string;
  previousRecoveryGroupsNames: string;
  goalsForAttending: string;
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
  const [step, setStep] = useState(0); // 0: Basic, 1: Emergency, 2: Research, 3: Consents
  
  // Initialize all form fields
  const [formData, setFormData] = useState<FormData>({
    firstName: "", lastName: "", phone: "", dateOfBirth: "", gender: "", ethnicity: "",
    emergencyContactName: "", emergencyContactPhone: "", emergencyContactEmail: "",
    reasonForAttending: "", sourceOfDiscovery: "", problematicSubstances: "",
    currentlyInTreatment: "No", currentTreatmentProgramme: "", previousTreatment: "No",
    previousTreatmentProgrammes: "", previousRecoveryGroups: "No", previousRecoveryGroupsNames: "",
    goalsForAttending: "", anythingElseImportant: "", howElseHelp: "",
    consentWhatsapp: false, consentConfidentiality: false, consentAnonymity: false,
    consentLiability: false, consentVoluntary: false,
  });
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // --- UPDATED: Full Validation Logic ---
  const validateStep = () => {
    setError(""); // Clear old errors

    if (step === 0) { // Step 0: Basic Info
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.dateOfBirth || !formData.gender || !formData.ethnicity) {
        setError("Please fill in all required fields on this page.");
        return false;
      }
    }
    
    if (step === 1) { // Step 1: Emergency Contact
      if (!formData.emergencyContactName || !formData.emergencyContactPhone || !formData.emergencyContactEmail) {
        setError("Please fill in all required fields on this page.");
        return false;
      }
    }
    
    if (step === 2) { // Step 2: Research Questions
      // Check all text/textarea fields first
      if (!formData.reasonForAttending || !formData.sourceOfDiscovery || !formData.problematicSubstances ||
          !formData.goalsForAttending || !formData.anythingElseImportant || !formData.howElseHelp) {
        setError("Please fill in all required fields on this page.");
        return false;
      }
      
      // Now check the conditional fields
      if (formData.currentlyInTreatment === 'Yes' && !formData.currentTreatmentProgramme) {
        setError("Please specify which treatment programme you are currently in.");
        return false;
      }
      if (formData.previousTreatment === 'Yes' && !formData.previousTreatmentProgrammes) {
        setError("Please specify which treatment programme(s) you have been in.");
        return false;
      }
      if (formData.previousRecoveryGroups === 'Yes' && !formData.previousRecoveryGroupsNames) {
        setError("Please specify which Recovery group(s) you have attended.");
        return false;
      }
    }

    return true; // All good
  }

  // --- UPDATED nextStep ---
  const nextStep = () => {
    // Run validation *before* moving to the next step
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError(""); // Clear error when going back
    setStep(prev => prev - 1);
  };

  // This function is only called on the *final* step
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step !== 3) {
      console.warn("Form submitted on an early step, this shouldn't happen.");
      return; 
    } 

    // Final validation for required consents
    if (!formData.consentConfidentiality || !formData.consentAnonymity || !formData.consentLiability || !formData.consentVoluntary) {
      setError("You must agree to all required consents to proceed.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Submit ALL data to the single endpoint
      const response = await fetch('/api/orientation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Send the entire form state
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An unknown error occurred.");
        setIsSubmitting(false);
        return;
      }

      // Success! API has updated cookies, now redirect.
      router.push('/complete');

    } catch (err) {
      setError("Could not connect to the server. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Helper function to render the correct form fields for the current step
  const renderStep = () => {
    // Re-usable required asterisk
    const Req = () => <span className="text-red-600">*</span>;

    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700">Part 1 of 4: Basic Info</h2>
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
              <input id="gender" name="gender" type="text" value={formData.gender} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 mb-1">Ethnicity <Req /></label>
              <input id="ethnicity" name="ethnicity" type="text" value={formData.ethnicity} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700">Part 2 of 4: Emergency Contact</h2>
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
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700">Part 3 of 4: Research Questions</h2>
            <div>
              <label htmlFor="reasonForAttending" className="block text-sm font-medium text-gray-700 mb-1">Reason for Attending <Req /></label>
              <input id="reasonForAttending" name="reasonForAttending" type="text" value={formData.reasonForAttending} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="sourceOfDiscovery" className="block text-sm font-medium text-gray-700 mb-1">Where did you hear about us? <Req /></label>
              <input id="sourceOfDiscovery" name="sourceOfDiscovery" type="text" value={formData.sourceOfDiscovery} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="problematicSubstances" className="block text-sm font-medium text-gray-700 mb-1">Which substances and/or behaviours are problematic for you? <Req /></label>
              <textarea id="problematicSubstances" name="problematicSubstances" value={formData.problematicSubstances} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows={2} />
            </div>
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
                <input id="previousTreatmentProgrammes" name="previousTreatmentProgrammes" type="text" value={formData.previousTreatmentProgrammes} onChange={handleChange} required={formData.previousTreatment === 'Yes'} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
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
                <input id="previousRecoveryGroupsNames" name="previousRecoveryGroupsNames" type="text" value={formData.previousRecoveryGroupsNames} onChange={handleChange} required={formData.previousRecoveryGroups === 'Yes'} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            )}
            <div>
              <label htmlFor="goalsForAttending" className="block text-sm font-medium text-gray-700 mb-1">What do you hope to achieve by attending? <Req /></label>
              <textarea id="goalsForAttending" name="goalsForAttending" value={formData.goalsForAttending} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows={2} />
            </div>
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
      case 3:
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
Verify
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
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          New Member Orientation
        </h1>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          ></div>
        </div>

        {/* We wrap the step renderer in the form tag */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {renderStep()}

          {/* UPDATED Error Message Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mt-4">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium shadow-sm hover:bg-gray-400 disabled:opacity-50"
            >
              Back
            </button>
            
            {/* Show "Next" button if not on the last step */}
            {step < 3 && (
              <button
                type="button"
                onClick={nextStep} // Use the new, validating nextStep function
                className="bg-blue-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-blue-700"
              >
                Next
              </button>
            )}

            {/* Show "Submit" button only on the last step */}
            {step === 3 && (
              <button
                type="submit" // This is the button that submits the form
                disabled={isSubmitting}
                className="bg-green-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Complete Registration"}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}