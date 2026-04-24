import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Loader2, Building2, User, Phone, Mail, MapPin, Globe, FileText } from "lucide-react"
import type { Fournisseur } from "../../types"
import type { FournisseurPayload } from "../fournisseurs/api/fournisseurApi"

interface Props {
  initial?: Fournisseur | null
  onSubmit: (data: FournisseurPayload) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function FournisseurForm({ initial, onSubmit, onCancel, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FournisseurPayload>()

  useEffect(() => {
    reset(initial ? {
      nom: initial.nom, contact: initial.contact ?? "",
      telephone: initial.telephone ?? "", email: initial.email ?? "",
      adresse: initial.adresse ?? "", pays: initial.pays ?? "Haïti", notes: "",
    } : { nom: "", contact: "", telephone: "", email: "", adresse: "", pays: "Haïti", notes: "" })
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom du fournisseur *</label>
          <div className="relative">
            <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Pharmarcie......" className="input-field pl-9"
              {...register("nom", { required: "Nom requis" })} />
          </div>
          {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Personne contact</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Desmarais Kendjino" className="input-field pl-9" {...register("contact")} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Téléphone</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="+509 0000-0000" className="input-field pl-9" {...register("telephone")} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" placeholder="fournisseur@gmail.com" className="input-field pl-9" {...register("email")} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pays</label>
          <div className="relative">
            <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Haïti" className="input-field pl-9" {...register("pays")} />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Adresse</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Ile de la Tortue, Nord-Ouest" className="input-field pl-9" {...register("adresse")} />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
          <div className="relative">
            <FileText size={15} className="absolute left-3 top-3 text-gray-400" />
            <textarea placeholder="Informations supplémentaires..." rows={2}
              className="input-field pl-9 resize-none" {...register("notes")} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center py-2.5">
          {isLoading ? <><Loader2 size={15} className="animate-spin" />Sauvegarde...</> : initial ? "Mettre à jour" : "Ajouter le fournisseur"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center py-2.5">Annuler</button>
      </div>
    </form>
  )
}
