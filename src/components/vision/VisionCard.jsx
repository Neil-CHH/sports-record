import { useState } from 'react'
import { CalendarClock, Glasses, Pencil, Trash2, X } from 'lucide-react'
import { formatAge, formatDate } from '../../utils/age.js'
import { checkTypeLabel, formatAcuity, formatCyl, formatSph } from '../../utils/vision.js'

const EyeRow = ({ label, acuity, acuityCorrected, sph, cyl }) => {
  const sphStr = formatSph(sph)
  const cylStr = formatCyl(cyl)
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-mute w-8">{label}</span>
      <span className="text-2xl font-bold tabular-nums text-ink">
        {formatAcuity(acuity)}
      </span>
      {acuityCorrected && (
        <span className="text-sm text-mute/80 tabular-nums">
          (戴鏡 {formatAcuity(acuityCorrected)})
        </span>
      )}
      {(sphStr || cylStr) && (
        <span className="text-xs text-mute/80 ml-auto">
          {[sphStr, cylStr].filter(Boolean).join(' · ')}
        </span>
      )}
    </div>
  )
}

export default function VisionCard({ record, member, onEdit, onDelete }) {
  const [showPhoto, setShowPhoto] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const recorderLabel =
    record.recordedBy === 'dad' ? '由爸爸紀錄' : record.recordedBy === 'mom' ? '由媽媽紀錄' : null
  const checkLabel = checkTypeLabel(record.checkType)

  return (
    <div className="relative pl-10">
      <div className="absolute left-2 top-6 w-4 h-4 rounded-full bg-sky ring-4 ring-cream shadow-sm" />

      <div className="glass rounded-ios p-5 animate-fadeIn">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-sm text-mute">{formatDate(record.date)}</div>
            <div className="text-xs text-mute/80 mt-0.5 flex items-center gap-1.5">
              <span>{formatAge(member.birthday, record.date)}</span>
              {checkLabel && <span className="text-mute/60">· {checkLabel}</span>}
              {record.wearsGlasses && (
                <span className="inline-flex items-center gap-0.5 text-mute/70">
                  · <Glasses className="w-3 h-3" />
                </span>
              )}
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
              className="p-1.5 rounded-full text-mute hover:text-sky hover:bg-white/70 transition"
              aria-label="編輯"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-full text-mute hover:text-skyDark hover:bg-white/70 transition"
              aria-label="刪除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <EyeRow
            label="左眼"
            acuity={record.leftAcuity}
            acuityCorrected={record.leftAcuityCorrected}
            sph={record.leftSph}
            cyl={record.leftCyl}
          />
          <EyeRow
            label="右眼"
            acuity={record.rightAcuity}
            acuityCorrected={record.rightAcuityCorrected}
            sph={record.rightSph}
            cyl={record.rightCyl}
          />
        </div>

        {(record.leftAxialLength != null || record.rightAxialLength != null) && (
          <div className="text-xs text-mute mb-3 px-1">
            眼軸 左 {record.leftAxialLength ?? '—'} / 右 {record.rightAxialLength ?? '—'} mm
          </div>
        )}

        {record.nextVisit && (
          <div className="flex items-center gap-1.5 text-xs text-skyDark bg-sky/10 rounded-ios px-3 py-1.5 mb-3">
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
                className="ios-btn flex-1 bg-skyDark text-white"
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
