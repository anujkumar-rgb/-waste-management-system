# ⚡ Smart Waste Management System - Supabase PostgreSQL Backend Guide

This project includes a **Supabase PostgreSQL Cloud Backend** featuring:
- **Relational PostgreSQL Schema** with 12 tables, foreign keys, and constraints.
- **Row Level Security (RLS)** protecting profiles, reports, fleet telemetry, and biomedical waste.
- **Supabase Realtime Subscriptions** enabling instant WebSocket sync across citizens, dispatchers, and field crews.
- **Google OAuth 2.0 Integration** via Supabase Authentication.
- **Seed Dataset** covering 10 Mumbai statutory wards, municipal fleet, and compliance targets.

---

## 🚀 3-Minute Quick Setup

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, select your organization, name your project (e.g. `smart-waste-mumbai`), set a secure database password, and choose your preferred region.

### Step 2: Deploy Database Schema & RLS Policies
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Open [`supabase/schema.sql`](supabase/schema.sql), copy its entire content, paste it into the SQL Editor, and click **Run**.
   - This sets up all 12 tables, indexes, RLS security policies, triggers, and Realtime publications.

### Step 3: Populate Mumbai Municipal Seed Data (Optional but Recommended)
1. In the **SQL Editor**, click **New Query**.
2. Open [`supabase/seed.sql`](supabase/seed.sql), copy its entire content, paste it into the SQL Editor, and click **Run**.
   - This populates compliance metrics for 10 wards, municipal compactor/tipper fleet with live GPS coordinates, and historical reports.

### Step 4: Enable Realtime Replication
The `schema.sql` script automatically enables Realtime on the primary tables (`reports`, `fleet`, `broadcasts`, `redemptions`). You can verify this in:
- **Database** > **Replication** > Ensure `supabase_realtime` has the relevant tables enabled.

### Step 5: Connect the Web App
1. In your Supabase Dashboard, go to **Project Settings** > **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API keys** > `anon` `public` key
3. In the Smart Waste Management web app:
   - Click the **⚙️ Configure Supabase Project (URL & Key)** link in the login dialog or open `#supabaseConfigModal`.
   - Paste your **Project URL** and **Anon Key**, then click **Save & Connect**.
   - The status indicator will turn green: `🟢 Realtime PostgreSQL Connected`.

---

## 📊 Database Schema Overview

| Table Name | Description | RLS Policy |
|------------|-------------|------------|
| `public.profiles` | Citizen, Worker, Hospital & Institution user profiles linked to `auth.users` | Public read, user-restricted update |
| `public.reports` | Civic and emergency waste complaints with lat/lng & status | Public read, authenticated create/update |
| `public.fleet` | Live municipal vehicle telematics (GPS, load, status) | Public read, crew/admin update |
| `public.hospital_reports` | Biomedical waste tracking compliant with BMW Rules 2016 | Authenticated read/write |
| `public.hospital_staff` | NABH staff training compliance certifications | Authenticated read |
| `public.redemptions` | Citizen reward store redemption requests & fulfillment | User-specific read/create, admin fulfill |
| `public.compliance_metrics` | SBM 2.0 / SWM Rules 2026 ward statutory metrics | Public read, admin update |
| `public.broadcasts` | Municipal sanitation emergency alerts | Public read, admin create |
| `public.audit_logs` | Immutable municipal administrative action audit trail | Admin read, application append |
| `public.virtual_bag_items` | Resident's digital waste segregation stash items | Owner read/write |
| `public.doorstep_pickups` | Scheduled bulky & recyclable doorstep collections | Owner & crew read/write |
| `public.trash_bank_deposits` | Municipal Trash Bank drop-offs with QR token | Owner & operator read/write |

---

## ⚡ Realtime Capabilities
When enabled, changes in the Supabase PostgreSQL database propagate instantly to all clients via WebSockets:
- When a citizen files a report, it instantly appears on the dispatcher's Admin Hotspot Map without refreshing.
- When an admin dispatches or clears a report, the status changes in real time for citizens and field workers.
- When a worker updates their GPS location, vehicle markers on the Live Tracking Map interpolate smoothly.
- When an emergency broadcast alert is issued, a toast notification is displayed immediately.
