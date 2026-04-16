const { Portfolio, Investment, Transaction } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { Op } = require('sequelize');

// @GET /api/portfolios
const getPortfolios = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: { userId: req.user.id, isActive: true },
      include: [{ model: Investment, as: 'investments', where: { status: 'active' }, required: false }],
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });
    return successResponse(res, portfolios, 'Portfolios retrieved.');
  } catch (err) {
    next(err);
  }
};

// @POST /api/portfolios
const createPortfolio = async (req, res, next) => {
  try {
    const { name, description, type, targetAmount, currency } = req.body;

    // If first portfolio, set as default
    const count = await Portfolio.count({ where: { userId: req.user.id } });

    const portfolio = await Portfolio.create({
      userId: req.user.id,
      name,
      description,
      type,
      targetAmount,
      currency: currency || 'INR',
      isDefault: count === 0,
    });

    return successResponse(res, portfolio, 'Portfolio created.', 201);
  } catch (err) {
    next(err);
  }
};

// @GET /api/portfolios/:id
const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Investment, as: 'investments' }],
    });

    if (!portfolio) return errorResponse(res, 'Portfolio not found.', 404);
    return successResponse(res, portfolio);
  } catch (err) {
    next(err);
  }
};

// @PUT /api/portfolios/:id
const updatePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!portfolio) return errorResponse(res, 'Portfolio not found.', 404);

    const { name, description, type, targetAmount } = req.body;
    await portfolio.update({ name, description, type, targetAmount });

    return successResponse(res, portfolio, 'Portfolio updated.');
  } catch (err) {
    next(err);
  }
};

// @DELETE /api/portfolios/:id
const deletePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!portfolio) return errorResponse(res, 'Portfolio not found.', 404);
    if (portfolio.isDefault) return errorResponse(res, 'Cannot delete default portfolio.', 400);

    await portfolio.update({ isActive: false });
    return successResponse(res, null, 'Portfolio deleted.');
  } catch (err) {
    next(err);
  }
};

// @GET /api/portfolios/:id/summary
const getPortfolioSummary = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Investment, as: 'investments', where: { status: 'active' }, required: false }],
    });

    if (!portfolio) return errorResponse(res, 'Portfolio not found.', 404);

    const investments = portfolio.investments || [];
    const totalInvested = investments.reduce((s, i) => s + parseFloat(i.investedAmount), 0);
    const totalCurrent = investments.reduce((s, i) => s + parseFloat(i.currentValue || i.investedAmount), 0);
    const profitLoss = totalCurrent - totalInvested;
    const returns = totalInvested > 0 ? ((profitLoss / totalInvested) * 100).toFixed(2) : 0;

    // Asset allocation breakdown
    const allocation = investments.reduce((acc, inv) => {
      acc[inv.assetType] = (acc[inv.assetType] || 0) + parseFloat(inv.investedAmount);
      return acc;
    }, {});

    return successResponse(res, {
      portfolio,
      summary: {
        totalInvested: totalInvested.toFixed(2),
        currentValue: totalCurrent.toFixed(2),
        profitLoss: profitLoss.toFixed(2),
        returns: `${returns}%`,
        totalHoldings: investments.length,
        allocation,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPortfolios, createPortfolio, getPortfolio, updatePortfolio, deletePortfolio, getPortfolioSummary };
