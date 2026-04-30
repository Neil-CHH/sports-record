import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { monthsBetween } from '../../utils/age.js'

const COLORS = {
  coral: '#FF9B85',
  sky: '#4CB5E5'
}

const METRICS = {
  height: { label: '身高', unit: 'cm', field: 'heightCm', yPad: 5 },
  weight: { label: '體重', unit: 'kg', field: 'weightKg', yPad: 2 }
}

const formatAgeFull = (months) => {
  if (months < 1) return '新生'
  if (months < 12) return `${Math.floor(months)} 個月`
  const years = Math.floor(months / 12)
  const rest = Math.round(months - years * 12)
  if (rest === 0) return `${years} 歲`
  if (rest === 12) return `${years + 1} 歲`
  return `${years} 歲 ${rest} 個月`
}

const formatAgeAxis = (months) => {
  if (months < 12) return `${Math.round(months)}月`
  const years = Math.floor(months / 12)
  const rest = Math.round(months - years * 12)
  if (rest === 0) return `${years}歲`
  if (rest === 6) return `${years}歲半`
  return `${years}歲${rest}月`
}

const makeTicks = (min, max) => {
  if (!isFinite(min) || !isFinite(max)) return []
  if (max - min < 12) {
    const start = Math.max(0, Math.floor(min / 3) * 3)
    const end = Math.ceil(max / 3) * 3
    const ticks = []
    for (let m = start; m <= end; m += 3) ticks.push(m)
    return ticks
  }
  const start = Math.max(0, Math.floor(min / 12) * 12)
  const end = Math.ceil(max / 12) * 12
  const ticks = []
  for (let m = start; m <= end; m += 12) ticks.push(m)
  return ticks
}

const buildSeries = (member, records, field) =>
  records
    .filter((r) => r.memberId === member.id && member.birthday && r[field] != null)
    .map((r) => ({
      months: Math.round(monthsBetween(member.birthday, r.date) * 10) / 10,
      value: r[field],
      date: r.date
    }))
    .sort((a, b) => a.months - b.months)

const TooltipCard = ({ active, payload, members, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-ios px-3 py-2 text-sm">
      {payload.map((p) => {
        const m = members.find((mm) => mm.id === p.dataKey)
        if (!m) return null
        return (
          <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: COLORS[m.color] || '#999' }}
            />
            <span className="text-ink">
              {m.name} · {p.value} {unit}
            </span>
          </div>
        )
      })}
      {payload[0]?.payload?.months !== undefined && (
        <div className="text-xs text-mute mt-1">
          {formatAgeFull(payload[0].payload.months)}
        </div>
      )}
    </div>
  )
}

export default function GrowthCompareChart({ members, records }) {
  const [metric, setMetric] = useState('height')
  const cfg = METRICS[metric]

  const { chartData, hasEnough, ticks } = useMemo(() => {
    const seriesByMember = members.map((m) => ({
      member: m,
      points: buildSeries(m, records, cfg.field)
    }))
    const allMonths = new Set()
    seriesByMember.forEach((s) => s.points.forEach((p) => allMonths.add(p.months)))
    const months = [...allMonths].sort((a, b) => a - b)

    const data = months.map((mo) => {
      const row = { months: mo }
      seriesByMember.forEach(({ member, points }) => {
        const pt = points.find((p) => p.months === mo)
        if (pt) row[member.id] = pt.value
      })
      return row
    })

    const enoughFlag =
      seriesByMember.every((s) => s.points.length >= 1) &&
      seriesByMember.some((s) => s.points.length >= 2)

    const t = months.length > 0 ? makeTicks(months[0], months[months.length - 1]) : []
    return { chartData: data, hasEnough: enoughFlag, ticks: t }
  }, [members, records, cfg.field])

  return (
    <div className="px-5 pb-10">
      <div className="glass rounded-iosLg p-5 animate-fadeIn">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-growth" />
          <h2 className="text-lg font-semibold">同期{cfg.label}比較</h2>
        </div>

        <div className="flex gap-1 mb-4 p-1 bg-warm/50 rounded-ios">
          {Object.entries(METRICS).map(([key, m]) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`flex-1 py-1.5 rounded-[0.85rem] text-sm font-medium transition ${
                metric === key ? 'bg-white text-ink shadow-sm' : 'text-mute'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {chartData.length === 0 ? (
          <div className="py-12 text-center text-mute text-sm leading-relaxed">
            尚無{cfg.label}資料可比較
            <br />
            幫兩位小孩各記錄幾筆{cfg.label}吧
          </div>
        ) : (
          <>
            <div className="text-xs text-mute mb-3 px-1">
              X 軸：年齡 · Y 軸：{cfg.label} ({cfg.unit})
            </div>
            <div className="h-72 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#DDE3EC" strokeDasharray="3 5" vertical={false} />
                  <XAxis
                    dataKey="months"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tick={{ fill: '#6B7B95', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    ticks={ticks}
                    tickFormatter={formatAgeAxis}
                  />
                  <YAxis
                    domain={[`dataMin - ${cfg.yPad}`, `dataMax + ${cfg.yPad}`]}
                    tick={{ fill: '#6B7B95', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    content={<TooltipCard members={members} unit={cfg.unit} />}
                    cursor={{ stroke: '#DDE3EC', strokeWidth: 1 }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, color: '#1A2740', paddingTop: 6 }}
                    formatter={(value) => {
                      const m = members.find((mm) => mm.id === value)
                      return m?.name || value
                    }}
                  />
                  {members.map((m) => (
                    <Line
                      key={m.id}
                      type="monotone"
                      dataKey={m.id}
                      name={m.id}
                      stroke={COLORS[m.color] || '#999'}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#EDF1F5' }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {!hasEnough && (
              <p className="text-xs text-mute text-center mt-3">
                提示：至少一位小孩有兩筆以上紀錄時，曲線會更明顯
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
