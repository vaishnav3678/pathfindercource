# Pathfinder Courses - Dynamic LMS Platform

> **"Learn. Practice. Grow."**

A production-ready, fully dynamic Learning Management System (LMS) built with React, TypeScript, Tailwind CSS, and Supabase PostgreSQL.

---

## 🌟 Key Highlights & Architecture

- **Dual-Role Authentication**:
  - **Student Login**: Email + Password. Strictly scoped so students only see courses assigned to their account.
  - **Admin Login**: Admin portal with username & password management.
- **Dynamic Data & Zero Hardcoding**:
  - Every course, video, daily live meeting, study material, and student enrollment is backed by the database.
- **Dedicated Course Access Management**:
  - Admin assigns: `Student Email` → `Course` → `Grant Access`.
  - e.g., assigning `Software Testing` to `pawarvaishnav267@gmail.com` grants access exclusively to that course.
- **Daily Live Meetings System**:
  - Dynamic scheduling for Google Meet / Zoom sessions.
  - Categorized into *Today's Live Class*, *Upcoming Meetings*, and *Past Recordings*.
- **Interactive Video Lectures**:
  - Video player with YouTube/stream support.
  - Watched/unwatched progress tracking, percentage calculation, and celebratory confetti upon 100% completion.
- **Floating WhatsApp Support**:
  - Always accessible floating contact button with direct click-to-chat to `+91 8767168411`.
- **Hybrid Storage & Supabase Readiness**:
  - Seamlessly queries Supabase when `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` are provided.
  - Features reactive persistence so the platform works out-of-the-box in preview and development.

---

## 🔐 Initial Credentials

### Administrator Login:
- **Username**: `pathfinder3678`
- **Password**: `Pawar@3678`
*(Can be changed anytime via `/admin/settings`)*

### Initial Students:
1. **Vaishnav Pawar**:
   - **Email**: `pawarvaishnav267@gmail.com`
   - **Password**: `student123`
   - **Assigned Courses**: **Software Testing** only.
2. **Demo Student**:
   - **Email**: `student@pathfinder.edu`
   - **Password**: `student123`
   - **Assigned Courses**: Both Software Testing & Mobile App Development.

---

## 🚀 Local Development & Build

```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Compile TypeScript & production build
npm run build
```

---

## 🗄️ Supabase PostgreSQL Setup & RLS

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run the SQL script located in `supabase/schema.sql`.
3. In `Project Settings` → `API`, copy your:
   - `Project URL`
   - `anon public key`
4. Set the environment variables in your `.env` or deployment settings:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 🌐 Vercel Deployment Guide

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. The build preset will automatically detect Vite (`npm run build`, output: `dist`).
4. In **Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy! Client routing is handled via `vercel.json`.
