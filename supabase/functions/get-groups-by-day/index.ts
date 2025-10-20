
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Body is optional for the no-arg RPC; parse safely
    let day_of_week: number | undefined = undefined;
    try {
      const body = await req.json();
      day_of_week = body?.day_of_week;
    } catch (_) {
      // ignore invalid JSON for this endpoint
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Prefer parameterized RPC if provided; else call no-arg fallback
    const { data, error } = Number.isInteger(day_of_week)
      ? await supabase.rpc("get_groups_sorted_by_day", { today_iso_day: day_of_week })
      : await supabase.rpc("get_groups_sorted_by_day");

    if (error) {
      console.error("RPC error:", error);
      return new Response(JSON.stringify({ error: error.message ?? error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ groups: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    // Log the full error to your Supabase function logs
    console.error(err);

    // Create a more informative error message
    // Supabase RPC errors are objects with a 'message' property
    const message = (err && typeof err === 'object' && 'message' in err)
      ? err.message
      : "An unknown error occurred. Check function logs.";

    return new Response(JSON.stringify({
      error: "Function failed",
      errorMessage: message, // This will contain the REAL database error
      errorDetails: err, // Send back the full error object for debugging
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

