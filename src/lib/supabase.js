import { createClient } from '@supabase/supabase-js'

const url =
  import.meta.env.VITE_SUPABASE_URL || 'https://jfyqzmiudxslxpdhwhps.supabase.co'
const key =
  import.meta.env.VITE_SUPABASE_KEY ||
  'sb_publishable_2hgk563kSTVsxiSWGODAXg_4FFi-V3d'

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 5 } }
})
