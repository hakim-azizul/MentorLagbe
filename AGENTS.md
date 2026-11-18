<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MentorLagbe (mentor-client) — Agent Guide

Frontend for **MentorLagbe**, a tuition & mentorship platform. This repo is the Next.js client app; auth is served by this app (App Router route handlers + better-auth), while the domain REST API (tuitions, applications, admin) lives in the sibling **`../mentor-server`** Express app (MongoDB, port 5000). The whole backend — DB access, session middleware and every route — is consolidated in a **single file: `../mentor-server/index.js`** (the old `mentor-server/src/` modules were removed).

## Stack

| Area       | Choice                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework  | Next.js 16.4.6 — App Router, Turbopack default, React Compiler enabled (`reactCompiler: true`)                     |
| React      | 19.3                                                                                                               |
| Language   | TypeScript (strict). Path alias: `@/*` → `src/*`                                                                   |
| Styling    | Tailwind CSS v4 — CSS-first, no config file (`@import "tailwindcss"` + `@theme` in `src/app/globals.css`), `tw-animate-css` |
| UI kit     | shadcn/ui, style `base-nova`, on top of `@base-ui/react`; icons from `lucide-react`                                |
| Auth       | better-auth 1.7.25 with `@better-auth/mongo-adapter`                                                               |
| Database   | MongoDB (driver `mongodb`, database name `MentorLagbeDb`)                                                          |
| Images     | `next/image`; remote hosts whitelisted in `next.config.ts` (includes `i.ibb.co` for ImgBB uploads)                  |

## Commands

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run lint    # ESLint (flat config in eslint.config.mjs)
npx tsc --noEmit  # typecheck
```

**Before finishing any task:** `npx tsc --noEmit` and `npm run lint` must both be clean (0 errors).

## Project structure

```
src/
  app/
    layout.tsx                  # root layout (Geist fonts, metadata)
    globals.css                 # Tailwind v4 @theme design tokens
    api/auth/[...all]/route.ts  # better-auth HTTP handler (toNextJsHandler)
    (root)/
      layout.tsx                # public layout: <Navbar /> <main> <Footer />
      page.tsx                  # home page
      (auth)/
        signin/page.tsx         # route: /signin  (client component)
        signup/page.tsx         # route: /signup  (client component)
    (main)/
      layout.tsx                # public layout (Navbar/main/Footer) for /tuitions
      tuitions/page.tsx         # /tuitions — browse + filter bar (client component)
      tuitions/[id]/page.tsx    # /tuitions/[id] — server: fetch + notFound() on 404
      tuitions/[id]/_components/
        TuitionDetails.tsx      # 2-column layout, sticky fee + tutor card
        ApplySection.tsx        # role-restricted apply flow + Dialog form
    (dashboard)/
      layout.tsx                # guard + <DashboardShell> (sidebar/topbar) for all /dashboard/*
      dashboard/page.tsx        # /dashboard → redirects to the role home
      dashboard/{student,tutor,admin}/
        page.tsx                # thin async server wrapper: requireDashboardUser(role) → client component
        _components/*.tsx       # the actual "use client" page bodies
  components/
    ui/                         # shadcn components: button, input, avatar, dropdown-menu, table, badge, dialog, select, ...
    shared/                     # Navbar.tsx (server), NavbarClient.tsx (client), Footer.tsx
    home/                       # HeroBanner, FeaturedTuitions, PricingSection, HowItWorks, PlatformStatsAndSubjects
    dashboard/                  # DashboardShell, StatCard, PageHeader, EmptyState, StatusBadge, ConfirmDialog, ...
  config/
    dashboardRoutes.ts          # sidebar links + roleHome per role (student/tutor/admin)
  hooks/
    useApi.ts                   # GET hook: { data, loading, error, refetch }
  lib/
    api/                        # frontend API service layer (no raw fetch in components!)
      index.ts                  # barrel — `@/lib/api` re-exports everything below
      client.ts                 # apiFetch()/ApiError/API_URL → NEXT_PUBLIC_API_URL, credentials: "include"
      tuitionApi.ts             # fetchApprovedTuitions(queryString?), fetchTuitionById(id)
      applicationApi.ts         # applyForTuition(payload), checkStudentApplication(tuitionId, email)
    format.ts                   # currency/date helpers
    auth.ts                     # server better-auth config
    auth-client.ts              # createAuthClient → { authClient, signIn, signUp, useSession } (type-only auth import)
    core/serverUser.ts          # getSession() — server-only session lookup, degrades to null on DB failures
    core/dashboardAuth.ts       # requireDashboardUser(role?) — session + role guard, redirects
    uploadImage.ts              # ImgBB upload helper
    types/                      # tUser, tTuition, tApplication, Payment, dashboard types, ...
    utils.ts                    # re-exports cn()
public/                         # static assets (logo.png)
```

## Routing — canonical auth URLs

- Sign in is **`/signin`**, sign up is **`/signup`**. Never link to `/login`, `/sign-up`, or `/register` (legacy dead links, all removed).
- **Exists today:** `/`, `/signin`, `/signup`, `/api/auth/*`, `/tuitions`, `/tuitions/[id]`, `/dashboard` (+ all role pages below).
- **`/dashboard` routes (all guarded by `requireDashboardUser`):** `/dashboard` redirects to the role home; `student`: `/dashboard/student`, `/dashboard/student/my-applications`; `tutor`: `/dashboard/tutor`, `/dashboard/tutor/post-tuition`, `/dashboard/tutor/my-tuitions`, `/dashboard/tutor/applicants`; `admin`: `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/tuitions`, `/dashboard/admin/transactions`. Wrong role → 307 to that user's role home; no session → 307 to `/signin`.
- **`/tuitions` (public, route group `(main)` — no guard):** browse page fetches approved+active listings through the service layer; `/tuitions/[id]` renders details server-side (`notFound()` on 404) and resolves the apply flow client-side via `useSession()` (signed out → link to `/signin`; tutor/admin → notice; student → already-applied check + Dialog form).
- **Linked but not built yet (will 404):** `/tutors`, `/batches`, `/become-tutor`, `/pricing`, `/dashboard/profile`, `/dashboard/enrollments`, `/forgot-password`. Create the page before linking to a new route.

## Frontend API service layer (`src/lib/api/`)

- **Rule: never scatter raw `fetch` inside UI components.** Import an async function from the service layer and `await` it instead.
- `tuitionApi.ts` — `fetchApprovedTuitions(queryString?)` (`GET /api/tuitions`, e.g. `"search=phys&mode=Online"`), `fetchTuitionById(id)` (`GET /api/tuitions/:id`, throws `ApiError(404)` → page calls `notFound()`).
- `applicationApi.ts` — `applyForTuition(payload)` (`POST /api/applications`; payload keys: `tuitionId, studentEmail, studentName, phone, preferredSchedule, note`), `checkStudentApplication(tuitionId, email)` (`GET /api/applications/check` → `{ hasApplied }`).
- `client.ts` — `apiFetch<T>()` (shared fetch wrapper: `API_URL`, `credentials: "include"`, JSON handling, throws `ApiError` with `.status`), `ApiError`, `API_URL`.
- `index.ts` is a barrel, so the legacy import path `@/lib/api` keeps working for `apiFetch`/`ApiError` (used by `useApi` and dashboard components).
- Handle errors by status: `409` from `applyForTuition` = already applied (flip UI to the "Already Applied" state), `403` = not a student, `400` = validation — show `error.message` (it is the backend `{ message }`).

## mentor-server REST API (single-file `index.js`)

All backend logic lives in **`../mentor-server/index.js`** (Express + native MongoDB driver, database `MentorLagbeDb`; auth collections are singular: `user`, `session`, `account`, `verification`; business collections plural: `tuitions`, `applications`, `payments`). Start with `node index.js` (port 5000); regression suite: `node scripts/smoke.mjs` (46 checks, must stay green).

**Public (no session required):**

- `GET /api/tuitions` — approved + active listings, newest first. Optional query params: `search` (case-insensitive regex over `title`/`subject`, escaped), `subject`, `classLevel`, `mode`.
- `GET /api/tuitions/:id` — single tuition + populated `tutor` summary (`name`, `email`, `image`, `bio`, `plan` from the `user` collection). Invalid/unknown id → `404`.
- `POST /api/applications` — body `tuitionId, studentEmail, studentName, phone, preferredSchedule, note` → `201`; missing field → `400 "Please fill in: ..."`; applicant not `role: student` in `user` → `403 "Only students can apply for tuitions."`; duplicate (`tuitionId` + `studentEmail`) → `409 "You have already applied for this tuition."`. Stores `studentPhone`/`studentNote`, `status: "pending"`, `appliedAt`/`createdAt`.
- `GET /api/applications/check?tuitionId=&email=` — → `{ hasApplied: boolean }` (`400` when a param is missing).

**Session-guarded (signed `better-auth.session_token` cookie, role enforced):** `POST|GET|PATCH|DELETE /api/tuitions` (owner-or-admin edits; `GET /api/tuitions/tutor`), `GET|PATCH|DELETE /api/applications` (`/student`, `/tutor`, `/:id/status`), `/api/dashboard/{student,tutor,admin}/stats`, `/api/admin/*` (users, tuitions, transactions).

## Dashboard data flow (client → mentor-server)

- Pages are thin async server wrappers (guard) around colocated `"use client"` components in `_components/`.
- Client components read data with `useApi<T>(path)` and mutate with `apiFetch(path, opts)`; both hit `NEXT_PUBLIC_API_URL` (the Express backend, `http://localhost:5000`) with `credentials: "include"` so the better-auth session cookie is sent cross-origin. CORS on the server allows `CLIENT_ORIGINS` (localhost:3000/5173) with credentials.
- The backend resolves the session from the **signed** `better-auth.session_token` cookie (it strips/verifies the HMAC suffix, then looks up `session` + `user` in `MentorLagbeDb`) and enforces `role` per route.
- **Do not add a `loading.tsx` under `(dashboard)`** — a streamed shell makes the page-level `redirect()` (role guard) fall back to a client-side meta-refresh (200) instead of a proper 307. Loading/empty/error states are handled inside the client components via `useApi`.

## Auth architecture (better-auth)

- **Server config** — `src/lib/auth.ts`: `emailAndPassword` enabled, Google social provider, Mongo adapter. Additional user fields: `role` (`student` | `tutor` | `admin`, default `student`), `phone` (string), `bio` (string), `plan` (`free` | `pro`, default `free`). It also throws a clear error when `DB_URI` is missing, logs a non-blocking `[auth] MongoDB connected` on boot and lists `trustedOrigins` (`BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `localhost:5173`).
- **HTTP handler** — `src/app/api/auth/[...all]/route.ts`: `POST`/`PATCH`/`PUT`/`DELETE` are the plain `toNextJsHandler` handlers; the custom `GET` wrapper **degrades `FAILED_TO_GET_SESSION` (thrown or as a 500 body) to `200` + `null`** so a transient MongoDB blip can never crash `useSession()` in the browser. Other statuses pass through untouched.
- **Client** — `src/lib/auth-client.ts`: `createAuthClient` + `inferAdditionalFields` (import the server config **type-only** — never a value import, or `MongoClient` leaks into the client bundle). `baseURL` uses `NEXT_PUBLIC_APP_URL` (same-origin fallback). Use `signIn.email({...})`, `signUp.email({...})` (both accept `callbackURL`), `authClient.signOut()`, `useSession()`.
- **Never import API functions from `better-auth/api` inside client components** — those are server endpoints requiring a request context; calling them in the browser throws and the operation silently fails (this broke logout once already).
- **Server session** — `getSession()` from `@/lib/core/serverUser.ts` (reads `headers()`; server-only, marked `"use server"`). It catches DB/API failures and returns `null` (signed out) instead of crashing the page render — except Next's internal `DYNAMIC_SERVER_USAGE` signal, which it rethrows so dynamic rendering still works. The log line `[auth] getSession failed, treating as signed out:` in a build/render log is this guard doing its job.
- **Navbar pattern (canonical for session-aware UI):** `Navbar.tsx` is an `async` Server Component that awaits `getSession()` and passes the plain `user` object as props into the `"use client"` `NavbarClient.tsx`. Follow the same shape elsewhere: fetch on the server, pass serializable props to a client component. After sign-in/sign-up/sign-out, call `router.refresh()` so server-rendered UI picks up the new session.

## Design tokens (`@theme` in `src/app/globals.css`)

60/30/10 color principle — use these Tailwind classes, not raw hex values:

- **60% base:** `background` (#FFFFFF), `surface` (#F8FAFC)
- **30% secondary:** `heading` (#0F172A), `body` (#475569), `border-subtle` (#E2E8F0)
- **10% accent:** `brand` (#00D66C), `brand-hover` (#00B85C), `brand-tint` (#ECFDF5)

Examples: `bg-background`, `text-heading`, `text-body`, `border-border-subtle`, `bg-brand`, `bg-brand-tint`, `hover:bg-brand-hover`.

## Environment variables (`.env` — names only, never commit values)

- Defined: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DB_URI`, `NEXT_PUBLIC_API_URL` (mentor-server base URL), `NEXT_PUBLIC_APP_URL` (public app URL — auth client `baseURL` + trusted origin), `NEXT_PUBLIC_IMGBB_API_KEY` (ImgBB banner uploads)
- Referenced but **missing** from `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (used in `src/lib/auth.ts`; Google sign-in is disabled until they're added — better-auth logs a warning, harmless)

## Conventions & gotchas

- Default to Server Components; add `"use client"` only when you need state, effects, or browser APIs.
- Code comments in this repo are written in Bengali — that's expected; agent-facing docs (this file) stay in English.
- The logo lives at `public/logo.png` and is referenced as `/logo.png` — keep the casing exact (it breaks on case-sensitive hosts like Linux/Vercel).
- shadcn components: add with `npx shadcn add <component>`; compose classes with `cn()` from `@/lib/utils`.
- `next.config.ts` wires Tailwind v4 through a Turbopack loader rule for `*.css` and sets `reactCompiler: true` — don't remove either.
- Keep the managed Next.js block at the top of this file intact: `next dev` rewrites it, and committing it with your work keeps the tree clean.
