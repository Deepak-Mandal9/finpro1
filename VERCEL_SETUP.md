# Vercel Deployment Guide

This guide explains how to deploy the FinPro Backend to Vercel.

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed
- PostgreSQL database hosted (e.g., AWS RDS, Supabase, Railway, Neon)
- Node.js 18+ or 20+

## Step 1: Prepare Environment Variables

Before deploying, set up all required environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Example | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | Must be `production` |
| `DB_HOST` | `db.example.com` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `finpro_db` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `secure_password` | Database password (keep secret) |
| `JWT_SECRET` | `random_secret_key_here` | Generate a secure random string |
| `JWT_REFRESH_SECRET` | `random_refresh_secret` | Generate a secure random string |
| `JWT_EXPIRES_IN` | `7d` | Access token expiration |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token expiration |
| `FRONTEND_URL` | `https://finpro.lovable.app` | Your frontend URL (CORS) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

## Step 2: Deploy with Vercel CLI

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel --prod

# Follow the prompts to link/create a Vercel project
```

### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click **Add New** → **Project**
4. Select your GitHub repository
5. Import the project
6. Add environment variables in the **Environment Variables** section
7. Click **Deploy**

### Option C: Using Vercel Web Dashboard

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** → **Project**
3. Import a Git repository or upload folder
4. Configure environment variables
5. Click **Deploy**

## Step 3: Verify Deployment

After deployment, verify the API is working:

```bash
# Check health endpoint
curl https://your-project.vercel.app/health

# Response should be:
# {
#   "status": "ok",
#   "service": "FinPro API",
#   "timestamp": "2026-04-29T...",
#   "environment": "production"
# }
```

## Step 4: Test API Endpoints

```bash
# Register a user
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Password1",
    "dateOfBirth": "1990-01-01"
  }'

# Login
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password1"
  }'
```

## Configuration Files

### `vercel.json`
- **builds**: Specifies Node.js as the runtime
- **routes**: Routes all requests to `src/server.js`
- **env**: Sets `NODE_ENV=production`
- **maxDuration**: Sets function timeout to 30 seconds

### `.vercelignore`
- Excludes unnecessary files (node_modules, tests, logs, etc.)
- Reduces build time and deployment size

## Important Notes

### Database Connection
- Ensure your PostgreSQL database is accessible from Vercel's IP addresses
- Consider using a service like Supabase or Neon for managed PostgreSQL
- Update firewall/security group to allow Vercel's IPs

### Secrets Management
- **Never** commit `.env` file to repository
- **Never** hardcode secrets in code
- Always use Vercel's Environment Variables for sensitive data

### SSL/TLS
- Vercel automatically provides SSL certificates
- All traffic is encrypted by default

### Logging
- Monitor logs in Vercel dashboard: **Deployments** → **Logs**
- Set `NODE_ENV=production` to reduce log verbosity

### Rate Limiting
- Currently set to 100 requests per 15 minutes globally
- Adjust `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` as needed

## Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies are in package.json
npm install
vercel --prod --debug
```

### Database Connection Error
- Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- Check database firewall allows Vercel IP ranges
- Test connection locally first

### Environment Variables Not Loading
- Redeploy after adding env vars: `vercel --prod`
- Verify variables are set in Vercel dashboard

### CORS Issues
- Update `FRONTEND_URL` in environment variables
- Verify frontend is making requests to correct API URL

## Useful Commands

```bash
# List all deployments
vercel ls

# View deployment details
vercel inspect <deployment-url>

# Rollback to previous deployment
vercel rollback

# Check environment variables
vercel env ls

# Add environment variable
vercel env add <KEY> <value>
```

## Next Steps

1. Set up monitoring and alerting
2. Configure custom domain (if needed)
3. Set up database backups
4. Implement API documentation (Swagger/OpenAPI)
5. Add request logging and analytics

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Node.js on Vercel](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
