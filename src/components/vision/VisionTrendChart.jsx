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
import { Eye } from 'lucide-react'
import { acuityToNumber } from '../../utils/vision.js'
import { formatDate } from '../../utils/age.js'

const COLORS = { left: '#4CB5E5', right: '#FF9B85' }

const formatDateShort = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const TooltipCard = ({ active, payload, unit }) => {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="glass-strong rounded-ios px-3 py-2 text-sm">
      <div className="text-xs text-mute mb-1">{formatDate(row.date)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-ink">
            {p.name} · {p.value}
            {unit ? ` ${unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

const buildAcuityData = (records) =>
  records
    .map((r) => ({
      date: r.date,
      left: acuityToNumber(r.leftAcuity),
      right: acuityToNumber(r.rightAcuity)
    }))
    .filter((d) => d.left != null || d.right != null)
    .sort((a, b) => (a.date < b.date ? -1 : 1))

const buildDiopterData = (records) =>
  records
    .map((r) => ({
      date: r.date,
      left: r.leftSph != null ? Number(r.leftSph) : null,
      right: r.rightSph != null ? Number(r.rightSph) : null
    }))
    .filter((d) => d.left != null || d.right != null)
    .sort((a, b) => (a.date < b.date ? -1 : 1))

export default function VisionTrendChart({ records, member }) {
  const [mode, setMode] = useState('acuity')

  const memberRecords = useMemo(
    () => records.filter((r) => r.memberId === member.id),
    [records, member.id]
  )

  const data = useMemo(
    () => (mode === 'acuity' ? buildAcuityData(memberRecords) : buildDiopterData(memberRecords)),
    [memberRecords, mode]
  )

  const isAcuity = mode === 'acuity'

  return (
    <div className="px-5 pb-10">
      <div className="glass rounded-iosLg p-5 animate-fadeIn">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-skyDark" />
          <h2 className="text-lg font-semibold">{member.name} · 視力趨勢</h2>
        </div>

        <div className="flex gap-1 mb-4 p-1 bg-warm/50 rounded-ios">
          {[
            { key: 'acuity', label: '視力' },
            { key: 'diopter', label: '度數' }
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex-1 py-1.5 rounded-[0.85rem] text-sm font-medium transition ${
                mode === m.key ? 'bg-white text-ink shadow-sm' : 'text-mute'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {data.length === 0 ? (
          <div className="py-12 text-center text-mute text-sm leading-relaxed">
            尚無{isAcuity ? '視力' : '度數'}資料
            <br />
            記錄兩筆以上才會顯示曲線
          </div>
        ) : (
          <>
            <div className="text-xs text-mute mb-3 px-1">
              X 軸：日期 · Y 軸：{isAcuity ? '視力 (裸視)' : '近視度數'}
            </div>
            <div className="h-72 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#DDE3EC" strokeDasharray="3 5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6B7B95', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatDateShort}
                  />
                  <YAxis
                    domain={
                      isAcuity
                        ? [0, 1.5]
                        : ['dataMin - 50', 'dataMax + 50']
                    }
                    ticks={isAcuity ? [0, 0.3, 0.6, 0.8, 1.0, 1.2, 1.5] : undefined}
                    reversed={!isAcuity}
                    tick={{ fill: '#6B7B95', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    content={<TooltipCard unit={isAcuity ? '' : '度'} />}
                    cursor={{ stroke: '#DDE3EC', strokeWidth: 1 }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, color: '#1A2740', paddingTop: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="left"
                    name="左眼"
                    stroke={COLORS.left}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#EDF1F5' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="right"
                    name="右眼"
                    stroke={COLORS.right}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#EDF1F5' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {!isAcuity && (
              <p className="text-xs text-mute text-center mt-3">
                Y 軸反向：越往下近視越深
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
