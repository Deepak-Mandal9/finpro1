const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define(
  'Transaction',
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
    portfolioId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'portfolios', key: 'id' },
    },
    investmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'investments', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('buy', 'sell', 'dividend', 'deposit', 'withdrawal', 'fee', 'sip'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    units: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    fees: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    taxes: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    netAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'completed',
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    referenceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assetName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['portfolioId'] },
      { fields: ['transactionDate'] },
    ],
  }
);

module.exports = Transaction;
