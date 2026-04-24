
import api from "../../../lib/axios"
import type { Produit } from "../../../types"

export interface ProduitPayload {
  nom_commercial: string
  nom_generique?: string
  categorie?: number | string
  code_barres?: string
  prix_achat: number | string
  prix_vente: number | string
  stock_actuel: number | string
  stock_minimum: number | string
  date_expiration?: string
  numero_lot?: string
  fournisseur?: number | string
  description?: string
}

export interface MouvementStock {
  id: number
  produit: number
  produit_nom: string
  type_mouvement: "entree" | "sortie" | "ajustement"
  quantite: number
  stock_avant: number
  stock_apres: number
  motif: string
  user_nom: string
  created_at: string
}

export const stockApi = {
  list: (params?: Record<string, string>) =>
    api.get<{ results: Produit[]; count: number }>("/produits/", { params }).then(r => r.data),

  get: (id: number) => api.get<Produit>(`/produits/${id}/`).then(r => r.data),

  create: (data: ProduitPayload) => api.post<Produit>("/produits/", data).then(r => r.data),

  update: (id: number, data: Partial<ProduitPayload>) =>
    api.put<Produit>(`/produits/${id}/`, data).then(r => r.data),

  delete: (id: number) => api.delete(`/produits/${id}/`),

  alertes: () => api.get("/produits/alertes/").then(r => r.data),
  expires: () => api.get("/produits/expires/").then(r => r.data),
  expireBientot: () => api.get("/produits/expire-bientot/").then(r => r.data),
  stockFaible: () => api.get("/produits/stock-faible/").then(r => r.data),

  mouvements: (produitId?: number) =>
    api.get<{ results: MouvementStock[] }>("/stock/mouvements/", {
      params: produitId ? { produit: produitId } : {},
    }).then(r => r.data.results ?? r.data),

  ajuster: (data: { produit: number; quantite: number; motif: string }) =>
    api.post("/stock/mouvements/ajuster/", data).then(r => r.data),
}
