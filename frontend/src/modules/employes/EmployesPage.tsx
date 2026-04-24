import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Edit2, Trash2, UserCog, X, Loader2, Mail, Phone, Shield, Save } from "lucide-react"
import toast from "react-hot-toast"
import api from "../../lib/axios"
import type { User } from "../../types"
import { formatDate } from "../../shared/utils/format"
import clsx from "clsx"

const emptyForm = { email: "", first_name: "", last_name: "", role: "vendeur", phone: "", password: "", is_active: true }

const ROLE_LABELS: Record<string, string> = { 
  admin: "Administrateur", 
  gestionnaire: "Gestionnaire", 
  vendeur: "Vendeur" 
}

const ROLE_COLORS: Record<string, string> = { 
  admin: "bg-purple-500", 
  gestionnaire: "bg-orange-500", 
  vendeur: "bg-emerald-500" 
}

export default function EmployesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ["employes", search],
    queryFn: () => api.get(`/auth/users/?search=${search}`).then(r => r.data.results ?? r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (p: any) => editing ? api.patch(`/auth/users/${editing.id}/`, p) : api.post("/auth/users/", p),
    onSuccess: () => { 
      toast.success(editing ? "Employé modifié" : "Employé ajouté"); 
      qc.invalidateQueries({ queryKey: ["employes"] }); 
      setShowModal(false) 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Une erreur est survenue"),
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/auth/users/${id}/`),
    onSuccess: () => { toast.success("Employé supprimé"); qc.invalidateQueries({ queryKey: ["employes"] }) },
    onError: () => toast.error("Erreur lors de la suppression"),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setForm({ 
      email: u.email, 
      first_name: u.first_name, 
      last_name: u.last_name, 
      role: u.role, 
      phone: u.phone ?? "", 
      password: "", 
      is_active: u.is_active 
    })
    setShowModal(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Supprimer ${name} ?`)) deleteMutation.mutate(id)
  }

  const handleSave = () => {
    const payload: any = { ...form }
    if (!payload.password) delete payload.password
    saveMutation.mutate(payload)
  }

  const employes: User[] = data ?? []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Employés</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {employes.length} employé{employes.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
        >
          <Plus size={16} />
          Nouvel employé
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un employé..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 h-44 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex gap-1">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
            </div>
          ))
        ) : employes.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400 dark:text-gray-600">
            <UserCog size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun employé trouvé</p>
          </div>
        ) : (
          employes.map(emp => (
            <div
              key={emp.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={clsx(
                  'w-11 h-11 rounded-xl flex items-center justify-center shadow-md',
                  ROLE_COLORS[emp.role]
                )}>
                  <span className="text-white font-bold text-lg">
                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(emp)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id, emp.full_name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{emp.full_name}</h3>
              
              <div className={clsx(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1.5 mb-3",
                emp.role === 'admin' && "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
                emp.role === 'gestionnaire' && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
                emp.role === 'vendeur' && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              )}>
                <Shield size={10} />
                {ROLE_LABELS[emp.role]}
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                  <Mail size={11} className="flex-shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </p>
                {emp.phone && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Phone size={11} className="flex-shrink-0" />
                    {emp.phone}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Depuis {formatDate(emp.date_joined)}
                </span>
                <span className={clsx(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  emp.is_active 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                )}>
                  {emp.is_active ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
                {editing ? 'Modifier l\'employé' : 'Nouvel employé'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={e => setForm(x => ({ ...x, first_name: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={e => setForm(x => ({ ...x, last_name: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(x => ({ ...x, email: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(x => ({ ...x, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Rôle *</label>
                <select
                  required
                  value={form.role}
                  onChange={e => setForm(x => ({ ...x, role: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                >
                  <option value="vendeur">Vendeur</option>
                  <option value="gestionnaire">Gestionnaire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {editing ? "Nouveau mot de passe (laisser vide = inchangé)" : "Mot de passe *"}
                </label>
                <input
                  type="password"
                  required={!editing}
                  value={form.password}
                  onChange={e => setForm(x => ({ ...x, password: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-sm shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}