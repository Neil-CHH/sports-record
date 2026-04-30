import { useMemo } from 'react'
import { Smile } from 'lucide-react'
import DentalCard from './DentalCard.jsx'
import EmptyState from '../EmptyState.jsx'

export default function DentalList({ records, member, onEdit, onDelete }) {
  const sorted = useMemo(
    () =>
      records
        .filter((r) => r.memberId === member.id)
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [records, member.id]
  )

  if (sorted.length === 0) {
    return <EmptyState name={member.name} accent="dental" icon={Smile} />
  }

  return (
    <div className="relative px-5 pb-10">
      <div className="absolute left-[calc(1.25rem+0.25rem)] top-8 bottom-8 w-[2px] bg-gradient-to-b from-warm via-warm to-transparent" />
      <div className="space-y-5 pt-2">
        {sorted.map((r) => (
          <DentalCard
            key={r.id}
            record={r}
            member={member}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
