const { Investment, Portfolio, Transaction } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { sequelize } = require('../config/database');

// @GET /api/investments
const getInvestments = async (req, res, next) => {
  try {
    const { portfolioId, assetType, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (portfolioId) where.portfolioId = portfolioId;
    if (assetType) where.assetType = assetType;
    if (status) where.status = status;

    const { count, rows } = await Investment.findAndCountAll({
      where,
      include: [{ model: Portfolio, as: 'portfolio', attributes: ['id', 'name'] }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return paginatedResponse(res, rows, count, page, limit, 'Investments retrieved.');
  } catch (err) {
    next(err);
  }
};

// @POST /api/investments
const createInvestment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      portfolioId, assetName, assetSymbol, assetType, quantity,
      buyPrice, purchaseDate, maturityDate, notes, isin, exchange,
    } = req.body;

    // Verify portfolio belongs to user
    const portfolio = await Portfolio.findOne({ where: { id: portfolioId, userId: req.user.id } });
    if (!portfolio) {
      await t.rollback();
      return errorResponse(res, 'Portfolio not found.', 404);
    }

    const investedAmount = (parseFloat(quantity) * parseFloat(buyPrice)).toFixed(2);

    const investment = await Investment.create(
      {
        portfolioId,
        userId: req.user.id,
        assetName,
        assetSymbol,
        assetType,
        quantity,
        buyPrice,
        currentPrice: buyPrice,
        investedAmount,
        currentValue: investedAmount,
        purchaseDate,
        maturityDate,
        notes,
        isin,
        exchange,
      },
      { transaction: t }
    );

    // Auto-create BUY transaction
    await Transaction.create(
      {
        userId: req.user.id,
        portfolioId,
        investmentId: investment.id,
        type: 'buy',
        amount: investedAmount,
        units: quantity,
        price: buyPrice,
        netAmount: investedAmount,
        transactionDate: purchaseDate,
        assetName,
        description: `Bought ${quantity} units of ${assetName}`,
      },
      { transaction: t }
    );

    // Update portfolio totals
    await portfolio.increment(
      { investedAmount: parseFloat(investedAmount), currentValue: parseFloat(investedAmount) },
      { transaction: t }
    );

    await t.commit();
    return successResponse(res, investment, 'Investment added.', 201);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// @GET /api/investments/:id
const getInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: Portfolio, as: 'portfolio', attributes: ['id', 'name'] },
        { model: Transaction, as: 'transactions', order: [['transactionDate', 'DESC']] },
      ],
    });

    if (!investment) return errorResponse(res, 'Investment not found.', 404);
    return successResponse(res, investment);
  } catch (err) {
    next(err);
  }
};

// @PUT /api/investments/:id  — Update current price
const updateInvestment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const investment = await Investment.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!investment) {
      await t.rollback();
      return errorResponse(res, 'Investment not found.', 404);
    }

    const { currentPrice, notes, status } = req.body;

    const oldValue = parseFloat(investment.currentValue) || 0;
    let newValue = oldValue;

    if (currentPrice !== undefined) {
      newValue = (parseFloat(currentPrice) * parseFloat(investment.quantity)).toFixed(2);
      await investment.update({ currentPrice, currentValue: newValue, notes, status }, { transaction: t });

      // Update portfolio current value
      const portfolio = await Portfolio.findByPk(investment.portfolioId);
      const diff = parseFloat(newValue) - oldValue;
      await portfolio.increment({ currentValue: diff }, { transaction: t });
    } else {
      await investment.update({ notes, status }, { transaction: t });
    }

    await t.commit();
    return successResponse(res, investment, 'Investment updated.');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// @DELETE /api/investments/:id  — Mark as sold
const sellInvestment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const investment = await Investment.findOne({
      where: { id: req.params.id, userId: req.user.id, status: 'active' },
    });
    if (!investment) {
      await t.rollback();
      return errorResponse(res, 'Active investment not found.', 404);
    }

    const { sellPrice, quantity: sellQty } = req.body;
    const soldQty = parseFloat(sellQty || investment.quantity);
    const saleAmount = (soldQty * parseFloat(sellPrice || investment.currentPrice)).toFixed(2);

    await investment.update({ status: 'sold' }, { transaction: t });

    await Transaction.create(
      {
        userId: req.user.id,
        portfolioId: investment.portfolioId,
        investmentId: investment.id,
        type: 'sell',
        amount: saleAmount,
        units: soldQty,
        price: sellPrice || investment.currentPrice,
        netAmount: saleAmount,
        transactionDate: new Date(),
        assetName: investment.assetName,
        description: `Sold ${soldQty} units of ${investment.assetName}`,
      },
      { transaction: t }
    );

    await t.commit();
    return successResponse(res, null, 'Investment sold and recorded.');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

module.exports = { getInvestments, createInvestment, getInvestment, updateInvestment, sellInvestment };
