import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { formatDate } from '../utils/age.js'
import MediaStrip from './MediaStrip.jsx'
import CardActions from './CardActions.jsx'

const ResultPill = ({ result }) => {
  if (!result) return null
  const isW = result === 'W'
  return (
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
        isW ? 'bg-coral text-white' : 'bg-mute/30 text-mute'
      }`}
    >
      {isW ? '勝' : '敗'}
    </span>
  )
}

const formatScores = (scores) => {
  if (!Array.isArray(scores) || !scores.length) return ''
  return scores.map((s) => `${s.us}-${s.them}`).join(' / ')
}

const RoundPill = ({ round }) => {
  if (!round) return null
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warm text-ink/70 shrink-0">
      {round}
    </span>
  )
}

const MatchTitle = ({ name }) => {
  const [expanded, setExpanded] = useState(false)
  const display = name || '練習賽'
  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className={`text-left text-sm font-semibold leading-snug min-w-0 flex-1 ${
        expanded ? '' : 'truncate'
      }`}
      title={display}
    >
      {display}
    </button>
  )
}

export default function MatchList({ matches, media, member, onEdit, onDelete }) {
  const list = matches.filter((m) => m.memberId === member.id)

  if (!list.length) {
    return (
      <div className="px-5">
        <div className="glass rounded-ios p-8 text-center text-mute text-sm">
          還沒有比賽紀錄,點下方 + 新增第一場
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 space-y-3">
      {list.map((m) => {
        const mediaForMatch = (media || []).filter(
          (x) => x.ownerType === 'match' && x.ownerId === m.id
        )
        return (
          <div key={m.id} className="glass rounded-ios p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <Trophy className="w-4 h-4 text-coralDark shrink-0 mt-0.5" />
                <MatchTitle name={m.eventName} />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ResultPill result={m.result} />
                <CardActions
                  onEdit={() => onEdit(m)}
                  onDelete={() => onDelete(m)}
                  confirmText={`刪除「${m.eventName || '這場比賽'}」?附件也會一起刪除。`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-mute mb-2 ml-6">
              <span>{formatDate(m.date)}</span>
              <RoundPill round={m.round} />
            </div>
            {(m.opponentSchool || m.opponentName) && (
              <div className="text-sm">
                對 <span className="font-medium">{m.opponentSchool}</span>
                {m.opponentName && <span className="text-mute"> · {m.opponentName}</span>}
              </div>
            )}
            {m.scores?.length > 0 && (
              <div className="text-sm font-medium mt-1 tabular-nums">{formatScores(m.scores)}</div>
            )}
            {m.note && <p className="text-xs text-mute mt-2 leading-relaxed">{m.note}</p>}
            <MediaStrip media={mediaForMatch} />
          </div>
        )
      })}
    </div>
  )
}
