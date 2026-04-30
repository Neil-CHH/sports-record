import { useMemo } from 'react'
import { Smile } from 'lucide-react'
import { computeDentalStats } from '../../utils/dental.js'

const Metric = ({ value, label, tone }) => (
  <div className={`flex-1 rounded-ios px-3 py-3 text-center ${tone}`}>
    <div className="text-3xl font-bold tabular-nums leading-none">{value}</div>
    <div className="text-[11px] mt-1 opacity-80">{label}</div>
  </div>
)

export default function DentalStatsCard({ records, member }) {
  const memberRecords = useMemo(
    () => records.filter((r) => r.memberId === member.id),
    [records, member.id]
  )
  const stats = useMemo(() => computeDentalStats(memberRecords), [memberRecords])

  return (
    <div className="px-5 pt-1 pb-3">
      <div className="glass rounded-iosLg p-4 animate-fadeIn">
        <div className="flex items-center gap-2 mb-3">
          <Smile className="w-4 h-4 text-dental" />
          <span className="text-sm font-semibold">{member.name} · 近 12 個月</span>
        </div>
        <div className="flex gap-2">
          <Metric value={stats.exams} label="檢查次數" tone="bg-warm/40 text-ink" />
          <Metric value={stats.cavities} label="蛀牙顆數" tone="bg-dental/15 text-dentalDark" />
          <Metric value={stats.fluorides} label="塗氟次數" tone="bg-sky/15 text-skyDark" />
        </div>
      </div>
    </div>
  )
}
