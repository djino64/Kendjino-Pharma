// import { useState } from "react"
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
// import {
//   Plus, Search, Truck, X, Edit2, Trash2,
//   Phone, Mail, MapPin, Package, ShoppingBag, Globe, CheckCircle2, XCircle
// } from "lucide-react"
// import toast from "react-hot-toast"
// import { useDebounce } from "../../shared/hooks/useDebounce"
// import { fournisseurApi, type FournisseurPayload } from "../fournisseurs/api/fournisseurApi"
// import FournisseurForm from "./FournisseurForm"
// import type { Fournisseur } from "../../types"
// import { formatHTG, formatDate } from "../../shared/utils/format"
// import clsx from "clsx"

// function FournisseurCard({ f, onEdit, onDelete, onView, active }: {
//   f: Fournisseur; onEdit: () => void; onDelete: () => void; onView: () => void; active: boolean
// }) {
//   return (
//     <div
//       onClick={onView}
//       className={clsx(
//         "card p-5 cursor-pointer hover:shadow-card-hover transition-all border-2",
//         active ? "border-primary shadow-card-hover" : "border-transparent"
//       )}
//     >
//       <div className="flex items-start justify-between mb-4">
//         <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
//           <Truck size={20} className="text-blue-500" />
//         </div>
//         <div className="flex items-center gap-1">
//           <span className={clsx("w-2 h-2 rounded-full", f.est_actif ? "bg-primary" : "bg-gray-300")} />
//           <span className="text-[11px] text-gray-400">{f.est_actif ? "Actif" : "Inactif"}</span>
//         </div>
//       </div>

//       <h3 className="font-display font-semibold text-gray-900 mb-0.5 truncate">{f.nom}</h3>
//       {f.contact && <p className="text-sm text-gray-500 mb-3 truncate">{f.contact}</p>}

//       <div className="space-y-1.5 mb-4">
//         {f.telephone && (
//           <p className="text-xs text-gray-500 flex items-center gap-2">
//             <Phone size={12} className="text-gray-400 flex-shrink-0" />{f.telephone}
//           </p>
//         )}
//         {f.email && (
//           <p className="text-xs text-gray-500 flex items-center gap-2 truncate">
//             <Mail size={12} className="text-gray-400 flex-shrink-0" />{f.email}
//           </p>
//         )}
//         <p className="text-xs text-gray-500 flex items-center gap-2">
//           <Globe size={12} className="text-gray-400 flex-shrink-0" />{f.pays}
//         </p>
//       </div>

//       <div className="flex items-center justify-between pt-3 border-t border-gray-100">
//         <span className="text-xs text-gray-400">{(f as any).nb_produits ?? 0} produits</span>
//         <div className="flex gap-1" onClick={e => e.stopPropagation()}>
//           <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
//             <Edit2 size={13} />
//           </button>
//           <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//             <Trash2 size={13} />
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// function FournisseurDetail({ f, onClose, onEdit }: { f: Fournisseur; onClose: () => void; onEdit: () => void }) {
//   const { data: achats = [] } = useQuery({
//     queryKey: ["fournisseur-achats", f.id],
//     queryFn: () => fournisseurApi.achats(f.id),
//   })
//   const { data: produits = [] } = useQuery({
//     queryKey: ["fournisseur-produits", f.id],
//     queryFn: () => fournisseurApi.produits(f.id),
//   })

//   return (
//     <div className="card overflow-hidden">
//       <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
//         <h3 className="font-display font-semibold text-gray-800">Détail fournisseur</h3>
//         <div className="flex gap-2">
//           <button onClick={onEdit} className="btn-secondary text-sm py-1.5">Modifier</button>
//           <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
//             <X size={16} />
//           </button>
//         </div>
//       </div>

//       <div className="p-5 space-y-5">
//         {/* Info */}
//         <div className="flex items-start gap-4">
//           <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
//             <Truck size={24} className="text-blue-500" />
//           </div>
//           <div>
//             <h2 className="font-display font-bold text-xl text-gray-900">{f.nom}</h2>
//             {f.contact && <p className="text-sm text-gray-500">{f.contact}</p>}
//             <span className={clsx(
//               "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1",
//               f.est_actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
//             )}>
//               {f.est_actif ? <CheckCircle2 size={11}/> : <XCircle size={11}/>}
//               {f.est_actif ? "Actif" : "Inactif"}
//             </span>
//           </div>
//         </div>

//         {/* Coordonnées */}
//         <div className="grid grid-cols-2 gap-3">
//           {[
//             { icon: <Phone size={14}/>, label: "Téléphone", value: f.telephone },
//             { icon: <Mail size={14}/>, label: "Email", value: f.email },
//             { icon: <MapPin size={14}/>, label: "Adresse", value: f.adresse },
//             { icon: <Globe size={14}/>, label: "Pays", value: f.pays },
//           ].map(item => item.value ? (
//             <div key={item.label} className="bg-gray-50 rounded-xl p-3">
//               <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-0.5">{item.icon}{item.label}</p>
//               <p className="text-sm font-medium text-gray-700 truncate">{item.value}</p>
//             </div>
//           ) : null)}
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 gap-3">
//           <div className="bg-primary/5 rounded-xl p-3 text-center">
//             <p className="text-2xl font-display font-bold text-primary">{produits.length}</p>
//             <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5"><Package size={11}/>Produits</p>
//           </div>
//           <div className="bg-blue-50 rounded-xl p-3 text-center">
//             <p className="text-2xl font-display font-bold text-blue-600">{achats.length}</p>
//             <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5"><ShoppingBag size={11}/>Commandes</p>
//           </div>
//         </div>

//         {/* Recent achats */}
//         {achats.length > 0 && (
//           <div>
//             <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dernières commandes</h4>
//             <div className="space-y-2">
//               {achats.slice(0, 5).map((a: any) => (
//                 <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                   <div>
//                     <p className="text-xs font-mono font-semibold text-primary">{a.numero_bon}</p>
//                     <p className="text-[11px] text-gray-400">{formatDate(a.date_commande)}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm font-bold text-gray-800 font-mono">{formatHTG(a.total)}</p>
//                     <span className={clsx("text-[11px] font-medium",
//                       a.statut === "recu" ? "text-green-600" : a.statut === "annule" ? "text-red-500" : "text-amber-600"
//                     )}>{a.statut === "recu" ? "Reçu" : a.statut === "annule" ? "Annulé" : "En cours"}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default function FournisseursPage() {
//   const qc = useQueryClient()
//   const [search, setSearch] = useState("")
//   const debouncedSearch = useDebounce(search, 350)
//   const [showModal, setShowModal] = useState(false)
//   const [editing, setEditing] = useState<Fournisseur | null>(null)
//   const [selected, setSelected] = useState<Fournisseur | null>(null)
//   const [deleteTarget, setDeleteTarget] = useState<Fournisseur | null>(null)

//   const { data, isLoading } = useQuery({
//     queryKey: ["fournisseurs", debouncedSearch],
//     queryFn: () => fournisseurApi.list(debouncedSearch),
//   })
//   const fournisseurs: Fournisseur[] = (data as any)?.results ?? (Array.isArray(data) ? data : [])

//   const saveMutation = useMutation({
//     mutationFn: (payload: FournisseurPayload) =>
//       editing ? fournisseurApi.update(editing.id, payload) : fournisseurApi.create(payload),
//     onSuccess: () => {
//       toast.success(editing ? "Fournisseur mis à jour" : "Fournisseur ajouté !")
//       qc.invalidateQueries({ queryKey: ["fournisseurs"] })
//       setShowModal(false); setEditing(null)
//     },
//     onError: () => toast.error("Erreur lors de la sauvegarde"),
//   })

//   const deleteMutation = useMutation({
//     mutationFn: (id: number) => fournisseurApi.delete(id),
//     onSuccess: () => {
//       toast.success("Fournisseur supprimé")
//       qc.invalidateQueries({ queryKey: ["fournisseurs"] })
//       setDeleteTarget(null); setSelected(null)
//     },
//   })

//   return (
//     <div className="space-y-5">
//       {/* Toolbar */}
//       <div className="flex gap-3">
//         <div className="relative flex-1 max-w-sm">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un fournisseur..." className="input-field pl-9" />
//         </div>
//         <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary ml-auto">
//           <Plus size={16} /> Nouveau fournisseur
//         </button>
//       </div>

//       {/* Layout: grid + detail panel */}
//       <div className={clsx("grid gap-5 transition-all", selected ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1")}>
//         {/* Cards grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
//           {isLoading
//             ? [...Array(6)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-gray-50" />)
//             : fournisseurs.length === 0
//             ? (
//               <div className="col-span-full card p-16 text-center text-gray-400">
//                 <Truck size={40} className="mx-auto mb-3 opacity-25" />
//                 <p className="font-medium text-gray-500">Aucun fournisseur</p>
//               </div>
//             )
//             : fournisseurs.map(f => (
//               <FournisseurCard
//                 key={f.id} f={f}
//                 active={selected?.id === f.id}
//                 onView={() => setSelected(selected?.id === f.id ? null : f)}
//                 onEdit={() => { setEditing(f); setShowModal(true) }}
//                 onDelete={() => setDeleteTarget(f)}
//               />
//             ))
//           }
//         </div>

//         {/* Detail panel */}
//         {selected && (
//           <FournisseurDetail
//             f={selected}
//             onClose={() => setSelected(null)}
//             onEdit={() => { setEditing(selected); setShowModal(true) }}
//           />
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
//             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//               <h3 className="font-display font-semibold">{editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}</h3>
//               <button onClick={() => { setShowModal(false); setEditing(null) }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
//                 <X size={18} />
//               </button>
//             </div>
//             <div className="p-6">
//               <FournisseurForm
//                 initial={editing}
//                 onSubmit={data => saveMutation.mutate(data)}
//                 onCancel={() => { setShowModal(false); setEditing(null) }}
//                 isLoading={saveMutation.isPending}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirm */}
//       {deleteTarget && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
//             <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Truck size={24} className="text-red-500" />
//             </div>
//             <h3 className="font-display font-semibold text-gray-900 mb-1">Supprimer ce fournisseur ?</h3>
//             <p className="text-sm text-gray-500 mb-6"><strong>{deleteTarget.nom}</strong> sera supprimé définitivement.</p>
//             <div className="flex gap-3">
//               <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 justify-center">Annuler</button>
//               <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="btn-danger flex-1 justify-center">
//                 {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus, Search, Truck, X, Edit2, Trash2,
  Phone, Mail, MapPin, Package, ShoppingBag,
  Globe, CheckCircle2, XCircle
} from "lucide-react"
import toast from "react-hot-toast"
import { useDebounce } from "../../shared/hooks/useDebounce"
import { fournisseurApi, type FournisseurPayload } from "../fournisseurs/api/fournisseurApi"
import FournisseurForm from "./FournisseurForm"
import type { Fournisseur } from "../../types"
import { formatHTG, formatDate } from "../../shared/utils/format"
import clsx from "clsx"

// ─────────────────────────────────────────
// CARD
// ─────────────────────────────────────────
function FournisseurCard({ f, onEdit, onDelete, onView, active }: {
  f: Fournisseur; onEdit: () => void; onDelete: () => void; onView: () => void; active: boolean
}) {
  return (
    <div
      onClick={onView}
      className={clsx(
        "bg-white dark:bg-gray-900 rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md group",
        active
          ? "border-primary shadow-md shadow-primary/10"
          : "border-gray-100 dark:border-gray-800 hover:border-primary/30"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <Truck size={20} className="text-blue-500" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={clsx(
            "w-2 h-2 rounded-full",
            f.est_actif ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
          )} />
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {f.est_actif ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5 truncate">{f.nom}</h3>
      {f.contact && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">{f.contact}</p>
      )}

      <div className="space-y-1.5 mb-4">
        {f.telephone && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Phone size={12} className="text-gray-400 flex-shrink-0" />{f.telephone}
          </p>
        )}
        {f.email && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 truncate">
            <Mail size={12} className="text-gray-400 flex-shrink-0" />{f.email}
          </p>
        )}
        {f.pays && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Globe size={12} className="text-gray-400 flex-shrink-0" />{f.pays}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <Package size={11} />
          {(f as any).nb_produits ?? 0} produit{((f as any).nb_produits ?? 0) > 1 ? "s" : ""}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────
function FournisseurDetail({ f, onClose, onEdit }: {
  f: Fournisseur; onClose: () => void; onEdit: () => void
}) {
  const { data: achats = [] } = useQuery({
    queryKey: ["fournisseur-achats", f.id],
    queryFn: () => fournisseurApi.achats(f.id),
  })
  const { data: produits = [] } = useQuery({
    queryKey: ["fournisseur-produits", f.id],
    queryFn: () => fournisseurApi.produits(f.id),
  })

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Détail fournisseur</h3>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Edit2 size={12} /> Modifier
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-200px)]">

        {/* Identity */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Truck size={24} className="text-blue-500" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900 dark:text-white">{f.nom}</h2>
            {f.contact && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.contact}</p>
            )}
            <span className={clsx(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1",
              f.est_actif
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            )}>
              {f.est_actif ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
              {f.est_actif ? "Actif" : "Inactif"}
            </span>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: <Phone size={13} />, label: "Téléphone", value: f.telephone },
            { icon: <Mail size={13} />, label: "Email", value: f.email },
            { icon: <MapPin size={13} />, label: "Adresse", value: f.adresse },
            { icon: <Globe size={13} />, label: "Pays", value: f.pays },
          ].filter(item => item.value).map(item => (
            <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-0.5">
                {item.icon}{item.label}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{produits.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mt-0.5">
              <Package size={11} /> Produits
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{achats.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mt-0.5">
              <ShoppingBag size={11} /> Commandes
            </p>
          </div>
        </div>

        {/* Dernières commandes */}
        {achats.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              Dernières commandes
            </p>
            <div className="space-y-2">
              {(achats as any[]).slice(0, 5).map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <div>
                    <p className="text-xs font-mono font-semibold text-primary">{a.numero_bon}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{formatDate(a.date_commande)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800 dark:text-white font-mono">
                      {formatHTG(a.total)}
                    </p>
                    <span className={clsx(
                      "text-[11px] font-medium",
                      a.statut === "recu"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : a.statut === "annule"
                        ? "text-red-500"
                        : "text-amber-600 dark:text-amber-400"
                    )}>
                      {a.statut === "recu" ? "Reçu" : a.statut === "annule" ? "Annulé" : "En cours"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────
export default function FournisseursPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 350)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Fournisseur | null>(null)
  const [selected, setSelected] = useState<Fournisseur | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Fournisseur | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["fournisseurs", debouncedSearch],
    queryFn: () => fournisseurApi.list(debouncedSearch),
  })
  const fournisseurs: Fournisseur[] = (data as any)?.results ?? (Array.isArray(data) ? data : [])

  const saveMutation = useMutation({
    mutationFn: (payload: FournisseurPayload) =>
      editing ? fournisseurApi.update(editing.id, payload) : fournisseurApi.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Fournisseur mis à jour" : "Fournisseur ajouté !")
      qc.invalidateQueries({ queryKey: ["fournisseurs"] })
      setShowModal(false)
      setEditing(null)
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fournisseurApi.delete(id),
    onSuccess: () => {
      toast.success("Fournisseur supprimé")
      qc.invalidateQueries({ queryKey: ["fournisseurs"] })
      setDeleteTarget(null)
      setSelected(null)
    },
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fournisseurs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {fournisseurs.length} fournisseur{fournisseurs.length > 1 ? "s" : ""} enregistré{fournisseurs.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
        >
          <Plus size={16} />
          Nouveau fournisseur
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un fournisseur..."
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
        />
      </div>

      {/* Layout grid + panel */}
      <div className={clsx(
        "grid gap-5 transition-all",
        selected ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1"
      )}>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          {isLoading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="h-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl animate-pulse" />
              ))
            : fournisseurs.length === 0
            ? (
              <div className="col-span-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-16 text-center">
                <Truck size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aucun fournisseur trouvé</p>
              </div>
            )
            : fournisseurs.map(f => (
              <FournisseurCard
                key={f.id}
                f={f}
                active={selected?.id === f.id}
                onView={() => setSelected(selected?.id === f.id ? null : f)}
                onEdit={() => { setEditing(f); setShowModal(true) }}
                onDelete={() => setDeleteTarget(f)}
              />
            ))
          }
        </div>

        {/* Detail panel */}
        {selected && (
          <FournisseurDetail
            f={selected}
            onClose={() => setSelected(null)}
            onEdit={() => { setEditing(selected); setShowModal(true) }}
          />
        )}
      </div>

      {/* Modal Créer / Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                {editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditing(null) }}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <FournisseurForm
                initial={editing}
                onSubmit={data => saveMutation.mutate(data)}
                onCancel={() => { setShowModal(false); setEditing(null) }}
                isLoading={saveMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={24} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Supprimer ce fournisseur ?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <strong className="text-gray-700 dark:text-gray-300">{deleteTarget.nom}</strong> sera supprimé définitivement.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition shadow-sm shadow-red-500/25"
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
