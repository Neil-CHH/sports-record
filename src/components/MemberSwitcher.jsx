import { Pencil } from 'lucide-react'
import { formatAge } from '../utils/age.js'

const MemberPill = ({ member, active, onClick }) => {
  const accentRing = member.color === 'sky' ? 'ring-sky' : 'ring-coral'
  const accentBg = member.color === 'sky' ? 'bg-sky/15' : 'bg-coral/15'
  const accentText = member.color === 'sky' ? 'text-skyDark' : 'text-coralDark'

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pr-4 pl-1 py-1 rounded-full transition ${
        active ? `glass-strong ring-2 ${accentRing}` : 'opacity-60 hover:opacity-100'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-base font-semibold ${accentBg} ${accentText}`}
      >
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          member.name.slice(0, 1)
        )}
      </div>
      <div className="text-left leading-tight">
        <div className="text-sm font-semibold text-ink">{member.name}</div>
        <div className="text-[11px] text-mute">{formatAge(member.birthday)}</div>
      </div>
    </button>
  )
}

export default function MemberSwitcher({ members, activeId, onSelect, onEdit }) {
  return (
    <div className="flex items-center justify-between gap-2 px-5 py-3">
      <div className="flex items-center gap-2">
        {members.map((m) => (
          <MemberPill key={m.id} member={m} active={m.id === activeId} onClick={() => onSelect(m.id)} />
        ))}
      </div>
      <button
        onClick={onEdit}
        className="p-2.5 rounded-full bg-white/70 border border-warm text-mute hover:text-ink transition"
        aria-label="編輯成員"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  )
}
