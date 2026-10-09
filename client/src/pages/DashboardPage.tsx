import { Activity, CheckCircle2, Flame, Goal, Handshake, Plus, Trophy, Users, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar } from '../components/Avatar'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { api, getErrorMessage } from '../lib/api'
import { formatDate } from '../lib/format'
import { colorSwatches } from '../lib/theme'
import type { Habit, Overview, Relationship, User, WeeklyDay } from '../types'

interface TraineeDashboardData {
  overview: Overview
  days: WeeklyDay[]
  habits: Habit[]
  invitations: Relationship[]
}

interface LeaderboardItem {
  rank: number
  trainee: User
  week: Overview['week']
  today: Overview['today']
  currentStreak: number
  activeHabits: number
}

interface CoachDashboardData {
  relationships: Relationship[]
  leaderboard: LeaderboardItem[]
}

const dashboardDate = new Date()

export function DashboardPage() {
  const { user } = useAuth()
  return user?.role === 'coach' ? <CoachDashboard /> : <TraineeDashboard />
}

function TraineeDashboard() {
  const { user } = useAuth()
  const query = useApi<TraineeDashboardData>(async () => {
    const [overview, weekly, habits, invitations] = await Promise.all([
      api.get<{ overview: Overview }>('/analytics/overview'),
      api.get<{ days: WeeklyDay[] }>('/analytics/weekly'),
      api.get<{ habits: Habit[] }>('/habits?active=true'),
      api.get<{ relationships: Relationship[] }>('/relationships?status=pending'),
    ])
    return { overview: overview.data.overview, days: weekly.data.days, habits: habits.data.habits, invitations: invitations.data.relationships }
  }, [user?._id])

  if (query.loading) return <LoadingState label="Calculating your progress…" />
  if (query.error || !query.data) return <ErrorState message={query.error} onRetry={query.reload} />
  const { overview, days, habits, invitations } = query.data
  const acceptInvitation = async (id: string) => {
    try { await api.patch(`/relationships/${id}/accept`); toast.success('Coach connected'); await query.reload() }
    catch (error) { toast.error(getErrorMessage(error)) }
  }
  const cancelInvitation = async (id: string) => {
    try { await api.patch(`/relationships/${id}/archive`); toast.success('Invitation canceled'); await query.reload() }
    catch (error) { toast.error(getErrorMessage(error)) }
  }

  return (
    <>
      <PageHeader
        eyebrow={formatDate(dashboardDate, 'EEEE, MMMM d')}
        title={`Good day, ${user?.name.split(' ')[0]}`}
        description="Your routine is ready. Focus on the next small win."
        action={<Link className="btn-primary" to="/habits/new"><Plus className="h-4 w-4" /> Add habit</Link>}
      />
      {invitations.map((invitation) => <section key={invitation._id} className="mb-6 flex flex-col gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500 text-white"><Handshake /></span><div><h2 className="font-extrabold text-ink-900">Coach invitation from {invitation.coach.name}</h2><p className="mt-1 text-sm text-slate-600">Accept to let this coach assign habits and review your progress.</p></div></div><div className="flex shrink-0 flex-col gap-2 sm:flex-row"><button className="btn-secondary" onClick={() => void cancelInvitation(invitation._id)}><X className="h-4 w-4" /> Cancel invitation</button><button className="btn-dark" onClick={() => void acceptInvitation(invitation._id)}>Accept invitation</button></div></section>)}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Progress summary">
        <StatCard label="Current streak" value={`${overview.currentStreak} days`} detail={`Best: ${overview.longestStreak} days`} icon={Flame} tone="amber" />
        <StatCard label="Today" value={`${overview.today.completed}/${overview.today.scheduled}`} detail={`${overview.today.rate}% complete`} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Weekly rate" value={`${overview.week.rate}%`} detail={`${overview.week.completed} check-ins`} icon={Activity} tone="violet" />
        <StatCard label="Active habits" value={overview.activeHabits} detail="Across your routine" icon={Goal} tone="sky" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <article className="panel-pad min-w-0">
          <div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-ink-900">This week</h2><p className="text-sm text-slate-500">Daily completion percentage</p></div><span className="badge bg-violet-50 text-violet-700">{overview.week.rate}% average</span></div>
          <div className="h-72 w-full" aria-label="Weekly completion chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={days} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs><linearGradient id="weekFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c5ce5" stopOpacity={0.35} /><stop offset="95%" stopColor="#7c5ce5" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7edf2" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(value) => formatDate(value, 'EEE')} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, 'Completed']} labelFormatter={(value) => formatDate(String(value), 'EEEE, MMM d')} contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
                <Area type="monotone" dataKey="rate" stroke="#7c5ce5" strokeWidth={3} fill="url(#weekFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel-pad flex flex-col items-center justify-center text-center">
          <p className="eyebrow">Today’s progress</p>
          <div className="my-5"><ProgressRing value={overview.today.rate} size={136} /></div>
          <h2 className="text-xl font-black text-ink-900">{overview.today.completed === overview.today.scheduled && overview.today.scheduled > 0 ? 'Daily rhythm complete' : `${Math.max(0, overview.today.scheduled - overview.today.completed)} habits left`}</h2>
          <p className="mt-2 text-sm text-slate-500">Each check-in strengthens your consistency score.</p>
          <Link to="/today" className="btn-dark mt-5 w-full">Open today’s habits</Link>
        </article>
      </section>

      <section className="panel-pad mt-6">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-ink-900">Active habits</h2><p className="text-sm text-slate-500">Your current routine at a glance</p></div><Link to="/habits" className="text-sm font-bold text-honey-600 hover:underline">View all</Link></div>
        {habits.length === 0 ? <EmptyState title="Your routine is empty" description="Create your first habit to begin tracking progress." action={<Link to="/habits/new" className="btn-primary">Create habit</Link>} /> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {habits.slice(0, 6).map((habit) => <Link key={habit._id} to={`/habits/${habit._id}`} className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-honey-500 hover:bg-honey-500/5"><span className={`h-11 w-2 rounded-full ${colorSwatches[habit.color]}`} /><div className="min-w-0"><p className="truncate font-extrabold text-ink-900 group-hover:text-honey-600">{habit.title}</p><p className="text-sm text-slate-500">{habit.targetValue} {habit.unit} · {habit.frequency}</p></div></Link>)}
          </div>
        )}
      </section>
    </>
  )
}

function CoachDashboard() {
  const { user } = useAuth()
  const query = useApi<CoachDashboardData>(async () => {
    const [relationships, leaderboard] = await Promise.all([
      api.get<{ relationships: Relationship[] }>('/users/coach-trainees'),
      api.get<{ leaderboard: LeaderboardItem[] }>('/analytics/leaderboard'),
    ])
    return { relationships: relationships.data.relationships, leaderboard: leaderboard.data.leaderboard }
  }, [user?._id])
  if (query.loading) return <LoadingState label="Preparing your coaching workspace…" />
  if (query.error || !query.data) return <ErrorState message={query.error} onRetry={query.reload} />
  const { relationships, leaderboard } = query.data
  const average = leaderboard.length ? Math.round(leaderboard.reduce((sum, item) => sum + item.week.rate, 0) / leaderboard.length) : 0
  const attention = leaderboard.filter((item) => item.week.rate < 60).length

  return (
    <>
      <PageHeader eyebrow="Coach overview" title={`Welcome, Coach ${user?.name.split(' ')[0]}`} description="See who is building momentum and who may need a timely check-in." action={<Link to="/trainees" className="btn-primary"><Users className="h-4 w-4" /> Manage trainees</Link>} />
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active trainees" value={relationships.length} detail="Connected to your workspace" icon={Users} tone="sky" />
        <StatCard label="Team consistency" value={`${average}%`} detail="Average this week" icon={Trophy} tone="amber" />
        <StatCard label="Needs attention" value={attention} detail="Below 60% this week" icon={Activity} tone="violet" />
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <article className="panel-pad">
          <div className="mb-5"><h2 className="text-lg font-extrabold text-ink-900">Weekly leaderboard</h2><p className="text-sm text-slate-500">Ranked by scheduled-habit completion</p></div>
          {leaderboard.length === 0 ? <EmptyState title="No active trainees yet" description="Invite a trainee to start building a shared coaching workspace." action={<Link to="/trainees" className="btn-primary">Invite trainee</Link>} /> : (
            <div className="space-y-3">
              {leaderboard.map((item) => <Link key={item.trainee._id} to={`/trainees/${item.trainee._id}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-honey-500"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slate-600">{item.rank}</span><div className="flex min-w-0 items-center gap-3"><Avatar name={item.trainee.name} color={item.trainee.avatarColor} /><div className="min-w-0"><p className="truncate font-extrabold text-ink-900">{item.trainee.name}</p><p className="text-sm text-slate-500">{item.currentStreak}-day streak · {item.activeHabits} habits</p></div></div><div className="text-right"><p className="text-xl font-black text-ink-900">{item.week.rate}%</p><p className="text-xs font-bold text-slate-400">this week</p></div></Link>)}
            </div>
          )}
        </article>
        <article className="panel-pad">
          <h2 className="text-lg font-extrabold text-ink-900">Coaching pulse</h2><p className="text-sm text-slate-500">Today across active trainees</p>
          <div className="mt-7 flex justify-center"><ProgressRing value={leaderboard.length ? Math.round(leaderboard.reduce((sum, item) => sum + item.today.rate, 0) / leaderboard.length) : 0} size={150} label="average daily completion" /></div>
          <div className="mt-7 space-y-3 border-t border-slate-200 pt-5"><div className="flex justify-between text-sm"><span className="text-slate-500">On track</span><strong className="text-success-500">{leaderboard.filter((item) => item.week.rate >= 80).length} trainees</strong></div><div className="flex justify-between text-sm"><span className="text-slate-500">Building consistency</span><strong className="text-violet-600">{leaderboard.filter((item) => item.week.rate >= 60 && item.week.rate < 80).length} trainees</strong></div><div className="flex justify-between text-sm"><span className="text-slate-500">Follow up</span><strong className="text-rose-600">{attention} trainees</strong></div></div>
        </article>
      </section>
    </>
  )
}
