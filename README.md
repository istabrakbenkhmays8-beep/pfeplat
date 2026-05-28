# Advancia Training Platform

Multi-role online + on-site training platform for Advancia Training (Tunisia). See `CLAUDE.md` for the full brief.

## Quickstart

```bash
npm install
cp .env.example .env
docker compose up -d mongo        # start MongoDB
npm run dev                       # start the web app
```

Open http://localhost:3000. MongoDB lives on `mongodb://localhost:27017`.
Optional UI for the database: `docker compose up -d mongo-express` → http://localhost:8081 (user: `admin`, pass: `admin`).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check, no emit |

## Layout

```
app/                 Next.js App Router (route groups per actor)
  (public)/          home, catalog, course detail, contact, auth
  (user)/            learner space
  (admin)/           admin space
  (super-admin)/     super admin space
  api/               REST API (shared by web + mobile)
src/
  controllers/       thin request handlers
  services/          business rules
  repositories/      persistence (only layer touching Mongoose)
  models/            Mongoose schemas
  lib/               auth, rbac, zod, mailer, ai, pdf, xlsx, theme
  i18n/              en/fr/ar dictionaries
components/          React UI (server + client)
public/              images, icons
mobile/              Expo React Native app (Phase 12)
```

## Build phases

See `CLAUDE.md` §15. We're currently on **Phase 1 — Scaffold**.
