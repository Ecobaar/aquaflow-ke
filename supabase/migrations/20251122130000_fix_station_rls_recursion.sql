-- stations and station_members policies referenced each other, causing
-- "infinite recursion detected in policy". Route cross-table checks through
-- SECURITY DEFINER helpers, which bypass RLS.
CREATE OR REPLACE FUNCTION public.is_station_owner(_station_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stations WHERE id = _station_id AND owner_id = _user_id
  );
$$;

DROP POLICY IF EXISTS "Users can view stations they own or are members of" ON public.stations;
CREATE POLICY "Users can view stations they own or are members of"
ON public.stations
FOR SELECT
USING (owner_id = auth.uid() OR public.user_has_station_access(id, auth.uid()));

DROP POLICY IF EXISTS "Station owners can manage members" ON public.station_members;
CREATE POLICY "Station owners can manage members"
ON public.station_members
FOR ALL
USING (public.is_station_owner(station_id, auth.uid()))
WITH CHECK (public.is_station_owner(station_id, auth.uid()));

DROP POLICY IF EXISTS "Users can view transactions for their stations" ON public.transactions;
CREATE POLICY "Users can view transactions for their stations"
ON public.transactions
FOR SELECT
USING (
  user_id = auth.uid()
  OR (station_id IS NOT NULL AND public.user_has_station_access(station_id, auth.uid()))
);
