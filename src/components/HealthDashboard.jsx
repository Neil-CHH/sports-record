import { useMemo } from 'react'
import { CalendarClock } from 'lucide-react'
import { formatDate } from '../utils/age.js'
import GrowthCompareChart from './growth/GrowthCompareChart.jsx'
import VisionTrendChart from './vision/VisionTrendChart.jsx'
import DentalStatsCard from './dental/DentalStatsCard.jsx'

const daysUntil = (iso) => {
  if (!iso) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

const NextVisitChip = ({ label, iso, tone }) => {
  const d = daysUntil(iso)
  if (d == null) return null
  const text =
    d < 0 ? `${formatDate(iso)} (已過)` :
    d === 0 ? `今天回診` :
    d === 1 ? `明天回診` :
    d <= 30 ? `${d} 天後 · ${formatDate(iso)}` :
    formatDate(iso)
  return (
    <div className={`flex items-center gap-1.5 text-xs rounded-ios px-3 py-1.5 ${tone}`}>
      <CalendarClock className="w-3.5 h-3.5" />
      <span className="font-semibold">{label}</span>
      <span>·</span>
      <span>{text}</span>
    </div>
  )
}

const latestNextVisit = (records, memberId) => {
  const list = records
    .filter((r) => r.memberId === memberId && r.nextVisit)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return list[0]?.nextVisit || null
}

export default function HealthDashboard({
  member,
  members,
  growthRecords,
  visionRecords,
  dentalRecords
}) {
  const dentalNext = useMemo(
    () => latestNextVisit(dentalRecords, member.id),
    [dentalRecords, member.id]
  )
  const visionNext = useMemo(
    () => latestNextVisit(visionRecords, member.id),
    [visionRecords, member.id]
  )

  const hasUpcoming = dentalNext || visionNext

  return (
    <div>
      {hasUpcoming && (
        <div className="px-5 pt-1 pb-2 space-y-2">
          {visionNext && (
            <NextVisitChip
              label="視力"
              iso={visionNext}
              tone="bg-sky/15 text-skyDark"
            />
          )}
          {dentalNext && (
            <NextVisitChip
              label="牙齒"
              iso={dentalNext}
              tone="bg-dental/15 text-dentalDark"
            />
          )}
        </div>
      )}
      <GrowthCompareChart members={members} records={growthRecords} />
      <VisionTrendChart records={visionRecords} member={member} />
      <DentalStatsCard records={dentalRecords} member={member} />
    </div>
  )
}
