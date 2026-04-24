import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Receipt, Search, Eye, X, Loader2, Package, CreditCard, User, Store } from "lucide-react"
import api from "../../lib/axios"
import type { Vente } from "../../types"
import { formatHTG, formatDateTime } from "../../shared/utils/format"
import clsx from "clsx"

const STATUS_COLOR: Record<string, string> = { 
  validee: "bg-emerald-500", 
  annulee: "bg-red-500", 
  en_attente: "bg-orange-500" 
}

const STATUS_LABEL: Record<string, string> = { 
  validee: "Validée", 
  annulee: "Annulée", 
  en_attente: "En attente" 
}

export default function VentesPage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Vente | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["ventes", search],
    queryFn: () => api.get(`/ventes/?search=${search}`).then(r => r.data.results ?? r.data),
  })

  const ventes: Vente[] = data ?? []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ventes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {ventes.length} vente{ventes.length > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par facture, client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
        />
      </div>

      {/* Tableau des ventes */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Receipt size={14} className="text-primary" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Liste des ventes</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {["N° Facture", "Date", "Client", "Vendeur", "Total", "Paiement", "Statut", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto text-gray-400 dark:text-gray-600" />
                  </td>
                </tr>
              ) : ventes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-600">
                    <Receipt size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucune vente trouvée</p>
                  </td>
                </tr>
              ) : (
                ventes.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary font-semibold text-xs">{v.numero_facture}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(v.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      {v.client_nom ?? <span className="text-gray-400 dark:text-gray-600">Anonyme</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.vendeur_nom}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary">{formatHTG(v.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Espèces
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={clsx(
                        "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white",
                        STATUS_COLOR[v.statut]
                      )}>
                        {STATUS_LABEL[v.statut]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(v)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                        title="Voir détails"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails Vente */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Receipt size={14} className="text-primary" />
                </div>
                <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
                  {selected.numero_facture}
                </h2>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Date</p>
                  <p className="font-medium text-gray-800 dark:text-white text-sm">
                    {formatDateTime(selected.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Mode de paiement</p>
                  <p className="font-medium text-gray-800 dark:text-white text-sm flex items-center gap-1.5">
                    <CreditCard size={12} className="text-gray-400" />
                    Espèces HTG
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Client</p>
                  <p className="font-medium text-gray-800 dark:text-white text-sm flex items-center gap-1.5">
                    <User size={12} className="text-gray-400" />
                    {selected.client_nom ?? "Anonyme"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Vendeur</p>
                  <p className="font-medium text-gray-800 dark:text-white text-sm flex items-center gap-1.5">
                    <Store size={12} className="text-gray-400" />
                    {selected.vendeur_nom ?? "—"}
                  </p>
                </div>
              </div>

              {/* Produits achetés */}
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2">
                  <Package size={14} />
                  Produits achetés
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        {["Produit", "Qté", "P.U.", "Sous-total"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selected.lignes.map(l => (
                        <tr key={l.id}>
                          <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{l.nom_produit}</td>
                          <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{l.quantite}</td>
                          <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{formatHTG(l.prix_unitaire)}</td>
                          <td className="px-3 py-2 font-mono font-semibold text-primary">{formatHTG(l.sous_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totaux */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span className="font-mono">{formatHTG(selected.sous_total)}</span>
                </div>
                {parseFloat(String(selected.remise_montant)) > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Remise</span>
                    <span className="font-mono">-{formatHTG(selected.remise_montant)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-800 dark:text-white">TOTAL</span>
                  <span className="text-primary font-mono">{formatHTG(selected.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Reçu</span>
                  <span className="font-mono">{formatHTG(selected.montant_recu)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Monnaie rendue</span>
                  <span className="font-mono">{formatHTG(selected.monnaie_rendue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}