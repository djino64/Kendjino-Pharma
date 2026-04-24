import { Routes, Route, Navigate } from "react-router-dom"

import Login from "./modules/auth/LoginPage"
import ForgotPassword from "./modules/auth/ForgotPassword"
import ResetPassword from "./modules/auth/ResetPassword"
import DashboardLayout from "./layouts/DashboardLayout"
import DashboardHome from "./modules/dashboard/DashboardHome"
import AchatsPage from "./modules/achats/AchatsPage"
import POSPage from "./modules/pos/POSPage"
import ClientsPage from "./modules/clients/ClientsPage"
import FournisseursPage from "./modules/fournisseurs/FournisseursPage"
import ProduitsPage from "./modules/stock/ProduitsPage"
import StockAlertesPage from "./modules/stock/AlertesPage"
import EmployesPage from "./modules/employes/EmployesPage"
import RapportsPage from "./modules/rapports/RapportsPage"
import VentesPage from "./modules/ventes/VentesPage"
import NotificationsPage from "./modules/notifications/NotificationsPage"
import OrdonnancesPage from "./modules/ordonnances/OrdonnancesPage"
import CategoriesPage from "./modules/categories/CategoriesPage"
import ParametresPage from "./modules/parametres/ParametresPage"


export default function App() {
  return (
    <Routes>
      {/* ROOT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH — sans layout, ces pages restent seules */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* TOUTES les pages protégées DANS DashboardLayout */}
      <Route path="/" element={<DashboardLayout />}>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="achats" element={<AchatsPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="fournisseurs" element={<FournisseursPage />} />
        <Route path="produits" element={<ProduitsPage />} />
        <Route path="stock/produits" element={<ProduitsPage />} />
        <Route path="stock/alertes" element={<StockAlertesPage />} />
        <Route path="employes" element={<EmployesPage />} />
        <Route path="rapports" element={<RapportsPage />} />
        <Route path="ventes" element={<VentesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="ordonnances" element={<OrdonnancesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="parametres" element={<ParametresPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}