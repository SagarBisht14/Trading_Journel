import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/db.js';

dotenv.config();

const port = Number(process.env.PORT || 8080);
const host = '0.0.0.0';

connectDatabase()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`API server running on http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
