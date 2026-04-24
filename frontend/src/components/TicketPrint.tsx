// src/components/TicketPrint.tsx
import { forwardRef } from 'react'

const TicketPrint = forwardRef<HTMLDivElement, { vente: any }>(({ vente }, ref) => (
  <div ref={ref} className="font-mono text-xs w-72 mx-auto print:block" id="ticket-print">
    <style>{`
      @media print {
        body * { visibility: hidden; }
        #ticket-print, #ticket-print * { visibility: visible; }
        #ticket-print { position: fixed; top: 0; left: 0; width: 80mm; }
      }
    `}</style>
    {/* En-tête */}
    <div className="text-center border-b-2 border-dashed border-gray-400 pb-2 mb-2">
      <p className="text-base font-bold text-[#00A651]">KENDJINO PHARMA</p>
      <p className="text-xs text-gray-500">Pharmacie, Ile de la Tortue, Haïti</p>
      <p className="text-xs text-gray-500">Tel: +509 4130-0944</p>
    </div>
    {/* Infos facture */}
    <div className="mb-2">
      <p><span className="text-gray-500">Facture:</span> <strong>{vente.numero_facture}</strong></p>
      <p><span className="text-gray-500">Date:</span> {new Date(vente.created_at).toLocaleString('fr-HT')}</p>
      {vente.client && <p><span className="text-gray-500">Client:</span> {vente.client.nom} {vente.client.prenom}</p>}
      <p><span className="text-gray-500">Vendeur:</span> {vente.employe.prenom} {vente.employe.nom}</p>
    </div>
    {/* Lignes produits */}
    <div className="border-t border-dashed border-gray-400 pt-2 mb-2">
      <div className="flex justify-between text-gray-500 mb-1">
        <span>Produit</span><span>Qté × Prix = S/Total</span>
      </div>
      {vente.lignes.map((l: any, i: number) => (
        <div key={i} className="mb-1">
          <p className="font-medium truncate">{l.produit.nom_commercial}</p>
          <div className="flex justify-between text-gray-600">
            <span>{l.quantite} × {l.prix_unitaire} HTG</span>
            <span>{l.sous_total} HTG</span>
          </div>
        </div>
      ))}
    </div>
    {/* Totaux */}
    <div className="border-t border-dashed border-gray-400 pt-2">
      <div className="flex justify-between"><span>Sous-total</span><span>{vente.sous_total} HTG</span></div>
      {vente.remise > 0 && (
        <div className="flex justify-between text-red-500"><span>Remise</span><span>-{vente.remise} HTG</span></div>
      )}
      <div className="flex justify-between font-bold text-base border-t mt-1 pt-1">
        <span>TOTAL</span><span>{vente.total} HTG</span>
      </div>
      <div className="flex justify-between text-gray-500 text-xs mt-1">
        <span>Mode paiement</span><span>Espèces</span>
      </div>
    </div>
    {/* Pied de page */}
    <div className="text-center border-t-2 border-dashed border-gray-400 mt-3 pt-2">
      <p className="font-medium">Merci pour votre achat !</p>
      <p className="text-gray-400 text-xs">Conservez ce ticket pour tout échange</p>
    </div>
  </div>
))
export default TicketPrint