import {
  Package,
  AlertTriangle,
  TrendingDown,
  Truck,
  ShoppingCart,
  Users,
  DollarSign
} from "lucide-react";
import clsx from "clsx";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StockDashboard() {
  const cards: StatCard[] = [
    {
      title: "Produits en stock",
      value: "1,245",
      icon: Package,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Stock faible",
      value: "32",
      icon: TrendingDown,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      trend: { value: 5, isPositive: false }
    },
    {
      title: "Produits expirés",
      value: "8",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
      trend: { value: 2, isPositive: false }
    },
    {
      title: "Livraisons en cours",
      value: "5",
      icon: Truck,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      trend: { value: 3, isPositive: true }
    },
  ];

  const alertesStockFaible = [
    { nom: "Paracétamol 500mg", stock: 3, min: 10, unite: "boîtes" },
    { nom: "Amoxicilline", stock: 5, min: 15, unite: "gélules" },
    { nom: "Ibuprofène", stock: 2, min: 8, unite: "comprimés" },
    { nom: "Vitamine C", stock: 7, min: 20, unite: "comprimés" },
  ];

  const produitsExpires = [
    { nom: "Sirop X", date: "15/01/2024", lot: "LOT-001" },
    { nom: "Antibiotique Y", date: "28/02/2024", lot: "LOT-002" },
    { nom: "Créme Z", date: "10/03/2024", lot: "LOT-003" },
  ];

  const activitesRecentes = [
    { action: "Nouvelle livraison reçue", produit: "Paracétamol 500mg", quantite: 100, date: "Il y a 2h" },
    { action: "Vente enregistrée", produit: "Amoxicilline", quantite: 15, date: "Il y a 5h" },
    { action: "Ajustement de stock", produit: "Ibuprofène", quantite: -5, date: "Hier" },
    { action: "Expiration détectée", produit: "Sirop X", quantite: 20, date: "Hier" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Dashboard Stock
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Vue globale du stock et des alertes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Dernière mise à jour: aujourd'hui
          </span>
        </div>
      </div>

      {/* Statistiques Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={clsx(
                "w-11 h-11 rounded-xl flex items-center justify-center shadow-md",
                card.bgColor
              )}>
                <card.icon className={clsx("w-5 h-5", card.color)} />
              </div>
              {card.trend && (
                <span className={clsx(
                  "text-xs font-medium px-2 py-1 rounded-lg",
                  card.trend.isPositive 
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                )}>
                  {card.trend.isPositive ? "+" : "-"}{card.trend.value}%
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {card.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Sections alertes et activités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes stock faible */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingDown size={14} className="text-amber-500" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                Alertes stock faible
              </h3>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {alertesStockFaible.length} alerte(s)
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {alertesStockFaible.map((item, i) => (
              <div key={i} className="px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">
                      {item.nom}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full" 
                            style={{ width: `${(item.stock / item.min) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {item.stock} / {item.min}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {item.unite}
                      </span>
                    </div>
                  </div>
                  <button className="text-xs text-primary hover:text-primary/80 font-medium">
                    Commander
                  </button>
                </div>
              </div>
            ))}
          </div>
          {alertesStockFaible.length === 0 && (
            <div className="py-12 text-center text-gray-400 dark:text-gray-600">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune alerte stock faible</p>
            </div>
          )}
        </div>

        {/* Produits expirés */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={14} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                Produits expirés
              </h3>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {produitsExpires.length} produit(s)
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {produitsExpires.map((item, i) => (
              <div key={i} className="px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">
                      {item.nom}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-red-500 font-mono">
                        Expiré le {item.date}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        Lot: {item.lot}
                      </span>
                    </div>
                  </div>
                  <button className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
          {produitsExpires.length === 0 && (
            <div className="py-12 text-center text-gray-400 dark:text-gray-600">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun produit expiré</p>
            </div>
          )}
        </div>
      </div>

      {/* Activités récentes */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Truck size={14} className="text-primary" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
            Activités récentes
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {activitesRecentes.map((item, i) => (
            <div key={i} className="px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    item.action.includes("livraison") ? "bg-emerald-500/10" :
                    item.action.includes("Vente") ? "bg-primary/10" :
                    item.action.includes("Ajustement") ? "bg-amber-500/10" :
                    "bg-red-500/10"
                  )}>
                    {item.action.includes("livraison") && <Truck size={12} className="text-emerald-500" />}
                    {item.action.includes("Vente") && <ShoppingCart size={12} className="text-primary" />}
                    {item.action.includes("Ajustement") && <TrendingDown size={12} className="text-amber-500" />}
                    {item.action.includes("Expiration") && <AlertTriangle size={12} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-white">
                      <span className="font-medium">{item.action}</span>
                      <span className="text-gray-500 dark:text-gray-400"> - {item.produit}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {item.date}
                      </span>
                      <span className="text-xs font-mono font-bold text-primary">
                        {item.quantite > 0 ? `+${item.quantite}` : item.quantite} unités
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}