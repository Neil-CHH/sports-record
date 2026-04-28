import { useState } from 'react'
import { Lock } from 'lucide-react'

const GATE_KEY = 'sports-record:unlocked'
const GATE_VALUE = '1'
const EXPECTED = import.meta.env.VITE_APP_PASSPHRASE || '20160115'

export default function PassphraseGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(GATE_KEY) === GATE_VALUE
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  if (unlocked) return children

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!EXPECTED) {
      setError('尚未設定通關密語 (VITE_APP_PASSPHRASE)')
      return
    }
    if (input.trim() === EXPECTED) {
      try { localStorage.setItem(GATE_KEY, GATE_VALUE) } catch { /* ignore */ }
      setUnlocked(true)
    } else {
      setError('密語不對，再試一次')
      setInput('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-cream via-cream to-warm/40">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs glass-strong rounded-iosLg p-6 space-y-4 animate-fadeIn"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-coral/15 flex items-center justify-center">
            <Lock className="w-6 h-6 text-coral" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-bold">雙寶運動紀錄</h1>
          <p className="text-sm text-mute text-center">請輸入家人通關密語</p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError('')
          }}
          className="ios-field text-center text-lg tracking-widest"
          autoFocus
          placeholder="••••••••"
          aria-label="通關密語"
        />
        {error && <p className="text-xs text-coralDark text-center">{error}</p>}
        <button type="submit" className="ios-btn-primary w-full">
          解鎖
        </button>
      </form>
    </div>
  )
}
