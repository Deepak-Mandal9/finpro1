require('dotenv').config();
const { sequelize } = require('./database');
const { User, Portfolio, Investment, Transaction, Goal } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // ⚠️  Drops and recreates all tables

    console.log('🌱 Seeding database...');

    // ── Users ─────────────────────────────────────────────────────
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Fin',
      email: 'admin@FinPro.com',
      password: 'Admin@1234',
      role: 'admin',
      kycStatus: 'verified',
    });

    const client = await User.create({
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul@example.com',
      password: 'Test@1234',
      phone: '+919876543210',
      role: 'client',
      kycStatus: 'verified',
      riskProfile: 'moderate',
    });

    // ── Portfolios ────────────────────────────────────────────────
    const portfolio = await Portfolio.create({
      userId: client.id,
      name: 'Core Portfolio',
      description: 'Primary long-term wealth portfolio',
      type: 'mixed',
      targetAmount: 5000000,
      isDefault: true,
    });

    // ── Investments ───────────────────────────────────────────────
    const inv1 = await Investment.create({
      portfolioId: portfolio.id,
      userId: client.id,
      assetName: 'Reliance Industries',
      assetSymbol: 'RELIANCE',
      assetType: 'stock',
      quantity: 10,
      buyPrice: 2500,
      currentPrice: 2780,
      investedAmount: 25000,
      currentValue: 27800,
      purchaseDate: '2024-06-01',
      exchange: 'NSE',
      isin: 'INE002A01018',
    });

    const inv2 = await Investment.create({
      portfolioId: portfolio.id,
      userId: client.id,
      assetName: 'HDFC Nifty 50 Index Fund',
      assetSymbol: 'HDFCNIFTY',
      assetType: 'mutual_fund',
      quantity: 500,
      buyPrice: 100,
      currentPrice: 118,
      investedAmount: 50000,
      currentValue: 59000,
      purchaseDate: '2024-01-15',
    });

    // Update portfolio totals
    await portfolio.update({
      investedAmount: 75000,
      currentValue: 86800,
    });

    // ── Transactions ──────────────────────────────────────────────
    await Transaction.create({
      userId: client.id,
      portfolioId: portfolio.id,
      investmentId: inv1.id,
      type: 'buy',
      amount: 25000,
      units: 10,
      price: 2500,
      netAmount: 25000,
      transactionDate: '2024-06-01',
      assetName: 'Reliance Industries',
      status: 'completed',
    });

    await Transaction.create({
      userId: client.id,
      portfolioId: portfolio.id,
      investmentId: inv2.id,
      type: 'sip',
      amount: 5000,
      units: 50,
      price: 100,
      netAmount: 5000,
      transactionDate: '2025-01-01',
      assetName: 'HDFC Nifty 50 Index Fund',
      status: 'completed',
    });

    // ── Goals ─────────────────────────────────────────────────────
    await Goal.create({
      userId: client.id,
      name: 'Retirement Fund',
      category: 'retirement',
      targetAmount: 10000000,
      currentAmount: 86800,
      targetDate: '2045-01-01',
      monthlyContribution: 25000,
      expectedReturn: 12,
      priority: 'high',
      status: 'on_track',
    });

    await Goal.create({
      userId: client.id,
      name: 'Child Education',
      category: 'education',
      targetAmount: 2000000,
      currentAmount: 0,
      targetDate: '2035-06-01',
      monthlyContribution: 8000,
      expectedReturn: 10,
      priority: 'high',
    });

    console.log('✅ Seed complete!');
    console.log('\n📋 Test credentials:');
    console.log('   Admin  → admin@finpro.com  / Admin@1234');
    console.log('   Client → rahul@example.com      / Test@1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
