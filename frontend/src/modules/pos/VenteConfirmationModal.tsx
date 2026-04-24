import { useState, useRef } from "react"
import { Printer, CheckCircle2, X, Download, Loader2, Receipt } from "lucide-react"
import toast from "react-hot-toast"
import { formatHTG, formatDateTime } from "../../shared/utils/format"
import { useAuth } from "../../shared/hooks/useAuth"
import clsx from "clsx"

interface VenteConfirmationModalProps {
  vente: any
  onClose: () => void
  onPrint?: () => void
}

export function VenteConfirmationModal({ vente, onClose, onPrint }: VenteConfirmationModalProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const pharmacyName = (user as any)?.pharmacy_name || "KENDJINO PHARMA"

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      const printContent = ticketRef.current
      if (printContent) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Ticket ${vente.numero_facture}</title>
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
                <script>
                  setTimeout(() => {
                    window.print();
                    setTimeout(() => window.close(), 500);
                  }, 500);
                </script>
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.focus()
        }
      }
      toast.success("Ticket envoyé à l'impression")
      onPrint?.()
    } catch (error) {
      toast.error("Erreur lors de l'impression")
    } finally {
      setIsPrinting(false)
    }
  }

  const generateTicketText = () => {
    const lines = [
      "=".repeat(32),
      pharmacyName.padStart(24),
      "=".repeat(32),
      `Facture: ${vente.numero_facture}`,
      `Date: ${formatDateTime(vente.created_at)}`,
      `Client: ${vente.client_nom ?? "Client anonyme"}`,
      `Vendeur: ${vente.vendeur_nom}`,
      "-".repeat(32),
      "PRODUIT          QTÉ  PU    TOTAL",
      "-".repeat(32),
    ]
    
    ;(vente.lignes ?? []).forEach((l: any) => {
      const nom = l.nom_produit.substring(0, 14).padEnd(14)
      const qte = l.quantite.toString().padStart(3)
      const pu = parseFloat(l.prix_unitaire).toFixed(0).padStart(6)
      const total = parseFloat(l.sous_total).toFixed(0).padStart(6)
      lines.push(`${nom} ${qte} ${pu} ${total}`)
    })
    
    lines.push("-".repeat(32))
    lines.push(`Sous-total: ${parseFloat(vente.sous_total).toFixed(0)} HTG`.padStart(28))
    
    if (parseFloat(vente.remise_montant) > 0) {
      lines.push(`Remise: -${parseFloat(vente.remise_montant).toFixed(0)} HTG`.padStart(28))
    }
    
    lines.push(`TOTAL: ${parseFloat(vente.total).toFixed(0)} HTG`.padStart(28))
    lines.push(`Reçu: ${parseFloat(vente.montant_recu).toFixed(0)} HTG`.padStart(28))
    lines.push(`Rendu: ${parseFloat(vente.monnaie_rendue).toFixed(0)} HTG`.padStart(28))
    lines.push("=".repeat(32))
    lines.push("MERCI POUR VOTRE ACHAT !".padStart(26))
    lines.push("=".repeat(32))
    
    return lines.join("\n")
  }

  const handleDownload = () => {
    setIsDownloading(true)
    try {
      const ticketContent = generateTicketText()
      const blob = new Blob([ticketContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ticket_${vente.numero_facture}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Ticket téléchargé")
    } catch (error) {
      toast.error("Erreur lors du téléchargement")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
                <CheckCircle2 size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
                  Vente validée !
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Facture #{vente.numero_facture}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Ticket preview */}
        <div className="p-4 max-h-[60vh] overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
          <div 
            ref={ticketRef}
            className="font-mono text-xs space-y-1 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700"
          >
            <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-gray-200 dark:border-gray-700">
              <p className="font-bold text-sm text-gray-800 dark:text-white">{pharmacyName}</p>
              <p className="text-gray-500 dark:text-gray-400 text-[10px]">Port-au-Prince, Haïti</p>
              <p className="text-gray-500 dark:text-gray-400 text-[10px]">Tel: +509 4130-0944</p>
            </div>

            <div className="py-2 space-y-0.5 border-b border-dashed border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="font-bold text-gray-700 dark:text-gray-300">Facture:</span>
                <span className="text-gray-800 dark:text-white">{vente.numero_facture}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-700 dark:text-gray-300">Date:</span>
                <span className="text-gray-600 dark:text-gray-400">{formatDateTime(vente.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-700 dark:text-gray-300">Client:</span>
                <span className="text-gray-800 dark:text-white">{vente.client_nom ?? "Client anonyme"}</span>
              </div>
              {vente.client_entreprise && (
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Entreprise:</span>
                  <span className="text-gray-600 dark:text-gray-400">{vente.client_entreprise}</span>
                </div>
              )}
              {vente.client_telephone && (
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Tél:</span>
                  <span className="text-gray-600 dark:text-gray-400">{vente.client_telephone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-bold text-gray-700 dark:text-gray-300">Vendeur:</span>
                <span className="text-gray-600 dark:text-gray-400">{vente.vendeur_nom}</span>
              </div>
            </div>

            <div className="py-2 border-b border-dashed border-gray-200 dark:border-gray-700 space-y-1">
              <div className="flex justify-between font-bold border-b border-gray-200 dark:border-gray-700 pb-1 text-[10px] text-gray-600 dark:text-gray-400">
                <span className="w-24">Produit</span>
                <span className="w-8 text-center">Qté</span>
                <span className="w-10 text-right">P.U</span>
                <span className="w-12 text-right">S.T</span>
              </div>
              {(vente.lignes ?? []).map((l: any, i: number) => (
                <div key={i} className="space-y-0.5">
                  <p className="font-medium text-[10px] text-gray-800 dark:text-white break-words">{l.nom_produit}</p>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400 pl-1 text-[10px]">
                    <span className="w-24"></span>
                    <span className="w-8 text-center">{l.quantite}</span>
                    <span className="w-10 text-right">{parseFloat(l.prix_unitaire).toFixed(0)}</span>
                    <span className="w-12 text-right font-mono text-primary">{parseFloat(l.sous_total).toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="py-2 space-y-0.5 border-b border-dashed border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Sous-total</span>
                <span className="font-mono">{parseFloat(vente.sous_total).toFixed(0)}</span>
              </div>
              {parseFloat(vente.remise_montant) > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Remise ({vente.remise_type === "pct" ? `${vente.remise_valeur}%` : "montant"})</span>
                  <span className="font-mono">-{parseFloat(vente.remise_montant).toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1">
                <span className="text-gray-800 dark:text-white">TOTAL HTG</span>
                <span className="font-mono text-primary font-bold">{parseFloat(vente.total).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Espèces reçues</span>
                <span className="font-mono">{parseFloat(vente.montant_recu).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                <span>Monnaie rendue</span>
                <span className="font-mono">{parseFloat(vente.monnaie_rendue).toFixed(0)}</span>
              </div>
            </div>

            <div className="pt-2 text-center space-y-1 text-gray-400 dark:text-gray-500">
              <p className="text-[8px]">Mode de paiement: Espèces HTG</p>
              <p className="font-bold text-gray-600 dark:text-gray-400 text-[10px]">Merci pour votre achat !</p>
              <p className="text-[8px]">Conservez ce reçu</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-sm shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPrinting ? (
                  <><Loader2 size={14} className="animate-spin" /> Impression...</>
                ) : (
                  <><Printer size={14} /> Imprimer</>
                )}
              </button>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                {isDownloading ? (
                  <><Loader2 size={14} className="animate-spin" /> Téléchargement...</>
                ) : (
                  <><Download size={14} /> Télécharger</>
                )}
              </button>
            </div>
            
            <button 
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Receipt size={14} />
              Nouvelle vente
            </button>
            
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
              Le ticket a été enregistré dans l'historique des ventes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}