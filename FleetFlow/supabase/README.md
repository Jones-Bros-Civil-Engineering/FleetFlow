# Supabase setup

This directory contains SQL scripts and tests for FleetFlow.

## Environment

1. Install the [Supabase CLI](https://supabase.com/docs/reference/cli).
2. Create a `.env` file in the project root with your project credentials:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

3. Authenticate the CLI and link your project:

```bash
supabase login --token <access-token>
supabase link --project-ref <project-ref>
```

## Schema migrations

- Create new migrations with `supabase migration new <name>`.
- Apply the SQL in this folder to the linked database:

```bash
supabase db push
```

- Rebuild a local database from scratch:

```bash
supabase db reset
```

The tests in `policies.test.ts` expect a local Postgres instance with a `postgres` user.
