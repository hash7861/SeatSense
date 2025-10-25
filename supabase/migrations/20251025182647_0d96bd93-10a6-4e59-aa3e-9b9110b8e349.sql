-- Create class_schedules table for storing class times at each spot
CREATE TABLE public.class_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID NOT NULL REFERENCES public.study_spots(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  occupancy_level TEXT NOT NULL CHECK (occupancy_level IN ('none', 'few', 'many', 'peak')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view class schedules
CREATE POLICY "Anyone can view class schedules"
ON public.class_schedules
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_class_schedules_spot_day ON public.class_schedules(spot_id, day_of_week);