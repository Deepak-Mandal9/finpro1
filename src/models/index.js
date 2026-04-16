const User = require('./User');
const Portfolio = require('./Portfolio');
const Investment = require('./Investment');
const Transaction = require('./Transaction');
const Goal = require('./Goal');

// ─── Associations ────────────────────────────────────────────────

// User ↔ Portfolio
User.hasMany(Portfolio, { foreignKey: 'userId', as: 'portfolios', onDelete: 'CASCADE' });
Portfolio.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ Investment
User.hasMany(Investment, { foreignKey: 'userId', as: 'investments', onDelete: 'CASCADE' });
Investment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Portfolio ↔ Investment
Portfolio.hasMany(Investment, { foreignKey: 'portfolioId', as: 'investments', onDelete: 'CASCADE' });
Investment.belongsTo(Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

// User ↔ Transaction
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Portfolio ↔ Transaction
Portfolio.hasMany(Transaction, { foreignKey: 'portfolioId', as: 'transactions' });
Transaction.belongsTo(Portfolio, { foreignKey: 'portfolioId', as: 'portfolio' });

// Investment ↔ Transaction
Investment.hasMany(Transaction, { foreignKey: 'investmentId', as: 'transactions' });
Transaction.belongsTo(Investment, { foreignKey: 'investmentId', as: 'investment' });

// User ↔ Goal
User.hasMany(Goal, { foreignKey: 'userId', as: 'goals', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Portfolio, Investment, Transaction, Goal };
