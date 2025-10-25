import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const studySpots = [
  { name: "Thompson Library 2F", building: "Thompson", latitude: 40.0078, longitude: -83.0294 },
  { name: "18th Ave Library", building: "18th Ave", latitude: 40.0025, longitude: -83.0152 },
  { name: "Ohio Union 3rd Floor", building: "Union", latitude: 39.9993, longitude: -83.0085 },
];

async function main() {
  for (const spot of studySpots) {
    const { data, error } = await supabase.from("study_spots").insert(spot).select();
    if (error) console.error(error);
    else console.log("Inserted:", data);
  }

  const updates = [
    { status: "busy", noise_rating: 4 },
    { status: "moderate", noise_rating: 3 },
    { status: "empty", noise_rating: 2 },
  ];

  const { data: allSpots } = await supabase.from("study_spots").select("id");
  for (const s of allSpots!) {
    for (const u of updates) {
      await supabase.from("spot_updates").insert({ ...u, spot_id: s.id });
    }
  }

  console.log("✅ Demo data populated!");
}

main();
