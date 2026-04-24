import ProductCard from "./ProductCard"
import type { Produit } from "../../../types"

type Props = {
  produits: Produit[]
  loading: boolean
  search: string
  onAdd: (p: Produit) => void
}

export default function ProductList({
  produits,
  loading,
  search,
  onAdd,
}: Props) {
  if (search.length >= 1 && !loading && produits.length === 0) {
    return (
      <div className="card p-8 text-center text-gray-400">
        Aucun produit trouvé pour "{search}"
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
      {produits.map(p => (
        <ProductCard key={p.id} produit={p} onAdd={onAdd} />
      ))}
    </div>
  )
}