import { useState } from 'react'
import { Search, X } from 'lucide-react'

const ACCENTS = {
  growth: 'bg-growth text-white',
  vision: 'bg-sky text-white',
  dental: 'bg-dental text-white',
  matches: 'bg-coral text-white',
  training: 'bg-amber text-coral',
  sports: 'bg-coral text-white',
  health: 'bg-amber text-coral'
}

export default function SubTabs({
  items,
  active,
  onChange,
  searchable = false,
  searchPlaceholder = '搜尋…',
  query = '',
  onQueryChange
}) {
  const [open, setOpen] = useState(Boolean(query))

  const close = () => {
    setOpen(false)
    if (onQueryChange) onQueryChange('')
  }

  if (searchable && open) {
    return (
      <div className="flex items-center gap-2 px-5 py-3">
        <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-warm">
          <Search className="w-4 h-4 text-mute shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close()
            }}
            placeholder={searchPlaceholder}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-mute"
          />
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="關閉搜尋"
          className="w-8 h-8 rounded-full bg-white/70 border border-warm flex items-center justify-center shrink-0"
        >
          <X className="w-4 h-4 text-mute" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-5 py-3">
      <div className="flex gap-1.5 overflow-x-auto flex-1">
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
      {searchable && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="搜尋"
          className="w-8 h-8 rounded-full bg-white/70 border border-warm flex items-center justify-center shrink-0 text-mute hover:text-ink"
        >
          <Search className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
