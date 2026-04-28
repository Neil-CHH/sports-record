import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'

export default function MemberEditModal({ open, members, onClose, onSave }) {
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
          <h2 className="text-lg font-semibold">編輯成員</h2>
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
        </div>
      </div>
    </div>
  )
}
