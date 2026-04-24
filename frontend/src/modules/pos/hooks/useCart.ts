import { useState } from "react"
import type { CartItem, Produit } from "../../../types"
import toast from "react-hot-toast"

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (produit: Produit) => {
    if (produit.est_en_rupture) {
      toast.error("Produit en rupture de stock")
      return
    }

    setCart(prev => {
      const existing = prev.find(i => i.produit.id === produit.id)

      if (existing) {
        if (existing.quantite >= produit.stock_actuel) {
          toast.error("Stock insuffisant")
          return prev
        }

        return prev.map(i =>
          i.produit.id === produit.id
            ? {
                ...i,
                quantite: i.quantite + 1,
                sous_total: (i.quantite + 1) * i.prix_unitaire,
              }
            : i
        )
      }

      return [
        ...prev,
        {
          produit,
          quantite: 1,
          prix_unitaire: produit.prix_vente,
          sous_total: produit.prix_vente,
        },
      ]
    })
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(i => {
        if (i.produit.id !== id) return i

        const newQty = Math.max(
          1,
          Math.min(i.quantite + delta, i.produit.stock_actuel)
        )

        return {
          ...i,
          quantite: newQty,
          sous_total: newQty * i.prix_unitaire,
        }
      })
    )
  }

  const removeItem = (id: number) => {
    setCart(prev => prev.filter(i => i.produit.id !== id))
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((s, i) => s + i.sous_total, 0)

  return {
    cart,
    setCart,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    total,
  }
}