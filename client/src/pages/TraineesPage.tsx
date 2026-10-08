import { zodResolver } from '@hookform/resolvers/zod'
import { Archive, MailPlus, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Avatar } from '../components/Avatar'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { api, getErrorMessage } from '../lib/api'
import { formatDate } from '../lib/format'
import type { Relationship } from '../types'

const inviteSchema = z.object({ traineeEmail: z.string().email('Enter the trainee’s account email') })
type InviteValues = z.infer<typeof inviteSchema>

export function TraineesPage() {
  const query = useApi<Relationship[]>(async () => (await api.get<{ relationships: Relationship[] }>('/relationships')).data.relationships, [])
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<InviteValues>({ resolver: zodResolver(inviteSchema) })
  const invite = async (values: InviteValues) => {
    try { await api.post('/relationships', values); toast.success('Invitation sent'); reset(); await query.reload() }
    catch (error) { setError('root', { message: getErrorMessage(error) }) }
  }
  const archive = async (id: string) => {
    try { await api.patch(`/relationships/${id}/archive`); toast.success('Trainee relationship archived'); await query.reload() }
    catch (error) { toast.error(getErrorMessage(error)) }
  }

  const active = query.data?.filter((item) => item.status === 'active') || []
  const pending = query.data?.filter((item) => item.status === 'pending') || []
  return (
    <>
      <PageHeader eyebrow="Your coaching roster" title="Trainees" description="Connect with trainee accounts, assign routines, and review measurable progress." />
      <form className="panel-pad mb-6" onSubmit={handleSubmit(invite)} noValidate><div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-honey-500/15 text-honey-600"><MailPlus /></span><div><h2 className="font-extrabold text-ink-900">Invite a trainee</h2><p className="text-sm text-slate-500">They must already have a HabitHive trainee account.</p></div></div>{errors.root && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{errors.root.message}</p>}<div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="flex-1"><label className="sr-only" htmlFor="traineeEmail">Trainee email</label><input id="traineeEmail" type="email" className="input" placeholder="trainee@example.com" {...register('traineeEmail')} />{errors.traineeEmail && <p className="field-error">{errors.traineeEmail.message}</p>}</div><button className="btn-primary sm:self-start" disabled={isSubmitting}><UserPlus className="h-4 w-4" /> {isSubmitting ? 'Sending…' : 'Send invitation'}</button></div></form>
      {query.loading ? <LoadingState label="Loading your trainees…" /> : query.error ? <ErrorState message={query.error} onRetry={query.reload} /> : active.length === 0 ? <EmptyState title="No active trainees" description="Invite a trainee using the email on their HabitHive account." /> : <section><h2 className="mb-4 text-lg font-extrabold text-ink-900">Active trainees</h2><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{active.map((relationship) => <article key={relationship._id} className="panel-pad"><div className="flex items-center gap-3"><Avatar name={relationship.trainee.name} color={relationship.trainee.avatarColor} className="h-12 w-12" /><div className="min-w-0"><h3 className="truncate font-extrabold text-ink-900">{relationship.trainee.name}</h3><p className="truncate text-sm text-slate-500">{relationship.trainee.email}</p></div></div><p className="mt-4 line-clamp-2 min-h-10 text-sm text-slate-600">{relationship.trainee.bio || 'No trainee bio provided.'}</p><p className="mt-4 text-xs font-semibold text-slate-400">Coaching since {relationship.startedAt ? formatDate(relationship.startedAt) : formatDate(relationship.createdAt)}</p><div className="mt-5 flex gap-2"><Link to={`/trainees/${relationship.trainee._id}`} className="btn-dark flex-1">View progress</Link><button className="btn-secondary px-3" onClick={() => void archive(relationship._id)} aria-label={`Archive ${relationship.trainee.name}`}><Archive className="h-4 w-4" /></button></div></article>)}</div></section>}
      {pending.length > 0 && <section className="mt-8"><h2 className="mb-4 text-lg font-extrabold text-ink-900">Pending invitations</h2><div className="grid gap-3 md:grid-cols-2">{pending.map((relationship) => <div key={relationship._id} className="panel flex items-center gap-3 p-4"><Avatar name={relationship.trainee.name} color={relationship.trainee.avatarColor} /><div className="min-w-0 flex-1"><p className="truncate font-bold text-ink-900">{relationship.trainee.name}</p><p className="truncate text-sm text-slate-500">{relationship.trainee.email}</p></div><span className="badge bg-amber-50 text-amber-700">Pending</span></div>)}</div></section>}
    </>
  )
}

