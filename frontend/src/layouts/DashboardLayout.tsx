import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../shared/components/Sidebar'
import Navbar from '../shared/components/Navbar'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface flex">

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>

        <footer className="text-center py-3 text-xs text-gray-400 border-t border-gray-100">
          © {new Date().getFullYear()} Kendjino Pharma — Haïti
        </footer>

      </div>
    </div>
  )
}