const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

// @GET /api/users/profile
const getProfile = async (req, res) => {
  return successResponse(res, req.user, 'Profile retrieved.');
};

// @PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, panNumber, riskProfile } = req.body;

    await req.user.update({ firstName, lastName, phone, dateOfBirth, panNumber, riskProfile });
    return successResponse(res, req.user, 'Profile updated.');
  } catch (err) {
    next(err);
  }
};

// @PUT /api/users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return errorResponse(res, 'Current password is incorrect.', 400);

    user.password = newPassword;
    await user.save();
    return successResponse(res, null, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

// @PUT /api/users/kyc  — Submit KYC
const updateKyc = async (req, res, next) => {
  try {
    const { panNumber, dateOfBirth } = req.body;

    await req.user.update({ panNumber, dateOfBirth, kycStatus: 'submitted' });
    return successResponse(res, req.user, 'KYC submitted successfully.');
  } catch (err) {
    next(err);
  }
};

// ── Admin only ──────────────────────────────────────────────────

// @GET /api/users  (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({ success: true, data: rows, total: count, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/users/:id/kyc  (admin — approve/reject)
const verifyKyc = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return errorResponse(res, 'Status must be verified or rejected.', 400);
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 'User not found.', 404);

    await user.update({ kycStatus: status });
    return successResponse(res, user, `KYC ${status}.`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword, updateKyc, getAllUsers, verifyKyc };
