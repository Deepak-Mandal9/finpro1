const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config();

const swaggerEnabled = process.env.SWAGGER_ENABLE === 'true' || process.env.NODE_ENV !== 'production';

const { connectDB } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes        = require('./routes/auth');
const userRoutes        = require('./routes/users');
const portfolioRoutes   = require('./routes/portfolios');
const investmentRoutes  = require('./routes/investments');
const transactionRoutes = require('./routes/transactions');
const goalRoutes        = require('./routes/goals');
const dashboardRoutes   = require('./routes/dashboard');

const app = express();
app.set('trust proxy', 1);

let dbConnected = false;
app.use(async (req, res, next) => {
  if (dbConnected) {
    return next();
  }

  try {
    await connectDB();
    dbConnected = true;
    next();
  } catch (error) {
    next(error);
  }
});

// ── Security ─────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://finpro.lovable.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ─────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Request parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Root landing page ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FinPro API is running.',
    routes: {
      health: '/health',
      docs: '/api/docs',
      apiBase: '/api',
    },
  });
});

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FinPro API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── Swagger / OpenAPI ──────────────────────────────────────────────
if (swaggerEnabled) {
  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs', swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
} else {
  app.use('/api/docs', (req, res) => {
    res.status(404).json({ success: false, message: 'API documentation is disabled in production.' });
  });
  app.get('/api/docs.json', (req, res) => {
    res.status(404).json({ success: false, message: 'API documentation is disabled in production.' });
  });
}

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/portfolios',   portfolioRoutes);
app.use('/api/investments',  investmentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals',        goalRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// ── 404 & Error handlers ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
