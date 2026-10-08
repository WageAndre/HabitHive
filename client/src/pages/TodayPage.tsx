import { Check, CheckCircle2, Circle, Flame } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { api, getErrorMessage } from '../lib/api'
import { formatDate, todayKey } from '../lib/format'
import type { CheckIn, Habit } from '../types'

interface DailyItem { habit: Habit; checkIn: CheckIn | null }

export function TodayPage() {
  const date = todayKey()
  const [workingId, setWorkingId] = useState('')
  const query = useApi<{ date: string; items: DailyItem[] }>(async () => {
    const { data } = await api.get(`/check-ins/daily/${date}`)
    return data
  }, [date])

  const toggle = async (item: DailyItem) => {
    setWorkingId(item.habit._id)
    try {
      if (item.checkIn) {
        await api.delete(`/check-ins/${item.checkIn._id}`)
        toast.success(`${item.habit.title} marked incomplete`)
      } else {
        await api.post('/check-ins', { habitId: item.habit._id, date, status: 'completed', value: item.habit.targetValue })
        toast.success('Check-in saved')
      }
      await query.reload()
    } catch (error) { toast.error(getErrorMessage(error)) } finally { setWorkingId('') }
  }

  if (query.loading) return <LoadingState label="Preparing today’s routine…" />
  if (query.error || !query.data) return <ErrorState message={query.error} onRetry={query.reload} />
  const completed = query.data.items.filter((item) => item.checkIn?.status === 'completed').length
  const total = query.data.items.length
  const rate = total ? Math.round((completed / total) * 100) : 0

  return (
    <>
      <PageHeader eyebrow={formatDate(date, 'EEEE, MMMM d')} title="Today’s habits" description="Check in honestly. Consistency grows from showing up, not perfection." />
      <section className="mb-6 overflow-hidden rounded-2xl bg-ink-900 p-5 text-white shadow-panel sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-slate-400">Daily completion</p><p className="mt-1 text-3xl font-black">{completed} of {total} complete</p><p className="mt-2 flex items-center gap-2 text-sm text-honey-300"><Flame className="h-4 w-4" /> Every check-in counts toward your streak</p></div><div className="flex items-center gap-4"><div className="h-3 w-40 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-honey-500 transition-all" style={{ width: `${rate}%` }} /></div><strong className="text-xl">{rate}%</strong></div></div>
      </section>
      {total === 0 ? <EmptyState title="Nothing scheduled yet" description="Create a habit and it will appear in your daily routine." /> : (
        <div className="space-y-3">
          {query.data.items.map((item) => {
            const done = item.checkIn?.status === 'completed'
            return (
              <article key={item.habit._id} className={`panel flex items-center gap-4 p-4 transition sm:p-5 ${done ? 'border-success-400/50 bg-success-400/5' : ''}`}>
                <button className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition ${done ? 'bg-success-500 text-white' : 'border-2 border-slate-300 text-slate-300 hover:border-honey-500 hover:text-honey-500'}`} onClick={() => void toggle(item)} disabled={workingId === item.habit._id} aria-label={done ? `Mark ${item.habit.title} incomplete` : `Complete ${item.habit.title}`}>{done ? <Check className="h-6 w-6" /> : <Circle className="h-6 w-6" />}</button>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className={`font-extrabold ${done ? 'text-slate-500 line-through' : 'text-ink-900'}`}>{item.habit.title}</h2>{item.habit.assignedBy && <span className="badge bg-violet-50 text-violet-700">Coach assigned</span>}</div><p className="mt-1 text-sm text-slate-500">Target: {item.habit.targetValue} {item.habit.unit}</p></div>
                {done && <CheckCircle2 className="hidden h-5 w-5 text-success-500 sm:block" />}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

