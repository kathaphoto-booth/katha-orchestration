# Request the Night — Plan 1: Data Layer & Transactional Accept

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the RTN spec r1.1 database layer — `availability` (date+slot), `booking_requests`, the transactional `accept_booking_request` RPC (first-accepted-wins), a rate-limited `/api/request` endpoint, slot-aware availability API with derived truthful "under request", and the concurrent-accept race test.

**Architecture:** New Supabase migration in `pb-v3/supabase/migrations/` following the funnel_events pattern (RLS on, zero policies = service-role-only) except `availability`, which gets anon SELECT like `available_dates`. All multi-statement acceptance logic lives in a Postgres function so supabase-js gets true atomicity via one RPC call. `available_dates` stays until cutover; the migration backfills it into `availability`. API routes follow the existing pb-v3 Next.js App Router route.ts pattern.

**Tech Stack:** Next.js 15 App Router (pb-v3), Supabase (Postgres + supabase-js v2, `supabaseAdmin` service-role client from `pb-v3/lib/supabase.ts`), Vitest (new devDependency), plain Node script for the race integration test.

**Spec:** `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/handoff/2026-07-12_request-the-night_spec.md` (r1.1). This plan covers: Schema section, R1, R2, R4 (v1 fallback), R6, "Build fix" (DateGate mailto), rate-limit requirement, and the "Accept race" + TZ items of the test plan. **Out of scope (follow-up plans):** Phase 1 funnel UI (weekend strip/shelf/intake), Phase 2 admin queue UI + emails, Phase 3 portal carry-through, R3 expiry cron, DMARC (Jed-owned).

## Global Constraints

- Working branch: `feat/crm-replacement-v1` (current). Commit per task; do NOT push or open PRs.
- Dates are PT-anchored ISO `YYYY-MM-DD` strings end-to-end. NEVER `new Date(iso)` on a date string (established law R6). Use the `laDate()` pattern from `pb-v3/app/api/availability/route.ts`.
- New tables: RLS ENABLED. `booking_requests` and `rate_limits` get ZERO policies (service-role-only, like `funnel_events`). `availability` gets anon SELECT only.
- Slot values: exactly `'afternoon'` and `'evening'`. Statuses: availability `'open'|'booked'`; booking_requests `'pending','held','accepted','declined','expired','withdrawn'`.
- `available_dates` is NOT dropped or modified — cutover is a later plan.
- Migrations are files only in this plan; applying to a Supabase branch/prod via MCP happens at execution of the race test (Task 6) — branch first, never prod directly (spec Rollout step 1).
- Funnel events client union + server allowlist must stay in sync (existing law).
- Do not modify `packages/core` — new code lives in pb-v3.
- All work under `pb-v3/` unless a path says otherwise.

---

### Task 1: Vitest test infrastructure

**Files:**
- Modify: `pb-v3/package.json` (devDependencies + scripts)
- Create: `pb-v3/vitest.config.ts`
- Create: `pb-v3/tests/smoke.test.ts`

**Interfaces:**
- Produces: `npm test` (vitest run) working inside `pb-v3/`; `tests/**/*.test.ts` is the test glob. Later tasks add tests under `pb-v3/tests/`.

- [ ] **Step 1: Install vitest**

```bash
cd /Users/jedg./Desktop/kat_ha_pb/pb-v3
npm install -D vitest
```

- [ ] **Step 2: Add config and test script**

Create `pb-v3/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

In `pb-v3/package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Write a smoke test**

Create `pb-v3/tests/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('vitest wiring', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run and verify it passes**

Run: `cd /Users/jedg./Desktop/kat_ha_pb/pb-v3 && npm test`
Expected: `1 passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/package.json pb-v3/package-lock.json pb-v3/vitest.config.ts pb-v3/tests/smoke.test.ts
git commit -m "test(rtn): vitest infrastructure for pb-v3"
```

---

### Task 2: Migration — availability, booking_requests, rate_limits, backfill

**Files:**
- Create: `pb-v3/supabase/migrations/20260712000000_request_the_night.sql`

**Interfaces:**
- Produces: tables `public.availability`, `public.booking_requests`, `public.rate_limits`; function `public.check_rate_limit(p_key text, p_max integer, p_window_seconds integer) returns boolean`. Task 3 adds `accept_booking_request` in a second migration. Tasks 4–6 consume these.

- [ ] **Step 1: Write the migration**

Create `pb-v3/supabase/migrations/20260712000000_request_the_night.sql`:

```sql
-- Request the Night r1.1 — data layer (spec 2026-07-12).
-- availability supersedes available_dates for the funnel read; the old
-- table stays untouched until cutover (spec "Open at build time").

create table if not exists public.availability (
  date   date not null,
  slot   text not null check (slot in ('afternoon','evening')),
  status text not null check (status in ('open','booked')),
  note   text,
  primary key (date, slot)
);

alter table public.availability enable row level security;

-- Same read posture as available_dates: public calendar is anon-readable.
create policy "Public can select availability"
  on public.availability for select to anon using (true);

-- Backfill: every open available_dates row opens BOTH slots; booked rows
-- book both slots (conservative — a legacy booking blocked the whole day).
insert into public.availability (date, slot, status, note)
select d.date, s.slot, d.status, d.note
from public.available_dates d
cross join (values ('afternoon'), ('evening')) as s(slot)
on conflict (date, slot) do nothing;

create table if not exists public.booking_requests (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id),
  date       date not null,
  slot       text not null check (slot in ('afternoon','evening')),
  tier       text not null,
  intake     jsonb,  -- {phone, venue_city, event_type, guest_estimate, start_time, notes}
  status     text not null default 'pending'
             check (status in ('pending','held','accepted','declined','expired','withdrawn')),
  decided_by text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

-- Service-role-only by design (funnel_events pattern): RLS on, zero policies.
alter table public.booking_requests enable row level security;

create index if not exists booking_requests_date_slot_status_idx
  on public.booking_requests (date, slot, status);
create index if not exists booking_requests_status_created_at_idx
  on public.booking_requests (status, created_at);

-- Rate limiting for /api/request (spec: requested-state must not be
-- spammable). Fixed-window counter keyed by caller-chosen key.
create table if not exists public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  count        integer not null default 1,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;
-- Intentionally no policies — service role only.

create or replace function public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );
  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into v_count;
  return v_count <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
```

- [ ] **Step 2: Sanity-check the SQL parses**

If Docker/`supabase` CLI local DB is available: `cd pb-v3 && npx supabase db lint` (skip if no local stack — the file is validated for real in Task 6 on a Supabase branch). Otherwise verify by reading: every `create` idempotent, both CHECK lists match Global Constraints exactly.

- [ ] **Step 3: Verify no live check_rate_limit conflict**

Using the Supabase MCP tool `execute_sql` against the project (read-only query):

```sql
select proname, pg_get_function_identity_arguments(oid)
from pg_proc where proname = 'check_rate_limit';
```

Expected: zero rows (function doesn't exist yet — repo grep already found no definition). If a row exists with a DIFFERENT signature, STOP and adapt `/api/request` (Task 4) to the live signature instead of shipping this one; note it in the commit message.

- [ ] **Step 4: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/supabase/migrations/20260712000000_request_the_night.sql
git commit -m "feat(rtn): availability + booking_requests + rate-limit migration"
```

---

### Task 3: Migration — transactional accept RPC (R1)

**Files:**
- Create: `pb-v3/supabase/migrations/20260712000100_accept_booking_request.sql`

**Interfaces:**
- Consumes: `availability`, `booking_requests` from Task 2.
- Produces: `public.accept_booking_request(p_request_id uuid, p_decided_by text) returns jsonb`. Return shape: `{"outcome": "accepted", "request_id": ..., "declined_ids": [...]}` on win; `{"outcome": "slot_taken", "decided_by": "<who booked it>"}` when the slot guard returns zero rows; `{"outcome": "request_not_actionable"}` when the request isn't pending/held. Task 6 race test and the future admin queue call this via `supabaseAdmin.rpc('accept_booking_request', { p_request_id, p_decided_by })`.

- [ ] **Step 1: Write the RPC migration**

Create `pb-v3/supabase/migrations/20260712000100_accept_booking_request.sql`:

```sql
-- R1 — transactional accept, first-accepted-wins. A plpgsql function body
-- is a single transaction; the WHERE status='open' guard is the race lock:
-- concurrent callers serialize on the availability row lock, and the loser
-- sees zero rows updated.

create or replace function public.accept_booking_request(
  p_request_id uuid,
  p_decided_by text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.booking_requests%rowtype;
  v_slot_rows integer;
  v_declined uuid[];
  v_winner text;
begin
  select * into v_req from public.booking_requests where id = p_request_id;
  if not found then
    return jsonb_build_object('outcome', 'request_not_actionable');
  end if;

  -- Guard 1: the slot. Zero rows = another accept already won.
  update public.availability
     set status = 'booked'
   where date = v_req.date and slot = v_req.slot and status = 'open';
  get diagnostics v_slot_rows = row_count;

  if v_slot_rows = 0 then
    select decided_by into v_winner
      from public.booking_requests
     where date = v_req.date and slot = v_req.slot and status = 'accepted'
     order by decided_at desc limit 1;
    return jsonb_build_object('outcome', 'slot_taken', 'decided_by', coalesce(v_winner, 'unknown'));
  end if;

  -- Guard 2: the request itself (same pattern — status must still be live).
  update public.booking_requests
     set status = 'accepted', decided_by = p_decided_by, decided_at = now()
   where id = p_request_id and status in ('pending','held');
  if not found then
    -- Roll the slot flip back by raising: plpgsql aborts the whole function tx.
    raise exception 'request % not in an actionable state', p_request_id
      using errcode = 'P0001';
  end if;

  -- Competing pending/held requests on the same (date,slot) flip to declined
  -- in the SAME transaction (spec R1). Alternates email is the caller's job.
  -- (CTE, not UPDATE..RETURNING INTO — that form can't collect multiple rows.)
  with declined as (
    update public.booking_requests
       set status = 'declined', decided_by = p_decided_by, decided_at = now()
     where date = v_req.date and slot = v_req.slot
       and id <> p_request_id
       and status in ('pending','held')
    returning id
  )
  select coalesce(array_agg(id), '{}') into v_declined from declined;

  return jsonb_build_object(
    'outcome', 'accepted',
    'request_id', p_request_id,
    'declined_ids', to_jsonb(v_declined)
  );
end;
$$;

revoke all on function public.accept_booking_request(uuid, text) from public, anon, authenticated;
```

- [ ] **Step 2: Re-read the final SQL**

Confirm: single function, no nested transactions, the competing-decline segment uses the CTE form, both guards use zero-row detection, revoke line present.

- [ ] **Step 3: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/supabase/migrations/20260712000100_accept_booking_request.sql
git commit -m "feat(rtn): transactional accept_booking_request RPC (first-accepted-wins)"
```

---

### Task 4: `lib/requests.ts` — types, PT date math, derived under-request (TDD)

**Files:**
- Create: `pb-v3/lib/requests.ts`
- Test: `pb-v3/tests/requests.test.ts`

**Interfaces:**
- Produces (Tasks 5 and future UI consume these exact names):
  - `type Slot = 'afternoon' | 'evening'`
  - `type SlotStatus = 'open' | 'under_request' | 'booked' | 'past'`
  - `type RequestIntake = { phone: string; venue_city: string; event_type: string; guest_estimate: string; start_time?: string; notes?: string }`
  - `laDateISO(offsetDays?: number): string` — today in America/Los_Angeles as `YYYY-MM-DD`
  - `deriveSlotStatus(row: { date: string; slot: Slot; status: 'open'|'booked' }, pendingCount: number, todayISO: string): SlotStatus`
  - `GUEST_ESTIMATES = ['Under 50', '50–100', '100–200', '200+'] as const`

- [ ] **Step 1: Write the failing tests**

Create `pb-v3/tests/requests.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { deriveSlotStatus, laDateISO, GUEST_ESTIMATES } from '@/lib/requests';

describe('deriveSlotStatus', () => {
  const today = '2026-07-12';
  const open = { date: '2026-07-17', slot: 'evening' as const, status: 'open' as const };

  it('open slot, no pending → open', () => {
    expect(deriveSlotStatus(open, 0, today)).toBe('open');
  });

  it('open slot with ≥1 pending → under_request (derived, truthful M5)', () => {
    expect(deriveSlotStatus(open, 1, today)).toBe('under_request');
    expect(deriveSlotStatus(open, 5, today)).toBe('under_request');
  });

  it('booked slot → booked even with pending noise', () => {
    expect(deriveSlotStatus({ ...open, status: 'booked' }, 3, today)).toBe('booked');
  });

  it('past date → past regardless of status', () => {
    const past = { ...open, date: '2026-07-10' };
    expect(deriveSlotStatus(past, 0, today)).toBe('past');
    expect(deriveSlotStatus({ ...past, status: 'booked' }, 0, today)).toBe('past');
  });

  it('today is not past (string compare, R6)', () => {
    expect(deriveSlotStatus({ ...open, date: today }, 0, today)).toBe('open');
  });
});

describe('laDateISO (R6 — PT-anchored string math)', () => {
  it('returns YYYY-MM-DD', () => {
    expect(laDateISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('offset is chronological under string compare', () => {
    expect(laDateISO(7) > laDateISO(0)).toBe(true);
  });
});

describe('GUEST_ESTIMATES (A4 chips)', () => {
  it('matches the ratified four buckets', () => {
    expect([...GUEST_ESTIMATES]).toEqual(['Under 50', '50–100', '100–200', '200+']);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/requests.test.ts`
Expected: FAIL — cannot resolve `@/lib/requests`.

- [ ] **Step 3: Implement**

Create `pb-v3/lib/requests.ts`:

```ts
// Request the Night — shared types + pure helpers (spec r1.1).
// Dates are PT-anchored ISO strings end-to-end; never new Date(iso) (R6).

export type Slot = 'afternoon' | 'evening';
export type SlotStatus = 'open' | 'under_request' | 'booked' | 'past';

export type RequestIntake = {
  phone: string;
  venue_city: string;
  event_type: string;
  guest_estimate: string;
  start_time?: string;
  notes?: string;
};

export const GUEST_ESTIMATES = ['Under 50', '50–100', '100–200', '200+'] as const;

export function laDateISO(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * 86_400_000).toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles',
  });
}

// "Under request" is DERIVED, never stored (truthful-urgency law M5):
// an open slot with ≥1 rate-limit-passing pending request.
export function deriveSlotStatus(
  row: { date: string; slot: Slot; status: 'open' | 'booked' },
  pendingCount: number,
  todayISO: string,
): SlotStatus {
  if (row.date < todayISO) return 'past';
  if (row.status === 'booked') return 'booked';
  return pendingCount > 0 ? 'under_request' : 'open';
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd pb-v3 && npx vitest run tests/requests.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/lib/requests.ts pb-v3/tests/requests.test.ts
git commit -m "feat(rtn): request types + PT date math + derived under-request status"
```

---

### Task 5: `/api/request` + slot-aware `/api/availability/v2`

**Files:**
- Create: `pb-v3/app/api/request/validate.ts`
- Create: `pb-v3/app/api/request/route.ts`
- Create: `pb-v3/app/api/availability/v2/route.ts`
- Modify: `pb-v3/app/api/track/route.ts` (extend `ALLOWED_EVENTS`)
- Test: `pb-v3/tests/request-validation.test.ts`

**Interfaces:**
- Consumes: `check_rate_limit(p_key, p_max, p_window_seconds)` RPC (Task 2), `deriveSlotStatus` / `laDateISO` / `RequestIntake` / `Slot` (Task 4), `supabaseAdmin` + `supabase` from `@/lib/supabase`, `tierByKey` from `@/lib/booking`.
- Produces:
  - `POST /api/request` body `{ name, email, date, slot, tier, intake: RequestIntake }` → `201 { ok: true, request_id, ref: "KATHA-<first 8 of id>" }`; `400` invalid; `409` slot not open; `429` rate-limited; `503` DB down.
  - `GET /api/availability/v2` → `{ days: [{ date, weekday, slots: [{ slot, status: SlotStatus }] }], minNoticeDays }` — Fri/Sat/Sun only.
  - `validateRequestBody(b: unknown): { ok: true; value: ParsedRequest } | { ok: false; error: string }` exported from `app/api/request/validate.ts` (NOT the route file — Next 15 route type-checking rejects extra route exports). `type ParsedRequest = { name: string; email: string; date: string; slot: Slot; tier: string; intake: RequestIntake }`.
  - New funnel events: `slot_pick`, `request_submit`, `request_accepted`, `request_declined` (server allowlist; client union is the UI plan's job).

- [ ] **Step 1: Write the failing validation tests**

Create `pb-v3/tests/request-validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateRequestBody } from '@/app/api/request/validate';

const valid = {
  name: 'Ana Reyes',
  email: 'ana@example.com',
  date: '2026-08-14',
  slot: 'evening',
  tier: 'signature',
  intake: {
    phone: '555-0100',
    venue_city: 'Oaxaca Hall, Fresno',
    event_type: 'Wedding',
    guest_estimate: '100–200',
    start_time: '6:00 PM',
    notes: '',
  },
};

describe('validateRequestBody', () => {
  it('accepts a complete valid body', () => {
    const r = validateRequestBody(valid);
    expect(r.ok).toBe(true);
  });

  it('rejects a bad slot', () => {
    expect(validateRequestBody({ ...valid, slot: 'midnight' }).ok).toBe(false);
  });

  it('rejects a non-ISO date (R6 — strings only)', () => {
    expect(validateRequestBody({ ...valid, date: '08/14/2026' }).ok).toBe(false);
  });

  it('rejects missing required intake fields (A4 — 6 required)', () => {
    const { phone, ...rest } = valid.intake;
    expect(validateRequestBody({ ...valid, intake: rest }).ok).toBe(false);
  });

  it('allows optional start_time and notes to be absent (A4 — 2 optional)', () => {
    const { start_time, notes, ...required } = valid.intake;
    expect(validateRequestBody({ ...valid, intake: required }).ok).toBe(true);
  });

  it('rejects bad email', () => {
    expect(validateRequestBody({ ...valid, email: 'nope' }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/request-validation.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `/api/request`**

Create `pb-v3/app/api/request/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { tierByKey } from '@/lib/booking';
import { laDateISO, type RequestIntake, type Slot } from '@/lib/requests';

// POST /api/request — booking_requests.pending intake (spec Phase 1).
// Rate-limited (requested-state must not be spammable), capture-first,
// email side-effects ride on top and never block (handleInquiry doctrine).

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLOTS: Slot[] = ['afternoon', 'evening'];
const REQUIRED_INTAKE: (keyof RequestIntake)[] = ['phone', 'venue_city', 'event_type', 'guest_estimate'];
const RATE_MAX = 5;           // requests
const RATE_WINDOW_SECONDS = 3600; // per IP-hour

export type ParsedRequest = {
  name: string; email: string; date: string; slot: Slot; tier: string; intake: RequestIntake;
};

export function validateRequestBody(
  b: unknown,
): { ok: true; value: ParsedRequest } | { ok: false; error: string } {
  const o = b as Record<string, unknown>;
  const name = typeof o?.name === 'string' ? o.name.trim() : '';
  const email = typeof o?.email === 'string' ? o.email.trim().toLowerCase() : '';
  const date = typeof o?.date === 'string' ? o.date.trim() : '';
  const slot = o?.slot as Slot;
  const tier = typeof o?.tier === 'string' ? o.tier.trim() : '';
  const intake = o?.intake as Record<string, unknown> | undefined;

  if (name.length < 2) return { ok: false, error: 'Name required (min 2 chars)' };
  if (!EMAIL_REGEX.test(email)) return { ok: false, error: 'Valid email required' };
  if (!ISO_DATE.test(date)) return { ok: false, error: 'Date must be YYYY-MM-DD' };
  if (!SLOTS.includes(slot)) return { ok: false, error: 'Slot must be afternoon or evening' };
  if (!tier || !tierByKey(tier)) return { ok: false, error: 'Unknown tier' };
  if (!intake || typeof intake !== 'object') return { ok: false, error: 'Intake required' };
  for (const key of REQUIRED_INTAKE) {
    if (typeof intake[key] !== 'string' || !(intake[key] as string).trim()) {
      return { ok: false, error: `Missing intake field: ${key}` };
    }
  }

  const clean: RequestIntake = {
    phone: (intake.phone as string).trim().slice(0, 40),
    venue_city: (intake.venue_city as string).trim().slice(0, 160),
    event_type: (intake.event_type as string).trim().slice(0, 80),
    guest_estimate: (intake.guest_estimate as string).trim().slice(0, 20),
    ...(typeof intake.start_time === 'string' && intake.start_time.trim()
      ? { start_time: intake.start_time.trim().slice(0, 40) } : {}),
    ...(typeof intake.notes === 'string' && intake.notes.trim()
      ? { notes: intake.notes.trim().slice(0, 1000) } : {}),
  };
  return { ok: true, value: { name, email, date, slot, tier, intake: clean } };
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ ok: false, error: 'temporarily unavailable' }, { status: 503 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const parsed = validateRequestBody(body);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  const { name, email, date, slot, tier, intake } = parsed.value;

  // Rate limit BEFORE any write (R4: only rate-limit-passing requests may
  // ever color the calendar). Fail-closed on RPC error.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const { data: allowed, error: rlError } = await supabaseAdmin.rpc('check_rate_limit', {
    p_key: `request:${ip}`, p_max: RATE_MAX, p_window_seconds: RATE_WINDOW_SECONDS,
  });
  if (rlError || allowed !== true) {
    return NextResponse.json({ ok: false, error: 'too many requests — try again later' }, { status: 429 });
  }

  // Truthfulness guard: only accept requests for a slot that is open today.
  if (date < laDateISO(0)) {
    return NextResponse.json({ ok: false, error: 'date is in the past' }, { status: 400 });
  }
  const { data: slotRow } = await supabaseAdmin
    .from('availability').select('status').eq('date', date).eq('slot', slot).maybeSingle();
  if (!slotRow || slotRow.status !== 'open') {
    return NextResponse.json({ ok: false, error: 'that slot is no longer open' }, { status: 409 });
  }

  // Capture-first: lead row, then booking_request (durable before email).
  const { data: lead, error: leadError } = await supabaseAdmin
    .from('leads')
    .insert({
      client_name: name, client_email: email, client_phone: intake.phone,
      event_date: date, lead_hash: crypto.randomUUID().replace(/-/g, ''),
      status: 'Inquired', tier_selected: tier, source: 'request-the-night',
    })
    .select('id')
    .single();
  if (leadError || !lead) {
    console.error('[RTN_LEAD_FAILED]', JSON.stringify({ email, date, slot, detail: leadError?.message }));
    return NextResponse.json({ ok: false, error: 'capture failed — please retry' }, { status: 503 });
  }

  const { data: request, error: reqError } = await supabaseAdmin
    .from('booking_requests')
    .insert({ lead_id: lead.id, date, slot, tier, intake, status: 'pending' })
    .select('id')
    .single();
  if (reqError || !request) {
    console.error('[RTN_REQUEST_FAILED]', JSON.stringify({ lead_id: lead.id, date, slot, detail: reqError?.message }));
    return NextResponse.json({ ok: false, error: 'capture failed — please retry' }, { status: 503 });
  }

  console.log('[FUNNEL]', JSON.stringify({
    event: 'request_submit', lead_hash: null,
    meta: { date, slot, tier }, at: new Date().toISOString(),
  }));

  return NextResponse.json(
    { ok: true, request_id: request.id, ref: `KATHA-${String(request.id).slice(0, 8)}` },
    { status: 201 },
  );
}
```

Note: the selling auto-reply + brother-notification emails hook in here in the Phase-2 plan (they reuse the Resend pattern from `app/api/admin/notify/route.ts`); this plan keeps the route capture-only, which is safe — capture-first doctrine.

- [ ] **Step 4: Implement `/api/availability/v2`**

Create `pb-v3/app/api/availability/v2/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { deriveSlotStatus, laDateISO, type Slot } from '@/lib/requests';

// Slot-aware availability for the weekend strip. Fri/Sat/Sun only.
// "under request" is derived per R4 v1 fallback: rate-limited requests
// only (all rows in booking_requests passed the limit), and the calendar
// colors from EXISTENCE of pending requests, never counts.

const MIN_NOTICE_DAYS = 7;
const HORIZON_DAYS = 120;
const WEEKEND = new Set(['Fri', 'Sat', 'Sun']);

export const dynamic = 'force-dynamic';

// Weekday from an ISO string WITHOUT new Date(iso) midnight-UTC drift:
// anchor to noon UTC so the PT-rendered weekday is always correct.
function weekdayOf(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short', timeZone: 'America/Los_Angeles',
  });
}

export async function GET() {
  if (!supabase || !supabaseAdmin) {
    return NextResponse.json({ error: 'availability temporarily unavailable' }, { status: 503 });
  }

  const today = laDateISO(0);
  const [{ data: rows, error }, { data: pending, error: pendingError }] = await Promise.all([
    supabase.from('availability').select('date,slot,status')
      .gte('date', today).lte('date', laDateISO(HORIZON_DAYS))
      .order('date', { ascending: true }),
    supabaseAdmin.from('booking_requests').select('date,slot')
      .eq('status', 'pending').gte('date', today),
  ]);
  if (error || !rows || pendingError) {
    return NextResponse.json({ error: 'availability temporarily unavailable' }, { status: 503 });
  }

  const pendingKeys = new Set((pending ?? []).map((r) => `${r.date}:${r.slot}`));
  const cutoff = laDateISO(MIN_NOTICE_DAYS);
  const byDate = new Map<string, { slot: Slot; status: string }[]>();

  for (const row of rows) {
    const weekday = weekdayOf(row.date);
    if (!WEEKEND.has(weekday)) continue;
    const status = deriveSlotStatus(
      row as { date: string; slot: Slot; status: 'open' | 'booked' },
      pendingKeys.has(`${row.date}:${row.slot}`) ? 1 : 0,
      cutoff > row.date ? '9999-12-31' : today, // inside notice window → render as past/unselectable
    );
    const list = byDate.get(row.date) ?? [];
    list.push({ slot: row.slot as Slot, status });
    byDate.set(row.date, list);
  }

  const days = [...byDate.entries()].map(([date, slots]) => ({
    date, weekday: weekdayOf(date), slots,
  }));

  return NextResponse.json({ days, minNoticeDays: MIN_NOTICE_DAYS });
}
```

- [ ] **Step 5: Extend the track allowlist**

In `pb-v3/app/api/track/route.ts`, extend `ALLOWED_EVENTS`:

```ts
const ALLOWED_EVENTS = new Set([
  "gallery_view",
  "date_check",
  "date_held",
  "browse_all",
  "review_open",
  "drawer_open",
  "selection_submit",
  "slot_pick",
  "request_submit",
  "request_accepted",
  "request_declined",
]);
```

- [ ] **Step 6: Run tests + typecheck**

Run: `cd pb-v3 && npx vitest run && npx tsc --noEmit`
Expected: all tests PASS, no new type errors (pre-existing errors, if any, noted but not introduced).

- [ ] **Step 7: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/app/api/request/route.ts pb-v3/app/api/availability/v2/route.ts pb-v3/app/api/track/route.ts pb-v3/tests/request-validation.test.ts
git commit -m "feat(rtn): /api/request + slot-aware availability v2 + funnel events"
```

---

### Task 6: Accept-race integration test on a Supabase branch (build gate)

**Files:**
- Create: `pb-v3/scripts/test-accept-race.mjs`

**Interfaces:**
- Consumes: `accept_booking_request` RPC (Task 3), tables from Task 2.
- Produces: an executable build-gate proving exactly-one-winner under concurrency. Env: `RTN_TEST_SUPABASE_URL` + `RTN_TEST_SERVICE_ROLE_KEY` pointing at a Supabase BRANCH (never prod).

- [ ] **Step 1: Create a Supabase branch and apply migrations**

Using the Supabase MCP tools: `create_branch` (name `rtn-data-layer`), then `apply_migration` twice with the contents of `20260712000000_request_the_night.sql` and `20260712000100_accept_booking_request.sql`. Record the branch project URL and service key (`get_project_url` / `get_publishable_keys` on the branch; service key from branch settings). If MCP cost confirmation is required, confirm via `confirm_cost` — branches are the spec-mandated path (Rollout step 1).

- [ ] **Step 2: Write the race test script**

Create `pb-v3/scripts/test-accept-race.mjs`:

```js
// RTN build gate — accept race (spec test plan item 1).
// Two concurrent accepts on the same (date,slot): exactly one 'accepted',
// loser gets outcome 'slot_taken', competitors auto-declined, DB never
// double-books. Run against a Supabase BRANCH only.
import { createClient } from '@supabase/supabase-js';

const url = process.env.RTN_TEST_SUPABASE_URL;
const key = process.env.RTN_TEST_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set RTN_TEST_SUPABASE_URL and RTN_TEST_SERVICE_ROLE_KEY (branch, never prod).');
  process.exit(2);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const DATE = '2027-01-15'; // far-future Friday, test-only
const SLOT = 'evening';
let failures = 0;
const assert = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${msg}`);
  if (!cond) failures++;
};

// setup: clean slate, open slot, one lead, three pending requests
await db.from('booking_requests').delete().eq('date', DATE);
await db.from('availability').delete().eq('date', DATE);
await db.from('availability').insert({ date: DATE, slot: SLOT, status: 'open' });
const { data: lead } = await db.from('leads').insert({
  client_name: 'Race Test', client_email: 'race@test.invalid',
  event_date: DATE, lead_hash: `racetest${Date.now()}`, status: 'Inquired',
}).select('id').single();

const mkReq = async () => (await db.from('booking_requests').insert({
  lead_id: lead.id, date: DATE, slot: SLOT, tier: 'signature',
  intake: { phone: 'x', venue_city: 'x', event_type: 'x', guest_estimate: 'Under 50' },
  status: 'pending',
}).select('id').single()).data.id;
const [reqA, reqB, reqC] = [await mkReq(), await mkReq(), await mkReq()];

// the race: brothers accept two different requests for the same slot at once
const [ra, rb] = await Promise.all([
  db.rpc('accept_booking_request', { p_request_id: reqA, p_decided_by: 'jed' }),
  db.rpc('accept_booking_request', { p_request_id: reqB, p_decided_by: 'brother' }),
]);
const outcomes = [ra.data?.outcome, rb.data?.outcome];
assert(outcomes.filter((o) => o === 'accepted').length === 1, `exactly one accepted (got ${JSON.stringify(outcomes)})`);
assert(outcomes.filter((o) => o === 'slot_taken').length === 1, 'loser sees slot_taken (zero-row guard)');

const { data: slotRow } = await db.from('availability').select('status').eq('date', DATE).eq('slot', SLOT).single();
assert(slotRow.status === 'booked', 'slot flipped to booked exactly once');

const { data: reqs } = await db.from('booking_requests').select('id,status,decided_by').eq('date', DATE).eq('slot', SLOT);
assert(reqs.filter((r) => r.status === 'accepted').length === 1, 'DB holds exactly one accepted request');
assert(reqs.filter((r) => r.status === 'declined').length === 2, 'both competitors auto-declined in the same transaction');
assert(reqs.every((r) => r.status === 'pending' ? false : !!r.decided_by), 'decided_by logged on every decided row');

// second wave: accepting the already-declined third request must not re-book
const rc = await db.rpc('accept_booking_request', { p_request_id: reqC, p_decided_by: 'jed' });
assert(rc.data?.outcome !== 'accepted', 'declined request cannot be accepted after the slot is booked');

// withdrawn state exists (R2)
const { error: wErr } = await db.from('booking_requests').update({ status: 'withdrawn' }).eq('id', reqC);
assert(!wErr, "status 'withdrawn' is accepted by the CHECK constraint");

// teardown
await db.from('booking_requests').delete().eq('date', DATE);
await db.from('availability').delete().eq('date', DATE);
await db.from('leads').delete().eq('id', lead.id);

console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 3: Run against the branch**

Run:
```bash
cd /Users/jedg./Desktop/kat_ha_pb/pb-v3
RTN_TEST_SUPABASE_URL=<branch url> RTN_TEST_SERVICE_ROLE_KEY=<branch service key> node scripts/test-accept-race.mjs
```
Expected: every line `PASS`, final `ALL GREEN`, exit 0. If the race assertion flakes toward two-accepted, that is a REAL R1 bug — stop and fix the RPC, do not weaken the test.

- [ ] **Step 4: Run 5 more times (race confidence)**

Run the same command 5 times. Expected: ALL GREEN each run.

- [ ] **Step 5: Commit (and leave the branch alive)**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/scripts/test-accept-race.mjs
git commit -m "test(rtn): concurrent-accept race gate — exactly one winner"
```
Leave the Supabase branch up — the Phase 2 admin-queue plan reuses it. Do NOT merge the branch to prod in this plan.

---

### Task 7: DateGate mailto build fix

**Files:**
- Modify: `pb-v3/components/booking/DateGate.tsx` (lines ~50 and ~69)

**Interfaces:** none — copy-only change (spec r1.1 "Build fix": gmail out, hello@ in).

- [ ] **Step 1: Replace both mailto targets**

In `pb-v3/components/booking/DateGate.tsx`, replace ALL occurrences of `mailto:kathabooth@gmail.com` with `mailto:hello@kathabooth.com` (two occurrences, lines ~50 and ~69). Display text alongside the href, if it shows the gmail address, changes to `hello@kathabooth.com` too.

- [ ] **Step 2: Verify no gmail references remain in the component**

Run: `grep -n "gmail" pb-v3/components/booking/DateGate.tsx`
Expected: no output.

- [ ] **Step 3: Typecheck**

Run: `cd pb-v3 && npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/components/booking/DateGate.tsx
git commit -m "fix(rtn): DateGate fallback mailto → hello@kathabooth.com (gmail-ban resilience)"
```

---

## Follow-up plans (not in this plan)

1. **Plan 2 — Phase 1 funnel UI:** weekend strip + expanding shelf (CRO-ratified slot UX), tier-at-inquiry, two-step tiered intake (A4), microcopy deck strings 1–10, A1 contract line (BLOCKED on Jed's legal read), A2 nearest-weekend focus, sticky-HUD wiring, client funnel-event union, guard + tap-target + reduced-motion gates.
2. **Plan 3 — Phase 2 admin queue + emails:** queue UI with conflict badges, Accept (calls `accept_booking_request`) / Decline-with-alternates / Hold, Resend templates (accept/decline/expiry, strings 11–12), NOTIFICATION_EMAIL fan-out to both brothers, R3 expiry sweep (7d) + held-20h note, R5 seam checksum line. BLOCKED on DMARC (Jed) before acceptance emails carry contract links.
3. **Plan 4 — Cutover:** funnel + admin reads move `available_dates` → `availability`; prod migration apply via MCP; HoneyBook public form retirement after pilot (Jed).
