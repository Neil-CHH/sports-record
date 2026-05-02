import { Trophy, Dumbbell, Camera, ChevronRight } from 'lucide-react'
import { formatDate } from '../utils/age.js'
import StreakHeatmap from './StreakHeatmap.jsx'
import TrendChart from './TrendChart.jsx'

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <div className="glass rounded-ios p-4 flex items-center gap-3">
    <div className="w-11 h-11 rounded-full bg-amber/30 text-coralDark flex items-center justify-center">
      <Icon className="w-5 h-5" strokeWidth={2} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs text-mute">{label}</div>
      <div className="text-2xl font-bold text-ink leading-tight tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-mute mt-0.5 leading-tight">{hint}</div>}
    </div>
  </div>
)

const past12mISO = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

const ResultPill = ({ result }) => {
  if (!result) return <span className="text-[11px] text-mute">·</span>
  const isW = result === 'W'
  return (
    <span
      className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
        isW ? 'bg-coral text-white' : 'bg-mute/30 text-mute'
      }`}
    >
      {isW ? '勝' : '敗'}
    </span>
  )
}

const RecentMatches = ({ matches, member, onJump }) => {
  const list = matches
    .filter((m) => m.memberId === member.id)
    .slice(0, 3)
  if (!list.length) return null
  return (
    <div className="glass rounded-ios p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-coralDark" />
          最近比賽
        </span>
        <button
          type="button"
          onClick={onJump}
          className="text-xs text-mute hover:text-coral flex items-center gap-0.5"
        >
          全部 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <ul className="space-y-2.5">
        {list.map((m) => (
          <li key={m.id} className="flex items-center gap-2 text-sm">
            <ResultPill result={m.result} />
            <div className="flex-1 min-w-0">
              <div className="truncate">
                <span className="font-medium">
                  {m.opponentName || m.opponentSchool || '對手未填'}
                </span>
                {m.eventName && <span className="text-mute"> · {m.eventName}</span>}
              </div>
              <div className="text-[11px] text-mute">{formatDate(m.date)}</div>
            </div>
            {m.scores?.length > 0 && (
              <div className="text-xs tabular-nums text-mute">
                {m.scores.map((s) => `${s.us}-${s.them}`).join(' / ')}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Dashboard({ member, matches, sessions, items, media, onJumpMatches }) {
  const memberMatches = matches.filter((m) => m.memberId === member.id)
  const memberSessions = sessions.filter((s) => s.memberId === member.id)
  const memberMedia = media.filter((m) => m.memberId === member.id)

  const fromISO = past12mISO()
  const recentMatches = memberMatches.filter((m) => m.date >= fromISO)
  const recentSessions = memberSessions.filter((s) => s.date >= fromISO)
  const wins = recentMatches.filter((m) => m.result === 'W').length
  const losses = recentMatches.filter((m) => m.result === 'L').length
  const totalDecided = wins + losses
  const winRate = totalDecided ? Math.round((wins / totalDecided) * 100) : null

  return (
    <div className="px-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Dumbbell}
          label="近 12 個月練習"
          value={recentSessions.length}
          hint={recentSessions.length ? '次' : '還沒開練'}
        />
        <StatCard
          icon={Trophy}
          label="近 12 個月比賽"
          value={recentMatches.length}
          hint={
            recentMatches.length
              ? `${wins}勝${losses}敗${winRate != null ? ` · ${winRate}%` : ''}`
              : '還沒比賽'
          }
        />
      </div>

      <StatCard
        icon={Camera}
        label="累積影像"
        value={memberMedia.length}
        hint={memberMedia.length ? '張照片 / 段影片' : '尚未上傳任何媒體'}
      />

      <StreakHeatmap sessions={sessions} member={member} />

      <TrendChart sessions={sessions} items={items} member={member} />

      <RecentMatches matches={matches} member={member} onJump={onJumpMatches} />
    </div>
  )
}
