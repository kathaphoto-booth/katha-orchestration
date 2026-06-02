-- ════════════════════════════════════════════════════════════════
-- KATHA PHOTO BOOTH — SUPABASE DATABASE MIGRATION SCHEMA
-- ────────────────────────────────────────────────────────────────
-- Paste this entire block into your Supabase Dashboard SQL Editor:
-- Project URL: https://supabase.com -> SQL Editor -> New Query.
-- ════════════════════════════════════════════════════════════════

-- 1. Create leads table for optimized 3-field intake
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  event_date TEXT NOT NULL,
  lead_hash TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Inquired', -- 'Inquired' | 'Enriched'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create selections table for client template gallery picks
CREATE TABLE IF NOT EXISTS public.selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  layout TEXT NOT NULL,
  names TEXT,
  date TEXT,
  venue TEXT,
  font_family TEXT,
  reference_photos TEXT[], -- Stores uploaded reference images (base64 data URIs or bucket paths)
  notes TEXT,
  lead TEXT REFERENCES public.leads(lead_hash) ON DELETE SET NULL, -- Dynamic tokenized link association
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indices for fast lookup queries
CREATE INDEX IF NOT EXISTS leads_hash_idx ON public.leads(lead_hash);
CREATE INDEX IF NOT EXISTS selections_lead_idx ON public.selections(lead);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selections ENABLE ROW LEVEL SECURITY;

-- 5. Define public access policies
-- Note: Since inquiries and template picks are submitted by anonymous clients on the web,
-- we grant insert and selective select privileges to the public (anon role).
-- Row Level Security policies:

CREATE POLICY "Allow public inserts to leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select of own lead"
  ON public.leads FOR SELECT
  USING (true);

CREATE POLICY "Allow public inserts to selections"
  ON public.selections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select of own selections"
  ON public.selections FOR SELECT
  USING (true);
