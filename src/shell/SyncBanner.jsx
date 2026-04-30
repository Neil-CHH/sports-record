import { CloudOff, RefreshCw } from 'lucide-react'

export default function SyncBanner({ state, retryNow, clearQueue }) {
  if (state.online && state.pendingCount === 0) return null
  return (
    <button
      type="button"
      onClick={state.online && state.pendingCount > 0 ? retryNow : undefined}
      onContextMenu={(e) => {
        if (state.pendingCount === 0) return
        e.preventDefault()
        if (
          window.confirm(
            `要捨棄 ${state.pendingCount} 筆待同步紀錄嗎?(只清前端 queue,已同步的雲端資料不受影響)`
          )
        ) {
          clearQueue()
        }
      }}
      className={`w-full px-5 py-2 text-xs flex items-center justify-center gap-2 ${
        !state.online ? 'bg-warm text-ink/80' : 'bg-amber/20 text-coralDark'
      }`}
    >
      {!state.online ? (
        <>
          <CloudOff className="w-3.5 h-3.5" />
          <span>
            離線模式
            {state.pendingCount > 0 ? ` · ${state.pendingCount} 筆待同步` : ''}
          </span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>同步中 · 還有 {state.pendingCount} 筆 · 點此重試</span>
        </>
      )}
    </button>
  )
}
