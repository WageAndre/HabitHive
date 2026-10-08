import { format, parseISO } from 'date-fns'

export function formatDate(value: string | Date, pattern = 'MMM d, yyyy') {
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, pattern)
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function todayKey() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
}

