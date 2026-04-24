# 💊 Kendjino Pharma — Système de gestion pharmaceutique

Application complète de gestion de pharmacie développée avec **React 18 + Django 5 + MySQL 8**.

---

## 🗂️ Structure du projet

```
kendjino-pharma/
├── backend/        # API Django REST Framework
└── frontend/       # Interface React + TypeScript + Tailwind
```

---

## ⚙️ Installation Backend (Django)

### 1. Prérequis
- Python 3.11+
- MySQL 8.0+
- pip

### 2. Créer la base de données MySQL

```sql
CREATE DATABASE kendjino_pharma CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kendjino'@'localhost' IDENTIFIED BY 'VotreMotDePasse';
GRANT ALL PRIVILEGES ON kendjino_pharma.* TO 'kendjino'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configurer l'environnement

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Éditer .env avec vos vraies valeurs
```

### 4. Migrations et démarrage

```bash
python manage.py makemigrations users produits ventes stock clients fournisseurs achats ordonnances
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Le backend sera disponible sur : **http://localhost:8000**

---

## 🎨 Installation Frontend (React)

### 1. Prérequis
- Node.js 18+
- npm ou yarn

### 2. Installation et démarrage

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur : **http://localhost:5173**

---

## 🔑 Rôles et permissions

| Rôle | Accès |
|------|-------|
| **Administrateur** | Accès total — employés, rapports, tout |
| **Gestionnaire** | Stock, alertes, fournisseurs, achats |
| **Vendeur** | POS, historique ses ventes, clients |

---

## 📡 Endpoints API principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login/` | Connexion JWT |
| POST | `/api/auth/logout/` | Déconnexion |
| POST | `/api/auth/token/refresh/` | Refresh token |
| GET | `/api/auth/me/` | Profil utilisateur |
| POST | `/api/auth/password/reset/` | Demande OTP |
| POST | `/api/auth/password/reset/confirm/` | Confirmer OTP |
| CRUD | `/api/produits/` | Médicaments |
| GET | `/api/produits/pos-search/?q=` | Recherche POS |
| GET | `/api/produits/alertes/` | Statistiques alertes |
| GET | `/api/produits/expires/` | Médicaments expirés |
| GET | `/api/produits/stock-faible/` | Stock faible |
| CRUD | `/api/ventes/` | Ventes |
| GET | `/api/ventes/stats/` | Stats ventes |
| CRUD | `/api/clients/` | Clients |
| CRUD | `/api/fournisseurs/` | Fournisseurs |
| CRUD | `/api/achats/` | Bons d'achat |
| POST | `/api/achats/{id}/recevoir/` | Réceptionner commande |
| CRUD | `/api/ordonnances/` | Ordonnances |
| GET | `/api/rapports/dashboard/` | Stats dashboard |
| GET | `/api/rapports/ventes/?format=excel` | Export Excel |
| GET | `/api/rapports/ventes/?format=pdf` | Export PDF |
| GET | `/api/stock/mouvements/` | Mouvements stock |
| POST | `/api/stock/mouvements/ajuster/` | Ajustement stock |
| GET | `/api/auth/audit-logs/` | Journal d'audit |

---

## 🎨 Design System

| Couleur | Hex | Usage |
|---------|-----|-------|
| Vert principal | `#00A651` | Boutons, accents |
| Vert foncé | `#228B22` | Hover, headers |
| Vert clair | `#90EE90` | Backgrounds légers |
| Fond | `#F5F5F5` | Background app |

**Polices** : Outfit (titres) + DM Sans (corps) + JetBrains Mono (nombres)

---

## 🔐 Sécurité

- ✅ JWT avec refresh automatique
- ✅ Blacklist des tokens à la déconnexion
- ✅ OTP par email (10 minutes)
- ✅ CORS configuré
- ✅ Protection XSS/CSRF
- ✅ Journal d'audit (qui a fait quoi)
- ✅ Permissions par rôle sur chaque endpoint

---

## 🖨️ Impression ticket

Le ticket de caisse inclut :
- En-tête Kendjino Pharma
- Numéro de facture unique (KP-YYYYMM-XXXX)
- Date & heure
- Nom client + entreprise
- Liste produits (nom, qté, P.U., sous-total)
- Remise appliquée
- **Total HTG**
- Monnaie rendue
- Nom & rôle du vendeur
- "Merci pour votre achat !"

---

## 📦 Technologies

**Backend** : Django 5 · DRF · SimpleJWT · MySQL · ReportLab · OpenPyXL

**Frontend** : React 18 · TypeScript · Vite · Tailwind CSS · TanStack Query · Recharts · Lucide Icons · React Hot Toast