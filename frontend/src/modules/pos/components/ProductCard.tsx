import { Package } from "lucide-react"
import clsx from "clsx"
import type { Produit } from "../../../types"
import { formatHTG } from "../../../shared/utils/format"

type Props = {
  produit: Produit
  onAdd: (p: Produit) => void
}

export default function ProductCard({ produit, onAdd }: Props) {
  return (
    <button
      onClick={() => onAdd(produit)}
      disabled={produit.est_en_rupture}
      className={clsx(
        "card p-4 text-left hover:shadow-card-hover hover:border-primary/20 transition-all group",
        produit.est_en_rupture && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20">
          <Package size={15} className="text-primary" />
        </div>

        {produit.est_en_rupture ? (
          <span className="badge-danger">Rupture</span>
        ) : produit.est_stock_faible ? (
          <span className="badge-warning">Faible</span>
        ) : null}
      </div>

      <p className="font-semibold text-sm text-gray-800 line-clamp-2">
        {produit.nom_commercial}
      </p>

      <p className="text-xs text-gray-400 mb-2 truncate">
        {produit.nom_generique}
      </p>

      <div className="flex justify-between items-center">
        <span className="text-primary font-bold text-sm">
          {formatHTG(produit.prix_vente)}
        </span>
        <span className="text-xs text-gray-400">
          Stock: {produit.stock_actuel}
        </span>
      </div>
    </button>
  )
}