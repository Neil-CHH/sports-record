import { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { formatAge, formatDate } from '../../utils/age.js'

export default function GrowthCard({ record, member, onEdit, onDelete }) {
  const [showPhoto, setShowPhoto] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="relative pl-10">
      <div className="absolute left-2 top-6 w-4 h-4 rounded-full bg-growth ring-4 ring-cream shadow-sm" />

      <div className="glass rounded-ios p-5 animate-fadeIn">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-sm text-mute">{formatDate(record.date)}</div>
            <div className="text-xs text-mute/80 mt-0.5">{formatAge(member.birthday, record.date)}</div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(record)}
              className="p-1.5 rounded-full text-mute hover:text-growth hover:bg-white/70 transition"
              aria-label="編輯"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-full text-mute hover:text-growthDark hover:bg-white/70 transition"
              aria-label="刪除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight text-ink tabular-nums">
              {record.heightCm}
            </span>
            <span className="text-xl text-mute font-medium">cm</span>
          </div>
          {record.weightKg != null && (
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg text-mute font-semibold tabular-nums">{record.weightKg}</span>
              <span className="text-sm text-mute/80">kg</span>
            </div>
          )}
        </div>

        {record.note && (
          <p className="text-base text-ink/90 leading-relaxed whitespace-pre-wrap mb-3">
            {record.note}
          </p>
        )}

        {record.photo && (
          <button
            type="button"
            onClick={() => setShowPhoto(true)}
            className="block w-full overflow-hidden rounded-2xl active:opacity-80 transition"
          >
            <img src={record.photo} alt="紀錄照片" className="w-full max-h-72 object-cover" loading="lazy" />
          </button>
        )}
      </div>

      {showPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fadeIn"
          onClick={() => setShowPhoto(false)}
        >
          <button
            className="absolute top-5 right-5 p-3 rounded-full bg-white/15 backdrop-blur text-white safe-top"
            onClick={(e) => {
              e.stopPropagation()
              setShowPhoto(false)
            }}
            aria-label="關閉"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={record.photo} alt="紀錄照片" className="max-w-full max-h-full" />
        </div>
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-6 animate-fadeIn"
          onClick={() => setConfirmDelete(false)}
        >
          <div className="glass-strong rounded-iosLg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">刪除這筆紀錄？</h3>
            <p className="text-mute text-sm mb-5">{formatDate(record.date)} · {record.heightCm} cm</p>
            <div className="flex gap-3">
              <button className="ios-btn-ghost flex-1" onClick={() => setConfirmDelete(false)}>取消</button>
              <button
                className="ios-btn flex-1 bg-growthDark text-white"
                onClick={() => {
                  onDelete(record.id)
                  setConfirmDelete(false)
                }}
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
