import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { adminProductsApi } from '../../lib/api'
import ErrorBanner, { parseError } from '../ErrorBanner'

export default function EditCategory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adminProductsApi.categories().then(({ data }) => {
      const cats = Array.isArray(data) ? data : (data as any).results ?? []
      const cat = cats.find((c: any) => c.id === Number(id))
      if (cat) { setName(cat.name); setSlug(cat.slug); setExistingImage(cat.image) }
    }).catch(err => setError(parseError(err, 'Failed to load category.'))).finally(() => setLoading(false))
  }, [id])

  const handleFile = (files: FileList | null) => {
    if (!files?.[0]) return
    setNewImage(files[0])
    setPreview(URL.createObjectURL(files[0]))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) { setError('Name and slug are required.'); return }
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('slug', slug.trim())
      if (newImage) fd.append('image', newImage)
      await adminProductsApi.updateCategory(Number(id), fd)
      navigate('/admin/categories')
    } catch (err) {
      const d = (err as any)?.response?.data
      setError(d?.slug?.[0] ?? d?.name?.[0] ?? parseError(err, 'Failed to update category.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" /></div>

  const previewSrc = preview ?? existingImage

  return (
    <div className="p-8 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/categories')} className="p-1 hover:opacity-70"><ArrowLeft size={20} color="#071A2B" /></button>
        <h1 className="text-xl font-extrabold text-[#071A2B]">Edit Category</h1>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <form onSubmit={handleSave} className="space-y-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-40 rounded-xl border border-dashed border-[#E2E8F0] bg-white flex flex-col items-center justify-center gap-2 overflow-hidden hover:border-[#22C55E]"
        >
          {previewSrc
            ? <img src={previewSrc} className="w-full h-full object-cover" />
            : <><ImagePlus size={28} color="#94A3B8" /><span className="text-[13px] text-[#94A3B8] font-semibold">Click to change image</span></>
          }
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files)} />

        <div>
          <label className="block text-[13px] font-bold text-[#071A2B] mb-2">Category Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] text-[#071A2B] outline-none focus:border-[#22C55E]" />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#071A2B] mb-2">Slug</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-3 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] text-[#64748B] outline-none focus:border-[#22C55E]" />
        </div>

        <button type="submit" disabled={saving} className="w-full bg-[#071A2B] text-white py-3 rounded-xl text-[14px] font-bold disabled:opacity-60 hover:opacity-90">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
