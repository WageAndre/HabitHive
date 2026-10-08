import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from './components/AppShell'
import { PageLoading } from './components/Feedback'
import { ProtectedRoute } from './components/ProtectedRoute'

const CalendarPage = lazy(() => import('./pages/CalendarPage').then((module) => ({ default: module.CalendarPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const GoalsPage = lazy(() => import('./pages/GoalsPage').then((module) => ({ default: module.GoalsPage })))
const HabitDetailPage = lazy(() => import('./pages/HabitDetailPage').then((module) => ({ default: module.HabitDetailPage })))
const HabitFormPage = lazy(() => import('./pages/HabitFormPage').then((module) => ({ default: module.HabitFormPage })))
const HabitsPage = lazy(() => import('./pages/HabitsPage').then((module) => ({ default: module.HabitsPage })))
const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((module) => ({ default: module.ProgressPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const TodayPage = lazy(() => import('./pages/TodayPage').then((module) => ({ default: module.TodayPage })))
const TraineeDetailPage = lazy(() => import('./pages/TraineeDetailPage').then((module) => ({ default: module.TraineeDetailPage })))
const TraineesPage = lazy(() => import('./pages/TraineesPage').then((module) => ({ default: module.TraineesPage })))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}><Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<ProtectedRoute roles={['trainee']} />}>
              <Route path="/today" element={<TodayPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/habits/new" element={<HabitFormPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/goals" element={<GoalsPage />} />
            </Route>

            <Route path="/habits/:id" element={<HabitDetailPage />} />
            <Route path="/habits/:id/edit" element={<HabitFormPage />} />

            <Route element={<ProtectedRoute roles={['coach']} />}>
              <Route path="/trainees" element={<TraineesPage />} />
              <Route path="/trainees/:id" element={<TraineeDetailPage />} />
              <Route path="/trainees/:traineeId/assign" element={<HabitFormPage assignment />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes></Suspense>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  )
}
