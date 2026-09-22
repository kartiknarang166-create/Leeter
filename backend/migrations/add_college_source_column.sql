-- ============================================================
-- MIGRATION: Add source column to colleges table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add a 'source' column to track who added the college
-- Values: 'admin' (default) | 'user' (added via the register page)
ALTER TABLE colleges
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin';

-- ============================================================
-- NOTE: The college_suggestions table from the previous
-- migration (add_college_suggestions.sql) is no longer used.
-- You can safely drop it if you haven't run it yet, or leave
-- it as-is — it won't affect anything.
--
-- To drop it (optional):
-- DROP TABLE IF EXISTS college_suggestions;
-- ============================================================
