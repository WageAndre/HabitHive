import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center bg-ink-950 p-5 text-center text-white"><div><p className="text-7xl font-black text-honey-500">404</p><h1 className="mt-4 text-3xl font-black">This path went off routine.</h1><p className="mt-3 text-slate-400">The page you requested does not exist or is no longer available.</p><Link to="/" className="btn-primary mt-7"><Home className="h-4 w-4" /> Return home</Link></div></main>
}
