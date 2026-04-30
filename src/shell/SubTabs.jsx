const ACCENTS = {
  growth: 'bg-growth text-white',
  vision: 'bg-sky text-white',
  dental: 'bg-dental text-white',
  matches: 'bg-coral text-white',
  training: 'bg-amber text-coral',
  sports: 'bg-coral text-white',
  health: 'bg-amber text-coral'
}

export default function SubTabs({ items, active, onChange }) {
  return (
    <div className="flex gap-1.5 px-5 py-3 overflow-x-auto">
      {items.map((it) => {
        const isActive = it.key === active
        const accent = ACCENTS[it.key] || 'bg-coral text-white'
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className={`px-4 py-1.5 rounded-full text-sm transition shrink-0 ${
              isActive
                ? `${accent} font-semibold shadow-ios`
                : 'bg-white/70 text-mute border border-warm hover:text-ink'
            }`}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
