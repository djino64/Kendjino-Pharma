import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Search, ShoppingCart, User, Tag, CreditCard, X, Loader2,
  Package, AlertTriangle, ChevronDown, Printer, Plus,
  Minus, Trash2, Phone, Mail, Building2
} from "lucide-react"
import toast from "react-hot-toast"
import api from "../../lib/axios"
import type { CartItem, Produit, Client } from "../../types"
import { formatHTG, formatDateTime } from "../../shared/utils/format"
import { useAuth } from "../../shared/hooks/useAuth"
import clsx from "clsx"

/* ─── Composant principal POS ─── */
export default function POSPage() {
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSearch, setClientSearch] = useState("")
  const [remiseType, setRemiseType] = useState<"pct" | "montant">("pct")
  const [remiseValeur, setRemiseValeur] = useState(0)
  const [montantRecu, setMontantRecu] = useState(0)
  const [showValidationConfirm, setShowValidationConfirm] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [lastVente, setLastVente] = useState<any>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const ticketRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const pharmacyName = (user as any)?.pharmacy_name

  /* API - Recherche de produits */
  const { data: produitsRecherche = [], isFetching: searchLoading } = useQuery({
    queryKey: ["pos-search", search],
    queryFn: () => api.get(`/produits/pos-search/?q=${search}`).then(r => r.data),
    enabled: search.length >= 1,
  })

  /* API - Produits par défaut */
  const { data: produitsParDefaut = [], isLoading: defaultLoading } = useQuery({
    queryKey: ["pos-produits-default"],
    queryFn: () => api.get("/produits/?limit=24&ordering=-stock_actuel&is_active=true").then(r => r.data.results ?? r.data),
    enabled: search.length === 0,
  })

  /* API - Recherche clients */
  const { data: clients = [] } = useQuery({
    queryKey: ["clients-search", clientSearch],
    queryFn: () => api.get(`/clients/?search=${clientSearch}`).then(r => r.data.results ?? r.data),
    enabled: clientSearch.length >= 2,
  })

  const sousTotal = cart.reduce((s, i) => s + i.sous_total, 0)
  const remiseMontant = remiseType === "pct" ? sousTotal * remiseValeur / 100 : remiseValeur
  const total = Math.max(sousTotal - remiseMontant, 0)
  const monnaieRendue = montantRecu - total

  const produitsAffiches = search.length >= 1 ? produitsRecherche : produitsParDefaut
  const produitsLoading = search.length >= 1 ? searchLoading : defaultLoading

  const addToCart = (produit: Produit) => {
    if (produit.est_en_rupture) { 
      toast.error("Produit en rupture de stock"); 
      return 
    }
    setCart(prev => {
      const existing = prev.find(i => i.produit.id === produit.id)
      if (existing) {
        if (existing.quantite >= produit.stock_actuel) { 
          toast.error("Stock insuffisant"); 
          return prev 
        }
        return prev.map(i => i.produit.id === produit.id
          ? { ...i, quantite: i.quantite + 1, sous_total: (i.quantite + 1) * i.prix_unitaire }
          : i)
      }
      return [...prev, { 
        produit, 
        quantite: 1, 
        prix_unitaire: produit.prix_vente, 
        sous_total: produit.prix_vente 
      }]
    })
    setSearch("")
    searchRef.current?.focus()
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.produit.id !== id) return i
      const newQty = Math.max(1, Math.min(i.quantite + delta, i.produit.stock_actuel))
      return { ...i, quantite: newQty, sous_total: newQty * i.prix_unitaire }
    }))
  }

  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.produit.id !== id))

  const clearCart = () => {
    setCart([])
    setSelectedClient(null)
    setRemiseValeur(0)
    setMontantRecu(0)
  }

  const printTicket = () => {
    const printContent = ticketRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ticket ${lastVente?.numero_facture || 'vente'}</title>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4; padding: 20px; background: white; }
              .ticket { max-width: 300px; margin: 0 auto; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .border-dashed { border-bottom: 1px dashed #ccc; }
              .py-1 { padding-top: 4px; padding-bottom: 4px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .mb-1 { margin-bottom: 4px; }
              .mb-2 { margin-bottom: 8px; }
              .mt-2 { margin-top: 8px; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              @media print {
                body { padding: 0; margin: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="ticket">${printContent.innerHTML}</div>
            <div style="text-align: center; margin-top: 20px;">
              <button onclick="window.print();setTimeout(()=>window.close(),500)" style="padding: 8px 16px; margin: 5px; cursor: pointer;">Imprimer</button>
              <button onclick="window.close()" style="padding: 8px 16px; margin: 5px; cursor: pointer;">Fermer</button>
            </div>
            <script>setTimeout(() => window.print(), 500);</script>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
    }
  }

  const venteMutation = useMutation({
    mutationFn: (payload: any) => api.post("/ventes/", payload),
    onSuccess: ({ data }) => {
      setLastVente(data)
      clearCart()
      setShowValidationConfirm(false)
      setShowTicketModal(true)
      toast.success(`Vente ${data.numero_facture} enregistrée !`)
    },
    onError: (err: any) => toast.error(err.response?.data?.detail ?? "Erreur lors de la vente"),
  })

  const handleValidate = () => {
    if (cart.length === 0) { toast.error("Le panier est vide"); return }
    if (montantRecu < total) { toast.error("Montant reçu insuffisant"); return }
    setShowValidationConfirm(true)
  }

  const confirmVente = () => {
    venteMutation.mutate({
      client: selectedClient?.id ?? null,
      client_nom: selectedClient?.full_name ?? selectedClient?.nom ?? null,
      client_telephone: selectedClient?.telephone ?? null,
      lignes: cart.map(i => ({ 
        produit: i.produit.id, 
        quantite: i.quantite, 
        prix_unitaire: i.prix_unitaire 
      })),
      remise_type: remiseType,
      remise_valeur: remiseValeur,
      montant_recu: montantRecu,
    })
  }

  return (
    <div className="h-[calc(100vh-3.5rem-3rem)] flex gap-6 overflow-hidden">
      
      {/* Left — Products Section */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Point de Vente
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Scanner ou rechercher des produits
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          {produitsLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, générique ou code-barres..."
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
            autoFocus
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          {search.length >= 1 && !produitsLoading && produitsRecherche.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-400 dark:text-gray-600">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun produit trouvé pour "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {(produitsAffiches || []).map((produit: Produit) => (
                <button
                  key={produit.id}
                  onClick={() => addToCart(produit)}
                  disabled={produit.est_en_rupture}
                  className={clsx(
                    "bg-white dark:bg-gray-900 border rounded-xl p-3 text-left transition-all group",
                    produit.est_en_rupture 
                      ? "border-red-200 dark:border-red-900/30 opacity-60 cursor-not-allowed" 
                      : "border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      produit.est_stock_faible ? "bg-amber-500/10" : "bg-primary/10"
                    )}>
                      <Package size={14} className={produit.est_stock_faible ? "text-amber-500" : "text-primary"} />
                    </div>
                    {produit.est_stock_faible && (
                      <span className="text-[10px] text-amber-500 font-medium">Stock: {produit.stock_actuel}</span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm leading-tight line-clamp-2">
                    {produit.nom_commercial}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {produit.nom_generique || "Générique"}
                  </p>
                  <p className="font-bold text-primary text-sm mt-2">
                    {formatHTG(produit.prix_vente)}
                  </p>
                </button>
              ))}
            </div>
          )}
          
          {search.length === 0 && !produitsLoading && produitsParDefaut.length === 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-400 dark:text-gray-600">
              <Package size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Aucun produit disponible</p>
              <p className="text-xs mt-1">Ajoutez des produits dans l'inventaire</p>
            </div>
          )}
        </div>
      </div>

      {/* Right — Cart Section */}
      <div className="w-80 xl:w-96 flex flex-col gap-4 flex-shrink-0">
        
        {/* Client Selection Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <User size={12} className="text-primary" />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Client (optionnel)</span>
          </div>
          
          {selectedClient ? (
            <div className="flex items-center justify-between bg-primary/5 dark:bg-primary/10 rounded-xl px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {selectedClient.full_name ?? selectedClient.nom}
                </p>
                {selectedClient.telephone && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {selectedClient.telephone}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setSelectedClient(null)} 
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
              />
              {clientSearch.length >= 2 && clients.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {clients.map((c: Client) => (
                    <button 
                      key={c.id} 
                      onClick={() => { setSelectedClient(c); setClientSearch("") }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <span className="font-medium text-gray-800 dark:text-white">{c.full_name ?? c.nom}</span>
                      {c.telephone && <span className="text-xs text-gray-400 dark:text-gray-500 block">{c.telephone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Items Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart size={12} className="text-primary" />
              </div>
              <span className="font-semibold text-gray-800 dark:text-white text-sm">Panier</span>
              <span className="bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
            {cart.length > 0 && (
              <button 
                onClick={clearCart} 
                className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition"
              >
                <Trash2 size={12} /> Vider
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-300 dark:text-gray-700">
                <ShoppingCart size={32} className="mb-2 opacity-40" />
                <p className="text-xs">Panier vide</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.produit.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white text-xs">
                        {item.produit.nom_commercial}
                      </p>
                      <p className="text-xs text-primary font-mono mt-0.5">
                        {formatHTG(item.prix_unitaire)}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.produit.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQty(item.produit.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition flex items-center justify-center"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm font-mono font-medium text-gray-800 dark:text-white w-8 text-center">
                        {item.quantite}
                      </span>
                      <button 
                        onClick={() => updateQty(item.produit.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition flex items-center justify-center"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="font-mono font-bold text-primary text-sm">
                      {formatHTG(item.sous_total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Remise */}
          {cart.length > 0 && (
            <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={12} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Remise</span>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <select 
                    value={remiseType} 
                    onChange={e => setRemiseType(e.target.value as "pct" | "montant")}
                    className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                  >
                    <option value="pct">%</option>
                    <option value="montant">HTG</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <input 
                  type="number" 
                  min={0} 
                  value={remiseValeur || ""}
                  onChange={e => setRemiseValeur(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition" 
                  placeholder="0" 
                />
              </div>
            </div>
          )}

          {/* Totaux */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Sous-total</span>
              <span className="font-mono">{formatHTG(sousTotal)}</span>
            </div>
            {remiseMontant > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Remise</span>
                <span className="font-mono">-{formatHTG(remiseMontant)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100 dark:border-gray-800">
              <span className="text-gray-800 dark:text-white">TOTAL</span>
              <span className="font-mono text-primary">{formatHTG(total)}</span>
            </div>
          </div>

          {/* Paiement */}
          {cart.length > 0 && (
            <div className="p-3 pt-0 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Montant reçu (HTG)
                </label>
                <input 
                  type="number" 
                  min={total} 
                  value={montantRecu || ""}
                  onChange={e => setMontantRecu(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                  placeholder={total.toFixed(0)} 
                />
              </div>
              {montantRecu >= total && montantRecu > 0 && (
                <div className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-3 py-2">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Monnaie à rendre</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                    {formatHTG(monnaieRendue)}
                  </span>
                </div>
              )}
              <button
                onClick={handleValidate}
                disabled={venteMutation.isPending || cart.length === 0 || montantRecu < total}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {venteMutation.isPending ? (
                  <><Loader2 size={14} className="animate-spin" /> Traitement...</>
                ) : (
                  <><CreditCard size={14} /> Valider la vente</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Confirmation */}
      {showValidationConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-gray-800 p-6 text-center">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Confirmer la vente</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Valider cette vente d'un montant total de {formatHTG(total)} ?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowValidationConfirm(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                Annuler
              </button>
              <button 
                onClick={confirmVente}
                disabled={venteMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                {venteMutation.isPending ? "Traitement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ticket */}
      {showTicketModal && lastVente && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Printer size={12} className="text-primary" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Ticket de caisse</h3>
              </div>
              <button 
                onClick={() => setShowTicketModal(false)} 
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={14} />
              </button>
            </div>

            <div ref={ticketRef} className="p-4 font-mono text-xs space-y-1 bg-white dark:bg-gray-900">
              {/* Contenu du ticket */}
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-gray-200 dark:border-gray-800">
                <p className="font-bold text-sm">KENDJINO PHARMA</p>
                <p className="text-gray-500 text-[10px]">Ile de la Tortue, Haïti</p>
                <p className="text-gray-500 text-[10px]">Tel: +(509) 4130-0944 / 4862-2664</p>
                {pharmacyName && <p className="text-gray-500 text-[10px]">{pharmacyName}</p>}
              </div>

              <div className="py-2 space-y-0.5 border-b border-dashed border-gray-200 dark:border-gray-800">
                <div className="flex justify-between"><span className="font-bold">Facture:</span><span>{lastVente?.numero_facture}</span></div>
                <div className="flex justify-between"><span className="font-bold">Date:</span><span>{formatDateTime(lastVente?.created_at)}</span></div>
                <div className="flex justify-between"><span className="font-bold">Client:</span><span>{lastVente?.client_nom ?? "Client anonyme"}</span></div>
                {lastVente?.client_telephone && <div className="flex justify-between"><span className="font-bold">Tél:</span><span>{lastVente.client_telephone}</span></div>}
              </div>

              <div className="py-2 border-b border-dashed border-gray-200 dark:border-gray-800">
                <div className="flex justify-between font-bold pb-1 mb-1">
                  <span>Produit</span><span>Qté</span><span>PU</span><span>Total</span>
                </div>
                {(lastVente?.lignes ?? []).map((l: any, i: number) => (
                  <div key={i} className="mb-1">
                    <p className="font-medium truncate">{l.nom_produit}</p>
                    <div className="flex justify-between text-gray-500 pl-1">
                      <span></span><span>{l.quantite}</span><span>{parseFloat(l.prix_unitaire).toFixed(0)}</span><span>{parseFloat(l.sous_total).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-2 space-y-0.5 border-b border-dashed border-gray-200 dark:border-gray-800">
                <div className="flex justify-between"><span>Sous-total</span><span>{parseFloat(lastVente?.sous_total || 0).toFixed(0)}</span></div>
                {parseFloat(lastVente?.remise_montant || 0) > 0 && (
                  <div className="flex justify-between text-red-500"><span>Remise</span><span>-{parseFloat(lastVente?.remise_montant).toFixed(0)}</span></div>
                )}
                <div className="flex justify-between font-bold pt-1"><span>TOTAL HTG</span><span className="text-primary">{parseFloat(lastVente?.total || 0).toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Espèces reçues</span><span>{parseFloat(lastVente?.montant_recu || 0).toFixed(0)}</span></div>
                <div className="flex justify-between font-bold text-green-600"><span>Monnaie rendue</span><span>{parseFloat(lastVente?.monnaie_rendue || 0).toFixed(0)}</span></div>
              </div>

              <div className="pt-2 text-center space-y-1 text-gray-400">
                <p className="text-[8px]">Mode: Espèces HTG</p>
                <p className="font-bold text-gray-600 text-[10px]">Merci pour votre achat !</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button onClick={printTicket} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition">
                <Printer size={14} /> Imprimer
              </button>
              <button onClick={() => setShowTicketModal(false)} className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                Nouvelle vente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}