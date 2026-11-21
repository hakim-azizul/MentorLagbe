# MentorLagbe

> **Find the right mentor. Teach with confidence. Grow on a platform built for real tuition workflows.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js / Express](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7.25-00D66C)](https://www.better-auth.com/)
[![Stripe](https://img.shields.io/badge/Stripe-23.x-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)

**Live Demo:** _add deployment link_ · **Portfolio:** _add portfolio link_ · **Author:** Azizul Hakim ([@hakim-azizul](https://github.com/hakim-azizul))

---

## The problem

Tuition marketplaces usually break in the same places: anyone can post anything, students can't trust who they're contacting, and payment/upgrade logic rarely survives a browser refresh. MentorLagbe is built around the boring-but-critical parts of a real marketplace:

- **Unmoderated listings** → every tuition post starts as `pending` and goes through an admin approval queue before it is publicly visible.
- **Unverified contact flow** → a student can only apply with a valid phone number on their profile (≥ 8 characters), and tutors see that phone alongside the applicant's email.
- **Freemium without enforcement** → free tutors get 2 posts, free students get 5 bookmarks; Pro is unlimited, paid through Stripe and activated by both Checkout verification **and** a signed webhook.
- **Fragile UI state** → filters, pagination, theme and session state survive refreshes and deep links instead of silently resetting.

## The solution

A two-app full-stack system:

- **`mentor-client/`** — Next.js 16 App Router frontend (public site, auth, dashboards, payments UI).
- **`mentor-server/`** — one Express 5 file (`index.js`) exposing the REST API, JWT verification and Stripe integration against MongoDB (`MentorLagbeDb`).

---

## Key features & role workflows

| Role | What they can do | Limits / rules |
| --- | --- | --- |
| **Student** | Browse & filter approved tuitions, open details, save bookmarks, apply with a preferred schedule + note, manage applications, edit profile, upgrade to Pro | Free: **5 saved tuitions**; Pro: **unlimited**. Applying requires a profile phone of **≥ 8 chars**. Duplicate applications are rejected with `409`. |
| **Tutor** | Post tuitions, edit/pause/delete own posts, review applicants, accept/reject, view applicant **email + phone**, upgrade to Pro | Free: **2 tuition posts** (server-enforced); Pro: **unlimited**. New posts are `pending` + `isActive: true`. |
| **Admin** | Review/approve or reject tuitions, manage user roles, view all tuitions, users and payment transactions | Admin passes every role gate; can read any scoped resource. |

Shared platform features:

- Public catalogue with search, subject/class/mode filters, sorting and **12-per-page pagination**.
- Dedicated bookmark collection with optimistic UI and duplicate-safe writes.
- Stripe Checkout + webhook with idempotent Pro activation; `plan: "pro"` on the user document (no `premium` field).
- Light/Dark mode, accessible toasts, skeleton loaders and empty/error states across all views.
- Route-level SEO metadata, including dynamic `generateMetadata()` for tuition detail pages.

---

## Engineering highlights

- **Defense in depth** — `verifyToken` validates a 15-minute Better Auth JWT against the remote JWKS (`jose`), syncs the user into MongoDB and attaches `req.user`; role gates (`verifyStudent`, `verifyTutor`, `verifyAdmin`) run after it. The **database is authoritative for `role`/`plan`**, so an admin change applies even while an old JWT is alive. All IDs are `ObjectId`-validated; duplicate writes are prevented at the database layer.
- **Dedicated bookmark model** — `saveduitions` collection with `{ student, tuition }` ObjectIds and the unique compound index **`uniq_saved_student_tuition`**. The 5-bookmark Free cap is enforced in `POST /api/saved-tuitions/toggle` from the caller's plan; deleting a tuition also removes its bookmarks.
- **Idempotent Stripe sync** — `syncProPlan()` is the single write path for both `POST /payments/checkout-verify` and `POST /payments/webhook`. The webhook is registered **before `express.json()`** so the raw body can be signature-verified with `stripe.webhooks.constructEvent`. Payments are upserted under a unique `stripeSessionId` index (`uniq_stripeSessionId`), so replays never create a second record.
- **Backwards-compatible pagination** — `GET /api/tuitions` accepts `page` (default 1) and `limit` (default 12, max 50). The body stays an array for existing consumers; `?meta=1` returns `{ items, page, limit, totalItems, totalPages, hasNextPage, hasPrevPage }`, and the same metadata is always exposed through CORS-readable `X-*` headers. The client keeps `page` in the URL, resets it to 1 on filter changes and cancels stale requests.
- **Auth bridge without cookies on the API** — the browser keeps the Better Auth session cookie (Next.js); the client's `getJwt()` calls `GET /api/auth/token` and sends `Authorization: Bearer <jwt>` to Express, with one refresh-and-retry on `401`.
- **Next.js 16 conventions** — React Compiler + Turbopack, Server Components by default, thin async server wrappers around client `_components/` views, `Suspense` for `useSearchParams`, and route-level `metadata` / `generateMetadata()` with the `%s | MentorLagbe` template. No `loading.tsx` under `(dashboard)` so role-guard `redirect()` keeps returning proper 307s.
- **Design system** — Tailwind v4 CSS-first tokens in `globals.css`, 60/30/10 palette, full `.dark` token set, pre-hydration theme script in the root layout, `localStorage` persistence, and semantic toast variants (`success`, `error`/`destructive`, `warning`, `info`, `default`) styled for both themes.
- **Test harness** — `mentor-server/scripts/smoke.mjs` (66 API checks) and `e2e-bearer.mjs` (14 auth/role checks), plus `cleanup.mjs` for test fixtures. Both suites require Next on `:3000` and Express on `:5000`.

---

## Project structure

```
MentorLagbe/
├── mentor-client/                 Next.js 16 frontend (port 3000)
│   ├── src/app/
│   │   ├── layout.tsx             root metadata, theme script, providers, Toaster
│   │   ├── globals.css            Tailwind v4 @theme + .dark tokens
│   │   ├── (root)/                public pages: home, /signin, /signup,
│   │   │                          /tuitions, /tuitions/[id], /pricing,
│   │   │                          /payment, /checkout/success
│   │   └── (dashboard)/dashboard/ guarded role pages + profile
│   ├── src/components/            ui/, shared/, home/, dashboard/
│   ├── src/lib/                   api/ service layer, auth, core guards, types
│   ├── src/config/                dashboardRoutes.ts
│   └── src/hooks/                 useApi.ts
└── mentor-server/                 Express 5 API (port 5000)
    ├── index.js                   all routes, middleware, indexes, bootstrap
    └── scripts/                   smoke.mjs, e2e-bearer.mjs, cleanup.mjs
```

MongoDB collections: `user`, `session`, `account`, `verification`, `jwks` (Better Auth) and `tuitions`, `applications`, `payments`, `saveduitions` (business data).

---

## REST API overview

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | public | server health string |
| `GET` | `/api/tuitions` | public | approved + active listings with filters, sort and pagination (`?meta=1`) |
| `GET` | `/api/tuitions/:id` | public | tuition detail + tutor summary |
| `POST` | `/api/tuitions` | tutor | create a `pending` tuition (Free cap: 2) |
| `GET` | `/api/tuitions/tutor` | tutor | own posts |
| `PATCH` / `DELETE` | `/api/tuitions/:id` | tutor/admin | edit, toggle `isActive`, delete |
| `GET` | `/api/applications/check` | public | `{ hasApplied }` for a tuition/email |
| `POST` | `/api/applications` | public (student role + phone checked) | submit an application |
| `GET` | `/api/applications/student` | student | my applications |
| `GET` | `/api/applications/tutor` | tutor | applicants (includes phone) |
| `PATCH` | `/api/applications/:id/status` | tutor/admin | accept / reject |
| `DELETE` | `/api/applications/:id` | student | cancel a pending application |
| `GET` | `/api/saved-tuitions/ids` | student | bookmarked ids for active UI state |
| `GET` | `/api/saved-tuitions` | student | bookmarked tuition views, newest first |
| `POST` | `/api/saved-tuitions/toggle` | student | save/unsave (Free cap: 5) |
| `GET` / `PATCH` | `/api/profile` | authenticated | read/update own profile (phone, bio, image…) |
| `GET` | `/api/dashboard/{student,tutor,admin}/stats` | role | dashboard counters |
| `GET` | `/api/admin/users` | admin | all accounts |
| `PATCH` | `/api/admin/users/:id/role` | admin | change a user role |
| `GET` | `/api/admin/tuitions` | admin | all posts for moderation |
| `PATCH` | `/api/admin/tuitions/:id/approval` | admin | approve / reject |
| `GET` | `/api/admin/transactions` | admin | payment records |
| `POST` | `/payments/checkout-verify` | public | verify Stripe Checkout session + activate Pro |
| `POST` | `/payments/webhook` | Stripe | signed webhook → idempotent Pro sync |

---

## Local setup

### Prerequisites

- Node.js 20+ and npm
- MongoDB (local or Atlas); database name used by the API is `MentorLagbeDb`
- Stripe CLI for local webhook testing (optional until you test payments)

### 1. Install dependencies

```bash
cd mentor-client && npm install
cd ../mentor-server && npm install
```

### 2. Environment variables

Both apps use a local `.env` file. **Never commit real values.** The exact keys in use are listed below.

`mentor-client/.env`

```dotenv
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
DB_URI=
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_IMGBB_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_TUTOR_PRO=
STRIPE_PRICE_STUDENT_PRO=
```

`mentor-server/.env`

```dotenv
PORT=5000
DB_URI=
BETTER_AUTH_SECRET=
JWT_ISSUER=http://localhost:3000
JWT_AUDIENCE=http://localhost:5000
JWKS_URL=http://localhost:3000/api/auth/jwks
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLIENT_ORIGINS=http://localhost:3000
```

Notes:

- `BETTER_AUTH_SECRET` and `DB_URI` must match in both files.
- `JWT_ISSUER` = client `BETTER_AUTH_URL`, `JWT_AUDIENCE` = client `NEXT_PUBLIC_API_URL`, `JWKS_URL` = `<BETTER_AUTH_URL>/api/auth/jwks`.
- `NEXT_PUBLIC_API_URL` is also the JWT audience and is the base URL for every frontend API call.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are referenced in `src/lib/auth.ts` but not present in `.env`; Google sign-in stays disabled until they are added (harmless warning).
- Create two Stripe one-time prices ($15 tutor / $10 student) and set `STRIPE_PRICE_TUTOR_PRO` / `STRIPE_PRICE_STUDENT_PRO`.

### 3. Run both apps

```bash
# terminal 1 — API
cd mentor-server
npm run dev          # node --watch index.js → http://localhost:5000

# terminal 2 — frontend
cd mentor-client
npm run dev          # next dev → http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint` (client); `npm start` (server).

### 4. Stripe webhook (local)

```bash
stripe login
stripe listen --forward-to localhost:5000/payments/webhook
# copy the printed whsec_... into mentor-server/.env as STRIPE_WEBHOOK_SECRET, then restart the API
```

Pay with `4242 4242 4242 4242`. Pro activation is written by both the success-page verification and the webhook, so closing the browser still completes the upgrade.

### 5. Verify

```bash
cd mentor-client
npx tsc --noEmit
npm run lint
npm run build

cd ../mentor-server
node --check index.js

# with both servers running:
node scripts/smoke.mjs        # 66 checks
node scripts/e2e-bearer.mjs   # 14 checks
node scripts/cleanup.mjs      # optional fixture cleanup
```

The smoke suite mints real JWTs through `GET :3000/api/auth/token` and assumes clean fixture data (it uses a dedicated demo student/tutor) — run `cleanup.mjs` if exact-count checks drift after manual testing.

---

## Author

**Azizul Hakim** — [@hakim-azizul](https://github.com/hakim-azizul)

Built as a production-style full-stack mentorship marketplace: role-based workflows, moderated content, reliable payments and a polished, theme-aware UI.
