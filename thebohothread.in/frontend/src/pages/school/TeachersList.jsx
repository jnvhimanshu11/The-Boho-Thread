import { useEffect, useRef, useState, useCallback } from 'react'
import { schoolAPI, authAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { sendTeacherCredentials } from '../../services/emailService.js'
import {
  Plus, X, Loader2, UserCheck, UserX, BookOpen, Download,
  ChevronDown, ChevronUp, Camera, Search, KeyRound, Eye, EyeOff, ShieldAlert
} from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

/* ─── School-level data (in real app, load from API / context) ─── */
const SCHOOL_SUBJECTS = [
  'Mathematics','Science','English','Hindi','Social Studies','Physics',
  'Chemistry','Biology','History','Geography','Computer Science','Sanskrit',
  'Physical Education','Art & Craft','Music','Economics','Accountancy',
  'Business Studies','Political Science','Psychology',
]
const SCHOOL_CLASSES = [
  'Class 1','Class 2','Class 3','Class 4','Class 5','Class 6',
  'Class 7','Class 8','Class 9','Class 10','Class 11','Class 12',
]
const SCHOOL_SECTIONS = ['A','B','C','D','E']
const ALL_QUALIFICATIONS = [
  'B.Ed (Bachelor of Education)','M.Ed (Master of Education)','B.Sc B.Ed','M.Sc',
  'B.A B.Ed','M.A','B.Com B.Ed','MBA','B.Tech','M.Tech','Ph.D',
  'D.El.Ed (Diploma in Elementary Education)','NTT (Nursery Teacher Training)',
  'CTET Qualified','TET Qualified','B.P.Ed','M.P.Ed','BCA','MCA',
  'B.Lib','M.Lib','PGDCA','B.Voc','Diploma in Music','Diploma in Art',
  'Diploma in Physical Education','B.F.A','M.F.A','B.Mus','PGDE','BHM',
  'NET Qualified','SET Qualified','B.Sc (Mathematics)','B.Sc (Physics)',
  'B.Sc (Chemistry)','B.Sc (Biology)','B.Sc (Computer Science)',
  'B.A (English)','B.A (Hindi)','B.A (History)','B.A (Geography)',
  'B.A (Political Science)','B.A (Economics)','M.Sc (Mathematics)',
  'M.Sc (Physics)','M.Sc (Chemistry)','M.A (English)','M.A (Hindi)',
]

/* ─── Helpers ─── */
let empSeq = Math.floor(1000 + Math.random() * 9000)
function genEmpId() {
  return `EMP-${new Date().getFullYear()}-${empSeq++}`
}
function validateIndianPhone(v) {
  const digits = v.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length !== 10) return 'Enter a valid 10-digit Indian mobile number'
  if (!/^[6-9]/.test(digits)) return 'Indian numbers must start with 6, 7, 8 or 9'
  return ''
}
function validateIFSC(v) {
  if (!v) return ''
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? '' : 'Format: 4 letters + 0 + 6 alphanumeric (e.g. SBIN0001234)'
}
function validatePAN(v) {
  if (!v) return ''
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v) ? '' : 'Format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)'
}
function validateAadhaar(v) {
  const d = v.replace(/\D/g, '')
  if (!d) return ''
  return d.length !== 12 ? 'Aadhaar must be exactly 12 digits' : ''
}
function validateBankAcc(v) {
  if (!v) return ''
  return /^\d{9,18}$/.test(v) ? '' : 'Account number must be 9–18 digits'
}

/* ─── Section header component ─── */
function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-brand-100">
      <Icon className="w-4 h-4 text-brand-600" />
      <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">{title}</span>
    </div>
  )
}

/* ─── Multi-select dropdown with search & checkboxes ─── */
function MultiSelectDropdown({ options, selected, onToggle, placeholder }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input w-full flex items-center justify-between text-left"
      >
        <span className={selected.length === 0 ? 'text-slate-400' : 'text-slate-700 font-medium'}>
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl">
          {/* Search */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-3 py-2 flex items-center gap-2 rounded-t-xl">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="text-sm outline-none w-full bg-transparent"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 leading-none">×</button>
            )}
          </div>
          {/* Options list */}
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400">No results</div>
            ) : (
              filtered.map(o => {
                const checked = selected.includes(o)
                return (
                  <label
                    key={o}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors ${checked ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <input
                      type="checkbox"
                      className="accent-brand-600 shrink-0"
                      checked={checked}
                      onChange={() => onToggle(o)}
                    />
                    {o}
                  </label>
                )
              })
            )}
          </div>
          {/* Footer: select all / clear */}
          {filtered.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50 rounded-b-xl">
              <button
                type="button"
                onClick={() => filtered.forEach(o => { if (!selected.includes(o)) onToggle(o) })}
                className="text-xs text-brand-600 hover:underline font-medium"
              >
                Select all
              </button>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => selected.forEach(o => onToggle(o))}
                  className="text-xs text-rose-500 hover:underline font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold border border-brand-100">
              {s}
              <button type="button" onClick={() => onToggle(s)} className="hover:text-brand-900 leading-none ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Qualification searchable dropdown ─── */
function QualDropdown({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = ALL_QUALIFICATIONS.filter(q => q.toLowerCase().includes(query.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        className="input"
        placeholder="Search qualification..."
        value={value ? value : query}
        onFocus={() => { setQuery(''); setOpen(true) }}
        onChange={e => { setQuery(e.target.value); onChange(''); setOpen(true) }}
      />
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-3 py-2 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              className="text-sm outline-none w-full bg-transparent"
              placeholder="Type to filter..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">No results</div>
          ) : filtered.map(q => (
            <div
              key={q}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-brand-50 hover:text-brand-700"
              onMouseDown={() => { onChange(q); setQuery(''); setOpen(false) }}
            >
              {q}
            </div>
          ))}
        </div>
      )}
      {value && (
        <p className="text-xs text-brand-600 font-semibold mt-1">✓ {value}</p>
      )}
    </div>
  )
}

/* ─── Section collapse wrapper ─── */
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card mb-4">
      <button
        type="button"
        className="w-full flex items-center justify-between mb-0"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="mt-4 pt-3 border-t border-brand-50">{children}</div>}
    </div>
  )
}

/* ─── Validated field ─── */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   EMPTY FORM STATE
════════════════════════════════════════════════════ */
const EMPTY_FORM = {
  employeeId: '',
  fullName: '', photo: '', gender: '', dob: '', address: '',
  email: '', phone: '', password: '', confirmPassword: '',
  subjects: [], classesAssigned: [], sections: [], isClassTeacher: false,
  qualification: '', experience: '', dateOfJoining: '', previousSchool: '',
  salaryStructure: '', salaryAmount: '', pf: 'Yes',
  bankAccount: '', ifsc: '', pan: '', aadhaar: '',
}

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════ */
export default function TeachersList() {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const photoInputRef = useRef()

  // Edit state
  const [editTeacher, setEditTeacher] = useState(null) // teacher object being edited
  const [editForm, setEditForm] = useState({})
  const [editSaving, setEditSaving] = useState(false)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null) // teacher to delete
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Reset password state
  const [resetTarget, setResetTarget] = useState(null)
  const [resetPwd, setResetPwd] = useState('')
  const [showResetPwd, setShowResetPwd] = useState(false)
  const [resetting, setResetting] = useState(false)

  const load = useCallback(() =>
    schoolAPI.getTeachers().then(r => setTeachers(r.data)).finally(() => setLoading(false))
  , [])

  useEffect(() => { load() }, [load])

  /* Open modal → auto-generate Employee ID */
  const openForm = () => {
    setForm({ ...EMPTY_FORM, employeeId: genEmpId() })
    setErrors({})
    setShowForm(true)
  }

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  /* Phone formatting */
  const handlePhone = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    let formatted = digits
    if (digits.length > 5) formatted = digits.slice(0, 5) + ' ' + digits.slice(5)
    set('phone', formatted)
  }

  /* Aadhaar formatting */
  const handleAadhaar = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 12)
    let fmt = d
    if (d.length > 8) fmt = d.slice(0, 4) + ' ' + d.slice(4, 8) + ' ' + d.slice(8)
    else if (d.length > 4) fmt = d.slice(0, 4) + ' ' + d.slice(4)
    set('aadhaar', fmt)
  }

  /* Photo */
  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { toast.error('Photo must be under 3MB'); return }
    const reader = new FileReader()
    reader.onload = ev => set('photo', ev.target.result)
    reader.readAsDataURL(file)
  }

  /* Validate all mandatory fields */
  const validate = () => {
    const e = {}
    if (!form.fullName.trim())     e.fullName = 'Full name is required'
    if (!form.photo)               e.photo = 'Profile photo is required'
    if (!form.gender)              e.gender = 'Gender is required'
    if (!form.dob)                 e.dob = 'Date of birth is required'
    if (!form.address.trim())      e.address = 'Address is required'
    if (!form.email.trim())        e.email = 'Email is required'
    const phoneErr = validateIndianPhone(form.phone.replace(/\D/g,''))
    if (!form.phone || phoneErr)   e.phone = phoneErr || 'Phone is required'
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (form.subjects.length === 0)       e.subjects = 'Select at least one subject'
    if (form.classesAssigned.length === 0) e.classesAssigned = 'Select at least one class'
    if (!form.qualification)       e.qualification = 'Qualification is required'
    if (!form.dateOfJoining)       e.dateOfJoining = 'Date of joining is required'
    // Optional but validated if filled
    if (form.bankAccount) { const err = validateBankAcc(form.bankAccount); if (err) e.bankAccount = err }
    if (form.ifsc)        { const err = validateIFSC(form.ifsc.toUpperCase()); if (err) e.ifsc = err }
    if (form.pan)         { const err = validatePAN(form.pan.toUpperCase()); if (err) e.pan = err }
    if (form.aadhaar)     { const err = validateAadhaar(form.aadhaar); if (err) e.aadhaar = err }
    return e
  }

  /* Submit */
  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fix the highlighted fields')
      return
    }
    setSaving(true)
    try {
      const payload = {
        employeeId:    form.employeeId,
        fullName:      form.fullName,
        email:         form.email,
        phone:         form.phone.replace(/\D/g, ''),
        subject:       form.subjects.join(', '),
        classAssigned: form.classesAssigned.join(', '),
        password:      form.password,
        gender:        form.gender,
        dob:           form.dob,
        address:       form.address,
        sections:      form.sections.join(', '),
        isClassTeacher: form.isClassTeacher,
        qualification: form.qualification,
        experience:    form.experience,
        dateOfJoining: form.dateOfJoining,
        previousSchool: form.previousSchool,
        salaryStructure: form.salaryStructure,
        salaryAmount:  form.salaryAmount,
        bankAccount:   form.bankAccount,
        ifsc:          form.ifsc.toUpperCase(),
        pan:           form.pan.toUpperCase(),
        aadhaar:       form.aadhaar.replace(/\D/g,''),
      }
      const res = await schoolAPI.createTeacher(payload)
      toast.success(`Teacher created! ID: ${res.data.uniqueId}`)
      setShowForm(false)
      load()

      // Send login credentials via EmailJS
      if (form.email) {
        const emailResult = await sendTeacherCredentials({
          fullName:   form.fullName,
          email:      form.email,
          uniqueId:   res.data.uniqueId,
          password:   form.password,
          schoolName: user?.schoolName,
        })
        if (emailResult.success) {
          toast.success("Login credentials sent to teacher's email ✉️")
        } else {
          toast.error('Account created, but email delivery failed. Share credentials manually.')
          console.error('[EmailJS] Teacher email error:', emailResult.error)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create teacher')
    } finally { setSaving(false) }
  }

  const toggle = async (id) => {
    await schoolAPI.toggleUser(id)
    toast.success('Status updated')
    load()
  }

  /* Open edit modal */
  const openEdit = (t) => {
    setEditTeacher(t)
    setEditForm({
      employeeId:    t.employeeId || '',
      fullName:      t.fullName || '',
      email:         t.email || '',
      phone:         t.phone || '',
      address:       t.address || '',
      subject:       t.subject || '',
      classAssigned: t.classAssigned || '',
    })
  }

  /* Save edit */
  const saveEdit = async () => {
    if (!editForm.fullName.trim()) { toast.error('Name is required'); return }
    setEditSaving(true)
    try {
      await schoolAPI.updateTeacher(editTeacher.uniqueId, {
        employeeId:    editForm.employeeId,
        fullName:      editForm.fullName,
        email:         editForm.email,
        phone:         editForm.phone.replace(/\D/g, ''),
        address:       editForm.address,
        subject:       editForm.subject,
        classAssigned: editForm.classAssigned,
      })
      toast.success('Teacher updated successfully')
      setEditTeacher(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    } finally { setEditSaving(false) }
  }

  /* Permanent delete */
  const confirmDelete = async () => {
    if (deleteConfirm !== deleteTarget.fullName) {
      toast.error('Name does not match'); return
    }
    setDeleting(true)
    try {
      await schoolAPI.deleteTeacher(deleteTarget.uniqueId)
      toast.success('Teacher permanently deleted')
      setDeleteTarget(null)
      setDeleteConfirm('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete')
    } finally { setDeleting(false) }
  }


  /* Reset teacher password */
  const submitReset = async (e) => {
    e.preventDefault()
    if (resetPwd.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setResetting(true)
    try {
      await authAPI.resetPassword(resetTarget.uniqueId, resetPwd)
      toast.success(`Password reset for ${resetTarget.fullName}. They must change it on next login.`)
      setResetTarget(null)
      setResetPwd('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password')
    } finally { setResetting(false) }
  }

  /* Export teachers to Excel */
  const exportToExcel = () => {
    if (teachers.length === 0) {
      toast.error('No teacher data to export')
      return
    }
    const schoolName = user?.schoolName || 'School'
    const sheetName = `Teacher Details _ ${schoolName}`.slice(0, 31) // Excel sheet name max 31 chars

    const rows = teachers.map((t, i) => ({
      'S.No':              i + 1,
      'Unique ID':         t.uniqueId || '',
      'Employee ID':       t.employeeId || '',
      'Full Name':         t.fullName || '',
      'Gender':            t.gender || '',
      'Date of Birth':     t.dob || '',
      'Address':           t.address || '',
      'Email':             t.email || '',
      'Phone':             t.phone || '',
      'Subjects':          t.subject || '',
      'Classes Assigned':  t.classAssigned || '',
      'Sections':          t.sections || '',
      'Is Class Teacher':  t.isClassTeacher ? 'Yes' : 'No',
      'Qualification':     t.qualification || '',
      'Experience':        t.experience || '',
      'Date of Joining':   t.dateOfJoining || '',
      'Previous School':   t.previousSchool || '',
      'Salary Structure':  t.salaryStructure || '',
      'Salary Amount':     t.salaryAmount || '',
      'PF':                t.pf || '',
      'Bank Account':      t.bankAccount || '',
      'IFSC Code':         t.ifsc || '',
      'PAN Number':        t.pan || '',
      'Aadhaar Number':    t.aadhaar || '',
      'Status':            t.active ? 'Active' : 'Inactive',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)

    // Auto-width columns
    const colWidths = Object.keys(rows[0] || {}).map(key => ({
      wch: Math.max(key.length, ...rows.map(r => String(r[key] || '').length)) + 2
    }))
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    const fileName = `Teacher_Details_${schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`
    XLSX.writeFile(wb, fileName)
    toast.success(`Exported ${teachers.length} teacher(s) to Excel`)
  }

  const today = new Date().toISOString().split('T')[0]

  /* ─── RENDER ─── */
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Teachers</h1>
          <p className="text-slate-500 text-sm">{teachers.length} teacher(s) registered</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={openForm} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Teacher
          </button>
        </div>
      </div>

      {/* ══════════ MODAL ══════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-800">Create Teacher Account</h2>
                <p className="text-xs text-slate-400 mt-0.5">Fields marked <span className="text-rose-500 font-bold">*</span> are mandatory</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-0" noValidate>

              {/* ── 1. Personal Details ── */}
              <CollapsibleSection title="Personal Details" icon={({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
                <div className="grid grid-cols-2 gap-4">

                  {/* Employee ID - read-only */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Employee ID <span className="text-rose-500">*</span>
                      <span className="ml-2 text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full normal-case font-semibold tracking-normal">Auto-generated</span>
                    </label>
                    <input
                      type="text"
                      className="input font-mono font-bold text-brand-700 bg-brand-50 cursor-not-allowed"
                      value={form.employeeId}
                      readOnly
                    />
                  </div>

                  {/* Full Name */}
                  <Field label="Full Name" required error={errors.fullName}>
                    <input type="text" className={`input ${errors.fullName ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                      placeholder="Dr. Ramesh Kumar"
                      value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                  </Field>

                  {/* Profile Photo - full width */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Profile Photo <span className="text-rose-500">*</span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-5 cursor-pointer transition-colors hover:border-brand-400 hover:bg-brand-50 ${errors.photo ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
                      onClick={() => photoInputRef.current.click()}
                    >
                      {form.photo ? (
                        <img src={form.photo} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-brand-400 shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <Camera className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{form.photo ? 'Change photo' : 'Upload profile photo'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG · Max 3MB</p>
                      </div>
                    </div>
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                    {errors.photo && <p className="text-xs text-rose-500 mt-1">{errors.photo}</p>}
                  </div>

                  {/* Gender */}
                  <Field label="Gender" required error={errors.gender}>
                    <select className={`input ${errors.gender ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                      value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>
                  </Field>

                  {/* Date of Birth */}
                  <Field label="Date of Birth" required error={errors.dob}>
                    <input type="date" className={`input ${errors.dob ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                      max={today} value={form.dob} onChange={e => set('dob', e.target.value)} />
                  </Field>

                  {/* Address - full width */}
                  <div className="col-span-2">
                    <Field label="Address" required error={errors.address}>
                      <input type="text" className={`input ${errors.address ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                        placeholder="Street, City, State, PIN code"
                        value={form.address} onChange={e => set('address', e.target.value)} />
                    </Field>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── 2. Contact & Account ── */}
              <CollapsibleSection title="Contact & Account" icon={({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email" required error={errors.email}>
                    <input type="email" className={`input ${errors.email ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                      placeholder="teacher@school.com"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </Field>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Phone (India) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-600 font-semibold">+91</span>
                      <input
                        type="tel"
                        className={`input rounded-l-none ${errors.phone ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={e => handlePhone(e.target.value)}
                        maxLength={11}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                  </div>

                  <Field label="Password" required error={errors.password}>
                    <input type="password" className={`input ${errors.password ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                      placeholder="Min 6 characters"
                      value={form.password} onChange={e => set('password', e.target.value)} />
                  </Field>

                  <Field label="Confirm Password" required error={errors.confirmPassword}>
                    <input type="password" className={`input ${errors.confirmPassword ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                      placeholder="Re-enter password"
                      value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                  </Field>

                  {/* Password notice */}
                  <div className="col-span-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Teacher will be required to change this password on their first login.</span>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── 3. Academic Assignment ── */}
              <CollapsibleSection title="Academic Assignment" icon={({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Subjects <span className="text-rose-500">*</span>
                    </label>
                    <MultiSelectDropdown
                      options={SCHOOL_SUBJECTS}
                      selected={form.subjects}
                      onToggle={v => set('subjects', form.subjects.includes(v) ? form.subjects.filter(s => s !== v) : [...form.subjects, v])}
                      placeholder="+ Add subject"
                    />
                    {errors.subjects && <p className="text-xs text-rose-500 mt-1">{errors.subjects}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Classes Assigned <span className="text-rose-500">*</span>
                    </label>
                    <MultiSelectDropdown
                      options={SCHOOL_CLASSES}
                      selected={form.classesAssigned}
                      onToggle={v => set('classesAssigned', form.classesAssigned.includes(v) ? form.classesAssigned.filter(c => c !== v) : [...form.classesAssigned, v])}
                      placeholder="+ Add class"
                    />
                    {errors.classesAssigned && <p className="text-xs text-rose-500 mt-1">{errors.classesAssigned}</p>}
                  </div>

                  {/* Sections - show only when classes selected */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Sections</label>
                    {form.classesAssigned.length === 0 ? (
                      <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3">Select classes first</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {SCHOOL_SECTIONS.map(s => {
                          const checked = form.sections.includes(s)
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                const next = checked
                                  ? form.sections.filter(x => x !== s)
                                  : [...form.sections, s]
                                set('sections', next)
                              }}
                              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                                checked
                                  ? 'bg-brand-600 text-white border-brand-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400 hover:text-brand-600'
                              }`}
                            >
                              Section {s}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Class Teacher Toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Class Teacher <span className="text-rose-500">*</span>
                    </label>
                    <div className="border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between bg-slate-50">
                      <span className="text-sm text-slate-700">Is class teacher?</span>
                      <button
                        type="button"
                        onClick={() => set('isClassTeacher', !form.isClassTeacher)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${form.isClassTeacher ? 'bg-brand-600' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isClassTeacher ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── 4. Professional Details ── */}
              <CollapsibleSection title="Professional Details" icon={({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Qualification <span className="text-rose-500">*</span>
                    </label>
                    <QualDropdown value={form.qualification} onChange={v => set('qualification', v)} />
                    {errors.qualification && <p className="text-xs text-rose-500 mt-1">{errors.qualification}</p>}
                  </div>

                  <Field label="Experience">
                    <select className="input" value={form.experience} onChange={e => set('experience', e.target.value)}>
                      <option value="">Select</option>
                      <option>Fresher (0 years)</option>
                      {[1,2,3,4,5].map(n => <option key={n}>{n} year{n>1?'s':''}</option>)}
                      <option>6–8 years</option>
                      <option>9–11 years</option>
                      <option>12–15 years</option>
                      <option>16–20 years</option>
                      <option>20+ years</option>
                    </select>
                  </Field>

                  <Field label="Date of Joining" required error={errors.dateOfJoining}>
                    <input type="date" className={`input ${errors.dateOfJoining ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                      max={today} value={form.dateOfJoining} onChange={e => set('dateOfJoining', e.target.value)} />
                  </Field>

                  <div className="col-span-2">
                    <Field label="Previous School (optional)">
                      <input type="text" className="input" placeholder="Previous institution name"
                        value={form.previousSchool} onChange={e => set('previousSchool', e.target.value)} />
                    </Field>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── 5. Salary & Payroll ── */}
              <CollapsibleSection title="Salary & Payroll (Optional)" defaultOpen={false} icon={({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Field label="Salary Structure">
                    <select className="input" value={form.salaryStructure} onChange={e => set('salaryStructure', e.target.value)}>
                      <option value="">Select</option>
                      <option>Grade Pay Scale</option>
                      <option>Fixed Monthly</option>
                      <option>CTC Based</option>
                      <option>Contract</option>
                    </select>
                  </Field>
                  <Field label="Monthly Gross (₹)">
                    <input type="number" className="input" placeholder="e.g. 45000"
                      value={form.salaryAmount} onChange={e => set('salaryAmount', e.target.value)} />
                  </Field>
                  <Field label="PF Applicable">
                    <select className="input" value={form.pf} onChange={e => set('pf', e.target.value)}>
                      <option>Yes</option><option>No</option>
                    </select>
                  </Field>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4">
                  <p className="text-xs text-amber-700 font-semibold">🔒 Sensitive — Bank & ID details are encrypted at rest</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Bank Account Number" error={errors.bankAccount}>
                    <input type="text" className={`input ${errors.bankAccount ? 'ring-2 ring-rose-400' : ''}`}
                      placeholder="9–18 digit account number" maxLength={18}
                      value={form.bankAccount} onChange={e => set('bankAccount', e.target.value.replace(/\D/g,''))} />
                  </Field>
                  <Field label="IFSC Code" error={errors.ifsc}>
                    <input type="text" className={`input uppercase ${errors.ifsc ? 'ring-2 ring-rose-400' : ''}`}
                      placeholder="e.g. SBIN0001234" maxLength={11}
                      value={form.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())} />
                  </Field>
                  <Field label="PAN Number" error={errors.pan}>
                    <input type="text" className={`input uppercase ${errors.pan ? 'ring-2 ring-rose-400' : ''}`}
                      placeholder="e.g. ABCDE1234F" maxLength={10}
                      value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} />
                  </Field>
                  <Field label="Aadhaar Number" error={errors.aadhaar}>
                    <input type="text" className={`input ${errors.aadhaar ? 'ring-2 ring-rose-400' : ''}`}
                      placeholder="1234 5678 9012" maxLength={14}
                      value={form.aadhaar} onChange={e => handleAadhaar(e.target.value)} />
                  </Field>
                </div>
              </CollapsibleSection>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ TABLE ══════════ */}
      {loading ? (
        <div className="card animate-pulse h-40" />
      ) : teachers.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No teachers yet. Add your first teacher!</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Unique ID','Employee ID','Name','Subject','Class','Phone','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md">{t.uniqueId}</span>
                      {t.mustChangePassword && (
                        <span title="Password change pending on next login" className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-medium">
                          <KeyRound className="w-2.5 h-2.5" /> Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">{t.employeeId || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{t.fullName}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.subject || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.classAssigned || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.phone || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${t.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                      {t.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {/* Edit */}
                      <button onClick={() => openEdit(t)}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                      </button>
                      {/* Toggle Active */}
                      <button onClick={() => toggle(t.uniqueId)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                          t.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}>
                        {t.active ? <><UserX className="w-3 h-3" />Deactivate</> : <><UserCheck className="w-3 h-3" />Activate</>}
                      </button>
                      {/* Reset Password */}
                      <button onClick={() => { setResetTarget({ uniqueId: t.uniqueId, fullName: t.fullName }); setResetPwd(''); setShowResetPwd(false) }}
                        title="Reset password"
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                        <KeyRound className="w-3 h-3" /> Reset Pwd
                      </button>
                      {/* Permanent Delete */}
                      <button onClick={() => { setDeleteTarget(t); setDeleteConfirm('') }}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════ EDIT MODAL ══════════ */}
      {editTeacher && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-800">Edit Teacher</h2>
                <p className="text-xs text-slate-400 mt-0.5">{editTeacher.uniqueId}</p>
              </div>
              <button onClick={() => setEditTeacher(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Employee ID">
                  <input type="text" className="input font-mono"
                    value={editForm.employeeId}
                    onChange={e => setEditForm(f => ({ ...f, employeeId: e.target.value }))} />
                </Field>
                <Field label="Full Name" required>
                  <input type="text" className="input"
                    value={editForm.fullName}
                    onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} />
                </Field>
                <Field label="Email">
                  <input type="email" className="input"
                    value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </Field>
                <Field label="Phone">
                  <input type="text" className="input" maxLength={10}
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,"").slice(0,10) }))} />
                </Field>
                <Field label="Subject(s)">
                  <input type="text" className="input"
                    placeholder="e.g. Mathematics, Science"
                    value={editForm.subject}
                    onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))} />
                </Field>
                <Field label="Class(es)">
                  <input type="text" className="input"
                    placeholder="e.g. Class 10, Class 11"
                    value={editForm.classAssigned}
                    onChange={e => setEditForm(f => ({ ...f, classAssigned: e.target.value }))} />
                </Field>
                <div className="col-span-2">
                  <Field label="Address">
                    <input type="text" className="input"
                      value={editForm.address}
                      onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
                  </Field>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditTeacher(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="button" onClick={saveEdit} disabled={editSaving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {editSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ DELETE CONFIRM MODAL ══════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-1">Permanently Delete Teacher</h3>
              <p className="text-sm text-slate-500 text-center mb-4">
                This will <span className="font-semibold text-red-600">permanently remove</span> <span className="font-semibold">{deleteTarget.fullName}</span> and all their data. This cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-red-700 font-semibold mb-2">Type the teacher name to confirm:</p>
                <input
                  type="text"
                  className="input border-red-300 focus:ring-red-400"
                  placeholder={deleteTarget.fullName}
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setDeleteTarget(null); setDeleteConfirm("") }}
                  className="btn-secondary flex-1">Cancel</button>
                <button type="button" onClick={confirmDelete} disabled={deleting || deleteConfirm !== deleteTarget.fullName}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ RESET PASSWORD MODAL ══════════ */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-800">Reset Password</h2>
                  <p className="text-xs text-slate-500">{resetTarget.fullName}</p>
                </div>
              </div>
              <button onClick={() => setResetTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={submitReset} className="p-6 space-y-4">
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>The teacher will be forced to change this password on their next login.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <input
                    type={showResetPwd ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Min 6 characters"
                    value={resetPwd}
                    onChange={e => setResetPwd(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowResetPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showResetPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setResetTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={resetting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
                  {resetting ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting...</> : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}