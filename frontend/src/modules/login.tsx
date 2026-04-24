import { useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
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

      // 🔐 sauvegarde tokens
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // redirect dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Erreur de connexion"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
          Kendjino Pharma
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {/* EMAIL */}
        <div className="mb-4">
          <label className="text-sm">Email</label>
          <div className="flex items-center border p-2 rounded">
            <Mail size={18} className="mr-2 text-gray-500" />
            <input
              type="email"
              className="w-full outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="text-sm">Mot de passe</label>
          <div className="flex items-center border p-2 rounded">
            <Lock size={18} className="mr-2 text-gray-500" />
            <input
              type="password"
              className="w-full outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded flex justify-center items-center gap-2"
        >
          <LogIn size={18} />
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}