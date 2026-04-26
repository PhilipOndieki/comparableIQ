# ComparableIQ — Setup Guide

## Prerequisites

- Node.js 20 LTS
- PostgreSQL 16 + PostGIS 3.4 extension
- Redis 7 (local or Upstash)
- Google OAuth 2.0 credentials

---

## Backend Setup

```bash
cd comparableiq-api

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data (20 comparables around Kenya)
npm run db:seed

# Start dev server
npm run dev
```

### Required .env values

```
DATABASE_URL=postgresql://user:pass@localhost:5432/comparableiq
REDIS_URL=redis://localhost:6379
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
JWT_ACCESS_SECRET=min-32-chars-random-string
JWT_REFRESH_SECRET=min-32-chars-random-string
FRONTEND_URL=http://localhost:5173
```

### PostGIS setup

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## Frontend Setup

```bash
cd comparableiq-web

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit with your Google Client ID

# Start dev server
npm run dev
```

### Required .env.local values

```
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized redirect URIs:
   - Development: `http://localhost:3001/api/v1/auth/google/callback`
   - Production: `https://yourdomain.com/api/v1/auth/google/callback`
6. Add authorized JavaScript origins:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

---

## Making Yourself Admin

After first sign-in with Google, run this in psql:

```sql
UPDATE users SET role = 'ADMIN', has_map_access = true WHERE email = 'your@email.com';
```

---

## Deployment on Railway

### Backend
1. Create new Railway project
2. Add PostgreSQL and Redis services
3. Deploy from `comparableiq-api/` directory
4. Set all environment variables
5. Run `npm run db:migrate` in Railway shell

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` to Railway Static or Vercel
3. Set `VITE_API_URL` to your Railway backend URL

---

## CSV Bulk Upload Format

Headers: `parcel_number,lat,lng,area_ha,sale_price,sale_date,locality,county,notes`

Example:
```
parcel_number,lat,lng,area_ha,sale_price,sale_date,locality,county,notes
Kiambu/Ruiru/1001,-1.1472,36.9609,0.5,4500000,2024-08-15,Ruiru,Kiambu,
```

- `sale_price` and `notes` are optional
- `sale_date` format: YYYY-MM-DD
- Coordinates: decimal degrees (WGS84)
