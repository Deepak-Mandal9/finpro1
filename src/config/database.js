const { Sequelize } = require('sequelize');
const { promises: dns } = require('dns');
require('dotenv').config();
require('pg');
require('pg-hstore');

const sequelizeOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

if (process.env.DATABASE_URL || process.env.NODE_ENV === 'production') {
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

const getDatabaseHost = () => {
  if (process.env.DATABASE_URL) {
    try {
      return new URL(process.env.DATABASE_URL).hostname;
    } catch (error) {
      console.error('❌ Invalid DATABASE_URL format:', error.message);
      return process.env.DB_HOST;
    }
  }
  return process.env.DB_HOST;
};

const resolveDatabaseHost = async () => {
  const host = getDatabaseHost();
  if (!host) {
    throw new Error('DB host is not configured');
  }

  try {
    const addresses = await dns.lookup(host, { all: true });
    console.log('🔍 DB host DNS lookup', { host, addresses });
    return addresses;
  } catch (error) {
    console.error('🔍 DB host DNS lookup failed:', error.message);
    throw error;
  }
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, sequelizeOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      sequelizeOptions
    );

const connectDB = async () => {
  try {
    await resolveDatabaseHost();
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
