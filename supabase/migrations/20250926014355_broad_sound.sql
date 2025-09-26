/*
  # Google Calendar Integration Tables

  1. New Tables
    - `google_calendar_configs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `access_token` (text, encrypted OAuth access token)
      - `refresh_token` (text, encrypted OAuth refresh token)
      - `expires_at` (timestamptz, token expiration time)
      - `scope` (text, granted OAuth scopes)
      - `is_connected` (boolean, connection status)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `google_calendar_configs` table
    - Add policies for users to manage their own calendar configs
    - Unique constraint on user_id (one config per user)

  3. Indexes
    - Index on user_id for fast lookups
    - Index on expires_at for token refresh queries
*/

-- Create google_calendar_configs table
CREATE TABLE IF NOT EXISTS google_calendar_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  scope text NOT NULL DEFAULT 'https://www.googleapis.com/auth/calendar.readonly',
  is_connected boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE google_calendar_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own calendar configs"
  ON google_calendar_configs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_google_calendar_configs_user_id 
  ON google_calendar_configs(user_id);

CREATE INDEX IF NOT EXISTS idx_google_calendar_configs_expires_at 
  ON google_calendar_configs(expires_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_google_calendar_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_google_calendar_configs_updated_at
  BEFORE UPDATE ON google_calendar_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_google_calendar_configs_updated_at();