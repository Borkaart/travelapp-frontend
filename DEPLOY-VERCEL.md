# Deploy Frontend on Vercel

## What works on Vercel

- this React + Vite frontend

## What does not fit well on Vercel here

- the current Spring Boot backend

The current backend is a long-running Java API with Spring Boot, JPA and PostgreSQL.
Vercel is optimized for frontend hosting and serverless functions, not for deploying a full Spring Boot application as-is.

Official references:

- Vercel framework support: https://vercel.com/docs/frameworks/frontend/vite
- Vercel functions overview: https://vercel.com/docs/functions

## Frontend setup

Create `.env.production`:

```env
VITE_API_URL=https://api.travelapp.your-domain.com/api
```

## Vercel project settings

Use:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## SPA routing

`vercel.json` is already configured so routes like:

- `/login`
- `/trips`
- `/trips/summary`

keep working after refresh.

## Recommended architecture

- Frontend: Vercel
- Backend: Railway / Render / Fly.io
- Database: managed PostgreSQL

## Production flow

1. Deploy backend first
2. Expose backend at something like `https://api.travelapp.your-domain.com`
3. Set `VITE_API_URL=https://api.travelapp.your-domain.com/api`
4. Deploy frontend on Vercel
