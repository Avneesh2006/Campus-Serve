# CampusOS

The Student Operating System — a full-stack SaaS platform that brings attendance, academics, assignments, career prep, community, marketplace, and AI study tools into one dashboard for college students.

## Stack

Next.js 15 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · shadcn-style UI · Prisma · PostgreSQL · NextAuth v5 · React Hook Form · Zod · Recharts · Anthropic SDK · Lucide

## Modules

| Module | Description |
|---|---|
| **Foundation** | Auth (login/register/forgot password), landing page, dashboard shell, theming |
| **Dashboard** | Welcome, attendance summary, timetable, assignments, notes, calendar, notifications, progress charts, activity, announcements |
| **Attendance** | Subjects, daily tracker, safe-bunk calculator, analytics, timetable, history |
| **Academic Hub** | Notes, Previous Year Papers, Books, Resources — search, filters, bookmarks, preview, upload, ratings |
| **Assignments** | Dashboard, calendar, reminders, submission, attachments, priority & status tracking |
| **Community** | Discussion forum, comments/replies, senior guidance, clubs, events — with anonymous posting, likes, bookmarks |
| **Marketplace** | Buy & Sell, Lost & Found, Academic Assistance (tutoring/mentoring only) — images, search, filters, contact seller |
| **Career Hub** | Internships, hackathons, coding resources with progress tracking, resume builder with PDF export |
| **AI Study Tools** | AI Chat, PDF Summarizer, Study Planner, Attendance Predictor, Question Solver — shared chat UI, persisted history |
| **Admin Panel** | Dashboard, user management, reports, analytics, announcements, settings (role-gated) |

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `AUTH_SECRET` — generate with `npx auth secret`
   - `ANTHROPIC_API_KEY` — required for AI Study Tools (Chat, PDF Summarizer, Study Planner, Question Solver, Attendance Predictor insight)
   - `NEXT_PUBLIC_SITE_URL` — your deployed URL (used for SEO metadata, sitemap, robots.txt)
3. Push the schema to your database:
   ```bash
   npm run db:push
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

To make your own account an admin (for the Admin Panel), update its role directly in the database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## Scripts

```bash
npm run dev        # start dev server (Turbopack)
npm run build       # production build
npm run start       # run production build
npm run lint        # run ESLint
npm run db:push     # push Prisma schema to database
npm run db:studio   # open Prisma Studio
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the environment variables listed above in the Vercel project settings.
4. Vercel runs `npm install` (which triggers `prisma generate` via `postinstall`) and then `npm run build` automatically — no extra configuration needed.
5. After the first deploy, run `npm run db:push` locally (pointed at your production `DATABASE_URL`) to create the database tables, or use your Postgres provider's migration tooling.

A managed Postgres provider (e.g. Neon, Supabase, Railway) works well with Vercel's serverless functions.

## Project structure

```
src/
  app/
    (auth)/login, register, forgot-password
    (dashboard)/dashboard/<module>/          # one folder per module
    api/<module>/                            # REST-style route handlers per module
    layout.tsx, error.tsx, not-found.tsx, global-error.tsx, robots.ts, sitemap.ts
  components/
    ui/            # reusable primitives (button, card, dialog, select, tabs, ...)
    layout/        # navbar, sidebar, topbar, footer
    <module>/      # one folder per feature module, mirroring app/api structure
  hooks/           # one client data hook per resource (use-<resource>.ts)
  lib/
    auth.ts, prisma.ts, anthropic.ts, admin-auth.ts
    validations/<module>.ts   # Zod schemas, one file per module
prisma/schema.prisma
```

## Architecture notes

- **Route protection**: `middleware.ts` redirects unauthenticated users away from `/dashboard/*`, and non-admins away from `/dashboard/admin/*`. Admin pages also re-check the role server-side as defense in depth.
- **Data fetching**: client components use small hooks (`use-<resource>.ts`) that wrap `fetch` against the matching API route; server components (layouts, the admin page) call `auth()`/Prisma directly.
- **Design system**: Tailwind v4 with CSS-variable-based theming (light/dark/system via `next-themes`), shadcn-style primitives in `components/ui/`, `Card`/`Badge`/`Button`/`Select`/`Tabs`/`Dialog` reused across every module rather than one-off styles.
- **AI Tools**: one `AiConversation`/`AiMessage` schema backs Chat, PDF Summarizer, Study Planner, and Question Solver, all sharing the same `ChatPanel` component. The Attendance Predictor is a deterministic calculation over real attendance data, not a model guess — an optional AI insight is layered on top without letting the model recompute the numbers.
- **File uploads**: notes/resumes/listing images currently store either a pasted link or a local object URL — no cloud storage (S3, etc.) is wired up yet; swapping in real storage only requires changing where `fileUrl` is set.

## SEO & error handling

- Root metadata includes OpenGraph, Twitter cards, and a dynamic `robots.txt` / `sitemap.xml`.
- `error.tsx` (dashboard + root), `global-error.tsx` (root layout failures), and `not-found.tsx` provide graceful fallbacks instead of raw stack traces.
- `loading.tsx` provides a skeleton shell while dashboard routes hydrate.

## License

Private project — not licensed for redistribution.
