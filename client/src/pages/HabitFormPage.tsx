import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { ErrorState, LoadingState } from '../components/Feedback'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { api, getErrorMessage } from '../lib/api'
import { todayKey } from '../lib/format'
import { colorSwatches } from '../lib/theme'
import type { Habit } from '../types'

const habitSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(80),
  description: z.string().max(400),
  category: z.enum(['fitness', 'nutrition', 'mindfulness', 'learning', 'sleep', 'productivity', 'other']),
  frequency: z.enum(['daily', 'weekdays', 'custom']),
  targetDays: z.array(z.number()).min(1, 'Select at least one day'),
  targetValue: z.number().min(1, 'Target must be at least 1').max(100000),
  unit: z.string().min(1, 'Unit is required').max(24),
  color: z.enum(['amber', 'violet', 'emerald', 'sky', 'rose']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string(),
})
type HabitValues = z.infer<typeof habitSchema>
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function HabitFormPage({ assignment = false }: { assignment?: boolean }) {
  const { id, traineeId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const query = useApi<Habit | null>(async () => id ? (await api.get<{ habit: Habit }>(`/habits/${id}`)).data.habit : null, [id])
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<HabitValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: { title: '', description: '', category: 'fitness', frequency: 'daily', targetDays: [0, 1, 2, 3, 4, 5, 6], targetValue: 1, unit: 'time', color: 'amber', startDate: todayKey(), endDate: '' },
  })
  const frequency = watch('frequency')
  const selectedDays = watch('targetDays')

  useEffect(() => {
    if (!query.data) return
    reset({
      title: query.data.title, description: query.data.description, category: query.data.category,
      frequency: query.data.frequency, targetDays: query.data.targetDays, targetValue: query.data.targetValue,
      unit: query.data.unit, color: query.data.color, startDate: query.data.startDate.slice(0, 10),
      endDate: query.data.endDate?.slice(0, 10) || '',
    })
  }, [query.data, reset])

  const submit = async (values: HabitValues) => {
    const payload = { ...values, endDate: values.endDate || null, targetDays: values.frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : values.frequency === 'weekdays' ? [1, 2, 3, 4, 5] : values.targetDays }
    try {
      if (assignment) await api.post('/habits/assign', { ...payload, traineeId })
      else if (editing) await api.put(`/habits/${id}`, payload)
      else await api.post('/habits', payload)
      toast.success(assignment ? 'Habit assigned' : editing ? 'Habit updated' : 'Habit created')
      const ownerId = query.data && typeof query.data.owner === 'object' ? query.data.owner._id : null
      navigate(assignment ? `/trainees/${traineeId}` : user?.role === 'coach' && ownerId ? `/trainees/${ownerId}` : '/habits')
    } catch (error) { toast.error(getErrorMessage(error)) }
  }

  if (editing && query.loading) return <LoadingState label="Loading habit…" />
  if (editing && query.error) return <ErrorState message={query.error} onRetry={query.reload} />
  const editOwnerId = query.data && typeof query.data.owner === 'object' ? query.data.owner._id : null
  const backTo = assignment ? `/trainees/${traineeId}` : user?.role === 'coach' && editOwnerId ? `/trainees/${editOwnerId}` : '/habits'

  return (
    <>
      <Link to={backTo} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <PageHeader eyebrow={assignment ? 'Coach assignment' : 'Routine builder'} title={assignment ? 'Assign a habit' : editing ? 'Edit habit' : 'Create a habit'} description={assignment ? 'Set a clear, measurable routine for this trainee.' : 'Make the target specific enough to check in without guessing.'} />
      <form className="panel-pad max-w-3xl space-y-6" onSubmit={handleSubmit(submit)} noValidate>
        <div><label className="label" htmlFor="title">Habit name</label><input id="title" className="input" placeholder="e.g. Morning mobility" {...register('title')} />{errors.title && <p className="field-error">{errors.title.message}</p>}</div>
        <div><label className="label" htmlFor="description">Description</label><textarea id="description" className="textarea" placeholder="What should be done and why?" {...register('description')} />{errors.description && <p className="field-error">{errors.description.message}</p>}</div>
        <div className="grid gap-5 sm:grid-cols-2"><div><label className="label" htmlFor="category">Category</label><select id="category" className="select" {...register('category')}><option value="fitness">Fitness</option><option value="nutrition">Nutrition</option><option value="mindfulness">Mindfulness</option><option value="learning">Learning</option><option value="sleep">Sleep</option><option value="productivity">Productivity</option><option value="other">Other</option></select></div><div><label className="label" htmlFor="frequency">Frequency</label><select id="frequency" className="select" {...register('frequency')}><option value="daily">Every day</option><option value="weekdays">Weekdays</option><option value="custom">Custom days</option></select></div></div>
        {frequency === 'custom' && <fieldset><legend className="label">Scheduled days</legend><div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{days.map((day, index) => { const active = selectedDays.includes(index); return <button key={day} type="button" className={`min-h-11 rounded-xl border text-sm font-bold ${active ? 'border-honey-500 bg-honey-500 text-ink-950' : 'border-slate-300 text-slate-600'}`} onClick={() => setValue('targetDays', active ? selectedDays.filter((value) => value !== index) : [...selectedDays, index], { shouldValidate: true })}>{day}</button> })}</div>{errors.targetDays && <p className="field-error">{errors.targetDays.message}</p>}</fieldset>}
        <div className="grid gap-5 sm:grid-cols-2"><div><label className="label" htmlFor="targetValue">Target amount</label><input id="targetValue" type="number" min="1" className="input" {...register('targetValue', { valueAsNumber: true })} />{errors.targetValue && <p className="field-error">{errors.targetValue.message}</p>}</div><div><label className="label" htmlFor="unit">Unit</label><input id="unit" className="input" placeholder="minutes, glasses, pages" {...register('unit')} />{errors.unit && <p className="field-error">{errors.unit.message}</p>}</div></div>
        <div className="grid gap-5 sm:grid-cols-2"><div><label className="label" htmlFor="startDate">Start date</label><input id="startDate" type="date" className="input" {...register('startDate')} />{errors.startDate && <p className="field-error">{errors.startDate.message}</p>}</div><div><label className="label" htmlFor="endDate">End date <span className="font-normal text-slate-400">(optional)</span></label><input id="endDate" type="date" className="input" {...register('endDate')} /></div></div>
        <fieldset><legend className="label">Color</legend><div className="flex flex-wrap gap-3">{(['amber', 'violet', 'emerald', 'sky', 'rose'] as const).map((color) => <label key={color} className="cursor-pointer"><input type="radio" value={color} className="peer sr-only" {...register('color')} /><span className={`block h-10 w-10 rounded-xl border-4 border-white shadow peer-checked:ring-3 peer-checked:ring-ink-900 ${colorSwatches[color]}`}><span className="sr-only">{color}</span></span></label>)}</div></fieldset>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end"><Link to={backTo} className="btn-secondary">Cancel</Link><button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : <><Save className="h-4 w-4" /> {assignment ? 'Assign habit' : 'Save habit'}</>}</button></div>
      </form>
    </>
  )
}
