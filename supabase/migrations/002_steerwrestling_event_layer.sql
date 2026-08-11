-- 002 — Steer wrestling event layer
--
-- The hazer system is the differentiator: you cannot compete without one,
-- and the hazer is owed a share of what you win. The settlement ledger below
-- is not an escrow and not a payment processor — it is a record both parties
-- can see, which is what makes the after-the-rodeo argument go away.

CREATE TABLE IF NOT EXISTS public.horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barn_name TEXT NOT NULL,
  registered_name TEXT,
  sw_role TEXT CHECK (sw_role IN ('bulldogging','hazing','both','prospect')),
  shareable BOOLEAN NOT NULL DEFAULT false,
  mount_money_pct NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sw_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID REFERENCES public.horses(id) ON DELETE SET NULL,
  hazer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rule_set_id UUID REFERENCES public.rule_sets(id),
  raw_time_ms INTEGER,
  official_time_ms INTEGER,
  legal_fall BOOLEAN,
  barrier_broken BOOLEAN NOT NULL DEFAULT false,
  throw_technique TEXT CHECK (throw_technique IN ('classic','wing','sling','rollover')),
  status TEXT NOT NULL DEFAULT 'clean',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hazer_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  available BOOLEAN NOT NULL DEFAULT true,
  horses_available INTEGER NOT NULL DEFAULT 0,
  home_region TEXT,
  travel_radius_mi INTEGER,
  rate_note TEXT,
  payout_share_pct NUMERIC(5,2) NOT NULL DEFAULT 25,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.hazer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wrestler_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hazer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT,
  performance_at TIMESTAMPTZ,
  agreed_share_pct NUMERIC(5,2) NOT NULL DEFAULT 25,
  horse_id UUID REFERENCES public.horses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','confirmed','declined','completed','no_show')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hazer_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.sw_runs(id) ON DELETE CASCADE,
  wrestler_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hazer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_pct NUMERIC(5,2) NOT NULL,
  -- Integer cents. A ledger that does not balance is a ledger nobody trusts.
  amount_owed_cents INTEGER NOT NULL DEFAULT 0,
  settled BOOLEAN NOT NULL DEFAULT false,
  settled_at TIMESTAMPTZ,
  settlement_note TEXT
);

CREATE TABLE IF NOT EXISTS public.hazer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hazer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keeps_steer_straight INTEGER CHECK (keeps_steer_straight BETWEEN 1 AND 10),
  reliability INTEGER CHECK (reliability BETWEEN 1 AND 10),
  horsepower INTEGER CHECK (horsepower BETWEEN 1 AND 10),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hazer_id, rater_id)
);

ALTER TABLE public.horses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_runs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazer_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazer_credits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazer_ratings     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own horses" ON public.horses;
CREATE POLICY "Users manage own horses" ON public.horses FOR ALL
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users manage own runs" ON public.sw_runs;
CREATE POLICY "Users manage own runs" ON public.sw_runs FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Hazer profiles are public" ON public.hazer_profiles;
CREATE POLICY "Hazer profiles are public" ON public.hazer_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users manage own hazer profile" ON public.hazer_profiles;
CREATE POLICY "Users manage own hazer profile" ON public.hazer_profiles FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
-- Both parties see the assignment and both see the ledger. That is the point.
DROP POLICY IF EXISTS "Both parties see assignments" ON public.hazer_assignments;
CREATE POLICY "Both parties see assignments" ON public.hazer_assignments FOR ALL
  USING (wrestler_id = auth.uid() OR hazer_id = auth.uid())
  WITH CHECK (wrestler_id = auth.uid() OR hazer_id = auth.uid());
DROP POLICY IF EXISTS "Both parties see credits" ON public.hazer_credits;
CREATE POLICY "Both parties see credits" ON public.hazer_credits FOR ALL
  USING (wrestler_id = auth.uid() OR hazer_id = auth.uid())
  WITH CHECK (wrestler_id = auth.uid() OR hazer_id = auth.uid());
DROP POLICY IF EXISTS "Hazer ratings are public" ON public.hazer_ratings;
CREATE POLICY "Hazer ratings are public" ON public.hazer_ratings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users write own hazer ratings" ON public.hazer_ratings;
CREATE POLICY "Users write own hazer ratings" ON public.hazer_ratings FOR INSERT
  WITH CHECK (rater_id = auth.uid());
