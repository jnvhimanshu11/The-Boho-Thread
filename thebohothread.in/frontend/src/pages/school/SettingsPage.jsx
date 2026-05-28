import { useEffect, useState } from 'react'
import { schoolAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { Plus, Trash2, BookOpen, Building2, Layout, GraduationCap, ChevronDown, ChevronUp, School, Phone, Mail, Globe, MapPin, User, Hash, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'

/* ─── Default school-level data ─── */
const DEFAULT_DATA = {
  subjects:       ['Mathematics','Science','English','Hindi','Social Studies','Physics','Chemistry','Biology','History','Geography','Computer Science','Sanskrit','Physical Education','Art & Craft','Music'],
  classes:        ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'],
  sections:       ['A','B','C','D','E'],
  qualifications: ['B.Ed (Bachelor of Education)','M.Ed (Master of Education)','B.Sc B.Ed','M.Sc','B.A B.Ed','M.A','B.Com B.Ed','MBA','B.Tech','M.Tech','Ph.D','D.El.Ed (Diploma in Elementary Education)','NTT (Nursery Teacher Training)','CTET Qualified','TET Qualified','B.P.Ed','M.P.Ed','BCA','MCA','B.Lib','M.Lib','PGDCA','NET Qualified','SET Qualified'],
}

/* ─── Collapsible Academic list manager ─── */
function CollapsibleList({ icon: Icon, title, description, color, items, onAdd, onRemove }) {
  const [input, setInput] = useState('')
  const [open, setOpen]   = useState(false)

  const handleAdd = () => {
    const v = input.trim()
    if (!v) return
    if (items.includes(v)) { toast.error(`"${v}" already exists`); return }
    onAdd(v)
    setInput('')
    toast.success(`Added: ${v}`)
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header — always visible, click to expand */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-slate-800 text-sm">{title}</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        }
      </button>

      {/* Expandable body */}
      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
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

          {/* Items */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
      )}
    </div>
  )
}

/* ─── Info row helper ─── */
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-semibold mt-0.5 break-all">{value}</p>
      </div>
    </div>
  )
}

/* ════════════════════════ MAIN ════════════════════════ */
export default function SettingsPage() {
  const { user } = useAuth()
  const [schoolInfo, setSchoolInfo] = useState(null)
  const [data, setData] = useState(DEFAULT_DATA)

  useEffect(() => {
    schoolAPI.getSchoolInfo()
      .then(r => setSchoolInfo(r.data))
      .catch(() => {/* fallback to user context below */})
  }, [])

  const info = schoolInfo || {}

  /* Helpers */
  const addItem    = (key) => (val) => setData(d => ({ ...d, [key]: [...d[key], val] }))
  const removeItem = (key) => (val) => setData(d => ({ ...d, [key]: d[key].filter(x => x !== val) }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm">School profile and academic configuration</p>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* ── Left: School Info ── */}
        <div className="col-span-1 space-y-5">

          {/* Banner preview */}
          {info.bannerBase64 && (
            <div className="card p-0 overflow-hidden">
              <img src={info.bannerBase64} alt="School Banner" className="w-full h-28 object-cover" />
              <div className="px-4 py-2">
                <p className="text-xs text-slate-400 font-medium">School Banner</p>
              </div>
            </div>
          )}

          {/* Logo + School Name header */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              {info.logoBase64 ? (
                <img src={info.logoBase64} alt="Logo" className="w-14 h-14 rounded-2xl object-contain border border-slate-100 bg-slate-50 p-1 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <School className="w-7 h-7 text-indigo-400" />
                </div>
              )}
              <div>
                <h2 className="font-display font-bold text-slate-800 text-base leading-tight">
                  {info.schoolName || user?.schoolName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{info.schoolCode || user?.schoolCode}</p>
                {info.primaryColor && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-3 h-3 rounded-full border border-slate-200" style={{ background: info.primaryColor }} />
                    <span className="text-xs text-slate-400 font-mono">{info.primaryColor}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-0">
              <InfoRow icon={Hash}         label="School Code"       value={info.schoolCode || user?.schoolCode} />
              <InfoRow icon={BookOpen}     label="Board"             value={info.boardType} />
              <InfoRow icon={Building2}    label="School Type"       value={info.schoolType} />
              <InfoRow icon={Hash}         label="Affiliation No."   value={info.affiliationNo} />
              <InfoRow icon={CalendarDays} label="Established Year"  value={info.establishedYear?.toString()} />
              <InfoRow icon={Globe}        label="Website"           value={info.websiteUrl} />
              <InfoRow icon={MapPin}       label="Address"           value={info.address} />
              <InfoRow icon={Phone}        label="Office Contact"    value={info.phone ? `+91 ${info.phone}` : null} />
              <InfoRow icon={Mail}         label="Support Email"     value={info.email} />
              <InfoRow icon={User}         label="Principal"         value={info.principalName} />
              <InfoRow icon={Phone}        label="Principal Contact" value={info.principalContact ? `+91 ${info.principalContact}` : null} />
              <InfoRow icon={User}         label="Admin Username"    value={info.adminUsername} />
              <InfoRow icon={User}         label="Role"              value="School Administrator" />
            </div>

            <p className="text-xs text-slate-400 mt-4 bg-slate-50 rounded-xl px-3 py-2">
              ℹ️ School details are managed by the Super Admin. Contact them for any changes.
            </p>
          </div>
        </div>

        {/* ── Right: Academic Configuration ── */}
        <div className="col-span-2">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-slate-800">Academic Configuration</h2>
            <p className="text-slate-500 text-sm">Click a section to expand and manage items — they populate all dropdowns across the platform.</p>
          </div>

          <div className="space-y-3">
            <CollapsibleList
              icon={BookOpen}
              title="Subjects"
              description="Subjects taught in this school"
              color="bg-brand-600"
              items={data.subjects}
              onAdd={addItem('subjects')}
              onRemove={removeItem('subjects')}
            />
            <CollapsibleList
              icon={Building2}
              title="Classes"
              description="Grade / class levels"
              color="bg-sky-500"
              items={data.classes}
              onAdd={addItem('classes')}
              onRemove={removeItem('classes')}
            />
            <CollapsibleList
              icon={Layout}
              title="Sections"
              description="Section divisions (A, B, C...)"
              color="bg-emerald-500"
              items={data.sections}
              onAdd={addItem('sections')}
              onRemove={removeItem('sections')}
            />
            <CollapsibleList
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