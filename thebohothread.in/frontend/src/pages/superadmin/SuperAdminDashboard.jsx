import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ShieldCheck, Plus, X, Loader2, LogOut, School,
  Eye, EyeOff, CheckCircle2, AlertCircle, Trash2, RefreshCw,
  Upload, MapPin, ChevronDown, Pencil, Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sendSchoolCredentials } from '../../services/emailService.js'

const SA_KEY = import.meta.env.VITE_SUPER_ADMIN_KEY || '706517@jnV'
const api = axios.create({
  baseURL: 'https://the-boho-thread.onrender.com/api',
  headers: { 'X-Super-Admin-Key': SA_KEY },
})

// ── CountriesNow API — live India states & cities, no auth needed ─
const COUNTRIESNOW = 'https://countriesnow.space/api/v0.1'

async function fetchIndiaStates() {
  const res = await fetch(`${COUNTRIESNOW}/countries/states`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: 'India' }),
  })
  const data = await res.json()
  return (data.data?.states || []).map(s => s.name).sort()
}

async function fetchCitiesForState(state) {
  const res = await fetch(`${COUNTRIESNOW}/countries/state/cities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country: 'India', state }),
  })
  const data = await res.json()
  return (data.data || []).sort()
}

const BOARD_TYPES  = ['CBSE','ICSE','State Board','IB']
const SCHOOL_TYPES = ['Private','Government','Semi-Govt']
const THEME_COLORS = [
  { label: 'Indigo',   value: '#4f46e5' },
  { label: 'Blue',     value: '#2563eb' },
  { label: 'Emerald',  value: '#059669' },
  { label: 'Violet',   value: '#7c3aed' },
  { label: 'Rose',     value: '#e11d48' },
  { label: 'Orange',   value: '#ea580c' },
  { label: 'Teal',     value: '#0d9488' },
  { label: 'Sky',      value: '#0284c7' },
]

const EMPTY = {
  schoolName:'', schoolCode:'', affiliationNo:'', boardType:'', schoolType:'',
  establishedYear:'', websiteUrl:'',
  state:'', city:'', locality:'',
  phone:'', email:'', principalName:'', principalContact:'',
  primaryColor:'#4f46e5', logoBase64:'', bannerBase64:'',
  adminUsername:'', adminPassword:'',
}

// ── Address popup — live data from CountriesNow API ──────────────
function AddressPopup({ state, city, locality, onChange, onClose }) {
  const [states,       setStates]       = useState([])
  const [cities,       setCities]       = useState([])
  const [loadingState, setLoadingState] = useState(true)
  const [loadingCity,  setLoadingCity]  = useState(false)

  // Load states once on mount
  useEffect(() => {
    setLoadingState(true)
    fetchIndiaStates()
      .then(setStates)
      .catch(() => toast.error('Could not load states'))
      .finally(() => setLoadingState(false))
  }, [])

  // Load cities whenever state changes
  useEffect(() => {
    if (!state) { setCities([]); return }
    setLoadingCity(true)
    fetchCitiesForState(state)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoadingCity(false))
  }, [state])

  return (
    <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-500" /> School Location
        </span>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">State</label>
        {loadingState ? (
          <div className="input flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading states...
          </div>
        ) : (
          <select className="input text-sm" value={state} onChange={e => onChange('state', e.target.value, '')}>
            <option value="">Select State</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
          City {loadingCity && <span className="text-indigo-400 font-normal normal-case">(loading...)</span>}
        </label>
        <select className="input text-sm" value={city}
          onChange={e => onChange('city', e.target.value)}
          disabled={!state || loadingCity}>
          <option value="">{loadingCity ? 'Loading cities...' : 'Select City'}</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Locality / Area</label>
        <input className="input text-sm" placeholder="e.g. Sector 12, Civil Lines..." value={locality}
          onChange={e => onChange('locality', e.target.value)} />
      </div>

      <button type="button" onClick={onClose}
        className="w-full py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
        Done
      </button>
    </div>
  )
}

// ── Image upload helper ───────────────────────────────────────────
function ImageUpload({ label, value, onChange, accept = 'image/*' }) {
  const ref = useRef()
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div onClick={() => ref.current.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center gap-3">
        {value ? (
          <img src={value} alt="preview" className="w-12 h-12 object-cover rounded-lg" />
        ) : (
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-slate-400" />
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-slate-600">{value ? 'Change image' : 'Click to upload'}</p>
          <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
        </div>
        {value && (
          <button type="button" onClick={e => { e.stopPropagation(); onChange('') }}
            className="ml-auto text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  )
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [schools,    setSchools]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [showPwd,    setShowPwd]    = useState(false)
  const [errorMsg,   setErrorMsg]   = useState('')
  const [showAddr,   setShowAddr]   = useState(false)
  const addrRef = useRef()

  const [resetTarget, setResetTarget] = useState(null)
  const [resetPwd,    setResetPwd]    = useState('')
  const [showRstPwd,  setShowRstPwd]  = useState(false)
  const [resetting,   setResetting]   = useState(false)

  // Edit school state
  const [editTarget,  setEditTarget]  = useState(null) // the school being edited
  const [editForm,    setEditForm]    = useState({})
  const [editSaving,  setEditSaving]  = useState(false)
  const [editErrorMsg,setEditErrorMsg]= useState('')
  const [showEditAddr,setShowEditAddr]= useState(false)
  const editAddrRef = useRef()

  useEffect(() => {
    if (!sessionStorage.getItem('sa_auth')) navigate('/superadmin', { replace: true })
  }, [navigate])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/super-admin/schools')
      setSchools(res.data)
    } catch { toast.error('Failed to load schools') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  // Close address popup on outside click
  useEffect(() => {
    const handler = (e) => { if (addrRef.current && !addrRef.current.contains(e.target)) setShowAddr(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close edit address popup on outside click
  useEffect(() => {
    const handler = (e) => { if (editAddrRef.current && !editAddrRef.current.contains(e.target)) setShowEditAddr(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const field = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleAddressChange = (key, value, resetCity) => {
    setForm(f => ({
      ...f,
      [key]: value,
      ...(resetCity !== undefined ? { city: resetCity } : {}),
    }))
  }

  const addressDisplay = [form.locality, form.city, form.state].filter(Boolean).join(', ')

  // Phone validation — Indian 10-digit
  const validatePhone = (val) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length > 10) return false
    return true
  }

  const openEdit = (s) => {
    setEditTarget(s)
    setEditForm({
      schoolName:       s.schoolName || '',
      affiliationNo:    s.affiliationNo || '',
      boardType:        s.boardType || '',
      schoolType:       s.schoolType || '',
      establishedYear:  s.establishedYear || '',
      websiteUrl:       s.websiteUrl || '',
      state:            s.state || '',
      city:             s.city || '',
      locality:         s.locality || '',
      phone:            s.phone || '',
      email:            s.email || '',
      principalName:    s.principalName || '',
      principalContact: s.principalContact || '',
      primaryColor:     s.primaryColor || '#4f46e5',
      // Use sentinel so backend skips updating these unless user picks a new image
      logoBase64:       '__UNCHANGED__',
      bannerBase64:     '__UNCHANGED__',
      adminUsername:    s.adminUsername || '',
    })
    setEditErrorMsg('')
  }

  const handleEditAddressChange = (key, value, resetCity) => {
    setEditForm(f => ({
      ...f,
      [key]: value,
      ...(resetCity !== undefined ? { city: resetCity } : {}),
    }))
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setEditErrorMsg('')
    if (editForm.phone && editForm.phone.replace(/\D/g,'').length !== 10) {
      setEditErrorMsg('Office contact must be a 10-digit Indian mobile number'); return
    }
    if (editForm.principalContact && editForm.principalContact.replace(/\D/g,'').length !== 10) {
      setEditErrorMsg('Principal contact must be a 10-digit Indian mobile number'); return
    }
    setEditSaving(true)
    try {
      // Sanitize payload — convert types so Jackson can deserialize correctly
      const payload = {
        ...editForm,
        // Integer field: send null if empty, otherwise parse to number
        establishedYear: editForm.establishedYear !== '' && editForm.establishedYear != null
          ? parseInt(editForm.establishedYear, 10)
          : null,
        // Blank strings → null so backend null-checks work correctly
        affiliationNo:    editForm.affiliationNo    || null,
        websiteUrl:       editForm.websiteUrl        || null,
        phone:            editForm.phone             || null,
        email:            editForm.email             || null,
        principalName:    editForm.principalName     || null,
        principalContact: editForm.principalContact  || null,
        adminPassword:    editForm.adminPassword     || null,
        // Keep base64 as-is (empty string is fine for logo/banner clear)
      }
      await api.put(`/super-admin/schools/${editTarget.schoolCode}`, payload)
      toast.success(`"${editForm.schoolName}" updated!`)
      setEditTarget(null)
      load()
    } catch (err) {
      setEditErrorMsg(err.response?.data?.error || 'Failed to update school')
    } finally { setEditSaving(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    // Validate Indian phones
    if (form.phone && form.phone.replace(/\D/g,'').length !== 10) {
      setErrorMsg('Office contact must be a 10-digit Indian mobile number'); return
    }
    if (form.principalContact && form.principalContact.replace(/\D/g,'').length !== 10) {
      setErrorMsg('Principal contact must be a 10-digit Indian mobile number'); return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        establishedYear: form.establishedYear !== '' && form.establishedYear != null
          ? parseInt(form.establishedYear, 10)
          : null,
      }
      await api.post('/super-admin/schools', payload)
      toast.success(`School "${form.schoolName}" created!`)
      setShowForm(false); setForm(EMPTY); load()

      // Send login credentials to admin email if provided
      if (form.email) {
        const emailResult = await sendSchoolCredentials({
          schoolName:    form.schoolName,
          email:         form.email,
          schoolCode:    form.schoolCode,
          adminUsername: form.adminUsername,
          password:      form.adminPassword,
        })
        if (emailResult.success) {
          toast.success("Login credentials sent to school admin's email ✉️")
        } else {
          toast.error('School created, but email delivery failed. Share credentials manually.')
          console.error('[EmailJS] School email error:', emailResult.error)
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to create school')
    } finally { setSaving(false) }
  }

  const handleDelete = async (schoolCode, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/super-admin/schools/${schoolCode}`)
      toast.success(`"${name}" deleted`); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Delete failed') }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (resetPwd.length < 6) { toast.error('Min 6 characters'); return }
    setResetting(true)
    try {
      await api.patch(`/super-admin/schools/${resetTarget.schoolCode}/reset-password`, { newPassword: resetPwd })
      toast.success(`Password reset for ${resetTarget.schoolName}`)
      setResetTarget(null)
    } catch (err) { toast.error(err.response?.data?.error || 'Reset failed') }
    finally { setResetting(false) }
  }

  const logout = () => { sessionStorage.removeItem('sa_auth'); navigate('/superadmin') }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-800 text-sm">SchoolWala</div>
            <div className="text-xs text-indigo-500 font-semibold uppercase tracking-widest">Super Admin</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Schools',  value: schools.length },
            { label: 'Active',         value: schools.filter(s => s.active !== false).length },
            { label: 'Inactive',       value: schools.filter(s => s.active === false).length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">{s.label}</div>
              <div className="text-2xl font-display font-bold text-slate-800">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-slate-800">Schools</h1>
          <button onClick={() => { setShowForm(true); setErrorMsg('') }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add School
          </button>
        </div>

        {loading ? <div className="card animate-pulse h-40" /> :
         schools.length === 0 ? (
          <div className="card text-center py-14 text-slate-400">
            <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No schools yet. Create your first school!</p>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Code','Name','Board','Type','State','Admin','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schools.map(s => (
                  <tr key={s.schoolCode} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {s.primaryColor && (
                          <div className="w-3 h-3 rounded-full border border-slate-200 shrink-0"
                            style={{ background: s.primaryColor }} />
                        )}
                        <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">{s.schoolCode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{s.schoolName}</td>
                    <td className="px-4 py-3 text-slate-600">{s.boardType || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.schoolType || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.state || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.adminUsername}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(s)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => { setResetTarget({ schoolCode: s.schoolCode, schoolName: s.schoolName }); setResetPwd(''); setShowRstPwd(false) }}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                          <RefreshCw className="w-3 h-3" /> Reset Pwd
                        </button>
                        <button onClick={() => handleDelete(s.schoolCode, s.schoolName)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── Create School Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <School className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="font-display text-lg font-bold text-slate-800">Create New School</h2>
              </div>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6">
              {errorMsg && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{errorMsg}</span>
                </div>
              )}

              {/* Section: Basic Info */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Basic Information</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="flabel">School Name <span className="text-rose-500">*</span></label>
                    <input className="input" placeholder="e.g. Sunrise Public School" value={form.schoolName}
                      onChange={e => field('schoolName', e.target.value)} required />
                  </div>
                  <div>
                    <label className="flabel">School Code <span className="text-rose-500">*</span></label>
                    <input className="input" placeholder="e.g. SCH001" value={form.schoolCode}
                      onChange={e => field('schoolCode', e.target.value.toUpperCase())} required />
                  </div>
                  <div>
                    <label className="flabel">Affiliation No.</label>
                    <input className="input" placeholder="e.g. 2130045" value={form.affiliationNo}
                      onChange={e => field('affiliationNo', e.target.value)} />
                  </div>
                  <div>
                    <label className="flabel">Board Type <span className="text-rose-500">*</span></label>
                    <select className="input" value={form.boardType} onChange={e => field('boardType', e.target.value)} required>
                      <option value="">Select Board</option>
                      {BOARD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flabel">School Type <span className="text-rose-500">*</span></label>
                    <select className="input" value={form.schoolType} onChange={e => field('schoolType', e.target.value)} required>
                      <option value="">Select Type</option>
                      {SCHOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flabel">Established Year</label>
                    <input className="input" type="number" placeholder="e.g. 1995" min="1800" max={new Date().getFullYear()}
                      value={form.establishedYear} onChange={e => field('establishedYear', e.target.value)} />
                  </div>
                  <div>
                    <label className="flabel">Website URL</label>
                    <input className="input" placeholder="https://school.com" value={form.websiteUrl}
                      onChange={e => field('websiteUrl', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Section: Address */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Address</div>
                <div ref={addrRef} className="relative">
                  <label className="flabel">Location <span className="text-rose-500">*</span></label>
                  <div className="input flex items-center justify-between cursor-pointer"
                    onClick={() => setShowAddr(v => !v)}>
                    <span className={addressDisplay ? 'text-slate-800' : 'text-slate-400'}>
                      {addressDisplay || 'Click to select state, city & locality'}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAddr ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  {showAddr && (
                    <AddressPopup
                      state={form.state} city={form.city} locality={form.locality}
                      onChange={handleAddressChange}
                      onClose={() => setShowAddr(false)}
                    />
                  )}
                </div>
              </div>

              {/* Section: Administrative Details */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Administrative Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flabel">Admin Username <span className="text-rose-500">*</span></label>
                    <input className="input" placeholder="e.g. principal" value={form.adminUsername}
                      onChange={e => field('adminUsername', e.target.value)} required />
                  </div>
                  <div>
                    <label className="flabel">Initial Password <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters"
                        value={form.adminPassword} onChange={e => field('adminPassword', e.target.value)} required />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="flabel">Principal Name</label>
                    <input className="input" placeholder="Full name" value={form.principalName}
                      onChange={e => field('principalName', e.target.value)} />
                  </div>
                  <div>
                    <label className="flabel">Principal Contact</label>
                    <div className="flex">
                      <span className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium">🇮🇳 +91</span>
                      <input className="input rounded-l-none" placeholder="10-digit number" maxLength={10}
                        value={form.principalContact}
                        onChange={e => { if (validatePhone(e.target.value)) field('principalContact', e.target.value.replace(/\D/g,'')) }} />
                    </div>
                  </div>
                  <div>
                    <label className="flabel">Office Contact Number</label>
                    <div className="flex">
                      <span className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium">🇮🇳 +91</span>
                      <input className="input rounded-l-none" placeholder="10-digit number" maxLength={10}
                        value={form.phone}
                        onChange={e => { if (validatePhone(e.target.value)) field('phone', e.target.value.replace(/\D/g,'')) }} />
                    </div>
                  </div>
                  <div>
                    <label className="flabel">Support Email (optional)</label>
                    <input className="input" type="email" placeholder="support@school.com" value={form.email}
                      onChange={e => field('email', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Section: Theme */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Primary Theme Color</div>
                <div className="flex flex-wrap gap-3 items-center">
                  {THEME_COLORS.map(c => (
                    <button key={c.value} type="button" onClick={() => field('primaryColor', c.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                        form.primaryColor === c.value ? 'border-slate-700 scale-105' : 'border-transparent bg-slate-100'
                      }`}>
                      <div className="w-4 h-4 rounded-full" style={{ background: c.value }} />
                      {c.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.primaryColor}
                      onChange={e => field('primaryColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200" />
                    <span className="text-xs text-slate-500">Custom</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-slate-200" style={{ background: form.primaryColor }} />
                  <span className="text-xs text-slate-500 font-mono">{form.primaryColor}</span>
                  <span className="text-xs text-slate-400">— this color will be applied across the school's portal</span>
                </div>
              </div>

              {/* Section: Media */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">School Media</div>
                <div className="grid grid-cols-2 gap-4">
                  <ImageUpload label="School Logo" value={form.logoBase64} onChange={v => field('logoBase64', v)} />
                  <ImageUpload label="School Banner / Cover Image" value={form.bannerBase64} onChange={v => field('bannerBase64', v)} />
                </div>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 text-xs text-indigo-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>School admin will log in using code <strong>{form.schoolCode || 'SCHOOL_CODE'}</strong> + username <strong>{form.adminUsername || 'username'}</strong>.</span>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit School Modal ── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-800">Edit School</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{editTarget.schoolCode}</p>
                </div>
              </div>
              <button onClick={() => setEditTarget(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {editErrorMsg && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{editErrorMsg}</span>
                </div>
              )}

              {/* Basic Info */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Basic Information</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="flabel">School Name <span className="text-rose-500">*</span></label>
                    <input className="input" value={editForm.schoolName} required
                      onChange={e => setEditForm(f => ({ ...f, schoolName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="flabel">Affiliation No.</label>
                    <input className="input" value={editForm.affiliationNo}
                      onChange={e => setEditForm(f => ({ ...f, affiliationNo: e.target.value }))} />
                  </div>
                  <div>
                    <label className="flabel">Board Type <span className="text-rose-500">*</span></label>
                    <select className="input" value={editForm.boardType} required
                      onChange={e => setEditForm(f => ({ ...f, boardType: e.target.value }))}>
                      <option value="">Select Board</option>
                      {BOARD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flabel">School Type <span className="text-rose-500">*</span></label>
                    <select className="input" value={editForm.schoolType} required
                      onChange={e => setEditForm(f => ({ ...f, schoolType: e.target.value }))}>
                      <option value="">Select Type</option>
                      {SCHOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flabel">Established Year</label>
                    <input className="input" type="number" min="1800" max={new Date().getFullYear()}
                      value={editForm.establishedYear}
                      onChange={e => setEditForm(f => ({ ...f, establishedYear: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="flabel">Website URL</label>
                    <input className="input" placeholder="https://school.com" value={editForm.websiteUrl}
                      onChange={e => setEditForm(f => ({ ...f, websiteUrl: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Address</div>
                <div ref={editAddrRef} className="relative">
                  <label className="flabel">Location</label>
                  <div className="input flex items-center justify-between cursor-pointer"
                    onClick={() => setShowEditAddr(v => !v)}>
                    <span className={[editForm.locality, editForm.city, editForm.state].filter(Boolean).join(', ') ? 'text-slate-800' : 'text-slate-400'}>
                      {[editForm.locality, editForm.city, editForm.state].filter(Boolean).join(', ') || 'Click to update location'}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showEditAddr ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  {showEditAddr && (
                    <AddressPopup
                      state={editForm.state} city={editForm.city} locality={editForm.locality}
                      onChange={handleEditAddressChange}
                      onClose={() => setShowEditAddr(false)}
                    />
                  )}
                </div>
              </div>

              {/* Admin & Contact */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Administrative Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flabel">Admin Username</label>
                    <input className="input" value={editForm.adminUsername}
                      onChange={e => setEditForm(f => ({ ...f, adminUsername: e.target.value }))} />
                  </div>
                  <div>
                    <label className="flabel">Principal Name</label>
                    <input className="input" value={editForm.principalName}
                      onChange={e => setEditForm(f => ({ ...f, principalName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="flabel">Principal Contact</label>
                    <div className="flex">
                      <span className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium">🇮🇳 +91</span>
                      <input className="input rounded-l-none" placeholder="10-digit number" maxLength={10}
                        value={editForm.principalContact}
                        onChange={e => { if (validatePhone(e.target.value)) setEditForm(f => ({ ...f, principalContact: e.target.value.replace(/\D/g,'') })) }} />
                    </div>
                  </div>
                  <div>
                    <label className="flabel">Office Contact Number</label>
                    <div className="flex">
                      <span className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium">🇮🇳 +91</span>
                      <input className="input rounded-l-none" placeholder="10-digit number" maxLength={10}
                        value={editForm.phone}
                        onChange={e => { if (validatePhone(e.target.value)) setEditForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,'') })) }} />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="flabel">Support Email</label>
                    <input className="input" type="email" placeholder="support@school.com" value={editForm.email}
                      onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Theme Color */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Primary Theme Color</div>
                <div className="flex flex-wrap gap-3 items-center">
                  {THEME_COLORS.map(c => (
                    <button key={c.value} type="button" onClick={() => setEditForm(f => ({ ...f, primaryColor: c.value }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                        editForm.primaryColor === c.value ? 'border-slate-700 scale-105' : 'border-transparent bg-slate-100'
                      }`}>
                      <div className="w-4 h-4 rounded-full" style={{ background: c.value }} />
                      {c.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <input type="color" value={editForm.primaryColor}
                      onChange={e => setEditForm(f => ({ ...f, primaryColor: e.target.value }))}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200" />
                    <span className="text-xs text-slate-500">Custom</span>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">School Media</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flabel">School Logo</label>
                    {editForm.logoBase64 === '__UNCHANGED__' ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-xs text-indigo-400 font-semibold text-center leading-tight px-1">Current logo kept</div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600">Logo already set</p>
                          <button type="button" onClick={() => setEditForm(f => ({ ...f, logoBase64: '' }))}
                            className="text-xs text-indigo-500 hover:text-indigo-700 mt-0.5">Click to replace</button>
                        </div>
                      </div>
                    ) : (
                      <ImageUpload label="" value={editForm.logoBase64} onChange={v => setEditForm(f => ({ ...f, logoBase64: v }))} />
                    )}
                  </div>
                  <div>
                    <label className="flabel">School Banner</label>
                    {editForm.bannerBase64 === '__UNCHANGED__' ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-xs text-indigo-400 font-semibold text-center leading-tight px-1">Current banner kept</div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600">Banner already set</p>
                          <button type="button" onClick={() => setEditForm(f => ({ ...f, bannerBase64: '' }))}
                            className="text-xs text-indigo-500 hover:text-indigo-700 mt-0.5">Click to replace</button>
                        </div>
                      </div>
                    ) : (
                      <ImageUpload label="" value={editForm.bannerBase64} onChange={v => setEditForm(f => ({ ...f, bannerBase64: v }))} />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={editSaving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {editSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="font-display text-base font-bold text-slate-800">Reset Admin Password</h2>
                <p className="text-xs text-slate-500 mt-0.5">{resetTarget.schoolName}</p>
              </div>
              <button onClick={() => setResetTarget(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="flabel">New Password</label>
                <div className="relative">
                  <input type={showRstPwd ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters"
                    value={resetPwd} onChange={e => setResetPwd(e.target.value)} required />
                  <button type="button" onClick={() => setShowRstPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showRstPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setResetTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={resetting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-60">
                  {resetting ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}