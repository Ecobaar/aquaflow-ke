-- Inventory rows created without a station (station_id IS NULL) were blocked by
-- station-only RLS policies. Allow users to manage their own station-less rows;
-- station rows still require current station access.
DROP POLICY IF EXISTS "Users can manage inventory for their stations" ON public.inventory;
CREATE POLICY "Users can manage inventory for their stations"
ON public.inventory
FOR ALL
USING (
  (station_id IS NULL AND auth.uid() = user_id)
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
  (station_id IS NULL AND auth.uid() = user_id)
  OR (station_id IS NOT NULL AND public.user_has_station_access(station_id, auth.uid()))
)
WITH CHECK (
  auth.uid() = user_id
  AND (station_id IS NULL OR public.user_has_station_access(station_id, auth.uid()))
);
