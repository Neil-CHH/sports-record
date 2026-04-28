import { Home, Trophy, Dumbbell, Plus } from 'lucide-react'

const TabBtn = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition ${
      active ? 'text-coral' : 'text-mute'
    }`}
  >
    <Icon className="w-6 h-6" strokeWidth={active ? 2.2 : 1.8} />
    <span className={`text-[11px] ${active ? 'font-semibold' : ''}`}>{label}</span>
  </button>
)

export default function BottomTabBar({ tab, onTabChange, onAdd, addLabel = '新增紀錄' }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md relative">
        {/* FAB — 浮在 bar 上方,不擠壓 tab */}
        <button
          onClick={onAdd}
          className="absolute left-1/2 -translate-x-1/2 -top-16 w-14 h-14 rounded-full bg-amber text-coral shadow-iosLg flex items-center justify-center active:scale-95 transition ring-4 ring-cream/80"
          aria-label={addLabel}
        >
          <Plus className="w-7 h-7" strokeWidth={2.4} />
        </button>

        <div className="glass-strong border-t border-white/60 rounded-t-iosLg">
          <div className="flex safe-bottom">
            <TabBtn
              active={tab === 'dashboard'}
              icon={Home}
              label="總覽"
              onClick={() => onTabChange('dashboard')}
            />
            <TabBtn
              active={tab === 'matches'}
              icon={Trophy}
              label="比賽"
              onClick={() => onTabChange('matches')}
            />
            <TabBtn
              active={tab === 'training'}
              icon={Dumbbell}
              label="練習"
              onClick={() => onTabChange('training')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
