import { initials } from '../lib/format'
import type { ColorName } from '../types'

const colors: Record<ColorName, string> = {
  amber: 'bg-amber-100 text-amber-800',
  violet: 'bg-violet-100 text-violet-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  sky: 'bg-sky-100 text-sky-800',
  rose: 'bg-rose-100 text-rose-800',
}

export function Avatar({ name, color = 'amber', className = '' }: { name: string; color?: ColorName; className?: string }) {
  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${colors[color]} ${className}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

