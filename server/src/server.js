import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/db.js';

dotenv.config();

const port = Number(process.env.PORT || 8080);
const host = '0.0.0.0';

function validateServerEnv() {
  const missing = ['JWT_SECRET', 'MONGODB_URI'].filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}

async function startServer() {
  try {
    validateServerEnv();
    await connectDatabase();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }

  app.listen(port, host, () => {
    console.log(`API server running on http://${host}:${port}`);
  });
}

startServer();
