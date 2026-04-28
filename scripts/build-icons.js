// Generate PWA icons from public/source-icon.png.
// Usage: node scripts/build-icons.js

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const SRC = resolve(root, 'public/source-icon.png')
const BG = { r: 30, g: 58, b: 95, alpha: 1 } // navy #1E3A5F

const TARGETS = [
  { out: 'public/apple-touch-icon.png', size: 180 },
  { out: 'public/icon-192.png', size: 192 },
  { out: 'public/icon-512.png', size: 512 }
]

if (!existsSync(SRC)) {
  console.error(`Source not found: ${SRC}`)
  process.exit(1)
}

const square = await sharp(SRC)
  .resize(1024, 1024, { fit: 'contain', background: BG })
  .png()
  .toBuffer()

await Promise.all(
  TARGETS.map(({ out, size }) =>
    sharp(square)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(resolve(root, out))
      .then(() => console.log(`✓ ${out} (${size}x${size})`))
  )
)
