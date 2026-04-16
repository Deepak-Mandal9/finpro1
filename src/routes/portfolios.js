const express = require('express');
const router = express.Router();
const {
  getPortfolios, createPortfolio, getPortfolio,
  updatePortfolio, deletePortfolio, getPortfolioSummary,
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');
const { portfolioRules, uuidParam, validate } = require('../middleware/validate');

router.use(protect);

router.get('/', getPortfolios);
router.post('/', portfolioRules, validate, createPortfolio);
router.get('/:id', uuidParam(), validate, getPortfolio);
router.put('/:id', [...uuidParam(), ...portfolioRules], validate, updatePortfolio);
router.delete('/:id', uuidParam(), validate, deletePortfolio);
router.get('/:id/summary', uuidParam(), validate, getPortfolioSummary);

module.exports = router;
