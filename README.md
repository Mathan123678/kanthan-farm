# Kanthan Farm Management App

A mobile-first farm management application for a rooster farm.

- **Frontend**: React + TailwindCSS → deployed on **Vercel**
- **Backend**: Node.js + Express → deployed on **Render**
- **Database**: PostgreSQL → hosted on **Neon**

## Live URLs
- Frontend: https://kanthan-farm.vercel.app (update after deploy)
- Backend API: https://kanthan-farm-api.onrender.com (update after deploy)

## Local Development

### Backend
```bash
cd backend
npm install
# Set DATABASE_URL in .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Set VITE_API_URL in .env
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=your_neon_postgresql_url
PORT=4000
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

## Database Setup
Run `backend/db/schema.sql` against your PostgreSQL database to create all tables.
