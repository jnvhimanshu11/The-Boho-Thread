# 🎓 SchoolWala — School ERP/CRM System

A full-stack School Management System built with **React + Spring Boot + JWT Authentication**.

---

## 📁 Project Structure

```
schoolwala/
├── backend/                    # Spring Boot (Java 17)
│   ├── src/main/java/com/schoolwala/
│   │   ├── config/             # Security, CORS, DataInitializer
│   │   ├── controller/         # REST API controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA Entities
│   │   ├── repository/         # Spring Data JPA
│   │   ├── security/           # JWT Filter & Utils
│   │   └── service/            # Business logic
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/                   # React + Vite + Tailwind CSS
│   └── src/
│       ├── components/         # Shared components
│       ├── context/            # AuthContext (JWT storage)
│       ├── pages/
│       │   ├── school/         # School Admin pages
│       │   ├── teacher/        # Teacher pages
│       │   └── student/        # Student pages
│       └── services/           # Axios API calls
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- H2 Console: http://localhost:8080/api/h2-console (dev only)

---

### Option 2: Manual Setup

#### Backend (Spring Boot)

**Prerequisites:** Java 17+, Maven 3.8+

```bash
cd backend
mvn spring-boot:run
```

Backend starts on **http://localhost:8080/api**

#### Frontend (React)

**Prerequisites:** Node.js 18+, npm

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on **http://localhost:3000**

---

## 🔐 Authentication & Roles

### 3 Login Portals (No self-registration)

| Portal | Login Fields | Route |
|--------|-------------|-------|
| **School Login** | School Code + Username + Password | `/auth/school/login` |
| **Teacher Login** | Teacher ID (e.g. TCH001-SCH001) + Password | `/auth/teacher/login` |
| **Student Login** | Student ID (e.g. STU0001-SCH001) + Password | `/auth/student/login` |

### Demo Credentials (Auto-seeded)

| Role | School Code | Username/ID | Password |
|------|-------------|-------------|----------|
| School Admin | SCH001 | admin | admin123 |
| School Admin | SCH002 | miadmin | mis2024 |

---

## 🏫 Role Permissions

### School Admin (Full Access)
| Feature | Access |
|---------|--------|
| Create Teacher accounts | ✅ |
| Create Student accounts | ✅ |
| View & manage all teachers | ✅ |
| View & manage all students | ✅ |
| Mark attendance | ✅ |
| Manage fees & collect payments | ✅ |
| View financial reports | ✅ |
| Upload/update school logo | ✅ |
| Activate/deactivate accounts | ✅ |

### Teacher (Limited Access)
| Feature | Access |
|---------|--------|
| Create Student accounts | ✅ |
| View students in school | ✅ |
| Mark attendance | ✅ |
| View school logo | ✅ |
| Create teacher accounts | ❌ |
| Manage fees | ❌ |
| View reports | ❌ |
| Update school logo | ❌ |

### Student (View Only)
| Feature | Access |
|---------|--------|
| View own attendance | ✅ |
| View own fee records | ✅ |
| View school logo | ✅ |
| View own profile | ✅ |
| Mark attendance | ❌ |
| Access other student data | ❌ |

---

## 🖼️ School Logo Feature

- School Admin can upload a logo (JPG/PNG, max 2MB) from **Settings** page
- Logo is stored as **Base64** in the database
- Automatically visible to all **Teachers** and **Students** of that school
- Logo updates in real-time — no page reload needed

---

## 🔑 JWT Implementation

- Token generated on login with **claims**: `uniqueId`, `role`, `schoolCode`, `fullName`
- Token expiry: **24 hours**
- Stored in **localStorage**
- Auto-attached to all API requests via Axios interceptor
- Auto-logout on 401 response
- Role-based route guards on both frontend and backend

---

## 🗄️ Database

### Development: H2 (In-memory/file-based)
No setup needed. Data persists in `./schoolwala-db.mv.db`.

### Production: MySQL
Uncomment MySQL config in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/schoolwala_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### Entities
- **School** — schoolCode (unique), admin credentials, logo
- **User** — uniqueId (auto-generated), role (TEACHER/STUDENT), schoolCode FK
- **Attendance** — studentUniqueId, date, status (PRESENT/ABSENT/LATE/HALF_DAY)
- **Fee** — studentUniqueId, feeType, totalAmount, paidAmount, status

---

## 📡 API Endpoints

### Auth (Public)
```
POST /api/auth/school/login
POST /api/auth/teacher/login
POST /api/auth/student/login
```

### School Admin (JWT + ROLE_SCHOOL_ADMIN)
```
GET    /api/school/admin/dashboard
POST   /api/school/admin/teachers
GET    /api/school/admin/teachers
POST   /api/school/admin/students
GET    /api/school/admin/students
PATCH  /api/school/admin/users/{id}/toggle
PUT    /api/school/admin/logo
GET    /api/school/admin/logo
POST   /api/school/admin/attendance
GET    /api/school/admin/attendance?date=YYYY-MM-DD
POST   /api/school/admin/fees
PATCH  /api/school/admin/fees/{id}/collect
GET    /api/school/admin/fees
GET    /api/school/admin/reports/summary
```

### Teacher (JWT + ROLE_TEACHER)
```
GET    /api/teacher/profile
GET    /api/teacher/logo
POST   /api/teacher/students
GET    /api/teacher/students
POST   /api/teacher/attendance
GET    /api/teacher/attendance?date=YYYY-MM-DD
```

### Student (JWT + ROLE_STUDENT)
```
GET    /api/student/profile
GET    /api/student/logo
GET    /api/student/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD
GET    /api/student/fees
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Notifications | React Hot Toast |
| Backend | Spring Boot 3.2 |
| Security | Spring Security + JWT (jjwt) |
| ORM | Spring Data JPA + Hibernate |
| Database (Dev) | H2 |
| Database (Prod) | MySQL 8 |
| Containerization | Docker + Docker Compose |
