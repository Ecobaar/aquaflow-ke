
-- Fix the infinite recursion in station_members RLS policies
-- The issue is that the SELECT policy references station_members within itself

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view station members for their stations" ON public.station_members;

-- Create a security definer function to check station access
CREATE OR REPLACE FUNCTION public.user_has_station_access(_station_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stations 
    WHERE id = _station_id 
    AND (owner_id = _user_id OR id IN (
      SELECT station_id FROM public.station_members 
      WHERE user_id = _user_id AND station_id = _station_id
    ))
  );
$$;

-- Create new policy using the security definer function
DROP POLICY IF EXISTS "Users can view station members for accessible stations" ON public.station_members;
CREATE POLICY "Users can view station members for accessible stations"
ON public.station_members
FOR SELECT
USING (public.user_has_station_access(station_id, auth.uid()));

-- Also fix the RLS policies for inventory and daily_inventory_summary that might have similar issues
DROP POLICY IF EXISTS "Users can manage inventory for their stations" ON public.inventory;
CREATE POLICY "Users can manage inventory for their stations"
ON public.inventory
FOR ALL
USING (public.user_has_station_access(station_id, auth.uid()))
WITH CHECK (public.user_has_station_access(station_id, auth.uid()));

DROP POLICY IF EXISTS "Users can manage daily inventory for their stations" ON public.daily_inventory_summary;
CREATE POLICY "Users can manage daily inventory for their stations"
ON public.daily_inventory_summary
FOR ALL
USING (public.user_has_station_access(station_id, auth.uid()))
WITH CHECK (public.user_has_station_access(station_id, auth.uid()));
