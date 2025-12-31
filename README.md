# BookPulse Monorepo

BookPulse is an original short book summary experience with optional audio and a simple admin panel. This repo ships a Supabase schema, an Expo mobile app, and a Next.js admin dashboard.

## Stack
- Mobile: React Native (Expo) + TypeScript + React Navigation
- Admin: Next.js + TypeScript
- Backend: Supabase (Auth, Postgres, Storage) with RLS
- Data fetching: TanStack Query

## Getting started (beginner-friendly, step-by-step)
Follow these steps exactly from the repo root (`/workspace/Project-Books`). Every command shown is meant to be pasted into your terminal in this order.

### 1) Install the tools you need (one-time)
- Install **Node.js 18+** (https://nodejs.org) and **npm**. On macOS you can use Homebrew (`brew install node`); on Windows use the official installer.
- Install the **Supabase CLI** so you can apply the database schema (https://supabase.com/docs/guides/cli/getting-started).
- (Optional but helpful) Install **Expo Go** on your iOS/Android device from the app store to preview the mobile app.

### 2) Install project dependencies
Run this once after cloning:
```bash
npm install
```
If your network blocks npm, try again on a different network or with a VPN.

### 3) Add your Supabase credentials to env files
You need your project URL and anon key from the Supabase dashboard (Settings → API).

Create `apps/admin/.env.local` **and** `apps/mobile/.env` with this content (replace the placeholders):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4) Set up the local database with Supabase CLI
From the repo root run:
```bash
supabase db reset --local --use-mig-dir ./supabase
supabase db seed --local --use-mig-dir ./supabase --file supabase/seed.sql
```
This applies the migrations (tables, RLS, RPCs) and loads sample content/segments.

### 5) Make yourself an admin
Create a user in Supabase Auth (email magic link). Copy the user’s `id` from the dashboard, then run this SQL in the Supabase SQL editor:
```sql
insert into public.profiles (user_id, role) values ('<auth-user-id>', 'admin')
on conflict (user_id) do update set role='admin';
```

### 6) Run the admin web app (Next.js)
In one terminal from the repo root:
```bash
npm run dev:admin
```
Then open http://localhost:3000 and log in with the admin email you created. Content tools are at `/content`; feed controls at `/segments`.

### 7) Run the mobile app (Expo)
In a second terminal from the repo root:
```bash
npm run dev:mobile
```
- When the Expo dev server shows a QR code, scan it with the Expo Go app on your device.
- On Android emulators, press `a` in the terminal to open the app; on iOS simulators, press `i`.
- If the app cannot reach Supabase, double-check the URLs/keys in `apps/mobile/.env`.

### 8) Common troubleshooting tips
- If `npm install` fails with a registry or SSL error, retry on a new network or ensure corporate proxies are configured.
- If Supabase CLI commands fail, confirm the CLI is installed (`supabase --version`) and that Docker is running (required for local DB).
- To reset everything, rerun the commands from Step 4.

### Admin notes
- Content management lives under `/content` (list, create, edit) and feed controls live under `/segments`.
- The login page sends a Supabase magic link. Ensure your email is part of the `profiles` table with `role = 'admin'`.

### Mobile notes
- Enter your Supabase keys in `apps/mobile/.env`. The Profile tab allows sending a magic link or continuing as a guest. Guest mode can browse but cannot save.
- Home feed, search, and detail screens read directly from Supabase RPCs/tables. Saving a title writes to `user_saves` (requires auth).

## Supabase structure
- `supabase/migrations` holds SQL schema, RLS policies, and RPCs.
- `supabase/seed.sql` adds sample authors, content, and feed segments.

## Features snapshot
- Mobile tabs for Home, Search, Library, and Profile with clean cards and audio playback.
- Admin login plus forms to create content and organize feed segments.
- RLS ensures only admins can manage content and users can only modify their own saves, progress, and downloads.

## Notes
- The design, naming, and copy are original and intentionally avoid Blinkist branding.
