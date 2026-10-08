import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Avatar } from '../components/Avatar'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { api, getErrorMessage } from '../lib/api'
import { colorSwatches } from '../lib/theme'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  bio: z.string().max(280, 'Bio cannot exceed 280 characters'),
  timezone: z.string().min(1),
  avatarColor: z.enum(['amber', 'violet', 'emerald', 'sky', 'rose']),
})
type ProfileValues = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: '', bio: '', timezone: 'Asia/Manila', avatarColor: 'amber' } })
  useEffect(() => { if (user) reset({ name: user.name, bio: user.bio || '', timezone: user.timezone || 'Asia/Manila', avatarColor: user.avatarColor }) }, [user, reset])
  const color = watch('avatarColor')
  const submit = async (values: ProfileValues) => {
    try { await api.patch('/users/me', values); await refreshUser(); toast.success('Profile updated') }
    catch (error) { toast.error(getErrorMessage(error)) }
  }

  return (
    <>
      <PageHeader eyebrow="Account settings" title="Your profile" description="Keep your coaching identity and local time preferences current." />
      <div className="grid gap-6 lg:grid-cols-[.38fr_.62fr]">
        <aside className="panel-pad text-center"><Avatar name={watch('name') || user?.name || ''} color={color} className="mx-auto h-24 w-24 rounded-3xl text-2xl" /><h2 className="mt-5 text-xl font-black text-ink-900">{watch('name') || user?.name}</h2><p className="mt-1 text-sm text-slate-500">{user?.email}</p><span className="badge mt-4 bg-honey-500/15 text-honey-600 capitalize">{user?.role} account</span></aside>
        <form className="panel-pad space-y-5" onSubmit={handleSubmit(submit)} noValidate><div><label className="label" htmlFor="profile-name">Full name</label><input id="profile-name" className="input" {...register('name')} />{errors.name && <p className="field-error">{errors.name.message}</p>}</div><div><label className="label" htmlFor="profile-bio">Bio</label><textarea id="profile-bio" className="textarea" placeholder="A short note about your goals or coaching approach" {...register('bio')} />{errors.bio && <p className="field-error">{errors.bio.message}</p>}</div><div><label className="label" htmlFor="timezone">Timezone</label><select id="timezone" className="select" {...register('timezone')}><option value="Asia/Manila">Asia/Manila</option><option value="UTC">UTC</option><option value="Asia/Singapore">Asia/Singapore</option><option value="America/New_York">America/New York</option></select></div><fieldset><legend className="label">Profile color</legend><div className="flex flex-wrap gap-3">{(['amber', 'violet', 'emerald', 'sky', 'rose'] as const).map((option) => <label key={option}><input type="radio" className="peer sr-only" value={option} {...register('avatarColor')} /><span className={`block h-11 w-11 cursor-pointer rounded-xl ring-offset-2 peer-checked:ring-3 peer-checked:ring-ink-900 ${colorSwatches[option]}`}><span className="sr-only">{option}</span></span></label>)}</div></fieldset><div className="flex justify-end border-t border-slate-200 pt-5"><button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : <><Save className="h-4 w-4" /> Save changes</>}</button></div></form>
      </div>
    </>
  )
}
