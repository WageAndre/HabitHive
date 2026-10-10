import { Handshake, X } from 'lucide-react'
import type { Relationship } from '../types'

interface CoachInvitationCardProps {
  invitation: Relationship
  onAccept: (id: string) => void
  onCancel: (id: string) => void
}

export function CoachInvitationCard({ invitation, onAccept, onCancel }: CoachInvitationCardProps) {
  return (
    <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500 text-white">
          <Handshake />
        </span>
        <div>
          <h2 className="font-extrabold text-ink-900">Coach invitation from {invitation.coach.name}</h2>
          <p className="mt-1 text-sm text-slate-600">Accept to let this coach assign habits and review your progress.</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <button className="btn-secondary" onClick={() => onCancel(invitation._id)}>
          <X className="h-4 w-4" /> Cancel invitation
        </button>
        <button className="btn-dark" onClick={() => onAccept(invitation._id)}>Accept invitation</button>
      </div>
    </section>
  )
}
