/**
 * EmailJS integration for sending login credentials.
 * Single template handles both teachers and students.
 *
 * ── TEMPLATE VARIABLES ───────────────────────────────────────────
 *   {{to_name}}     – full name
 *   {{to_email}}    – email address  (set as "To Email" in template)
 *   {{login_id}}    – unique ID (e.g. TCH001-SCH001 / STU001-SCH001)
 *   {{password}}    – initial password
 *   {{role}}        – "Teacher" or "Student"
 *   {{grade}}       – "Grade: Class 10" for students, blank for teachers
 *   {{school_name}} – school display name
 *   {{login_url}}   – login page URL
 * ─────────────────────────────────────────────────────────────────
 */

// ── ⚙️  CONFIGURE THESE THREE VALUES ──────────────────────────────
export const EMAILJS_CONFIG = {
  SERVICE_ID:  'service_92770ew',
  TEMPLATE_ID: 'template_63krnd9',
  PUBLIC_KEY:  'BX_diJSU4apzbpE69',
}
// ──────────────────────────────────────────────────────────────────

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send'

/**
 * Low-level send via EmailJS REST API (no SDK needed).
 * Returns { success: true } or { success: false, error: string }
 */
async function sendEmail(templateParams) {
  const { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY } = EMAILJS_CONFIG
  try {
    const res = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:      SERVICE_ID,
        template_id:     TEMPLATE_ID,
        user_id:         PUBLIC_KEY,
        template_params: templateParams,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      return { success: false, error: `EmailJS error: ${text}` }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Send login credentials to a newly created teacher.
 *
 * @param {object} params
 * @param {string} params.fullName     – teacher's full name
 * @param {string} params.email        – teacher's email address
 * @param {string} params.uniqueId     – system-generated unique ID
 * @param {string} params.password     – initial plain-text password
 * @param {string} [params.schoolName] – school display name
 */
export async function sendTeacherCredentials({
  fullName,
  email,
  uniqueId,
  password,
  schoolName = 'SchoolWala',
}) {
  return sendEmail({
    to_name:     fullName,
    to_email:    email,
    login_id:    uniqueId,
    password:    password,
    role:        'Teacher',
    grade:       '',                                      // blank for teachers
    school_name: schoolName,
    login_url:   window.location.origin + '/login',
  })
}

/**
 * Send login credentials to a newly created student.
 *
 * @param {object} params
 * @param {string} params.fullName     – student's full name
 * @param {string} params.email        – student's email address
 * @param {string} params.uniqueId     – system-generated unique ID
 * @param {string} params.password     – initial plain-text password
 * @param {string} [params.grade]      – grade / class
 * @param {string} [params.schoolName] – school display name
 */
export async function sendStudentCredentials({
  fullName,
  email,
  uniqueId,
  password,
  grade = '',
  schoolName = 'SchoolWala',
}) {
  return sendEmail({
    to_name:     fullName,
    to_email:    email,
    login_id:    uniqueId,
    password:    password,
    role:        'Student',
    grade:       grade ? `Grade: ${grade}` : '',          // shows only if grade exists
    school_name: schoolName,
    login_url:   window.location.origin + '/login',
  })
}