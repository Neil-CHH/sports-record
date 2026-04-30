import { useEffect, useState } from 'react'
import { Check, ChevronDown, ChevronRight, X } from 'lucide-react'
import { todayISO } from '../../utils/age.js'
import { ACUITY_SPECIAL, ACUITY_VALUES, CHECK_TYPES } from '../../utils/vision.js'
import PhotoInputInline from '../PhotoInputInline.jsx'

const RECORDER_OPTS = [
  { key: 'dad', label: '爸爸' },
  { key: 'mom', label: '媽媽' }
]

const AcuitySelect = ({ value, onChange }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="ios-field py-2.5 text-base tabular-nums"
  >
    <option value="">—</option>
    {ACUITY_VALUES.map((v) => (
      <option key={v} value={v}>{v}</option>
    ))}
    <optgroup label="其他">
      {ACUITY_SPECIAL.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </optgroup>
  </select>
)

const DegreeInput = ({ value, onChange, placeholder = '0' }) => {
  const n = value === '' || value == null ? null : Number(value)
  const sign = n == null ? -1 : n > 0 ? 1 : -1
  const abs = n == null ? '' : Math.abs(n)

  const setSign = (s) => {
    if (abs === '' || abs === 0) {
      onChange('')
    } else {
      onChange(String(s * Math.abs(Number(abs))))
    }
  }
  const setAbs = (v) => {
    if (v === '') { onChange(''); return }
    const cleaned = v.replace(/[^\d]/g, '')
    if (cleaned === '') { onChange(''); return }
    onChange(String(sign * Number(cleaned)))
  }

  return (
    <div className="flex gap-1.5">
      <div className="flex gap-0.5 p-0.5 bg-warm/50 rounded-ios">
        <button
          type="button"
          onClick={() => setSign(-1)}
          className={`px-2.5 py-1 rounded-[0.7rem] text-xs font-medium transition ${
            sign === -1 ? 'bg-white text-ink shadow-sm' : 'text-mute'
          }`}
        >近視</button>
        <button
          type="button"
          onClick={() => setSign(1)}
          className={`px-2.5 py-1 rounded-[0.7rem] text-xs font-medium transition ${
            sign === 1 ? 'bg-white text-ink shadow-sm' : 'text-mute'
          }`}
        >遠視</button>
      </div>
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={abs}
        onChange={(e) => setAbs(e.target.value)}
        className="ios-field py-2.5 text-base tabular-nums flex-1"
      />
    </div>
  )
}

const CylInput = ({ value, onChange }) => {
  const n = value === '' || value == null ? '' : Math.abs(Number(value))
  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="0"
      value={n}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^\d]/g, '')
        if (cleaned === '') { onChange(''); return }
        onChange(String(-Math.abs(Number(cleaned))))
      }}
      className="ios-field py-2.5 text-base tabular-nums"
    />
  )
}

export default function VisionForm({
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
  const [checkType, setCheckType] = useState('clinic')
  const [wearsGlasses, setWearsGlasses] = useState(false)
  const [leftAcuity, setLeftAcuity] = useState('')
  const [rightAcuity, setRightAcuity] = useState('')
  const [leftAcuityCorrected, setLeftAcuityCorrected] = useState('')
  const [rightAcuityCorrected, setRightAcuityCorrected] = useState('')
  const [leftSph, setLeftSph] = useState('')
  const [rightSph, setRightSph] = useState('')
  const [leftCyl, setLeftCyl] = useState('')
  const [rightCyl, setRightCyl] = useState('')
  const [leftAxis, setLeftAxis] = useState('')
  const [rightAxis, setRightAxis] = useState('')
  const [leftAxial, setLeftAxial] = useState('')
  const [rightAxial, setRightAxial] = useState('')
  const [nextVisit, setNextVisit] = useState('')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(null)
  const [diopterOpen, setDiopterOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setDate(initial.date)
      setCheckType(initial.checkType || 'clinic')
      setWearsGlasses(!!initial.wearsGlasses)
      setLeftAcuity(initial.leftAcuity || '')
      setRightAcuity(initial.rightAcuity || '')
      setLeftAcuityCorrected(initial.leftAcuityCorrected || '')
      setRightAcuityCorrected(initial.rightAcuityCorrected || '')
      setLeftSph(initial.leftSph == null ? '' : String(initial.leftSph))
      setRightSph(initial.rightSph == null ? '' : String(initial.rightSph))
      setLeftCyl(initial.leftCyl == null ? '' : String(initial.leftCyl))
      setRightCyl(initial.rightCyl == null ? '' : String(initial.rightCyl))
      setLeftAxis(initial.leftAxis == null ? '' : String(initial.leftAxis))
      setRightAxis(initial.rightAxis == null ? '' : String(initial.rightAxis))
      setLeftAxial(initial.leftAxialLength == null ? '' : String(initial.leftAxialLength))
      setRightAxial(initial.rightAxialLength == null ? '' : String(initial.rightAxialLength))
      setNextVisit(initial.nextVisit || '')
      setNote(initial.note || '')
      setPhoto(initial.photo || null)
      setDiopterOpen(
        initial.leftSph != null || initial.rightSph != null ||
        initial.leftCyl != null || initial.rightCyl != null
      )
      setAdvancedOpen(
        initial.leftAxis != null || initial.rightAxis != null ||
        initial.leftAxialLength != null || initial.rightAxialLength != null
      )
    } else {
      setDate(todayISO())
      setCheckType('clinic')
      setWearsGlasses(false)
      setLeftAcuity('')
      setRightAcuity('')
      setLeftAcuityCorrected('')
      setRightAcuityCorrected('')
      setLeftSph('')
      setRightSph('')
      setLeftCyl('')
      setRightCyl('')
      setLeftAxis('')
      setRightAxis('')
      setLeftAxial('')
      setRightAxial('')
      setNextVisit('')
      setNote('')
      setPhoto(null)
      setDiopterOpen(false)
      setAdvancedOpen(false)
    }
    setError('')
    setSubmitting(false)
  }, [open, initial])

  if (!open) return null

  const submit = async () => {
    if (submitting) return
    if (!date) { setError('請選擇日期'); return }
    if (!leftAcuity && !rightAcuity && !leftSph && !rightSph && !photo) {
      setError('至少填一項視力、度數或附上照片')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        date,
        checkType,
        wearsGlasses,
        leftAcuity,
        rightAcuity,
        leftAcuityCorrected,
        rightAcuityCorrected,
        leftSph,
        rightSph,
        leftCyl,
        rightCyl,
        leftAxis,
        rightAxis,
        leftAxialLength: leftAxial,
        rightAxialLength: rightAxial,
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
            {isEdit ? '編輯視力' : '新增視力'} · {member.name}
          </h2>
          <button
            onClick={submit}
            disabled={submitting}
            className={`p-2 -m-2 font-semibold ${submitting ? 'text-mute opacity-50' : 'text-skyDark'}`}
            aria-label="儲存"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-sky/10 text-skyDark border border-sky/30 rounded-ios px-4 py-2.5 text-sm animate-fadeIn">
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
            <span className="block text-sm text-mute mb-1.5 px-1">檢查類型</span>
            <div className="flex gap-1 p-1 bg-warm/50 rounded-ios">
              {CHECK_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setCheckType(t.key)}
                  className={`flex-1 py-2 rounded-[0.85rem] text-sm font-medium transition ${
                    checkType === t.key ? 'bg-white text-ink shadow-sm' : 'text-mute'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between px-1 py-1 cursor-pointer">
            <span className="text-sm text-ink">目前已配戴眼鏡</span>
            <input
              type="checkbox"
              checked={wearsGlasses}
              onChange={(e) => setWearsGlasses(e.target.checked)}
              className="w-5 h-5 accent-sky"
            />
          </label>

          <div className="glass rounded-ios p-4">
            <div className="text-sm font-semibold text-ink mb-2">視力</div>
            <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center text-xs text-mute mb-1 px-1">
              <span></span>
              <span>裸視</span>
              <span>{wearsGlasses ? '戴鏡後 (選填)' : '矯正後 (選填)'}</span>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                <span className="text-xs text-mute w-10">左眼</span>
                <AcuitySelect value={leftAcuity} onChange={setLeftAcuity} />
                <AcuitySelect value={leftAcuityCorrected} onChange={setLeftAcuityCorrected} />
              </div>
              <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                <span className="text-xs text-mute w-10">右眼</span>
                <AcuitySelect value={rightAcuity} onChange={setRightAcuity} />
                <AcuitySelect value={rightAcuityCorrected} onChange={setRightAcuityCorrected} />
              </div>
            </div>
          </div>

          <div className="glass rounded-ios">
            <button
              type="button"
              onClick={() => setDiopterOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-ink"
            >
              <span>度數 (選填)</span>
              {diopterOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {diopterOpen && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <div className="text-xs text-mute mb-1 px-1">近視/遠視度數（整數）</div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                      <span className="text-xs text-mute w-10">左眼</span>
                      <DegreeInput value={leftSph} onChange={setLeftSph} />
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                      <span className="text-xs text-mute w-10">右眼</span>
                      <DegreeInput value={rightSph} onChange={setRightSph} />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-mute mb-1 px-1">散光度數（整數）</div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                      <span className="text-xs text-mute w-10">左眼</span>
                      <CylInput value={leftCyl} onChange={setLeftCyl} />
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                      <span className="text-xs text-mute w-10">右眼</span>
                      <CylInput value={rightCyl} onChange={setRightCyl} />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-1 py-2 text-xs text-mute"
                >
                  <span>進階（軸度 / 眼軸）</span>
                  {advancedOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {advancedOpen && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-mute mb-1 px-1">散光軸度 (0–180)</div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                          <span className="text-xs text-mute w-10">左眼</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="180"
                            placeholder="0–180"
                            value={leftAxis}
                            onChange={(e) => setLeftAxis(e.target.value)}
                            className="ios-field py-2.5 tabular-nums"
                          />
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                          <span className="text-xs text-mute w-10">右眼</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="180"
                            placeholder="0–180"
                            value={rightAxis}
                            onChange={(e) => setRightAxis(e.target.value)}
                            className="ios-field py-2.5 tabular-nums"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-mute mb-1 px-1">眼軸長度 (mm)</div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                          <span className="text-xs text-mute w-10">左眼</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            placeholder="例如 23.5"
                            value={leftAxial}
                            onChange={(e) => setLeftAxial(e.target.value)}
                            className="ios-field py-2.5 tabular-nums"
                          />
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                          <span className="text-xs text-mute w-10">右眼</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            placeholder="例如 23.3"
                            value={rightAxial}
                            onChange={(e) => setRightAxial(e.target.value)}
                            className="ios-field py-2.5 tabular-nums"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <label className="block">
            <span className="block text-sm text-mute mb-1.5 px-1">備註 (選填)</span>
            <textarea
              rows={2}
              placeholder="醫師建議、處方變化..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="ios-field resize-none"
            />
          </label>

          <div>
            <span className="block text-sm text-mute mb-1.5 px-1">處方箋照片 (選填)</span>
            <PhotoInputInline value={photo} onChange={setPhoto} onError={setError} />
          </div>
        </div>
      </div>
    </div>
  )
}
