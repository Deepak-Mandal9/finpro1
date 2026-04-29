const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');

jest.setTimeout(20000);

const userPayload = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Password1',
  dateOfBirth: '1990-01-01',
};

describe('Auth API', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns tokens', async () => {
      const response = await request(app).post('/api/auth/register').send(userPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(userPayload.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('refreshToken');
    });

    it('returns 409 when email is already registered', async () => {
      await request(app).post('/api/auth/register').send(userPayload);
      const duplicateResponse = await request(app).post('/api/auth/register').send(userPayload);

      expect(duplicateResponse.status).toBe(409);
      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.message).toMatch(/Email already registered/);
    });

    it('returns 400 for invalid registration payload', async () => {
      const response = await request(app).post('/api/auth/register').send({
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        password: 'weak',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create(userPayload);
    });

    it('logs in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userPayload.email, password: userPayload.password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(userPayload.email);
    });

    it('returns 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userPayload.email, password: 'WrongPassword1' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Invalid credentials/);
    });

    it('returns 400 for missing login fields', async () => {
      const response = await request(app).post('/api/auth/login').send({ email: 'bad-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('refreshes tokens with a valid refresh token', async () => {
      const registerResponse = await request(app).post('/api/auth/register').send(userPayload);
      const refreshToken = registerResponse.body.data.refreshToken;

      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data).toHaveProperty('accessToken');
      expect(refreshResponse.body.data).toHaveProperty('refreshToken');
      expect(typeof refreshResponse.body.data.refreshToken).toBe('string');
    });

    it('returns 401 for an invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.value' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/Invalid refresh token|Refresh token expired|Invalid token/);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('logs out an authenticated user and clears refresh token', async () => {
      const registerResponse = await request(app).post('/api/auth/register').send(userPayload);
      const accessToken = registerResponse.body.data.accessToken;
      const refreshToken = registerResponse.body.data.refreshToken;

      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
      expect(logoutResponse.body.message).toMatch(/Logged out successfully/);

      const user = await User.findOne({ where: { email: userPayload.email } });
      expect(user.refreshToken).toBeNull();

      const refreshResponse = await request(app).post('/api/auth/refresh').send({ refreshToken });
      expect(refreshResponse.status).toBe(401);
    });

    it('returns 401 when logout request is unauthenticated', async () => {
      const response = await request(app).post('/api/auth/logout').send();

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/No token provided|Invalid token/);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns authenticated user details', async () => {
      const registerResponse = await request(app).post('/api/auth/register').send(userPayload);
      const accessToken = registerResponse.body.data.accessToken;

      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.success).toBe(true);
      expect(meResponse.body.data.email).toBe(userPayload.email);
      expect(meResponse.body.data).not.toHaveProperty('password');
      expect(meResponse.body.data).not.toHaveProperty('refreshToken');
    });

    it('returns 401 without an access token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
