import { useEffect, useState } from "react"
import api from "../../lib/axios"

import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  Truck,
  UserCog,
  Warehouse,
} from "lucide-react"

type Stats = {
  ventes_du_jour: number
  chiffre_affaires: number
  produits: number
  clients: number
  alertes: number
  achats: number
  fournisseurs: number
  employes: number
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get("/dashboard/stats/")
        setStats(res.data)
      } catch (error) {
        console.error("Erreur dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const cards = stats
    ? [
        {
          label: "Ventes du jour",
          value: stats.ventes_du_jour,
          icon: ShoppingCart,
          color: "text-blue-600",
        },
        {
          label: "Chiffres d'affaires",
          value: `${stats.chiffre_affaires} HTG`,
          icon: DollarSign,
          color: "text-green-600",
        },
        {
          label: "Produits",
          value: stats.produits,
          icon: Package,
          color: "text-purple-600",
        },
        {
          label: "Clients",
          value: stats.clients,
          icon: Users,
          color: "text-orange-600",
        },
        {
          label: "Achats",
          value: stats.achats,
          icon: Warehouse,
          color: "text-indigo-600",
        },
        {
          label: "Fournisseurs",
          value: stats.fournisseurs,
          icon: Truck,
          color: "text-cyan-600",
        },
        {
          label: "Employés",
          value: stats.employes,
          icon: UserCog,
          color: "text-pink-600",
        },
        {
          label: "Alertes stock",
          value: stats.alertes,
          icon: AlertTriangle,
          color: "text-red-600",
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Vue globale du système pharmaceutique</p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-500 animate-pulse">
          Chargement des données...
        </p>
      )}

      {/* CARDS */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {cards.map((card, index) => {
            const Icon = card.icon

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition"
              >
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold text-gray-800">
                    {card.value}
                  </p>
                </div>

                <div className="p-3 rounded-full bg-gray-100">
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}