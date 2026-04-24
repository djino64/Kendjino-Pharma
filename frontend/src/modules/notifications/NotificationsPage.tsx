import { useQuery } from "@tanstack/react-query"
import { Bell, AlertTriangle, Package, Clock, XCircle, CheckCircle2 } from "lucide-react"
import api from "../../lib/axios"
import { formatDate } from "../../shared/utils/format"
import clsx from "clsx"


type AlerteType = "expire" | "expire_bientot" | "stock_faible" | "rupture"

interface Alerte {
  type: AlerteType
  message: string
  produit: string
  valeur: string | number
}

const alerteConfig: Record<AlerteType, { icon: React.ReactNode; color: string; label: string }> = {
  expire: { icon: <XCircle size={16}/>, color: "text-red-500 bg-red-50", label: "Expiré" },
  expire_bientot: { icon: <Clock size={16}/>, color: "text-amber-500 bg-amber-50", label: "Expire bientôt" },
  stock_faible: { icon: <AlertTriangle size={16}/>, color: "text-orange-500 bg-orange-50", label: "Stock faible" },
  rupture: { icon: <Package size={16}/>, color: "text-red-600 bg-red-50", label: "Rupture" },
}

export default function NotificationsPage() {
  const { data: prodExpi = [] } = useQuery({
    queryKey: ["alertes-expires"], queryFn: () => api.get("/produits/expires/").then(r => r.data)
  })
  const { data: prodBientot = [] } = useQuery({
    queryKey: ["alertes-expire-bientot"], queryFn: () => api.get("/produits/expire-bientot/").then(r => r.data)
  })
  const { data: prodFaible = [] } = useQuery({
    queryKey: ["alertes-stock-faible"], queryFn: () => api.get("/produits/stock-faible/").then(r => r.data)
  })

  const alertes: Alerte[] = [
    ...prodExpi.map((p: any) => ({ type: "expire" as AlerteType, message: "Médicament expiré", produit: p.nom_commercial, valeur: formatDate(p.date_expiration) })),
    ...prodBientot.map((p: any) => ({ type: "expire_bientot" as AlerteType, message: "Expire dans moins de 30 jours", produit: p.nom_commercial, valeur: formatDate(p.date_expiration) })),
    ...prodFaible.map((p: any) => ({ type: p.stock_actuel <= 0 ? "rupture" : "stock_faible" as AlerteType, message: p.stock_actuel <= 0 ? "Rupture de stock" : "Stock sous le seuil minimum", produit: p.nom_commercial, valeur: `${p.stock_actuel} / ${p.stock_minimum}` })),
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary"/>
          <h3 className="font-display font-semibold text-gray-800">Centre de notifications</h3>
        </div>
        <span className="badge-danger">{alertes.length} alertes</span>
      </div>

      {alertes.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-primary opacity-40"/>
          <p className="font-medium text-gray-500">Aucune alerte en cours</p>
          <p className="text-sm mt-1">Tous les stocks sont OK et aucun produit n'est expiré.</p>
        </div>
      ) : (
        <div className="card overflow-hidden divide-y divide-gray-50">
          {alertes.map((a, i) => {
            const cfg = alerteConfig[a.type]
            return (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", cfg.color)}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.produit}</p>
                  <p className="text-xs text-gray-500">{a.message}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={clsx("text-xs font-mono font-bold", cfg.color.split(" ")[0])}>
                    {a.valeur}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}