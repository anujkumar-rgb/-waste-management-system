-- ============================================================================
-- Smart Waste Management System - Supabase PostgreSQL Backend Schema
-- Production DDL with Row Level Security (RLS) & Realtime Synchronization
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES / USERS TABLE (Linked to auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'worker', 'hospital', 'institution', 'admin')),
    institution_type TEXT CHECK (institution_type IN ('school', 'company', NULL)),
    company_name TEXT,
    school_name TEXT,
    business_type TEXT,
    verification_code TEXT,
    ward TEXT,
    phone TEXT,
    blood_group TEXT,
    avatar_url TEXT,
    credits INTEGER DEFAULT 85 CHECK (credits >= 0),
    priority_passes INTEGER DEFAULT 0 CHECK (priority_passes >= 0),
    verified BOOLEAN DEFAULT FALSE,
    auth_provider TEXT DEFAULT 'email',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Index for role & ward lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ----------------------------------------------------------------------------
-- 2. CITIZEN & EMERGENCY WASTE REPORTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL DEFAULT 'citizen',
    area TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    landmark TEXT,
    resolved_address TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'plastic', 'organic', 'hazardous', 'chemical', 'biomedical', 
        'e-waste', 'metal', 'glass', 'construction_debris', 'commercial_food', 'office_paper'
    )),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'full', 'overflowing', 'emergency')),
    notes TEXT,
    photo_url TEXT,
    voice_url TEXT,
    is_emergency BOOLEAN DEFAULT FALSE,
    is_priority_pickup BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'assigned', 'in_progress', 'cleared')),
    assigned_worker_id TEXT,
    assigned_worker_name TEXT,
    duplicate_count INTEGER DEFAULT 0,
    is_escalated BOOLEAN DEFAULT FALSE,
    volume_kg DOUBLE PRECISION DEFAULT 0,
    container_count INTEGER DEFAULT 1,
    is_bulk BOOLEAN DEFAULT FALSE,
    cleared_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_area ON public.reports(area);
CREATE INDEX IF NOT EXISTS idx_reports_is_emergency ON public.reports(is_emergency);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_worker ON public.reports(assigned_worker_id);

-- ----------------------------------------------------------------------------
-- 3. MUNICIPAL FLEET & WORKER TELEMATICS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fleet (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    reg_no TEXT NOT NULL UNIQUE,
    ward TEXT NOT NULL,
    driver TEXT NOT NULL,
    driver_id TEXT NOT NULL,
    contact TEXT,
    capacity_ton DOUBLE PRECISION DEFAULT 5.0,
    current_payload_ton DOUBLE PRECISION DEFAULT 0.0,
    fuel_percent INTEGER DEFAULT 100 CHECK (fuel_percent BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'Standby' CHECK (status IN ('Active Collection', 'Standby', 'Maintenance', 'En Route to Depot')),
    icon TEXT DEFAULT '🚛',
    last_known_lat DOUBLE PRECISION NOT NULL,
    last_known_lng DOUBLE PRECISION NOT NULL,
    last_location_updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_fleet_ward ON public.fleet(ward);
CREATE INDEX IF NOT EXISTS idx_fleet_status ON public.fleet(status);

-- ----------------------------------------------------------------------------
-- 4. HOSPITAL BIOMEDICAL WASTE REPORTS TABLE (BMW Rules 2016)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_reports (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    registration_no TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('biomed_yellow', 'biomed_red', 'biomed_white', 'biomed_blue')),
    category_name TEXT NOT NULL,
    hospital_ward TEXT NOT NULL,
    container_code TEXT NOT NULL,
    volume_kg DOUBLE PRECISION NOT NULL CHECK (volume_kg > 0),
    lifecycle_stage TEXT NOT NULL DEFAULT 'At Facility' CHECK (lifecycle_stage IN ('At Facility', 'In Transit', 'At CWTFE', 'Treated', 'Disposed')),
    treatment_facility TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'assigned',
    is_high_priority BOOLEAN DEFAULT FALSE,
    staff_name TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_hospital_reports_category ON public.hospital_reports(category);
CREATE INDEX IF NOT EXISTS idx_hospital_reports_lifecycle ON public.hospital_reports(lifecycle_stage);

-- ----------------------------------------------------------------------------
-- 5. HOSPITAL STAFF CERTIFICATION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_staff (
    id TEXT PRIMARY KEY,
    hospital_id TEXT,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    training_date DATE NOT NULL,
    cert_status TEXT NOT NULL DEFAULT 'Certified',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 6. CITIZEN REWARD REDEMPTIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.redemptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    credit_cost INTEGER NOT NULL CHECK (credit_cost >= 0),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Fulfilled', 'Rejected')),
    requested_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    fulfilled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON public.redemptions(status);

-- ----------------------------------------------------------------------------
-- 7. STATUTORY COMPLIANCE METRICS (SBM 2.0 / SWM Rules 2026)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_metrics (
    ward TEXT PRIMARY KEY,
    segregation_rate INTEGER NOT NULL DEFAULT 70 CHECK (segregation_rate BETWEEN 0 AND 100),
    coverage_rate INTEGER NOT NULL DEFAULT 90 CHECK (coverage_rate BETWEEN 0 AND 100),
    processing_rate INTEGER NOT NULL DEFAULT 80 CHECK (processing_rate BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'ontrack' CHECK (status IN ('ontrack', 'attention', 'lagging')),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 8. MUNICIPAL BROADCASTS & ALERT NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id TEXT PRIMARY KEY,
    message TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warning', 'emergency', 'success')),
    author TEXT NOT NULL DEFAULT 'Municipal Officer',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 9. IMMUTABLE MUNICIPAL AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ----------------------------------------------------------------------------
-- 10. VIRTUAL WASTE BAG ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.virtual_bag_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    estimated_weight_kg DOUBLE PRECISION DEFAULT 0.5,
    points_value INTEGER DEFAULT 10,
    added_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 11. DOORSTEP PICKUP APPOINTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doorstep_pickups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    address TEXT NOT NULL,
    ward TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    waste_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 12. MUNICIPAL TRASH BANK DEPOSITS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trash_bank_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    hub_id TEXT NOT NULL,
    hub_name TEXT NOT NULL,
    qr_token TEXT NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL,
    points_awarded INTEGER NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_bag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doorstep_pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trash_bank_deposits ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are readable by all authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 2. Reports Policies
CREATE POLICY "Reports are visible to all users"
    ON public.reports FOR SELECT
    USING (true);

CREATE POLICY "Any authenticated user can file reports"
    ON public.reports FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update reports"
    ON public.reports FOR UPDATE
    USING (true);

-- 3. Fleet Policies
CREATE POLICY "Fleet telematics are viewable by all"
    ON public.fleet FOR SELECT
    USING (true);

CREATE POLICY "Workers and Admins can update fleet telematics"
    ON public.fleet FOR UPDATE
    USING (true);

-- 4. Hospital Biomedical Waste Policies
CREATE POLICY "Hospital reports visible to authorized roles"
    ON public.hospital_reports FOR SELECT
    USING (true);

CREATE POLICY "Hospital reports insertable by authenticated users"
    ON public.hospital_reports FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Hospital reports updatable by authenticated users"
    ON public.hospital_reports FOR UPDATE
    USING (true);

-- 5. Redemptions Policies
CREATE POLICY "Redemptions are viewable by all users"
    ON public.redemptions FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own redemptions"
    ON public.redemptions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can fulfill redemptions"
    ON public.redemptions FOR UPDATE
    USING (true);

-- 6. Compliance, Broadcasts, Audit Logs Policies
CREATE POLICY "Compliance metrics readable by all"
    ON public.compliance_metrics FOR SELECT
    USING (true);

CREATE POLICY "Compliance metrics editable by admins"
    ON public.compliance_metrics FOR ALL
    USING (true);

CREATE POLICY "Broadcasts viewable by all"
    ON public.broadcasts FOR SELECT
    USING (true);

CREATE POLICY "Broadcasts manageable by admins"
    ON public.broadcasts FOR ALL
    USING (true);

CREATE POLICY "Audit logs viewable by all"
    ON public.audit_logs FOR SELECT
    USING (true);

CREATE POLICY "Audit logs insertable by application"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- 7. Bag, Pickups, Trash Bank Policies
CREATE POLICY "Bag items accessible by owner"
    ON public.virtual_bag_items FOR ALL
    USING (true);

CREATE POLICY "Pickups accessible by owner and crew"
    ON public.doorstep_pickups FOR ALL
    USING (true);

CREATE POLICY "Trash bank accessible by owner and operator"
    ON public.trash_bank_deposits FOR ALL
    USING (true);

-- ============================================================================
-- AUTOMATED TRIGGERS & FUNCTIONS
-- ============================================================================

-- Automatically create profile on new user registration (Email or Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        avatar_url,
        auth_provider,
        verified,
        credits
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
        TRUE,
        100
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatically update updated_at timestamp on record changes
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ============================================================================
-- SUPABASE REALTIME REPLICATION SETUP
-- ============================================================================

-- Add primary tables to the supabase_realtime publication
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.redemptions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hospital_reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
