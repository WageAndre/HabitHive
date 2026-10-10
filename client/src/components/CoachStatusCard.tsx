import { UserRoundCheck } from 'lucide-react'
import { Avatar } from './Avatar'
import { formatDate } from '../lib/format'
import type { Relationship } from '../types'

interface CoachStatusCardProps {
  relationship: Relationship | null
  hasPendingInvitation: boolean
}

export function CoachStatusCard({ relationship, hasPendingInvitation }: CoachStatusCardProps) {
  return (
    <section
      className={`panel-pad mb-6 flex flex-col gap-4 sm:flex-row sm:items-center ${relationship ? 'border-emerald-200 bg-emerald-50/50' : ''}`}
      aria-label="Coach status"
    >
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${relationship ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
        <UserRoundCheck className="h-6 w-6" />
      </span>
      {relationship ? (
        <>
          <Avatar name={relationship.coach.name} color={relationship.coach.avatarColor} className="h-12 w-12" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-extrabold text-ink-900">{relationship.coach.name}</h2>
              <span className="badge bg-emerald-100 text-emerald-700">Active coach</span>
            </div>
            <p className="truncate text-sm text-slate-500">{relationship.coach.email}</p>
            <p className="mt-1 text-sm text-slate-600">{relationship.coach.bio || 'Your coach can assign habits and review your progress.'}</p>
          </div>
          {relationship.startedAt && (
            <p className="shrink-0 text-xs font-semibold text-slate-500">Connected since {formatDate(relationship.startedAt)}</p>
          )}
        </>
      ) : (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-extrabold text-ink-900">No active coach</h2>
            <span className="badge bg-slate-100 text-slate-600">Not connected</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {hasPendingInvitation
              ? 'Accept a pending invitation above to connect with a coach.'
              : 'Ask a coach to invite you using the email address on your HabitHive account.'}
          </p>
        </div>
      )}
    </section>
  )
}
