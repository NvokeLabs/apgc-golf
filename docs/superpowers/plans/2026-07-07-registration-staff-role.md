# Restricted "Registration Staff" Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a restricted admin account (`pendaftaran@polinemagolf.com`) that can ONLY open/view tickets, verify payments (manual bank-transfer approve/reject), and scan tickets (check-in). Everything else is hidden from it. Existing admins keep full, unchanged access.

**Architecture:** A single nullable `role` select on the `Users` collection (`saveToJWT: true`, so the role rides the auth JWT and is available client-side). A single pure helper `isRegistrationStaff(user)` drives every gate under a **default-allow / explicit-deny** posture: the only restricted identity is a user whose role is exactly `registration-staff`; admins, null-role, and undefined users keep full access. Enforcement is "just hide the tools": the custom Nav filters to a 3-item whitelist, the check-in route gains auth, the dashboard API denies staff (403), and every collection except `tickets` and `event-registrations` hides itself from staff in the admin UI. The `Users` collection is the **sole data-layer lockdown** (staff cannot create/update/delete users and can read only their own record), which also blocks self-promotion.

**Tech Stack:** Payload CMS 3.64, Next.js 15.4 App Router, React 19, PostgreSQL (Supabase), TypeScript, Vitest, bun.

## Global Constraints

- **Role model:** a `role` select on `Users` with options `admin` (label "Administrator") and `registration-staff` (label "Petugas Pendaftaran"). `defaultValue: 'admin'`, `saveToJWT: true`.
- **The `role` DB column is NULLABLE — NOT a `required` field.** A `NOT NULL` alter would fail on existing rows and break dev auto-push, the same rationale as the alumni/tshirt columns. Existing production rows are backfilled to `'admin'` (see Post-implementation).
- **Enforcement posture is default-allow / explicit-deny.** The only restricted identity is `isRegistrationStaff(user) === true` (role exactly `registration-staff`). Everyone else — admins, null role, new/undefined users — keeps full access. This is safe against a missed backfill (no existing admin can be locked out).
- **The single pure helper drives every gate** (copied verbatim from the design):
  ```ts
  // src/access/roles.ts
  export const isRegistrationStaff = (user?: { role?: string | null } | null): boolean =>
    user?.role === 'registration-staff'
  ```
- The `role` field's own field-level `access.update` allows a change only for a NON-staff user (so a staff account can never self-promote even if it reached the Users update endpoint).
- **The `Users` collection is the one data-layer lockdown.** All other collections are UI-hidden only; their raw REST API stays open (accepted tradeoff per the "just hide the tools" scope).
- **Nav whitelist for staff** (exact hrefs): `/admin/collections/tickets`, `/admin/manual-transfers`, `/admin/check-in`.
- **Approve/reject routes are deliberately unchanged** — both roles may verify payments, so their existing `!user → 401` guard is sufficient; no role restriction is added.
- **Production DB sync is manual** — production never auto-pushes. After merge, apply the additive DDL in Post-implementation. Local dev/test boot auto-pushes the column.
- Package manager is **bun**. Run integration/unit tests with `bun run test:int`; typecheck with `bunx tsc --noEmit`.

---

### Task 1: `isRegistrationStaff` helper (pure, unit-tested)

**Files:**
- Create: `src/access/roles.ts`
- Create: `tests/int/roles.int.spec.ts`

**Interfaces:**
- Produces: `isRegistrationStaff(user?: { role?: string | null } | null): boolean` — the single gate consumed by the Users access helpers (Task 2), the Users collection (Task 3), every hidden collection (Task 5), and the dashboard route (Task 7).

- [ ] **Step 1: Write the failing test**

Create `tests/int/roles.int.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isRegistrationStaff } from '@/access/roles'

describe('isRegistrationStaff', () => {
  it('is true only for role registration-staff', () => {
    expect(isRegistrationStaff({ role: 'registration-staff' })).toBe(true)
  })
  it('is false for the admin role', () => {
    expect(isRegistrationStaff({ role: 'admin' })).toBe(false)
  })
  it('is false for a null role', () => {
    expect(isRegistrationStaff({ role: null })).toBe(false)
  })
  it('is false for undefined user', () => {
    expect(isRegistrationStaff(undefined)).toBe(false)
  })
  it('is false for null user', () => {
    expect(isRegistrationStaff(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- roles`
Expected: FAIL — module `@/access/roles` does not exist yet (import/resolve error).

- [ ] **Step 3: Minimal implementation**

Create `src/access/roles.ts`:

```ts
/**
 * Single source of truth for the restricted-role gate. The only restricted
 * identity is a user whose role is exactly `registration-staff`; everyone else
 * (admins, null role, undefined user) is treated as fully privileged
 * (default-allow / explicit-deny).
 */
export const isRegistrationStaff = (user?: { role?: string | null } | null): boolean =>
  user?.role === 'registration-staff'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:int -- roles`
Expected: PASS (5 assertions green).

- [ ] **Step 5: Commit**

```bash
git add src/access/roles.ts tests/int/roles.int.spec.ts
git commit -m "feat(registration-staff): add isRegistrationStaff role gate"
```

---

### Task 2: Users access helpers (pure, unit-tested)

**Files:**
- Create: `src/access/users.ts`
- Create: `tests/int/users-access.int.spec.ts`

**Interfaces:**
- Consumes: `isRegistrationStaff` from `@/access/roles`.
- Produces:
  - `canManageUsers: Access` — `({ req: { user } }) => !isRegistrationStaff(user)` (create/update/delete).
  - `canReadUsers: Access` — admins/others `true`; staff returns the Where constraint `{ id: { equals: user.id } }`.
  - `canUpdateRoleField: FieldAccess` — `({ req: { user } }) => !isRegistrationStaff(user)` (the `role` field's `access.update`).

- [ ] **Step 1: Write the failing test**

Create `tests/int/users-access.int.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { canManageUsers, canReadUsers, canUpdateRoleField } from '@/access/users'

const staff = { id: 7, role: 'registration-staff' }
const admin = { id: 1, role: 'admin' }
const nullRole = { id: 2, role: null }

// The pure helpers only read `req.user`; a partial arg is sufficient here.
const asArgs = (user: unknown) => ({ req: { user } }) as never

describe('canManageUsers (create/update/delete)', () => {
  it('denies registration-staff', () => {
    expect(canManageUsers(asArgs(staff))).toBe(false)
  })
  it('allows admin', () => {
    expect(canManageUsers(asArgs(admin))).toBe(true)
  })
  it('allows a null-role user (default-allow)', () => {
    expect(canManageUsers(asArgs(nullRole))).toBe(true)
  })
})

describe('canReadUsers', () => {
  it('constrains registration-staff to their own record', () => {
    expect(canReadUsers(asArgs(staff))).toEqual({ id: { equals: 7 } })
  })
  it('allows admin to read all', () => {
    expect(canReadUsers(asArgs(admin))).toBe(true)
  })
})

describe('canUpdateRoleField', () => {
  it('denies registration-staff (no self-promotion)', () => {
    expect(canUpdateRoleField(asArgs(staff))).toBe(false)
  })
  it('allows admin', () => {
    expect(canUpdateRoleField(asArgs(admin))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- users-access`
Expected: FAIL — module `@/access/users` does not exist yet.

- [ ] **Step 3: Minimal implementation**

Create `src/access/users.ts`:

```ts
import type { Access, FieldAccess } from 'payload'

import { isRegistrationStaff } from './roles'

/**
 * Users is the sole data-layer lockdown. Registration-staff may neither create,
 * update nor delete any user (which also blocks self-promotion); everyone else
 * keeps full access.
 */
export const canManageUsers: Access = ({ req: { user } }) => !isRegistrationStaff(user)

/**
 * Admins (and every non-staff identity) read all users; a registration-staff
 * user may read ONLY their own record — so the account menu still loads but they
 * cannot enumerate other users' PII.
 */
export const canReadUsers: Access = ({ req: { user } }) => {
  if (isRegistrationStaff(user)) {
    return { id: { equals: user!.id } }
  }
  return true
}

/**
 * Field-level guard for the `role` select: only a non-staff user may change a
 * role, so a staff account can never self-promote even via the Users update
 * endpoint.
 */
export const canUpdateRoleField: FieldAccess = ({ req: { user } }) => !isRegistrationStaff(user)
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:int -- users-access`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/access/users.ts tests/int/users-access.int.spec.ts
git commit -m "feat(registration-staff): add Users access helpers"
```

---

### Task 3: Wire the Users collection — `role` field + access + types

**Files:**
- Modify: `src/collections/Users/index.ts`
- Create: `tests/int/users-role-field.int.spec.ts`
- Regenerate: `src/payload-types.ts` (via `bun run generate:types`)

**Interfaces:**
- Consumes: `authenticated` (`@/access/authenticated`), `isRegistrationStaff` (`@/access/roles`), and `canManageUsers` / `canReadUsers` / `canUpdateRoleField` (`@/access/users`).
- Produces: the `role` select on `users` (`saveToJWT: true`, nullable, `defaultValue: 'admin'`); after `generate:types`, `User` in `src/payload-types.ts` gains `role?: ('admin' | 'registration-staff') | null`, so Nav/dashboard code (Tasks 4, 7) can read `user.role` without tsc errors.

- [ ] **Step 1: Write the failing test**

Create `tests/int/users-role-field.int.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { Users } from '@/collections/Users'

const roleField = () =>
  (Users.fields as Array<Record<string, unknown>>).find((f) => f.name === 'role') as
    | Record<string, unknown>
    | undefined

describe('Users.role field', () => {
  it('is a select with saveToJWT and defaultValue admin', () => {
    const field = roleField()
    expect(field?.type).toBe('select')
    expect(field?.saveToJWT).toBe(true)
    expect(field?.defaultValue).toBe('admin')
  })
  it('offers exactly Administrator and Petugas Pendaftaran options', () => {
    expect(roleField()?.options).toEqual([
      { label: 'Administrator', value: 'admin' },
      { label: 'Petugas Pendaftaran', value: 'registration-staff' },
    ])
  })
  it('is NOT required (nullable column)', () => {
    expect(roleField()?.required).toBeFalsy()
  })
  it('denies the role field update to registration-staff', () => {
    const update = (roleField()?.access as { update: (a: unknown) => boolean }).update
    expect(update({ req: { user: { id: 7, role: 'registration-staff' } } })).toBe(false)
    expect(update({ req: { user: { id: 1, role: 'admin' } } })).toBe(true)
  })
})

describe('Users collection admin.hidden', () => {
  it('hides the collection for registration-staff only', () => {
    const hidden = (Users.admin as { hidden: (a: unknown) => boolean }).hidden
    expect(hidden({ user: { role: 'registration-staff' } })).toBe(true)
    expect(hidden({ user: { role: 'admin' } })).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- users-role-field`
Expected: FAIL — no `role` field on `Users.fields`, and `Users.admin.hidden` is undefined.

- [ ] **Step 3: Minimal implementation**

Replace the entire contents of `src/collections/Users/index.ts` with:

```ts
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isRegistrationStaff } from '../../access/roles'
import { canManageUsers, canReadUsers, canUpdateRoleField } from '../../access/users'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: canManageUsers,
    delete: canManageUsers,
    read: canReadUsers,
    update: canManageUsers,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
    hidden: ({ user }) => isRegistrationStaff(user),
    components: {
      views: {
        list: {
          Component: '@/components/admin/lists/UsersListView',
        },
      },
    },
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      // Nullable column (NOT `required`): a NOT NULL alter would fail on existing
      // rows and break dev auto-push — same rationale as the alumni/tshirt fields.
      // Existing production rows are backfilled to 'admin' (see Post-implementation).
      defaultValue: 'admin',
      saveToJWT: true,
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Petugas Pendaftaran', value: 'registration-staff' },
      ],
      access: {
        update: canUpdateRoleField,
      },
    },
  ],
  timestamps: true,
}
```

- [ ] **Step 4: Regenerate Payload types**

Run: `bun run generate:types`
Expected: `src/payload-types.ts` — the `User` interface gains `role?: ('admin' | 'registration-staff') | null`.

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun run test:int -- users-role-field`
Expected: PASS.

- [ ] **Step 6: Typecheck**

Run: `bunx tsc --noEmit`
Expected: clean (no errors).

- [ ] **Step 7: Commit**

```bash
git add src/collections/Users/index.ts src/payload-types.ts tests/int/users-role-field.int.spec.ts
git commit -m "feat(registration-staff): add role field + Users access lockdown"
```

---

### Task 4: Nav whitelist — `visibleMenuGroups` pure function + wiring

**Files:**
- Create: `src/components/admin/Nav/visibleMenuGroups.ts`
- Modify: `src/components/admin/Nav/index.tsx`
- Create: `tests/int/visible-menu-groups.int.spec.ts`

**Interfaces:**
- Produces: `visibleMenuGroups(groups: MenuGroup[], role?: string | null): MenuGroup[]` plus the `MenuItem` / `MenuGroup` types and `REGISTRATION_STAFF_ALLOWED_HREFS`.
- Consumes (in `index.tsx`): `useAuth` from `@payloadcms/ui` to read the current `user.role` (available client-side because `role` has `saveToJWT: true`).

- [ ] **Step 1: Write the failing test**

Create `tests/int/visible-menu-groups.int.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { visibleMenuGroups, type MenuGroup } from '@/components/admin/Nav/visibleMenuGroups'

const icon = (() => null) as unknown as MenuGroup['items'][number]['icon']

const groups: MenuGroup[] = [
  {
    label: 'Golf Content',
    id: 'golf-content',
    items: [{ name: 'Events', href: '/admin/collections/events', icon }],
  },
  {
    label: 'Registrations',
    id: 'registrations',
    items: [
      { name: 'Event Registrations', href: '/admin/collections/event-registrations', icon },
      { name: 'Tickets', href: '/admin/collections/tickets', icon },
      { name: 'Manual Transfers', href: '/admin/manual-transfers', icon },
      { name: 'Check-In Scanner', href: '/admin/check-in', icon },
    ],
  },
]

describe('visibleMenuGroups', () => {
  it('returns groups unchanged for admin', () => {
    expect(visibleMenuGroups(groups, 'admin')).toBe(groups)
  })
  it('returns groups unchanged for a null role', () => {
    expect(visibleMenuGroups(groups, null)).toBe(groups)
  })
  it('keeps only Tickets / Manual Transfers / Check-In for staff and drops empty groups', () => {
    const result = visibleMenuGroups(groups, 'registration-staff')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('registrations')
    expect(result[0].items.map((i) => i.href)).toEqual([
      '/admin/collections/tickets',
      '/admin/manual-transfers',
      '/admin/check-in',
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- visible-menu-groups`
Expected: FAIL — module `@/components/admin/Nav/visibleMenuGroups` does not exist yet.

- [ ] **Step 3: Minimal implementation (pure function)**

Create `src/components/admin/Nav/visibleMenuGroups.ts`:

```ts
import type React from 'react'

export interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
}

export interface MenuGroup {
  label: string
  id: string
  items: MenuItem[]
  defaultOpen?: boolean
}

/**
 * Hrefs a registration-staff user is allowed to see in the Nav: Tickets,
 * Manual Transfers, Check-In. Every other role sees the full menu.
 */
export const REGISTRATION_STAFF_ALLOWED_HREFS: readonly string[] = [
  '/admin/collections/tickets',
  '/admin/manual-transfers',
  '/admin/check-in',
]

/**
 * Pure Nav filter. For a `registration-staff` role, keep only whitelisted items
 * and drop groups that become empty. For every other role (admin, null,
 * undefined) return the groups unchanged (default-allow).
 */
export function visibleMenuGroups(groups: MenuGroup[], role?: string | null): MenuGroup[] {
  if (role !== 'registration-staff') return groups
  const allowed = new Set(REGISTRATION_STAFF_ALLOWED_HREFS)
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => allowed.has(item.href)) }))
    .filter((group) => group.items.length > 0)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:int -- visible-menu-groups`
Expected: PASS.

- [ ] **Step 5: Wire the Nav component**

In `src/components/admin/Nav/index.tsx`:

(a) Add these imports (after the existing `usePathname` import and the icon import block, above `import './styles.scss'`):

```ts
import { useAuth } from '@payloadcms/ui'
import { visibleMenuGroups, type MenuGroup } from './visibleMenuGroups'
```

(b) DELETE the two local interface declarations (they now come from the module):

```ts
interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
}

interface MenuGroup {
  label: string
  id: string
  items: MenuItem[]
  defaultOpen?: boolean
}
```

(The `const menuGroups: MenuGroup[] = [ ... ]` array stays exactly as-is; it now uses the imported `MenuGroup` type.)

(c) At the top of `Nav()`, read the user and compute the visible groups, then base the open-state and render on `groups` instead of `menuGroups`:

```ts
export function Nav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const groups = visibleMenuGroups(menuGroups, (user as { role?: string | null } | null)?.role)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    groups.forEach((group) => {
      initial[group.id] = group.defaultOpen ?? true
    })
    return initial
  })
```

(d) In the JSX, change the menu-groups map from `{menuGroups.map((group) => (` to:

```tsx
        {groups.map((group) => (
```

(No other lines in the component change.)

- [ ] **Step 6: Typecheck + full suite**

Run: `bunx tsc --noEmit`
Expected: clean.
Run: `bun run test:int`
Expected: all green (the Nav React component itself is not unit-harnessed; its correctness rides on the `visibleMenuGroups` unit test + tsc).

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/Nav/visibleMenuGroups.ts src/components/admin/Nav/index.tsx tests/int/visible-menu-groups.int.spec.ts
git commit -m "feat(registration-staff): filter admin Nav to staff whitelist"
```

---

### Task 5: Hide non-essential collections from staff in the admin UI

**Files:**
- Modify: `src/collections/Categories.ts`
- Modify: `src/collections/Media.ts`
- Modify: `src/collections/Proofs.ts`
- Modify: `src/collections/Events/index.ts`
- Modify: `src/collections/News/index.ts`
- Modify: `src/collections/Pages/index.ts`
- Modify: `src/collections/Players/index.ts`
- Modify: `src/collections/Posts/index.ts`
- Modify: `src/collections/Sponsors/index.ts`
- Modify: `src/collections/SponsorRegistrations/index.ts`
- Modify: `src/collections/SponsorshipTiers/index.ts`
- Create: `tests/int/collection-admin-hidden.int.spec.ts`

**Interfaces:**
- Consumes: `isRegistrationStaff` from `@/access/roles`.
- Produces: `admin.hidden: ({ user }) => isRegistrationStaff(user)` on every collection EXCEPT `tickets` and `event-registrations` (and `users`, already done in Task 3). `admin.hidden` receives `{ user: ClientUser }` per Payload's type.

- [ ] **Step 1: Write the failing test**

Create `tests/int/collection-admin-hidden.int.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { CollectionConfig } from 'payload'

import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Proofs } from '@/collections/Proofs'
import { Events } from '@/collections/Events'
import { News } from '@/collections/News'
import { Pages } from '@/collections/Pages'
import { Players } from '@/collections/Players'
import { Posts } from '@/collections/Posts'
import { Sponsors } from '@/collections/Sponsors'
import { SponsorRegistrations } from '@/collections/SponsorRegistrations'
import { SponsorshipTiers } from '@/collections/SponsorshipTiers'
import { Users } from '@/collections/Users'
import { Tickets } from '@/collections/Tickets'
import { EventRegistrations } from '@/collections/EventRegistrations'

const staff = { user: { role: 'registration-staff' } } as never
const admin = { user: { role: 'admin' } } as never

const hiddenFor = (c: CollectionConfig) =>
  (c.admin as { hidden?: (a: unknown) => boolean } | undefined)?.hidden

describe('collection admin.hidden for registration-staff', () => {
  const hiddenCollections: Array<[string, CollectionConfig]> = [
    ['categories', Categories],
    ['media', Media],
    ['proofs', Proofs],
    ['events', Events],
    ['news', News],
    ['pages', Pages],
    ['players', Players],
    ['posts', Posts],
    ['sponsors', Sponsors],
    ['sponsor-registrations', SponsorRegistrations],
    ['sponsorship-tiers', SponsorshipTiers],
    ['users', Users],
  ]

  it.each(hiddenCollections)('hides %s for staff, shows for admin', (_slug, collection) => {
    const hidden = hiddenFor(collection)
    expect(typeof hidden).toBe('function')
    expect(hidden!(staff)).toBe(true)
    expect(hidden!(admin)).toBe(false)
  })

  it('leaves tickets and event-registrations visible (no hidden gate)', () => {
    expect(hiddenFor(Tickets)).toBeUndefined()
    expect(hiddenFor(EventRegistrations)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:int -- collection-admin-hidden`
Expected: FAIL — `admin.hidden` is `undefined` on Categories/Media/Proofs/Events/News/Pages/Players/Posts/Sponsors/SponsorRegistrations/SponsorshipTiers (`typeof hidden` is `'undefined'`, not `'function'`). (Users already passes from Task 3.)

- [ ] **Step 3: Minimal implementation**

For EACH of the 11 collection files listed above, make two edits:

1. Add the import near the top (alongside the other `@/access/...` imports):

```ts
import { isRegistrationStaff } from '@/access/roles'
```

2. Inside that collection's existing `admin: { ... }` object, add this property (place it right after `useAsTitle` / `group`, before `components`):

```ts
    hidden: ({ user }) => isRegistrationStaff(user),
```

Notes:
- `Proofs.ts` and `Media.ts` already have an `admin` object — add `hidden` there.
- Use the `@/access/roles` alias uniformly (it resolves from every file per tsconfig paths), regardless of whether the file currently uses `@/access/...` or a relative `../access/...` path for other imports.
- Do NOT touch `src/collections/Tickets/index.ts` or `src/collections/EventRegistrations/index.ts`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:int -- collection-admin-hidden`
Expected: PASS (12 hidden collections true/false + tickets/event-registrations undefined).

- [ ] **Step 5: Typecheck**

Run: `bunx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/collections/Categories.ts src/collections/Media.ts src/collections/Proofs.ts src/collections/Events/index.ts src/collections/News/index.ts src/collections/Pages/index.ts src/collections/Players/index.ts src/collections/Posts/index.ts src/collections/Sponsors/index.ts src/collections/SponsorRegistrations/index.ts src/collections/SponsorshipTiers/index.ts tests/int/collection-admin-hidden.int.spec.ts
git commit -m "feat(registration-staff): hide non-essential collections from staff"
```

---

### Task 6: Check-in route — add auth guard + `checkedInBy`

**Files:**
- Modify: `src/app/(payload)/api/check-in/validate/route.ts`

**Interfaces:**
- Consumes: `payload.auth({ headers })` for the current user; the `Ticket.checkedInBy` relationship field (already exists on the collection).
- Produces: a 401 when unauthenticated; `checkedInBy: user.id` written on the ticket update (completing the existing TODO). Both roles may scan — no role restriction.
- Verification: this server route calls `getPayload` and is not unit-harnessed; correctness is verified by `bunx tsc --noEmit` clean + the existing suite green.

- [ ] **Step 1: Implementation**

In `src/app/(payload)/api/check-in/validate/route.ts`, immediately after `const payload = await getPayload({ config })` (line 18), insert the auth guard:

```ts
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json({ valid: false, reason: 'Unauthorized' }, { status: 401 })
    }
```

Then replace the stale TODO block and the ticket update. Change:

```ts
    // Get current user from request (if authenticated)
    // For now, we'll set checkedInBy based on request context
    const now = new Date().toISOString()

    // Update ticket status
    await payload.update({
      collection: 'tickets',
      id: ticket.id,
      data: {
        status: 'checked_in',
        checkedInAt: now,
      },
    })
```

to:

```ts
    const now = new Date().toISOString()

    // Update ticket status, recording which admin user scanned it.
    await payload.update({
      collection: 'tickets',
      id: ticket.id,
      data: {
        status: 'checked_in',
        checkedInAt: now,
        checkedInBy: user.id,
      },
    })
```

- [ ] **Step 2: Typecheck + full suite**

Run: `bunx tsc --noEmit`
Expected: clean (`user.id` is valid; `checkedInBy` accepts a user id).
Run: `bun run test:int`
Expected: all green (no existing test exercises this route unauthenticated; the `api.int.spec.ts` suite continues to pass).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(payload)/api/check-in/validate/route.ts"
git commit -m "feat(registration-staff): require auth on check-in and record checkedInBy"
```

---

### Task 7: Dashboard API — deny staff (403)

**Files:**
- Modify: `src/app/(payload)/api/admin/dashboard/route.ts`

**Interfaces:**
- Consumes: `payload.auth({ headers })` and `isRegistrationStaff` from `@/access/roles`.
- Produces: a 403 for a `registration-staff` user (revenue/aggregate stats stay hidden); admins and null-role users are unaffected.
- Verification: server route calling `getPayload`; verified by `bunx tsc --noEmit` clean + the existing suite green.

- [ ] **Step 1: Implementation**

In `src/app/(payload)/api/admin/dashboard/route.ts`:

(a) Add the import at the top (after `import config from '@payload-config'`):

```ts
import { isRegistrationStaff } from '@/access/roles'
```

(b) Change the handler signature and add the auth/deny guard right after `getPayload`. Replace:

```ts
export async function GET() {
  try {
    const payload = await getPayload({ config })
```

with:

```ts
export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: request.headers })
    if (isRegistrationStaff(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
```

(The rest of the handler body is unchanged.)

- [ ] **Step 2: Typecheck + full suite**

Run: `bunx tsc --noEmit`
Expected: clean.
Run: `bun run test:int`
Expected: all green.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(payload)/api/admin/dashboard/route.ts"
git commit -m "feat(registration-staff): deny dashboard API to staff (403)"
```

---

## Deliberately unchanged (design confirmation)

- **`api/manual-transfers/approve/route.ts` and `reject/route.ts`:** both already call `payload.auth({ headers })` and return 401 when `!user`. Both roles (admin and registration-staff) are permitted to verify payments, so NO role restriction is added. No code change and no new test — confirmed by reading the two files against the design's enforcement point #3.
- **The public ticket-PDF link** stays public (registrant self-service) — untouched.

## Final verification (whole feature)

- [ ] `bunx tsc --noEmit` — clean.
- [ ] `bun run test:int` — entire suite green (new unit specs: `roles`, `users-access`, `users-role-field`, `visible-menu-groups`, `collection-admin-hidden`; plus all pre-existing specs).

---

## Post-implementation (controller-run, NOT part of the test suite)

These are operational steps the controller runs against PRODUCTION after the code + local tests land. They are intentionally excluded from the automated tasks above.

### 1. Production DB DDL (manual — production never auto-pushes)

Verify names/values against Payload's generated migration first, then apply the additive, nullable-column DDL with backfill:

```sql
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_users_role') THEN
    CREATE TYPE "public"."enum_users_role" AS ENUM('admin','registration-staff');
  END IF;
END $$;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "enum_users_role";
UPDATE "users" SET "role" = 'admin' WHERE "role" IS NULL;
```

### 2. Create the restricted account (via a Payload script, so Payload hashes the password)

After the code + prod column land, create the account against PROD:

- **email:** `pendaftaran@polinemagolf.com`
- **password:** `pendaftaran123` (can be changed later in admin)
- **role:** `registration-staff`
- **name:** `Petugas Pendaftaran`
