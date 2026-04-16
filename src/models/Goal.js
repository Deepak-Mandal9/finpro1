const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Goal = sequelize.define(
  'Goal',
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
    category: {
      type: DataTypes.ENUM('retirement', 'education', 'home', 'car', 'travel', 'emergency_fund', 'wedding', 'other'),
      defaultValue: 'other',
    },
    targetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    targetDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    monthlyContribution: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    expectedReturn: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 12,
      comment: 'Expected annual return in %',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('on_track', 'behind', 'achieved', 'paused'),
      defaultValue: 'on_track',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'goals',
    timestamps: true,
    getterMethods: {
      progressPercent() {
        const target = parseFloat(this.targetAmount) || 1;
        const current = parseFloat(this.currentAmount) || 0;
        return Math.min(((current / target) * 100).toFixed(2), 100);
      },
      remainingAmount() {
        return Math.max(0, parseFloat(this.targetAmount) - parseFloat(this.currentAmount)).toFixed(2);
      },
    },
  }
);

module.exports = Goal;
