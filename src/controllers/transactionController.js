const { Transaction, Portfolio, Investment } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { Op } = require('sequelize');

// @GET /api/transactions
const getTransactions = async (req, res, next) => {
  try {
    const { portfolioId, type, status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (portfolioId) where.portfolioId = portfolioId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate[Op.gte] = new Date(startDate);
      if (endDate) where.transactionDate[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: Portfolio, as: 'portfolio', attributes: ['id', 'name'] },
        { model: Investment, as: 'investment', attributes: ['id', 'assetName', 'assetType'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['transactionDate', 'DESC']],
    });

    return paginatedResponse(res, rows, count, page, limit, 'Transactions retrieved.');
  } catch (err) {
    next(err);
  }
};

// @POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const {
      portfolioId, investmentId, type, amount, units,
      price, fees = 0, taxes = 0, transactionDate, description, assetName,
    } = req.body;

    if (portfolioId) {
      const portfolio = await Portfolio.findOne({ where: { id: portfolioId, userId: req.user.id } });
      if (!portfolio) return errorResponse(res, 'Portfolio not found.', 404);
    }

    const netAmount = (parseFloat(amount) - parseFloat(fees) - parseFloat(taxes)).toFixed(2);

    const transaction = await Transaction.create({
      userId: req.user.id,
      portfolioId,
      investmentId,
      type,
      amount,
      units,
      price,
      fees,
      taxes,
      netAmount,
      transactionDate: transactionDate || new Date(),
      description,
      assetName,
    });

    return successResponse(res, transaction, 'Transaction recorded.', 201);
  } catch (err) {
    next(err);
  }
};

// @GET /api/transactions/:id
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: Portfolio, as: 'portfolio', attributes: ['id', 'name'] },
        { model: Investment, as: 'investment', attributes: ['id', 'assetName', 'assetType'] },
      ],
    });

    if (!transaction) return errorResponse(res, 'Transaction not found.', 404);
    return successResponse(res, transaction);
  } catch (err) {
    next(err);
  }
};

// @GET /api/transactions/summary
const getTransactionSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { userId: req.user.id };

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate[Op.gte] = new Date(startDate);
      if (endDate) where.transactionDate[Op.lte] = new Date(endDate);
    }

    const transactions = await Transaction.findAll({ where });

    const summary = transactions.reduce(
      (acc, txn) => {
        const amt = parseFloat(txn.amount);
        acc.totalTransactions++;
        acc.totalFees += parseFloat(txn.fees || 0);
        acc.totalTaxes += parseFloat(txn.taxes || 0);
        if (txn.type === 'buy' || txn.type === 'deposit' || txn.type === 'sip') acc.totalInvested += amt;
        if (txn.type === 'sell' || txn.type === 'withdrawal') acc.totalReturned += amt;
        if (txn.type === 'dividend') acc.totalDividends += amt;
        acc.byType[txn.type] = (acc.byType[txn.type] || 0) + amt;
        return acc;
      },
      { totalTransactions: 0, totalInvested: 0, totalReturned: 0, totalDividends: 0, totalFees: 0, totalTaxes: 0, byType: {} }
    );

    return successResponse(res, summary, 'Transaction summary retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions, createTransaction, getTransaction, getTransactionSummary };
