import { X, Receipt, Printer, Package, CreditCard, User, Store, Calendar } from "lucide-react"
import type { Vente } from "../../types"
import { formatHTG, formatDateTime } from "../../shared/utils/format"
import clsx from "clsx"

interface Props { 
  vente: Vente; 
  onClose: () => void;
  onPrint?: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  validee: "bg-emerald-500",
  annulee: "bg-red-500", 
  en_attente: "bg-orange-500"
}

const STATUS_LABEL: Record<string, string> = {
  validee: "Validée",
  annulee: "Annulée",
  en_attente: "En attente"
}

export default function VenteDetail({ vente, onClose, onPrint }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt size={14} className="text-primary" />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
              {vente.numero_facture}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={clsx(
              "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white",
              STATUS_COLOR[vente.statut]
            )}>
              {STATUS_LABEL[vente.statut]}
            </div>
            {onPrint && (
              <button
                onClick={onPrint}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                title="Imprimer"
              >
                <Printer size={14} />
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Informations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1">
                <Calendar size={10} />
                Date
              </p>
              <p className="font-medium text-gray-800 dark:text-white text-sm">
                {formatDateTime(vente.created_at)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1">
                <CreditCard size={10} />
                Mode de paiement
              </p>
              <p className="font-medium text-gray-800 dark:text-white text-sm flex items-center gap-1.5">
                Espèces HTG
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1">
                <User size={10} />
                Client
              </p>
              <p className="font-medium text-gray-800 dark:text-white text-sm">
                {vente.client_nom ?? "Anonyme"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1">
                <Store size={10} />
                Vendeur
              </p>
              <p className="font-medium text-gray-800 dark:text-white text-sm">
                {vente.vendeur_nom ?? "—"}
              </p>
            </div>
          </div>

          {/* Produits */}
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2">
              <Package size={14} />
              Produits
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    {["Produit", "Qté", "P.U.", "Sous-total"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {vente.lignes.map(l => (
                    <tr key={l.id}>
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{l.nom_produit}</td>
                      <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{l.quantite}</td>
                      <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{formatHTG(l.prix_unitaire)}</td>
                      <td className="px-3 py-2 font-mono font-semibold text-primary">{formatHTG(l.sous_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Sous-total</span>
              <span className="font-mono">{formatHTG(vente.sous_total)}</span>
            </div>
            {parseFloat(String(vente.remise_montant)) > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Remise ({vente.remise_type === "pct" ? `${vente.remise_valeur}%` : "montant"})</span>
                <span className="font-mono">-{formatHTG(vente.remise_montant)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-800 dark:text-white">TOTAL</span>
              <span className="text-primary font-mono">{formatHTG(vente.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Espèces reçues</span>
              <span className="font-mono">{formatHTG(vente.montant_recu)}</span>
            </div>
            <div className="flex justify-between font-semibold text-sm text-gray-700 dark:text-gray-300 pt-1 border-t border-gray-200 dark:border-gray-700">
              <span>Monnaie rendue</span>
              <span className="font-mono text-primary-dark">{formatHTG(vente.monnaie_rendue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}