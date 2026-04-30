// Quick: dump a couple of photo URLs to confirm migration worked
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

const loadEnv = () => {
  for (const file of ['.env.local', '.env']) {
    const envPath = path.resolve(file)
    if (!fs.existsSync(envPath)) continue
    const text = fs.readFileSync(envPath, 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
  }
}
loadEnv()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_KEY, {
  auth: { persistSession: false }
})

const { data } = await supabase
  .from('records')
  .select('id, member_id, date, photo')
  .not('photo', 'is', null)
  .order('date', { ascending: false })
  .limit(10)

for (const r of data) {
  const kind = r.photo.startsWith('data:') ? 'data-URL' :
               r.photo.startsWith('http') ? 'public-URL' : 'other'
  const preview = r.photo.startsWith('http') ? r.photo : r.photo.slice(0, 40)
  console.log(`  ${kind.padEnd(11)} ${r.date} ${preview}`)
}
