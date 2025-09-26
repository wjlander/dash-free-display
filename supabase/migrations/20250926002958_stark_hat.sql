/*
  # Dashboard Screens for Multi-Screen Support

  1. New Tables
    - `dashboard_screens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, screen display name)
      - `description` (text, optional description)
      - `layout_data` (jsonb, widget layout configuration)
      - `is_public` (boolean, whether screen is publicly accessible)
      - `public_token` (text, unique token for public access)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `dashboard_screens` table
    - Add policies for authenticated users to manage their own screens
    - Add policy for public access to screens marked as public
    - Add unique constraint on public_token

  3. Indexes
    - Index on user_id for fast user screen lookups
    - Index on public_token for fast public screen access
*/

CREATE TABLE IF NOT EXISTS dashboard_screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  layout_data jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT false,
  public_token text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE dashboard_screens ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_screens_user_id 
  ON dashboard_screens(user_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_screens_public_token 
  ON dashboard_screens(public_token) 
  WHERE public_token IS NOT NULL;

-- RLS Policies for authenticated users
CREATE POLICY "Users can view their own screens"
  ON dashboard_screens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own screens"
  ON dashboard_screens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own screens"
  ON dashboard_screens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own screens"
  ON dashboard_screens
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy for public access
CREATE POLICY "Public screens are viewable by everyone"
  ON dashboard_screens
  FOR SELECT
  TO public
  USING (is_public = true AND public_token IS NOT NULL);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_dashboard_screens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_screens_updated_at
  BEFORE UPDATE ON dashboard_screens
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_screens_updated_at();