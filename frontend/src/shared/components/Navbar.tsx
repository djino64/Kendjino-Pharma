import { useState, useEffect } from "react"
import { Menu, Bell, Search, Sun, Moon } from "lucide-react"
import { useAuth } from "../hooks/useAuth"

interface NavbarProps {
  onMenuClick?: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState({ date: "", time: "" })

  // DARK / LIGHT MODE
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    if (isDarkMode) {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDarkMode(false)
    } else {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDarkMode(true)
    }
  }

  // DATE & HEURE
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentDateTime({
        date: now.toLocaleDateString("fr-FR", {
          weekday: "short", day: "2-digit", month: "short", year: "numeric",
        }),
        time: now.toLocaleTimeString("fr-FR", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        }),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu size={20} className="text-gray-600 dark:text-white" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Bienvenue dans votre espace</p>
        </div>
      </div>

      {/* CENTER SEARCH */}
      <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg w-80">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="bg-transparent outline-none w-full text-sm dark:text-white"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* DATE + TIME */}
        <div className="hidden md:flex flex-col text-right leading-tight">
          <span className="text-xs text-gray-600 dark:text-gray-300">{currentDateTime.date}</span>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{currentDateTime.time}</span>
        </div>

        {/* THEME */}
        <button
          onClick={toggleTheme}
          aria-label="Changer le thème"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {isDarkMode
            ? <Sun size={18} className="text-yellow-500" />
            : <Moon size={18} className="text-gray-600 dark:text-gray-300" />
          }
        </button>

        {/* NOTIFICATIONS */}
        <button aria-label="Notifications" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell size={18} className="text-gray-600 dark:text-white" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* USER */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-sm">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {user?.full_name || "Utilisateur"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role || "admin"}
            </p>
          </div>
        </div>

      </div>
    </header>
  )
}