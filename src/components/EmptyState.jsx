import { Sprout } from 'lucide-react'

const ACCENT_BG = {
  growth: 'bg-growth/15 text-growth',
  vision: 'bg-sky/15 text-skyDark',
  dental: 'bg-dental/15 text-dental',
  matches: 'bg-coral/15 text-coral',
  training: 'bg-amber/30 text-coralDark'
}

export default function EmptyState({ name, accent = 'growth', icon: Icon = Sprout, hint }) {
  const accentClass = ACCENT_BG[accent] || ACCENT_BG.growth
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center animate-fadeIn">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${accentClass}`}>
        <Icon className="w-8 h-8" strokeWidth={1.8} />
      </div>
      <h3 className="text-lg font-semibold mb-1.5">還沒有紀錄</h3>
      <p className="text-mute text-sm leading-relaxed">
        {hint || (
          <>
            點下方 + 按鈕
            <br />
            幫 {name} 記下第一筆吧
          </>
        )}
      </p>
    </div>
  )
}
