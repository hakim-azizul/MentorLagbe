<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MentorLagbe (mentor-client) — Agent Guide

Frontend for **MentorLagbe**, a tuition & mentorship platform. This repo is the Next.js client app; auth is served by this app (App Router route handlers + better-auth), while the domain REST API (tuitions, applications, admin) lives in the sibling **`../mentor-server`** Express app (MongoDB, port 5000). The whole backend — DB access, session middleware and every route — is consolidated in a **single file: `../mentor-server/index.js`** (the old `mentor-server/src/` modules were removed; endpoints are registered directly on the Express `app` — `app.get("/api/...", verifyToken, ...)` — with no `express.Router()`). 

## Stack

| Area       | Choice                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework  | Next.js 16.4.6 — App Router, Turbopack default, React Compiler enabled (`reactCompiler: true`)                     |
| React      | 19.3                                                                                                               |
| Language   | TypeScript (strict). Path alias: `@/*` → `src/*`                                                                   |
| Styling    | Tailwind CSS v4 — CSS-first, no config file (`@import "tailwindcss"` + `@theme` in `src/app/globals.css`), `tw-animate-css` |
| UI kit     | shadcn/ui, style `base-nova`, on top of `@base-ui/react`; icons from `lucide-react`                                |
| Auth       | better-auth 1.7.25 with `@better-auth/mongo-adapter` + `jwt` plugin (session JWT for the Express API)  |
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
      layout.tsx                # PublicLayout: <Navbar /> <main> <Footer />
      page.tsx                  # home page
      (auth)/
        signin/page.tsx         # route: /signin  (client component)
        signup/page.tsx         # route: /signup  (client component)
      tuitions/page.tsx         # /tuitions — server: metadata + Suspense shell (useSearchParams boundary)
      tuitions/_components/
        BrowseTuitions.tsx      # client: URL query-param search/filter/sort + result cards (tutor avatar)
      tuitions/[id]/page.tsx    # /tuitions/[id] — server: fetch + notFound() on 404
      tuitions/[id]/_components/
        TuitionDetails.tsx      # 2-column layout, sticky fee + tutor card
        ApplySection.tsx        # role-restricted apply flow + Dialog form
      payment/page.tsx          # /payment — server: role-aware Pro pricing ($15 tutor / $10 student) + checkout form
      checkout/page.tsx         # /checkout — legacy redirect to /checkout/success (or /payment)
      checkout/success/page.tsx # /checkout/success — server shell for the client verifier below
      checkout/success/_components/
        CheckoutSuccess.tsx     # client: checkoutVerify(session_id) → loading/success/error + dashboard redirect
    (dashboard)/
      layout.tsx                # guard + <DashboardShell> (sidebar/topbar) for all /dashboard/*
      dashboard/page.tsx        # /dashboard → redirects to the role home
      dashboard/{student,tutor,admin}/
        page.tsx                # thin async server wrapper: requireDashboardUser(role) → client component
        _components/*.tsx       # the actual "use client" page bodies
      dashboard/student/saved-tuitions/
        page.tsx                # student-only wrapper → SavedTuitions client view
        _components/SavedTuitions.tsx  # bookmarked tuition grid, remove, empty/error/skeleton states
      dashboard/profile/
        page.tsx                # /dashboard/profile — server wrapper: requireDashboardUser() → ProfileForm
        _components/ProfileForm.tsx  # client form: fetch profile, ImgBB upload, PATCH save
  components/
    ui/                         # shadcn components: button, input, avatar, dropdown-menu, table, badge, dialog, select, ...
    shared/                     # Navbar.tsx (server), NavbarClient.tsx (client), Footer.tsx
    home/                       # HeroBanner, FeaturedTuitions (client fetch, limit=6), PricingSection, HowItWorks, PlatformStatsAndSubjects
    dashboard/                  # DashboardShell, StatCard, PageHeader, EmptyState, StatusBadge, ConfirmDialog, ...
  config/
    dashboardRoutes.ts          # sidebar links + roleHome per role (student/tutor/admin)
  hooks/
    useApi.ts                   # GET hook: { data, loading, error, refetch }
  lib/
    api/                        # frontend API service layer (no raw fetch in components!)
      index.ts                  # barrel — `@/lib/api` re-exports everything below
      client.ts                 # apiFetch()/ApiError/API_URL → NEXT_PUBLIC_API_URL + Bearer JWT (401 → refresh once & retry)
      jwt.ts                    # getJwt()/clearJwtCache() — Better Auth session JWT, in-memory cache
      tuitionApi.ts             # fetchApprovedTuitions(queryString?, signal?), fetchTuitionById(id)
      applicationApi.ts         # applyForTuition(payload), checkStudentApplication(tuitionId, email)
      userApi.ts                # fetchCurrentUserProfile(), updateUserProfile(payload: tUserEdit)
      paymentApi.ts             # checkoutVerify(sessionId, signal?) → POST /payments/checkout-verify
      savedTuitionApi.ts        # fetchSavedTuitionIds(), fetchSavedTuitions(), toggleSavedTuition(tuitionId)
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
- **Exists today:** `/`, `/signin`, `/signup`, `/api/auth/*`, `/tuitions`, `/tuitions/[id]`, `/payment`, `/checkout/success`, `/dashboard` (+ all role pages below). `/checkout` is a legacy redirect to `/checkout/success`.
- **Payments:** `/payment` is a server component (reads `getSession()`); it shows a sign-in prompt when signed out, an "already Pro" card when `plan === "pro"`, a not-available card for admins, and otherwise the role-based Pro card (tutor $15 / student $10) whose `<form action="/api/checkout_sessions" method="POST">` starts Stripe Checkout. `POST /api/checkout_sessions` selects `STRIPE_PRICE_TUTOR_PRO` / `STRIPE_PRICE_STUDENT_PRO`, attaches `metadata { userId, role, plan: "pro" }`, redirects to Stripe, and on failure redirects to `/payment?error=signin_required|already_pro|invalid_role|price_missing|checkout_failed` (cancel → `/payment?canceled=1`). Stripe returns to `/checkout/success?session_id=…`, where the client `CheckoutSuccess` calls `checkoutVerify()` (loading → success/error), `router.refresh()`, then redirects to `roleHome[role]` after 2.5 s. The server-side webhook is the second path, so closing the browser still activates Pro.
- **`/dashboard` routes (all guarded by `requireDashboardUser`):** `/dashboard` redirects to the role home; any role: `/dashboard/profile` (view/edit own profile — no role gate); `student`: `/dashboard/student`, `/dashboard/student/my-applications`; `tutor`: `/dashboard/tutor`, `/dashboard/tutor/post-tuition`, `/dashboard/tutor/my-tuitions`, `/dashboard/tutor/applicants`; `admin`: `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/tuitions`, `/dashboard/admin/transactions`. Wrong role → 307 to that user's role home; no session → 307 to `/signin`.
- **`/tuitions` (public, route group `(root)` — no guard):** search/filter/sort state lives in the **URL query params** (`search`, `subject`, `classLevel`, `mode`, `sort`) so refresh/share/back-forward all reproduce the same view. `page.tsx` is a thin server component (metadata + `Suspense` boundary — required for `useSearchParams`) around the client `BrowseTuitions.tsx`, which reads params with `useSearchParams`, writes them via `router.replace(..., { scroll: false })` (search input debounced 300 ms into the URL; `ALL_OPTION`/"Clear" just remove params; default `sort=newest` is never written), and re-fetches whenever params change (stale requests cancelled with `AbortController`). Params go to `fetchApprovedTuitions()` → `GET /api/tuitions`, where MongoDB filters + sorts. `/tuitions/[id]` renders details server-side (`notFound()` on 404) and resolves the apply flow client-side via `useSession()` (signed out → link to `/signin`; tutor/admin → notice; student → already-applied check + Dialog form).
- **Linked but not built yet (will 404):** `/tutors`, `/batches`, `/become-tutor`, `/pricing`, `/dashboard/enrollments`, `/forgot-password`. Create the page before linking to a new route.

## Frontend API service layer (`src/lib/api/`)

- **Rule: never scatter raw `fetch` inside UI components.** Import an async function from the service layer and `await` it instead.
- `tuitionApi.ts` — `fetchApprovedTuitions(queryString?, signal?)` (`GET /api/tuitions`, e.g. `"search=phys&mode=Online&sort=fee_asc"`; the optional `AbortSignal` lets the browse page cancel stale requests when params change; every item includes the populated `tutor` summary with `image` for the card avatar), `fetchTuitionById(id)` (`GET /api/tuitions/:id`, throws `ApiError(404)` → page calls `notFound()`).
- `applicationApi.ts` — `applyForTuition(payload)` (`POST /api/applications`; payload keys: `tuitionId, studentEmail, studentName, phone, preferredSchedule, note`), `checkStudentApplication(tuitionId, email)` (`GET /api/applications/check` → `{ hasApplied }`).
- `userApi.ts` — `fetchCurrentUserProfile()` (`GET /api/profile` → `tUserProfile`, the `tUserEdit` fields plus `_id/role/plan/createdAt`; phone/bio aren't in the session so the profile form loads them here), `updateUserProfile(payload: tUserEdit)` (`PATCH /api/profile` → updated profile; backend whitelists the 5 editable fields — `role`/`plan` in the body are ignored). Type `tUserProfile = tUserEdit & { _id, role, plan, createdAt }`.
- `paymentApi.ts` — `checkoutVerify(sessionId, signal?)` (`POST /payments/checkout-verify`) → `{ success, duplicate, plan: "pro", role, message }`; throws `ApiError` (400 incomplete/unpaid session, 404 unknown session, 500 Stripe not configured).
- `client.ts` — `apiFetch<T>()` (shared fetch wrapper: `API_URL`, `credentials: "include"`, **`Authorization: Bearer <JWT>`** via `getJwt()`, one refresh-and-retry on `401`, JSON handling, throws `ApiError` with `.status`), `ApiError`, `API_URL`.
- `jwt.ts` — the Better Auth → Express bridge: `getJwt()` calls `GET /api/auth/token` (signed session cookie required) and caches the JWT in memory (refreshed 30 s before `exp`, 15 s negative cache while signed out, shared inflight promise; always `null` during SSR so public server-side fetches just skip the header). `clearJwtCache()` runs on sign-in/sign-up/sign-out (`signin/signup` pages, `NavbarClient`, `DashboardShell`) and before every 401 retry.
- `index.ts` is a barrel, so the legacy import path `@/lib/api` keeps working for `apiFetch`/`ApiError` (used by `useApi` and dashboard components).
- Handle errors by status: `409` from `applyForTuition` = already applied (flip UI to the "Already Applied" state), `403` = not a student, `400` = validation — show `error.message` (it is the backend `{ message }`).

## mentor-server REST API (single-file `index.js`)

All backend logic lives in **`../mentor-server/index.js`** (Express + native MongoDB driver, database `MentorLagbeDb`; auth collections are singular: `user`, `session`, `account`, `verification`, plus `jwks` for the signing keys; business collections plural: `tuitions`, `applications`, `payments`). **Routes are registered directly on `app`** (`app.get("/api/tuitions", ...)`, `app.patch("/api/profile", verifyToken, ...)`) — there is no `express.Router()` and no mount step; the file reads top-to-bottom as: setup → auth middleware → dashboard stats → tuitions → applications → profile → admin → 404/error fallbacks → `app.listen`. Keep route paths fully qualified and preserve registration order (literal paths like `/api/tuitions/tutor` before `/api/tuitions/:id`). Start with `node index.js` (port 5000). Regression suites (both need **Next.js on :3000 and Express on :5000 running**): `node scripts/smoke.mjs` (66 checks, must stay green — it mints real JWTs through `GET :3000/api/auth/token`) and `node scripts/e2e-bearer.mjs` (14 checks: real sign-up → JWT claims → user resync → DB-authoritative roles; self-cleaning).

**Public (no session required):**

- `GET /api/tuitions` — approved + active listings. Optional query params: `search` (case-insensitive regex over `title`/`subject`, escaped), `subject`, `classLevel`, `mode`, `limit` (1–100, e.g. the home page's `limit=6`; capped server-side), `sort` (`newest` | `oldest` | `fee_asc` | `fee_desc`; unknown value → newest; applied inside the DB query). Every item carries a populated `tutor` summary (`name`, `email`, `image`, `bio`, `plan` — one bulk `user` lookup via the shared `tutorSummary()` helper, same shape as `GET /api/tuitions/:id`) so the browse cards render the tutor avatar. `components/home/FeaturedTuitions.tsx` calls this client-side with `limit=6` and renders loading/empty states; the database currently holds 20 approved listings for the demo tutor `gozatea@indo.com`.
- `GET /api/tuitions/:id` — single tuition + populated `tutor` summary (`name`, `email`, `image`, `bio`, `plan` from the `user` collection). Invalid/unknown id → `404`.
- `POST /api/applications` — body `tuitionId, studentEmail, studentName, phone, preferredSchedule, note` → `201`; missing field → `400 "Please fill in: ..."`; applicant not `role: student` in `user` → `403 "Only students can apply for tuitions."`; duplicate (`tuitionId` + `studentEmail`) → `409 "You have already applied for this tuition."`. Stores `studentPhone`/`studentNote`, `status: "pending"`, `appliedAt`/`createdAt`.
- `GET /api/applications/check?tuitionId=&email=` — → `{ hasApplied: boolean }` (`400` when a param is missing).

**Bearer-JWT-guarded (`Authorization: Bearer <JWT>` from Better Auth, role enforced):** `POST|GET|PATCH|DELETE /api/tuitions` (owner-or-admin edits; `GET /api/tuitions/tutor`), `GET|PATCH|DELETE /api/applications` (`/student`, `/tutor`, `/:id/status`), `/api/dashboard/{student,tutor,admin}/stats`, `/api/admin/*` (users, tuitions, transactions). **`GET|PATCH /api/profile`** — any authenticated role (no role gate): reads/updates only the caller's own `user` doc (identity from `req.user.id`), PATCH whitelists `name, email, image, phone, bio`, changed email is checked case-insensitively against other accounts (`409` on clash), missing name/email → `400`, returns `{ _id, name, email, image, phone, bio, role, plan, createdAt }`.

**Saved tuitions (students only):** dedicated `saveduitions` collection with `student`/`tuition` `ObjectId`s, `createdAt`/`updatedAt`, and a unique compound index `{ student: 1, tuition: 1 }` created at boot. `GET /api/saved-tuitions/ids` → `{ savedIds: string[] }` for active bookmark state; `GET /api/saved-tuitions` → saved tuition views (same shape as `GET /api/tuitions`, plus `savedAt`), newest-first, deleted-tuition refs filtered out; `POST /api/saved-tuitions/toggle` `{ tuitionId }` → `{ saved: boolean, _id? }` (404 unknown tuition, 400 invalid id). Identity always comes from `req.user.id`; deleting a tuition also removes its bookmarks. The client shares IDs via `SavedTuitionsProvider` (root layout) and renders `BookmarkButton` on cards/details.

**Payments / Stripe (public, no Bearer JWT):**

- `POST /payments/checkout-verify` — body `{ sessionId }`. Retrieves the Checkout Session from Stripe (server-side truth), requires `status === "complete"` + `payment_status === "paid"`, validates `metadata.userId` as a MongoDB `ObjectId`, then runs the shared `syncProPlan()`. Errors are JSON: `400` missing `sessionId` / incomplete session / invalid userId / non-student-tutor role, `404` unknown session (`resource_missing`) or deleted user, `500` missing `STRIPE_SECRET_KEY`. Success: `{ success: true, duplicate, plan: "pro", role, message }`.
- `POST /payments/webhook` — Stripe webhook registered **before** `express.json()` (raw-body signature verification with `express.raw({ type: "application/json" })` + `stripe.webhooks.constructEvent`). Handles `checkout.session.completed` and `checkout.session.async_payment_succeeded`; unsigned/invalid → `400`, non-2xx makes Stripe retry. Also calls `syncProPlan()`, so Pro activates even if the browser never returns to `success_url`.
- `syncProPlan(session)` — the single write path shared by both routes. Upserts into `payments` keyed by `stripeSessionId` (`$setOnInsert`, unique partial index `uniq_stripeSessionId` created at boot) → replay = `duplicate: true`, never a second record; then always `$set: { plan: "pro", updatedAt }` on the user. `payments` doc: `userId, userName, userEmail, userRole, planName: "pro", amount` (**major units**, `amount_total / 100`), `currency`, `transactionId` (PaymentIntent id), `stripeSessionId`, `paymentStatus: "paid"`, `paidAt`, `createdAt`.
- `getStripe()` is lazy: the API boots without Stripe env (smoke/e2e) and only Stripe routes return a clear `500 "STRIPE_SECRET_KEY is not configured."`.

**Middleware chain:** `verifyToken` (jose `jwtVerify` against the remote JWKS → sync/create the `user` doc → attach `req.user`; `401` missing/invalid/expired/wrong-issuer token, `503` JWKS unreachable) then a role gate — `verifyStudent` (`student`|`admin`), `verifyTutor` (`tutor`|`admin`), `verifyAdmin` (`admin`); admin passes every gate. The **database is authoritative for `role`/`plan`**: an existing user's values are never overwritten from token claims, so an admin role change applies even while the old JWT (15 min TTL) is still in flight. Config lives in `mentor-server/.env`: `JWT_ISSUER` (Better Auth origin, default `http://localhost:3000`), `JWT_AUDIENCE` (this API, default `http://localhost:5000`), `JWKS_URL` (`<issuer>/api/auth/jwks`) — must match the `jwt({ ... })` options in `src/lib/auth.ts`.

## Dashboard data flow (client → mentor-server)

- Pages are thin async server wrappers (guard) around colocated `"use client"` components in `_components/`.
- Client components read data with `useApi<T>(path)` and mutate with `apiFetch(path, opts)`; both hit `NEXT_PUBLIC_API_URL` (the Express backend, `http://localhost:5000`) with `credentials: "include"` **and** `Authorization: Bearer <JWT>` (fetched lazily from `GET /api/auth/token`, cached in `src/lib/api/jwt.ts`). CORS on the server allows `CLIENT_ORIGINS` (localhost:3000/5173) with credentials; the `Authorization` header rides along in the preflight automatically.
- The backend **does not read cookies**: `verifyToken` verifies the Bearer JWT against Better Auth's JWKS (`GET :3000/api/auth/jwks`), syncs/creates the `user` document in `MentorLagbeDb` (DB wins for `role`/`plan`), attaches `req.user`, then the role gate runs per route (`verifyStudent`/`verifyTutor`/`verifyAdmin`; admin passes everything).
- **Do not add a `loading.tsx` under `(dashboard)`** — a streamed shell makes the page-level `redirect()` (role guard) fall back to a client-side meta-refresh (200) instead of a proper 307. Loading/empty/error states are handled inside the client components via `useApi`.

## Auth architecture (better-auth)

- **Server config** — `src/lib/auth.ts`: `emailAndPassword` enabled, Google social provider, Mongo adapter. Additional user fields: `role` (`student` | `tutor` | `admin`, default `student`), `phone` (string), `bio` (string), `plan` (`free` | `pro`, default `free`). It also throws a clear error when `DB_URI` is missing, logs a non-blocking `[auth] MongoDB connected` on boot and lists `trustedOrigins` (`BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `localhost:5173`).
- **JWT plugin (the Express bridge)** — same file registers `jwt({ jwt: { issuer, audience, expirationTime: "15m" } })` from `better-auth/plugins/jwt`. Endpoints: `GET /api/auth/jwks` (signing keys, auto-generated into the `jwks` collection) and `GET /api/auth/token` → `{ token }` (requires the signed session cookie; this is what `src/lib/api/jwt.ts` calls). `issuer` = `BETTER_AUTH_URL` (`http://localhost:3000`), `audience` = `NEXT_PUBLIC_API_URL` (`http://localhost:5000`) — mentor-server mirrors them as `JWT_ISSUER`/`JWT_AUDIENCE`/`JWKS_URL`; **all three must stay in sync across the two `.env` files.** The browser never gets the signing key: it only holds the 15-minute JWT, and Express verifies it via JWKS.
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

- Defined: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DB_URI`, `NEXT_PUBLIC_API_URL` (mentor-server base URL — also the JWT `audience`), `NEXT_PUBLIC_APP_URL` (public app URL — auth client `baseURL` + trusted origin), `NEXT_PUBLIC_IMGBB_API_KEY` (ImgBB banner uploads), `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Stripe), `STRIPE_PRICE_TUTOR_PRO` + `STRIPE_PRICE_STUDENT_PRO` (Pro Price IDs; blank until copied from the Stripe Dashboard)
- `../mentor-server/.env` defines: `PORT`, `DB_URI`, `BETTER_AUTH_SECRET` (**must equal the client's** — the smoke suite signs better-auth session cookies with it to mint JWTs), `JWT_ISSUER` (= `BETTER_AUTH_URL`), `JWT_AUDIENCE` (= `NEXT_PUBLIC_API_URL`), `JWKS_URL` (= `<issuer>/api/auth/jwks`), `STRIPE_SECRET_KEY` (server-side secret), `STRIPE_WEBHOOK_SECRET` (`stripe listen` signing secret / Dashboard endpoint), optional `CLIENT_ORIGINS`
- Referenced but **missing** from `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (used in `src/lib/auth.ts`; Google sign-in is disabled until they're added — better-auth logs a warning, harmless)

## Conventions & gotchas

- Default to Server Components; add `"use client"` only when you need state, effects, or browser APIs.
- Code comments in this repo are written in Bengali — that's expected; agent-facing docs (this file) stay in English.
- The logo lives at `public/logo.png` and is referenced as `/logo.png` — keep the casing exact (it breaks on case-sensitive hosts like Linux/Vercel).
- shadcn components: add with `npx shadcn add <component>`; compose classes with `cn()` from `@/lib/utils`.
- `next.config.ts` wires Tailwind v4 through a Turbopack loader rule for `*.css` and sets `reactCompiler: true` — don't remove either.
- Keep the managed Next.js block at the top of this file intact: `next dev` rewrites it, and committing it with your work keeps the tree clean.
