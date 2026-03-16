# SC-Innovative

Monorepo for a medical diagnosis system with:

- Frontend: Next.js + Bun + Prisma + Better Auth + shadcn/ui
- Backend: FastAPI scaffold for fuzzy and Bayesian diagnosis pipeline

## Current Status

### Phase 1.1 completed

- Project scaffold created with `frontend` and `backend` folders
- Frontend initialized with Next.js, TypeScript, Tailwind, ESLint, Bun
- shadcn/ui initialized and core UI components generated
- Backend scaffold created with routers, services, and requirements

### Phase 1.2 completed

- Prisma + PostgreSQL schema added for `User`, `Session`, `Diagnosis`
- Better Auth configured with Prisma adapter
- Auth API route added
- Route middleware protection added for dashboard routes
- Prisma migrated to v7 config-style setup

## Repository Structure

```text
SC-Innovative/
  backend/
    data/
    routers/
      diagnosis.py
      metrics.py
    services/
      bayesian_network.py
      data_loader.py
      evaluator.py
      fuzzy_engine.py
    generate_clusters.py
    main.py
    requirements.txt

  frontend/
    app/
    components/
    lib/
    prisma/
      migrations/
      schema.prisma
    middleware.ts
    package.json
    prisma.config.ts
```

## Prerequisites

- Bun (latest stable)
- Node.js 20+ (recommended)
- Python 3.11+ (recommended)
- PostgreSQL database URL (Neon or local PostgreSQL)

## Environment Variables

Create these files:

- `frontend/.env`
- `frontend/.env.local`

Required variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
BETTER_AUTH_SECRET="your-strong-secret"
```

## Frontend Setup

From repository root:

```bash
cd frontend
bun install
```

Run frontend dev server:

```bash
bun dev
```

## Prisma 7 Commands

Use Prisma from the `frontend` folder (single source of truth config):

```bash
cd frontend
bunx prisma generate
bunx prisma migrate dev --name init
bunx prisma studio
```

Optional Windows DNS workaround if network resolution fails:

```powershell
$env:NODE_OPTIONS="--dns-result-order=ipv4first"; bunx prisma migrate dev --name init
```

Note: Prisma also creates `_prisma_migrations` table automatically. This is expected and should not be modified manually.

## Backend Setup

From repository root:

```bash
cd backend
python -m venv .venv
```

Activate virtual environment on PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend (after `main.py` app wiring is added):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Implemented Auth and Routing Notes

- Better Auth server config: `frontend/lib/auth.ts`
- Better Auth client config: `frontend/lib/auth-client.ts`
- Next route handler for auth: `frontend/app/api/auth/[...all]/route.ts`
- Protected dashboard middleware: `frontend/middleware.ts`

## Next Phase Readiness Checklist

- Frontend dependencies installed with Bun
- Prisma client generation succeeds
- Prisma migration history present
- Database connectivity verified via Prisma Studio
- Backend virtual environment created and dependencies installed

## Quick Start (minimum commands)

Terminal 1 (frontend):

```bash
cd frontend
bun dev
```

Terminal 2 (Prisma checks from root):

```bash
cd frontend
bunx prisma generate
bunx prisma migrate dev --name init
```

Terminal 3 (backend, after app wiring in `main.py`):

```bash
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```