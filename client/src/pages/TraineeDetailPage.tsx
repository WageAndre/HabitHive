import { ArrowLeft, Flame, Goal, Plus, Target } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar } from '../components/Avatar'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback'
import { HabitCard } from '../components/HabitCard'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'
import type { GoalItem, Habit, Overview, User, WeeklyDay } from '../types'

interface TraineeDetailData { trainee: User; overview: Overview; weekly: WeeklyDay[]; habits: Habit[]; goals: GoalItem[] }

export function TraineeDetailPage() {
  const { id } = useParams()
  const query = useApi<TraineeDetailData>(async () => {
    const [user, overview, weekly, habits, goals] = await Promise.all([
      api.get<{ user: User }>(`/users/${id}`), api.get<{ overview: Overview }>(`/analytics/overview?traineeId=${id}`),
      api.get<{ days: WeeklyDay[] }>(`/analytics/weekly?traineeId=${id}`), api.get<{ habits: Habit[] }>(`/habits?traineeId=${id}`),
      api.get<{ goals: GoalItem[] }>(`/goals?traineeId=${id}`),
    ])
    return { trainee: user.data.user, overview: overview.data.overview, weekly: weekly.data.days, habits: habits.data.habits, goals: goals.data.goals }
  }, [id])
  if (query.loading) return <LoadingState label="Loading trainee progress…" />
  if (query.error || !query.data) return <ErrorState message={query.error} onRetry={query.reload} />
  const { trainee, overview, weekly, habits, goals } = query.data
  return (
    <>
      <Link to="/trainees" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" /> All trainees</Link>
      <div className="mb-6 flex flex-col gap-5 rounded-2xl bg-ink-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><Avatar name={trainee.name} color={trainee.avatarColor} className="h-16 w-16 rounded-2xl text-lg" /><div><p className="eyebrow">Trainee profile</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">{trainee.name}</h1><p className="mt-1 text-sm text-slate-400">{trainee.email}</p></div></div><Link to={`/trainees/${id}/assign`} className="btn-primary"><Plus className="h-4 w-4" /> Assign habit</Link></div>
      <section className="grid gap-4 sm:grid-cols-3"><StatCard label="Weekly completion" value={`${overview.week.rate}%`} detail={`${overview.week.completed} completed`} icon={Target} tone="violet" /><StatCard label="Current streak" value={`${overview.currentStreak} days`} detail={`Best ${overview.longestStreak} days`} icon={Flame} tone="amber" /><StatCard label="Active habits" value={overview.activeHabits} detail={`${goals.filter((item) => item.goal.status === 'active').length} active goals`} icon={Goal} tone="emerald" /></section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]"><article className="panel-pad min-w-0"><h2 className="text-lg font-extrabold text-ink-900">Weekly pattern</h2><p className="text-sm text-slate-500">Completion rate by day</p><div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={weekly} margin={{ left: -20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tickFormatter={(value) => formatDate(value, 'EEE')} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value}%`, 'Completion']} /><Bar dataKey="rate" fill="#f5ad22" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></article><article className="panel-pad"><h2 className="text-lg font-extrabold text-ink-900">Active goals</h2><p className="text-sm text-slate-500">Current coaching targets</p>{goals.length ? <div className="mt-5 space-y-4">{goals.slice(0, 4).map(({ goal, progress }) => <div key={goal._id}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="truncate font-bold text-ink-900">{goal.title}</span><strong>{progress.percentage}%</strong></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-violet-500" style={{ width: `${progress.percentage}%` }} /></div></div>)}</div> : <p className="mt-5 text-sm text-slate-500">No goals have been created yet.</p>}</article></section>
      <section className="mt-8"><PageHeader title="Current habits" description="Personal and coach-assigned routines for this trainee." action={<Link to={`/trainees/${id}/assign`} className="btn-secondary">Assign another</Link>} />{habits.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{habits.map((habit) => <HabitCard key={habit._id} habit={habit} />)}</div> : <EmptyState title="No active habits" description="Assign a first habit to begin coaching with measurable check-ins." />}</section>
    </>
  )
}

