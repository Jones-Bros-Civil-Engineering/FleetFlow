# Deployment Guide

## Netlify hosting

1. Create a new site on [Netlify](https://www.netlify.com/) and link it to this repository.
2. The repository includes a `netlify.toml` with build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `20`
3. In the Netlify dashboard, configure the following environment variables under **Site settings → Build & deploy → Environment**:
   - `VITE_SUPABASE_URL`: URL of your production Supabase project.
   - `VITE_SUPABASE_ANON_KEY`: anon public key for the project.
4. Trigger a deploy. Netlify will run the build and publish the `dist` directory.

## Production Supabase setup

1. Create a Supabase project and run the schema and seed SQL scripts.
2. Generate the anon public API key from **Project settings → API**.
3. Copy the **Project URL** and **anon key** and set them as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify (or your `.env` file for local development).
4. Apply future database changes using Supabase migrations to keep production in sync.
