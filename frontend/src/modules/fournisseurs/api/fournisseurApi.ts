import api from "../../../lib/axios"
import type { Fournisseur } from "../../../types"

export interface FournisseurPayload {
  nom: string
  contact?: string
  telephone?: string
  email?: string
  adresse?: string
  ville?: string
  pays?: string
  notes?: string
}

export const fournisseurApi = {
  list: (search = "") =>
    api.get<{ results: Fournisseur[]; count: number }>("/fournisseurs/", {
      params: { search },
    }).then(r => r.data),

  get: (id: number) =>
    api.get<Fournisseur>(`/fournisseurs/${id}/`).then(r => r.data),

  create: (data: FournisseurPayload) =>
    api.post<Fournisseur>("/fournisseurs/", data).then(r => r.data),

  update: (id: number, data: Partial<FournisseurPayload>) =>
    api.put<Fournisseur>(`/fournisseurs/${id}/`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/fournisseurs/${id}/`),

  achats: (id: number) =>
    api.get(`/achats/?fournisseur=${id}`).then(r => r.data.results ?? r.data),

  produits: (id: number) =>
    api.get(`/produits/?fournisseur=${id}`).then(r => r.data.results ?? r.data),
}