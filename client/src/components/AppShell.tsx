import {
  BarChart3, CalendarDays, CheckSquare2, Goal, LayoutDashboard, LogOut,
  Menu, Settings, Users, X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'
import { Brand } from './Brand'

const traineeLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/today', label: 'Today', icon: CheckSquare2 },
  { to: '/habits', label: 'Habits', icon: Goal },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/goals', label: 'Goals', icon: Goal },
]

const coachLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/trainees', label: 'Trainees', icon: Users },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (!user) return null
  const links = user.role === 'coach' ? coachLinks : traineeLinks

  const signOut = () => {
    logout()
    navigate('/login')
  }

  const navigation = (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isActive ? 'bg-honey-500 text-ink-950' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
        >
          <Icon className="h-5 w-5" />{label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink-950 px-4 py-6 text-white lg:flex">
        <div className="px-2"><Brand /></div>
        <p className="mt-10 px-3 text-xs font-extrabold tracking-[.14em] text-slate-500 uppercase">Workspace</p>
        <div className="mt-3 flex-1">{navigation}</div>
        <NavLink to="/profile" className={({ isActive }) => `mb-3 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/8'}`}>
          <Settings className="h-5 w-5" />Settings
        </NavLink>
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user.name} color={user.avatarColor} />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{user.name}</p><p className="text-xs text-slate-400 capitalize">{user.role}</p></div>
            <button className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={signOut} aria-label="Log out"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:ml-64 lg:px-8">
        <div className="lg:hidden"><Brand /></div>
        <p className="hidden text-sm font-semibold text-slate-500 lg:block">{user.role === 'coach' ? 'Coach workspace' : 'Personal workspace'}</p>
        <div className="flex items-center gap-2">
          <Avatar name={user.name} color={user.avatarColor} className="h-9 w-9 lg:hidden" />
          <button className="rounded-xl p-2 text-ink-900 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden" onMouseDown={(event) => event.target === event.currentTarget && setMobileOpen(false)}>
          <aside className="h-full w-[min(84vw,320px)] bg-ink-950 p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between"><Brand /><button className="rounded-lg p-2 hover:bg-white/10" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button></div>
            <div className="mt-10">{navigation}</div>
            <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="mt-2 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-300 hover:bg-white/8"><Settings className="h-5 w-5" />Settings</NavLink>
            <button className="mt-8 flex min-h-11 w-full items-center gap-3 rounded-xl border border-white/10 px-3 text-sm font-bold text-slate-300" onClick={signOut}><LogOut className="h-5 w-5" />Log out</button>
          </aside>
        </div>
      )}

      <main className="min-w-0 p-4 pb-10 sm:p-6 lg:ml-64 lg:p-8">
        <div className="mx-auto max-w-7xl"><Outlet /></div>
      </main>
    </div>
  )
}
