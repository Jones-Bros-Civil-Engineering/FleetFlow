# FleetFlow

FleetFlow is a role‑based civil engineering **fleet & operated plant scheduler**. It maximises **owned equipment** use before **external hires**, using a **financial‑weeks calendar** to show demand vs capacity by equipment group. Contract Managers create contracts/requests, Plant Coordinators allocate assets or raise external hires with substitution rules, and Workforce Coordinators assign operators based on tickets, availability, and proximity, and Admins manage user accounts and roles. Supabase/Postgres enforces availability and scoring.

---

## Table of contents

* [Purpose](#purpose)
* [Core features](#core-features)
* [Architecture](#architecture)
* [Data model](#data-model)
* [Getting started](#getting-started)
* [Environment](#environment)
* [Database setup](#database-setup)
* [Running locally](#running-locally)
* [Calendar UX](#calendar-ux)
* [Role workflows](#role-workflows)
* [Authorization](#authorization)
* [APIs (DB views & RPCs)](#apis-db-views--rpcs)
* [Deployment](#deployment)
* [Roadmap](#roadmap)

---

## Purpose

Maximise utilisation of our own civil engineering fleet before hiring externally. Use a resource‑based model comparing **hire requests** vs **current allocations** to recommend internal assets, allowed substitutions, or external hires, and ensure operated plant has eligible operators.

## Core features

* **Financial‑weeks calendar** (months on X, equipment groups on Y) with per‑cell **on‑hire counts**.
* **Internal allocation** with **overlap prevention** (DB constraints).
* **Substitution rules** (e.g., 18T can cover a 21T request with penalty).
* **External hire** workflow when internal capacity is exhausted.
* **Operator assignments** checked for tickets, availability, and proximity.

## Architecture

* **Frontend:** React + Vite + TypeScript

  * State/data: `@tanstack/react-query`
  * Utilities: `date-fns`, `react-window` (virtualised rows)
  * UI: light CSS + Radix primitives (drawers/tooltips)
* **Backend:** Supabase (Postgres + Auth + RLS)

  * Heavy logic in SQL (views/RPCs) for consistency and race‑free allocation

## Data model

Key tables: `equipment_groups`, `group_substitutions`, `assets`, `sites`, `contracts`, `hire_requests`, `allocations`, `vendors`, `external_hires`, `operators`, `tickets`, `operator_tickets`, `operator_unavailability`, `group_required_tickets`, `operator_assignments`, `profiles`.

**Safety constraints**

* `allocations_no_overlap` (GiST EXCLUDE on `asset_id` + `daterange(start_date, end_date, '[]')`): no double‑booking an **asset**.
* `operator_no_overlap` (GiST EXCLUDE): no double‑booking an **operator**.

**Views**

* `vw_weekly_group_utilization`: expands allocations into weeks and aggregates **on\_hire\_count** per group/week.
* `vw_allocation_bars`: one row per internal allocation with contract/status for calendar rendering.

## Getting started

1. **Install deps**

   ```bash
   npm i
   npm i @supabase/supabase-js @tanstack/react-query zustand date-fns react-window @radix-ui/react-tooltip @radix-ui/react-dialog
   ```
2. **Environment** — create `.env` (see below).
3. **Database** — run schema + seed in Supabase SQL editor, then create `vw_allocation_bars` and `vw_weekly_group_utilization` (provided in /supabase or docs).
4. **Run** `npm run dev` and open the calendar.

## Environment

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

## Database setup

* Run the provided **schema** SQL (tables, enums, RLS, constraints).
* Run the **seed** SQL (equipment groups, assets, sample contracts/requests, allocations, tickets, operators).
* Ensure the following **views** exist:

  * `vw_weekly_group_utilization`
  * `vw_allocation_bars`
* (Optional) add `vw_external_bars` mirroring external hires.
* For migration details and CLI commands see [supabase/README.md](supabase/README.md).

## Running locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port Vite shows). The calendar should display rows (groups), columns (weeks), per‑cell counts, and bars for seeded allocations.

## Calendar UX

* **Rows**: equipment groups
* **Columns**: financial weeks (fiscal start = April 1 by default)
* **Bars**: allocations (solid internal; variant for predicted contracts; dashed for external if enabled)
* **Numbers**: per‑week **on‑hire count** from `vw_weekly_group_utilization`
* **Hover/Click**: shows contract, asset, request; opens details drawer (to add)

## Role workflows

**Contract Managers**

* Create `contracts` (predicted/confirmed + probability)
* Add `hire_requests` (group, dates, quantity, operated?)

**Plant Coordinators**

* View open requests
* Allocate internal assets via `rpc_score_assets` → `rpc_allocate_best_asset`
* Create `external_hires` when needed

**Workforce Coordinators**

* For operated requests, assign `operators` who have required tickets and no overlaps

**Admins**

* Manage user accounts and roles

## Authorization

Roles live in the `profiles.role` column and are surfaced to clients through a custom JWT
claim. Valid roles are `admin`, `contract_manager`, `plant_coordinator`, and `workforce_coordinator`. The frontend's route guards use this value for a better UX, but these checks are
advisory—Postgres **row level security** is the source of truth and enforces all
authorization.

## APIs (DB views & RPCs)

**Views**

* `vw_weekly_group_utilization(week_start, group_id, on_hire_count)`
* `vw_allocation_bars(allocation_id, asset_code, group_id, start_date, end_date, source, contract_status, contract_code, request_id)`

**RPCs**

* `rpc_available_assets(group_id, start_date, end_date)`
* `rpc_score_assets(group_id, start_date, end_date, site_lat, site_lon)` → returns ranked candidates
* `rpc_allocate_best_asset(request_id, group_id, start_date, end_date, site_lat, site_lon)` → inserts allocation or raises `NO_INTERNAL_ASSET_AVAILABLE`
* `rpc_rank_operators(start_date, end_date)` → lists available operators ordered by name, excluding those with overlapping assignments or unavailability
* `rpc_reassign_allocation(allocation_id)` → moves an allocation forward one day and errors if it overlaps

## Deployment

* **Frontend:** Netlify (set `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` in site env). Build: `npm run build`, Publish dir: `dist/`.
* **Database:** Managed by Supabase; apply schema changes via SQL migrations.

## Roadmap

1. Plant Coordinator panel (open requests, score, allocate, external fallback)
2. Workforce matching RPC + UI (eligibility, distance ranking)
3. Bar click details drawer (off‑hire, reassign)
4. Filters (site, status, operated)
5. Permissions tightening
