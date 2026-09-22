-- ============================================================
-- MIGRATION: College Suggestions
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Table to hold user-submitted college suggestions
CREATE TABLE IF NOT EXISTS college_suggestions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,
  state                text,
  status               text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  resolved_college_id  uuid REFERENCES colleges(id) ON DELETE SET NULL,
  created_at           timestamptz DEFAULT now()
);

-- Optional: prevent exact-duplicate pending suggestions (same name + state)
-- Remove this if you want duplicates allowed
CREATE UNIQUE INDEX IF NOT EXISTS college_suggestions_name_state_pending_idx
  ON college_suggestions (lower(name), lower(coalesce(state, '')))
  WHERE status = 'pending';

-- RLS: No public read (admin-only via service role)
ALTER TABLE college_suggestions ENABLE ROW LEVEL SECURITY;

-- No public policies — backend uses service role key which bypasses RLS
-- ============================================================
