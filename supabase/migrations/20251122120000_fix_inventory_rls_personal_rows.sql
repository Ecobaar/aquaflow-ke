-- Inventory rows created without a station (station_id IS NULL) were blocked by
-- station-only RLS policies. Allow users to manage their own rows, and station
-- members to manage rows belonging to stations they can access.
DROP POLICY IF EXISTS "Users can manage inventory for their stations" ON public.inventory;
CREATE POLICY "Users can manage inventory for their stations"
ON public.inventory
FOR ALL
USING (
  auth.uid() = user_id
  OR (station_id IS NOT NULL AND public.user_has_station_access(station_id, auth.uid()))
)
WITH CHECK (
  auth.uid() = user_id
  AND (station_id IS NULL OR public.user_has_station_access(station_id, auth.uid()))
);

DROP POLICY IF EXISTS "Users can manage daily inventory for their stations" ON public.daily_inventory_summary;
CREATE POLICY "Users can manage daily inventory for their stations"
ON public.daily_inventory_summary
FOR ALL
USING (
  auth.uid() = user_id
  OR (station_id IS NOT NULL AND public.user_has_station_access(station_id, auth.uid()))
)
WITH CHECK (
  auth.uid() = user_id
  AND (station_id IS NULL OR public.user_has_station_access(station_id, auth.uid()))
);
