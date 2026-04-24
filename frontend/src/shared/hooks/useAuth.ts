import { authStore } from '../../app/store'
import type { User } from '../../types'
export function useAuth() {
  const user = authStore.getUser() as User | null
  return {
    user,
    role: user?.role ?? null,
    isAdmin: user?.role === 'admin',
    isGestionnaire: user?.role === 'gestionnaire',
    isVendeur: user?.role === 'vendeur',
    isAuthenticated: authStore.isAuthenticated(),
  }
}