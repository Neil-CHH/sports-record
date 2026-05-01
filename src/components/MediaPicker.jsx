import { useRef, useState } from 'react'
import { Camera, Video, X, Play } from 'lucide-react'
import {
  uploadPhoto,
  uploadVideoBlob,
  probeVideoFile,
  trimVideoFile,
  isTrimSupported,
  getPublicUrl,
  MAX_VIDEO_MS
} from '../utils/mediaUpload.js'
import VideoTrimModal from './VideoTrimModal.jsx'

const Thumb = ({ media, onRemove }) => {
  const url = getPublicUrl(media.thumbnailPath || media.storagePath)
  return (
    <div className="relative w-20 h-20 rounded-ios overflow-hidden shrink-0 bg-warm">
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-mute text-xs">
          {media.kind === 'video' ? '影片' : '照片'}
        </div>
      )}
      {media.kind === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
          <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-ink ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}
      {media.kind === 'video' && media.durationMs != null && (
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-ink/70 text-white text-[10px] font-medium tabular-nums">
          {Math.round(media.durationMs / 1000)}s
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink/80 text-white flex items-center justify-center"
        aria-label="移除"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

export default function MediaPicker({ member, attached, onAdd, onRemove }) {
  const photoRef = useRef(null)
  const videoRef = useRef(null)
  const [busy, setBusy] = useState(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [trimSource, setTrimSource] = useState(null) // { file, durationMs }

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy('photo')
    setError('')
    try {
      const meta = await uploadPhoto(file, member.id)
      onAdd(meta)
    } catch (err) {
      setError(err.message || '照片上傳失敗')
    } finally {
      setBusy(null)
      if (photoRef.current) photoRef.current.value = ''
    }
  }

  const pickVideo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy('video')
    setError('')
    try {
      const meta = await probeVideoFile(file)
      if (meta.durationMs > MAX_VIDEO_MS) {
        setTrimSource({ file, durationMs: meta.durationMs })
        setBusy(null)
        return
      }
      // ≤30 秒也用 MediaRecorder 重錄壓縮成 720p / 1.5Mbps,避免 iPhone 4K 原檔吃掉雲端空間
      const durationSec = meta.durationMs / 1000
      setProgress(0)
      const blob = isTrimSupported()
        ? await trimVideoFile(file, 0, durationSec, (p) => setProgress(p))
        : file
      setBusy('upload')
      const result = await uploadVideoBlob(blob, member.id, {
        ...meta,
        durationMs: meta.durationMs
      })
      onAdd(result)
    } catch (err) {
      setError(err.message || '影片上傳失敗')
    } finally {
      if (videoRef.current) videoRef.current.value = ''
      setBusy(null)
      setProgress(0)
    }
  }

  const handleTrimConfirm = async (blob, meta) => {
    setBusy('video')
    setError('')
    try {
      const result = await uploadVideoBlob(blob, member.id, meta)
      onAdd(result)
      setTrimSource(null)
    } catch (err) {
      setError(err.message || '影片上傳失敗')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          disabled={!!busy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-ios bg-white/70 border border-warm text-sm disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          {busy === 'photo' ? '上傳中…' : '加照片'}
        </button>
        <button
          type="button"
          onClick={() => videoRef.current?.click()}
          disabled={!!busy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-ios bg-white/70 border border-warm text-sm disabled:opacity-50"
        >
          <Video className="w-4 h-4" />
          {busy === 'video'
            ? `壓縮中 ${Math.round(progress * 100)}%`
            : busy === 'upload'
              ? '上傳中…'
              : '加影片(<30秒)'}
        </button>
      </div>
      {busy === 'video' && (
        <div className="mt-2 h-1.5 rounded-full bg-warm overflow-hidden">
          <div
            className="h-full bg-coral transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        onChange={pickPhoto}
        className="hidden"
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        onChange={pickVideo}
        className="hidden"
      />

      {error && <p className="text-xs text-coralDark mt-2 px-1 leading-relaxed">{error}</p>}

      {attached.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
          {attached.map((m, i) => (
            <Thumb key={m.id || i} media={m} onRemove={() => onRemove(i)} />
          ))}
        </div>
      )}

      <VideoTrimModal
        open={!!trimSource}
        file={trimSource?.file}
        durationMs={trimSource?.durationMs}
        onCancel={() => setTrimSource(null)}
        onConfirm={handleTrimConfirm}
      />
    </div>
  )
}
