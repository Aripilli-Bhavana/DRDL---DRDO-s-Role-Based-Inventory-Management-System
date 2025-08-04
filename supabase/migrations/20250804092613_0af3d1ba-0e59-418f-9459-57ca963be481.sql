-- Create enum types for roles and status
CREATE TYPE public.app_role AS ENUM ('admin', 'division_personnel', 'scientist');
CREATE TYPE public.inventory_status AS ENUM ('active', 'maintenance', 'retired');
CREATE TYPE public.calibration_status AS ENUM ('current', 'due', 'overdue');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create divisions table
CREATE TABLE public.divisions (
  id VARCHAR(1) PRIMARY KEY CHECK (id ~ '^[A-H]$'),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'scientist',
  division_id VARCHAR(1) REFERENCES public.divisions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT division_required_for_non_admin CHECK (
    (role = 'admin' AND division_id IS NULL) OR 
    (role != 'admin' AND division_id IS NOT NULL)
  )
);

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  location TEXT NOT NULL,
  status public.inventory_status NOT NULL DEFAULT 'active',
  division_id VARCHAR(1) NOT NULL REFERENCES public.divisions(id),
  added_by UUID NOT NULL REFERENCES public.profiles(id),
  scientist_assigned UUID REFERENCES public.profiles(id),
  calibration_date DATE NOT NULL,
  calibration_status public.calibration_status NOT NULL DEFAULT 'current',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requests table for approval workflows
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scientist_id UUID NOT NULL REFERENCES public.profiles(id),
  item_requested TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT NOT NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  division_id VARCHAR(1) NOT NULL REFERENCES public.divisions(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table for audit trails
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  division_id VARCHAR(1) NOT NULL REFERENCES public.divisions(id),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_division(user_id UUID)
RETURNS VARCHAR(1)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT division_id FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = user_id;
$$;

-- RLS Policies for divisions table
CREATE POLICY "Anyone can view divisions" ON public.divisions
  FOR SELECT USING (true);

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Division personnel can view profiles in their division" ON public.profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'division_personnel' 
    AND division_id = public.get_user_division(auth.uid())
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for inventory_items table - STRICT DIVISION ISOLATION
CREATE POLICY "Scientists can only view their division inventory" ON public.inventory_items
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'scientist' 
    AND division_id = public.get_user_division(auth.uid())
  );

CREATE POLICY "Division personnel can manage their division inventory" ON public.inventory_items
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'division_personnel' 
    AND division_id = public.get_user_division(auth.uid())
  );

CREATE POLICY "Admins can view all inventory" ON public.inventory_items
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all inventory" ON public.inventory_items
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all inventory" ON public.inventory_items
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all inventory" ON public.inventory_items
  FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for requests table - STRICT DIVISION ISOLATION
CREATE POLICY "Scientists can view their own requests" ON public.requests
  FOR SELECT USING (
    scientist_id = auth.uid() 
    AND division_id = public.get_user_division(auth.uid())
  );

CREATE POLICY "Scientists can create requests in their division" ON public.requests
  FOR INSERT WITH CHECK (
    scientist_id = auth.uid() 
    AND division_id = public.get_user_division(auth.uid())
    AND public.get_user_role(auth.uid()) = 'scientist'
  );

CREATE POLICY "Division personnel can view requests in their division" ON public.requests
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'division_personnel' 
    AND division_id = public.get_user_division(auth.uid())
  );

CREATE POLICY "Division personnel can update requests in their division" ON public.requests
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) = 'division_personnel' 
    AND division_id = public.get_user_division(auth.uid())
  );

CREATE POLICY "Admins can view all requests" ON public.requests
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all requests" ON public.requests
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for activity_logs table - STRICT DIVISION ISOLATION
CREATE POLICY "Users can only view logs from their division" ON public.activity_logs
  FOR SELECT USING (
    (public.get_user_role(auth.uid()) != 'admin' AND division_id = public.get_user_division(auth.uid()))
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "All authenticated users can create logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_divisions_updated_at
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, division_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'scientist'),
    NEW.raw_user_meta_data->>'division_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial divisions
INSERT INTO public.divisions (id, name, description) VALUES
  ('A', 'Division A', 'Advanced Computing & AI Research'),
  ('B', 'Division B', 'Quantum Technology Development'),
  ('C', 'Division C', 'Cybersecurity & Information Warfare'),
  ('D', 'Division D', 'Autonomous Systems & Robotics'),
  ('E', 'Division E', 'Materials Science & Engineering'),
  ('F', 'Division F', 'Aerospace & Propulsion Systems'),
  ('G', 'Division G', 'Electronic Warfare & Communications'),
  ('H', 'Division H', 'Bio-Defense & Chemical Systems');

-- Create indexes for better performance
CREATE INDEX idx_profiles_division_role ON public.profiles(division_id, role);
CREATE INDEX idx_inventory_division_status ON public.inventory_items(division_id, status);
CREATE INDEX idx_requests_division_status ON public.requests(division_id, status);
CREATE INDEX idx_activity_logs_division_created ON public.activity_logs(division_id, created_at DESC);
CREATE INDEX idx_inventory_calibration_status ON public.inventory_items(calibration_status, calibration_date);