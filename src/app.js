const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
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
const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FinPro API Docs</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css" integrity="sha512-1M2e2Rz0L8z+vixwSv3s1md7GqAzHPrMH3S0vVLNHOmA8gg2Hn+U1QGqgnS0I2IABhlslCxcx6LqNj8k/qSennQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <style>body { margin:0; padding:0; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.min.js" integrity="sha512-IU8H6/DrhPtE8Y/gHmclf1ebftKDzpPEpbcLraGo1+CqI3PYz0eMXT3UWi6pWtgMPTMKMZKAcMzP/HOUe+gqJA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.min.js" integrity="sha512-/6zRV48G2UpyRZkQXZO8dhZEgBQdkh6WqQWZ+AI4uf6Wam0WjRXhodTNL3yDM6vTn4sZcXemfOA1BjjTQxYAtQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script>
    window.onload = function () {
      SwaggerUIBundle({
        url: '/api/docs.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'BaseLayout',
        deepLinking: true,
        explorer: true,
      });
    };
  </script>
</body>
</html>`;

if (swaggerEnabled) {
  app.get(['/api/docs', '/api/docs/'], (req, res) => res.send(swaggerHtml));
  app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
} else {
  app.get(['/api/docs', '/api/docs/'], (req, res) => {
    res.status(404).json({ success: false, message: 'API documentation is disabled in production.' });
  });
  app.get('/api/docs.json', (req, res) => res.status(404).json({ success: false, message: 'API documentation is disabled in production.' }));
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
