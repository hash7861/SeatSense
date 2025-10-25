// ===========================================
// SeatSense | LLM Mock Generator
// -------------------------------------------
// Purpose: Fake AI reasoning for demo visuals
// ===========================================

export function simulateLLMResponse(statuses: string[]): number {
  // Map textual inputs to numeric scores
  const weights: Record<string, number> = {
    empty: 0.2,
    moderate: 0.6,
    busy: 1.0,
  };

  const baseScore =
    statuses.map((s) => weights[s] || 0.5).reduce((a, b) => a + b, 0) /
    statuses.length;

  // Add a small random “AI confidence” variance for realism
  const noise = (Math.random() - 0.5) * 0.1;
  const final = Math.min(1, Math.max(0, baseScore + noise));

  // Return as percentage
  return Math.round(final * 100);
}
