"use client";

import { useState } from "react";
// We can add useRouter when we're ready to submit
// import { useRouter } from "next/navigation";

export default function OrientationPage() {
  // We'll add state here for the form fields
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Here we will call the '/api/orientation/part1'
    // endpoint as defined in the tech spec.
    console.log("Submitting orientation data...");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 pt-24 bg-gray-50 text-gray-900">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Orientation
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Welcome! Please provide a few more details to complete your registration.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TODO: Add form fields from the tech spec for 'part1'
            - firstName
            - lastName
            - etc.
          */}

          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name (Placeholder)
            </label>
            <input
              id="firstName"
              type="text"
              // value={firstName}
              // onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your first name"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
