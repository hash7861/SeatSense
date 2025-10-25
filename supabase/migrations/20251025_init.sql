-- =========================================================
--  SeatSense Database Schema (Core Tables)
--  Description: Defines tables for tracking study space occupancy
--  Created: 2025-10-25
-- =========================================================

-- TABLE 1: study_spots
-- Stores metadata about each study space
CREATE TABLE IF NOT EXISTS study_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- e.g., "Thompson Library 2F"
  building TEXT,                          -- e.g., "Thompson Library"
  latitude FLOAT,                         -- GPS coords
  longitude FLOAT,
  occupancy FLOAT DEFAULT 0,              -- Predicted % (0–100)
  noise_level FLOAT DEFAULT 0,            -- Avg noise (optional)
  walking_distance FLOAT DEFAULT 0,       -- Optional future metric
  updated_at TIMESTAMP DEFAULT now()
);

-- TABLE 2: spot_updates
-- Tracks user-submitted or simulated data that feeds the AI model
CREATE TABLE IF NOT EXISTS spot_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES study_spots(id),
  user_id uuid,                           -- optional (if using auth)
  status TEXT CHECK (status IN ('empty','moderate','busy')),
  noise_rating INT CHECK (noise_rating BETWEEN 1 AND 5),
  timestamp TIMESTAMP DEFAULT now()
);

-- Sample index for faster recent-lookup queries
CREATE INDEX IF NOT EXISTS idx_spot_updates_spot_id
  ON spot_updates (spot_id, timestamp DESC);
