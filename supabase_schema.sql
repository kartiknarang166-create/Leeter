-- ============================================================
-- LEETER — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. COLLEGES
CREATE TABLE IF NOT EXISTS colleges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  logo_url    text,
  state       text,
  type        text DEFAULT 'Engineering', -- Engineering / Medical / Arts
  created_at  timestamptz DEFAULT now()
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username            text UNIQUE NOT NULL,
  display_name        text,
  email               text UNIQUE NOT NULL,
  password_hash       text NOT NULL,
  college_id          uuid REFERENCES colleges(id),
  leetcode_username   text UNIQUE,
  created_at          timestamptz DEFAULT now()
);

-- 3. LEETCODE STATS (one row per user, upserted daily)
CREATE TABLE IF NOT EXISTS leetcode_stats (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_solved        int DEFAULT 0,
  easy_solved         int DEFAULT 0,
  medium_solved       int DEFAULT 0,
  hard_solved         int DEFAULT 0,
  ranking             int,
  acceptance_rate     float DEFAULT 0,
  streak              int DEFAULT 0,
  total_active_days   int DEFAULT 0,
  reputation          int DEFAULT 0,
  badges              jsonb DEFAULT '[]',
  fetched_at          timestamptz DEFAULT now()
);

-- 4. DAILY CHALLENGES
CREATE TABLE IF NOT EXISTS daily_challenges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date UNIQUE NOT NULL,
  title       text,
  slug        text,
  difficulty  text,
  link        text,
  solved_by   uuid[] DEFAULT '{}'
);

-- ============================================================
-- SEED: Indian Engineering Colleges
-- ============================================================
INSERT INTO colleges (name, slug, state, type) VALUES
  ('IIT Bombay', 'iit-bombay', 'Maharashtra', 'IIT'),
  ('IIT Delhi', 'iit-delhi', 'Delhi', 'IIT'),
  ('IIT Madras', 'iit-madras', 'Tamil Nadu', 'IIT'),
  ('IIT Kanpur', 'iit-kanpur', 'Uttar Pradesh', 'IIT'),
  ('IIT Kharagpur', 'iit-kharagpur', 'West Bengal', 'IIT'),
  ('IIT Hyderabad', 'iit-hyderabad', 'Telangana', 'IIT'),
  ('IIT Roorkee', 'iit-roorkee', 'Uttarakhand', 'IIT'),
  ('IIT Guwahati', 'iit-guwahati', 'Assam', 'IIT'),
  ('NIT Trichy', 'nit-trichy', 'Tamil Nadu', 'NIT'),
  ('NIT Warangal', 'nit-warangal', 'Telangana', 'NIT'),
  ('NIT Surathkal', 'nit-surathkal', 'Karnataka', 'NIT'),
  ('NIT Calicut', 'nit-calicut', 'Kerala', 'NIT'),
  ('BITS Pilani', 'bits-pilani', 'Rajasthan', 'BITS'),
  ('BITS Goa', 'bits-goa', 'Goa', 'BITS'),
  ('BITS Hyderabad', 'bits-hyderabad', 'Telangana', 'BITS'),
  ('VIT Vellore', 'vit-vellore', 'Tamil Nadu', 'Deemed'),
  ('VIT Chennai', 'vit-chennai', 'Tamil Nadu', 'Deemed'),
  ('SRM Institute of Science and Technology', 'srm-institute', 'Tamil Nadu', 'Deemed'),
  ('Manipal Institute of Technology', 'manipal', 'Karnataka', 'Deemed'),
  ('PSG College of Technology', 'psg-coimbatore', 'Tamil Nadu', 'Autonomous'),
  ('Anna University', 'anna-university', 'Tamil Nadu', 'State'),
  ('DTU Delhi', 'dtu-delhi', 'Delhi', 'State'),
  ('NSIT Delhi', 'nsit-delhi', 'Delhi', 'State'),
  ('IIIT Hyderabad', 'iiit-hyderabad', 'Telangana', 'IIIT'),
  ('IIIT Bangalore', 'iiit-bangalore', 'Karnataka', 'IIIT'),
  ('Jadavpur University', 'jadavpur-university', 'West Bengal', 'State'),
  ('Thapar University', 'thapar-university', 'Punjab', 'Deemed'),
  ('Amrita Vishwa Vidyapeetham', 'amrita', 'Tamil Nadu', 'Deemed'),
  ('KJ Somaiya College of Engineering', 'kjsomaiya', 'Maharashtra', 'Autonomous'),
  ('College of Engineering Pune', 'coep', 'Maharashtra', 'Autonomous'),
  ('Maharaja Agrasen Institute of Technology', 'mait-delhi', 'Delhi', 'Private')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- RLS Policies (enable Row Level Security for security)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Colleges: public read
CREATE POLICY "colleges_public_read" ON colleges FOR SELECT USING (true);

-- Users: public read (username, display_name, college_id, leetcode_username only — NOT password_hash)
CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);

-- Stats: public read
CREATE POLICY "stats_public_read" ON leetcode_stats FOR SELECT USING (true);

-- Daily challenges: public read
CREATE POLICY "daily_challenge_public_read" ON daily_challenges FOR SELECT USING (true);

-- Service role bypasses all policies (backend uses service role key)

-- ============================================================
-- REALTIME: Enable real-time for leaderboard live updates
-- Run this AFTER the tables are created
-- ============================================================
-- In Supabase Dashboard: Database → Replication → supabase_realtime
-- Toggle ON: leetcode_stats, daily_challenges

-- Or run via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE leetcode_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_challenges;
