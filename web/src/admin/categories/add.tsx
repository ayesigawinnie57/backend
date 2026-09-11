import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { adminProductsApi } from '../../lib/api'
import ErrorBanner, { parseError } from '../ErrorBanner'

export default function AddCategory() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  const handleFile = (files: FileList | null) => {
    if (!files?.[0]) return
    setImage(files[0])
    setPreview(URL.createObjectURL(files[0]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) { setError('Name is required.'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('slug', slug.trim())
      if (image) fd.append('image', image)
      await adminProductsApi.createCategory(fd)
      navigate('/admin/categories')
    } catch (err) {
      const d = (err as any)?.response?.data
      setError(d?.slug?.[0] ?? d?.name?.[0] ?? parseError(err, 'Failed to add category.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/categories')} className="p-1 hover:opacity-70"><ArrowLeft size={20} color="#071A2B" /></button>
        <h1 className="text-xl font-extrabold text-[#071A2B]">Add Category</h1>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-40 rounded-xl border border-dashed border-[#E2E8F0] bg-white flex flex-col items-center justify-center gap-2 overflow-hidden hover:border-[#22C55E]"
        >
          {preview
            ? <img src={preview} className="w-full h-full object-cover" />
            : <><ImagePlus size={28} color="#94A3B8" /><span className="text-[13px] text-[#94A3B8] font-semibold">Tap to pick image</span></>
          }
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files)} />

        <div>
          <label className="block text-[13px] font-bold text-[#071A2B] mb-2">Category Name *</label>
          <input
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. Electronics"
            className="w-full px-3 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] text-[#071A2B] outline-none focus:border-[#22C55E]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#071A2B] mb-2">Slug (auto-generated)</label>
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="e.g. electronics"
            className="w-full px-3 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[13px] text-[#64748B] outline-none focus:border-[#22C55E]"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#22C55E] text-white py-3 rounded-xl text-[14px] font-bold disabled:opacity-60 hover:opacity-90">
          {loading ? 'Saving...' : 'Save Category'}
        </button>
      </form>
    </div>
  )
}
