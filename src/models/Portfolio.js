const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Portfolio = sequelize.define(
  'Portfolio',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('stocks', 'mutual_funds', 'bonds', 'real_estate', 'crypto', 'mixed'),
      defaultValue: 'mixed',
    },
    targetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    currentValue: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    investedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'portfolios',
    timestamps: true,
    getterMethods: {
      returns() {
        const invested = parseFloat(this.investedAmount) || 0;
        const current = parseFloat(this.currentValue) || 0;
        if (invested === 0) return 0;
        return (((current - invested) / invested) * 100).toFixed(2);
      },
      profitLoss() {
        return (parseFloat(this.currentValue) - parseFloat(this.investedAmount)).toFixed(2);
      },
    },
  }
);

module.exports = Portfolio;
