-- Create study_spots table
CREATE TABLE public.study_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  floor TEXT NOT NULL,
  lat DOUBLE PRECISION DEFAULT 0.0,
  lng DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create spot_status table for occupancy and noise data
CREATE TABLE public.spot_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES public.study_spots(id) ON DELETE CASCADE,
  occupancy_percent INTEGER CHECK (occupancy_percent >= 0 AND occupancy_percent <= 100),
  noise_level TEXT CHECK (noise_level IN ('Quiet', 'Medium', 'Loud')),
  source TEXT NOT NULL CHECK (source IN ('schedule', 'user')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_status ENABLE ROW LEVEL SECURITY;

-- Public read access for study spots (anyone can view)
CREATE POLICY "Anyone can view study spots"
ON public.study_spots
FOR SELECT
USING (true);

-- Public read access for spot status
CREATE POLICY "Anyone can view spot status"
ON public.spot_status
FOR SELECT
USING (true);

-- Public insert access for spot status (user submissions)
CREATE POLICY "Anyone can submit spot status updates"
ON public.spot_status
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_spot_status_spot_id ON public.spot_status(spot_id);
CREATE INDEX idx_spot_status_updated_at ON public.spot_status(spot_id, updated_at DESC);
CREATE INDEX idx_study_spots_name ON public.study_spots(name);

-- Seed OSU study spots
INSERT INTO public.study_spots (name, building, floor, lat, lng) VALUES
('Baker Systems Engineering Informal Space', 'Baker Systems Engineering', 'Room 160', 40.0016, -83.0154),
('Denney Basement Seating', 'Denney Hall', 'Basement', 40.0020, -83.0130),
('Derby 38 study space', 'Derby Hall', 'Room 038', 39.9985, -83.0090),
('Enarson Classroom Building Basement Study Space', 'Enarson Classroom Building', 'Basement', 40.0025, -83.0110),
('Enarson Classroom Building 3rd floor space', 'Enarson Classroom Building', 'Third Floor', 40.0025, -83.0110),
('Lounge Seating in Hayes Hall', 'Hayes Hall', 'Basement', 40.0010, -83.0145),
('Counter height seating and power', 'Hitchcock Hall', 'Basement', 40.0018, -83.0165),
('Journalism Building lobby', 'Journalism Building', 'Lobby', 40.0015, -83.0125),
('McPherson hall study space', 'McPherson Chemical Laboratory', 'Lobby', 40.0012, -83.0160),
('Open seating area with collaboration rooms in background', 'Smith Laboratories', 'First Floor', 40.0022, -83.0148),
('Smith Labs Study Space', 'Smith Laboratories', 'Room 1186', 40.0022, -83.0148),
('Stillman lobby Study Space', 'Stillman Hall', 'First Floor Lobby', 40.0024, -83.0142),
('Wireless display and lounge seating', 'Stillman Hall', 'Room 103', 40.0024, -83.0142),
('Lounge and table seating', 'Stillman Hall', 'Room 107', 40.0024, -83.0142),
('University Hall 24 study space', 'University Hall', 'Room 024', 40.0028, -83.0115),
('Enarson Classroom Building Suite 030', 'Enarson Classroom Building', 'Suite 030', 40.0025, -83.0110);

-- Seed some initial schedule-based occupancy data
INSERT INTO public.spot_status (spot_id, occupancy_percent, noise_level, source, updated_at)
SELECT 
  id,
  FLOOR(RANDOM() * 60 + 20)::INTEGER, -- Random occupancy 20-80%
  CASE 
    WHEN RANDOM() < 0.33 THEN 'Quiet'
    WHEN RANDOM() < 0.66 THEN 'Medium'
    ELSE 'Loud'
  END,
  'schedule',
  now() - (RANDOM() * INTERVAL '30 minutes')
FROM public.study_spots;