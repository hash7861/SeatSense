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
}

const API = import.meta.env.VITE_API_BASE

export async function getRecommendations(prefs: Prefs, limit = 5): Promise<RankedSpot[]> {
  const res = await fetch(`${API}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefs, limit })
  })
  if (!res.ok) throw new Error(`Recommend failed: ${res.status}`)
  const data = await res.json()
  return data.results as RankedSpot[]
}
