import api from "../../../lib/axios"
//import type { Client } from "../../../types"
import type { Client } from "../../../types"

export interface OrdonnancePayload {
  client?: number | null
  medecin?: string
  fichier: File
  notes?: string
}

export interface Ordonnance {
  id: number
  client?: number | null
  client_nom?: string
  medecin: string
  fichier: string
  notes: string
  created_at: string
}

export const ordonnanceApi = {
  list: (search = "") =>
    api.get<{ results: Ordonnance[]; count: number }>("/ordonnances/", {
      params: { search },
    }).then(r => r.data),

  get: (id: number) =>
    api.get<Ordonnance>(`/ordonnances/${id}/`).then(r => r.data),

  create: (data: OrdonnancePayload) => {
    const form = new FormData()
    if (data.client) form.append("client", String(data.client))
    if (data.medecin) form.append("medecin", data.medecin)
    if (data.notes) form.append("notes", data.notes)
    form.append("fichier", data.fichier)
    return api.post<Ordonnance>("/ordonnances/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data)
  },

  update: (id: number, data: Partial<OrdonnancePayload>) => {
    const form = new FormData()
    if (data.client !== undefined) form.append("client", data.client ? String(data.client) : "")
    if (data.medecin !== undefined) form.append("medecin", data.medecin)
    if (data.notes !== undefined) form.append("notes", data.notes)
    if (data.fichier instanceof File) form.append("fichier", data.fichier)
    return api.patch<Ordonnance>(`/ordonnances/${id}/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data)
  },

  delete: (id: number) =>
    api.delete(`/ordonnances/${id}/`),
}