const express = require('express');
const router = express.Router();
const { getGoals, createGoal, getGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const { goalRules, uuidParam, validate } = require('../middleware/validate');

router.use(protect);

router.get('/', getGoals);
router.post('/', goalRules, validate, createGoal);
router.get('/:id', uuidParam(), validate, getGoal);
router.put('/:id', uuidParam(), validate, updateGoal);
router.delete('/:id', uuidParam(), validate, deleteGoal);

module.exports = router;
