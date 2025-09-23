-- Create location_tracks table for storing user location data
CREATE TABLE public.location_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  address TEXT,
  location_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.location_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for location tracking
CREATE POLICY "Users can view their own location tracks" 
ON public.location_tracks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own location tracks" 
ON public.location_tracks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location tracks" 
ON public.location_tracks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own location tracks" 
ON public.location_tracks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_location_tracks_user_timestamp ON public.location_tracks(user_id, timestamp DESC);

-- Create user_settings table for dashboard preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  google_calendar_enabled BOOLEAN DEFAULT false,
  google_calendar_id TEXT,
  location_tracking_enabled BOOLEAN DEFAULT false,
  display_name TEXT,
  home_address TEXT,
  work_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();