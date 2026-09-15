# The Harfield Hub

A local business directory. Next.js, Supabase, deployed on Vercel.

---

## HOW TO DEPLOY. FOLLOW IN ORDER.

### Step 1 — Put these files in a GitHub repo

Upload everything in this folder to the ROOT of the repo.

Correct: you see `package.json` and `app` straight away when you open the repo.
Wrong: you see one folder you have to click into first.

Do not upload:
- `node_modules`
- `.next`
- any zip file

### Step 2 — Import to Vercel

1. vercel.com, Add New, Project
2. Import the repo
3. Do NOT change any settings
4. Deploy

`vercel.json` tells Vercel this is a Next.js app, so nothing needs configuring.

### Step 3 — There is no step 3

The Supabase connection is already in the code, in `lib/env.ts`.
No environment variables are needed. It works on the first deploy.

---

## AFTER IT IS LIVE. THREE THINGS.

### 1. Turn off email confirmation

Supabase dashboard, Authentication, Providers, Email.
Switch OFF "Confirm email".

Without this a business signs up and gets stuck waiting for an inbox.

### 2. Make yourself admin

Sign up at `/signup` on your live site. Then in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

Now `/admin/businesses` opens for you.

### 3. Add your domain

Vercel, your project, Settings, Domains. Add `harfieldhub.co.za`.
Copy the DNS records it gives you into your registrar.

---

## IF SOMETHING GOES WRONG

**"No Output Directory named public"**
Vercel did not detect Next.js. Check `vercel.json` and `package.json` are at the
repo root, not inside a folder. If they are inside a folder, set
Settings, General, Root Directory to that folder name.

**Site loads but shows no businesses**
That is correct. There is no data yet. Add businesses at `/join/apply`, then
approve them at `/admin/businesses`.

**Cannot open /admin**
You have not set your role to admin. See step 2 above.

---

## THE PAGES

| Page | What it does |
|---|---|
| `/` | Directory. Search, categories, tier ranking |
| `/b/[slug]` | A business page |
| `/offers` | Live offers |
| `/events` | Upcoming events |
| `/join` | Pricing |
| `/join/apply` | Signup wizard, 5 steps |
| `/login` `/signup` | Accounts |
| `/dashboard` | A business sees their views and messages |
| `/admin/businesses` | You approve and change tiers |

## RUNNING IT LOCALLY

```
npm install
npm run dev
```

## CLONING TO ANOTHER SUBURB

1. Add the suburb row in the `suburbs` table
2. Set `NEXT_PUBLIC_SUBURB_SLUG` and `NEXT_PUBLIC_SITE_NAME` in Vercel
3. Deploy again

Same codebase. Never fork it.
