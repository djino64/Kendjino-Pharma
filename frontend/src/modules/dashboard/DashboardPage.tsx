import { useQuery } from "@tanstack/react-query"
import {
  TrendingUp, ShoppingCart, Package, Users,
  AlertTriangle, XCircle, Clock, ArrowUpRight
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, Legend
} from "recharts"
import api from "../../lib/axios"
import { formatHTG } from "../../shared/utils/format"
import clsx from "clsx"

function StatCard({ title, value, sub, icon, color, trend }: {
  title: string; value: string | number; sub?: string
  icon: React.ReactNode; color: string; trend?: number
}) {
  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow">
      <div className={clsx("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
        <p className="font-display font-bold text-xl text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={clsx("flex items-center gap-0.5 text-xs font-semibold", trend >= 0 ? "text-primary" : "text-red-500")}>
          <ArrowUpRight size={13} className={trend < 0 ? "rotate-180" : ""} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

function AlertBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className={clsx("flex items-center justify-between px-4 py-3 rounded-lg", color)}>
      <span className="text-sm font-medium">{label}</span>
      <span className="font-bold text-lg">{count}</span>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{formatHTG(p.value)}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/rapports/dashboard/").then(r => r.data),
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-24 bg-gray-50" />)}
        </div>
      </div>
    )
  }

  const chartData = (data?.ventes_30j ?? []).map((v: any) => ({
    date: new Date(v.created_at__date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    total: parseFloat(v.total ?? 0),
    ventes: v.count,
  }))

  const topProduits = data?.top_produits ?? []

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventes aujourd'hui"
          value={data?.aujourd_hui?.ventes ?? 0}
          sub={formatHTG(data?.aujourd_hui?.chiffre_affaires ?? 0)}
          icon={<ShoppingCart size={20} className="text-white" />}
          color="bg-primary"
        />
        <StatCard
          title="Chiffre ce mois"
          value={formatHTG(data?.ce_mois?.chiffre_affaires ?? 0)}
          sub={`${data?.ce_mois?.ventes ?? 0} transactions`}
          icon={<TrendingUp size={20} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Medicaments"
          value={data?.total_produits ?? 0}
          sub="en stock"
          icon={<Package size={20} className="text-white" />}
          color="bg-violet-500"
        />
        <StatCard
          title="Clients enregistres"
          value={data?.total_clients ?? 0}
          icon={<Users size={20} className="text-white" />}
          color="bg-amber-500"
        />
      </div>

      {/* Alertes */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="font-display font-semibold text-gray-800">Alertes stock</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AlertBadge count={data?.alertes?.rupture ?? 0} label="Rupture de stock" color="bg-red-50 text-red-700" />
          <AlertBadge count={data?.alertes?.stock_faible ?? 0} label="Stock faible" color="bg-amber-50 text-amber-700" />
          <AlertBadge count={data?.alertes?.expires ?? 0} label="Medicaments expirés" color="bg-red-50 text-red-700" />
          <AlertBadge count={data?.alertes?.expire_bientot ?? 0} label="Expire dans 30j" color="bg-orange-50 text-orange-700" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Evolution des ventes (30 jours)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A651" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00A651" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={60}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#00A651" strokeWidth={2} fill="url(#colorTotal)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Top m�dicaments vendus</h3>
          {topProduits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Package size={32} className="opacity-30 mb-2" />
              <p className="text-sm">Aucune donnee</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProduits.slice(0, 7).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{p.produit__nom_commercial}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${Math.min((p.quantite / (topProduits[0]?.quantite || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-500 flex-shrink-0">{p.quantite} u.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
