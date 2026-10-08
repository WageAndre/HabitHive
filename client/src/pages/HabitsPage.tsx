import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState, ErrorState, LoadingState } from '../components/Feedback'
import { HabitCard } from '../components/HabitCard'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { api, getErrorMessage } from '../lib/api'
import type { Habit } from '../types'

export function HabitsPage() {
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null)
  const [deleting, setDeleting] = useState(false)
  const query = useApi<Habit[]>(async () => (await api.get<{ habits: Habit[] }>('/habits')).data.habits, [])
  const filtered = useMemo(() => (query.data || []).filter((habit) => {
    const matchesText = `${habit.title} ${habit.description}`.toLowerCase().includes(search.toLowerCase())
    const matchesSource = source === 'all' || (source === 'coach' ? habit.assignedBy : !habit.assignedBy)
    return matchesText && matchesSource
  }), [query.data, search, source])

  const remove = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.delete(`/habits/${pendingDelete._id}`)
      toast.success('Habit deleted')
      setPendingDelete(null)
      await query.reload()
    } catch (error) { toast.error(getErrorMessage(error)) } finally { setDeleting(false) }
  }

  return (
    <>
      <PageHeader eyebrow="Your routine" title="Habits" description="Manage personal habits and see the routines your coach assigned." action={<Link to="/habits/new" className="btn-primary"><Plus className="h-4 w-4" /> New habit</Link>} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search habits</span><Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" /><input className="input pl-11" placeholder="Search habits" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <select className="select sm:w-52" value={source} onChange={(event) => setSource(event.target.value)} aria-label="Filter by source"><option value="all">All habits</option><option value="personal">Personal</option><option value="coach">Coach assigned</option></select>
      </div>
      {query.loading ? <LoadingState label="Loading your habits…" /> : query.error ? <ErrorState message={query.error} onRetry={query.reload} /> : filtered.length === 0 ? <EmptyState title={query.data?.length ? 'No habits match' : 'Build your first habit'} description={query.data?.length ? 'Try a different search or filter.' : 'Create a routine you can check in on every day.'} action={!query.data?.length && <Link to="/habits/new" className="btn-primary">Create habit</Link>} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((habit) => <HabitCard key={habit._id} habit={habit} onDelete={!habit.assignedBy ? setPendingDelete : undefined} />)}</div>}
      <ConfirmDialog open={Boolean(pendingDelete)} title="Delete this habit?" description={`This will permanently remove “${pendingDelete?.title || ''}”. Existing check-ins may no longer be accessible.`} busy={deleting} onConfirm={() => void remove()} onClose={() => setPendingDelete(null)} />
    </>
  )
}

