const { Portfolio, Investment, Transaction, Goal } = require('../models');
const { successResponse } = require('../utils/response');
const { Op, fn, col, literal } = require('sequelize');

// @GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ── Portfolios summary ────────────────────────────────────────
    const portfolios = await Portfolio.findAll({
      where: { userId, isActive: true },
    });

    const totalInvested = portfolios.reduce((s, p) => s + parseFloat(p.investedAmount), 0);
    const totalCurrentValue = portfolios.reduce((s, p) => s + parseFloat(p.currentValue), 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalReturns = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : 0;

    // ── Active investments ────────────────────────────────────────
    const investments = await Investment.findAll({
      where: { userId, status: 'active' },
    });

    // Asset allocation
    const allocation = investments.reduce((acc, inv) => {
      acc[inv.assetType] = (acc[inv.assetType] || 0) + parseFloat(inv.investedAmount);
      return acc;
    }, {});

    // Top performers
    const topPerformers = [...investments]
      .map((inv) => ({
        id: inv.id,
        assetName: inv.assetName,
        assetType: inv.assetType,
        returns: parseFloat(inv.returns),
        profitLoss: parseFloat(inv.profitLoss),
        currentValue: inv.currentValue,
      }))
      .sort((a, b) => b.returns - a.returns)
      .slice(0, 5);

    // ── Recent transactions ───────────────────────────────────────
    const recentTransactions = await Transaction.findAll({
      where: { userId },
      limit: 10,
      order: [['transactionDate', 'DESC']],
    });

    // ── Goals ────────────────────────────────────────────────────
    const goals = await Goal.findAll({ where: { userId } });
    const goalsSummary = goals.map((g) => ({
      id: g.id,
      name: g.name,
      category: g.category,
      progressPercent: g.progressPercent,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      status: g.status,
    }));

    // ── Monthly P&L (last 6 months) ───────────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTxns = await Transaction.findAll({
      where: {
        userId,
        transactionDate: { [Op.gte]: sixMonthsAgo },
        type: { [Op.in]: ['buy', 'sell', 'dividend'] },
      },
      order: [['transactionDate', 'ASC']],
    });

    const monthlyData = monthlyTxns.reduce((acc, txn) => {
      const key = txn.transactionDate.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[key]) acc[key] = { month: key, invested: 0, returned: 0, dividends: 0 };
      if (txn.type === 'buy') acc[key].invested += parseFloat(txn.amount);
      if (txn.type === 'sell') acc[key].returned += parseFloat(txn.amount);
      if (txn.type === 'dividend') acc[key].dividends += parseFloat(txn.amount);
      return acc;
    }, {});

    return successResponse(res, {
      overview: {
        totalInvested: totalInvested.toFixed(2),
        currentValue: totalCurrentValue.toFixed(2),
        profitLoss: totalProfitLoss.toFixed(2),
        returns: `${totalReturns}%`,
        totalPortfolios: portfolios.length,
        totalHoldings: investments.length,
      },
      allocation,
      topPerformers,
      recentTransactions,
      goals: goalsSummary,
      monthlyPerformance: Object.values(monthlyData),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
