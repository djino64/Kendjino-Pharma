import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem } from "../../../types"
import { formatHTG } from "../../../shared/utils/format"

type Props = {
  cart: CartItem[]
  onAdd: (id: number) => void
  onMinus: (id: number) => void
  onRemove: (id: number) => void
}

export default function Cart({ cart, onAdd, onMinus, onRemove }: Props) {
  return (
    <div className="space-y-2">
      {cart.map(item => (
        <div
          key={item.produit.id}
          className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
        >
          <div className="flex-1">
            <p className="text-xs font-semibold truncate">
              {item.produit.nom_commercial}
            </p>
            <p className="text-xs text-primary">
              {formatHTG(item.prix_unitaire)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => onMinus(item.produit.id)}>
              <Minus size={10} />
            </button>

            <span className="w-6 text-center text-xs font-bold">
              {item.quantite}
            </span>

            <button onClick={() => onAdd(item.produit.id)}>
              <Plus size={10} />
            </button>
          </div>

          <div className="text-xs font-bold w-16 text-right">
            {formatHTG(item.sous_total)}
          </div>

          <button onClick={() => onRemove(item.produit.id)}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}