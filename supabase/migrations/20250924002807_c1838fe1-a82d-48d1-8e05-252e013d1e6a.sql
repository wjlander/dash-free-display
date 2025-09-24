-- Add dashboard customization tables
CREATE TABLE public.dashboard_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  layout_name TEXT NOT NULL DEFAULT 'Default',
  layout_data JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own layouts" 
ON public.dashboard_layouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own layouts" 
ON public.dashboard_layouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own layouts" 
ON public.dashboard_layouts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own layouts" 
ON public.dashboard_layouts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add widget preferences and theme settings to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS visible_widgets JSONB DEFAULT '["clock", "weather", "calendar", "location"]',
ADD COLUMN IF NOT EXISTS theme_variant TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS widget_order JSONB DEFAULT '[]';

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dashboard_layouts_updated_at
BEFORE UPDATE ON public.dashboard_layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();