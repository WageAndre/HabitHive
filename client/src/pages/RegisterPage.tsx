import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Brand } from '../components/Brand'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/api'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
  role: z.enum(['trainee', 'coach']),
})
type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { user, register: createAccount } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { role: 'trainee' } })
  if (user) return <Navigate to="/dashboard" replace />
  const role = watch('role')

  const submit = async (values: RegisterValues) => {
    try {
      await createAccount(values)
      toast.success('Your HabitHive account is ready')
      navigate('/dashboard')
    } catch (error) { setError('root', { message: getErrorMessage(error, 'Unable to create the account') }) }
  }

  return (
    <main className="honeycomb-bg min-h-screen bg-slate-50">
      <header className="mx-auto max-w-6xl px-5 py-6 text-ink-900"><Brand /></header>
      <section className="mx-auto grid max-w-6xl items-start gap-10 px-5 pb-16 pt-6 lg:grid-cols-[.8fr_1.2fr] lg:pt-12">
        <div className="pt-5"><p className="eyebrow">Join the hive</p><h1 className="mt-4 text-4xl font-black tracking-tight text-ink-900 sm:text-5xl">Choose how you’ll build progress.</h1><p className="mt-5 text-lg leading-8 text-slate-600">Trainees build and complete routines. Coaches connect with trainees, assign habits, and turn check-ins into guidance.</p></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
          <h2 className="text-2xl font-black text-ink-900">Create your account</h2>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)} noValidate>
            {errors.root && <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{errors.root.message}</div>}
            <fieldset><legend className="label">I’m joining as a</legend><div className="grid grid-cols-2 gap-3">{(['trainee', 'coach'] as const).map((option) => <label key={option} className={`cursor-pointer rounded-xl border p-4 text-center font-bold capitalize transition ${role === option ? 'border-honey-500 bg-honey-500/10 text-ink-900' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}><input type="radio" value={option} className="sr-only" {...register('role')} />{option}</label>)}</div>{errors.role && <p className="field-error">{errors.role.message}</p>}</fieldset>
            <div><label className="label" htmlFor="name">Full name</label><input id="name" className="input" autoComplete="name" {...register('name')} />{errors.name && <p className="field-error">{errors.name.message}</p>}</div>
            <div><label className="label" htmlFor="email">Email address</label><input id="email" type="email" className="input" autoComplete="email" {...register('email')} />{errors.email && <p className="field-error">{errors.email.message}</p>}</div>
            <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" className="input" autoComplete="new-password" {...register('password')} />{errors.password && <p className="field-error">{errors.password.message}</p>}</div>
            <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : <><UserPlus className="h-4 w-4" /> Create {role} account</>}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link to="/login" className="font-bold text-honey-600 hover:underline">Log in</Link></p>
        </div>
      </section>
    </main>
  )
}
