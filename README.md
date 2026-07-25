# Keepsake Pages

A small app for making a page of photos and notes for a wedding, birthday, or
any other event — then sharing it publicly or keeping it private. Anyone can
make their own page; each page has one owner (whoever set its password) who
can add photos, write a note under each one, and flip the page between
public and private.

- **5 pages total**: Home, Create, Manage (owner login), Dashboard (this
  device's pages), and the Event page itself (which doubles as the
  owner-editing view and the public read-only view).
- **No accounts required.** A page's owner is whoever knows its password —
  set when the page is created.
- Built with **Next.js** (App Router) and **Supabase** (free tier) for the
  database, file storage, and hosting the API routes need. Deploys free on
  **Vercel**.

## How it's put together

```
app/
  page.js                    Home
  create/page.js              Create-a-page form
  manage/page.js               Owner login form (slug + password)
  dashboard/page.js            List of pages made on this device
  event/[slug]/page.js         The event page (owner view + public view)
  api/events/route.js          POST — create a page
  api/events/[slug]/route.js   GET/PATCH/DELETE — read, edit, or remove a page
  api/events/[slug]/login/     POST — check password, start owner session
  api/events/[slug]/photos/    POST — upload a photo; DELETE — remove one
lib/
  supabaseAdmin.js       Server-only Supabase client (service role key)
  auth.js                Signs/verifies the owner-session cookie
  utils.js               Small shared helpers
components/
  PolaroidCard.js         The photo-card UI
supabase-schema.sql       Run this once in your Supabase project
```

Each page's password is hashed (never stored in plain text). Logging in as
an owner sets a signed, httpOnly cookie scoped to that page for 7 days — no
sessions table needed.

**A note on privacy**: photo files live in a public storage bucket at
unguessable URLs. A private page's photo *list* is hidden from everyone but
its owner, but if someone already had a direct image URL (e.g. you sent them
one), that specific file would still load. This matches the request for
something simple; if you need stricter privacy later, switch the bucket to
private and generate short-lived signed URLs in `app/api/events/[slug]/route.js`
instead.

## 1. Set up Supabase (free)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste in the contents of
   `supabase-schema.sql`, and run it. This creates the `events` and `photos`
   tables and a public `event-photos` storage bucket.
3. Go to **Project Settings → API** and copy three values: the **Project
   URL**, the **anon public** key, and the **service_role** key (click
   "Reveal" — keep this one secret).

## 2. Configure the app

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...        # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # anon public key
SUPABASE_SERVICE_ROLE_KEY=...       # service_role key — keep secret
SESSION_SECRET=...                  # any long random string, e.g. `openssl rand -hex 32`
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 4. Deploy free on Vercel

1. Push this project to a GitHub repo.
2. In [Vercel](https://vercel.com), click **Add New → Project** and import
   that repo.
3. Under **Environment Variables**, add the same four values from
   `.env.local`.
4. Click **Deploy**. Vercel's free tier covers this comfortably — the app
   has no server to run yourself, just the serverless API routes.

## Making changes later ("version updatable")

Everything is plain, ordinary Next.js — there's no build step or generator
to fight:

- **Add a field to a page** (e.g. a location): add a column in
  `supabase-schema.sql` (and run the matching `alter table` in Supabase),
  then read/write it in `app/api/events/[slug]/route.js` and show it in
  `app/event/[slug]/page.js` and `app/create/page.js`.
- **Change the look**: colors, type, and spacing are all defined once in
  `tailwind.config.js` and `app/globals.css`.
- **Add a page**: create a new folder under `app/` with a `page.js` in it —
  Next.js routes it automatically.
- Deploying a change is just pushing to GitHub — Vercel redeploys on every
  push automatically, and you can roll back to any previous deploy from the
  Vercel dashboard with one click if something breaks.

## Limitations worth knowing about

- There's no "forgot password" flow — if an owner loses their password, the
  page can't be recovered from the UI. You (as the person running this
  install) could reset one by hand from the Supabase table editor.
- The free tiers of Supabase and Vercel are generous for personal use but do
  have caps (storage size, bandwidth, function executions) — fine for
  friends and family sharing event photos, worth checking before pointing a
  large public audience at it.
