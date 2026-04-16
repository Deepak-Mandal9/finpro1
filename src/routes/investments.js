const express = require('express');
const router = express.Router();
const {
  getInvestments, createInvestment, getInvestment,
  updateInvestment, sellInvestment,
} = require('../controllers/investmentController');
const { protect } = require('../middleware/auth');
const { investmentRules, uuidParam, paginationRules, validate } = require('../middleware/validate');

router.use(protect);

router.get('/', paginationRules, validate, getInvestments);
router.post('/', investmentRules, validate, createInvestment);
router.get('/:id', uuidParam(), validate, getInvestment);
router.put('/:id', uuidParam(), validate, updateInvestment);
router.post('/:id/sell', uuidParam(), validate, sellInvestment);

module.exports = router;
