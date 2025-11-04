"use client";

import { useState, useEffect } from "react";
// We aren't using createClient in this file, but it's good to keep for later
// import { createClient } from "@/lib/supabase/client";

// Define the structure of a Group
interface Group {
  id: string;
  name: string;
  format: string;
  meeting_day: string;
  meeting_time: string;
  latitude: number | null;
  longitude: number | null;
  distance_meters: number | null;
}

// Define the structure of the Geolocation position
interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

// Define the structure of the Geolocation error
interface GeolocationError {
  code: number;
  message: string;
}

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<
    "loading" | "error" | "success" | "idle" | "submitting" // Added 'submitting' state
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Get the Supabase URL and Key from environment variables
  const functionsUrl = process.env.NEXT_PUBLIC_FUNCTIONS_URL;

  // *** DEBUGGING LINE ADDED HERE ***
  console.log("Functions URL:", functionsUrl);
  // *******************************

  useEffect(() => {
    const fetchGroups = (position: GeolocationPosition | null) => {
      // --- Add a check to make sure the URL is defined ---
      if (!functionsUrl) {
        console.error("Functions URL is not defined!");
        setErrorMessage(
          "Configuration error: Missing functions URL. Check .env.local file."
        );
        setStatus("error");
        return;
      }
      // --------------------------------------------------

      let url = "";
      let options: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""),
        },
      };

      if (position) {
        // If we have location, call the distance function
        url = `${functionsUrl}/get-groups-by-distance`;
        options.body = JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } else {
        // Fallback: call the day sorting function
        url = `${functionsUrl}/get-groups-by-day`;
        const sundayZeroToSaturdaySix = new Date().getUTCDay(); // 0..6
        const isoOneToSeven = ((sundayZeroToSaturdaySix + 6) % 7) + 1; // 1..7
        options.body = JSON.stringify({ day_of_week: isoOneToSeven });
      }

      fetch(url, options)
        .then((res) => {
          if (!res.ok) {
            // Handle non-JSON or other network errors
            return res.json().then((err) => {
              throw new Error(err.message || "Network response was not ok");
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }
          setGroups(data.groups || []);
          setStatus("success"); // Set status to success
        })
        .catch((err) => {
          console.error("Failed to fetch groups:", err);
          // Updated error message to be more specific
          setErrorMessage(`Failed to fetch groups: ${err.message}. Is Supabase running?`);
          setStatus("error");
        });
    };

    // --- Geolocation Logic ---
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          // Success: We have a location
          fetchGroups(position);
        },
        (err: GeolocationError) => {
          // Error: User denied or location failed
          setErrorMessage(
            `Geolocation failed (${err.message}). Sorting by day.`
          );
          fetchGroups(null); // Call the fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        } // <-- The options object correctly ends here
      );
    } else {
      // Error: Browser doesn't support geolocation
      setErrorMessage("Geolocation not supported. Sorting by day.");
      fetchGroups(null); // Call the fallback
    }
  }, [functionsUrl]); // <-- The useEffect hook correctly ends here

  //
  // vvv THIS IS THE CORRECT LOCATION for the handleSignIn function vvv
  // It is INSIDE the Home component, but AFTER the useEffect hook.
  //
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setStatus("submitting"); // Set status to 'submitting'

    if (!selectedGroup || !email) {
      setErrorMessage("Please select a group and enter your email.");
      setStatus("idle"); // Reset status on error
      return;
    }

    const group = groups.find((g) => g.id === selectedGroup);
    if (!group) {
      setErrorMessage("Selected group not found.");
      setStatus("idle"); // Reset status on error
      return;
    }

    // --- UX CHECK (Client-side) ---
    if (group.format === "In-person") {
      if (!userLocation || group.distance_meters === null) {
        setErrorMessage(
          "Could not verify your location for this in-person group."
        );
        setStatus("idle"); // Reset status on error
        return;
      }

      if (group.distance_meters > 200) {
        setErrorMessage(
          `You are too far away (${Math.round(
            group.distance_meters
          )}m) to sign in. You must be within 200m.`
        );
        setStatus("idle"); // Reset status on error
        return;
      }
    }

    // --- THE REAL SUBMISSION (Server-side) ---
    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          groupId: selectedGroup,
          isNoEmail: false, // TODO: You'll need to add a "no email" checkbox to your form
          geolocation: userLocation, // Send the user's location for server validation
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'An error occurred during sign-in.');
        setStatus('idle');
        return;
      }

      // --- Handle the "Routing" from the API ---
      switch (data.status) {
        case 'CHECKIN_COMPLETE':
          // router.push('/complete'); 
          setSuccessMessage('Check-in complete!');
          break;
        case 'ORIENTATION_REQUIRED':
          // router.push('/orientation');
          setSuccessMessage('Orientation required. Redirecting...');
          break;
        case 'NO_EMAIL_INFO_REQUIRED':
          // router.push('/basic-info');
          setSuccessMessage('Please fill in your info. Redirecting...');
          break;
      }

      setEmail("");
      setSelectedGroup("");
      setStatus("success");

    } catch (error) {
      // This is the improved error handling you added. Good idea.
      setErrorMessage(
        error instanceof Error
          ? `Could not connect to the server: ${error.message}`
          : 'Could not connect to the server. Please try again.'
      );
      setStatus('error'); // Changed from 'idle' to 'error'
    }
  }; // <-- The handleSignIn function correctly ends here

  const getDayOfWeek = (day: string) => {
    const days: { [key: string]: string } = {
      "0": "Sunday",
      "1": "Monday",
      "2": "Tuesday",
      "3.0": "Wednesday",
      "4.0": "Thursday",
      "5.0": "Friday",
      "6.0": "Saturday",
    };
    return days[day] || "Unknown Day";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 pt-24 bg-gray-50 text-gray-900">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Welcome to the Register
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Please select your group and enter your email to sign in.
        </p>

        {status === "loading" && (
          <p className="text-blue-600 text-center">
            Fetching groups... Please wait.
          </p>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4">
            {errorMessage}
          </div>
        )}

        {/* This check ensures the form only shows when not loading */
        status !== "loading" && (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="group"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Group
              </label>
              <select
                id="group"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  {groups.length > 0
                    ? "Please select a group..."
                    : "No groups found"}
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} (
                    {group.format === "Online"
                      ? "Online"
                      : `${Math.round(group.distance_meters || 0)}m away`}
                    , {getDayOfWeek(group.meeting_day)} @ {group.meeting_time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {status === "submitting" ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
