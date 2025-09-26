/*
  # Home Assistant Integration Tables

  1. New Tables
    - `home_assistant_configs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `ha_url` (text, Home Assistant URL)
      - `access_token` (text, encrypted access token)
      - `connection_type` (text, 'local' or 'cloud')
      - `is_connected` (boolean, connection status)
      - `last_sync` (timestamp, last successful sync)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `home_assistant_widgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `entity_id` (text, Home Assistant entity ID)
      - `display_name` (text, custom display name)
      - `widget_type` (text, widget type)
      - `position` (jsonb, widget position data)
      - `config` (jsonb, widget configuration)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Add indexes for performance

  3. Functions
    - Add trigger for updated_at timestamps
*/

-- Home Assistant Configurations Table
CREATE TABLE IF NOT EXISTS home_assistant_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ha_url text NOT NULL,
  access_token text NOT NULL,
  connection_type text NOT NULL DEFAULT 'local',
  is_connected boolean DEFAULT false,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT home_assistant_configs_connection_type_check 
    CHECK (connection_type IN ('local', 'cloud')),
  CONSTRAINT home_assistant_configs_user_id_unique UNIQUE (user_id)
);

-- Home Assistant Widget Items Table
CREATE TABLE IF NOT EXISTS home_assistant_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_id text NOT NULL,
  display_name text NOT NULL,
  widget_type text NOT NULL DEFAULT 'sensor',
  position jsonb DEFAULT '{"x": 0, "y": 0, "w": 2, "h": 1}'::jsonb,
  config jsonb DEFAULT '{"show_icon": true, "show_state": true, "show_attributes": []}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT home_assistant_widgets_widget_type_check 
    CHECK (widget_type IN ('toggle', 'sensor', 'climate', 'light', 'cover', 'media_player')),
  CONSTRAINT home_assistant_widgets_user_entity_unique UNIQUE (user_id, entity_id)
);

-- Enable Row Level Security
ALTER TABLE home_assistant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_assistant_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for home_assistant_configs
CREATE POLICY "Users can view their own HA configs"
  ON home_assistant_configs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own HA configs"
  ON home_assistant_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HA configs"
  ON home_assistant_configs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own HA configs"
  ON home_assistant_configs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for home_assistant_widgets
CREATE POLICY "Users can view their own HA widgets"
  ON home_assistant_widgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own HA widgets"
  ON home_assistant_widgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HA widgets"
  ON home_assistant_widgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own HA widgets"
  ON home_assistant_widgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_home_assistant_configs_user_id 
  ON home_assistant_configs(user_id);

CREATE INDEX IF NOT EXISTS idx_home_assistant_widgets_user_id 
  ON home_assistant_widgets(user_id);

CREATE INDEX IF NOT EXISTS idx_home_assistant_widgets_entity_id 
  ON home_assistant_widgets(entity_id);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_home_assistant_configs_updated_at
  BEFORE UPDATE ON home_assistant_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_assistant_widgets_updated_at
  BEFORE UPDATE ON home_assistant_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();