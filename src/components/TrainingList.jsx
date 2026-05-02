import { useState } from 'react'
import { Dumbbell, MapPin, Clock } from 'lucide-react'
import { formatDate } from '../utils/age.js'
import MediaStrip from './MediaStrip.jsx'
import CardActions from './CardActions.jsx'

const LocationLabel = ({ value }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="flex items-center gap-1 min-w-0 text-xs text-mute text-left"
      title={value}
    >
      <MapPin className="w-3 h-3 shrink-0" />
      <span className={expanded ? 'break-all' : 'truncate'}>{value}</span>
    </button>
  )
}

const KIND_LABEL = {
  rope_double: '二迴旋',
  run: '跑步',
  lift: '重訓',
  free: '自由'
}

const formatMetrics = (item) => {
  const m = item.metrics || {}
  switch (item.kind) {
    case 'rope_double': {
      const parts = []
      if (m.sets != null) parts.push(`${m.sets} 組`)
      if (m.reps != null) parts.push(`× ${m.reps} 次`)
      if (m.seconds != null) parts.push(`${m.seconds} 秒內`)
      return parts.join(' ')
    }
    case 'run':
      return [m.distanceM && `${m.distanceM} m`, m.seconds && `${m.seconds} 秒`].filter(Boolean).join(' · ')
    case 'lift':
      return [m.sets && `${m.sets} 組`, m.reps && `× ${m.reps}`, m.weightKg && `${m.weightKg} kg`].filter(Boolean).join(' ')
    default:
      return ''
  }
}

export default function TrainingList({ sessions, items, media, member, onEdit, onDelete }) {
  const list = sessions.filter((s) => s.memberId === member.id)

  if (!list.length) {
    return (
      <div className="px-5">
        <div className="glass rounded-ios p-8 text-center text-mute text-sm">
          還沒有練習紀錄,點下方 + 新增第一筆
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 space-y-3">
      {list.map((s) => {
        const sItems = items.filter((i) => i.sessionId === s.id)
        const mediaForSession = (media || []).filter(
          (x) => x.ownerType === 'training_session' && x.ownerId === s.id
        )
        return (
          <div key={s.id} className="glass rounded-ios p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Dumbbell className="w-4 h-4 text-coralDark shrink-0" />
                <span className="text-sm font-semibold tabular-nums shrink-0">{formatDate(s.date)}</span>
                {s.location && <LocationLabel value={s.location} />}
                {s.durationMin != null && (
                  <span className="flex items-center gap-1 shrink-0 text-xs text-mute">
                    <Clock className="w-3 h-3" />
                    {s.durationMin} 分
                  </span>
                )}
              </div>
              <CardActions
                onEdit={() => onEdit(s)}
                onDelete={() => onDelete(s)}
                confirmText={`刪除「${formatDate(s.date)}」這筆練習?項目跟附件都會一起刪除。`}
              />
            </div>
            {sItems.length > 0 && (
              <ul className="mt-2 space-y-1">
                {sItems.map((it) => (
                  <li key={it.id} className="text-sm flex items-baseline gap-2">
                    <span className="text-xs text-mute w-12 shrink-0">{KIND_LABEL[it.kind] || it.kind}</span>
                    <span className="font-medium flex-1 leading-snug">
                      {it.kind === 'free' ? it.label : (it.label || KIND_LABEL[it.kind])}
                    </span>
                    {it.kind !== 'free' && (
                      <span className="ml-auto tabular-nums text-mute text-xs">{formatMetrics(it)}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {s.note && <p className="text-xs text-mute mt-2 leading-relaxed">{s.note}</p>}
            <MediaStrip media={mediaForSession} />
          </div>
        )
      })}
    </div>
  )
}
