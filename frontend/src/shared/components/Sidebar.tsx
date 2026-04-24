import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, AlertTriangle,
  Receipt, Users, Truck, ShoppingBag, UserCog, BarChart3,
  LogOut, ChevronRight, Pill, Bell, X, FileText, Tag, Settings
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { authStore } from '../../app/store'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',      icon: <LayoutDashboard size={18} />, label: 'Tableau de bord', roles: ['admin'] },
  { to: '/pos',            icon: <ShoppingCart size={18} />,    label: 'Point de vente', roles: ['admin', 'vendeur'] },
  { to: '/ordonnances',    icon: <FileText size={18} />,        label: 'Ordonnances', roles: ['admin', 'vendeur'] },
  { to: '/stock/produits', icon: <Package size={18} />,         label: 'Médicaments' ,    roles: ['admin', 'gestionnaire']},
  { to: '/categories',     icon: <Tag size={18} />,             label: 'Catégories',    roles: ['admin', 'gestionnaire'] },
  { to: '/stock/alertes',  icon: <AlertTriangle size={18} />,   label: 'Alertes stock' },
  { to: '/ventes',         icon: <Receipt size={18} />,         label: 'Ventes', roles: ['admin', 'vendeur'] },
  { to: '/clients',        icon: <Users size={18} />,           label: 'Clients', roles: ['admin'] },
  { to: '/fournisseurs',   icon: <Truck size={18} />,           label: 'Fournisseurs',  roles: ['admin', 'gestionnaire'] },
  { to: '/achats',         icon: <ShoppingBag size={18} />,     label: 'Achats',        roles: ['admin', 'gestionnaire'] },
  { to: '/employes',       icon: <UserCog size={18} />,         label: 'Employés',      roles: ['admin'] },
  { to: '/rapports',       icon: <BarChart3 size={18} />,       label: 'Rapports',      roles: ['admin'] },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const filtered = navItems.filter(item => !item.roles || item.roles.includes(role ?? ''))

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await api.post('/auth/logout/', { refresh })
    } catch {}
    authStore.clear()
    toast.success('Déconnexion réussie')
    navigate('/login')
  }

  const roleLabel: Record<string, string> = {
    admin: 'Administrateur',
    gestionnaire: 'Gestionnaire',
    vendeur: 'Vendeur'
  }
  const roleColor: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    gestionnaire: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    vendeur: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300',
        'bg-white dark:bg-gray-900',
        'shadow-sidebar dark:shadow-none dark:border-r dark:border-gray-800',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <Pill size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-gray-900 dark:text-white text-[15px] leading-tight">Kendjino</h1>
              <p className="text-[10px] text-primary font-medium tracking-widest uppercase">Pharma</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1">
            <X size={18} />
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/10 dark:border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user?.full_name}</p>
              <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full', roleColor[role ?? ''])}>
                {roleLabel[role ?? '']}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
          {filtered.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => clsx(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {({ isActive }) => (
                <>
                  <span className={clsx(
                    'flex-shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                  )}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight size={14} className={clsx(
                    'opacity-0 group-hover:opacity-60 transition-opacity',
                    isActive && 'opacity-60'
                  )} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-0.5">

          {/* Notifications */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white transition-all">
            <Bell size={18} className="text-gray-400 dark:text-gray-500" />
            <span>Notifications</span>
          </button>

          {/* Paramètres */}
          <NavLink
            to="/parametres"
            onClick={onClose}
            className={({ isActive }) => clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white'
            )}
          >
            <Settings size={18} className="text-gray-400 dark:text-gray-500" />
            <span>Paramètres</span>
          </NavLink>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>

        </div>
      </aside>
    </>
  )
}