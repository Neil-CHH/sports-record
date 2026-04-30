// One-shot migration: move inline data-URL photos from
// records / vision_records / dental_records into Supabase Storage,
// then UPDATE the row's photo column to the public URL.
//
// Usage:
//   node scripts/migrate-photos.js            # dry-run (count + size, no writes)
//   node scripts/migrate-photos.js --execute  # actually upload + UPDATE
//
// Reads VITE_SUPABASE_URL / VITE_SUPABASE_KEY from .env (or env vars).
// Storage path: sports-media/{member_id}/{domain}/{record_id}.jpg

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

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const BUCKET = 'sports-media'
const EXECUTE = process.argv.includes('--execute')

const TABLES = [
  { table: 'records', domain: 'growth' },
  { table: 'vision_records', domain: 'vision' },
  { table: 'dental_records', domain: 'dental' }
]

const isDataUrl = (s) => typeof s === 'string' && s.startsWith('data:')

const decodeDataUrl = (dataUrl) => {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!m) return null
  return {
    contentType: m[1],
    buffer: Buffer.from(m[2], 'base64')
  }
}

const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const migrate = async ({ table, domain }) => {
  console.log(`\n=== ${table} (${domain}) ===`)
  const { data, error } = await supabase
    .from(table)
    .select('id, member_id, photo')
  if (error) {
    console.error(`  ! select failed: ${error.message}`)
    return { table, total: 0, migrated: 0, skipped: 0, failed: 0, bytes: 0 }
  }

  const candidates = data.filter((r) => isDataUrl(r.photo))
  const totalBytes = candidates.reduce((acc, r) => {
    const decoded = decodeDataUrl(r.photo)
    return acc + (decoded?.buffer.length || 0)
  }, 0)

  console.log(`  rows total:        ${data.length}`)
  console.log(`  rows w/ data URL:  ${candidates.length}`)
  console.log(`  data URL bytes:    ${fmtSize(totalBytes)}`)

  if (!EXECUTE) {
    console.log(`  (dry-run, skipping uploads)`)
    return {
      table,
      total: data.length,
      candidates: candidates.length,
      migrated: 0,
      skipped: 0,
      failed: 0,
      bytes: totalBytes
    }
  }

  let migrated = 0
  let failed = 0
  for (const row of candidates) {
    const decoded = decodeDataUrl(row.photo)
    if (!decoded) {
      failed += 1
      console.log(`  ! ${row.id} bad data URL`)
      continue
    }
    const ext = decoded.contentType.includes('png') ? 'png'
              : decoded.contentType.includes('webp') ? 'webp'
              : 'jpg'
    const storagePath = `${row.member_id}/${domain}/${row.id}.${ext}`

    const up = await supabase.storage.from(BUCKET).upload(
      storagePath,
      decoded.buffer,
      {
        contentType: decoded.contentType,
        cacheControl: '3600',
        upsert: true
      }
    )
    if (up.error) {
      failed += 1
      console.log(`  ! ${row.id} upload failed: ${up.error.message}`)
      continue
    }

    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl

    const { error: updErr } = await supabase
      .from(table)
      .update({ photo: publicUrl })
      .eq('id', row.id)
    if (updErr) {
      failed += 1
      console.log(`  ! ${row.id} update failed: ${updErr.message}`)
      continue
    }

    migrated += 1
    process.stdout.write(`  · ${migrated}/${candidates.length} (${fmtSize(decoded.buffer.length)})\r`)
  }
  console.log(`\n  done — migrated ${migrated}, failed ${failed}`)
  return {
    table,
    total: data.length,
    candidates: candidates.length,
    migrated,
    failed,
    bytes: totalBytes
  }
}

const main = async () => {
  console.log(EXECUTE ? '*** EXECUTE MODE — writes will happen ***' : '*** DRY RUN — no writes ***')
  const results = []
  for (const t of TABLES) {
    results.push(await migrate(t))
  }
  console.log('\n=== summary ===')
  for (const r of results) {
    console.log(
      `  ${r.table.padEnd(16)} candidates=${r.candidates}  migrated=${r.migrated}  failed=${r.failed}  size=${fmtSize(r.bytes)}`
    )
  }
}

main().catch((e) => {
  console.error('migration crashed', e)
  process.exit(1)
})
