import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import api from "../../lib/axios";
import { authStore } from "../../app/store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login/", {
        email,
        password,
      });

      const { access, refresh, user } = res.data;

      // 🔐 Store global (dashboard friendly)
      authStore.setAuth(access, refresh, user);

      // 🔐 Persist localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      // 🚀 redirect dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Email ou mot de passe incorrect"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
      >
        {/* TITLE */}
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
          Kendjino Pharma
        </h2>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {/* EMAIL */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Email</label>
          <div className="flex items-center border p-2 rounded mt-1">
            <Mail size={18} className="mr-2 text-gray-500" />
            <input
              type="email"
              required
              className="w-full outline-none"
              placeholder="admin@pharma.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="mb-2">
          <label className="text-sm text-gray-600">
            Mot de passe
          </label>
          <div className="flex items-center border p-2 rounded mt-1">
            <Lock size={18} className="mr-2 text-gray-500" />
            <input
              type="password"
              required
              className="w-full outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* FORGOT PASSWORD */}
        <div className="flex justify-end mb-4">
          <Link
            to="/forgot-password"
            className="text-sm text-green-600 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded flex justify-center items-center gap-2 disabled:opacity-60"
        >
          <LogIn size={18} />
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Kendjino Pharma © {new Date().getFullYear()}
        </p>
      </form>
    </div>
  );
}