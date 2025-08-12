# Contributing to FleetFlow

Thank you for your interest in improving FleetFlow! This guide covers the steps to get a development environment running and how to submit changes.

## Getting started

1. **Clone and install**
   ```bash
   npm install
   ```
2. **Environment variables** – create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
3. **Database** – run the schema and seed SQL in the Supabase SQL editor, then create the `vw_allocation_bars` and `vw_weekly_group_utilization` views.
4. **Development server** – start Vite and open the URL it prints:
   ```bash
   npm run dev
   ```
5. **Quality checks** – run linting before committing:
   ```bash
   npm run lint
   ```

## Troubleshooting

### Supabase
- **Invalid API URL or key** – double‑check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` file; changes require a server restart.
- **Schema drift or missing tables** – ensure all migrations and seed scripts have been applied in the Supabase SQL editor.
- **RLS errors** – confirm authenticated user policies allow the operation and that the request includes the Supabase auth session.

### Vite
- **Port already in use** – Vite defaults to port `5173`. Stop other processes or run `npm run dev -- --port <new-port>`.
- **Environment variables not loading** – variables must be prefixed with `VITE_` and require a restart after changes.
- **Stale cache or build errors** – clear the Vite cache with `rm -rf node_modules/.vite` and reinstall dependencies.

## Submitting changes

1. Create a branch and commit your changes.
2. Ensure `npm run lint` passes.
3. Open a pull request with a clear description of your changes and any relevant screenshots or notes.

We appreciate your contributions!
