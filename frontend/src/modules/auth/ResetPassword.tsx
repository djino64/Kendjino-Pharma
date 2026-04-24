// frontend/src/modules/auth/ResetPassword.tsx

import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaKey, FaLock } from "react-icons/fa";

export default function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/users/reset-password/", {
        email,
        otp,
        new_password: newPassword,
      });

      alert("Mot de passe changé avec succès !");
      navigate("/");
    } catch (error) {
      alert("OTP invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-8 rounded-xl shadow-md w-96" onSubmit={handleReset}>
        
        <h2 className="text-xl font-bold text-green-600 text-center mb-6">
          Réinitialisation
        </h2>

        {/* OTP */}
        <div className="flex items-center border p-3 rounded mb-4">
          <FaKey className="text-green-600 mr-2" />
          <input
            type="text"
            placeholder="Code OTP"
            className="w-full outline-none"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        {/* NEW PASSWORD */}
        <div className="flex items-center border p-3 rounded mb-4">
          <FaLock className="text-green-600 mr-2" />
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="w-full outline-none"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          className="w-full bg-green-600 text-white p-3 rounded flex items-center justify-center gap-2 hover:bg-green-700"
          type="submit"
        >
          <FaKey />
          {loading ? "Validation..." : "Réinitialiser"}
        </button>
      </form>
    </div>
  );
}