# FinPro — Backend API

> Node.js + Express + PostgreSQL backend for the FinPro Wealth Management Platform.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14

### 2. Clone & install
```bash
git clone <repo>
cd finpro-backend
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials and secrets
```

### 4. Create database
```sql
-- In psql
CREATE DATABASE FinPro;
```

### 5. Run (dev — auto-syncs schema)
```bash
npm run dev
```

### 6. (Optional) Seed test data
```bash
npm run db:seed
```

Server starts at `http://localhost:5000`

---

## 🗂 Project Structure

```
src/
├── config/
│   ├── database.js       # Sequelize connection
│   └── seed.js           # Dev seed data
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── portfolioController.js
│   ├── investmentController.js
│   ├── transactionController.js
│   ├── goalController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js           # JWT protect + authorize
│   ├── errorHandler.js
│   └── validate.js       # express-validator rules
├── models/
│   ├── index.js          # Associations
│   ├── User.js
│   ├── Portfolio.js
│   ├── Investment.js
│   ├── Transaction.js
│   └── Goal.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── portfolios.js
│   ├── investments.js
│   ├── transactions.js
│   ├── goals.js
│   └── dashboard.js
├── utils/
│   ├── jwt.js
│   └── response.js
├── app.js
└── server.js
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <accessToken>
```

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login & get tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout (clears refresh token) |
| GET | `/auth/me` | ✅ | Get current user |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | ✅ | Get own profile |
| PUT | `/users/profile` | ✅ | Update profile |
| PUT | `/users/change-password` | ✅ | Change password |
| PUT | `/users/kyc` | ✅ | Submit KYC |
| GET | `/users` | Admin | List all users |
| PUT | `/users/:id/kyc` | Admin | Approve/reject KYC |

### Portfolios
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/portfolios` | ✅ | List all portfolios |
| POST | `/portfolios` | ✅ | Create portfolio |
| GET | `/portfolios/:id` | ✅ | Get portfolio detail |
| PUT | `/portfolios/:id` | ✅ | Update portfolio |
| DELETE | `/portfolios/:id` | ✅ | Soft-delete portfolio |
| GET | `/portfolios/:id/summary` | ✅ | P&L summary + allocation |

### Investments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/investments` | ✅ | List investments (paginated) |
| POST | `/investments` | ✅ | Add investment (auto-creates BUY txn) |
| GET | `/investments/:id` | ✅ | Get investment + transactions |
| PUT | `/investments/:id` | ✅ | Update price / notes |
| POST | `/investments/:id/sell` | ✅ | Sell investment (auto-creates SELL txn) |

### Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/transactions` | ✅ | List transactions (filterable) |
| POST | `/transactions` | ✅ | Create manual transaction |
| GET | `/transactions/:id` | ✅ | Get transaction detail |
| GET | `/transactions/summary` | ✅ | Aggregated summary by type |

### Goals
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/goals` | ✅ | List all goals |
| POST | `/goals` | ✅ | Create goal |
| GET | `/goals/:id` | ✅ | Goal detail + projection |
| PUT | `/goals/:id` | ✅ | Update goal |
| DELETE | `/goals/:id` | ✅ | Delete goal |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | ✅ | Full dashboard: overview, allocation, top performers, recent txns, goals, monthly P&L |

### Health
```
GET /health
```

---

## 🔐 Auth Flow

```
Register / Login → { accessToken, refreshToken }

# Use accessToken (7d) in every request header
Authorization: Bearer <accessToken>

# When expired, call refresh:
POST /api/auth/refresh  { "refreshToken": "..." }
→ new { accessToken, refreshToken }
```

---

## 🗄 Database Schema

```
users
  id, firstName, lastName, email, password, phone,
  dateOfBirth, panNumber, kycStatus, riskProfile, role,
  isActive, lastLogin, refreshToken, createdAt, updatedAt

portfolios
  id, userId, name, description, type, targetAmount,
  currentValue, investedAmount, currency, isDefault, isActive

investments
  id, portfolioId, userId, assetName, assetSymbol, assetType,
  quantity, buyPrice, currentPrice, investedAmount, currentValue,
  purchaseDate, maturityDate, status, notes, isin, exchange

transactions
  id, userId, portfolioId, investmentId, type, amount,
  units, price, fees, taxes, netAmount, status,
  transactionDate, referenceId, description, assetName

goals
  id, userId, name, category, targetAmount, currentAmount,
  targetDate, monthlyContribution, expectedReturn,
  priority, status, notes
```

---

## 🌐 Connecting to Your Frontend

In your Lovable frontend, set the API base URL:
```js
const API_BASE = 'https://your-deployed-backend.com/api';
// or for local dev:
const API_BASE = 'http://localhost:5000/api';
```

Example fetch:
```js
const res = await fetch(`${API_BASE}/dashboard`, {
  headers: { Authorization: `Bearer ${accessToken}` }
});
const { data } = await res.json();
```

---

## 🚢 Production Deployment

1. Set `NODE_ENV=production` in env
2. Use **migrations** instead of `sequelize.sync()` for schema changes
3. Put behind a reverse proxy (nginx / Caddy)
4. Deploy to Railway, Render, or any Node.js host
5. Use managed PostgreSQL (Supabase, Neon, RDS, etc.)

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| express | Web framework |
| sequelize + pg | ORM + PostgreSQL driver |
| jsonwebtoken | JWT access & refresh tokens |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| helmet | Security headers |
| cors | Cross-origin requests |
| express-rate-limit | Brute-force protection |
| morgan | HTTP request logging |
