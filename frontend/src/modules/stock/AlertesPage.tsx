import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, XCircle, Clock, PackageX, ArrowRight, Package, TrendingDown, Calendar } from "lucide-react"
import api from "../../lib/axios"
import type { Produit } from "../../types"
import { formatDate, formatHTG } from "../../shared/utils/format"
import clsx from "clsx"

interface AlertSectionProps {
  title: string
  icon: React.ReactNode
  produits: Produit[]
  color: string
  emptyText: string
}

function AlertSection({ title, icon, produits, color, emptyText }: AlertSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
      <div className={clsx(
        "flex items-center gap-3 px-5 py-4 border-b",
        color,
        "border-gray-100 dark:border-gray-800"
      )}>
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
        <span className="ml-auto bg-white/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold px-2 py-0.5 rounded-full text-xs">
          {produits.length}
        </span>
      </div>
      
      {produits.length === 0 ? (
        <div className="py-12 text-center text-gray-400 dark:text-gray-600">
          <div className="flex flex-col items-center gap-2">
            <Package size={32} className="opacity-30" />
            <p className="text-sm">{emptyText}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {["Médicament", "Stock actuel", "Stock min", "Expiration", "Prix vente"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {produits.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{p.nom_commercial}</p>
                    {p.nom_generique && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.nom_generique}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">{p.stock_actuel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-gray-500 dark:text-gray-400">{p.stock_minimum}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(p.date_expiration ?? "")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-primary font-medium">{formatHTG(p.prix_vente)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AlertesPage() {
  const { data: expires = [] } = useQuery({ 
    queryKey: ["alertes-expires"], 
    queryFn: () => api.get("/produits/expires/").then(r => r.data) 
  })
  
  const { data: expireBientot = [] } = useQuery({ 
    queryKey: ["alertes-expire-bientot"], 
    queryFn: () => api.get("/produits/expire-bientot/").then(r => r.data) 
  })
  
  const { data: stockFaible = [] } = useQuery({ 
    queryKey: ["alertes-stock-faible"], 
    queryFn: () => api.get("/produits/stock-faible/").then(r => r.data) 
  })

  const total = expires.length + expireBientot.length + stockFaible.length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Alertes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {total} alerte{total > 1 ? 's' : ''} à surveiller
          </p>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <XCircle size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{expires.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Médicaments expirés</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{expireBientot.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expirent dans 30 jours</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-900/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <PackageX size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stockFaible.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Stock faible / rupture</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections d'alertes */}
      <AlertSection 
        title="Médicaments expirés" 
        icon={<XCircle size={14} className="text-white" />} 
        produits={expires} 
        color="bg-red-500/10 dark:bg-red-500/5 border-b-red-200 dark:border-b-red-900/30"
        emptyText="Aucun médicament expiré" 
      />
      
      <AlertSection 
        title="Expirent dans les 30 prochains jours" 
        icon={<Clock size={14} className="text-white" />} 
        produits={expireBientot} 
        color="bg-amber-500/10 dark:bg-amber-500/5 border-b-amber-200 dark:border-b-amber-900/30"
        emptyText="Aucun médicament à risque d'expiration" 
      />
      
      <AlertSection 
        title="Stock faible ou en rupture" 
        icon={<PackageX size={14} className="text-white" />} 
        produits={stockFaible} 
        color="bg-orange-500/10 dark:bg-orange-500/5 border-b-orange-200 dark:border-b-orange-900/30"
        emptyText="Tous les stocks sont suffisants" 
      />
    </div>
  )
}