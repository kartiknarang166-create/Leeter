# 🏆 Leeter — College LeetCode Leaderboard

Track and compete with your college peers on LeetCode. Real rankings, daily syncs, badges, and bragging rights.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Express.js + Node.js |
| Database | Supabase (Postgres) |
| Auth | JWT + bcrypt (username/password, no OAuth) |
| Cron | node-cron (12 PM IST daily sync) |

## Project Structure

```
leeter/
├── frontend/      ← React Vite app
├── backend/       ← Express API
└── supabase_schema.sql  ← Run in Supabase SQL Editor
```

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase_schema.sql`
3. Note your **Project URL** and **Service Role Key** (Settings → API)

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:3001`  
The Vite proxy forwards `/api/*` to the backend automatically.

## Features

- 🏫 College selector landing page
- 📊 Leaderboard with sorting (Total / Hard / Streak / Global Rank)
- 🔗 Link your LeetCode account (one per user, validated live)
- 🔐 JWT auth — username + password, no OAuth
- 🔥 Streak tracking + badges
- 🆚 Head-to-head compare mode
- 👑 College champion crown
- ⚡ Daily challenge banner
- 🌙 Dark/light mode
- 🕛 Daily sync at 12 PM IST

## Environment Variables

### Backend `.env`
```
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-here
```

## Adding More Colleges

Edit `supabase_schema.sql` to add more colleges and re-run the INSERT block, or insert directly via Supabase Table Editor.
