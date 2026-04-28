import { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

const METRICS = [
  {
    key: 'rope_total',
    label: '二迴旋',
    unit: '次',
    aggLabel: '單次練習總次數',
    extract: (items) => {
      const rope = items.filter((i) => i.kind === 'rope_double')
      if (!rope.length) return null
      const total = rope.reduce((acc, i) => {
        const sets = Number(i.metrics?.sets) || 1
        const reps = Number(i.metrics?.reps) || 0
        return acc + sets * reps
      }, 0)
      return total > 0 ? total : null
    }
  },
  {
    key: 'run_seconds',
    label: '跑步',
    unit: '秒',
    aggLabel: '單次練習最快秒數',
    extract: (items) => {
      const runs = items
        .filter((i) => i.kind === 'run')
        .map((i) => Number(i.metrics?.seconds))
        .filter((v) => Number.isFinite(v) && v > 0)
      if (!runs.length) return null
      return Math.min(...runs)
    }
  },
  {
    key: 'lift_max',
    label: '重訓',
    unit: 'kg',
    aggLabel: '單次練習最大重量',
    extract: (items) => {
      const lifts = items
        .filter((i) => i.kind === 'lift')
        .map((i) => Number(i.metrics?.weightKg))
        .filter((v) => Number.isFinite(v) && v > 0)
      if (!lifts.length) return null
      return Math.max(...lifts)
    }
  }
]

export default function TrendChart({ sessions, items, member }) {
  const [metricKey, setMetricKey] = useState('rope_total')
  const metric = METRICS.find((m) => m.key === metricKey)

  const data = useMemo(() => {
    return sessions
      .filter((s) => s.memberId === member.id)
      .map((s) => {
        const sItems = items.filter((i) => i.sessionId === s.id)
        const value = metric.extract(sItems)
        return value == null ? null : { date: s.date, value }
      })
      .filter(Boolean)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
  }, [sessions, items, member.id, metric])

  return (
    <div className="glass rounded-ios p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-coralDark" />
          體能趨勢
        </span>
        <div className="flex gap-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetricKey(m.key)}
              className={`px-2 py-0.5 rounded-full text-[11px] transition ${
                metricKey === m.key
                  ? 'bg-coral text-white font-semibold'
                  : 'bg-white/70 text-mute border border-warm'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="text-[11px] text-mute mb-2">{metric.aggLabel}</div>

      {data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-xs text-mute">
          還沒有 {metric.label} 的紀錄
        </div>
      ) : (
        <div className="h-40 -ml-2">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#DDE3EC" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.slice(5)}
                tick={{ fontSize: 10, fill: '#6B7B95' }}
                stroke="#DDE3EC"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6B7B95' }}
                stroke="#DDE3EC"
                width={36}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #DDE3EC',
                  fontSize: 12
                }}
                labelStyle={{ color: '#6B7B95' }}
                formatter={(v) => [`${v} ${metric.unit}`, metric.label]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1E3A5F"
                strokeWidth={2}
                dot={{ r: 3, fill: '#FFB800', stroke: '#1E3A5F', strokeWidth: 1.5 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
