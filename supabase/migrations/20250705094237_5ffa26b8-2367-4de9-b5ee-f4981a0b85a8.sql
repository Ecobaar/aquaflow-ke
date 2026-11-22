
-- Add user_id columns to existing tables for multi-user support
ALTER TABLE public.customers ADD COLUMN user_id UUID REFERENCES auth.users;
ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users;
ALTER TABLE public.expenses ADD COLUMN user_id UUID REFERENCES auth.users;

-- Add customer_name to transactions for easier debt tracking
ALTER TABLE public.transactions ADD COLUMN customer_name TEXT;
ALTER TABLE public.transactions ADD COLUMN description TEXT;
ALTER TABLE public.transactions ADD COLUMN paid_status BOOLEAN DEFAULT true;

-- Create daily_summaries table for the Records tab
CREATE TABLE public.daily_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  cash_total DECIMAL(10,2) DEFAULT 0.00,
  till_total DECIMAL(10,2) DEFAULT 0.00,
  debt_total DECIMAL(10,2) DEFAULT 0.00,
  total_sales DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create debt_notifications table for AI assistant tracking
CREATE TABLE public.debt_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  customer_id BIGINT REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  debt_amount DECIMAL(10,2) NOT NULL,
  transaction_date DATE NOT NULL,
  last_notification_sent TIMESTAMP WITH TIME ZONE,
  is_cleared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers
CREATE POLICY "Users can view their own customers" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own customers" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own customers" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own customers" ON public.customers
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for daily_summaries
CREATE POLICY "Users can view their own daily summaries" ON public.daily_summaries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own daily summaries" ON public.daily_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily summaries" ON public.daily_summaries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily summaries" ON public.daily_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for debt_notifications
CREATE POLICY "Users can view their own debt notifications" ON public.debt_notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own debt notifications" ON public.debt_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own debt notifications" ON public.debt_notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debt notifications" ON public.debt_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update daily summaries
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily summary for the transaction date
  INSERT INTO public.daily_summaries (
    user_id, 
    date, 
    cash_total, 
    till_total, 
    debt_total, 
    total_sales,
    updated_at
  )
  SELECT 
    NEW.user_id,
    NEW.created_at::date,
    COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_method = 'till' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_method = 'debt' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(amount), 0),
    now()
  FROM public.transactions 
  WHERE user_id = NEW.user_id AND created_at::date = NEW.created_at::date
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    cash_total = EXCLUDED.cash_total,
    till_total = EXCLUDED.till_total,
    debt_total = EXCLUDED.debt_total,
    total_sales = EXCLUDED.total_sales,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update daily summaries
DROP TRIGGER IF EXISTS update_daily_summary_trigger ON public.transactions;
CREATE TRIGGER update_daily_summary_trigger
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_daily_summary();
