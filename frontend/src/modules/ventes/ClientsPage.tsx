import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Edit2, Trash2, Users, X, Loader2, Phone, Mail, Building2, MapPin, Save } from "lucide-react"
import toast from "react-hot-toast"
import api from "../../lib/axios"
import type { Client } from "../../types"
import clsx from "clsx"

const emptyForm = { nom: "", prenom: "", telephone: "", email: "", adresse: "", entreprise: "" }

export default function ClientsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: () => api.get(`/clients/?search=${search}`).then(r => r.data.results ?? r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (p: any) => editing ? api.put(`/clients/${editing.id}/`, p) : api.post("/clients/", p),
    onSuccess: () => { 
      toast.success(editing ? "Client modifié" : "Client ajouté"); 
      qc.invalidateQueries({ queryKey: ["clients"] }); 
      setShowModal(false) 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Une erreur est survenue"),
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/clients/${id}/`),
    onSuccess: () => { toast.success("Client supprimé"); qc.invalidateQueries({ queryKey: ["clients"] }) },
    onError: () => toast.error("Erreur lors de la suppression"),
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  
  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ 
      nom: c.nom, 
      prenom: c.prenom ?? "", 
      telephone: c.telephone ?? "", 
      email: c.email ?? "", 
      adresse: c.adresse ?? "", 
      entreprise: c.entreprise ?? "" 
    })
    setShowModal(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Supprimer ${name} ?`)) deleteMutation.mutate(id)
  }

  const clients: Client[] = data ?? []
  const colors = ["bg-primary", "bg-violet-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-pink-500", "bg-orange-500"]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {clients.length} client{clients.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
        >
          <Plus size={16} />
          Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 h-44 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex gap-1">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))
        ) : clients.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400 dark:text-gray-600">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun client trouvé</p>
          </div>
        ) : (
          clients.map((client, index) => (
            <div
              key={client.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={clsx(
                  'w-11 h-11 rounded-xl flex items-center justify-center shadow-md',
                  colors[client.nom?.charCodeAt(0) % colors.length] || 'bg-primary'
                )}>
                  <span className="text-white font-bold text-lg">
                    {(client.prenom?.[0] || client.nom?.[0] || 'C').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(client)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id, client.full_name || `${client.prenom} ${client.nom}`)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                {client.full_name || `${client.prenom} ${client.nom}`.trim()}
              </h3>
              
              <div className="space-y-1.5">
                {client.telephone && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Phone size={11} className="flex-shrink-0" />
                    <span className="truncate">{client.telephone}</span>
                  </p>
                )}
                {client.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Mail size={11} className="flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </p>
                )}
                {client.entreprise && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Building2 size={11} className="flex-shrink-0" />
                    <span className="truncate">{client.entreprise}</span>
                  </p>
                )}
                {client.adresse && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <MapPin size={11} className="flex-shrink-0" />
                    <span className="truncate">{client.adresse}</span>
                  </p>
                )}
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
                {editing ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form) }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Prénom</label>
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={e => setForm(x => ({ ...x, prenom: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={e => setForm(x => ({ ...x, nom: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={e => setForm(x => ({ ...x, telephone: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(x => ({ ...x, email: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Entreprise / Hôpital</label>
                <input
                  type="text"
                  value={form.entreprise}
                  onChange={e => setForm(x => ({ ...x, entreprise: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Adresse</label>
                <input
                  type="text"
                  value={form.adresse}
                  onChange={e => setForm(x => ({ ...x, adresse: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-sm shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}