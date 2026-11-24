# Quick Setup Guide

Get the **Personal AI Learning Coach** running locally on your PC in less than 3 minutes.

---

## 1. Prerequisites
- **Node.js**: v18+ (verified on v24)
- **RAM Requirement**: Runs comfortably on Windows PC with 2GB RAM.

---

## 2. Installation

From the project root:
```bash
# 1. Install & build shared package
npm --prefix packages/shared install
npm --prefix packages/shared run build

# 2. Install & build backend
npm --prefix backend install
npm --prefix backend run build

# 3. Install web dependencies (optional for UI)
npm --prefix web install
```

---

## 3. Environment Configuration

1. Copy `.env.example` in `backend/` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. (Optional) Paste any of your free API keys into `backend/.env`:
   - `GEMINI_API_KEY=` (Google AI Studio Free Tier)
   - `GROQ_API_KEY=` (Groq Cloud Free Tier)
   - `OPENROUTER_API_KEY=` (OpenRouter Free Models)
   - `CEREBRAS_API_KEY=` (Cerebras Cloud Free Tier)
3. If no keys are provided, the system runs with `ENABLE_MOCK_FALLBACK=true`, allowing complete offline testing and zero-cost development.

---

## 4. Running Verification Test Suites

Verify any or all phases with one command:
```bash
npm run verify:phase0   # Foundation & AI Adapter verification
npm run verify:phase1   # Learning Core & Curriculum Agent
npm run verify:phase2   # Doubt Solver & Practice Engine
npm run verify:phase3   # Exams, Interviews & Practicals
npm run verify:phase4   # Mastery Engine (L0-L6) & Spaced Repetition
npm run verify:phase5   # Research Agent & Quota Manager
npm run verify:phase6   # End-to-End Hardening & Failure Simulations
```

---

## 5. Starting the Applications

- **Backend API (Port 4000):**
  ```bash
  npm run dev:backend
  ```
- **Web App (Port 3000):**
  ```bash
  npm run dev:web
  ```
- **Android App:**
  ```bash
  npm --prefix mobile run start
  ```
