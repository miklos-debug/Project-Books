# BookPulse Monorepo

BookPulse is an original short book summary experience with optional audio and a simple admin panel. This repo ships a Supabase schema, an Expo mobile app, and a Next.js admin dashboard.

## Stack
- Mobile: React Native (Expo) + TypeScript + React Navigation
- Admin: Next.js + TypeScript
- Backend: Supabase (Auth, Postgres, Storage) with RLS
- Data fetching: TanStack Query

## Getting started (beginner-friendly, step-by-step)
Follow these steps exactly from the repo root (the folder that contains this README). Every command shown is meant to be pasted into your terminal in this order.

### 0) Find the repo folder on your machine (so commands run in the right place)
If `cd /workspace/Project-Books` fails on your Mac/PC, you are simply in a different directory than this project. Do this:

1. Open Terminal (macOS) or PowerShell (Windows).
2. List your folders to see where the project lives:
   - macOS/Linux: `ls`
   - Windows: `dir`
3. If you downloaded a zip, it is usually in `Downloads`. Move into it:
   - macOS/Linux: `cd ~/Downloads`
   - Windows: `cd $HOME/Downloads`
4. List again (`ls` or `dir`) and look for the unzipped project folder name (for example `Project-Books`).
5. Change into that folder, then confirm you see this README by running `ls` (or `dir`). You should see `README.md`, `apps`, `packages`, and `supabase` listed. If you do not, move up or down a level until you do.

All remaining commands must be run **after** you have changed into that folder.

### 1) Install the tools you need (one-time)
- Install **Node.js 18+** (https://nodejs.org) and **npm**. On macOS you can use Homebrew (`brew install node`); on Windows use the official installer.
- Install the **Supabase CLI** so you can apply the database schema (https://supabase.com/docs/guides/cli/getting-started). A detailed beginner walkthrough is below.
- (Optional but helpful) Install **Expo Go** on your iOS/Android device from the app store to preview the mobile app.

#### How to install the Supabase CLI (step by step)
Follow the steps for your operating system. After installing, verify with `supabase --version`.

**macOS (Homebrew)**
1. Open the Terminal app.
2. Install Homebrew if you do not have it yet: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
3. Install the CLI: `brew install supabase/tap/supabase`
4. Confirm: `supabase --version`

**Windows (PowerShell + Scoop)**
1. Open **PowerShell** as Administrator.
2. Install Scoop (Windows package manager): `iwr -useb get.scoop.sh | iex`
3. Install the CLI: `scoop install supabase`
4. Confirm: `supabase --version`

**Linux (curl install script)**
1. Open your terminal.
2. Run: `curl -fsSL https://supabase.com/cli/install/linux | sh`
3. Ensure `~/.supabase/bin` is on your `PATH` (the installer prints the command to add; copy/paste it).
4. Confirm: `supabase --version`

If you prefer another package manager, the Supabase docs list alternative options. The CLI requires Docker when you use `supabase db` commands locally.

### 2) Install project dependencies
Run this once after cloning:
```bash
npm install
```
If your network blocks npm, try again on a different network or with a VPN.

### 3) Add your Supabase credentials to env files (exact commands)
You need your project URL and anon key from the Supabase dashboard (Settings → API).

Run these commands **from the repo root (`/workspace/Project-Books`)** to create the files with your values:
```bash
cat <<'EOF' > apps/admin/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

cat <<'EOF' > apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF
```
Replace the placeholders before pressing Enter (the files are created in `apps/admin` and `apps/mobile`). If you are unsure you are in the right folder, run `pwd` first and confirm it prints `/workspace/Project-Books`.

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
- On macOS, the terminal may remind you that the default shell is now `zsh`. You can keep using the provided commands as-is; you do **not** need to run `chsh` or change shells to continue.

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
