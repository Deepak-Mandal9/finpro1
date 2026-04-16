const { User } = require('../models');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

// @POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, dateOfBirth } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return errorResponse(res, 'Email already registered.', 409);
    }

    const user = await User.create({ firstName, lastName, email, password, phone, dateOfBirth });

    const tokens = generateTokenPair(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return successResponse(
      res,
      { user, ...tokens },
      'Registration successful.',
      201
    );
  } catch (err) {
    next(err);
  }
};

// @POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid credentials.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials.', 401);
    }

    const tokens = generateTokenPair(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return successResponse(res, { user, ...tokens }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

// @POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token required.', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token.', 401);
    }

    const tokens = generateTokenPair(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return successResponse(res, tokens, 'Token refreshed.');
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Refresh token expired. Please login again.', 401);
    }
    next(err);
  }
};

// @POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    return successResponse(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  return successResponse(res, req.user, 'User retrieved.');
};

module.exports = { register, login, refreshToken, logout, getMe };
