// ===========================================
// SeatSense | estimate-occupancy Edge Function
// -------------------------------------------
// Purpose: Estimate occupancy for each study spot
// Author: SeatSense Team (HackOHI/O 2025)
// ===========================================
// @ts-nocheck
// deno-lint-ignore-file


import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client using environment variables
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Main handler
serve(async (req) => {
  try {
    // 1️⃣ Fetch latest updates (limit for efficiency)
    const { data: updates, error } = await supabase
      .from("spot_updates")
      .select("spot_id, status, noise_rating, timestamp")
      .order("timestamp", { ascending: false })
      .limit(200);

    if (error) throw error;

    // 2️⃣ Convert raw updates → weighted occupancy scores
    const statusWeights: Record<string, number> = {
      empty: 0.2,
      moderate: 0.6,
      busy: 1.0,
    };

    const spotScores: Record<string, number[]> = {};
    for (const u of updates) {
      if (!spotScores[u.spot_id]) spotScores[u.spot_id] = [];
      spotScores[u.spot_id].push(statusWeights[u.status] || 0.5);
    }

    // 3️⃣ Compute average occupancy per spot
    const results = Object.entries(spotScores).map(([spot_id, scores]) => ({
      spot_id,
      occupancy: Math.round(
        (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
      ),
    }));

    // 4️⃣ Update study_spots table
    for (const r of results) {
      await supabase.from("study_spots")
        .update({ occupancy: r.occupancy, updated_at: new Date().toISOString() })
        .eq("id", r.spot_id);
    }

    // 5️⃣ Return JSON response
    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
