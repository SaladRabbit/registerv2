import { createClient } from "@supabase/supabase-js";
import { load } from "dotenv";

// Load environment variables from a .env file colocated with this script
const env = await load({ envPath: new URL("./.env", import.meta.url).pathname });

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY from .env file");
  console.error("Please ensure supabase/functions/.env exists and is correct.");
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testEmail = "test.user@example.com";
const testPassword = "password123";

async function getToken() {
  // First, try to sign in
  let { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  // If user doesn't exist, sign them up
  if (error && error.message.includes("Invalid login credentials")) {
    console.log("Test user not found, creating new user...");
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

    if (signUpError) {
      console.error("Error signing up:", signUpError.message);
      Deno.exit(1);
    }
    // Set data to the new user's session
    data = signUpData;
  } else if (error) {
    console.error("Error signing in:", error.message);
    Deno.exit(1);
  }

  if (data?.session) {
    console.log("--- COPY YOUR ACCESS TOKEN BELOW ---");
    console.log(data.session.access_token);
    console.log("------------------------------------");
  } else {
    console.error("Could not get a session.");
  }
}

getToken();

