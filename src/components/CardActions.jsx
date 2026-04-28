import { Pencil, Trash2 } from 'lucide-react'

export default function CardActions({ onEdit, onDelete, confirmText = '確定刪除這筆紀錄嗎?' }) {
  const handleDelete = () => {
    if (typeof window !== 'undefined' && window.confirm(confirmText)) {
      onDelete()
    }
  }
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="p-1.5 rounded-full text-mute hover:text-coral hover:bg-white/70 transition"
        aria-label="編輯"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="p-1.5 rounded-full text-mute hover:text-coralDark hover:bg-white/70 transition"
        aria-label="刪除"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
