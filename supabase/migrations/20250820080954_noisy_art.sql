/*
  # Create rpc_get_role function and role system

  1. New Functions
    - `rpc_get_role()` - Returns the role of the authenticated user
    - `auth.jwt_custom_claims()` - Exposes role in JWT for RLS policies

  2. Schema Changes
    - Add `role` column to profiles table with role constraints
    - Add `is_active` column to profiles table for soft deletes

  3. Security
    - Function uses security definer to safely access user role
    - Role is exposed in JWT for policy enforcement
*/

-- Add soft-delete column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add role column if it doesn't exist
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text
    CHECK (role IN ('admin','contract_manager','plant_coordinator','workforce_coordinator'))
    DEFAULT 'contract_manager';

-- Expose role in JWT so policies can rely on auth.jwt()->>'role'
CREATE OR REPLACE FUNCTION auth.jwt_custom_claims()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'role', (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
$$;

-- RPC for clients to fetch their server-defined role
CREATE OR REPLACE FUNCTION rpc_get_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;