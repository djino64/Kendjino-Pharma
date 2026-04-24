import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BarChart3, Calendar, TrendingUp, FileText, FileSpreadsheet, Search, Download } from "lucide-react"
import api from "../../lib/axios"
import { formatHTG, formatDateTime } from "../../shared/utils/format"

interface Vente {
  numero: string
  date: string
  client: string
  vendeur: string
  total: number
  mode: string
}

interface RapportData {
  total: number
  ventes: Vente[]
}

export default function RapportsPage() {
  const today = new Date().toISOString().split("T")[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  const [dateDebut, setDateDebut] = useState(monthStart)
  const [dateFin, setDateFin] = useState(today)

  const { data, isLoading, refetch } = useQuery<RapportData>({
    queryKey: ["rapports", dateDebut, dateFin],
    queryFn: () => api.get(`/rapports/ventes/?date_debut=${dateDebut}&date_fin=${dateFin}`).then(r => r.data),
  })

  const downloadExcel = () => window.open(`/api/rapports/ventes/?date_debut=${dateDebut}&date_fin=${dateFin}&format=excel`, "_blank")
  const downloadPdf = () => window.open(`/api/rapports/ventes/?date_debut=${dateDebut}&date_fin=${dateFin}&format=pdf`, "_blank")

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rapports de ventes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Analyse des ventes sur la période sélectionnée
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition shadow-md shadow-emerald-500/25"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
          <button
            onClick={downloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition shadow-md shadow-red-500/25"
          >
            <FileText size={16} />
            PDF
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Date de début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Date de fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
          >
            <Calendar size={15} />
            Filtrer
          </button>
        </div>
      </div>

      {/* Cartes de synthèse */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp size={18} className="text-primary" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Chiffre d'affaires total</p>
            </div>
            <p className="font-bold text-2xl text-gray-900 dark:text-white">
              {formatHTG(data.total ?? 0)}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <BarChart3 size={18} className="text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Nombre de ventes</p>
            </div>
            <p className="font-bold text-2xl text-gray-900 dark:text-white">
              {data.ventes?.length ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* Tableau des ventes */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 size={14} className="text-primary" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Détail des ventes</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {["N° Facture", "Date", "Client", "Vendeur", "Total HTG", "Mode"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-600">
                    <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Chargement...</p>
                  </td>
                </tr>
              ) : (data?.ventes ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-600">
                    <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucune vente sur cette période</p>
                  </td>
                </tr>
              ) : data?.ventes.map((v) => (
                <tr key={v.numero} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-primary font-semibold text-xs">{v.numero}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{v.date}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{v.client}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.vendeur}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-primary">{formatHTG(v.total)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {v.mode || 'Espèces'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}