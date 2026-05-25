import { useEffect, useRef, useState } from 'react'
import { schoolAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { Upload, CheckCircle, Loader2, ImageIcon, Plus, Trash2, BookOpen, Building2, Layout, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

/* ─── Default school-level data ─── */
const DEFAULT_DATA = {
  subjects:       ['Mathematics','Science','English','Hindi','Social Studies','Physics','Chemistry','Biology','History','Geography','Computer Science','Sanskrit','Physical Education','Art & Craft','Music'],
  classes:        ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'],
  sections:       ['A','B','C','D','E'],
  qualifications: ['B.Ed (Bachelor of Education)','M.Ed (Master of Education)','B.Sc B.Ed','M.Sc','B.A B.Ed','M.A','B.Com B.Ed','MBA','B.Tech','M.Tech','Ph.D','D.El.Ed (Diploma in Elementary Education)','NTT (Nursery Teacher Training)','CTET Qualified','TET Qualified','B.P.Ed','M.P.Ed','BCA','MCA','B.Lib','M.Lib','PGDCA','NET Qualified','SET Qualified'],
}

/* ─── Generic list manager card ─── */
function ListManager({ icon: Icon, title, description, color, items, onAdd, onRemove }) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const v = input.trim()
    if (!v) return
    if (items.includes(v)) { toast.error(`"${v}" already exists`); return }
    onAdd(v)
    setInput('')
    toast.success(`Added: ${v}`)
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-800 text-sm">{title}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{items.length}</span>
      </div>

      {/* Add row */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          className="input flex-1 text-sm"
          placeholder={`Add new ${title.toLowerCase().replace(/s$/, '')}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No items yet. Add one above.</p>
        ) : items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl text-sm text-slate-700 group">
            <span>{item}</span>
            <button
              type="button"
              onClick={() => { onRemove(item); toast.success(`Removed: ${item}`) }}
              className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity p-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════ MAIN ════════════════════════ */
export default function SettingsPage() {
  const { user, updateLogo } = useAuth()
  const [logo, setLogo] = useState(user?.logoBase64 || '')
  const [preview, setPreview] = useState(user?.logoBase64 || '')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  /* School-level data state */
  const [data, setData] = useState(DEFAULT_DATA)

  useEffect(() => {
    schoolAPI.getLogo().then(r => {
      if (r.data.logoBase64) { setLogo(r.data.logoBase64); setPreview(r.data.logoBase64) }
    })
  }, [])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('File too large. Max 2MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!preview) { toast.error('Please select a logo first'); return }
    setSaving(true)
    try {
      await schoolAPI.updateLogo(preview)
      setLogo(preview)
      updateLogo(preview)
      toast.success('School logo updated!')
    } catch { toast.error('Failed to update logo') }
    finally { setSaving(false) }
  }

  /* Helpers */
  const addItem    = (key) => (val) => setData(d => ({ ...d, [key]: [...d[key], val] }))
  const removeItem = (key) => (val) => setData(d => ({ ...d, [key]: d[key].filter(x => x !== val) }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm">Manage school profile, logo, and academic configuration</p>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* ── Left column: School Info + Logo ── */}
        <div className="col-span-1 space-y-6">

          {/* School Info */}
          <div className="card">
            <h2 className="font-display text-base font-bold text-slate-800 mb-4">School Information</h2>
            <div className="space-y-2 text-sm">
              {[
                ['School Name', user?.fullName || user?.schoolName],
                ['School Code', user?.schoolCode],
                ['Role', 'School Administrator'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">{k}</span>
                  <span className="text-slate-800 font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="card">
            <h2 className="font-display text-base font-bold text-slate-800 mb-1">School Logo</h2>
            <p className="text-slate-500 text-sm mb-4">
              Visible to all teachers and students of this school.
            </p>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                {preview ? (
                  <img src={preview} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-slate-300" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{logo ? 'Current logo' : 'No logo set'}</p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG or SVG · Max 2MB</p>
                {logo && (
                  <div className="flex items-center gap-1 mt-1 text-emerald-600 text-xs font-semibold">
                    <CheckCircle className="w-3 h-3" /> Logo is live
                  </div>
                )}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div className="flex gap-2">
              <button onClick={() => fileRef.current.click()} className="btn-secondary flex items-center gap-2 flex-1 text-sm">
                <Upload className="w-4 h-4" /> Choose File
              </button>
              <button onClick={handleSave} disabled={saving || preview === logo} className="btn-primary flex items-center gap-2 flex-1 text-sm">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Logo'}
              </button>
            </div>
            {preview && preview !== logo && (
              <p className="text-xs text-amber-600 font-medium mt-3 bg-amber-50 rounded-lg px-3 py-2">
                ⚠ Unsaved logo. Click "Save Logo" to apply.
              </p>
            )}
          </div>
        </div>

        {/* ── Right columns: Academic Configuration ── */}
        <div className="col-span-2">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-slate-800">Academic Configuration</h2>
            <p className="text-slate-500 text-sm">These lists populate all dropdowns across the platform — teacher forms, student forms, etc.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ListManager
              icon={BookOpen}
              title="Subjects"
              description="Subjects taught in this school"
              color="bg-brand-600"
              items={data.subjects}
              onAdd={addItem('subjects')}
              onRemove={removeItem('subjects')}
            />
            <ListManager
              icon={Building2}
              title="Classes"
              description="Grade / class levels"
              color="bg-sky-500"
              items={data.classes}
              onAdd={addItem('classes')}
              onRemove={removeItem('classes')}
            />
            <ListManager
              icon={Layout}
              title="Sections"
              description="Section divisions (A, B, C...)"
              color="bg-emerald-500"
              items={data.sections}
              onAdd={addItem('sections')}
              onRemove={removeItem('sections')}
            />
            <ListManager
              icon={GraduationCap}
              title="Qualifications"
              description="Teacher qualification list"
              color="bg-violet-500"
              items={data.qualifications}
              onAdd={addItem('qualifications')}
              onRemove={removeItem('qualifications')}
            />
          </div>

          <p className="text-xs text-slate-400 mt-4 bg-slate-50 rounded-xl px-4 py-3">
            💡 <strong>Tip:</strong> Any subject, class, section or qualification you add here will instantly appear in the teacher creation form and all other relevant dropdowns.
          </p>
        </div>
      </div>
    </div>
  )
}
