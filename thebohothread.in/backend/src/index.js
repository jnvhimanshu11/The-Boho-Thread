require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Route imports
const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const questionsRoutes = require('./routes/questions.routes');
const aiRoutes = require('./routes/ai.routes');
const crmStudentsRoutes = require('./routes/crm.students.routes');
const crmFeesRoutes = require('./routes/crm.fees.routes');
const crmAttendanceRoutes = require('./routes/crm.attendance.routes');
const crmDashboardRoutes = require('./routes/crm.dashboard.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect Database ─────────────────────────────────────────────────────
connectDB();

// ── Global Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiting ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  message: { error: 'Too many requests, please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { error: 'Too many AI requests. Please wait before trying again.' },
});

app.use('/api', globalLimiter);
app.use('/api/ai', aiLimiter);

// ── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/crm/students', crmStudentsRoutes);
app.use('/api/crm/fee-structures', require('./routes/crm.feestructure.routes'));
app.use('/api/crm/fee-payments', crmFeesRoutes);
app.use('/api/crm/attendance', crmAttendanceRoutes);
app.use('/api/crm/dashboard', crmDashboardRoutes);
app.use('/api/upload', uploadRoutes);

// ── Error Handlers ───────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 API Base: http://localhost:${PORT}/api\n`);
});

module.exports = app;
