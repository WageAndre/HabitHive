import { CalendarDays, MoreHorizontal, UserRoundCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryLabel } from '../lib/format'
import type { Habit } from '../types'

const colorClasses = {
  amber: 'bg-amber-400', violet: 'bg-violet-400', emerald: 'bg-emerald-400', sky: 'bg-sky-400', rose: 'bg-rose-400',
}

export function HabitCard({ habit, onDelete }: { habit: Habit; onDelete?: (habit: Habit) => void }) {
  const assigned = Boolean(habit.assignedBy)
  return (
    <article className="panel flex min-w-0 flex-col overflow-hidden">
      <div className={`h-1.5 ${colorClasses[habit.color]}`} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><span className="badge bg-slate-100 text-slate-600">{categoryLabel(habit.category)}</span><h2 className="mt-3 truncate text-lg font-extrabold text-ink-900">{habit.title}</h2></div>
          {onDelete && <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600" onClick={() => onDelete(habit)} aria-label={`Delete ${habit.title}`}><MoreHorizontal className="h-5 w-5" /></button>}
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{habit.description || 'No description provided.'}</p>
        <div className="mt-5 space-y-2 text-sm text-slate-600">
          <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" /><span className="capitalize">{habit.frequency}</span> · {habit.targetValue} {habit.unit}</p>
          <p className="flex items-center gap-2"><UserRoundCheck className="h-4 w-4 text-slate-400" />{assigned ? 'Assigned by coach' : 'Personal habit'}</p>
        </div>
        <Link to={`/habits/${habit._id}`} className="btn-secondary mt-5 w-full">View details</Link>
      </div>
    </article>
  )
}

