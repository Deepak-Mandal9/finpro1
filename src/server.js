require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const { sequelize } = require('./config/database');

// Import models so Sequelize knows about them before sync
require('./models/index');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Sync models (alter: true updates existing tables safely in dev)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📦 Database synced (development mode)');
    } else {
      // In production use migrations instead of sync
      await sequelize.sync();
      console.log('📦 Database synced');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 FinPro API running on port ${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   API Base    : http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();
