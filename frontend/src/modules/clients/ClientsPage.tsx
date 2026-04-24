import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus, Search, Users, X, Receipt, Phone, Mail,
  Building2, MapPin, Star, Download, Eye, Edit2, Trash2, User
} from "lucide-react"
import toast from "react-hot-toast"
import { useDebounce } from "../../shared/hooks/useDebounce"
import { clientApi } from "../clients/api/clientApi"
import ClientForm from "./ClientForm"
import type { Client } from "../../types"
import { formatDateTime, formatHTG } from "../../shared/utils/format"
import clsx from "clsx"

type ClientWithStats = Client & {
  created_at: string
  total_achats: number
}

type ClientPayload = Omit<Client, "id">

function ClientDrawer({ client, onClose, onEdit }: { client: Client; onClose: () => void; onEdit: () => void }) {
  const { data: ventes = [] } = useQuery({
    queryKey: ["client-ventes", client.id],
    queryFn: () => (clientApi as any).ventes(client.id),
  })

  const initials = `${client.prenom?.[0] ?? ""}${client.nom[0]}`.toUpperCase()
  const colors = ["bg-violet-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-primary"]
  const avatarColor = colors[client.nom.charCodeAt(0) % colors.length]

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full overflow-y-auto border-l border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between mb-4">
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={16} />
            </button>
            <button 
              onClick={onEdit} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition"
            >
              <Edit2 size={12} />
              Modifier
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={clsx(
              'w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 text-white shadow-md',
              avatarColor
            )}>
              {initials || <User size={24} />}
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                {client.prenom} {client.nom}
              </h2>
              {client.entreprise && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <Building2 size={12} /> {client.entreprise}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Points fidélité */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <Star size={13} className="text-amber-500" /> Points fidélité
            </span>
            <span className="font-mono font-bold text-primary">{client.points_fidelite ?? 0} pts</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(((client.points_fidelite ?? 0) / 100) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {100 - (client.points_fidelite ?? 0)} pts pour le prochain niveau
          </p>
        </div>

        {/* Coordonnées */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Coordonnées</h3>
          {[
            { icon: <Phone size={14} />, value: client.telephone, label: "Téléphone" },
            { icon: <Mail size={14} />, value: client.email, label: "Email" },
            { icon: <MapPin size={14} />, value: client.adresse, label: "Adresse" },
          ].map(item => item.value ? (
            <div key={item.label} className="flex items-center gap-3 text-sm">
              <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">{item.icon}</span>
              <span className="text-gray-700 dark:text-gray-300">{item.value}</span>
            </div>
          ) : null)}
        </div>

        {/* Historique ventes */}
        <div className="px-6 py-4 flex-1">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Receipt size={12} /> Historique ({ventes.length} vente{ventes.length !== 1 ? 's' : ''})
          </h3>
          {ventes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600">
              <Receipt size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune vente pour ce client</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ventes.slice(0, 10).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <p className="text-xs font-mono font-semibold text-primary">{v.numero_facture}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{formatDateTime(v.created_at)}</p>
                  </div>
                  <span className="font-mono font-bold text-sm text-gray-800 dark:text-gray-200">{formatHTG(v.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 350)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [viewing, setViewing] = useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["clients", debouncedSearch],
    queryFn: () => clientApi.getClients(debouncedSearch),
  })

  const clients: ClientWithStats[] = (data as any)?.results ?? (Array.isArray(data) ? data : [])
  const total = (data as any)?.count ?? clients.length

  const saveMutation = useMutation({
    mutationFn: (payload: ClientPayload) =>
      editing ? clientApi.updateClient(editing.id, payload) : clientApi.createClient(payload),
    onSuccess: (saved) => {
      toast.success(editing ? "Client modifié" : "Client ajouté")
      qc.invalidateQueries({ queryKey: ["clients"] })
      setShowModal(false)
      setEditing(null)
      if (viewing) setViewing(saved)
    },
    onError: (err: any) => toast.error(err.response?.data?.detail ?? "Erreur"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientApi.deleteClient(id),
    onSuccess: () => {
      toast.success("Client supprimé")
      qc.invalidateQueries({ queryKey: ["clients"] })
      setDeleteTarget(null)
      setViewing(null)
    },
    onError: () => toast.error("Impossible de supprimer ce client"),
  })

  const openCreate = () => { setEditing(null); setShowModal(true) }
  const openEdit = (c: Client) => { setEditing(c); setViewing(null); setShowModal(true) }
  const openDelete = (c: Client) => setDeleteTarget(c)

  const stats = [
    { label: "Total clients", value: total, icon: <Users size={18} className="text-white" />, color: "bg-primary" },
    { label: "Avec entreprise", value: clients.filter(c => c.entreprise).length, icon: <Building2 size={18} className="text-white" />, color: "bg-blue-500" },
    { label: "Points fidélité max", value: Math.max(...clients.map(c => c.points_fidelite ?? 0), 0), icon: <Star size={18} className="text-white" />, color: "bg-amber-500" },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {total} client{total !== 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition shadow-md shadow-gray-500/25">
            <Download size={16} />
            Exporter
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
          >
            <Plus size={16} />
            Nouveau client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
              <p className="font-bold text-xl text-gray-900 dark:text-white leading-none mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tableau des clients */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users size={14} className="text-primary" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Liste des clients</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {["Client", "Contact", "Entreprise", "Points", "Total achats", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-8">
                      <div className="animate-pulse flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-600">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucun client trouvé</p>
                  </td>
                </tr>
              ) : (
                clients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm',
                          ['bg-primary', 'bg-violet-500', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500'][(client.nom.charCodeAt(0) || 0) % 5]
                        )}>
                          {client.prenom?.[0]}{client.nom[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">
                            {client.prenom} {client.nom}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Client depuis {formatDateTime(client.created_at).split(' ')[0]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {client.telephone && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Phone size={10} /> {client.telephone}
                        </p>
                      )}
                      {client.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                          <Mail size={10} /> {client.email}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {client.entreprise || <span className="text-gray-400 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                        <Star size={10} />
                        {client.points_fidelite ?? 0} pts
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-primary">
                      {formatHTG(client.total_achats || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewing(client)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                          title="Voir détails"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => openEdit(client)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                          title="Modifier"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(client)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout / Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xl border border-gray-100 dark:border-gray-800">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
                  {editing ? "Modifier le client" : "Nouveau client"}
                </h2>
                {editing && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Modification de {editing.prenom} {editing.nom}
                  </p>
                )}
              </div>
              <button 
                onClick={() => { setShowModal(false); setEditing(null) }} 
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <ClientForm
                initial={editing}
                onSubmit={data => saveMutation.mutate(data)}
                onCancel={() => { setShowModal(false); setEditing(null) }}
                isLoading={saveMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-gray-800 p-6 text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Supprimer ce client ?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <strong className="text-gray-700 dark:text-gray-300">{deleteTarget.prenom} {deleteTarget.nom}</strong> sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer Détails Client */}
      {viewing && (
        <ClientDrawer
          client={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => openEdit(viewing)}
        />
      )}
    </div>
  )
}