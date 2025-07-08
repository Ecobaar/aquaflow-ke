
-- Add station_name to profiles table and create station management system
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS station_name text;

-- Create stations table for better organization
CREATE TABLE IF NOT EXISTS public.stations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create station_members table for employee invitations
CREATE TABLE IF NOT EXISTS public.station_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id uuid REFERENCES public.stations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text DEFAULT 'employee' CHECK (role IN ('owner', 'employee')),
    invited_by uuid REFERENCES auth.users(id),
    joined_at timestamp with time zone DEFAULT now(),
    UNIQUE(station_id, user_id)
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    station_id uuid REFERENCES public.stations(id) ON DELETE CASCADE,
    item_name text NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    unit text NOT NULL DEFAULT 'pieces',
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create daily_inventory_summary table for stock tracking
CREATE TABLE IF NOT EXISTS public.daily_inventory_summary (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    station_id uuid REFERENCES public.stations(id) ON DELETE CASCADE,
    date date DEFAULT CURRENT_DATE,
    opening_stock jsonb DEFAULT '{}',
    received_stock jsonb DEFAULT '{}',
    sales_stock jsonb DEFAULT '{}',
    closing_stock jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, station_id, date)
);

-- Add station_id to existing tables
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS station_id uuid REFERENCES public.stations(id);
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS station_id uuid REFERENCES public.stations(id);
ALTER TABLE public.daily_summaries ADD COLUMN IF NOT EXISTS station_id uuid REFERENCES public.stations(id);
ALTER TABLE public.daily_summaries ADD COLUMN IF NOT EXISTS liters_sold jsonb DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_inventory_summary ENABLE ROW LEVEL SECURITY;

-- RLS policies for stations
CREATE POLICY "Users can view stations they own or are members of"
    ON public.stations FOR SELECT
    USING (
        owner_id = auth.uid() OR 
        id IN (SELECT station_id FROM public.station_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create their own stations"
    ON public.stations FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Station owners can update their stations"
    ON public.stations FOR UPDATE
    USING (owner_id = auth.uid());

-- RLS policies for station_members
CREATE POLICY "Users can view station members for their stations"
    ON public.station_members FOR SELECT
    USING (
        station_id IN (
            SELECT id FROM public.stations 
            WHERE owner_id = auth.uid() OR 
            id IN (SELECT station_id FROM public.station_members WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Station owners can manage members"
    ON public.station_members FOR ALL
    USING (
        station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
    )
    WITH CHECK (
        station_id IN (SELECT id FROM public.stations WHERE owner_id = auth.uid())
    );

-- RLS policies for inventory
CREATE POLICY "Users can manage inventory for their stations"
    ON public.inventory FOR ALL
    USING (
        station_id IN (
            SELECT id FROM public.stations 
            WHERE owner_id = auth.uid() OR 
            id IN (SELECT station_id FROM public.station_members WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        station_id IN (
            SELECT id FROM public.stations 
            WHERE owner_id = auth.uid() OR 
            id IN (SELECT station_id FROM public.station_members WHERE user_id = auth.uid())
        )
    );

-- RLS policies for daily_inventory_summary
CREATE POLICY "Users can manage daily inventory for their stations"
    ON public.daily_inventory_summary FOR ALL
    USING (
        station_id IN (
            SELECT id FROM public.stations 
            WHERE owner_id = auth.uid() OR 
            id IN (SELECT station_id FROM public.station_members WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        station_id IN (
            SELECT id FROM public.stations 
            WHERE owner_id = auth.uid() OR 
            id IN (SELECT station_id FROM public.station_members WHERE user_id = auth.uid())
        )
    );

-- Update existing RLS policies to include station filtering
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view transactions for their stations"
    ON public.transactions FOR SELECT
    USING (
        user_id = auth.uid() OR 
        station_id IN (
            SELECT id FROM public.stations 
            WHERE owner_id = auth.uid() OR 
            id IN (SELECT station_id FROM public.station_members WHERE user_id = auth.uid())
        )
    );

-- Function to calculate liters from amounts
CREATE OR REPLACE FUNCTION public.calculate_liters_from_amount(amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb := '{}';
    remaining numeric := amount;
    liters_20 integer := 0;
    liters_10 integer := 0;
    liters_5 integer := 0;
    liters_1 integer := 0;
    liters_0_5 integer := 0;
BEGIN
    -- 200 KSh = 20 liters
    IF remaining >= 200 THEN
        liters_20 := floor(remaining / 200);
        remaining := remaining - (liters_20 * 200);
    END IF;
    
    -- 100 KSh = 10 liters
    IF remaining >= 100 THEN
        liters_10 := floor(remaining / 100);
        remaining := remaining - (liters_10 * 100);
    END IF;
    
    -- 50 KSh = 5 liters
    IF remaining >= 50 THEN
        liters_5 := floor(remaining / 50);
        remaining := remaining - (liters_5 * 50);
    END IF;
    
    -- 10 KSh = 1 liter
    IF remaining >= 10 THEN
        liters_1 := floor(remaining / 10);
        remaining := remaining - (liters_1 * 10);
    END IF;
    
    -- 5 KSh = 0.5 liters
    IF remaining >= 5 THEN
        liters_0_5 := floor(remaining / 5);
    END IF;
    
    result := jsonb_build_object(
        '20L', liters_20,
        '10L', liters_10,
        '5L', liters_5,
        '1L', liters_1,
        '0.5L', liters_0_5,
        'total_liters', (liters_20 * 20) + (liters_10 * 10) + (liters_5 * 5) + (liters_1 * 1) + (liters_0_5 * 0.5)
    );
    
    RETURN result;
END;
$$;
