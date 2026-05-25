import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 - auto logout
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sw_token')
      localStorage.removeItem('sw_user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ==================== Auth ====================
export const authAPI = {
  schoolLogin: (data) => api.post('/auth/school/login', data),
  teacherLogin: (data) => api.post('/auth/teacher/login', data),
  studentLogin: (data) => api.post('/auth/student/login', data),
}

// ==================== School Admin ====================
export const schoolAPI = {
  getDashboard: () => api.get('/school/admin/dashboard'),
  getTeachers: () => api.get('/school/admin/teachers'),
  createTeacher: (data) => api.post('/school/admin/teachers', data),
  getStudents: () => api.get('/school/admin/students'),
  createStudent: (data) => api.post('/school/admin/students', data),
  toggleUser: (id) => api.patch(`/school/admin/users/${id}/toggle`),
  updateTeacher: (id, data) => api.put(`/school/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/school/admin/teachers/${id}`),
  updateLogo: (logoBase64) => api.put('/school/admin/logo', { logoBase64 }),
  getLogo: () => api.get('/school/admin/logo'),
  markAttendance: (data) => api.post('/school/admin/attendance', data),
  getAttendance: (date) => api.get(`/school/admin/attendance?date=${date}`),
  getStudentAttendance: (id, from, to) => api.get(`/school/admin/attendance/student/${id}?from=${from}&to=${to}`),
  addFee: (data) => api.post('/school/admin/fees', data),
  collectFee: (id, data) => api.patch(`/school/admin/fees/${id}/collect`, data),
  getAllFees: () => api.get('/school/admin/fees'),
  getStudentFees: (id) => api.get(`/school/admin/fees/student/${id}`),
  getReport: () => api.get('/school/admin/reports/summary'),
}

// ==================== Teacher ====================
export const teacherAPI = {
  getProfile: () => api.get('/teacher/profile'),
  getLogo: () => api.get('/teacher/logo'),
  createStudent: (data) => api.post('/teacher/students', data),
  getStudents: () => api.get('/teacher/students'),
  markAttendance: (data) => api.post('/teacher/attendance', data),
  getAttendance: (date) => api.get(`/teacher/attendance?date=${date}`),
}

// ==================== Student ====================
export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  getLogo: () => api.get('/student/logo'),
  getAttendance: (from, to) => api.get(`/student/attendance?from=${from}&to=${to}`),
  getFees: () => api.get('/student/fees'),
}

export default api