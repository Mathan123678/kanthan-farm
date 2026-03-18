## Kanthan Farm Management App

A mobile-first farm management application for a rooster farm, built with:

- **Frontend**: React + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Charts**: Chart.js

### Features

- Bird management (add, edit, list, details, match readiness, weight progress)
- Bird sales and per-bird profit calculation
- Farm-wide expenses and profit/loss
- Health records, matches, and performance stats
- Buyers and state-wise sales
- Inventory analytics and alerts
- Mobile-first, farm-themed UI

### Project Structure

- `backend/` – Node.js + Express API and PostgreSQL integration
- `frontend/` – React + TailwindCSS single-page app

### Getting Started

1. **Backend**
   - Go to `backend/`
   - Copy `.env.example` to `.env` and set `DATABASE_URL`
   - Install dependencies:
     - `npm install`
   - Run database migrations (see `backend/db/schema.sql`)
   - Start the dev server:
     - `npm run dev`

2. **Frontend**
   - Go to `frontend/`
   - Install dependencies:
     - `npm install`
   - Start the dev server:
     - `npm run dev`

### Database

See `backend/db/schema.sql` for the PostgreSQL schema covering:

- `birds`
- `sales`
- `expenses`
- `health_records`
- `matches`
- `buyers`

