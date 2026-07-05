import 'express-async-errors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import playbookRoutes from './routes/playbookRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const uploadRoot = process.env.UPLOAD_ROOT || 'uploads';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 800 }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use(`/${uploadRoot}`, express.static(path.join(process.cwd(), uploadRoot)));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/playbooks', playbookRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/backup', backupRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
