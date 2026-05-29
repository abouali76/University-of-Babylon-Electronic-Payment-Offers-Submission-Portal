-- ============================================
-- 1. إضافة عمود is_locked لجدول users
-- ============================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

-- ============================================
-- 2. إنشاء جدول الإعلانات
-- ============================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow all to read active announcements
DROP POLICY IF EXISTS "announcements_read_all" ON public.announcements;
CREATE POLICY "announcements_read_all" ON public.announcements FOR SELECT USING (true);

-- Allow admin to manage announcements (via service role in edge function)
DROP POLICY IF EXISTS "announcements_admin_write" ON public.announcements;
CREATE POLICY "announcements_admin_write" ON public.announcements FOR ALL USING (true);
