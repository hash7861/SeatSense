export type Prefs = {
  duration: number
  groupSize: number
  lat?: number | null
  lng?: number | null
}

export type RankedSpot = {
  id: string
  name: string
  building?: string
  floor?: string
  occupancyPercent?: number | null
  distanceMeters?: number | null
  score: number
  reasons: string[]
  warnings: string[]
  updatedAt?: string | null
  source?: string | null
  lat?: number
  lng?: number
}

const API = import.meta.env.VITE_API_BASE

// Haversine formula to calculate distance between two points in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export async function getRecommendations(prefs: Prefs, limit = 5): Promise<RankedSpot[]> {
  // Call Python API without location data for distance calculation
  const prefsWithoutLocation = {
    duration: prefs.duration,
    groupSize: prefs.groupSize
  }
  
  const res = await fetch(`${API}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefs: prefsWithoutLocation, limit })
  })
  if (!res.ok) throw new Error(`Recommend failed: ${res.status}`)
  const data = await res.json()
  let results = data.results as RankedSpot[]

  // Calculate distance locally if user location is provided
  if (prefs.lat != null && prefs.lng != null) {
    results = results.map(spot => {
      if (spot.lat != null && spot.lng != null) {
        const distanceMeters = calculateDistance(prefs.lat!, prefs.lng!, spot.lat, spot.lng)
        return {
          ...spot,
          distanceMeters
        }
      }
      return spot
    })
  }

  return results
}
