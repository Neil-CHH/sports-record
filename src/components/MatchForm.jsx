import { useEffect, useMemo, useState } from 'react'
import { Check, X, Plus, Trash2 } from 'lucide-react'
import { todayISO } from '../utils/age.js'
import { removeFromStorage } from '../utils/mediaUpload.js'
import MediaPicker from './MediaPicker.jsx'

const ROUND_PRESETS = ['預賽', '16強', '8強', '4強', '準決賽', '決賽']
const HAND_OPTS = [
  { value: '', label: '不知道' },
  { value: 'R', label: '右手' },
  { value: 'L', label: '左手' }
]

const blankSet = () => ({ us: '', them: '' })

const computeResult = (scores) => {
  let us = 0
  let them = 0
  for (const s of scores) {
    const a = Number(s.us)
    const b = Number(s.them)
    if (!Number.isFinite(a) || !Number.isFinite(b) || (a === 0 && b === 0)) continue
    if (a > b) us += 1
    else if (b > a) them += 1
  }
  if (us === 0 && them === 0) return null
  return us > them ? 'W' : us < them ? 'L' : null
}

const PillBtn = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs transition ${
      active ? 'bg-coral text-white font-semibold' : 'bg-white/70 text-mute border border-warm'
    }`}
  >
    {children}
  </button>
)

export default function MatchForm({
  open,
  member,
  recorder,
  matches,
  initial,
  initialMedia,
  onClose,
  onSave,
  onUpdate,
  onAddMedia,
  onDeleteMedia
}) {
  const isEdit = Boolean(initial)
  const [date, setDate] = useState(() => todayISO())
  const [eventName, setEventName] = useState('')
  const [round, setRound] = useState('')
  const [format, setFormat] = useState('singles')
  const [partnerName, setPartnerName] = useState('')
  const [opponentSchool, setOpponentSchool] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [opponentHand, setOpponentHand] = useState('')
  const [scores, setScores] = useState([blankSet()])
  const [resultOverride, setResultOverride] = useState(null)
  const [note, setNote] = useState('')
  const [mediaList, setMediaList] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setDate(initial.date)
      setEventName(initial.eventName || '')
      setRound(initial.round || '')
      setFormat(initial.format || 'singles')
      setPartnerName(initial.partnerName || '')
      setOpponentSchool(initial.opponentSchool || '')
      setOpponentName(initial.opponentName || '')
      setOpponentHand(initial.opponentHand || '')
      setScores(
        initial.scores?.length
          ? initial.scores.map((s) => ({ us: String(s.us ?? ''), them: String(s.them ?? '') }))
          : [blankSet()]
      )
      setResultOverride(initial.result || null)
      setNote(initial.note || '')
      setMediaList([...(initialMedia || [])])
    } else {
      setDate(todayISO())
      setEventName('')
      setRound('')
      setFormat('singles')
      setPartnerName('')
      setOpponentSchool('')
      setOpponentName('')
      setOpponentHand('')
      setScores([blankSet()])
      setResultOverride(null)
      setNote('')
      setMediaList([])
    }
    setSubmitting(false)
  }, [open, initial, initialMedia])

  const computedResult = useMemo(() => computeResult(scores), [scores])
  const result = isEdit ? (resultOverride || computedResult) : (resultOverride || computedResult)

  const headToHead = useMemo(() => {
    if (!opponentName.trim() || !matches) return null
    const prior = matches.filter(
      (m) =>
        m.id !== initial?.id &&
        m.memberId === member.id &&
        m.opponentName &&
        m.opponentName.trim() === opponentName.trim()
    )
    if (!prior.length) return null
    const w = prior.filter((m) => m.result === 'W').length
    const l = prior.filter((m) => m.result === 'L').length
    return { count: prior.length, w, l }
  }, [opponentName, matches, member.id, initial?.id])

  if (!open) return null

  const updateSet = (idx, key, val) =>
    setScores((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s)))
  const removeSet = (idx) => setScores((prev) => prev.filter((_, i) => i !== idx))
  const addSet = () => setScores((prev) => [...prev, blankSet()])

  const valid = Boolean(date)

  const handleAddMedia = async (meta) => {
    if (isEdit && onAddMedia) {
      const created = await onAddMedia({
        memberId: member.id,
        ownerType: 'match',
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
      const cleanScores = scores
        .map((s) => ({ us: Number(s.us), them: Number(s.them) }))
        .filter((s) => Number.isFinite(s.us) && Number.isFinite(s.them) && (s.us > 0 || s.them > 0))

      const payload = {
        date,
        eventName: eventName.trim(),
        round: round.trim(),
        format,
        partnerName: format === 'doubles' ? partnerName.trim() : '',
        opponentSchool: opponentSchool.trim(),
        opponentName: opponentName.trim(),
        opponentHand,
        scores: cleanScores,
        result,
        tags: initial?.tags || [],
        note: note.trim(),
        recordedBy: recorder || initial?.recordedBy || null
      }

      if (isEdit) {
        await onUpdate(initial.id, payload)
      } else {
        await onSave(member.id, payload, mediaList)
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
            {isEdit ? '編輯比賽' : '新增比賽'} · {member.name}
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
            <label className="block col-span-2">
              <span className="block text-[11px] text-mute mb-1 px-1">賽事名稱</span>
              <input
                className="ios-field py-2 text-base"
                placeholder="師生盃 / 全縣賽 / 隊內練習賽"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </label>
          </div>

          <div>
            <span className="block text-[11px] text-mute mb-1.5 px-1">輪次</span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ROUND_PRESETS.map((r) => (
                <PillBtn key={r} active={round === r} onClick={() => setRound(r)}>
                  {r}
                </PillBtn>
              ))}
              {round && !ROUND_PRESETS.includes(round) && (
                <PillBtn active onClick={() => setRound('')}>
                  {round}
                </PillBtn>
              )}
            </div>
            <input
              className="ios-field py-2 text-sm bg-white/50"
              placeholder="或自由輸入(例如 32強、A組第二輪)"
              value={ROUND_PRESETS.includes(round) ? '' : round}
              onChange={(e) => setRound(e.target.value)}
            />
          </div>

          <div>
            <span className="block text-[11px] text-mute mb-1.5 px-1">賽制</span>
            <div className="flex gap-1.5">
              <PillBtn active={format === 'singles'} onClick={() => setFormat('singles')}>
                單打
              </PillBtn>
              <PillBtn active={format === 'doubles'} onClick={() => setFormat('doubles')}>
                雙打
              </PillBtn>
            </div>
            {format === 'doubles' && (
              <input
                className="ios-field py-2 text-base mt-2"
                placeholder="搭擋姓名"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <span className="block text-[11px] text-mute px-1">對手</span>
            <input
              className="ios-field py-2 text-base"
              placeholder="對手學校"
              value={opponentSchool}
              onChange={(e) => setOpponentSchool(e.target.value)}
            />
            <input
              className="ios-field py-2 text-base"
              placeholder="對手姓名"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
            />
            {headToHead && (
              <div className="text-xs text-mute bg-amber/10 border border-amber/30 rounded-ios px-3 py-2">
                之前對 {opponentName.trim()} 打過 {headToHead.count} 場 · {headToHead.w}勝 {headToHead.l}敗
              </div>
            )}
            <div>
              <span className="block text-[11px] text-mute mb-1.5 px-1">慣用手</span>
              <div className="flex gap-1.5">
                {HAND_OPTS.map((h) => (
                  <PillBtn
                    key={h.value || 'unknown'}
                    active={opponentHand === h.value}
                    onClick={() => setOpponentHand(h.value)}
                  >
                    {h.label}
                  </PillBtn>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-mute">比分</span>
              {result && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    result === 'W' ? 'bg-coral text-white' : 'bg-mute/30 text-mute'
                  }`}
                >
                  {result === 'W' ? '勝' : '敗'}
                  {resultOverride && resultOverride !== computedResult ? ' · 手動' : ''}
                </span>
              )}
            </div>
            {scores.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-mute w-12">第{i + 1}局</span>
                <input
                  className="ios-field py-2 text-base text-center tabular-nums flex-1"
                  type="number"
                  inputMode="numeric"
                  placeholder="我方"
                  value={s.us}
                  onChange={(e) => updateSet(i, 'us', e.target.value)}
                />
                <span className="text-mute font-bold">:</span>
                <input
                  className="ios-field py-2 text-base text-center tabular-nums flex-1"
                  type="number"
                  inputMode="numeric"
                  placeholder="對手"
                  value={s.them}
                  onChange={(e) => updateSet(i, 'them', e.target.value)}
                />
                {scores.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSet(i)}
                    className="p-2 -m-2 text-mute hover:text-coralDark"
                    aria-label="刪除這局"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSet}
              className="w-full py-2 rounded-ios border-2 border-dashed border-warm text-mute hover:text-coral hover:border-coral/40 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">加一局</span>
            </button>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-mute">手動指定結果:</span>
              <PillBtn active={resultOverride === 'W'} onClick={() => setResultOverride(resultOverride === 'W' ? null : 'W')}>
                勝
              </PillBtn>
              <PillBtn active={resultOverride === 'L'} onClick={() => setResultOverride(resultOverride === 'L' ? null : 'L')}>
                敗
              </PillBtn>
            </div>
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
            <span className="block text-[11px] text-mute mb-1 px-1">心得 / 觀察</span>
            <textarea
              className="ios-field py-2 text-base resize-none"
              rows={3}
              placeholder="殺球角度、失誤點、教練建議…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
