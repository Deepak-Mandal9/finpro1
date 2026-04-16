const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Investment = sequelize.define(
  'Investment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    portfolioId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'portfolios', key: 'id' },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    assetName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    assetSymbol: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    assetType: {
      type: DataTypes.ENUM('stock', 'mutual_fund', 'bond', 'etf', 'crypto', 'real_estate', 'fd', 'gold', 'other'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    },
    buyPrice: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
    },
    currentPrice: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    investedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currentValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    maturityDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'sold', 'matured'),
      defaultValue: 'active',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isin: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    exchange: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    tableName: 'investments',
    timestamps: true,
    getterMethods: {
      returns() {
        const invested = parseFloat(this.investedAmount) || 0;
        const current = parseFloat(this.currentValue) || invested;
        if (invested === 0) return 0;
        return (((current - invested) / invested) * 100).toFixed(2);
      },
      profitLoss() {
        const current = parseFloat(this.currentValue) || parseFloat(this.investedAmount);
        return (current - parseFloat(this.investedAmount)).toFixed(2);
      },
    },
  }
);

module.exports = Investment;
