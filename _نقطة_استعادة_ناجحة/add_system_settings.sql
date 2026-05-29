-- ============================================
-- 3. إنشاء جدول إعدادات النظام
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  id text PRIMARY KEY DEFAULT 'global',
  close_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- إدراج القيمة الافتراضية
INSERT INTO public.system_settings (id, close_at) 
VALUES ('global', NULL) 
ON CONFLICT (id) DO NOTHING;

-- تفعيل RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
DROP POLICY IF EXISTS "system_settings_read_all" ON public.system_settings;
CREATE POLICY "system_settings_read_all" ON public.system_settings FOR SELECT USING (true);

-- السماح للمسؤول بالتحكم الكامل (عبر Edge Function)
DROP POLICY IF EXISTS "system_settings_admin_all" ON public.system_settings;
CREATE POLICY "system_settings_admin_all" ON public.system_settings FOR ALL USING (true);
