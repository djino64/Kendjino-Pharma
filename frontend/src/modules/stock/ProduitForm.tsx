import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Pill, Tag, Hash, DollarSign, Package, Calendar, Truck, Save, X, AlertCircle } from "lucide-react"
import type { Produit } from "../../types"
import type { ProduitPayload } from "./api/stockApi"
import api from "../../lib/axios"
import clsx from "clsx"

interface Props {
  initial?: Produit | null
  onSubmit: (data: ProduitPayload) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ProduitForm({ initial, onSubmit, onCancel, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProduitPayload>()
  const { data: categories = [] } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: () => api.get("/produits/categories/").then(r => r.data.results ?? r.data) 
  })
  const { data: fournisseurs = [] } = useQuery({ 
    queryKey: ["fournisseurs"], 
    queryFn: () => api.get("/fournisseurs/").then(r => r.data.results ?? r.data) 
  })

  useEffect(() => {
    reset(initial ? {
      nom_commercial: initial.nom_commercial,
      nom_generique: initial.nom_generique ?? "",
      categorie: initial.categorie ?? "",
      code_barres: initial.code_barres ?? "",
      prix_achat: initial.prix_achat,
      prix_vente: initial.prix_vente,
      stock_actuel: initial.stock_actuel,
      stock_minimum: initial.stock_minimum,
      date_expiration: initial.date_expiration ?? "",
      numero_lot: initial.numero_lot ?? "",
      fournisseur: initial.fournisseur ?? "",
    } : {
      nom_commercial: "", 
      nom_generique: "", 
      categorie: "", 
      code_barres: "",
      prix_achat: "", 
      prix_vente: "", 
      stock_actuel: 0, 
      stock_minimum: 10,
      date_expiration: "", 
      numero_lot: "", 
      fournisseur: "",
    })
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Identification */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
            <Pill size={11} className="text-primary" />
          </div>
          Identification
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Nom commercial <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              placeholder="Ex: Paracétamol 500mg" 
              className={clsx(
                "w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all",
                "bg-gray-50 dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "focus:ring-2 focus:ring-primary/30 focus:border-primary",
                "dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600",
                errors.nom_commercial && "border-red-500 focus:ring-red-500/30 focus:border-red-500"
              )}
              {...register("nom_commercial", { required: "Le nom commercial est requis" })} 
            />
            {errors.nom_commercial && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.nom_commercial.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Nom générique
            </label>
            <input 
              type="text"
              placeholder="Ex: Acétaminophène" 
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
              {...register("nom_generique")} 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Code-barres
            </label>
            <div className="relative">
              <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input 
                type="text"
                placeholder="Ex: 3400930000000" 
                className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                {...register("code_barres")} 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Catégorie
            </label>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select 
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition appearance-none"
                {...register("categorie")}
              >
                <option value="">— Sélectionner —</option>
                {(categories as any[]).map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Fournisseur
            </label>
            <div className="relative">
              <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select 
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition appearance-none"
                {...register("fournisseur")}
              >
                <option value="">— Sélectionner —</option>
                {(fournisseurs as any[]).map(f => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Prix */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign size={11} className="text-primary" />
          </div>
          Prix (HTG)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "prix_achat" as const, label: "Prix d'achat", required: true },
            { name: "prix_vente" as const, label: "Prix de vente", required: true },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {f.label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs font-bold">₲</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00"
                  className={clsx(
                    "w-full pl-7 pr-3 py-2.5 text-sm font-mono rounded-lg outline-none transition-all",
                    "bg-gray-50 dark:bg-gray-800",
                    "border border-gray-200 dark:border-gray-700",
                    "focus:ring-2 focus:ring-primary/30 focus:border-primary",
                    "dark:text-white",
                    errors[f.name] && "border-red-500 focus:ring-red-500/30 focus:border-red-500"
                  )}
                  {...register(f.name, { 
                    required: `${f.label} est requis`, 
                    min: { value: 0, message: "La valeur doit être positive" } 
                  })} 
                />
              </div>
              {errors[f.name] && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={10} />
                  {errors[f.name]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stock & Traçabilité */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={11} className="text-primary" />
          </div>
          Stock & Traçabilité
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Stock actuel <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              min="0" 
              className={clsx(
                "w-full px-3 py-2.5 text-sm font-mono rounded-lg outline-none transition-all",
                "bg-gray-50 dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "focus:ring-2 focus:ring-primary/30 focus:border-primary",
                "dark:text-white",
                errors.stock_actuel && "border-red-500 focus:ring-red-500/30 focus:border-red-500"
              )}
              {...register("stock_actuel", { 
                required: "Le stock actuel est requis", 
                min: { value: 0, message: "Le stock ne peut pas être négatif" } 
              })} 
            />
            {errors.stock_actuel && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.stock_actuel.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Stock minimum
            </label>
            <input 
              type="number" 
              min="0" 
              className="w-full px-3 py-2.5 text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
              {...register("stock_minimum")} 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Date d'expiration
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input 
                type="date" 
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                {...register("date_expiration")} 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              N° de lot
            </label>
            <input 
              type="text"
              placeholder="Ex: LOT-2024-001" 
              className="w-full px-3 py-2.5 text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
              {...register("numero_lot")} 
            />
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-sm shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save size={14} />
              {initial ? "Mettre à jour" : "Ajouter le médicament"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}