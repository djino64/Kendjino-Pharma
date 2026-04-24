import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, ShoppingBag, Eye, CheckCircle2, X, Loader2, Trash2, Package, Calendar, Truck, Save } from "lucide-react"
import toast from "react-hot-toast"
import api from "../../lib/axios"
import type { Achat, Fournisseur, Produit } from "../../types"
import { formatHTG, formatDateTime } from "../../shared/utils/format"
import clsx from "clsx"

interface LigneForm { 
  produit: string; 
  quantite: string; 
  prix_unitaire: string; 
  date_expiration: string; 
  numero_lot: string 
}

const STATUT_COLOR: Record<string, string> = { 
  en_cours: "bg-orange-500", 
  recu: "bg-emerald-500", 
  annule: "bg-red-500" 
}

const STATUT_LABEL: Record<string, string> = { 
  en_cours: "En cours", 
  recu: "Reçu", 
  annule: "Annulé" 
}

export default function AchatsPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [fournisseur, setFournisseur] = useState("")
  const [lignes, setLignes] = useState<LigneForm[]>([{ 
    produit: "", 
    quantite: "1", 
    prix_unitaire: "", 
    date_expiration: "", 
    numero_lot: "" 
  }])

  const { data: achats = [], isLoading } = useQuery({ 
    queryKey: ["achats"], 
    queryFn: () => api.get("/achats/").then(r => r.data.results ?? r.data) 
  })
  
  const { data: fournisseurs = [] } = useQuery({ 
    queryKey: ["fournisseurs"], 
    queryFn: () => api.get("/fournisseurs/").then(r => r.data.results ?? r.data) 
  })
  
  const { data: produits = [] } = useQuery({ 
    queryKey: ["produits-all"], 
    queryFn: () => api.get("/produits/?page_size=1000").then(r => r.data.results ?? r.data) 
  })

  const createMutation = useMutation({
    mutationFn: (p: any) => api.post("/achats/", p),
    onSuccess: () => { 
      toast.success("Bon d'achat créé"); 
      qc.invalidateQueries({ queryKey: ["achats"] }); 
      setShowModal(false); 
      setLignes([{ produit: "", quantite: "1", prix_unitaire: "", date_expiration: "", numero_lot: "" }]); 
      setFournisseur("") 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Erreur lors de la création"),
  })
  
  const recevoirMutation = useMutation({
    mutationFn: (id: number) => api.post(`/achats/${id}/recevoir/`),
    onSuccess: () => { 
      toast.success("Stock mis à jour !"); 
      qc.invalidateQueries({ queryKey: ["achats"] }) 
    },
    onError: () => toast.error("Erreur lors de la réception"),
  })

  const addLigne = () => setLignes(l => [...l, { 
    produit: "", 
    quantite: "1", 
    prix_unitaire: "", 
    date_expiration: "", 
    numero_lot: "" 
  }])
  
  const removeLigne = (i: number) => setLignes(l => l.filter((_, j) => j !== i))
  
  const updateLigne = (i: number, key: keyof LigneForm, val: string) => 
    setLignes(l => l.map((ligne, j) => j === i ? { ...ligne, [key]: val } : ligne))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fournisseur) return toast.error("Veuillez sélectionner un fournisseur")
    if (lignes.some(l => !l.produit || !l.quantite || !l.prix_unitaire)) {
      return toast.error("Veuillez remplir tous les champs des produits")
    }
    createMutation.mutate({
      fournisseur,
      lignes: lignes.map(l => ({ 
        produit: l.produit, 
        quantite: parseInt(l.quantite), 
        prix_unitaire: parseFloat(l.prix_unitaire), 
        date_expiration: l.date_expiration || null, 
        numero_lot: l.numero_lot 
      })),
      statut: "en_cours",
    })
  }

  const achatsList = achats as Achat[]
  const fournisseursList = fournisseurs as Fournisseur[]
  const produitsList = produits as Produit[]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Achats</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {achatsList.length} bon{achatsList.length > 1 ? 's' : ''} d'achat au total
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
        >
          <Plus size={16} />
          Nouveau bon d'achat
        </button>
      </div>

      {/* Tableau des achats */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingBag size={14} className="text-primary" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Liste des bons d'achat</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {["N° Bon", "Fournisseur", "Responsable", "Total", "Date", "Statut", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto text-gray-400 dark:text-gray-600" />
                  </td>
                </tr>
              ) : achatsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-600">
                    <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucun bon d'achat</p>
                  </td>
                </tr>
              ) : (
                achatsList.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary font-semibold text-xs">{a.numero_bon}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{a.fournisseur_nom}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.responsable_nom}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary">{formatHTG(a.total)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDateTime(a.date_commande)}</td>
                    <td className="px-4 py-3">
                      <div className={clsx(
                        "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white",
                        STATUT_COLOR[a.statut]
                      )}>
                        {STATUT_LABEL[a.statut]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {a.statut === "en_cours" && (
                        <button
                          onClick={() => { 
                            if (confirm("Marquer comme reçu et mettre à jour le stock ?")) 
                              recevoirMutation.mutate(a.id) 
                          }}
                          className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle2 size={13} />
                          Recevoir
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouveau bon d'achat */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
              <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
                Nouveau bon d'achat
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Fournisseur */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Fournisseur *
                </label>
                <select
                  required
                  value={fournisseur}
                  onChange={e => setFournisseur(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                >
                  <option value="">— Sélectionner un fournisseur —</option>
                  {fournisseursList.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>

              {/* Produits commandés */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Produits commandés *
                  </label>
                  <button
                    type="button"
                    onClick={addLigne}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition"
                  >
                    <Plus size={12} />
                    Ajouter un produit
                  </button>
                </div>
                
                <div className="space-y-3">
                  {lignes.map((ligne, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                      <div className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-12 sm:col-span-4">
                          <select
                            required
                            value={ligne.produit}
                            onChange={e => updateLigne(i, "produit", e.target.value)}
                            className="w-full px-2 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                          >
                            <option value="">Médicament *</option>
                            {produitsList.map(p => (
                              <option key={p.id} value={p.id}>{p.nom_commercial}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="col-span-6 sm:col-span-2">
                          <input
                            required
                            type="number"
                            min="1"
                            value={ligne.quantite}
                            onChange={e => updateLigne(i, "quantite", e.target.value)}
                            placeholder="Quantité"
                            className="w-full px-2 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-2">
                          <input
                            required
                            type="number"
                            step="0.01"
                            value={ligne.prix_unitaire}
                            onChange={e => updateLigne(i, "prix_unitaire", e.target.value)}
                            placeholder="Prix unitaire"
                            className="w-full px-2 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                          />
                        </div>
                        
                        <div className="col-span-10 sm:col-span-3">
                          <input
                            type="date"
                            value={ligne.date_expiration}
                            onChange={e => updateLigne(i, "date_expiration", e.target.value)}
                            className="w-full px-2 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                          />
                        </div>
                        
                        <div className="col-span-2 sm:col-span-1 flex justify-end">
                          {lignes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLigne(i)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
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
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-sm shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Créer le bon d'achat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}