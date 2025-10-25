import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OCCUPANCY_MAP = {
  'none': 20,
  'few': 40,
  'many': 70,
  'peak': 85,
}

function getTimeWindow(timestamp: Date): { start: Date; end: Date } {
  const start = new Date(timestamp.getTime() - 15 * 60 * 1000) // -15 minutes
  const end = new Date(timestamp.getTime() + 15 * 60 * 1000)   // +15 minutes
  return { start, end }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { spotId, timestamp } = await req.json()
    const currentTime = timestamp ? new Date(timestamp) : new Date()

    console.log('Estimating occupancy for spot:', spotId, 'at time:', currentTime)

    // Check for cached schedule-based status within last 15 minutes
    const fifteenMinutesAgo = new Date(currentTime.getTime() - 15 * 60 * 1000)
    const { data: cachedStatus } = await supabase
      .from('spot_status')
      .select('*')
      .eq('spot_id', spotId)
      .eq('source', 'schedule')
      .gte('updated_at', fifteenMinutesAgo.toISOString())
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cachedStatus) {
      console.log('Using cached schedule-based occupancy:', cachedStatus.occupancy_percent)
      return new Response(
        JSON.stringify({ occupancy: cachedStatus.occupancy_percent, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = currentTime.getDay()
    
    // Get time in HH:MM:SS format
    const timeStr = currentTime.toTimeString().split(' ')[0] // "HH:MM:SS"
    const timeWindow = getTimeWindow(currentTime)
    const startTimeStr = timeWindow.start.toTimeString().split(' ')[0]
    const endTimeStr = timeWindow.end.toTimeString().split(' ')[0]

    // Query class schedules that overlap with ±15 min window
    const { data: schedules, error } = await supabase
      .from('class_schedules')
      .select('*')
      .eq('spot_id', spotId)
      .eq('day_of_week', dayOfWeek)

    if (error) {
      console.error('Error fetching schedules:', error)
      throw error
    }

    console.log(`Found ${schedules?.length || 0} schedules for day ${dayOfWeek}`)

    // Find overlapping schedules within ±15 min
    let maxOccupancyLevel = 'none'
    let maxOccupancyPercent = 20

    if (schedules && schedules.length > 0) {
      for (const schedule of schedules) {
        const scheduleStart = schedule.start_time
        const scheduleEnd = schedule.end_time
        
        // Check if current time window overlaps with class time
        // Simple overlap check: does [startTimeStr, endTimeStr] overlap with [scheduleStart, scheduleEnd]
        if (timeStr >= scheduleStart && timeStr <= scheduleEnd) {
          const occupancyPercent = OCCUPANCY_MAP[schedule.occupancy_level as keyof typeof OCCUPANCY_MAP]
          if (occupancyPercent > maxOccupancyPercent) {
            maxOccupancyPercent = occupancyPercent
            maxOccupancyLevel = schedule.occupancy_level
          }
        }
      }
    }

    console.log('Calculated occupancy:', maxOccupancyPercent, 'from level:', maxOccupancyLevel)

    // Write to spot_status
    const { error: insertError } = await supabase
      .from('spot_status')
      .insert({
        spot_id: spotId,
        occupancy_percent: maxOccupancyPercent,
        source: 'schedule',
        updated_at: currentTime.toISOString(),
      })

    if (insertError) {
      console.error('Error inserting status:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ occupancy: maxOccupancyPercent, cached: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in estimate-occupancy function:', error)
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
