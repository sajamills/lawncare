ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS completed_tasks TEXT[] DEFAULT '{}';
