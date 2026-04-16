const { Goal } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

// @GET /api/goals
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.findAll({
      where: { userId: req.user.id },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
    });
    return successResponse(res, goals, 'Goals retrieved.');
  } catch (err) {
    next(err);
  }
};

// @POST /api/goals
const createGoal = async (req, res, next) => {
  try {
    const { name, category, targetAmount, targetDate, monthlyContribution, expectedReturn, priority, notes } = req.body;

    const goal = await Goal.create({
      userId: req.user.id,
      name,
      category,
      targetAmount,
      targetDate,
      monthlyContribution,
      expectedReturn,
      priority,
      notes,
    });

    return successResponse(res, goal, 'Goal created.', 201);
  } catch (err) {
    next(err);
  }
};

// @GET /api/goals/:id
const getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return errorResponse(res, 'Goal not found.', 404);

    // Calculate projection
    const monthsLeft = Math.max(
      0,
      Math.round((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30))
    );
    const r = parseFloat(goal.expectedReturn) / 100 / 12;
    const n = monthsLeft;
    const pmt = parseFloat(goal.monthlyContribution);
    const pv = parseFloat(goal.currentAmount);

    // Future value: FV = PV*(1+r)^n + PMT * [((1+r)^n - 1)/r]
    let projectedValue = pv * Math.pow(1 + r, n);
    if (r > 0 && n > 0) {
      projectedValue += pmt * ((Math.pow(1 + r, n) - 1) / r);
    } else {
      projectedValue += pmt * n;
    }

    return successResponse(res, {
      goal,
      projection: {
        monthsLeft,
        projectedValue: projectedValue.toFixed(2),
        targetAmount: goal.targetAmount,
        onTrack: projectedValue >= parseFloat(goal.targetAmount),
        progressPercent: goal.progressPercent,
        remainingAmount: goal.remainingAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/goals/:id
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return errorResponse(res, 'Goal not found.', 404);

    const { name, category, targetAmount, currentAmount, targetDate, monthlyContribution, expectedReturn, priority, status, notes } = req.body;
    await goal.update({ name, category, targetAmount, currentAmount, targetDate, monthlyContribution, expectedReturn, priority, status, notes });

    return successResponse(res, goal, 'Goal updated.');
  } catch (err) {
    next(err);
  }
};

// @DELETE /api/goals/:id
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!goal) return errorResponse(res, 'Goal not found.', 404);

    await goal.destroy();
    return successResponse(res, null, 'Goal deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getGoals, createGoal, getGoal, updateGoal, deleteGoal };
