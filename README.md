# Fuzzy-Bayesian Medical Diagnosis System

Probabilistic Graphical Models integrating Fuzzy Set Theory with Bayesian Inference to handle epistemic uncertainty and vagueness in medical expert systems.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?logo=fastapi&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-Package_Manager-F9F1E1?logo=bun&logoColor=black)
![License](https://img.shields.io/badge/License-Academic-blue)

## Table of Contents

- [About the Project](#about-the-project)
- [The 5-Step Pipeline](#the-5-step-pipeline)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Dataset](#dataset)
- [Academic Note](#academic-note)
- [Disclaimer](#disclaimer)

## About the Project

This is a full-stack Soft Computing assignment project where users select symptoms from a list of 131 symptoms and receive a ranked probability list over 41 diseases.

The system executes a 5-step fuzzy-bayesian inference pipeline and returns:

- Probabilistic disease ranking
- Disease descriptions
- Recommended precautions
- Fuzzy and Bayesian interpretability panels

The goal is decision support under uncertainty, not clinical replacement.

## The 5-Step Pipeline

### Numbered Flow

1. **Fuzzification**: Converts symptom severity weight (1-7) into LOW/MEDIUM/HIGH membership degrees using triangular membership functions with Partition of Unity.
2. **Weighted Severity Score**: Collapses memberships into one soft score (0.2-0.9) using weighted mapping.
3. **Conditional Probability**: Uses Laplace-smoothed probability from training data:
   
   $$P(S|D)=\frac{count+1}{98}$$
   
   with continuous rule strength:
   
   $$rule\_strength(p)=p$$
4. **Evidence Score**: Integrates fuzzy and Bayesian terms:
   
   $$evidence(S,D)=input\_centroid(S)\times P_{laplace}(S|D)$$
5. **Bayesian Log-Sum**: Aggregates multi-symptom evidence per disease:
   
   $$log\_ll(D)=\sum\log(evidence(S,D)+\epsilon)$$
   
   then normalizes with max-subtraction + exp for numerical stability.

### Pipeline Diagram

```text
Selected Symptoms
  |
  v
[Step 1] Fuzzification (LOW/MEDIUM/HIGH)
  |
  v
[Step 2] Input Centroid (0.2-0.9)
  |
  v
[Step 3] Laplace P(S|D)
  |
  v
[Step 4] Evidence(S,D) = centroid * P(S|D)
  |
  v
[Step 5] Log-Sum Bayesian Inference + Normalization
  |
  v
Ranked Diseases (Top 5 + Full 41)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| Graph Visualization | @xyflow/react (React Flow) |
| Package Manager | Bun |
| Backend | Python FastAPI (port 8000) |
| Fuzzy + Bayesian Logic | Pure Python only |
| Database | PostgreSQL (Neon Cloud) |
| ORM | Prisma |
| Authentication | Better Auth (email + password) |

## Project Structure

```text
SC-Innovative/
├── frontend/
│   ├── app/(auth)/login/page.tsx
│   ├── app/(auth)/signup/page.tsx
│   ├── app/api/auth/[...all]/route.ts
│   ├── app/api/diagnose/route.ts
│   ├── app/dashboard/page.tsx
│   ├── app/dashboard/history/page.tsx
│   ├── app/dashboard/metrics/page.tsx
│   ├── components/symptom-selector.tsx
│   ├── components/fuzzy-panel.tsx
│   ├── components/bayesian-graph.tsx
│   ├── components/results-panel.tsx
│   ├── components/disease-detail.tsx
│   ├── components/metrics-dashboard.tsx
│   ├── lib/auth.ts
│   ├── lib/auth-client.ts
│   ├── lib/prisma.ts
│   ├── prisma/schema.prisma
│   ├── .env
│   └── .env.local
└── backend/
    ├── main.py
    ├── generate_clusters.py
    ├── routers/diagnosis.py
    ├── routers/metrics.py
    ├── services/data_loader.py
    ├── services/fuzzy_engine.py
    ├── services/bayesian_network.py
    ├── services/evaluator.py
    ├── data/
    └── requirements.txt
```

## Prerequisites

Install the following before setup:

- Node.js v20+
- Bun
- Python 3.10+
- Git
- A free Neon account at neon.tech
- GitHub Copilot in VS Code

Exact Bun install command:

```bash
curl -fsSL https://bun.sh/install | bash
```

## Setup and Installation

Follow this order exactly.

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd SC-Innovative
```

2. **Install Node.js, Bun, and Python**

- Ensure Node.js v20+ and Python 3.10+ are available in PATH.
- Install Bun with:

```bash
curl -fsSL https://bun.sh/install | bash
```

3. **Create Neon database**

- Create a Neon project and a database named `medical_diagnosis`.
- Copy the PostgreSQL connection string.

4. **Create the three environment files**

- `frontend/.env`
- `frontend/.env.local`
- `backend/.env`

Use the exact keys shown in [Environment Variables](#environment-variables).

5. **Install frontend dependencies**

```bash
cd frontend
bun install
```

6. **Run Prisma migration**

```bash
bunx prisma migrate dev --name init
bunx prisma generate
```

7. **Install Python dependencies**

```bash
cd ../backend
python -m venv .venv
```

PowerShell activation:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install requirements:

```bash
pip install -r requirements.txt
```

8. **Copy dataset files to backend/data/**

Place all required CSV files listed in the [Dataset](#dataset) section.

9. **Run cluster generation script**

```bash
python generate_clusters.py
```

This generates `cluster_config.json` used by backend clustering logic.

10. **Start both servers**

See [Running the Project](#running-the-project).

## Environment Variables

Do not commit these files.

### frontend/.env (Prisma CLI reads this)

```env
DATABASE_URL="postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/medical_diagnosis?sslmode=require"
```

### frontend/.env.local (Next.js runtime reads this)

```env
DATABASE_URL="postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/medical_diagnosis?sslmode=require"
BETTER_AUTH_SECRET="any-random-string-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
```

### backend/.env (FastAPI reads this)

```env
FRONTEND_URL="http://localhost:3000"
```

## Running the Project

Use two terminals in every session.

### Terminal 1: Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd frontend
bun dev
```

### Local URLs

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Health check |
| GET | /api/symptoms | Returns all 131 symptom names |
| POST | /api/diagnose | Input: `{ "symptoms": string[] }`; returns diagnosis results |
| GET | /api/metrics | Returns accuracy evaluation results |

## Database Schema

Three core models are used.

| Model | Fields |
|---|---|
| User | `id`, `name`, `email`, `createdAt` |
| Session | `id`, `userId`, `token`, `expiresAt` |
| Diagnosis | `id`, `userId`, `symptoms` (array), `topDisease`, `topProbability`, `fullResults` (JSON), `createdAt` |

## Features

- 131 searchable symptoms with severity weighting
- Fuzzy membership visualization per symptom (LOW/MEDIUM/HIGH progress bars with Partition of Unity check)
- 8 syndrome cluster activation chart
- Fuzzy-Bayesian evidence scores table
- Interactive 3-layer Bayesian Network graph (React Flow), where edge thickness represents `P(cluster|disease)`
- Top 5 disease results with probability bars and confidence badges
- Disease detail panel with descriptions and precautions
- Diagnosis history per user
- Accuracy metrics dashboard: Top-1%, Top-5%, F1 score, Fuzzy vs Binary comparison, confusion matrix

## Dataset

Place these files inside `backend/data/`.

| File | Details |
|---|---|
| dataset.csv | 4920 rows, 41 diseases, 120 rows per disease |
| Symptom-severity.csv | Symptom severity weights (1-7) |
| symptom_Description.csv | Disease descriptions |
| symptom_precaution.csv | Disease precautions |

## Important Notes

- This is an educational tool and not a substitute for a doctor.
- All fuzzy and Bayesian mathematics are implemented in Python only, never in TypeScript.
- Symptom names are never hardcoded in Python; they are loaded from CSV files at runtime.
- Cluster assignments are loaded from `cluster_config.json`, generated by `generate_clusters.py`.
- Use `bun add` for frontend package installation. Do not use `npm install`.

## Academic Note

This repository is developed as a Soft Computing university assignment focused on probabilistic graphical models and uncertainty-aware medical expert systems.

The central academic objective is to demonstrate practical integration of:

- Fuzzy Set Theory for vagueness and linguistic uncertainty
- Bayesian Inference for probabilistic uncertainty and evidence aggregation

## Disclaimer

This system is for educational and research demonstration purposes only. It is not a clinical diagnostic system and must not be used as a replacement for professional medical consultation, diagnosis, or treatment.