import { Routes, Route, Navigate } from 'react-router-dom'
import { authStore } from './store'
import DashboardLayout from '../layouts/DashboardLayout'

// Auth
import LoginPage from '../modules/auth/LoginPage'
import ForgotPasswordPage from '../modules/auth/ForgotPassword'
import ResetPasswordPage from '../modules/auth/ResetPassword'

// Modules
import DashboardPage from '../modules/dashboard/DashboardPage'
import POSPage from '../modules/pos/POSPage'
import ProduitsPage from '../modules/stock/ProduitsPage'
import AlertesPage from '../modules/stock/AlertesPage'
import VentesPage from '../modules/ventes/VentesPage'
import ClientsPage from '../modules/clients/ClientsPage'
import FournisseursPage from '../modules/fournisseurs/FournisseursPage'
import AchatsPage from '../modules/achats/AchatsPage'
import EmployesPage from '../modules/employes/EmployesPage'
import RapportsPage from '../modules/rapports/RapportsPage'

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  if (!authStore.isAuthenticated()) return <Navigate to="/login" replace />
  if (roles && !roles.includes(authStore.getRole())) return <Navigate to="/" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="stock/produits" element={<ProduitsPage />} />
        <Route path="stock/alertes" element={<AlertesPage />} />
        <Route path="ventes" element={<VentesPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="fournisseurs" element={<FournisseursPage />} />
        <Route path="achats" element={<AchatsPage />} />
        <Route
          path="employes"
          element={
            <PrivateRoute roles={['admin']}>
              <EmployesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="rapports"
          element={
            <PrivateRoute roles={['admin']}>
              <RapportsPage />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
