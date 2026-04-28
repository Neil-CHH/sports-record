-- 雙寶運動紀錄 — 在 Supabase SQL editor 跑一次。
-- 與 Height tracker 共用同一個 project,FK 指向既有的 public.members。

------------------------------------------------------------
-- 1. matches: 比賽紀錄
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id text PRIMARY KEY,
  member_id text NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  date date NOT NULL,
  event_name text,
  round text,                                  -- 預賽/8強/4強/決賽 或自由文字
  opponent_school text,
  opponent_name text,
  opponent_hand text,                          -- 'R' | 'L' | null
  format text,                                 -- 'singles' | 'doubles'
  partner_name text,
  scores jsonb,                                -- [{us:21, them:15}, ...]
  result text CHECK (result IN ('W','L')),
  tags text[],
  note text,
  recorded_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS matches_member_date_idx
  ON public.matches (member_id, date DESC);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches public read"   ON public.matches;
DROP POLICY IF EXISTS "matches public insert" ON public.matches;
DROP POLICY IF EXISTS "matches public update" ON public.matches;
DROP POLICY IF EXISTS "matches public delete" ON public.matches;

CREATE POLICY "matches public read"   ON public.matches FOR SELECT USING (true);
CREATE POLICY "matches public insert" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "matches public update" ON public.matches FOR UPDATE USING (true);
CREATE POLICY "matches public delete" ON public.matches FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

------------------------------------------------------------
-- 2. training_sessions: 練習場次
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.training_sessions (
  id text PRIMARY KEY,
  member_id text NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  date date NOT NULL,
  location text,
  duration_min integer,
  theme_tags text[],
  note text,
  recorded_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS training_sessions_member_date_idx
  ON public.training_sessions (member_id, date DESC);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ts public read"   ON public.training_sessions;
DROP POLICY IF EXISTS "ts public insert" ON public.training_sessions;
DROP POLICY IF EXISTS "ts public update" ON public.training_sessions;
DROP POLICY IF EXISTS "ts public delete" ON public.training_sessions;

CREATE POLICY "ts public read"   ON public.training_sessions FOR SELECT USING (true);
CREATE POLICY "ts public insert" ON public.training_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "ts public update" ON public.training_sessions FOR UPDATE USING (true);
CREATE POLICY "ts public delete" ON public.training_sessions FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.training_sessions;

------------------------------------------------------------
-- 3. training_items: 練習項目(一個 session 多個)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.training_items (
  id text PRIMARY KEY,
  session_id text NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  kind text NOT NULL,                          -- 'rope_double' | 'run' | 'lift' | 'shot' | 'free'
  label text,
  metrics jsonb,                               -- 依 kind 不同:{reps}, {distanceM, seconds}, {sets, reps, weightKg}, {attempts, hitRate}, {value, unit}
  note text
);

CREATE INDEX IF NOT EXISTS training_items_session_idx
  ON public.training_items (session_id, order_index);

ALTER TABLE public.training_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ti public read"   ON public.training_items;
DROP POLICY IF EXISTS "ti public insert" ON public.training_items;
DROP POLICY IF EXISTS "ti public update" ON public.training_items;
DROP POLICY IF EXISTS "ti public delete" ON public.training_items;

CREATE POLICY "ti public read"   ON public.training_items FOR SELECT USING (true);
CREATE POLICY "ti public insert" ON public.training_items FOR INSERT WITH CHECK (true);
CREATE POLICY "ti public update" ON public.training_items FOR UPDATE USING (true);
CREATE POLICY "ti public delete" ON public.training_items FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.training_items;

------------------------------------------------------------
-- 4. media: 照片 / 影片(polymorphic, 指向 match 或 training_session)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
  id text PRIMARY KEY,
  member_id text NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  owner_type text NOT NULL CHECK (owner_type IN ('match','training_session')),
  owner_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('photo','video')),
  storage_path text NOT NULL,                  -- e.g. 'sports-media/m1/video/uuid.mp4'
  thumbnail_path text,                         -- video 才有
  duration_ms integer,
  width integer,
  height integer,
  size_bytes integer,
  tags text[],
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_owner_idx
  ON public.media (owner_type, owner_id);
CREATE INDEX IF NOT EXISTS media_member_created_idx
  ON public.media (member_id, created_at DESC);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media public read"   ON public.media;
DROP POLICY IF EXISTS "media public insert" ON public.media;
DROP POLICY IF EXISTS "media public update" ON public.media;
DROP POLICY IF EXISTS "media public delete" ON public.media;

CREATE POLICY "media public read"   ON public.media FOR SELECT USING (true);
CREATE POLICY "media public insert" ON public.media FOR INSERT WITH CHECK (true);
CREATE POLICY "media public update" ON public.media FOR UPDATE USING (true);
CREATE POLICY "media public delete" ON public.media FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.media;

------------------------------------------------------------
-- 5. Storage bucket(階段 4-5 才會用到,可以先建)
------------------------------------------------------------
-- 在 Supabase Dashboard → Storage 手動建 bucket:
--   名稱: sports-media
--   Public: ON(配合無登入 + public RLS)
--   File size limit: 50 MB(影片壓縮後夠用)
--   Allowed MIME types: image/jpeg, image/png, image/webp, video/mp4, video/quicktime
-- 路徑慣例:
--   sports-media/{member_id}/photo/{uuid}.jpg
--   sports-media/{member_id}/video/{uuid}.mp4
--   sports-media/{member_id}/thumb/{uuid}.jpg
