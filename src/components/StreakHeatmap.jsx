import { useState } from 'react'
import { Flame, X } from 'lucide-react'

const dayKey = (d) => {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

const startOfWeekMon = (d) => {
  const x = new Date(d)
  const dow = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - dow)
  x.setHours(0, 0, 0, 0)
  return x
}

const WEEKS = 12
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const intensityClass = (mins) => {
  if (mins == null) return 'bg-warm/40'
  if (mins < 60) return 'bg-warm'
  if (mins < 151) return 'bg-coral/30'
  if (mins < 271) return 'bg-coral/60'
  return 'bg-coral'
}

const computeStreak = (dayMap) => {
  let n = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const k = dayKey(d)
    if (dayMap[k]) n++
    else if (i > 0) break
  }
  return n
}

export default function StreakHeatmap({ sessions, member }) {
  const [selected, setSelected] = useState(null)

  const memberSessions = sessions.filter((s) => s.memberId === member.id)
  const dayMap = {}
  for (const s of memberSessions) {
    dayMap[s.date] = (dayMap[s.date] || 0) + (s.durationMin || 30)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monday = startOfWeekMon(today)
  const start = new Date(monday)
  start.setDate(start.getDate() - (WEEKS - 1) * 7)

  const cells = []
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(date.getDate() + w * 7 + d)
      const key = dayKey(date)
      const future = date > today
      cells.push({ key, mins: future ? null : dayMap[key] || 0, future })
    }
  }

  const streak = computeStreak(dayMap)
  const total = Object.keys(dayMap).filter((k) => k >= dayKey(start)).length
  const totalMins = Object.entries(dayMap)
    .filter(([k]) => k >= dayKey(start))
    .reduce((a, [, v]) => a + v, 0)

  const handleClick = (cell) => {
    if (!cell.mins) return
    setSelected({ ...cell, daySessions: memberSessions.filter((s) => s.date === cell.key) })
  }

  return (
    <>
      <div className="glass rounded-ios p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-coralDark" />
            打卡記錄
          </span>
          <span className="text-[11px] text-mute">近 {WEEKS} 週</span>
        </div>

        <div className="flex gap-5 mb-3">
          <div>
            <div className="text-[11px] text-mute">連續</div>
            <div className="text-2xl font-bold tabular-nums">
              {streak}<span className="text-xs text-mute font-normal"> 天</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-mute">天數</div>
            <div className="text-2xl font-bold tabular-nums">
              {total}<span className="text-xs text-mute font-normal"> 天</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-mute">總時數</div>
            <div className="text-2xl font-bold tabular-nums">
              {(totalMins / 60).toFixed(1)}<span className="text-xs text-mute font-normal"> 小時</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5">
          <div className="flex flex-col gap-1 shrink-0 self-stretch">
            {DAY_LABELS.map((d) => (
              <div key={d} className="flex-1 flex items-center">
                <span className="text-[9px] text-mute leading-none">{d}</span>
              </div>
            ))}
          </div>
          <div
            className="grid gap-1 flex-1"
            style={{
              gridTemplateRows: 'repeat(7, 1fr)',
              gridAutoFlow: 'column',
              gridAutoColumns: '1fr'
            }}
          >
            {cells.map((c) => (
              <div
                key={c.key}
                className={`aspect-square rounded-sm ${intensityClass(c.mins)}${c.mins ? ' cursor-pointer active:scale-90 transition-transform' : ''}`}
                onClick={() => handleClick(c)}
                title={`${c.key}${c.mins ? ` · ${c.mins} 分鐘` : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-mute">
          <span>少</span>
          <div className="w-3 h-3 rounded-sm bg-warm" />
          <div className="w-3 h-3 rounded-sm bg-coral/30" />
          <div className="w-3 h-3 rounded-sm bg-coral/60" />
          <div className="w-3 h-3 rounded-sm bg-coral" />
          <span>多</span>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md mx-auto bg-cream rounded-t-2xl p-5 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-mute">{selected.key}</div>
                <div className="font-semibold">共 {selected.mins} 分鐘</div>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-warm/60"
                onClick={() => setSelected(null)}
              >
                <X className="w-4 h-4 text-mute" />
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selected.daySessions.map((s) => (
                <div key={s.id} className="bg-warm/40 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s.location || '練習'}</span>
                    <span className="text-xs text-mute">{s.durationMin ?? 30} 分鐘</span>
                  </div>
                  {s.themeTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.themeTags.map((t) => (
                        <span key={t} className="text-[10px] bg-warm px-1.5 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                  {s.note && <p className="text-[11px] text-mute mt-1.5">{s.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
