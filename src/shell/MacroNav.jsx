import { Home, HeartPulse, Dumbbell, Plus } from 'lucide-react'

const MacroBtn = ({ active, icon: Icon, label, onClick, activeClass = 'text-ink' }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition ${
      active ? activeClass : 'text-mute'
    }`}
  >
    <Icon className="w-6 h-6" strokeWidth={active ? 2.2 : 1.8} />
    <span className={`text-[11px] ${active ? 'font-semibold' : ''}`}>{label}</span>
  </button>
)

const FAB_STYLES = {
  amber: 'bg-amber text-coral',
  coral: 'bg-coral text-white',
  growth: 'bg-growth text-white',
  vision: 'bg-sky text-white',
  dental: 'bg-dental text-white'
}

export default function MacroNav({
  macro,
  onMacroChange,
  onAdd,
  fabAccent = 'amber',
  showFab = true,
  addLabel = '新增'
}) {
  const fabStyle = FAB_STYLES[fabAccent] || FAB_STYLES.amber
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md relative">
        {showFab && (
          <button
            onClick={onAdd}
            className={`absolute left-1/2 -translate-x-1/2 -top-16 w-14 h-14 rounded-full ${fabStyle} shadow-iosLg flex items-center justify-center active:scale-95 transition ring-4 ring-cream/80`}
            aria-label={addLabel}
          >
            <Plus className="w-7 h-7" strokeWidth={2.4} />
          </button>
        )}
        <div className="glass-strong border-t border-white/60 rounded-t-iosLg">
          <div className="flex safe-bottom">
            <MacroBtn
              active={macro === 'overview'}
              icon={Home}
              label="總覽"
              onClick={() => onMacroChange('overview')}
            />
            <MacroBtn
              active={macro === 'health'}
              icon={HeartPulse}
              label="健康"
              activeClass="text-amberDark"
              onClick={() => onMacroChange('health')}
            />
            <MacroBtn
              active={macro === 'sports'}
              icon={Dumbbell}
              label="運動"
              activeClass="text-coral"
              onClick={() => onMacroChange('sports')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
