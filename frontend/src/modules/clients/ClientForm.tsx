import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Loader2, User, Phone, Mail, Building2, MapPin, Save, X } from "lucide-react"
import type { Client } from "../../types"
import clsx from "clsx"

type ClientPayload = {
  prenom?: string
  nom: string
  telephone?: string
  email?: string
  entreprise?: string
  adresse?: string
}

interface Props {
  initial?: Client | null
  onSubmit: (data: ClientPayload) => void
  onCancel: () => void
  isLoading?: boolean
}

type Field = { 
  name: keyof ClientPayload; 
  label: string; 
  placeholder: string; 
  icon: React.ReactNode; 
  type?: string; 
  required?: boolean;
  colSpan?: "full" | "half"
}

const FIELDS: Field[] = [
  { name: "prenom", label: "Prénom", placeholder: "Desmarais", icon: <User size={14} />, colSpan: "half" },
  { name: "nom", label: "Nom", placeholder: "Kendjino", icon: <User size={14} />, required: true, colSpan: "half" },
  { name: "telephone", label: "Téléphone", placeholder: "+509 1234-5678", icon: <Phone size={14} />, colSpan: "half" },
  { name: "email", label: "Email", placeholder: "client@email.com", icon: <Mail size={14} />, type: "email", colSpan: "half" },
  { name: "entreprise", label: "Entreprise / Hôpital", placeholder: "Nom de l'établissement", icon: <Building2 size={14} />, colSpan: "full" },
  { name: "adresse", label: "Adresse", placeholder: "Adresse complète", icon: <MapPin size={14} />, colSpan: "full" },
]

export default function ClientForm({ initial, onSubmit, onCancel, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientPayload>()

  useEffect(() => {
    if (initial) {
      reset({
        nom: initial.nom,
        prenom: initial.prenom ?? "",
        telephone: initial.telephone ?? "",
        email: initial.email ?? "",
        entreprise: initial.entreprise ?? "",
        adresse: initial.adresse ?? "",
      })
    } else {
      reset({ nom: "", prenom: "", telephone: "", email: "", entreprise: "", adresse: "" })
    }
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map(field => (
          <div 
            key={field.name} 
            className={clsx(
              field.colSpan === "full" && "col-span-2"
            )}
          >
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                {field.icon}
              </span>
              <input
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                className={clsx(
                  "w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all",
                  "bg-gray-50 dark:bg-gray-800",
                  "border border-gray-200 dark:border-gray-700",
                  "focus:ring-2 focus:ring-primary/30 focus:border-primary",
                  "dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600",
                  errors[field.name] && "border-red-500 focus:ring-red-500/30 focus:border-red-500",
                  field.icon && "pl-9"
                )}
                {...register(field.name, { 
                  required: field.required ? `${field.label} est requis` : false 
                })}
              />
            </div>
            {errors[field.name] && (
              <p className="text-xs text-red-500 mt-1.5">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-sm shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save size={14} />
              {initial ? "Mettre à jour" : "Ajouter le client"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}