import { useEffect, useState } from 'react'
import { Check, X, Cloud, Loader2 } from 'lucide-react'
import { findStorageOrphans, removeFromStorageBatch } from '../utils/mediaUpload.js'

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

const CleanupSection = ({ media }) => {
  const [scanning, setScanning] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [result, setResult] = useState(null) // { orphans, totalOrphanBytes, totalAllFiles }
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  const scan = async () => {
    setScanning(true)
    setError('')
    setDone('')
    try {
      const r = await findStorageOrphans(media)
      setResult(r)
    } catch (err) {
      setError(err.message || '掃描失敗')
    } finally {
      setScanning(false)
    }
  }

  const clean = async () => {
    if (!result || !result.orphans.length) return
    if (!window.confirm(`要刪除 ${result.orphans.length} 個孤兒檔案(${fmtBytes(result.totalOrphanBytes)})嗎?此動作無法復原。`)) {
      return
    }
    setCleaning(true)
    setError('')
    try {
      const paths = result.orphans.map((o) => o.path)
      await removeFromStorageBatch(paths)
      setDone(`已清理 ${result.orphans.length} 個檔案,釋出 ${fmtBytes(result.totalOrphanBytes)}`)
      setResult({ orphans: [], totalOrphanBytes: 0, totalAllFiles: result.totalAllFiles - result.orphans.length })
    } catch (err) {
      setError(err.message || '清理失敗')
    } finally {
      setCleaning(false)
    }
  }

  return (
    <div className="glass rounded-ios p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Cloud className="w-4 h-4 text-coralDark" />
        <span className="text-sm font-semibold">雲端清理</span>
      </div>
      <p className="text-xs text-mute leading-relaxed">
        掃描 Supabase Storage,找出沒有對應紀錄的孤兒檔案(離線時刪除失敗、或表單取消後上傳的殘留)並刪除。已連結到比賽/練習的照片影片不會動到。
      </p>

      {!result && (
        <button
          type="button"
          onClick={scan}
          disabled={scanning}
          className="ios-btn-ghost w-full flex items-center justify-center gap-2"
        >
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
          {scanning ? '掃描中…' : '開始掃描'}
        </button>
      )}

      {result && (
        <div className="space-y-2">
          <div className="text-sm">
            掃了 <span className="font-bold tabular-nums">{result.totalAllFiles}</span> 個檔案,
            找到 <span className="font-bold tabular-nums text-coralDark">{result.orphans.length}</span> 個孤兒
            {result.orphans.length > 0 && (
              <span className="text-mute"> · 共 {fmtBytes(result.totalOrphanBytes)}</span>
            )}
          </div>
          {result.orphans.length > 0 ? (
            <button
              type="button"
              onClick={clean}
              disabled={cleaning}
              className="ios-btn-primary w-full flex items-center justify-center gap-2"
            >
              {cleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {cleaning ? '清理中…' : `清理 ${result.orphans.length} 個檔案`}
            </button>
          ) : (
            <p className="text-xs text-mute text-center">沒有需要清理的檔案 ✓</p>
          )}
          <button
            type="button"
            onClick={scan}
            disabled={scanning || cleaning}
            className="text-xs text-mute hover:text-coral block mx-auto mt-1"
          >
            重新掃描
          </button>
        </div>
      )}

      {done && <p className="text-xs text-coralDark text-center">{done}</p>}
      {error && <p className="text-xs text-coralDark text-center">{error}</p>}
    </div>
  )
}

export default function MemberEditModal({ open, members, media, onClose, onSave }) {
  const [drafts, setDrafts] = useState(members)

  useEffect(() => {
    if (open) setDrafts(members)
  }, [open, members])

  if (!open) return null

  const update = (id, patch) =>
    setDrafts((d) => d.map((m) => (m.id === id ? { ...m, ...patch } : m)))

  const submit = () => {
    drafts.forEach((m) => onSave(m.id, m))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-cream rounded-t-iosLg shadow-iosLg animate-slideUp safe-bottom">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-warm" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <button onClick={onClose} className="p-2 -m-2 text-mute hover:text-ink transition" aria-label="關閉">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold">編輯與設定</h2>
          <button onClick={submit} className="p-2 -m-2 text-coral font-semibold" aria-label="儲存">
            <Check className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-mute px-1">
            這個 app 跟「身高紀錄」共用成員資料,在那邊修改大頭貼也會同步過來。
          </p>
          {drafts.map((m) => {
            const accentBg = m.color === 'sky' ? 'bg-sky/15 text-skyDark' : 'bg-coral/15 text-coralDark'
            return (
              <div key={m.id} className="glass rounded-ios p-4 flex gap-4">
                <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-2xl font-semibold shrink-0 ${accentBg}`}>
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    m.name.slice(0, 1) || '?'
                  )}
                </div>
                <div className="flex-1 space-y-2.5">
                  <input
                    className="ios-field py-2.5 text-base"
                    placeholder="姓名"
                    value={m.name}
                    onChange={(e) => update(m.id, { name: e.target.value })}
                  />
                  <label className="block">
                    <span className="block text-xs text-mute mb-1 px-1">生日</span>
                    <input
                      className="ios-field py-2.5 text-base"
                      type="date"
                      value={m.birthday || ''}
                      onChange={(e) => update(m.id, { birthday: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            )
          })}

          <CleanupSection media={media || []} />
        </div>
      </div>
    </div>
  )
}
