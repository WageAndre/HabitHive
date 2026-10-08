import type { LucideIcon } from 'lucide-react'

export function StatCard({ label, value, detail, icon: Icon, tone = 'amber' }: { label: string; value: string | number; detail: string; icon: LucideIcon; tone?: 'amber' | 'violet' | 'emerald' | 'sky' }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    sky: 'bg-sky-50 text-sky-700',
  }
  return (
    <article className="panel-pad min-w-0">
      <div className={`mb-5 grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </article>
  )
}

