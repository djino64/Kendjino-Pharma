import { useState } from 'react'
import { Tag, Plus, Edit2, Trash2, Package, Search, X, Save } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

interface Categorie {
  id: number
  nom: string
  description: string
  couleur: string
  nb_medicaments: number
}

const COULEURS = [
  { value: 'bg-blue-500',    label: 'Bleu' },
  { value: 'bg-emerald-500', label: 'Vert' },
  { value: 'bg-purple-500',  label: 'Violet' },
  { value: 'bg-orange-500',  label: 'Orange' },
  { value: 'bg-red-500',     label: 'Rouge' },
  { value: 'bg-pink-500',    label: 'Rose' },
  { value: 'bg-yellow-500',  label: 'Jaune' },
  { value: 'bg-cyan-500',    label: 'Cyan' },
]

const mockCategories: Categorie[] = [
  { id: 1, nom: 'Antibiotiques',      description: 'Médicaments contre les infections bactériennes', couleur: 'bg-blue-500',    nb_medicaments: 24 },
  { id: 2, nom: 'Analgésiques',       description: 'Médicaments contre la douleur',                  couleur: 'bg-red-500',     nb_medicaments: 18 },
  { id: 3, nom: 'Antifongiques',      description: 'Traitement des infections fongiques',             couleur: 'bg-purple-500',  nb_medicaments: 9 },
  { id: 4, nom: 'Antiparasitaires',   description: 'Traitement des parasitoses',                     couleur: 'bg-orange-500',  nb_medicaments: 12 },
  { id: 5, nom: 'Vitamines',          description: 'Suppléments vitaminiques et minéraux',            couleur: 'bg-yellow-500',  nb_medicaments: 31 },
  { id: 6, nom: 'Antihypertenseurs',  description: 'Médicaments contre l\'hypertension',             couleur: 'bg-cyan-500',    nb_medicaments: 15 },
  { id: 7, nom: 'Antidiabétiques',    description: 'Traitement du diabète',                          couleur: 'bg-emerald-500', nb_medicaments: 11 },
  { id: 8, nom: 'Dermatologie',       description: 'Soins de la peau et maladies dermatologiques',   couleur: 'bg-pink-500',    nb_medicaments: 20 },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>(mockCategories)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Categorie | null>(null)
  const [form, setForm] = useState({ nom: '', description: '', couleur: 'bg-blue-500' })

  const filtered = categories.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditTarget(null)
    setForm({ nom: '', description: '', couleur: 'bg-blue-500' })
    setShowModal(true)
  }

  const openEdit = (cat: Categorie) => {
    setEditTarget(cat)
    setForm({ nom: cat.nom, description: cat.description, couleur: cat.couleur })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.nom.trim()) return toast.error('Le nom est requis')
    if (editTarget) {
      setCategories(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...form } : c))
      toast.success('Catégorie mise à jour')
    } else {
      const newCat: Categorie = {
        id: Date.now(), ...form, nb_medicaments: 0
      }
      setCategories(prev => [...prev, newCat])
      toast.success('Catégorie créée')
    }
    setShowModal(false)
  }

  const handleDelete = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    toast.success('Catégorie supprimée')
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Catégories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-md shadow-primary/25"
        >
          <Plus size={16} />
          Nouvelle catégorie
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une catégorie..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(cat => (
          <div
            key={cat.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shadow-md', cat.couleur)}>
                <Tag size={18} className="text-white" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{cat.nom}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{cat.description}</p>

            <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Package size={13} className="text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{cat.nb_medicaments}</span> médicament{cat.nb_medicaments > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400 dark:text-gray-600">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune catégorie trouvée</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
                {editTarget ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: Antibiotiques"
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description de la catégorie..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:text-white transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {COULEURS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setForm({ ...form, couleur: c.value })}
                      className={clsx(
                        'w-8 h-8 rounded-full transition-all',
                        c.value,
                        form.couleur === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                      )}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition shadow-sm shadow-primary/25"
              >
                <Save size={14} />
                {editTarget ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}