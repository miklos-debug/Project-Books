# BookPulse Monorepo

BookPulse is an original short book summary experience with optional audio and a simple admin panel. This repo ships a Supabase schema, an Expo mobile app, and a Next.js admin dashboard.

## Stack
- Mobile: React Native (Expo) + TypeScript + React Navigation
- Admin: Next.js + TypeScript
- Backend: Supabase (Auth, Postgres, Storage) with RLS
- Data fetching: TanStack Query

## Getting started
1. Install dependencies
   ```bash
   npm install
   ```
2. Create a `.env.local` for the admin app and `apps/mobile/.env` for Expo with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_SUPABASE_URL=your-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Apply database schema and seed
   ```bash
   supabase db reset --local --use-mig-dir ./supabase
   supabase db seed --local --use-mig-dir ./supabase --file supabase/seed.sql
   ```
4. Create the first admin user in Supabase auth, then set their role:
   ```sql
   insert into public.profiles (user_id, role) values ('<auth-user-id>', 'admin')
   on conflict (user_id) do update set role='admin';
   ```
5. Run admin dashboard
   ```bash
   npm run dev:admin
   ```
6. Run mobile app
   ```bash
   npm run dev:mobile
   ```

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
