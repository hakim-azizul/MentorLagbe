<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MentorLagbe (mentor-client) — Agent Guide

Frontend for **MentorLagbe**, a tuition & mentorship platform. This repo is the Next.js client app; the server side is the same app (App Router server components + route handlers + better-auth). There is no separate backend folder.

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
  components/
    ui/                         # shadcn components: button, input, avatar, dropdown-menu
    shared/                     # Navbar.tsx (server), NavbarClient.tsx (client), Footer.tsx
    home/                       # HeroBanner, FeaturedTuitions, PricingSection, HowItWorks, PlatformStatsAndSubjects
  lib/
    auth.ts                     # server better-auth config
    auth-client.ts              # createAuthClient → { authClient, signIn, signUp, useSession }
    core/serverUser.ts          # getSession() — server-only session lookup
    uploadImage.ts              # ImgBB upload helper
    types/                      # tUser, tTuition, tApplication, Payment, ...
    utils.ts                    # re-exports cn()
public/                         # static assets (logo.png)
```

## Routing — canonical auth URLs

- Sign in is **`/signin`**, sign up is **`/signup`**. Never link to `/login`, `/sign-up`, or `/register` (legacy dead links, all removed).
- **Exists today:** `/`, `/signin`, `/signup`, `/api/auth/*`
- **Linked but not built yet (will 404):** `/tuitions`, `/tutors`, `/batches`, `/become-tutor`, `/pricing`, `/dashboard` (+ `/dashboard/profile`, `/dashboard/enrollments`), `/forgot-password`. Create the page before linking to a new route.

## Auth architecture (better-auth)

- **Server config** — `src/lib/auth.ts`: `emailAndPassword` enabled, Google social provider, Mongo adapter. Additional user fields: `role` (`student` | `tutor` | `admin`, default `student`), `phone` (string), `bio` (string), `plan` (`free` | `pro`, default `free`).
- **HTTP handler** — `src/app/api/auth/[...all]/route.ts` exports `GET`/`POST`.
- **Client** — `src/lib/auth-client.ts`: `createAuthClient` + `inferAdditionalFields`. Use `signIn.email({...})`, `signUp.email({...})` (both accept `callbackURL`), `authClient.signOut()`, `useSession()`.
- **Never import API functions from `better-auth/api` inside client components** — those are server endpoints requiring a request context; calling them in the browser throws and the operation silently fails (this broke logout once already).
- **Server session** — `getSession()` from `@/lib/core/serverUser.ts` (reads `headers()`; server-only, marked `"use server"`).
- **Navbar pattern (canonical for session-aware UI):** `Navbar.tsx` is an `async` Server Component that awaits `getSession()` and passes the plain `user` object as props into the `"use client"` `NavbarClient.tsx`. Follow the same shape elsewhere: fetch on the server, pass serializable props to a client component. After sign-in/sign-up/sign-out, call `router.refresh()` so server-rendered UI picks up the new session.

## Design tokens (`@theme` in `src/app/globals.css`)

60/30/10 color principle — use these Tailwind classes, not raw hex values:

- **60% base:** `background` (#FFFFFF), `surface` (#F8FAFC)
- **30% secondary:** `heading` (#0F172A), `body` (#475569), `border-subtle` (#E2E8F0)
- **10% accent:** `brand` (#00D66C), `brand-hover` (#00B85C), `brand-tint` (#ECFDF5)

Examples: `bg-background`, `text-heading`, `text-body`, `border-border-subtle`, `bg-brand`, `bg-brand-tint`, `hover:bg-brand-hover`.

## Environment variables (`.env` — names only, never commit values)

- Defined: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DB_URI`
- Referenced but **missing** from `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (used in `src/lib/auth.ts`), `NEXT_PUBLIC_IMGBB_API_KEY` (used in `src/lib/uploadImage.ts`)

## Conventions & gotchas

- Default to Server Components; add `"use client"` only when you need state, effects, or browser APIs.
- Code comments in this repo are written in Bengali — that's expected; agent-facing docs (this file) stay in English.
- The logo lives at `public/logo.png` and is referenced as `/logo.png` — keep the casing exact (it breaks on case-sensitive hosts like Linux/Vercel).
- shadcn components: add with `npx shadcn add <component>`; compose classes with `cn()` from `@/lib/utils`.
- `next.config.ts` wires Tailwind v4 through a Turbopack loader rule for `*.css` and sets `reactCompiler: true` — don't remove either.
- Keep the managed Next.js block at the top of this file intact: `next dev` rewrites it, and committing it with your work keeps the tree clean.
