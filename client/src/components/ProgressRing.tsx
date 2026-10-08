export function ProgressRing({ value, size = 96, label = 'progress' }: { value: number; size?: number; label?: string }) {
  const safeValue = Math.max(0, Math.min(100, value))
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(#f5ad22 ${safeValue}%, #e7edf2 0)` }}
      role="img"
      aria-label={`${safeValue}% ${label}`}
    >
      <div className="absolute inset-2.5 grid place-items-center rounded-full bg-white">
        <span className="text-xl font-black text-ink-900">{safeValue}%</span>
      </div>
    </div>
  )
}

