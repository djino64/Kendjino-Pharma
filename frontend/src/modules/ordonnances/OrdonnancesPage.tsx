import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  FileText, Plus, Search, Eye, Edit2, Trash2,
  X, Save, User, Stethoscope, Upload, FileCheck,
  ExternalLink, StickyNote
} from "lucide-react"
import toast from "react-hot-toast"
import clsx from "clsx"
import { useDebounce } from "../../shared/hooks/useDebounce"
import { ordonnanceApi, type Ordonnance, type OrdonnancePayload } from "./api/ordonnanceApi"
import { formatDate } from "../../shared/utils/format"
import api from "../../lib/axios"


function OrdonnanceForm({
  initial, onSubmit, onCancel, isLoading
}: {
  initial?: Ordonnance | null
  onSubmit: (data: OrdonnancePayload) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [clientSearch, setClientSearch] = useState(initial?.client_nom ?? "")
  const [clientId, setClientId] = useState<number | null>(initial?.client ?? null)
  const [medecin, setMedecin] = useState(initial?.medecin ?? "")
  const [notes, setNotes] = useState(initial?.notes ?? "")
  const [fichier, setFichier] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const { data: clientsData } = useQuery({
    queryKey: ["clients-search", clientSearch],
    queryFn: () => api.get(`/clients/?search=${clientSearch}`).then(r => r.data.results ?? r.data),
    enabled: clientSearch.length > 1,
  })
  const clients = clientsData ?? []

  const handleSubmit = () => {
    if (!initial && !fichier) return toast.error("Veuillez joindre un fichier")
    const payload: OrdonnancePayload = {
      client: clientId,
      medecin,
      notes,
      fichier: fichier as File,
    }
    if (initial && !fichier) {
      delete (payload as any).fichier
    }
    onSubmit(payload)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setFichier(file)
  }

  const inputClass = "w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"

  return (
    <div className="space-y-4">

      {/* Client */}
      <div className="relative">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          Patient (client)
        </label>
        <div className="relative">
          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={clientSearch}
            onChange={e => { setClientSearch(e.target.value); setClientId(null) }}
            placeholder="Rechercher un client..."
            className={clsx(inputClass, "pl-9")}
          />
        </div>
        {clients.length > 0 && !clientId && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
            {clients.slice(0, 5).map((c: any) => (
              <button
                key={c.id}
                onClick={() => { setClientId(c.id); setClientSearch(c.full_name ?? `${c.prenom} ${c.nom}`) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">{c.nom?.[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{c.full_name ?? `${c.prenom} ${c.nom}`}</p>
                  {c.telephone && <p className="text-xs text-gray-400">{c.telephone}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Médecin */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          Médecin prescripteur
        </label>
        <div className="relative">
          <Stethoscope size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={medecin}
            onChange={e => setMedecin(e.target.value)}
            placeholder="Dr. Nom du médecin"
            className={clsx(inputClass, "pl-9")}
          />
        </div>
      </div>

      {/* Fichier */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          Fichier ordonnance {!initial && <span className="text-red-500">*</span>}
        </label>

        {initial?.fichier && !fichier && (
          <div className="flex items-center gap-2 p-3 mb-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <FileCheck size={15} className="text-emerald-600 flex-shrink-0" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 flex-1 truncate">
              Fichier existant
            </span>
            <a
              href={initial.fichier}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:text-emerald-700"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
            >
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fichier-input")?.click()}
          className={clsx(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            dragOver
              ? "border-primary bg-primary/5"
              : fichier
              ? "border-primary/40 bg-primary/5"
              : "border-gray-200 dark:border-gray-700 hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
        >
          <input
            id="fichier-input"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={e => e.target.files?.[0] && setFichier(e.target.files[0])}
          />
          {fichier ? (
            <div className="flex items-center justify-center gap-2">
              <FileCheck size={18} className="text-primary" />
              <span className="text-sm font-medium text-primary truncate max-w-xs">{fichier.name}</span>
              <button
                onClick={e => { e.stopPropagation(); setFichier(null) }}
                className="p-0.5 text-gray-400 hover:text-red-500 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div>
              <Upload size={20} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Glisser-déposer ou <span className="text-primary font-medium">parcourir</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Notes</label>
        <div className="relative">
          <StickyNote size={15} className="absolute left-3 top-3 text-gray-400" />
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Instructions particulières..."
            rows={3}
            className={clsx(inputClass, "pl-9 resize-none")}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition shadow-sm shadow-primary/25"
        >
          <Save size={14} />
          {isLoading ? "Enregistrement..." : initial ? "Mettre à jour" : "Créer"}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// DETAIL
// ─────────────────────────────────────────
function OrdonnanceDetail({ o, onClose, onEdit }: {
  o: Ordonnance; onClose: () => void; onEdit: () => void
}) {
  const isImage = o.fichier && /\.(jpg|jpeg|png|webp)$/i.test(o.fichier)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">

      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Détail ordonnance</h3>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Edit2 size={12} /> Modifier
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">

        {/* Aperçu fichier */}
        {o.fichier && (
          <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            {isImage ? (
              <img
                src={o.fichier}
                alt="Ordonnance"
                className="w-full object-contain max-h-64 bg-gray-50 dark:bg-gray-800"
              />
            ) : (
              <a
                href={o.fichier}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <FileText size={24} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Voir le fichier PDF</p>
                  <p className="text-xs text-gray-400 truncate">{o.fichier}</p>
                </div>
                <ExternalLink size={14} className="text-gray-400" />
              </a>
            )}
          </div>
        )}

        {/* Infos */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-0.5">
              <User size={11} /> Patient
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {o.client_nom ?? "—"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-0.5">
              <Stethoscope size={11} /> Médecin
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {o.medecin || "—"}
            </p>
          </div>
          <div className="col-span-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">Date</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {formatDate(o.created_at)}
            </p>
          </div>
        </div>

        {/* Notes */}
        {o.notes && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
              Notes
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{o.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────
export default function OrdonnancesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 350)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Ordonnance | null>(null)
  const [selected, setSelected] = useState<Ordonnance | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Ordonnance | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["ordonnances", debouncedSearch],
    queryFn: () => ordonnanceApi.list(debouncedSearch),
  })
  const ordonnances: Ordonnance[] = (data as any)?.results ?? (Array.isArray(data) ? data : [])

  const saveMutation = useMutation({
    mutationFn: (payload: OrdonnancePayload) =>
      editing ? ordonnanceApi.update(editing.id, payload) : ordonnanceApi.create(payload),
    onSuccess: () => {
      toast.success(editing ? "Ordonnance mise à jour" : "Ordonnance créée !")
      qc.invalidateQueries({ queryKey: ["ordonnances"] })
      setShowModal(false)
      setEditing(null)
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ordonnanceApi.delete(id),
    onSuccess: () => {
      toast.success("Ordonnance supprimée")
      qc.invalidateQueries({ queryKey: ["ordonnances"] })
      setDeleteTarget(null)
      setSelected(null)
    },
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ordonnances</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {ordonnances.length} ordonnance{ordonnances.length > 1 ? "s" : ""} enregistrée{ordonnances.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
        >
          <Plus size={16} />
          Nouvelle ordonnance
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par patient ou médecin..."
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
        />
      </div>

      {/* Layout grid + panel */}
      <div className={clsx(
        "grid gap-5 transition-all",
        selected ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1"
      )}>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Médecin</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fichier</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(6)].map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : ordonnances.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400 dark:text-gray-600">
                        <FileText size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucune ordonnance trouvée</p>
                      </td>
                    </tr>
                  )
                  : ordonnances.map(o => (
                    <tr
                      key={o.id}
                      onClick={() => setSelected(selected?.id === o.id ? null : o)}
                      className={clsx(
                        "cursor-pointer transition-colors",
                        selected?.id === o.id
                          ? "bg-primary/5 dark:bg-primary/10"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono font-semibold text-primary">
                          #{o.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-xs">
                              {o.client_nom?.[0] ?? "?"}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">
                            {o.client_nom ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                        {o.medecin || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {o.fichier ? (
                          <a
                            href={o.fichier}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <FileCheck size={13} />
                            Voir fichier
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                        {formatDate(o.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelected(selected?.id === o.id ? null : o)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => { setEditing(o); setShowModal(true) }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(o)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <OrdonnanceDetail
            o={selected}
            onClose={() => setSelected(null)}
            onEdit={() => { setEditing(selected); setShowModal(true) }}
          />
        )}
      </div>

      {/* Modal Créer / Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                {editing ? "Modifier l'ordonnance" : "Nouvelle ordonnance"}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditing(null) }}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <OrdonnanceForm
                initial={editing}
                onSubmit={data => saveMutation.mutate(data)}
                onCancel={() => { setShowModal(false); setEditing(null) }}
                isLoading={saveMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Supprimer cette ordonnance ?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              L'ordonnance <strong className="text-gray-700 dark:text-gray-300">#{deleteTarget.id}</strong> sera supprimée définitivement.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg transition shadow-sm shadow-red-500/25"
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}