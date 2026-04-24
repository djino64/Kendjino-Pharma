import { Edit2, Trash2, Eye, Phone, Mail, Building2, Users, Star, MapPin } from "lucide-react"
import type { Client } from "../../types"
import clsx from "clsx"

interface Props {
  clients: Client[]
  isLoading: boolean
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  onView: (client: Client) => void
}

function Avatar({ prenom, nom }: { prenom?: string; nom: string }) {
  const initials = `${prenom?.[0] ?? ""}${nom[0]}`.toUpperCase()
  const colors = [
    "bg-primary",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-cyan-500",
  ]
  const color = colors[(nom.charCodeAt(0) || 0) % colors.length]
  
  return (
    <div className={clsx(
      "w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0",
      color
    )}>
      {initials || <Users size={16} />}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        </div>
      </td>
      {[...Array(4)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </td>
    </tr>
  )
}

export default function ClientTable({ clients, isLoading, onEdit, onDelete, onView }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Téléphone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Entreprise
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Fidélité
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-600">
                    <Users size={48} className="opacity-30" />
                    <p className="font-medium text-gray-500 dark:text-gray-400">Aucun client trouvé</p>
                    <p className="text-xs">Ajoutez votre premier client avec le bouton ci-dessus</p>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map(client => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
                  onClick={() => onView(client)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar prenom={client.prenom} nom={client.nom} />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {client.prenom} {client.nom}
                        </p>
                        {client.adresse && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin size={10} />
                            <span className="truncate max-w-[180px]">{client.adresse}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {client.telephone ? (
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                        <Phone size={12} className="text-gray-400 dark:text-gray-500" />
                        {client.telephone}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {client.email ? (
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                        <Mail size={12} className="text-gray-400 dark:text-gray-500" />
                        <span className="truncate max-w-[160px]">{client.email}</span>
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {client.entreprise ? (
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                        <Building2 size={12} className="text-gray-400 dark:text-gray-500" />
                        <span className="truncate max-w-[140px]">{client.entreprise}</span>
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[80px] bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(((client.points_fidelite ?? 0) / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-amber-500" />
                        <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                          {client.points_fidelite ?? 0}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onView(client)}
                        title="Voir détails"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => onEdit(client)}
                        title="Modifier"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(client)}
                        title="Supprimer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
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
  )
}