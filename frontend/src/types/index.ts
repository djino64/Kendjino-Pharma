export type UserRole = 'admin' | 'gestionnaire' | 'vendeur'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: UserRole
  phone?: string
  avatar?: string
  is_active: boolean
  date_joined: string
}

export interface Categorie { id: number; nom: string; description?: string }

export interface Fournisseur {
  id: number; nom: string; contact?: string
  telephone?: string; email?: string; adresse?: string
  pays: string; est_actif: boolean
}

export interface Produit {
  id: number
  nom_commercial: string
  nom_generique?: string
  categorie: number
  categorie_nom?: string
  code_barres?: string
  prix_achat: number
  prix_vente: number
  stock_actuel: number
  stock_minimum: number
  date_expiration?: string
  numero_lot?: string
  fournisseur?: number
  fournisseur_nom?: string
  est_actif: boolean
  est_en_rupture: boolean
  est_stock_faible: boolean
  est_expire: boolean
  expire_bientot: boolean
}

export interface Client {
  id: number; nom: string; prenom?: string
  full_name?: string; telephone?: string
  email?: string; adresse?: string; entreprise?: string
  points_fidelite?: number
}

export interface LigneVente {
  id: number; produit: number
  produit_nom?: string; nom_produit: string
  quantite: number; prix_unitaire: number; sous_total: number
}

export interface Vente {
  id: number; numero_facture: string
  client?: number; client_nom?: string
  vendeur?: number; vendeur_nom?: string; vendeur_role?: string
  lignes: LigneVente[]
  sous_total: number; remise_type: string
  remise_valeur: number; remise_montant: number
  total: number; montant_recu: number; monnaie_rendue: number
  mode_paiement: string; statut: string
  notes?: string; created_at: string
}

export interface CartItem {
  produit: Produit
  quantite: number
  prix_unitaire: number
  sous_total: number
}

export interface Achat {
  id: number; numero_bon: string
  fournisseur: number; fournisseur_nom?: string
  responsable?: number; responsable_nom?: string
  total: number; statut: string
  date_commande: string; date_reception?: string
}

export interface AlertesStats {
  expires: number; expire_bientot: number
  rupture: number; stock_faible: number
}

export interface Ordonnance{
  id: number
  client?: number | null
  client_nom?: string
  medecin: string
  fichier: string
  notes: string
  created_at: string
}
