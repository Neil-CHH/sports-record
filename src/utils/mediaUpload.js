import { supabase } from '../lib/supabase.js'

const BUCKET = 'sports-media'
export const MAX_VIDEO_SEC = 30
export const MAX_VIDEO_MS = MAX_VIDEO_SEC * 1000 + 500
const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const PHOTO_MAX_DIM = 1280
const PHOTO_QUALITY = 0.85

const uuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })

const compressImage = async (file) => {
  const img = await loadImage(file)
  const scale = Math.min(1, PHOTO_MAX_DIM / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)
  const blob = await new Promise((res) =>
    canvas.toBlob(res, 'image/jpeg', PHOTO_QUALITY)
  )
  return { blob, width: w, height: h }
}

export const uploadPhoto = async (file, memberId) => {
  const { blob, width, height } = await compressImage(file)
  const path = `${memberId}/photo/${uuid()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false
  })
  if (error) {
    if (error.message?.includes('Bucket not found') || error.statusCode === '404') {
      throw new Error('尚未建立 sports-media bucket')
    }
    throw new Error(error.message || '上傳失敗')
  }
  return {
    kind: 'photo',
    storagePath: path,
    width,
    height,
    sizeBytes: blob.size
  }
}

export const probeVideoFile = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.muted = true
    v.playsInline = true
    v.onloadedmetadata = () => {
      const meta = {
        durationMs: Math.round((v.duration || 0) * 1000),
        width: v.videoWidth || null,
        height: v.videoHeight || null
      }
      URL.revokeObjectURL(url)
      resolve(meta)
    }
    v.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('無法讀取影片資訊'))
    }
    v.src = url
  })

const captureThumbFromBlob = (source) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source)
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.muted = true
    v.playsInline = true
    v.crossOrigin = 'anonymous'
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(0.5, (v.duration || 1) * 0.1)
    }
    v.onseeked = async () => {
      try {
        const w = v.videoWidth
        const h = v.videoHeight
        const scale = Math.min(1, PHOTO_MAX_DIM / Math.max(w, h))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(w * scale)
        canvas.height = Math.round(h * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.8))
        resolve(blob)
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }
    v.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('無法擷取縮圖'))
    }
    v.src = url
  })

export const isTrimSupported = () => {
  if (typeof MediaRecorder === 'undefined') return false
  if (typeof HTMLVideoElement === 'undefined') return false
  const proto = HTMLVideoElement.prototype
  return Boolean(proto.captureStream || proto.mozCaptureStream)
}

export const trimVideoFile = (file, startSec, endSec, onProgress) =>
  new Promise((resolve, reject) => {
    if (!isTrimSupported()) {
      reject(new Error('此瀏覽器不支援裁剪,請改用外部 app 裁好再上傳'))
      return
    }
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.src = url
    video.preload = 'auto'
    video.playsInline = true
    video.muted = true

    let recorder = null
    let stopTimer = null
    let rafId = null
    let settled = false

    const cleanup = () => {
      URL.revokeObjectURL(url)
      if (stopTimer) clearTimeout(stopTimer)
      if (rafId) cancelAnimationFrame(rafId)
    }
    const fail = (err) => {
      if (settled) return
      settled = true
      cleanup()
      reject(err instanceof Error ? err : new Error(String(err)))
    }
    const succeed = (blob) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(blob)
    }

    video.onloadedmetadata = () => {
      const target = Math.max(0, Math.min(startSec, (video.duration || 0) - 0.05))
      try {
        video.currentTime = target
      } catch (err) {
        fail(err)
      }
    }

    video.onseeked = async () => {
      video.onseeked = null
      try {
        const stream = video.captureStream
          ? video.captureStream()
          : video.mozCaptureStream()
        if (!stream || !stream.getVideoTracks().length) {
          throw new Error('此瀏覽器擷取影片串流失敗')
        }
        const candidates = [
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm'
        ]
        const mime = candidates.find((t) => MediaRecorder.isTypeSupported(t)) || 'video/webm'
        recorder = new MediaRecorder(stream, {
          mimeType: mime,
          videoBitsPerSecond: 1_500_000
        })
        const chunks = []
        recorder.ondataavailable = (e) => {
          if (e.data?.size) chunks.push(e.data)
        }
        recorder.onstop = () => succeed(new Blob(chunks, { type: mime }))
        recorder.onerror = (e) => fail(e.error || new Error('裁剪失敗'))

        recorder.start(100)
        await video.play()

        const lengthMs = (endSec - startSec) * 1000
        const startedAt = performance.now()
        const tick = () => {
          if (settled) return
          const elapsed = performance.now() - startedAt
          if (onProgress) onProgress(Math.min(1, elapsed / lengthMs))
          if (elapsed >= lengthMs) {
            if (recorder.state !== 'inactive') recorder.stop()
            video.pause()
            return
          }
          rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)

        stopTimer = setTimeout(() => {
          if (recorder.state !== 'inactive') recorder.stop()
          video.pause()
        }, lengthMs + 500)
      } catch (err) {
        fail(err)
      }
    }

    video.onerror = () => fail(new Error('影片無法載入'))
  })

export const uploadVideoBlob = async (blob, memberId, meta = {}) => {
  if (blob.size > MAX_VIDEO_SIZE) {
    throw new Error(`影片過大(>${Math.round(MAX_VIDEO_SIZE / 1024 / 1024)}MB)`)
  }

  let thumbBlob = null
  try {
    thumbBlob = await captureThumbFromBlob(blob)
  } catch {
    /* 縮圖失敗不擋上傳 */
  }

  const id = uuid()
  const isMP4 = (blob.type || '').includes('mp4') || meta.preferExt === 'mp4'
  const ext = isMP4 ? 'mp4' : 'webm'
  const path = `${memberId}/video/${id}.${ext}`
  const thumbPath = thumbBlob ? `${memberId}/thumb/${id}.jpg` : null

  const up = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || (isMP4 ? 'video/mp4' : 'video/webm'),
    cacheControl: '3600',
    upsert: false
  })
  if (up.error) {
    if (up.error.message?.includes('Bucket not found')) {
      throw new Error('尚未建立 sports-media bucket')
    }
    throw new Error(up.error.message || '影片上傳失敗')
  }

  if (thumbBlob && thumbPath) {
    await supabase.storage.from(BUCKET).upload(thumbPath, thumbBlob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    })
  }

  return {
    kind: 'video',
    storagePath: path,
    thumbnailPath: thumbPath,
    durationMs: meta.durationMs ?? null,
    width: meta.width ?? null,
    height: meta.height ?? null,
    sizeBytes: blob.size
  }
}

export const removeFromStorage = async (path) => {
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

export const removeFromStorageBatch = async (paths) => {
  const list = (paths || []).filter(Boolean)
  if (!list.length) return
  await supabase.storage.from(BUCKET).remove(list)
}

const listAllStorageRecursive = async (prefix = '') => {
  const all = []
  let offset = 0
  const PAGE = 100
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: PAGE,
      offset,
      sortBy: { column: 'name', order: 'asc' }
    })
    if (error) throw error
    if (!data || !data.length) break
    for (const item of data) {
      if (item.name === '.emptyFolderPlaceholder') continue
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name
      const isFile = item.id != null && item.metadata != null
      if (isFile) {
        all.push({ path: fullPath, size: item.metadata?.size || 0 })
      } else {
        const sub = await listAllStorageRecursive(fullPath)
        all.push(...sub)
      }
    }
    if (data.length < PAGE) break
    offset += PAGE
  }
  return all
}

// Returns { orphans: [{path, size}], totalOrphanBytes, totalAllFiles }
export const findStorageOrphans = async (mediaRows) => {
  const known = new Set()
  for (const m of mediaRows || []) {
    if (m.storagePath) known.add(m.storagePath)
    if (m.thumbnailPath) known.add(m.thumbnailPath)
  }
  const all = await listAllStorageRecursive('')
  const orphans = all.filter((f) => !known.has(f.path) && !f.path.startsWith('_probe/'))
  const totalOrphanBytes = orphans.reduce((a, f) => a + (f.size || 0), 0)
  return { orphans, totalOrphanBytes, totalAllFiles: all.length }
}

export const getPublicUrl = (path) => {
  if (!path) return null
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
