import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { useAuth } from '../context/AuthContext'

export function LandingPage() {
  const { user, loading } = useAuth()
  if (!loading && user) return <Navigate to="/dashboard" replace />
  return (
    <div className="min-h-screen overflow-hidden bg-ink-950 text-white">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn border border-white/15 text-white hover:bg-white/10">Log in</Link>
          <Link to="/register" className="btn-primary hidden sm:inline-flex">Create account</Link>
        </div>
      </header>

      <main>
        <section className="honeycomb-bg relative mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:py-20">
          <div className="relative z-10 min-w-0">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-honey-500/30 bg-honey-500/10 px-3 py-1.5 text-sm font-bold text-honey-300"><Sparkles className="h-4 w-4" /> Progress grows better together</p>
            <h1 className="max-w-3xl text-5xl leading-[1.02] font-black tracking-[-0.045em] sm:text-6xl lg:text-7xl">Habits with direction.<br /><span className="text-honey-500">Progress you can prove.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">HabitHive gives trainees a clear daily rhythm and gives coaches the evidence they need to guide, adjust, and celebrate real consistency.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary px-6">Start building habits <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/login" className="btn border border-white/15 px-6 text-white hover:bg-white/10">Use a demo account</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-400" /> Daily check-ins</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-400" /> Live streaks</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-400" /> Coach guidance</span>
            </div>
          </div>

          <div className="relative mx-auto w-full min-w-0 max-w-xl">
            <div className="absolute -top-8 -right-8 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/[.07] p-4 shadow-2xl backdrop-blur sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div><p className="text-sm font-bold text-slate-400">Today’s rhythm</p><p className="mt-1 text-2xl font-black">5 of 6 complete</p></div>
                <div className="grid h-16 w-16 place-items-center rounded-full border-8 border-honey-500 text-sm font-black">83%</div>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ['Morning mobility', '15 minutes', true],
                  ['Hydration target', '8 glasses', true],
                  ['Read before bed', '20 pages', false],
                ].map(([title, detail, done]) => (
                  <div key={String(title)} className="flex items-center gap-4 rounded-2xl bg-white/[.07] p-4">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${done ? 'bg-success-400 text-ink-950' : 'border border-white/20 text-slate-400'}`}><CheckCircle2 className="h-5 w-5" /></span>
                    <div className="flex-1"><p className="font-bold">{title}</p><p className="text-sm text-slate-400">{detail}</p></div>
                    <span className="text-xs font-bold text-slate-400">{done ? 'Done' : 'Tonight'}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-honey-500 p-4 text-ink-950"><p className="text-sm font-bold opacity-70">Current streak</p><p className="mt-1 text-3xl font-black">12 days</p></div>
                <div className="rounded-2xl bg-violet-500 p-4"><p className="text-sm font-bold text-violet-100">Weekly rate</p><p className="mt-1 text-3xl font-black">87%</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white py-20 text-ink-900">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="eyebrow text-center">One shared system</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black tracking-tight sm:text-4xl">Simple enough for every day. Detailed enough to coach from.</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                [Users, 'Two connected perspectives', 'Trainees own their routine while coaches can assign habits and review progress.'],
                [BarChart3, 'Evidence, not guesswork', 'Completion rates, streaks, categories, and weekly trends are calculated from real check-ins.'],
                [ShieldCheck, 'Clear boundaries', 'Role-aware access keeps each trainee’s information visible only to their connected coach.'],
              ].map(([Icon, title, text]) => {
                const FeatureIcon = Icon as typeof Users
                return <article key={String(title)} className="rounded-2xl border border-slate-200 p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-honey-500"><FeatureIcon /></span><h3 className="mt-5 text-lg font-extrabold">{String(title)}</h3><p className="mt-2 leading-7 text-slate-600">{String(text)}</p></article>
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
