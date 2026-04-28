import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { getPublicUrl } from '../utils/mediaUpload.js'

const VideoTile = ({ media }) => {
  const videoRef = useRef(null)
  const [showPoster, setShowPoster] = useState(true)
  const url = getPublicUrl(media.storagePath)
  const thumb = getPublicUrl(media.thumbnailPath)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            v.play().then(() => setShowPoster(false)).catch(() => {})
          } else {
            v.pause()
          }
        }
      },
      { threshold: [0, 0.6, 1] }
    )
    obs.observe(v)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="relative w-32 h-44 rounded-ios overflow-hidden shrink-0 bg-warm">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover"
        muted
        playsInline
        loop
        preload="metadata"
        poster={thumb || undefined}
      />
      {showPoster && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-ios">
            <Play className="w-4 h-4 text-ink ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}
      {media.durationMs != null && (
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-ink/70 text-white text-[10px] font-medium tabular-nums">
          {Math.round(media.durationMs / 1000)}s
        </div>
      )}
    </div>
  )
}

const PhotoTile = ({ media }) => {
  const url = getPublicUrl(media.storagePath)
  return (
    <div className="relative w-32 h-44 rounded-ios overflow-hidden shrink-0 bg-warm">
      {url ? (
        <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-mute text-xs">
          照片
        </div>
      )}
    </div>
  )
}

export default function MediaStrip({ media }) {
  if (!media || media.length === 0) return null
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
      {media.map((m) => (
        <div key={m.id} className="snap-center">
          {m.kind === 'video' ? <VideoTile media={m} /> : <PhotoTile media={m} />}
        </div>
      ))}
    </div>
  )
}
