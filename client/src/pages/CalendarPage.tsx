import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ErrorState, LoadingState } from '../components/Feedback'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import type { CheckIn, Habit } from '../types'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const initialCalendarMonth = startOfMonth(new Date())

export function CalendarPage() {
  const [month, setMonth] = useState(initialCalendarMonth)
  const year = month.getFullYear()
  const monthNumber = month.getMonth() + 1
  const query = useApi<CheckIn[]>(async () => (await api.get<{ checkIns: CheckIn[] }>(`/analytics/calendar?year=${year}&month=${monthNumber}`)).data.checkIns, [year, monthNumber])
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }), [month])
  const byDate = useMemo(() => {
    const map = new Map<string, CheckIn[]>()
    ;(query.data || []).forEach((item) => { const key = item.date.slice(0, 10); map.set(key, [...(map.get(key) || []), item]) })
    return map
  }, [query.data])

  return (
    <>
      <PageHeader eyebrow="Your history" title="Habit calendar" description="Review when you showed up and spot gaps in your routine." />
      <section className="panel overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5"><button className="btn-secondary px-3" onClick={() => setMonth(subMonths(month, 1))} aria-label="Previous month"><ChevronLeft /></button><h2 className="text-lg font-black text-ink-900">{format(month, 'MMMM yyyy')}</h2><button className="btn-secondary px-3" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month"><ChevronRight /></button></header>
        {query.loading ? <div className="p-5"><LoadingState label="Loading calendar…" /></div> : query.error ? <div className="p-5"><ErrorState message={query.error} onRetry={query.reload} /></div> : <><div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">{weekdays.map((day) => <div key={day} className="px-1 py-3 text-center text-xs font-extrabold text-slate-500 sm:text-sm">{day}</div>)}</div><div className="grid grid-cols-7">{days.map((day) => { const key = format(day, 'yyyy-MM-dd'); const entries = byDate.get(key) || []; return <div key={key} className={`min-h-20 border-r border-b border-slate-100 p-1.5 sm:min-h-28 sm:p-2.5 ${isSameMonth(day, month) ? 'bg-white' : 'bg-slate-50 text-slate-300'}`}><span className="text-xs font-bold sm:text-sm">{format(day, 'd')}</span><div className="mt-2 space-y-1">{entries.slice(0, 3).map((entry) => { const habit = entry.habit as Habit; return <div key={entry._id} className="truncate rounded-md bg-emerald-50 px-1.5 py-1 text-[10px] font-bold text-emerald-700 sm:text-xs" title={habit.title}>{habit.title}</div> })}{entries.length > 3 && <p className="text-[10px] font-bold text-slate-400">+{entries.length - 3} more</p>}</div></div> })}</div></>}
      </section>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-emerald-100" /> Completed habit</span><span>{query.data?.length || 0} check-ins this month</span></div>
    </>
  )
}
