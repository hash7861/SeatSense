import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatusUpdate {
  spotId: string
  occupancyPercent?: number
  noiseLevel?: 'Quiet' | 'Medium' | 'Loud'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const update: StatusUpdate = await req.json()

    console.log('Received status update:', update)

    // Validate required fields
    if (!update.spotId) {
      throw new Error('spotId is required')
    }

    if (update.occupancyPercent === undefined && !update.noiseLevel) {
      throw new Error('At least one of occupancyPercent or noiseLevel is required')
    }

    // Insert new status
    const { data, error } = await supabase
      .from('spot_status')
      .insert({
        spot_id: update.spotId,
        occupancy_percent: update.occupancyPercent || null,
        noise_level: update.noiseLevel || null,
        source: 'user',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting status:', error)
      throw error
    }

    console.log('Status updated successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in submit-status function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})