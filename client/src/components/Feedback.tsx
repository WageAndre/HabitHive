import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

export function LoadingState({ label = 'Loading your data…' }: { label?: string }) {
  return (
    <div className="panel-pad flex min-h-52 items-center justify-center gap-3 text-slate-500" role="status">
      <LoaderCircle className="h-5 w-5 animate-spin text-honey-600" />
      <span className="font-semibold">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="panel-pad flex min-h-52 flex-col items-center justify-center text-center" role="alert">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600"><AlertCircle /></span>
      <h2 className="font-extrabold text-ink-900">We couldn’t load this</h2>
      <p className="mt-1 max-w-md text-slate-600">{message}</p>
      {onRetry && <button className="btn-secondary mt-5" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="panel-pad flex min-h-56 flex-col items-center justify-center text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Inbox /></span>
      <h2 className="font-extrabold text-ink-900">{title}</h2>
      <p className="mt-1 max-w-md text-slate-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 text-white" role="status">
      <div className="flex items-center gap-3 font-bold"><LoaderCircle className="animate-spin text-honey-500" /> Preparing HabitHive…</div>
    </div>
  )
}

