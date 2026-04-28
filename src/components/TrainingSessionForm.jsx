import { useEffect, useMemo, useState } from 'react'
import { Check, X, Plus, Trash2 } from 'lucide-react'
import { todayISO } from '../utils/age.js'
import { removeFromStorage } from '../utils/mediaUpload.js'
import MediaPicker from './MediaPicker.jsx'

const KINDS = [
  { value: 'rope_double', label: '二迴旋', emoji: '🪢' },
  { value: 'run', label: '跑步', emoji: '🏃' },
  { value: 'lift', label: '重訓', emoji: '🏋️' },
  { value: 'free', label: '自由', emoji: '✏️' }
]

const blankItem = (kind = 'rope_double') => ({ kind, label: '', metrics: {}, note: '' })

const NumField = ({ label, value, onChange, suffix, placeholder }) => (
  <label className="block">
    <span className="block text-[11px] text-mute mb-1 px-1">{label}</span>
    <div className="relative">
      <input
        className="ios-field py-2 text-base"
        type="number"
        inputMode="decimal"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        placeholder={placeholder}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-mute pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  </label>
)

const ItemEditor = ({ item, onChange, onRemove }) => {
  const setKind = (kind) => onChange({ ...blankItem(kind) })
  const setMetric = (key, val) => onChange({ ...item, metrics: { ...item.metrics, [key]: val } })

  return (
    <div className="glass rounded-ios p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              className={`px-3 py-1 rounded-full text-xs transition ${
                item.kind === k.value
                  ? 'bg-coral text-white font-semibold'
                  : 'bg-white/70 text-mute border border-warm'
              }`}
            >
              {k.emoji} {k.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 -m-2 text-mute hover:text-coralDark"
          aria-label="刪除項目"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {item.kind === 'rope_double' && (
        <div className="grid grid-cols-3 gap-3">
          <NumField label="組數" suffix="組" value={item.metrics.sets} onChange={(v) => setMetric('sets', v)} placeholder="3" />
          <NumField label="次數" suffix="次" value={item.metrics.reps} onChange={(v) => setMetric('reps', v)} placeholder="50" />
          <NumField label="限時(可空)" suffix="秒" value={item.metrics.seconds} onChange={(v) => setMetric('seconds', v)} placeholder="" />
        </div>
      )}

      {item.kind === 'run' && (
        <div className="grid grid-cols-2 gap-3">
          <NumField label="距離" suffix="m" value={item.metrics.distanceM} onChange={(v) => setMetric('distanceM', v)} placeholder="400" />
          <NumField label="秒數" suffix="秒" value={item.metrics.seconds} onChange={(v) => setMetric('seconds', v)} placeholder="75" />
        </div>
      )}

      {item.kind === 'lift' && (
        <>
          <input
            className="ios-field py-2 text-base"
            placeholder="動作名稱(深蹲、硬舉…)"
            value={item.label}
            onChange={(e) => onChange({ ...item, label: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <NumField label="組數" suffix="組" value={item.metrics.sets} onChange={(v) => setMetric('sets', v)} placeholder="3" />
            <NumField label="次數" suffix="次" value={item.metrics.reps} onChange={(v) => setMetric('reps', v)} placeholder="10" />
            <NumField label="重量" suffix="kg" value={item.metrics.weightKg} onChange={(v) => setMetric('weightKg', v)} placeholder="20" />
          </div>
        </>
      )}

      {item.kind === 'free' && (
        <textarea
          className="ios-field py-2 text-base resize-none"
          rows={3}
          placeholder="這項練習的內容、目標、感受…"
          value={item.label}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
        />
      )}

      {item.kind !== 'free' && (
        <input
          className="ios-field py-2 text-sm bg-white/50"
          placeholder="這項備註(可空)"
          value={item.note}
          onChange={(e) => onChange({ ...item, note: e.target.value })}
        />
      )}
    </div>
  )
}

export default function TrainingSessionForm({
  open,
  member,
  recorder,
  initial,
  initialItems,
  initialMedia,
  onClose,
  onSave,
  onUpdate,
  onAddMedia,
  onDeleteMedia
}) {
  const isEdit = Boolean(initial)
  const [date, setDate] = useState(() => todayISO())
  const [location, setLocation] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState([blankItem()])
  const [mediaList, setMediaList] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setDate(initial.date)
      setLocation(initial.location || '')
      setDurationMin(initial.durationMin == null ? '' : String(initial.durationMin))
      setNote(initial.note || '')
      setItems(
        (initialItems || []).length
          ? initialItems.map((it) => ({ ...it, metrics: { ...(it.metrics || {}) } }))
          : [blankItem()]
      )
      setMediaList([...(initialMedia || [])])
    } else {
      setDate(todayISO())
      setLocation('')
      setDurationMin('')
      setNote('')
      setItems([blankItem()])
      setMediaList([])
    }
    setSubmitting(false)
  }, [open, initial, initialItems, initialMedia])

  const valid = useMemo(() => Boolean(date) && items.length > 0, [date, items])

  if (!open) return null

  const updateItem = (idx, next) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? next : it)))
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const addItem = () => setItems((prev) => [...prev, blankItem()])

  const handleAddMedia = async (meta) => {
    if (isEdit && onAddMedia) {
      const created = await onAddMedia({
        memberId: member.id,
        ownerType: 'training_session',
        ownerId: initial.id,
        ...meta
      })
      setMediaList((prev) => [...prev, created])
    } else {
      setMediaList((prev) => [...prev, meta])
    }
  }

  const handleRemoveMedia = async (idx) => {
    const item = mediaList[idx]
    setMediaList((prev) => prev.filter((_, i) => i !== idx))
    if (item.id && onDeleteMedia) {
      await onDeleteMedia(item.id)
    } else {
      try {
        if (item.storagePath) await removeFromStorage(item.storagePath)
        if (item.thumbnailPath) await removeFromStorage(item.thumbnailPath)
      } catch {
        /* ignore */
      }
    }
  }

  const submit = async () => {
    if (!valid || submitting) return
    setSubmitting(true)
    try {
      const payload = {
        date,
        location: location.trim(),
        durationMin: durationMin === '' ? null : Number(durationMin),
        themeTags: initial?.themeTags || [],
        note: note.trim(),
        recordedBy: recorder || initial?.recordedBy || null
      }
      if (isEdit) {
        await onUpdate(initial.id, payload, items)
      } else {
        await onSave(member.id, payload, items, mediaList)
      }
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
            {isEdit ? '編輯練習' : '新增練習'} · {member.name}
          </h2>
          <button
            onClick={submit}
            disabled={!valid || submitting}
            className={`p-2 -m-2 font-semibold ${
              valid && !submitting ? 'text-coral' : 'text-mute opacity-50'
            }`}
            aria-label="儲存"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <label className="block col-span-1">
              <span className="block text-[11px] text-mute mb-1 px-1">日期</span>
              <input
                className="ios-field py-2 text-base"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="block col-span-1">
              <span className="block text-[11px] text-mute mb-1 px-1">時長</span>
              <div className="relative">
                <input
                  className="ios-field py-2 text-base"
                  type="number"
                  inputMode="numeric"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  placeholder="60"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-mute">分</span>
              </div>
            </label>
            <label className="block col-span-1">
              <span className="block text-[11px] text-mute mb-1 px-1">地點</span>
              <input
                className="ios-field py-2 text-base"
                placeholder="球館"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-semibold">練習項目</span>
              <span className="text-[11px] text-mute">{items.length} 項</span>
            </div>
            {items.map((it, i) => (
              <ItemEditor
                key={i}
                item={it}
                onChange={(next) => updateItem(i, next)}
                onRemove={() => removeItem(i)}
              />
            ))}
            <button
              type="button"
              onClick={addItem}
              className="w-full py-3 rounded-ios border-2 border-dashed border-warm text-mute hover:text-coral hover:border-coral/40 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">加一項</span>
            </button>
          </div>

          <div>
            <span className="block text-[11px] text-mute mb-1.5 px-1">附件</span>
            <MediaPicker
              member={member}
              attached={mediaList}
              onAdd={handleAddMedia}
              onRemove={handleRemoveMedia}
            />
          </div>

          <label className="block">
            <span className="block text-[11px] text-mute mb-1 px-1">整體心得</span>
            <textarea
              className="ios-field py-2 text-base resize-none"
              rows={3}
              placeholder="今天的狀態、教練回饋…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
