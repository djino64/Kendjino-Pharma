import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  KeyRound,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../lib/axios";

type Step = "email" | "otp" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const requestOtp = useMutation({
    mutationFn: () =>
      api.post("/auth/password/reset/", { email }),
    onSuccess: () => {
      toast.success("Code envoyé si l'email existe");
      setStep("otp");
    },
    onError: () => toast.error("Erreur lors de l'envoi"),
  });

  const resetPassword = useMutation({
    mutationFn: () =>
      api.post("/auth/password/reset/confirm/", {
        email,
        otp,
        new_password: newPassword,
      }),
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé !");
      setStep("done");
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.detail ||
          "Code invalide ou expiré"
      ),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md">

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
          Mot de passe oublié
        </h2>

        {/* STEP DONE */}
        {step === "done" && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={50} className="text-green-600" />
            </div>
            <p className="text-gray-600 mb-6">
              Mot de passe mis à jour avec succès.
            </p>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-green-600 text-white p-2 rounded"
            >
              Retour à la connexion
            </button>
          </div>
        )}

        {/* STEP EMAIL */}
        {step === "email" && (
          <>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Entrez votre email pour recevoir un code OTP
            </p>

            <div className="mb-4">
              <label className="text-sm">Email</label>
              <div className="flex items-center border p-2 rounded mt-1">
                <Mail
                  size={18}
                  className="mr-2 text-gray-500"
                />
                <input
                  type="email"
                  required
                  className="w-full outline-none"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>
            </div>

            <button
              onClick={() => requestOtp.mutate()}
              disabled={requestOtp.isPending || !email}
              className="w-full bg-green-600 text-white p-2 rounded flex justify-center items-center gap-2"
            >
              {requestOtp.isPending ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Envoi...
                </>
              ) : (
                "Envoyer le code"
              )}
            </button>
          </>
        )}

        {/* STEP OTP */}
        {step === "otp" && (
          <>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Entrez le code reçu et votre nouveau mot de passe
            </p>

            {/* OTP */}
            <div className="mb-4">
              <label className="text-sm">Code OTP</label>
              <div className="flex items-center border p-2 rounded mt-1">
                <KeyRound
                  size={18}
                  className="mr-2 text-gray-500"
                />
                <input
                  type="text"
                  maxLength={6}
                  className="w-full outline-none text-center tracking-widest"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div className="mb-4">
              <label className="text-sm">
                Nouveau mot de passe
              </label>
              <div className="flex items-center border p-2 rounded mt-1">
                <Lock
                  size={18}
                  className="mr-2 text-gray-500"
                />
                <input
                  type="password"
                  className="w-full outline-none"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                />
              </div>
            </div>

            <button
              onClick={() => resetPassword.mutate()}
              disabled={
                resetPassword.isPending ||
                otp.length !== 6 ||
                !newPassword
              }
              className="w-full bg-green-600 text-white p-2 rounded flex justify-center items-center gap-2"
            >
              {resetPassword.isPending ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Vérification...
                </>
              ) : (
                "Réinitialiser"
              )}
            </button>
          </>
        )}

        {/* BACK TO LOGIN */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-green-600 hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}