import { Flame } from 'lucide-react'

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

const intensityClass = (mins) => {
  if (mins == null) return 'bg-warm/40'
  if (mins === 0) return 'bg-warm'
  if (mins < 30) return 'bg-coral/30'
  if (mins < 60) return 'bg-coral/60'
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
  const dayMap = {}
  for (const s of sessions) {
    if (s.memberId !== member.id) continue
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
      cells.push({
        key,
        mins: future ? null : dayMap[key] || 0,
        future
      })
    }
  }

  const streak = computeStreak(dayMap)
  const total = Object.keys(dayMap).filter((k) => k >= dayKey(start)).length
  const totalMins = Object.entries(dayMap)
    .filter(([k]) => k >= dayKey(start))
    .reduce((a, [, v]) => a + v, 0)

  return (
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
            {streak}
            <span className="text-xs text-mute font-normal"> 天</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] text-mute">天數</div>
          <div className="text-2xl font-bold tabular-nums">
            {total}
            <span className="text-xs text-mute font-normal"> 天</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] text-mute">總時數</div>
          <div className="text-2xl font-bold tabular-nums">
            {(totalMins / 60).toFixed(1)}
            <span className="text-xs text-mute font-normal"> 小時</span>
          </div>
        </div>
      </div>

      <div
        className="grid gap-1"
        style={{
          gridTemplateRows: 'repeat(7, 1fr)',
          gridAutoFlow: 'column',
          gridAutoColumns: '1fr'
        }}
      >
        {cells.map((c) => (
          <div
            key={c.key}
            className={`aspect-square rounded-sm ${intensityClass(c.mins)}`}
            title={`${c.key}${c.mins ? ` · ${c.mins} 分鐘` : ''}`}
          />
        ))}
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
  )
}
