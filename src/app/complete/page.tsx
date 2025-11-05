"use client";
import { useRouter } from "next/navigation"; // <-- 1. Import useRouter

export default function CompletePage() {
  
  const router = useRouter(); // <-- 2. Initialize the router
  
  const handleGoHome = () => {
    // 3. Just navigate home. The middleware (Fix 1)
    // has already cleared the cookie for us.
    router.push('/');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 pt-24 bg-gray-50 text-gray-900">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-600">
          All Set!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you. Your orientation is complete and you are now checked in.
        </p>
        <button
          type="button"
          onClick={handleGoHome} // <-- 4. Connect the function
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Go to Homepage
        </button>
      </div>
    </main>
  );
}

