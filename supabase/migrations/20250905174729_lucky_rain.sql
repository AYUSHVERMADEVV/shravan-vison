/*
# Shravan Vision Database Schema

1. New Tables
  - `users` - User profiles and preferences
    - `id` (uuid, primary key) 
    - `email` (text, unique)
    - `preferences` (jsonb) - language preferences, theme settings
    - `created_at` (timestamp)
  - `translation_logs` - Translation history tracking
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key)
    - `input_text` (text) - original text/gesture description
    - `output_text` (text) - translated result
    - `direction` (text) - translation direction (isl_to_english, english_to_isl, etc.)
    - `created_at` (timestamp)
  - `sos_alerts` - Emergency SOS system
    - `id` (uuid, primary key) 
    - `user_id` (uuid, foreign key)
    - `location` (text) - location data
    - `status` (text) - alert status (pending, resolved, cancelled)
    - `created_at` (timestamp)

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Ensure users can only access their own records

3. Additional Features
  - Default values for better data consistency
  - Proper indexing for performance
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  preferences jsonb DEFAULT '{"language": "english", "theme": "light"}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create translation_logs table  
CREATE TABLE IF NOT EXISTS translation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text text NOT NULL,
  output_text text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('isl_to_english', 'english_to_isl', 'isl_to_hindi', 'hindi_to_isl')),
  created_at timestamptz DEFAULT now()
);

-- Create sos_alerts table
CREATE TABLE IF NOT EXISTS sos_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  location text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create RLS Policies for translation_logs table
CREATE POLICY "Users can read own translation logs"
  ON translation_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own translation logs"
  ON translation_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for sos_alerts table
CREATE POLICY "Users can read own SOS alerts"
  ON sos_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SOS alerts"
  ON sos_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SOS alerts"
  ON sos_alerts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translation_logs_user_id ON translation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_logs_created_at ON translation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id ON sos_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);