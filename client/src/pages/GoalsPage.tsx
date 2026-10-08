import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { api, getErrorMessage } from '../lib/api'
import { formatDate, todayKey } from '../lib/format'
import type { GoalItem } from '../types'

const goalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100),
  description: z.string().max(400),
  metric: z.enum(['completion_rate', 'streak', 'check_ins']),
  target: z.number().min(1, 'Target must be at least 1'),
  period: z.enum(['weekly', 'monthly', 'custom']),
  startDate: z.string().min(1),
  endDate: z.string().min(1, 'End date is required'),
})
type GoalValues = z.infer<typeof goalSchema>

export function GoalsPage() {
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleting, setDeleting] = useState(false)
  const query = useApi<GoalItem[]>(async () => (await api.get<{ goals: GoalItem[] }>('/goals')).data.goals, [])
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GoalValues>({ resolver: zodResolver(goalSchema), defaultValues: { title: '', description: '', metric: 'completion_rate', target: 85, period: 'weekly', startDate: todayKey(), endDate: '' } })

  const create = async (values: GoalValues) => {
    try { await api.post('/goals', values); toast.success('Goal created'); reset(); setShowForm(false); await query.reload() }
    catch (error) { toast.error(getErrorMessage(error)) }
  }
  const markAchieved = async (id: string) => {
    try { await api.patch(`/goals/${id}/status`, { status: 'achieved' }); toast.success('Goal marked achieved'); await query.reload() }
    catch (error) { toast.error(getErrorMessage(error)) }
  }
  const remove = async () => {
    setDeleting(true)
    try { await api.delete(`/goals/${deleteId}`); toast.success('Goal deleted'); setDeleteId(''); await query.reload() }
    catch (error) { toast.error(getErrorMessage(error)) } finally { setDeleting(false) }
  }

  return (
    <>
      <PageHeader eyebrow="Targets with purpose" title="Goals" description="Turn your routine into a measurable outcome with a clear finish line." action={<button className="btn-primary" onClick={() => setShowForm((value) => !value)}>{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? 'Close form' : 'New goal'}</button>} />
      {showForm && <form className="panel-pad mb-6 space-y-5" onSubmit={handleSubmit(create)} noValidate><h2 className="text-lg font-extrabold text-ink-900">Create a measurable goal</h2><div><label className="label" htmlFor="goal-title">Goal title</label><input id="goal-title" className="input" {...register('title')} />{errors.title && <p className="field-error">{errors.title.message}</p>}</div><div><label className="label" htmlFor="goal-description">Description</label><textarea id="goal-description" className="textarea" {...register('description')} /></div><div className="grid gap-5 sm:grid-cols-3"><div><label className="label" htmlFor="metric">Metric</label><select id="metric" className="select" {...register('metric')}><option value="completion_rate">Completion rate (%)</option><option value="streak">Streak (days)</option><option value="check_ins">Check-ins</option></select></div><div><label className="label" htmlFor="target">Target</label><input id="target" type="number" min="1" className="input" {...register('target', { valueAsNumber: true })} />{errors.target && <p className="field-error">{errors.target.message}</p>}</div><div><label className="label" htmlFor="period">Period</label><select id="period" className="select" {...register('period')}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom</option></select></div></div><div className="grid gap-5 sm:grid-cols-2"><div><label className="label" htmlFor="goal-start">Start date</label><input id="goal-start" type="date" className="input" {...register('startDate')} /></div><div><label className="label" htmlFor="goal-end">End date</label><input id="goal-end" type="date" className="input" {...register('endDate')} />{errors.endDate && <p className="field-error">{errors.endDate.message}</p>}</div></div><div className="flex justify-end"><button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create goal'}</button></div></form>}
      {query.loading ? <LoadingState label="Loading goals…" /> : query.error ? <ErrorState message={query.error} onRetry={query.reload} /> : !query.data?.length ? <EmptyState title="No goals yet" description="Set a completion, streak, or check-in goal to focus your next milestone." action={<button className="btn-primary" onClick={() => setShowForm(true)}>Create goal</button>} /> : <div className="grid gap-5 lg:grid-cols-2">{query.data.map(({ goal, progress }) => <article key={goal._id} className="panel-pad"><div className="flex items-start justify-between gap-4"><div><span className={`badge ${goal.status === 'achieved' ? 'bg-emerald-50 text-emerald-700' : goal.status === 'active' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>{goal.status}</span><h2 className="mt-3 text-lg font-extrabold text-ink-900">{goal.title}</h2></div><button className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => setDeleteId(goal._id)} aria-label={`Delete ${goal.title}`}><Trash2 className="h-5 w-5" /></button></div><p className="mt-2 text-sm text-slate-500">{goal.description || `Target ${goal.target} ${goal.metric.replace('_', ' ')}`}</p><div className="mt-5"><div className="mb-2 flex justify-between text-sm"><span className="font-bold text-slate-600">{progress.current} of {progress.target}</span><strong>{progress.percentage}%</strong></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-honey-500" style={{ width: `${progress.percentage}%` }} /></div></div><div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4"><p className="text-xs text-slate-500">Ends {formatDate(goal.endDate)}</p>{goal.status === 'active' && <button className="inline-flex items-center gap-1.5 text-sm font-bold text-success-500" onClick={() => void markAchieved(goal._id)}><CheckCircle2 className="h-4 w-4" /> Mark achieved</button>}</div></article>)}</div>}
      <ConfirmDialog open={Boolean(deleteId)} title="Delete this goal?" description="This removes the goal but leaves your habits and check-ins untouched." busy={deleting} onConfirm={() => void remove()} onClose={() => setDeleteId('')} />
    </>
  )
}

