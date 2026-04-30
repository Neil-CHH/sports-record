import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { todayISO } from '../../utils/age.js'
import { DENTAL_TYPES } from '../../utils/dental.js'
import PhotoInputInline from '../PhotoInputInline.jsx'

const RECORDER_OPTS = [
  { key: 'dad', label: '爸爸' },
  { key: 'mom', label: '媽媽' }
]

export default function DentalForm({
  open,
  member,
  recorder,
  initial,
  onRecorderChange,
  onClose,
  onSave,
  onUpdate
}) {
  const isEdit = Boolean(initial)
  const [date, setDate] = useState(todayISO())
  const [types, setTypes] = useState(['exam'])
  const [cavityCount, setCavityCount] = useState('')
  const [toothArea, setToothArea] = useState('')
  const [nextVisit, setNextVisit] = useState('')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setDate(initial.date)
      setTypes(Array.isArray(initial.types) && initial.types.length ? initial.types : ['exam'])
      setCavityCount(initial.cavityCount == null ? '' : String(initial.cavityCount))
      setToothArea(initial.toothArea || '')
      setNextVisit(initial.nextVisit || '')
      setNote(initial.note || '')
      setPhoto(initial.photo || null)
    } else {
      setDate(todayISO())
      setTypes(['exam'])
      setCavityCount('')
      setToothArea('')
      setNextVisit('')
      setNote('')
      setPhoto(null)
    }
    setError('')
    setSubmitting(false)
  }, [open, initial])

  if (!open) return null

  const toggleType = (key) => {
    setTypes((prev) => (prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]))
  }

  const submit = async () => {
    if (submitting) return
    if (!date) { setError('請選擇日期'); return }
    if (types.length === 0) { setError('至少選一個類型'); return }
    setSubmitting(true)
    try {
      const payload = {
        date,
        types,
        cavityCount: cavityCount === '' ? null : Number(cavityCount),
        toothArea: toothArea.trim(),
        nextVisit: nextVisit || null,
        note: note.trim(),
        photo,
        recordedBy: recorder || initial?.recordedBy || null
      }
      if (isEdit) await onUpdate(initial.id, payload)
      else await onSave(member.id, payload)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-cream rounded-t-iosLg shadow-iosLg animate-slideUp safe-bottom max-h-[92vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-warm" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-warm/40">
          <button onClick={onClose} className="p-2 -m-2 text-mute hover:text-ink" aria-label="關閉">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold">
            {isEdit ? '編輯牙齒' : '新增牙齒'} · {member.name}
          </h2>
          <button
            onClick={submit}
            disabled={submitting}
            className={`p-2 -m-2 font-semibold ${submitting ? 'text-mute opacity-50' : 'text-dentalDark'}`}
            aria-label="儲存"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-dental/15 text-dentalDark border border-dental/30 rounded-ios px-4 py-2.5 text-sm animate-fadeIn">
              {error}
            </div>
          )}

          <div>
            <span className="block text-sm text-mute mb-1.5 px-1">這筆由誰紀錄</span>
            <div className="flex gap-1 p-1 bg-warm/50 rounded-ios">
              {RECORDER_OPTS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => onRecorderChange?.(r.key)}
                  className={`flex-1 py-2 rounded-[0.85rem] text-sm font-medium transition ${
                    recorder === r.key ? 'bg-white text-ink shadow-sm' : 'text-mute'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm text-mute mb-1.5 px-1">日期</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ios-field py-2.5"
              />
            </label>
            <label className="block">
              <span className="block text-sm text-mute mb-1.5 px-1">下次回診 (選填)</span>
              <input
                type="date"
                value={nextVisit}
                onChange={(e) => setNextVisit(e.target.value)}
                className="ios-field py-2.5"
              />
            </label>
          </div>

          <div>
            <span className="block text-sm text-mute mb-1.5 px-1">類型 (可多選)</span>
            <div className="flex flex-wrap gap-2">
              {DENTAL_TYPES.map((t) => {
                const active = types.includes(t.key)
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => toggleType(t.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      active
                        ? 'bg-dental text-white'
                        : 'bg-warm/60 text-mute'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <label className="block">
            <span className="block text-sm text-mute mb-1.5 px-1">蛀牙顆數 (選填)</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="0"
              value={cavityCount}
              onChange={(e) => setCavityCount(e.target.value)}
              className="ios-field text-xl font-semibold tabular-nums"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-mute mb-1.5 px-1">部位 (選填)</span>
            <input
              type="text"
              placeholder="例如：右上乳臼齒、前排門牙"
              value={toothArea}
              onChange={(e) => setToothArea(e.target.value)}
              className="ios-field py-2.5"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-mute mb-1.5 px-1">備註 (選填)</span>
            <textarea
              rows={2}
              placeholder="醫師建議、治療過程..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="ios-field resize-none"
            />
          </label>

          <div>
            <span className="block text-sm text-mute mb-1.5 px-1">照片 (選填)</span>
            <PhotoInputInline value={photo} onChange={setPhoto} onError={setError} />
          </div>
        </div>
      </div>
    </div>
  )
}
