# Deploy Frontend

## Production URL

- `https://travelapp.x10.network`

## Build

Create `.env.production`:

```env
VITE_API_URL=https://api.travelapp.x10.network/api
```

Build:

```bash
npm install
npm run build
```

## Publish on x10Hosting

Upload the contents of `dist/` to the public directory for `travelapp.x10.network`.

Important:

- upload everything inside `dist/`, not the `dist` folder itself
- keep the generated `.htaccess` file so deep links like `/trips/summary` keep working

## DNS

- `travelapp.x10.network` -> x10Hosting
- `api.travelapp.x10.network` -> backend host

## Vercel Alternative

This frontend is also ready for Vercel.

Create `.env.production`:

```env
VITE_API_URL=https://api.travelapp.your-domain.com/api
```

Then import the repository in Vercel with:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

The file `vercel.json` is already configured to rewrite all SPA routes to `index.html`.
