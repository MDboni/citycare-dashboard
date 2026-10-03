# CityCare — staff console

The internal half of CityCare: where officers work their queue and
administrators run the city's taxonomy, people, money and oversight.

Residents never work here. They use the [resident app][site], a separate Next.js
app against the same API, and each app signs in only the roles it owns.

| | |
|---|---|
| Live | https://citycare-dashboard.vercel.app |
| Resident app | https://citycare-frontend.vercel.app |
| API | https://citycare-backend6.vercel.app |
| API docs | https://citycare-backend6.vercel.app/api/v1/docs |

## Signing in to look around

The sign-in page carries a **Demo login** button for each staff role, no typing
needed. The same accounts by hand:

```
admin@citycare.com    / Admin@12345      administrator (super admin)
officer1@citycare.com / Officer@12345    officer
```

A citizen account is turned away here with a message, not a session.

## What the two roles see

The console is one app with two faces. Navigation, pages and actions are built
from the signed-in user's role and permissions, so an officer is never shown a
door that would close in their face.

**Officer** — their own ward queue, complaint detail with status transitions and
internal notes, service requests assigned to them, and their own account.

**Administrator** — everything above, plus:

- **Overview**: open complaints, SLA breaches, average resolution, registered
  users, fees collected today and this month, with breakdowns by status,
  priority, category and ward
- **People**: residents and staff, role changes, blocking, forced sign-out
- **Money**: the full payment ledger with filters, totals, CSV export and a
  receipt download per transaction
- **Taxonomy**: departments, categories, wards, zones and service types, each
  with its own fee and SLA
- **Oversight**: audit log, security events, contact messages, SLA report
- **Settings**: system thresholds, and roles and permissions under Access

A super admin is an administrator with the extra right to manage other
administrators and to read everybody's audit trail rather than only their own.

## How it is built

**Next.js 16 App Router, React 19, TypeScript.** Server Components are the
default; `"use client"` appears only where the browser is genuinely needed.
Route-level `loading.tsx` skeletons and `error.tsx` boundaries throughout.

**`proxy.ts`** (Next 16's renamed middleware) gates every console route on the
session cookie and redirects to `/login?next=…`.

**Two layers of authorization, never one.** `role-gate.tsx` and
`permission-gate.tsx` decide what renders, and the API independently enforces the
same rules — the UI hides what you cannot do, it does not decide what you may do.

**State.** TanStack Query owns server data: caching, invalidation, loading and
error states. Redux Toolkit holds client-only UI state. List filters and paging
live in the URL via `useSearchParams`.

**Forms.** React Hook Form with Zod resolvers, mirroring the API's validation.

**Auth.** Access and refresh tokens with a single-flight refresh, so a burst of
401s produces one refresh rather than a reuse the API would read as theft. Staff
accounts carry two-factor by default. When the profile cannot be loaded at all,
the header says so and still offers Sign out — a console you cannot leave is
worse than one that is empty.

**UI.** Tailwind CSS v4, Base UI primitives, Recharts for the overview, dark mode
included. Wide tables scroll horizontally inside their card rather than pushing
the page sideways.

## Running it

Needs the API on `http://localhost:5000` — see the [backend repo][api]. This app
runs on port **3001** so it can sit beside the resident app on 3000.

```bash
npm install
cp .env.example .env     # then fill it in
npm run dev              # http://localhost:3001
```

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | API root including `/api/v1` |
| `NEXT_PUBLIC_APP_URL` | this app's own origin |
| `NEXT_PUBLIC_DEMO_LOGINS` | set to `off` to hide the demo panel and keep its credentials out of the bundle |

Anything named `NEXT_PUBLIC_*` is compiled into the JavaScript and readable by
anyone who opens the page. No secret belongs in this file.

```bash
npm run build   # production build
npm run lint    # Biome
npm run format  # Biome, writing fixes
```

## Layout

```
app/
  (console)/      every signed-in route, under one layout with sidebar and header
  login/          sign-in and the two-factor step
api-client/       one module per API resource; nothing else calls fetch
components/       layout, shared widgets, gates, UI primitives
hooks/            TanStack Query hooks, one per resource
lib/              api client, session, formatting, validation helpers
providers/        auth, query client, theme
routes/           every internal href, so a typo is a build error not a 404
proxy.ts          route protection
```

[site]: https://github.com/MDboni/citycare-frontend
[api]: https://github.com/MDboni/citycare-backend6
