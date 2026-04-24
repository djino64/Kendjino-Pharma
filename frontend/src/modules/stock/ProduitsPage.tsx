import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus, Search, Edit2, Trash2, Package, X, AlertTriangle,
  ChevronDown, ChevronUp, Filter, SlidersHorizontal,
  ArrowUpDown, CheckCircle2, Loader2, Save
} from "lucide-react"
import toast from "react-hot-toast"
import { useDebounce } from "../../shared/hooks/useDebounce"
import { stockApi, type ProduitPayload } from "./api/stockApi"
import ProduitForm from "./ProduitForm"
import type { Produit } from "../../types"
import { formatHTG, formatDate } from "../../shared/utils/format"
import clsx from "clsx"

type SortKey = "nom_commercial" | "stock_actuel" | "prix_vente" | "date_expiration"
type SortDir = "asc" | "desc"

function StatusBadge({ produit }: { produit: Produit }) {
  if (produit.est_expire) return <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white bg-red-500">Expiré</span>
  if (produit.expire_bientot) return <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white bg-orange-500">Bientôt expiré</span>
  if (produit.est_en_rupture) return <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white bg-red-500">Rupture</span>
  if (produit.est_stock_faible) return <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white bg-amber-500">Stock faible</span>
  return <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white bg-emerald-500">OK</span>
}

function StockBar({ current, min }: { current: number; min: number }) {
  const pct = min > 0 ? Math.min((current / (min * 3)) * 100, 100) : 100
  const color = current <= 0 ? "bg-red-500" : current <= min ? "bg-amber-500" : "bg-primary"
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 flex-shrink-0">
        <div className={clsx("h-1.5 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={clsx(
        "text-xs font-mono font-bold",
        current <= 0 ? "text-red-600 dark:text-red-400" : 
        current <= min ? "text-amber-600 dark:text-amber-400" : 
        "text-gray-700 dark:text-gray-300"
      )}>
        {current}
      </span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${50 + (i * 17) % 45}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function ProduitsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 350)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Produit | null>(null)
  const [adjusting, setAdjusting] = useState<Produit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Produit | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "ok" | "alerte" | "rupture">("all")
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "nom_commercial", dir: "asc" })
  const [showFilters, setShowFilters] = useState(false)

  const { data: alertesData } = useQuery({ 
    queryKey: ["alertes-count"], 
    queryFn: stockApi.alertes 
  })
  
  const { data, isLoading } = useQuery({
    queryKey: ["produits", debouncedSearch],
    queryFn: () => stockApi.list({ search: debouncedSearch, page_size: "100" }),
  })

  const allProduits: Produit[] = (data as any)?.results ?? (Array.isArray(data) ? data : [])

  const filtered = allProduits
    .filter(p => {
      if (filterStatus === "ok") return !p.est_en_rupture && !p.est_stock_faible && !p.est_expire && !p.expire_bientot
      if (filterStatus === "alerte") return p.est_stock_faible || p.expire_bientot
      if (filterStatus === "rupture") return p.est_en_rupture || p.est_expire
      return true
    })
    .sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1
      if (sort.key === "nom_commercial") return a.nom_commercial.localeCompare(b.nom_commercial) * dir
      if (sort.key === "stock_actuel") return (a.stock_actuel - b.stock_actuel) * dir
      if (sort.key === "prix_vente") return (Number(a.prix_vente) - Number(b.prix_vente)) * dir
      if (sort.key === "date_expiration") {
        if (!a.date_expiration) return 1
        if (!b.date_expiration) return -1
        return a.date_expiration.localeCompare(b.date_expiration) * dir
      }
      return 0
    })

  const saveMutation = useMutation({
    mutationFn: (p: ProduitPayload) => editing ? stockApi.update(editing.id, p) : stockApi.create(p),
    onSuccess: () => {
      toast.success(editing ? "Médicament modifié" : "Médicament ajouté")
      qc.invalidateQueries({ queryKey: ["produits"] })
      qc.invalidateQueries({ queryKey: ["alertes-count"] })
      setShowModal(false)
      setEditing(null)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Une erreur est survenue"),
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => stockApi.delete(id),
    onSuccess: () => {
      toast.success("Médicament supprimé")
      qc.invalidateQueries({ queryKey: ["produits"] })
      setDeleteTarget(null)
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  })

  const toggleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" })
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex">
      {sort.key === col
        ? sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        : <ArrowUpDown size={10} className="opacity-30" />
      }
    </span>
  )

  const alertes = alertesData ?? {}
  const totalAlertes = (alertes.rupture ?? 0) + (alertes.stock_faible ?? 0) + (alertes.expires ?? 0) + (alertes.expire_bientot ?? 0)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Médicaments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {allProduits.length} médicament{allProduits.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
        >
          <Plus size={16} />
          Nouveau médicament
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, générique, code-barres..."
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition",
            showFilters 
              ? "bg-primary text-white shadow-sm shadow-primary/25" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          <SlidersHorizontal size={14} />
          Filtres
          {totalAlertes > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalAlertes > 9 ? "9+" : totalAlertes}
            </span>
          )}
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
              <Filter size={12} /> Statut
            </span>
            {[
              { key: "all", label: "Tous", count: allProduits.length },
              { key: "ok", label: "OK", count: allProduits.filter(p => !p.est_en_rupture && !p.est_stock_faible && !p.est_expire && !p.expire_bientot).length },
              { key: "alerte", label: "Alertes", count: (alertes.stock_faible ?? 0) + (alertes.expire_bientot ?? 0) },
              { key: "rupture", label: "Rupture / Expiré", count: (alertes.rupture ?? 0) + (alertes.expires ?? 0) },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key as any)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  filterStatus === f.key 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {f.label}
                <span className={clsx(
                  "text-[11px] px-1.5 py-0.5 rounded-full font-bold",
                  filterStatus === f.key ? "bg-white/20 text-white" : "bg-white dark:bg-gray-700 text-gray-500"
                )}>
                  {f.count}
                </span>
              </button>
            ))}
            <div className="ml-auto text-xs text-gray-400 dark:text-gray-500">
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Alert summary cards */}
      {totalAlertes > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Rupture de stock", count: alertes.rupture ?? 0, color: "bg-red-500" },
            { label: "Stock faible", count: alertes.stock_faible ?? 0, color: "bg-amber-500" },
            { label: "Expirés", count: alertes.expires ?? 0, color: "bg-red-500" },
            { label: "Expire dans 30j", count: alertes.expire_bientot ?? 0, color: "bg-orange-500" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                </div>
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", s.color)}>
                  <AlertTriangle size={18} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={14} className="text-primary" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Liste des médicaments</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("nom_commercial")} className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-300">
                    Médicament <SortIcon col="nom_commercial" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Catégorie</th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("stock_actuel")} className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-300">
                    Stock <SortIcon col="stock_actuel" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("prix_vente")} className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-300">
                    Prix vente <SortIcon col="prix_vente" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button onClick={() => toggleSort("date_expiration")} className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-300">
                    Expiration <SortIcon col="date_expiration" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-600">
                      <Package size={48} className="opacity-30" />
                      <p className="font-medium text-gray-500 dark:text-gray-400">Aucun médicament trouvé</p>
                      <p className="text-xs">Ajoutez votre premier médicament avec le bouton ci-dessus</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm leading-tight">{p.nom_commercial}</p>
                      {p.nom_generique && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.nom_generique}</p>
                      )}
                      {p.numero_lot && (
                        <p className="text-[11px] text-gray-300 dark:text-gray-600 font-mono mt-0.5">#{p.numero_lot}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.categorie_nom ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
                          {p.categorie_nom}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockBar current={p.stock_actuel} min={p.stock_minimum} />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono font-bold text-primary">{formatHTG(p.prix_vente)}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">Achat: {formatHTG(p.prix_achat)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        "text-xs",
                        p.est_expire ? "text-red-500 font-semibold" : 
                        p.expire_bientot ? "text-amber-600 dark:text-amber-400 font-semibold" : 
                        "text-gray-500 dark:text-gray-400"
                      )}>
                        {p.date_expiration ? formatDate(p.date_expiration) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge produit={p} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setAdjusting(p)} 
                          title="Ajuster stock"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                        >
                          <Package size={13} />
                        </button>
                        <button 
                          onClick={() => { setEditing(p); setShowModal(true) }} 
                          title="Modifier"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(p)} 
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
        
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{filtered.length} médicament{filtered.length !== 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-primary" />
              {filtered.filter(p => !p.est_en_rupture && !p.est_stock_faible && !p.est_expire && !p.expire_bientot).length} en stock optimal
            </span>
          </div>
        )}
      </div>

      {/* Modal Ajout / Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl">
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
                  {editing ? "Modifier le médicament" : "Nouveau médicament"}
                </h2>
                {editing && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Modification de {editing.nom_commercial}
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
              <ProduitForm
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
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Supprimer ce médicament ?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <strong className="text-gray-700 dark:text-gray-300">{deleteTarget.nom_commercial}</strong> sera définitivement supprimé.
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
    </div>
  )
}