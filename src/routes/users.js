const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, updateKyc, getAllUsers, verifyKyc } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { body, validate } = require('../middleware/validate');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 chars'),
  validate,
], changePassword);
router.put('/kyc', updateKyc);

// Admin routes
router.get('/', authorize('admin'), getAllUsers);
router.put('/:id/kyc', authorize('admin'), verifyKyc);

module.exports = router;
