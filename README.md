# TradePilot Journal

A production-ready full-stack trading journal inspired by the workflows of professional trade review tools, with an original dark UI, full CRUD journaling, screenshot uploads, analytics, calendar heatmaps, playbooks, goals, notes, backup, and JWT authentication.

## Tech Stack

- React + Vite
- Tailwind CSS
- React Router
- React Hook Form
- Chart.js
- Framer Motion
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer + Sharp image compression

## Project Structure

```text
client/                 React Vite frontend
  public/               PWA manifest, service worker, hero image, logo
  src/
    components/         Reusable UI, charts, upload, forms
    context/            JWT auth context
    hooks/              Shared resource fetching hook
    layouts/            Authenticated app shell
    pages/              Home, dashboard, trades, stats, journal, etc.
    services/           Axios API client
    utils/              Formatting and trade options
server/                 Express API
  src/
    controllers/        Auth, trades, analytics, backup, CRUD controllers
    middleware/         Auth, upload, error handling
    models/             User, Trade, Journal, Watchlist, Goal, Playbook, Note
    routes/             REST API routes
    utils/              Analytics and parsing helpers
  uploads/              Runtime image storage
```

## Installation

```bash
npm install
```

## Environment Variables

Create `server/.env`:

```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/trading_journal
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
UPLOAD_ROOT=uploads
ADMIN_SETUP_SECRET=replace_with_a_private_admin_creation_secret
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:8080
```

## MongoDB Setup

Local MongoDB:

```bash
brew services start mongodb-community
```

Or run MongoDB with Docker:

```bash
docker run --name trading-journal-mongo -p 27017:27017 -d mongo:7
```

MongoDB Atlas also works. Replace `MONGODB_URI` with your Atlas connection string.

## Run Locally

Run both apps from the root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:server
npm run dev:client
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:8080/api/health`

## Core API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/trades`
- `POST /api/trades`
- `PUT /api/trades/:id`
- `DELETE /api/trades/:id`
- `POST /api/trades/:id/duplicate`
- `GET /api/analytics/summary`
- `GET /api/analytics/insights`
- `GET /api/backup/export/json`
- `POST /api/backup/import/json`
- `GET /api/admin/overview` admin only
- `GET /api/admin/users` admin only
- `GET /api/admin/users/:userId/data` admin only

## Admin Account

Set `ADMIN_SETUP_SECRET` in `server/.env`. On the register page, enter that secret in the optional **Admin Setup Secret** field to create an admin account.

Admin accounts can open `/app/admin` and view:

- all registered clients
- each client profile summary
- each client trades, journals, watchlist, goals, playbooks, and notes
- each client analytics summary

Normal client accounts cannot access `/api/admin/*` routes.

## Production Deployment

This repo is configured for a split deployment:

- Backend API on Render from `server/`
- Frontend static app on Vercel from `client/`
- MongoDB Atlas for production data

### Render Backend

You can deploy with the included `render.yaml` blueprint, or create a Render Web Service manually with these settings:

- Root directory: `server`
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Required Render environment variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=generate_or_add_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
UPLOAD_ROOT=uploads
ADMIN_SETUP_SECRET=choose_a_private_admin_creation_secret
```

After the first Vercel deploy, update `CLIENT_URL`, `FRONTEND_URL`, and `ALLOWED_ORIGINS` in Render if your Vercel URL is different from the placeholder in `render.yaml`.

Render disks are recommended if you want uploaded screenshots to persist on Render. For high-scale production, move uploads to S3 or Cloudinary.

### Vercel Frontend

The root `vercel.json` is set up to build the client from the monorepo root:

- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build --workspace client`
- Output directory: `client/dist`

The included Vercel rewrites proxy `/api/*` and `/uploads/*` to the Render backend. If your Render URL is different from `https://trading-journel.onrender.com`, update it in `vercel.json`.

You can leave `VITE_API_URL` unset on Vercel when using those rewrites. If you prefer direct browser-to-Render API calls, set:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

## Notes

- Passwords are hashed with bcrypt.
- JWTs are accepted via `Authorization: Bearer <token>` and also set as an HTTP-only cookie.
- Trade screenshots are compressed to WebP on upload.
- Deleted trades are soft-deleted and can be restored through the undo flow.
- The frontend includes a production service worker for offline shell caching.
