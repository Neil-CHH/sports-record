import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { compressImage } from '../utils/imageCompress.js'

// 給健康 domain 用 — 照片直接 inline data URL 存進 DB row,跟 Height tracker 既有資料相容。
// 跟 MediaPicker(走 Supabase Storage)是兩套機制,等階段 7 才會考慮統一遷到 Storage。
export default function PhotoInputInline({ value, onChange, onError }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await compressImage(file)
      onChange(dataUrl)
    } catch (err) {
      onError?.(err.message || '照片處理失敗')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      {value ? (
        <div className="relative rounded-ios overflow-hidden">
          <img src={value} alt="預覽" className="w-full max-h-64 object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-3 right-3 p-2 rounded-full bg-ink/70 text-white backdrop-blur"
            aria-label="移除照片"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full border-2 border-dashed border-warm rounded-ios py-8 flex flex-col items-center gap-2 text-mute hover:border-coral hover:text-coral transition disabled:opacity-50"
        >
          <Camera className="w-7 h-7" strokeWidth={1.6} />
          <span className="text-sm">{busy ? '處理中…' : '加入照片'}</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={pick}
        className="hidden"
      />
    </>
  )
}
