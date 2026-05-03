const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'FinPro Wealth API',
    version: '1.0.0',
    description: 'API documentation for the FinPro Wealth backend.',
  },
  servers: [
    {
      url: process.env.SWAGGER_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: ['object', 'array', 'string', 'number', 'null'] },
          errors: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          panNumber: { type: 'string' },
          kycStatus: { type: 'string' },
          riskProfile: { type: 'string' },
          role: { type: 'string' },
          isActive: { type: 'boolean' },
          lastLogin: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TokenResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'number' },
        },
      },
      Portfolio: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          targetAmount: { type: 'number' },
          currency: { type: 'string' },
          isDefault: { type: 'boolean' },
          investedAmount: { type: 'number' },
          currentValue: { type: 'number' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Investment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          portfolioId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          assetName: { type: 'string' },
          assetSymbol: { type: 'string' },
          assetType: { type: 'string' },
          quantity: { type: 'number' },
          buyPrice: { type: 'number' },
          currentPrice: { type: 'number' },
          investedAmount: { type: 'number' },
          currentValue: { type: 'number' },
          status: { type: 'string' },
          purchaseDate: { type: 'string', format: 'date' },
          maturityDate: { type: 'string', format: 'date' },
          notes: { type: 'string' },
          isin: { type: 'string' },
          exchange: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          portfolioId: { type: 'string', format: 'uuid' },
          investmentId: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
          amount: { type: 'number' },
          units: { type: 'number' },
          price: { type: 'number' },
          fees: { type: 'number' },
          taxes: { type: 'number' },
          netAmount: { type: 'number' },
          transactionDate: { type: 'string', format: 'date-time' },
          assetName: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Goal: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          category: { type: 'string' },
          targetAmount: { type: 'number' },
          currentAmount: { type: 'number' },
          targetDate: { type: 'string', format: 'date' },
          monthlyContribution: { type: 'number' },
          expectedReturn: { type: 'number' },
          priority: { type: 'number' },
          status: { type: 'string' },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      DashboardResponse: {
        type: 'object',
        properties: {
          overview: {
            type: 'object',
            properties: {
              totalInvested: { type: 'string' },
              currentValue: { type: 'string' },
              profitLoss: { type: 'string' },
              returns: { type: 'string' },
              totalPortfolios: { type: 'number' },
              totalHoldings: { type: 'number' },
            },
          },
          allocation: {
            type: 'object',
            additionalProperties: { type: 'number' },
          },
          topPerformers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                assetName: { type: 'string' },
                assetType: { type: 'string' },
                returns: { type: 'number' },
                profitLoss: { type: 'number' },
                currentValue: { type: 'number' },
              },
            },
          },
          recentTransactions: {
            type: 'array',
            items: { $ref: '#/components/schemas/Transaction' },
          },
          goals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                category: { type: 'string' },
                progressPercent: { type: 'number' },
                targetAmount: { type: 'number' },
                currentAmount: { type: 'number' },
                status: { type: 'string' },
              },
            },
          },
          monthlyPerformance: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string' },
                invested: { type: 'number' },
                returned: { type: 'number' },
                dividends: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'password'],
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  phone: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        expiresIn: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/TokenResponse' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Refresh token accepted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/TokenResponse' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update authenticated user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date' },
                  panNumber: { type: 'string' },
                  riskProfile: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
        },
      },
    },
    '/api/users/change-password': {
      put: {
        tags: ['Users'],
        summary: 'Change account password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', format: 'password' },
                  newPassword: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Password changed successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/users/kyc': {
      put: {
        tags: ['Users'],
        summary: 'Submit KYC information',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['panNumber', 'dateOfBirth'],
                properties: {
                  panNumber: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'KYC submitted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'Users retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
        },
      },
    },
    '/api/users/{id}/kyc': {
      put: {
        tags: ['Users'],
        summary: 'Verify or reject user KYC (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['verified', 'rejected'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'KYC status updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/portfolios': {
      get: {
        tags: ['Portfolios'],
        summary: 'Get all portfolios for the current user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Portfolios retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
      post: {
        tags: ['Portfolios'],
        summary: 'Create a new portfolio',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  type: { type: 'string' },
                  targetAmount: { type: 'number' },
                  currency: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Portfolio created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/portfolios/{id}': {
      get: {
        tags: ['Portfolios'],
        summary: 'Get a portfolio by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Portfolio retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
      put: {
        tags: ['Portfolios'],
        summary: 'Update a portfolio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  type: { type: 'string' },
                  targetAmount: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Portfolio updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
      delete: {
        tags: ['Portfolios'],
        summary: 'Delete a portfolio',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Portfolio deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/portfolios/{id}/summary': {
      get: {
        tags: ['Portfolios'],
        summary: 'Get portfolio summary',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Portfolio summary retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/investments': {
      get: {
        tags: ['Investments'],
        summary: 'Get investments with optional filters',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'portfolioId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'assetType', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Investments retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
      post: {
        tags: ['Investments'],
        summary: 'Create a new investment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['portfolioId', 'assetName', 'assetType', 'quantity', 'buyPrice', 'purchaseDate'],
                properties: {
                  portfolioId: { type: 'string', format: 'uuid' },
                  assetName: { type: 'string' },
                  assetSymbol: { type: 'string' },
                  assetType: { type: 'string' },
                  quantity: { type: 'number' },
                  buyPrice: { type: 'number' },
                  purchaseDate: { type: 'string', format: 'date' },
                  maturityDate: { type: 'string', format: 'date' },
                  notes: { type: 'string' },
                  isin: { type: 'string' },
                  exchange: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Investment created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/investments/{id}': {
      get: {
        tags: ['Investments'],
        summary: 'Get investment by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Investment retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
      put: {
        tags: ['Investments'],
        summary: 'Update investment details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  currentPrice: { type: 'number' },
                  notes: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Investment updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/investments/{id}/sell': {
      post: {
        tags: ['Investments'],
        summary: 'Sell an investment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sellPrice: { type: 'number' },
                  quantity: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Investment sold successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/transactions/summary': {
      get: {
        tags: ['Transactions'],
        summary: 'Get transaction summary',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'Transaction summary retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List transactions with filters',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'portfolioId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Transactions retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Create a transaction record',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'amount', 'netAmount'],
                properties: {
                  portfolioId: { type: 'string', format: 'uuid' },
                  investmentId: { type: 'string', format: 'uuid' },
                  type: { type: 'string' },
                  amount: { type: 'number' },
                  units: { type: 'number' },
                  price: { type: 'number' },
                  fees: { type: 'number' },
                  taxes: { type: 'number' },
                  netAmount: { type: 'number' },
                  transactionDate: { type: 'string', format: 'date-time' },
                  description: { type: 'string' },
                  assetName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Transaction created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/transactions/{id}': {
      get: {
        tags: ['Transactions'],
        summary: 'Get transaction by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Transaction retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/goals': {
      get: {
        tags: ['Goals'],
        summary: 'Get all goals',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Goals retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
      post: {
        tags: ['Goals'],
        summary: 'Create a goal',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'targetAmount', 'targetDate'],
                properties: {
                  name: { type: 'string' },
                  category: { type: 'string' },
                  targetAmount: { type: 'number' },
                  targetDate: { type: 'string', format: 'date' },
                  monthlyContribution: { type: 'number' },
                  expectedReturn: { type: 'number' },
                  priority: { type: 'number' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Goal created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/goals/{id}': {
      get: {
        tags: ['Goals'],
        summary: 'Get a goal by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Goal retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
      put: {
        tags: ['Goals'],
        summary: 'Update a goal',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  category: { type: 'string' },
                  targetAmount: { type: 'number' },
                  currentAmount: { type: 'number' },
                  targetDate: { type: 'string', format: 'date' },
                  monthlyContribution: { type: 'number' },
                  expectedReturn: { type: 'number' },
                  priority: { type: 'number' },
                  status: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Goal updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
      delete: {
        tags: ['Goals'],
        summary: 'Delete a goal',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Goal deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard overview data',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard data retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: { 200: { description: 'Service is healthy', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, service: { type: 'string' }, timestamp: { type: 'string' }, environment: { type: 'string' } } } } } } },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

module.exports = swaggerJSDoc(options);
