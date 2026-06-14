-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE,
  session_id TEXT UNIQUE,
  zip_code TEXT NOT NULL,
  state TEXT NOT NULL,
  usda_zone TEXT NOT NULL,
  grass_type TEXT NOT NULL,
  square_footage INTEGER,
  has_pets BOOLEAN DEFAULT FALSE,
  sun_exposure TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cached_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  grass_type TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  parsed_plan JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT cached_plans_state_grass_type_unique UNIQUE (state, grass_type)
);
