import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Brand } from '../components/Brand'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/api'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  if (user) return <Navigate to="/dashboard" replace />

  const submit = async (values: LoginValues) => {
    setServerError('')
    try {
      const signedIn = await login(values.email, values.password)
      toast.success(`Welcome back, ${signedIn.name.split(' ')[0]}`)
      navigate('/dashboard')
    } catch (error) { setServerError(getErrorMessage(error, 'Unable to log in')) }
  }

  const fillDemo = (role: 'coach' | 'trainee') => {
    setValue('email', `${role}@habithive.test`, { shouldValidate: true })
    setValue('password', 'HabitHive123!', { shouldValidate: true })
  }

  return (
    <main className="honeycomb-bg grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
      <section className="flex flex-col bg-ink-950 p-6 text-white sm:p-10 lg:p-14">
        <Brand />
        <div className="my-auto py-16"><p className="eyebrow">Welcome back</p><h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">Small check-ins become visible progress.</h1><p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">Continue your routine, review your coaching workspace, and see what consistency has built.</p></div>
        <p className="text-sm text-slate-500">HabitHive · Coach-guided progress</p>
      </section>
      <section className="grid place-items-center p-5 sm:p-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
          <h2 className="text-2xl font-black text-ink-900">Log in</h2>
          <p className="mt-2 text-slate-600">Enter your account details or use a seeded demo.</p>
          <div className="mt-6 grid grid-cols-2 gap-3"><button className="btn-secondary" type="button" onClick={() => fillDemo('trainee')}>Trainee demo</button><button className="btn-secondary" type="button" onClick={() => fillDemo('coach')}>Coach demo</button></div>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)} noValidate>
            {serverError && <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{serverError}</div>}
            <div><label className="label" htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" className="input" placeholder="you@example.com" {...register('email')} />{errors.email && <p className="field-error">{errors.email.message}</p>}</div>
            <div><label className="label" htmlFor="password">Password</label><div className="relative"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="input pr-12" {...register('password')} /><button type="button" className="absolute inset-y-0 right-1 grid w-11 place-items-center text-slate-500" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>{errors.password && <p className="field-error">{errors.password.message}</p>}</div>
            <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : <><LogIn className="h-4 w-4" /> Log in</>}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">New to HabitHive? <Link to="/register" className="font-bold text-honey-600 hover:underline">Create an account</Link></p>
        </div>
      </section>
    </main>
  )
}

