import { Link } from 'react-router-dom'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-3" aria-label="HabitHive home">
      <span className="hex-mark grid h-10 w-10 shrink-0 place-items-center bg-honey-500 font-black text-ink-950">H</span>
      {!compact && <span className="text-xl font-black tracking-tight text-current">Habit<span className="text-honey-500">Hive</span></span>}
    </Link>
  )
}

