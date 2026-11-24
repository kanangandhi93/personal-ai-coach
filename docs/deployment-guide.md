# Zero-Cost Production Deployment Guide

Deploy the Personal AI Learning Coach to 100% free cloud tiers without incurring any monthly hosting charges.

---

## 1. Cloud Database & Auth (Supabase Free Tier)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, copy and execute the complete schema migration:
   - File: [`backend/src/db/migrations/001_initial_schema.sql`](file:///d:/02%20AI%20agent%20application/03%20Projects/14_product/coaching/backend/src/db/migrations/001_initial_schema.sql)
3. This creates all 23 tables, indexes, and applies Row Level Security (RLS) policies for user isolation.
4. Copy your project's **URL**, **Anon Key**, and **Service Role Key** from Settings → API.

---

## 2. Backend API Deployment (Render / Railway / Fly.io Free Tier)

1. Connect your Git repository to Render.com (Web Service).
2. Configure build settings:
   - **Environment**: Node
   - **Build Command**: `npm --prefix packages/shared install && npm --prefix packages/shared run build && npm --prefix backend install && npm --prefix backend run build`
   - **Start Command**: `npm --prefix backend run start`
3. Add Environment Variables:
   - `PORT=4000`
   - `NODE_ENV=production`
   - `SUPABASE_URL=https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY=your-supabase-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key`
   - `GEMINI_API_KEY=...`
   - `GROQ_API_KEY=...`
   - `OPENROUTER_API_KEY=...`

---

## 3. Web App Deployment (Vercel / Netlify / Cloudflare Pages Free Tier)

1. Connect repository to Vercel or Cloudflare Pages.
2. Root directory: `web`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Configure `VITE_API_URL` pointing to your deployed backend URL.

---

## 4. Android APK Generation (Expo Application Services - EAS Free Tier)

1. In `mobile/`:
   ```bash
   npm --prefix mobile install -g eas-cli
   eas login
   eas build -p android --profile preview
   ```
2. Download and install the standalone `.apk` on your Android device.
