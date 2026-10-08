import { ArrowLeft, CalendarDays, Edit3, Target, UserRoundCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { categoryLabel, formatDate } from '../lib/format'
import type { CheckIn, Habit, User } from '../types'

export function HabitDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const query = useApi<{ habit: Habit; checkIns: CheckIn[] }>(async () => {
    const habit = (await api.get<{ habit: Habit }>(`/habits/${id}`)).data.habit
    const ownerId = typeof habit.owner === 'string' ? habit.owner : habit.owner._id
    const suffix = user?.role === 'coach' ? `&traineeId=${ownerId}` : ''
    const checkIns = (await api.get<{ checkIns: CheckIn[] }>(`/check-ins?habitId=${id}${suffix}`)).data.checkIns
    return { habit, checkIns }
  }, [id, user?.role])
  if (query.loading) return <LoadingState label="Loading habit details…" />
  if (query.error || !query.data) return <ErrorState message={query.error} onRetry={query.reload} />
  const { habit, checkIns } = query.data
  const assignedBy = typeof habit.assignedBy === 'object' ? habit.assignedBy : null
  const canEdit = assignedBy ? user?._id === assignedBy._id : user?.role === 'trainee'
  const back = user?.role === 'coach' && typeof habit.owner === 'object' ? `/trainees/${(habit.owner as User)._id}` : '/habits'

  return (
    <>
      <Link to={back} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <PageHeader eyebrow={categoryLabel(habit.category)} title={habit.title} description={habit.description || 'No description provided.'} action={canEdit ? <Link to={`/habits/${habit._id}/edit`} className="btn-secondary"><Edit3 className="h-4 w-4" /> Edit</Link> : undefined} />
      <section className="grid gap-5 md:grid-cols-3">
        <div className="panel-pad"><Target className="h-5 w-5 text-honey-600" /><p className="mt-4 text-sm font-bold text-slate-500">Target</p><p className="mt-1 text-xl font-black text-ink-900">{habit.targetValue} {habit.unit}</p></div>
        <div className="panel-pad"><CalendarDays className="h-5 w-5 text-violet-600" /><p className="mt-4 text-sm font-bold text-slate-500">Schedule</p><p className="mt-1 text-xl font-black text-ink-900 capitalize">{habit.frequency}</p></div>
        <div className="panel-pad"><UserRoundCheck className="h-5 w-5 text-sky-600" /><p className="mt-4 text-sm font-bold text-slate-500">Source</p><p className="mt-1 text-xl font-black text-ink-900">{assignedBy ? `Coach ${assignedBy.name}` : 'Personal'}</p></div>
      </section>
      <section className="panel-pad mt-6"><div className="mb-5"><h2 className="text-lg font-extrabold text-ink-900">Recent check-ins</h2><p className="text-sm text-slate-500">Latest recorded activity for this habit</p></div>{checkIns.length === 0 ? <EmptyState title="No check-ins yet" description="The first completion will appear here." /> : <div className="divide-y divide-slate-200">{checkIns.slice(0, 12).map((checkIn) => <div key={checkIn._id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-bold text-ink-900">{formatDate(checkIn.date, 'EEEE, MMM d')}</p><p className="text-sm text-slate-500">{checkIn.value} {habit.unit}{checkIn.note ? ` · ${checkIn.note}` : ''}</p></div><span className={`badge ${checkIn.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{checkIn.status}</span></div>)}</div>}</section>
    </>
  )
}
