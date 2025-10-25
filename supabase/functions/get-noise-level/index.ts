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
    const { data: spots, error } = await supabase
      .from("study_spots")
      .select("id, name, noise_level");

    if (error) throw error;

    // Mock new random readings for demo
    const updated = spots.map((s) => ({
      ...s,
      noise_level: Math.min(100, Math.max(0, s.noise_level + (Math.random() - 0.5) * 15)),
    }));

    // Push updated values back
    for (const spot of updated) {
      await supabase
        .from("study_spots")
        .update({ noise_level: spot.noise_level })
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
