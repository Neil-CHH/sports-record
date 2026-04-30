import { useState } from 'react'
import { CalendarClock, Pencil, Trash2, X } from 'lucide-react'
import { formatAge, formatDate } from '../../utils/age.js'
import { dentalTypeLabel } from '../../utils/dental.js'

export default function DentalCard({ record, member, onEdit, onDelete }) {
  const [showPhoto, setShowPhoto] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const accent = member.color === 'sky' ? 'bg-sky' : 'bg-dental'
  const recorderLabel =
    record.recordedBy === 'dad' ? '由爸爸紀錄' : record.recordedBy === 'mom' ? '由媽媽紀錄' : null
  const types = Array.isArray(record.types) ? record.types : []

  return (
    <div className="relative pl-10">
      <div className={`absolute left-2 top-6 w-4 h-4 rounded-full ${accent} ring-4 ring-cream shadow-sm`} />

      <div className="glass rounded-ios p-5 animate-fadeIn">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-sm text-mute">{formatDate(record.date)}</div>
            <div className="text-xs text-mute/80 mt-0.5">
              {formatAge(member.birthday, record.date)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {recorderLabel && (
              <span className="text-[11px] text-mute/80 bg-warm/60 rounded-full px-2 py-0.5 mr-1">
                {recorderLabel}
              </span>
            )}
            <button
              type="button"
              onClick={() => onEdit(record)}
              className="p-1.5 rounded-full text-mute hover:text-dental hover:bg-white/70 transition"
              aria-label="編輯"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-full text-mute hover:text-dentalDark hover:bg-white/70 transition"
              aria-label="刪除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {types.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {types.map((t) => (
              <span
                key={t}
                className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-dental/15 text-dentalDark font-medium"
              >
                {dentalTypeLabel(t)}
              </span>
            ))}
          </div>
        )}

        {record.cavityCount != null && record.cavityCount > 0 && (
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-ink tabular-nums">
                {record.cavityCount}
              </span>
              <span className="text-base text-mute font-medium">顆蛀牙</span>
            </div>
          </div>
        )}

        {record.toothArea && (
          <div className="text-sm text-ink/90 mb-2">
            <span className="text-mute">部位：</span>{record.toothArea}
          </div>
        )}

        {record.nextVisit && (
          <div className="flex items-center gap-1.5 text-xs text-dentalDark bg-dental/15 rounded-ios px-3 py-1.5 mb-3">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>下次回診 {formatDate(record.nextVisit)}</span>
          </div>
        )}

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
            <img
              src={record.photo}
              alt="紀錄照片"
              className="w-full max-h-72 object-cover"
              loading="lazy"
            />
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
          <div
            className="glass-strong rounded-iosLg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">刪除這筆紀錄？</h3>
            <p className="text-mute text-sm mb-5">{formatDate(record.date)}</p>
            <div className="flex gap-3">
              <button className="ios-btn-ghost flex-1" onClick={() => setConfirmDelete(false)}>
                取消
              </button>
              <button
                className="ios-btn flex-1 bg-dentalDark text-white"
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
