import { useState } from 'react'
import {
  User, Building2, Users, Camera, Save, Eye, EyeOff,
  Phone, MapPin, Mail, Lock, Shield, Trash2, Plus, Edit2
} from 'lucide-react'
import { useAuth } from '../../shared/hooks/useAuth'
import clsx from 'clsx'
import toast from 'react-hot-toast'

type Tab = 'profil' | 'pharmacie' | 'utilisateurs'

const mockUsers = [
  { id: 1, full_name: 'Desmarais Rood-Kendjino', email: 'admin@kendjino.ht', role: 'admin', actif: true },
  { id: 2, full_name: 'Marie Joseph', email: 'marie@kendjino.ht', role: 'gestionnaire', actif: true },
  { id: 3, full_name: 'Jean Pierre', email: 'jean@kendjino.ht', role: 'vendeur', actif: false },
]

const roleLabel: Record<string, string> = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire',
  vendeur: 'Vendeur',
}

const roleColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  gestionnaire: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  vendeur: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export default function ParametresPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profil')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Profil
  const [profil, setProfil] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    telephone: '',
    current_password: '',
    new_password: '',
  })

  // Pharmacie
  const [pharmacie, setPharmacic] = useState({
    nom: 'Kendjino Pharma',
    adresse: 'Port-au-Prince, Haïti',
    telephone: '+509 3000-0000',
    email: 'contact@kendjino.ht',
    devise: 'HTG',
    matricule: 'PH-2024-001',
  })

  const tabs = [
    { id: 'profil' as Tab,        icon: <User size={16} />,      label: 'Mon profil' },
    { id: 'pharmacie' as Tab,     icon: <Building2 size={16} />, label: 'Pharmacie' },
    { id: 'utilisateurs' as Tab,  icon: <Users size={16} />,     label: 'Utilisateurs' },
  ]

  const handleSaveProfil = () => {
    toast.success('Profil mis à jour avec succès')
  }

  const handleSavePharmacic = () => {
    toast.success('Informations de la pharmacie mises à jour')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Gérez votre profil, votre pharmacie et les utilisateurs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================== PROFIL ===================== */}
      {activeTab === 'profil' && (
        <div className="space-y-5">

          {/* Avatar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Photo de profil</h2>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition">
                  <Camera size={13} className="text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{roleLabel[user?.role ?? '']}</p>
                <button className="mt-2 text-xs text-primary hover:underline">
                  Changer la photo
                </button>
              </div>
            </div>
          </div>

          {/* Infos personnelles */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Prénom</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={profil.first_name}
                    onChange={e => setProfil({ ...profil, first_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nom</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={profil.last_name}
                    onChange={e => setProfil({ ...profil, last_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={profil.email}
                    onChange={e => setProfil({ ...profil, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Téléphone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={profil.telephone}
                    placeholder="+509 0000-0000"
                    onChange={e => setProfil({ ...profil, telephone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Mot de passe */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Lock size={15} /> Changer le mot de passe
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Mot de passe actuel</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={profil.current_password}
                    onChange={e => setProfil({ ...profil, current_password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={profil.new_password}
                    onChange={e => setProfil({ ...profil, new_password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfil}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
            >
              <Save size={15} />
              Sauvegarder le profil
            </button>
          </div>

        </div>
      )}

      {/* ===================== PHARMACIE ===================== */}
      {activeTab === 'pharmacie' && (
        <div className="space-y-5">

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Building2 size={15} /> Informations de la pharmacie
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nom de la pharmacie</label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={pharmacie.nom}
                    onChange={e => setPharmacic({ ...pharmacie, nom: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Adresse</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={pharmacie.adresse}
                    onChange={e => setPharmacic({ ...pharmacie, adresse: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Téléphone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={pharmacie.telephone}
                    onChange={e => setPharmacic({ ...pharmacie, telephone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={pharmacie.email}
                    onChange={e => setPharmacic({ ...pharmacie, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Matricule fiscal</label>
                <input
                  type="text"
                  value={pharmacie.matricule}
                  onChange={e => setPharmacic({ ...pharmacie, matricule: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Devise</label>
                <select
                  value={pharmacie.devise}
                  onChange={e => setPharmacic({ ...pharmacie, devise: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                >
                  <option value="HTG">HTG — Gourde haïtienne</option>
                  <option value="USD">USD — Dollar américain</option>
                </select>
              </div>

            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePharmacic}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
            >
              <Save size={15} />
              Sauvegarder
            </button>
          </div>

        </div>
      )}

      {/* ===================== UTILISATEURS ===================== */}
      {activeTab === 'utilisateurs' && (
        <div className="space-y-5">

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Shield size={15} /> Gestion des utilisateurs
              </h2>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded-lg transition shadow-sm shadow-primary/25">
                <Plus size={13} />
                Nouvel utilisateur
              </button>
            </div>

            <div className="space-y-2">
              {mockUsers.map(u => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-xs">
                        {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{u.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', roleColor[u.role])}>
                      {roleLabel[u.role]}
                    </span>
                    <span className={clsx(
                      'text-[10px] font-medium px-2 py-0.5 rounded-full',
                      u.actif
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    )}>
                      {u.actif ? 'Actif' : 'Inactif'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition">
                        <Edit2 size={13} />
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}