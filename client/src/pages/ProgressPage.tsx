import { Award, BarChart3, Flame, Target } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ErrorState, LoadingState } from '../components/Feedback'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { categoryLabel, formatDate } from '../lib/format'
import type { HabitStreak, Overview, WeeklyDay } from '../types'

interface CategoryStat { category: string; habits: number; completed: number }
interface SourceStat { source: string; habitCount: number; scheduled: number; completed: number; rate: number }
interface ProgressData { overview: Overview; weekly: WeeklyDay[]; streaks: HabitStreak[]; categories: CategoryStat[]; comparison: SourceStat[] }
const pieColors = ['#f5ad22', '#7c5ce5', '#20b96d', '#38bdf8', '#fb7185', '#64748b']

export function ProgressPage() {
  const query = useApi<ProgressData>(async () => {
    const [overview, weekly, streaks, categories, comparison] = await Promise.all([
      api.get<{ overview: Overview }>('/analytics/overview'), api.get<{ days: WeeklyDay[] }>('/analytics/weekly'),
      api.get<{ streaks: HabitStreak[] }>('/analytics/streaks'), api.get<{ categories: CategoryStat[] }>('/analytics/categories'),
      api.get<{ comparison: SourceStat[] }>('/analytics/source-comparison'),
    ])
    return { overview: overview.data.overview, weekly: weekly.data.days, streaks: streaks.data.streaks, categories: categories.data.categories, comparison: comparison.data.comparison }
  }, [])
  if (query.loading) return <LoadingState label="Calculating your analytics…" />
  if (query.error || !query.data) return <ErrorState message={query.error} onRetry={query.reload} />
  const { overview, weekly, streaks, categories, comparison } = query.data

  return (
    <>
      <PageHeader eyebrow="Evidence of consistency" title="Progress analytics" description="Your check-ins become patterns you can understand and improve." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Current streak" value={`${overview.currentStreak} days`} detail="Across completed days" icon={Flame} tone="amber" /><StatCard label="Longest streak" value={`${overview.longestStreak} days`} detail="Your personal best" icon={Award} tone="violet" /><StatCard label="Weekly completion" value={`${overview.week.rate}%`} detail={`${overview.week.completed}/${overview.week.scheduled} scheduled`} icon={BarChart3} tone="emerald" /><StatCard label="Active habits" value={overview.activeHabits} detail="Currently being tracked" icon={Target} tone="sky" /></section>
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="panel-pad min-w-0"><h2 className="text-lg font-extrabold text-ink-900">Daily completion</h2><p className="text-sm text-slate-500">Your last seven scheduled days</p><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={weekly} margin={{ left: -20, right: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7edf2" /><XAxis dataKey="date" tickFormatter={(value) => formatDate(value, 'EEE')} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value}%`, 'Completion']} labelFormatter={(value) => formatDate(String(value), 'EEEE, MMM d')} contentStyle={{ borderRadius: 12 }} /><Bar dataKey="rate" fill="#7c5ce5" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
        <article className="panel-pad min-w-0"><h2 className="text-lg font-extrabold text-ink-900">Activity by category</h2><p className="text-sm text-slate-500">Completed check-ins over the last 30 days</p>{categories.length ? <div className="mt-3 grid items-center sm:grid-cols-[1fr_.8fr]"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="completed" nameKey="category" innerRadius={55} outerRadius={85} paddingAngle={3}>{categories.map((item, index) => <Cell key={item.category} fill={pieColors[index % pieColors.length]} />)}</Pie><Tooltip formatter={(value) => [value, 'Check-ins']} contentStyle={{ borderRadius: 12 }} /></PieChart></ResponsiveContainer></div><div className="space-y-3">{categories.map((item, index) => <div key={item.category} className="flex items-center justify-between gap-4 text-sm"><span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[index % pieColors.length] }} />{categoryLabel(item.category)}</span><strong>{item.completed}</strong></div>)}</div></div> : <p className="mt-8 text-slate-500">Complete habits to see category insights.</p>}</article>
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <article className="panel-pad"><h2 className="text-lg font-extrabold text-ink-900">Habit streaks</h2><p className="text-sm text-slate-500">Current momentum for each active habit</p><div className="mt-5 space-y-4">{streaks.map((item) => <div key={item.habitId} className="grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-slate-200 p-4"><div className="min-w-0"><p className="truncate font-extrabold text-ink-900">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.totalCompleted} total check-ins · best {item.longest} days</p></div><div className="text-right"><p className="text-2xl font-black text-honey-600">{item.current}</p><p className="text-xs font-bold text-slate-400">days</p></div></div>)}</div></article>
        <article className="panel-pad"><h2 className="text-lg font-extrabold text-ink-900">Habit source</h2><p className="text-sm text-slate-500">Personal versus coach-assigned completion</p><div className="mt-6 space-y-6">{comparison.map((item) => <div key={item.source}><div className="mb-2 flex items-center justify-between"><span className="font-bold capitalize text-ink-900">{item.source}</span><span className="text-sm font-extrabold">{item.rate}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.source === 'coach' ? 'bg-violet-500' : 'bg-honey-500'}`} style={{ width: `${item.rate}%` }} /></div><p className="mt-2 text-xs text-slate-500">{item.completed} of {item.scheduled} scheduled check-ins</p></div>)}</div></article>
      </section>
    </>
  )
}

