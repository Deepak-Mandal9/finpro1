const express = require('express');
const router = express.Router();
const {
  getTransactions, createTransaction, getTransaction, getTransactionSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const { transactionRules, uuidParam, paginationRules, validate } = require('../middleware/validate');

router.use(protect);

router.get('/summary', getTransactionSummary);
router.get('/', paginationRules, validate, getTransactions);
router.post('/', transactionRules, validate, createTransaction);
router.get('/:id', uuidParam(), validate, getTransaction);

module.exports = router;
