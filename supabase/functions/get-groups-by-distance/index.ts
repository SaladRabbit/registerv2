import { createClient } from "@supabase/supabase-js";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (for local dev)
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and preflight OPTIONS
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // This is the preflight request.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const { data, error } = await supabase.rpc(
      "get_groups_sorted_by_distance",
      {
        user_lat: latitude,
        user_lon: longitude,
      },
    );

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ groups: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error
      ? err.message
      : typeof err === "string"
      ? err
      : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

