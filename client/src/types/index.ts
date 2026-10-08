export type Role = 'coach' | 'trainee'
export type ColorName = 'amber' | 'violet' | 'emerald' | 'sky' | 'rose'

export interface User {
  _id: string
  name: string
  email: string
  role: Role
  avatarColor: ColorName
  bio?: string
  timezone?: string
  lastLoginAt?: string | null
  createdAt?: string
}

export interface Relationship {
  _id: string
  coach: User
  trainee: User
  status: 'pending' | 'active' | 'archived'
  startedAt?: string | null
  createdAt: string
}

export interface Habit {
  _id: string
  owner: User | string
  assignedBy?: Pick<User, '_id' | 'name' | 'email'> | string | null
  title: string
  description: string
  category: 'fitness' | 'nutrition' | 'mindfulness' | 'learning' | 'sleep' | 'productivity' | 'other'
  frequency: 'daily' | 'weekdays' | 'custom'
  targetDays: number[]
  targetValue: number
  unit: string
  color: ColorName
  startDate: string
  endDate?: string | null
  isActive: boolean
  createdAt: string
}

export interface CheckIn {
  _id: string
  habit: Habit | string
  user: string
  date: string
  status: 'completed' | 'partial' | 'skipped'
  value: number
  note: string
}

export interface Overview {
  activeHabits: number
  today: { scheduled: number; completed: number; rate: number }
  week: { scheduled: number; completed: number; rate: number }
  currentStreak: number
  longestStreak: number
}

export interface WeeklyDay {
  date: string
  scheduled: number
  completed: number
  rate: number
}

export interface HabitStreak {
  habitId: string
  title: string
  color: ColorName
  current: number
  longest: number
  totalCompleted: number
}

export interface Goal {
  _id: string
  trainee: User | string
  coach?: User | string | null
  title: string
  description: string
  metric: 'completion_rate' | 'streak' | 'check_ins'
  target: number
  period: 'weekly' | 'monthly' | 'custom'
  startDate: string
  endDate: string
  status: 'active' | 'achieved' | 'expired' | 'cancelled'
}

export interface GoalItem {
  goal: Goal
  progress: { current: number; target: number; percentage: number }
}

export interface ApiErrorBody {
  message?: string
  details?: Array<{ field: string; message: string }>
}

