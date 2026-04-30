import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { todayISO } from '../../utils/age.js'
import PhotoInputInline from '../PhotoInputInline.jsx'

const RECORDER_OPTS = [
  { key: 'dad', label: '爸爸' },
  { key: 'mom', label: '媽媽' }
]

export default function GrowthForm({
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
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setDate(initial.date)
      setHeight(initial.heightCm == null ? '' : String(initial.heightCm))
      setWeight(initial.weightKg == null ? '' : String(initial.weightKg))
      setNote(initial.note || '')
      setPhoto(initial.photo || null)
    } else {
      setDate(todayISO())
      setHeight('')
      setWeight('')
      setNote('')
      setPhoto(null)
    }
    setError('')
    setSubmitting(false)
  }, [open, initial])

  if (!open) return null

  const submit = async () => {
    if (submitting) return
    const h = parseFloat(height)
    if (!h || h < 20 || h > 250) {
      setError('請輸入有效身高 (20–250 cm)')
      return
    }
    if (!date) {
      setError('請選擇日期')
      return
    }
    let weightKg = null
    if (weight !== '' && weight != null) {
      const w = parseFloat(weight)
      if (!w || w < 1 || w > 200) {
        setError('請輸入有效體重 (1–200 kg)')
        return
      }
      weightKg = Math.round(w * 10) / 10
    }
    setSubmitting(true)
    try {
      const payload = {
        date,
        heightCm: Math.round(h * 10) / 10,
        weightKg,
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
            {isEdit ? '編輯身高' : '新增身高'} · {member.name}
          </h2>
          <button
            onClick={submit}
            disabled={submitting}
            className={`p-2 -m-2 font-semibold ${submitting ? 'text-mute opacity-50' : 'text-growth'}`}
            aria-label="儲存"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-growth/10 text-growthDark border border-growth/30 rounded-ios px-4 py-2.5 text-sm animate-fadeIn">
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

          <label className="block">
            <span className="block text-sm text-mute mb-1.5 px-1">日期</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="ios-field"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-mute mb-1.5 px-1">身高 (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="例如 108.5"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="ios-field text-2xl font-semibold tabular-nums"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-mute mb-1.5 px-1">體重 (kg, 選填)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="例如 18.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="ios-field text-2xl font-semibold tabular-nums"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-mute mb-1.5 px-1">感想 (選填)</span>
            <textarea
              rows={3}
              placeholder="今天的小小觀察..."
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
