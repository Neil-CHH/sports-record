import { useEffect, useRef, useState } from 'react'
import { Check, X, Play } from 'lucide-react'
import {
  trimVideoFile,
  isTrimSupported,
  MAX_VIDEO_SEC
} from '../utils/mediaUpload.js'

const fmt = (s) => `${s.toFixed(1)}s`

export default function VideoTrimModal({ open, file, durationMs, onConfirm, onCancel }) {
  const totalSec = (durationMs || 0) / 1000
  const supported = isTrimSupported()
  const videoRef = useRef(null)
  const playStopRef = useRef(null)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(Math.min(MAX_VIDEO_SEC, totalSec))
  const [trimming, setTrimming] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !file) return
    const url = URL.createObjectURL(file)
    setStart(0)
    setEnd(Math.min(MAX_VIDEO_SEC, totalSec))
    setError('')
    setProgress(0)
    setTrimming(false)
    if (videoRef.current) {
      videoRef.current.src = url
      videoRef.current.currentTime = 0
    }
    return () => {
      if (playStopRef.current) {
        playStopRef.current()
        playStopRef.current = null
      }
      URL.revokeObjectURL(url)
    }
  }, [open, file, totalSec])

  if (!open) return null

  const windowSec = Math.max(0, end - start)
  const overLimit = windowSec > MAX_VIDEO_SEC + 0.05
  const tooShort = windowSec < 0.5

  const seekTo = (t) => {
    const v = videoRef.current
    if (!v) return
    try { v.currentTime = t } catch { /* ignore */ }
  }

  const onStartChange = (e) => {
    let v = Number(e.target.value)
    if (v >= end - 0.5) v = Math.max(0, end - 0.5)
    if (end - v > MAX_VIDEO_SEC) setEnd(Math.min(totalSec, v + MAX_VIDEO_SEC))
    setStart(v)
    seekTo(v)
  }
  const onEndChange = (e) => {
    let v = Number(e.target.value)
    if (v <= start + 0.5) v = Math.min(totalSec, start + 0.5)
    if (v - start > MAX_VIDEO_SEC) setStart(Math.max(0, v - MAX_VIDEO_SEC))
    setEnd(v)
    seekTo(v)
  }

  const playPreview = () => {
    const v = videoRef.current
    if (!v) return
    if (playStopRef.current) playStopRef.current()
    v.currentTime = start
    const stop = () => {
      v.pause()
      v.removeEventListener('timeupdate', onTick)
      playStopRef.current = null
    }
    const onTick = () => {
      if (v.currentTime >= end) stop()
    }
    v.addEventListener('timeupdate', onTick)
    playStopRef.current = stop
    v.play().catch(() => {})
  }

  const confirm = async () => {
    if (trimming || overLimit || tooShort) return
    setTrimming(true)
    setProgress(0)
    setError('')
    try {
      const blob = await trimVideoFile(file, start, end, (p) => setProgress(p))
      await onConfirm(blob, {
        durationMs: Math.round(windowSec * 1000)
      })
    } catch (err) {
      setError(err.message || '裁剪失敗')
    } finally {
      setTrimming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fadeIn">
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={trimming ? undefined : onCancel}
      />
      <div className="relative w-full max-w-md bg-cream rounded-t-iosLg shadow-iosLg animate-slideUp safe-bottom max-h-[92vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-warm" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-warm/40">
          <button
            onClick={onCancel}
            disabled={trimming}
            className="p-2 -m-2 text-mute hover:text-ink disabled:opacity-50"
            aria-label="取消"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold">裁剪影片</h2>
          <button
            onClick={confirm}
            disabled={trimming || overLimit || tooShort || !supported}
            className={`p-2 -m-2 font-semibold ${
              !trimming && !overLimit && !tooShort && supported
                ? 'text-coral'
                : 'text-mute opacity-50'
            }`}
            aria-label="確認"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <video
            ref={videoRef}
            className="w-full aspect-video bg-ink rounded-ios"
            playsInline
            muted
            preload="auto"
          />

          <div className="text-center text-sm">
            選了 <span className="font-bold tabular-nums text-coral">{windowSec.toFixed(1)}</span>{' '}
            秒 <span className="text-mute">/ 上限 {MAX_VIDEO_SEC} 秒</span>
            {overLimit && <span className="text-coralDark"> · 超過上限</span>}
            {tooShort && <span className="text-coralDark"> · 太短</span>}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] text-mute mb-1 px-1">
                <span>起點</span>
                <span className="tabular-nums">{fmt(start)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={totalSec || 0}
                step="0.1"
                value={start}
                onChange={onStartChange}
                disabled={trimming}
                className="w-full accent-coral"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-mute mb-1 px-1">
                <span>終點</span>
                <span className="tabular-nums">{fmt(end)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={totalSec || 0}
                step="0.1"
                value={end}
                onChange={onEndChange}
                disabled={trimming}
                className="w-full accent-coral"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={playPreview}
            disabled={trimming}
            className="ios-btn-ghost w-full flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            預覽選取片段
          </button>

          {trimming && (
            <div className="space-y-2">
              <div className="text-xs text-mute text-center">
                正在錄製… {Math.round(progress * 100)}%
              </div>
              <div className="h-1.5 rounded-full bg-warm overflow-hidden">
                <div
                  className="h-full bg-coral transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-mute text-center">
                需要與選取片段相同的時間(約 {windowSec.toFixed(0)} 秒),請別關掉視窗
              </div>
            </div>
          )}

          {error && <p className="text-xs text-coralDark text-center">{error}</p>}

          {!supported && (
            <p className="text-xs text-coralDark text-center">
              此瀏覽器不支援裁剪,請改用外部 app 先裁好再上傳
            </p>
          )}

          <p className="text-xs text-mute leading-relaxed">
            裁剪是即時錄製這段選取的內容(會壓縮到 ~720p / 2.5 Mbps),畫質會略低於原檔。
          </p>
        </div>
      </div>
    </div>
  )
}
