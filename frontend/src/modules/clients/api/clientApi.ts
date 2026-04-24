import api from "../../../lib/axios";

export const clientApi = {
  getClients: async (search = "") => {
    const res = await api.get(`/clients/?search=${search}`)
    return res.data.results ?? res.data
  },

  createClient: async (payload:any) => {
    const res = await api.post('/clients/', payload)
    return res.data
  },

  updateClient: async (id:number, payload:any) => {
    const res = await api.put(`/clients/${id}/`, payload)
    return res.data
  },

    deleteClient: async (id:number) => {
      const res = await api.delete(`/clients/${id}/`)
      return res.data
    }
  }