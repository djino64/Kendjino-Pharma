//import { User } from '../types'
//import { User } from '../types'
import type { User } from "../types"

const STORAGE_KEYS = { access: 'access_token', refresh: 'refresh_token', user: 'user_data' }

export const authStore = {
  getUser: (): User | null => {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    return raw ? JSON.parse(raw) : null
  },
  setAuth: (access: string, refresh: string, user: User) => {
    localStorage.setItem(STORAGE_KEYS.access, access)
    localStorage.setItem(STORAGE_KEYS.refresh, refresh)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.access)
    localStorage.removeItem(STORAGE_KEYS.refresh)
    localStorage.removeItem(STORAGE_KEYS.user)
  },
  isAuthenticated: () => !!localStorage.getItem(STORAGE_KEYS.access),
  getRole: (): string => authStore.getUser()?.role ?? '',
}
