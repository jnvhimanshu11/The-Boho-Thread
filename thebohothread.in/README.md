# 🎓 StudyHub — Student Help Hub + School CRM

A full-stack platform for Indian students with **class notes**, **AI tools**, and a complete **School CRM** (students, fees, attendance, reports).

---

## 📁 Project Structure

```
school-crm/
├── frontend/                    ← Next.js 14 + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── page.tsx                    ← Homepage
│       │   ├── auth/
│       │   │   ├── login/page.tsx          ← Login
│       │   │   └── register/page.tsx       ← Register
│       │   ├── notes/
│       │   │   ├── page.tsx                ← Notes listing
│       │   │   └── [id]/page.tsx           ← Note detail
│       │   ├── tools/
│       │   │   └── page.tsx                ← AI Tools (4 tools)
│       │   └── dashboard/
│       │       ├── student/page.tsx        ← Student dashboard
│       │       ├── admin/
│       │       │   ├── page.tsx            ← Admin overview
│       │       │   ├── notes/page.tsx      ← Upload/manage notes
│       │       │   └── users/page.tsx      ← Manage users
│       │       └── crm/
│       │           ├── page.tsx            ← CRM dashboard
│       │           ├── students/page.tsx   ← Student management
│       │           ├── fees/page.tsx       ← Fee collection
│       │           ├── attendance/page.tsx ← Attendance marking
│       │           ├── reports/page.tsx    ← Reports & charts
│       │           └── settings/page.tsx   ← CRM settings
│       ├── components/
│       │   ├── layout/
│       │   │   └── Sidebar.tsx             ← Shared sidebar (all roles)
│       │   ├── shared/
│       │   │   ├── QueryProvider.tsx
│       │   │   ├── SearchBar.tsx
│       │   │   ├── StatsBar.tsx
│       │   │   └── FeatureCard.tsx
│       │   ├── notes/
│       │   │   ├── ClassSelector.tsx
│       │   │   └── PopularNotes.tsx
│       │   ├── ai/
│       │   │   └── AIToolsPreview.tsx
│       │   └── crm/
│       │       └── StudentFormModal.tsx
│       ├── lib/
│       │   ├── api-client.ts               ← Axios with JWT interceptor
│       │   ├── auth-api.ts                 ← Auth API calls
│       │   ├── notes-api.ts                ← Notes & questions API
│       │   ├── crm-api.ts                  ← CRM API (students, fees, attendance)
│       │   ├── ai-api.ts                   ← AI tools API
│       │   └── utils.ts                    ← Helpers, cn(), formatCurrency()
│       ├── store/
│       │   └── auth-store.ts               ← Zustand auth state
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useDarkMode.ts
│       └── types/
│           └── index.ts                    ← All TypeScript types
│
└── backend/                     ← Node.js + Express + MongoDB
    └── src/
        ├── server.js                       ← Express app entry
        ├── config/
        │   ├── database.js
        │   ├── cloudinary.js
        │   └── multer.js
        ├── models/
        │   ├── User.model.js
        │   ├── Note.model.js
        │   ├── Question.model.js
        │   ├── School.model.js
        │   ├── Student.model.js
        │   ├── FeeStructure.model.js
        │   ├── FeePayment.model.js
        │   └── Attendance.model.js
        ├── controllers/
        │   ├── auth.controller.js
        │   ├── notes.controller.js
        │   ├── questions.controller.js
        │   ├── ai.controller.js
        │   ├── crm.students.controller.js
        │   └── crm.fees.controller.js
        ├── routes/
        │   ├── auth.routes.js
        │   ├── notes.routes.js
        │   ├── questions.routes.js
        │   ├── ai.routes.js
        │   ├── crm.routes.js               ← Aggregates all CRM routes
        │   ├── crm.students.routes.js
        │   ├── crm.fees.routes.js
        │   ├── crm.feestructure.routes.js
        │   ├── crm.attendance.routes.js
        │   ├── crm.dashboard.routes.js
        │   ├── admin.routes.js
        │   └── upload.routes.js
        ├── middleware/
        │   ├── auth.middleware.js           ← JWT protect + authorize
        │   ├── errorHandler.js
        │   └── notFound.js
        └── utils/
            └── seed.js                     ← Demo data seeder
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Razorpay account (for fee payments)
- Cloudinary account (for PDF/image uploads)

---

### 1. Clone & Install

```bash
git clone <your-repo-url> school-crm
cd school-crm

# Install root deps
npm install

# Install frontend deps
cd frontend && npm install && cd ..

# Install backend deps
cd backend && npm install && cd ..
```

---

### 2. Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/school-crm

JWT_SECRET=change_this_to_a_long_random_string_in_production
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

OPENAI_API_KEY=sk-your-openai-key

RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret

FRONTEND_URL=http://localhost:3000
```

---

### 3. Frontend Environment

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_xxxx
```

---

### 4. Seed Demo Data

```bash
cd backend
npm run seed
```

This creates:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@studyhub.in | admin123 |
| School Admin | school@dps.edu.in | school123 |
| Student | student@example.com | student123 |

---

### 5. Run Development

```bash
# From project root — runs both frontend and backend
npm run dev

# Or individually:
npm run dev:frontend    # → http://localhost:3000
npm run dev:backend     # → http://localhost:5000
```

---

## 🌐 Pages & Routes

| URL | Description |
|-----|-------------|
| `/` | Homepage with search, class selector, AI tools |
| `/auth/login` | Login page |
| `/auth/register` | Register (student or school admin) |
| `/notes` | Browse all notes with filters |
| `/notes/[id]` | Note detail with PDF download |
| `/tools` | AI Tools (Doubt Solver, Summarizer, Homework, Essay) |
| `/dashboard/student` | Student dashboard |
| `/dashboard/admin` | Super admin dashboard |
| `/dashboard/admin/notes` | Upload & manage notes |
| `/dashboard/admin/users` | Manage all users |
| `/dashboard/crm` | School CRM dashboard |
| `/dashboard/crm/students` | Student management + CRUD |
| `/dashboard/crm/fees` | Fee collection + Razorpay |
| `/dashboard/crm/attendance` | Daily attendance marking |
| `/dashboard/crm/reports` | Charts + Excel export |
| `/dashboard/crm/settings` | School settings |

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Notes
```
GET    /api/notes              ?class=&subject=&search=&page=
GET    /api/notes/:id
POST   /api/notes              (admin, multipart/form-data with PDF)
PUT    /api/notes/:id
DELETE /api/notes/:id
POST   /api/notes/:id/view
```

### Questions
```
GET    /api/questions          ?class=&subject=&type=&isPYQ=
POST   /api/questions
PUT    /api/questions/:id
DELETE /api/questions/:id
```

### AI Tools
```
POST /api/ai/solve-doubt        { question, imageBase64? }
POST /api/ai/summarize          { text }
POST /api/ai/homework           { subject, question }
POST /api/ai/essay              { topic, wordCount, style }
POST /api/ai/generate-quiz      { subject, class, chapter, count }
```

### CRM – Students
```
GET    /api/crm/students        ?class=&section=&search=&page=
GET    /api/crm/students/:id
POST   /api/crm/students
PUT    /api/crm/students/:id
DELETE /api/crm/students/:id
GET    /api/crm/students/export (→ Excel file)
```

### CRM – Fees
```
GET  /api/crm/fee-payments      ?studentId=&status=&month=
POST /api/crm/fee-payments/create-order
POST /api/crm/fee-payments/verify
POST /api/crm/fee-payments/cash
GET  /api/crm/fee-payments/summary
```

### CRM – Attendance
```
GET  /api/crm/attendance               ?date=&class=
POST /api/crm/attendance/bulk
GET  /api/crm/attendance/student/:id   ?month=YYYY-MM
```

### CRM – Dashboard
```
GET /api/crm/dashboard/stats
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Custom design system |
| State | Zustand (auth), TanStack Query (server state) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer + Cloudinary |
| AI | OpenAI GPT-4o-mini |
| Payments | Razorpay |
| Export | ExcelJS |

---

## ☁️ Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Render / Railway
- Set all `.env` variables in the dashboard
- Start command: `node src/server.js`
- Build command: `npm install`

### Database → MongoDB Atlas
- Free tier supports up to 512MB
- Whitelist `0.0.0.0/0` for Render/Railway IPs

---

## 📲 Monetization Setup

1. **School CRM Subscriptions** — charge ₹2,000–5,000/month per school
2. **Premium Notes** — gate revision notes behind subscription
3. **AI Credits** — free 20 queries/day, premium for unlimited
4. **Paid Test Series** — upload paid question banks

---

## 🎨 Design System

Colors defined in `tailwind.config.js`:
- **Primary**: Indigo (`#4f46e5`)
- **Accent**: Orange (`#f97316`)

Key CSS classes (in `globals.css`):
- `.card` — white rounded card with border
- `.btn-primary` — indigo button
- `.btn-secondary` — white bordered button
- `.input-field` — styled input
- `.badge`, `.badge-success`, `.badge-error` — status badges
- `.stat-card` — icon + number stat card
- `.sidebar-link` — nav item

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push and open a Pull Request

---

Made with ❤️ for Indian students — Class 6 to College
