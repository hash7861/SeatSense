// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    // Parse optional user location from query string (for future use)
    const url = new URL(req.url);
    const lat = Number(url.searchParams.get("lat")) || 40.0076; // OSU coordinates default
    const lon = Number(url.searchParams.get("lon")) || -83.0300;

    const { data: spots, error } = await supabase
      .from("study_spots")
      .select("id, name, latitude, longitude");

    if (error) throw error;

    // Fake distance calculation
    const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // km
    };

    const updated = spots.map((s) => ({
      id: s.id,
      name: s.name,
      walking_distance: Math.round(calcDistance(lat, lon, s.latitude, s.longitude) * 1000), // m
    }));

    // Push updates
    for (const spot of updated) {
      await supabase
        .from("study_spots")
        .update({ walking_distance: spot.walking_distance })
        .eq("id", spot.id);
    }

    return new Response(JSON.stringify({ success: true, data: updated }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
