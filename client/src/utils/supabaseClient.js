import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const FALLBACK_SUPABASE_URL = 'https://elnixrgjmmxosshtuqha.supabase.co'
const FALLBACK_SUPABASE_ANON =
  'sb_publishable_ZC0q829pvqh_Z2oWtnLtqg_W4d68nAM'

// Prevent white screen when env vars are missing in deployed GitHub Pages build.
// We keep app booting and show actionable errors on API actions instead.
export const safeUrl = supabaseUrl || FALLBACK_SUPABASE_URL
export const safeAnon = supabaseAnonKey || FALLBACK_SUPABASE_ANON

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabase] Missing env: using built-in project fallback for elnixrgjmmxosshtuqha.'
  )
}

export const supabase = createClient(safeUrl, safeAnon)

