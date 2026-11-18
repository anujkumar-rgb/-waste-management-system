-- ============================================================================
-- Smart Waste Management System - Supabase PostgreSQL Seed Data
-- Populates 10 Mumbai Wards, Reports, Telematics Fleet, and BMW Records
-- ============================================================================

-- 1. Statutory Compliance Metrics
INSERT INTO public.compliance_metrics (ward, segregation_rate, coverage_rate, processing_rate, status) VALUES
('Ward G/South - Dadar & Elphinstone', 74, 92, 85, 'ontrack'),
('Ward H/West - Bandra Residential', 68, 88, 82, 'ontrack'),
('Ward K/East - Andheri Industrial Estate', 78, 86, 80, 'ontrack'),
('Ward S - Powai Lake & Tech Enclave', 44, 68, 59, 'offtarget'),
('Ward A - Colaba & Fort Commercial', 62, 84, 81, 'ontrack'),
('Ward D - Malabar Hill & Breach Candy', 92, 95, 90, 'ontrack'),
('Ward K/West - Andheri West & Juhu Coastal', 81, 89, 84, 'ontrack'),
('Ward F/North - Matunga & Sion Central', 72, 85, 79, 'neartarget'),
('Ward M/East - Chembur & Govandi Eco-Hub', 61, 78, 71, 'neartarget'),
('Ward T - Mulund Green Corridor', 84, 91, 88, 'ontrack')
ON CONFLICT (ward) DO UPDATE SET segregation_rate = EXCLUDED.segregation_rate, coverage_rate = EXCLUDED.coverage_rate, processing_rate = EXCLUDED.processing_rate, status = EXCLUDED.status;

-- 2. Municipal Broadcast Alerts
INSERT INTO public.broadcasts (id, message, level, author, active) VALUES
('BC-101', 'Monsoon Protocol Active: Segregate wet organic waste into covered green bins to prevent drain blockages.', 'warning', 'Municipal Sanitation Officer', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Fleet & Telematics Telemetry
INSERT INTO public.fleet (id, type, reg_no, ward, driver, driver_id, contact, capacity_ton, current_payload_ton, fuel_percent, status, icon, last_known_lat, last_known_lng) VALUES
('FLT-CT-401', 'Heavy Hydraulic Compactor (10T)', 'MH-01-GA-4401', 'Ward G/South - Dadar & Elphinstone', 'Rajesh Singh (Crew #101)', 'usr-4', '+91 98112-40192', 10, 7.8, 84, 'Active Collection', '🚛', 19.44052, 72.79481),
('FLT-ET-108', 'Electric Multi-Bin Tipper Auto (1.5T)', 'MH-02-EV-1088', 'Ward H/West - Bandra Residential', 'Sunita Devi (Crew #102)', 'usr-7', '+91 98711-20984', 1.5, 1.35, 68, 'Active Collection', '🛺', 19.0595, 72.8295),
('FLT-BM-09', 'Biomedical Closed-Chamber Van (2T)', 'MH-03-HA-0912', 'Ward K/East - Andheri Industrial Estate', 'Amit Verma (Crew #103)', 'usr-8', '+91 98104-55120', 2, 0.7, 92, 'Active Collection', '🚐', 19.1136, 72.8697),
('FLT-CD-550', 'C&D Debris Hydraulic Dumper (14T)', 'MH-04-CD-5501', 'Ward S - Powai Lake & Tech Enclave', 'Harish Kumar (Crew #104)', 'usr-9', '+91 98119-33829', 14, 8.4, 76, 'Active Collection', '🚜', 19.1255, 72.912),
('FLT-MR-505', 'Mini Tipper E-Rickshaw (0.8T)', 'MH-02-ET-5055', 'Ward R/Central - Borivali West', 'Sachin Kamble (Crew #105)', 'usr-10', '+91 98200-88411', 0.8, 0.2, 95, 'Idle / Off-Shift', '🛺', 19.2307, 72.8567)
ON CONFLICT (id) DO UPDATE SET last_known_lat = EXCLUDED.last_known_lat, last_known_lng = EXCLUDED.last_known_lng, current_payload_ton = EXCLUDED.current_payload_ton, status = EXCLUDED.status;

-- 4. Reports (Civic & Emergency)
INSERT INTO public.reports (id, user_id, user_name, user_role, area, latitude, longitude, landmark, resolved_address, category, severity, notes, is_emergency, is_priority_pickup, status, assigned_worker_id, assigned_worker_name, duplicate_count, is_escalated) VALUES
('REP-1001', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward G/South - Dadar & Elphinstone', 19.021, 72.835, 'City Plaza Market Gate 2 Bin Point', 'Dadar Commercial Plaza Gate 2, Senapati Bapat Marg, Ward G/South', 'plastic', 'overflowing', 'Plastic packaging spillage blocking pedestrian footpath.', false, false, 'cleared', 'usr-4', 'Rajesh Singh (Crew #101)', 1, false),
('EMG-401', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward G/South - Dadar & Elphinstone', 19.019, 72.842, 'Dadar Station Road Chemical Hazard Point', 'Near Dadar Station East Exit, Ward G/South', 'chemical', 'emergency', 'Corrosive industrial battery leakage spreading on pavement.', true, false, 'assigned', 'usr-4', 'Rajesh Singh (Crew #101)', 0, false),
('REP-1004', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward G/South - Dadar & Elphinstone', 19.0168, 72.83, 'Siddhivinayak Temple Perimeter Bins', 'SK Bole Marg, Prabhadevi / Dadar, Ward G/South', 'organic', 'full', 'Flower offerings and coconut husk bio-waste accumulating.', false, false, 'assigned', 'usr-4', 'Rajesh Singh (Crew #101)', 0, false),
('REP-1002', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward H/West - Bandra Residential', 19.058, 72.83, 'Community Park Main Gate', 'Bandra 5th Cross, Community Park Gate, Ward H/West', 'organic', 'full', 'Dry leaves and organic bins filled after morning sweep.', false, false, 'assigned', 'usr-7', 'Sunita Devi (Crew #102)', 2, true),
('REP-1005', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward H/West - Bandra Residential', 19.062, 72.827, 'Pali Hill Market Dry Waste Point', 'Nargis Dutt Road, Pali Hill, Bandra West, Ward H/West', 'plastic', 'overflowing', 'Recyclable packaging from weekend organic food stalls.', false, false, 'assigned', 'usr-7', 'Sunita Devi (Crew #102)', 1, false),
('EMG-402', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward H/West - Bandra Residential', 19.055, 72.834, 'Bandra Polyclinic Alleyway', 'Waterfield Road Lane 3, Bandra West, Ward H/West', 'biomedical', 'emergency', 'Illegal dumping of clinic syringes and biohazard bags.', true, false, 'assigned', 'usr-7', 'Sunita Devi (Crew #102)', 0, false),
('BULK-2002', 'usr-6', 'Tata Consultancy Services, Andheri (E)', 'institution', 'Ward K/East - Andheri Industrial Estate', 19.115, 72.868, 'Server Room Recycling Bay #3', 'Plot 22 MIDC Innovation Park, Andheri East, Ward K/East', 'office_paper', 'full', 'Disposal of 420 kg confidential shredded documentation and corrugated paperboard.', false, false, 'assigned', 'usr-8', 'Amit Verma (Crew #103)', 1, false),
('REP-1006', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward K/East - Andheri Industrial Estate', 19.111, 72.861, 'Chakala Metro Station Footbridge Bin', 'Andheri-Kurla Road, Chakala, Ward K/East', 'plastic', 'overflowing', 'Litter accumulation along metro entry stairway.', false, false, 'assigned', 'usr-8', 'Amit Verma (Crew #103)', 0, false),
('EMG-403', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward K/East - Andheri Industrial Estate', 19.118, 72.875, 'Marol Pipeline Road Industrial Junction', 'Marol Pipeline Rd, Andheri East, Ward K/East', 'chemical', 'emergency', 'Hazardous solvent barrel punctured; chemical runoff approaching storm drain.', true, false, 'assigned', 'usr-8', 'Amit Verma (Crew #103)', 0, false),
('BULK-2001', 'usr-2', 'Bombay Scottish School, Powai', 'institution', 'Ward S - Powai Lake & Tech Enclave', 19.125, 72.915, 'School Cafeteria Loading Dock', 'Plot 4 Technology Corridor, Powai, Ward S', 'commercial_food', 'overflowing', 'Bulk organic food waste from annual school environmental assembly.', false, false, 'assigned', 'usr-9', 'Harish Kumar (Crew #104)', 1, false),
('REP-1007', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward S - Powai Lake & Tech Enclave', 19.119, 72.908, 'Hiranandani Gardens Central Avenue Bins', 'Central Ave, Hiranandani Gardens, Powai, Ward S', 'plastic', 'full', 'E-commerce delivery carton packaging overflowing community cage.', false, false, 'assigned', 'usr-9', 'Harish Kumar (Crew #104)', 0, false),
('EMG-404', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward S - Powai Lake & Tech Enclave', 19.128, 72.905, 'Powai Lake Promenade Storm Drain', 'JVLR Promenade near IIT Gate, Powai, Ward S', 'construction_debris', 'emergency', 'Illegal masonry debris dumping blocking natural storm water runoff during rain alert.', true, false, 'assigned', 'usr-9', 'Harish Kumar (Crew #104)', 0, false),
('REP-1008', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward R/Central - Borivali West', 19.2295, 72.857, 'Borivali Railway Station West Exit', 'Station Road West, Borivali West, Ward R/Central', 'plastic', 'overflowing', 'Single-use snack wrappers and plastic bottles surrounding ticket counter entrance.', false, false, 'assigned', 'usr-10', 'Sachin Kamble (Crew #105)', 2, false),
('REP-1009', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward R/Central - Borivali West', 19.234, 72.852, 'Shimpoli Road Vegetable Market Organic Drop-off', 'Shimpoli Rd, Borivali West, Ward R/Central', 'organic', 'full', 'Vegetable trimmings and wholesale crate greens ready for compost transit.', false, false, 'assigned', 'usr-10', 'Sachin Kamble (Crew #105)', 0, false),
('EMG-405', 'usr-1', 'Ananya Sharma', 'citizen', 'Ward R/Central - Borivali West', 19.238, 72.846, 'Gorai Creek Bridge Access Road', 'Gorai Rd near Creek Gate, Borivali West, Ward R/Central', 'hazardous', 'emergency', 'Overturned industrial grease drum blocking one lane of vehicular traffic.', true, false, 'assigned', 'usr-10', 'Sachin Kamble (Crew #105)', 0, false)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, duplicate_count = EXCLUDED.duplicate_count, is_escalated = EXCLUDED.is_escalated;

-- 5. Biomedical Waste Reports (BMW Rules 2016)
INSERT INTO public.hospital_reports (id, user_id, user_name, registration_no, category, category_name, hospital_ward, container_code, volume_kg, lifecycle_stage, treatment_facility, status) VALUES
('BMW-3001', 'usr-3', 'CityCare Super Specialty Hospital', 'HOSP-NABH-4019', 'biomed_yellow', '🟡 Yellow: Human Anatomical & Soiled Waste', 'ICU Wing 3', 'BMW-BAG-8841', 14.5, 'In Transit', 'CBWTF Sector 9 Central Treatment Plant', 'assigned'),
('BMW-3002', 'usr-3', 'CityCare Super Specialty Hospital', 'HOSP-NABH-4019', 'biomed_red', '🔴 Red: Contaminated Infectious Tubing & Gloves', 'Operation Theatre #2', 'BMW-BAG-9912', 12, 'Registered', 'Eco-Care Incinerator & Autoclave Unit 4', 'reported')
ON CONFLICT (id) DO NOTHING;

-- 6. Hospital Staff Certifications
INSERT INTO public.hospital_staff (id, name, department, training_date, cert_status) VALUES
('st-1', 'Dr. Ramesh Kulkarni', 'Surgery & OT', '2026-08-14', 'Certified (Valid until 2027)'),
('st-2', 'Nurse Sunita Rao', 'ICU Critical Care', '2026-09-02', 'Certified (Annual Refresher Complete)'),
('st-3', 'Vikas Mehra (Sanitation Lead)', 'Hospital Bio-Waste Logistics', '2026-07-20', 'Certified (Valid until 2027)')
ON CONFLICT (id) DO NOTHING;

-- 7. Redemptions Catalog
INSERT INTO public.redemptions (id, user_id, user_name, item_id, item_name, credit_cost, status) VALUES
('RED-501', 'usr-1', 'Ananya Sharma', 'digital_badge', 'Digital Eco-Champion Badge', 0, 'Fulfilled'),
('RED-502', 'usr-1', 'Ananya Sharma', 'sapling', 'Sapling / Native Fruit Plant', 50, 'Requested')
ON CONFLICT (id) DO NOTHING;
