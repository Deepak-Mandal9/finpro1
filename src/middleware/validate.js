const { validationResult, body, param, query } = require('express-validator');
const { errorResponse } = require('../utils/response');

// Run validation and return errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }
  next();
};

// ─── Auth validators ─────────────────────────────────────────────
const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must include uppercase, lowercase, and a number'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Portfolio validators ─────────────────────────────────────────
const portfolioRules = [
  body('name').trim().notEmpty().withMessage('Portfolio name is required'),
  body('type')
    .optional()
    .isIn(['stocks', 'mutual_funds', 'bonds', 'real_estate', 'crypto', 'mixed'])
    .withMessage('Invalid portfolio type'),
  body('targetAmount').optional().isFloat({ min: 0 }).withMessage('Invalid target amount'),
];

// ─── Investment validators ────────────────────────────────────────
const investmentRules = [
  body('portfolioId').isUUID().withMessage('Valid portfolio ID required'),
  body('assetName').trim().notEmpty().withMessage('Asset name is required'),
  body('assetType')
    .isIn(['stock', 'mutual_fund', 'bond', 'etf', 'crypto', 'real_estate', 'fd', 'gold', 'other'])
    .withMessage('Invalid asset type'),
  body('quantity').isFloat({ min: 0.000001 }).withMessage('Quantity must be positive'),
  body('buyPrice').isFloat({ min: 0 }).withMessage('Buy price must be non-negative'),
  body('purchaseDate').isDate().withMessage('Valid purchase date required'),
];

// ─── Transaction validators ───────────────────────────────────────
const transactionRules = [
  body('type')
    .isIn(['buy', 'sell', 'dividend', 'deposit', 'withdrawal', 'fee', 'sip'])
    .withMessage('Invalid transaction type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('netAmount').isFloat({ min: 0 }).withMessage('Net amount must be non-negative'),
];

// ─── Goal validators ─────────────────────────────────────────────
const goalRules = [
  body('name').trim().notEmpty().withMessage('Goal name is required'),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be positive'),
  body('targetDate').isDate().withMessage('Valid target date required'),
  body('category')
    .optional()
    .isIn(['retirement', 'education', 'home', 'car', 'travel', 'emergency_fund', 'wedding', 'other'])
    .withMessage('Invalid goal category'),
];

// ─── Pagination ───────────────────────────────────────────────────
const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
];

const uuidParam = (field = 'id') => [
  param(field).isUUID().withMessage(`${field} must be a valid UUID`),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  portfolioRules,
  investmentRules,
  transactionRules,
  goalRules,
  paginationRules,
  body,
  uuidParam,
};
