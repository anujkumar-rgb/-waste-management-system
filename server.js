const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8'
};

// Seed Entities
const DEFAULT_DB = {
  users: [
    { 
      id: 'usr-1', 
      email: 'citizen@ecoclear.org', 
      pass: 'demo123', 
      name: 'Ananya Sharma', 
      role: 'citizen', 
      credits: 85,
      transactions: [
        { date: '2026-09-21 10:15', reason: 'Initial Registration Bonus', amount: 30 },
        { date: '2026-09-22 14:30', reason: 'Bin Report REP-1001 Filed', amount: 5 },
        { date: '2026-09-23 09:00', reason: 'Photo Segregation Verified Bonus', amount: 15 },
        { date: '2026-09-23 11:20', reason: 'Emergency Hazard Alert EMG-402', amount: 25 },
        { date: '2026-09-23 11:45', reason: 'Redeemed Digital Eco-Champion Badge', amount: 0 }
      ]
    },
    { 
      id: 'usr-2', 
      email: 'school@cityedu.org', 
      pass: 'demo123', 
      name: 'Bombay Scottish School, Powai', 
      role: 'institution', 
      institutionType: 'school',
      schoolName: 'Bombay Scottish School, Powai',
      verificationCode: 'INST-SCH-8821',
      branches: [
        { id: 'br-dps-main', name: 'Powai Senior Campus', ward: 'Ward S - Powai Lake & Tech Enclave', address: 'Plot 4, Technology Corridor, Powai', lat: 19.1250, lng: 72.9150 },
        { id: 'br-dps-junior', name: 'Dadar Junior Wing', ward: 'Ward G/South - Dadar & Elphinstone', address: 'Near Shivaji Park, Dadar West', lat: 19.0220, lng: 72.8380 }
      ],
      activeBranchId: 'br-dps-main',
      recurringSchedule: { frequency: 'daily', timeSlot: '06:00 - 08:00 AM' },
      selfAudits: [
        { date: '2026-09-15', rate: 92, stream: 'Wet Canteen & Food Waste' }
      ]
    },
    { 
      id: 'usr-6', 
      email: 'infosys@campus.org', 
      pass: 'demo123', 
      name: 'Tata Consultancy Services, Andheri (E)', 
      role: 'institution', 
      institutionType: 'company',
      companyName: 'Tata Consultancy Services, Andheri (E)',
      businessType: 'IT / Tech Office',
      verificationCode: 'CORP-TCS-4401',
      branches: [
        { id: 'br-infy-main', name: 'Andheri Tech Park', ward: 'Ward K/East - Andheri Industrial Estate', address: 'Plot 22, MIDC Innovation Park, Andheri East', lat: 19.1150, lng: 72.8680 },
        { id: 'br-infy-dev', name: 'Bandra Development Center', ward: 'Ward H/West - Bandra Residential', address: 'Tower 3, Hill Road Tech Center, Bandra', lat: 19.0580, lng: 72.8310 }
      ],
      activeBranchId: 'br-infy-main',
      recurringSchedule: { frequency: 'daily', timeSlot: '20:00 - 22:00 PM' },
      selfAudits: [
        { date: '2026-09-18', rate: 95, stream: 'Paper & Packaging Cardboard' }
      ]
    },
    { 
      id: 'usr-3', 
      email: 'citycare@hospital.org', 
      pass: 'demo123', 
      name: 'CityCare Super Specialty Hospital', 
      role: 'hospital', 
      verificationCode: 'HOSP-NABH-4019',
      hazardThreshold: 25,
      credits: 60,
      transactions: [
        { date: '2026-09-20 08:00', reason: 'Biomedical Waste Registration', amount: 10 },
        { date: '2026-09-22 16:30', reason: 'Hazardous Stream Clearance Compliant', amount: 50 }
      ]
    },
    { 
      id: 'usr-4', 
      email: 'crew101@cleanward.org', 
      pass: 'demo123', 
      name: 'Rajesh Singh (Crew #101)', 
      crewNumber: '101',
      phone: '+91 98112-40192',
      emergencyContact: '+91 98200-11223 (Kavita Singh - Spouse)',
      bloodGroup: 'O+',
      mcgmBadgeId: 'MCGM-SWM-4019',
      assignedDepot: 'Prabhadevi Municipal Motor Garage',
      shiftTiming: '06:00 AM - 02:00 PM (Morning General)',
      yearsOfService: 8,
      medicalClearance: '✓ Fit (Tetanus & Hep-B Booster Verified)',
      licenseNumber: 'MH-01-2018-0044192',
      role: 'worker', 
      verificationCode: 'WRK-101',
      assignedWard: 'Ward G/South - Dadar & Elphinstone',
      vehicleType: 'Heavy Hydraulic Compactor (10T)',
      vehicleRegistration: 'MH-01-GA-4401',
      shiftStatus: 'active',
      lastKnownLat: 19.0200,
      lastKnownLng: 72.8350,
      lastLocationUpdatedAt: Date.now() - 120000
    },
    { 
      id: 'usr-7', 
      email: 'crew102@cleanward.org', 
      pass: 'demo123', 
      name: 'Sunita Devi (Crew #102)', 
      crewNumber: '102',
      phone: '+91 98201-44077',
      emergencyContact: '+91 98202-55077 (Anil Devi - Spouse)',
      bloodGroup: 'B+',
      mcgmBadgeId: 'MCGM-SWM-4025',
      assignedDepot: 'Bandra Reclamation Garage',
      shiftTiming: '06:00 AM - 02:00 PM (Morning General)',
      yearsOfService: 6,
      medicalClearance: '✓ Fit (Vaccinated)',
      licenseNumber: 'MH-02-2020-0012377',
      role: 'worker', 
      verificationCode: 'WRK-102',
      assignedWard: 'Ward H/West - Bandra Residential',
      vehicleType: 'Electric Multi-Bin Tipper Auto (1.5T)',
      vehicleRegistration: 'MH-02-EV-1088',
      shiftStatus: 'active',
      lastKnownLat: 19.0595,
      lastKnownLng: 72.8295,
      lastLocationUpdatedAt: Date.now() - 180000
    },
    { 
      id: 'usr-8', 
      email: 'crew103@cleanward.org', 
      pass: 'demo123', 
      name: 'Amit Verma (Crew #103)', 
      crewNumber: '103',
      phone: '+91 98203-88088',
      emergencyContact: '+91 98204-99088 (Pooja Verma - Spouse)',
      bloodGroup: 'A+',
      mcgmBadgeId: 'MCGM-SWM-4026',
      assignedDepot: 'Andheri East SWM Depot',
      shiftTiming: '02:00 PM - 10:00 PM (Afternoon Shift)',
      yearsOfService: 7,
      medicalClearance: '✓ Fit (Biohazard Trained)',
      licenseNumber: 'MH-03-2019-0023488',
      role: 'worker', 
      verificationCode: 'WRK-103',
      assignedWard: 'Ward K/East - Andheri Industrial Estate',
      vehicleType: 'Biomedical Closed-Chamber Van (2T)',
      vehicleRegistration: 'MH-03-HA-0912',
      shiftStatus: 'active',
      lastKnownLat: 19.1136,
      lastKnownLng: 72.8697,
      lastLocationUpdatedAt: Date.now() - 240000
    },
    { 
      id: 'usr-9', 
      email: 'crew104@cleanward.org', 
      pass: 'demo123', 
      name: 'Harish Kumar (Crew #104)', 
      crewNumber: '104',
      phone: '+91 98205-11099',
      emergencyContact: '+91 98206-22099 (Rekha Kumar - Spouse)',
      bloodGroup: 'AB+',
      mcgmBadgeId: 'MCGM-SWM-4027',
      assignedDepot: 'Powai Technology Enclave Yard',
      shiftTiming: '06:00 AM - 02:00 PM (Morning General)',
      yearsOfService: 10,
      medicalClearance: '✓ Fit (Heavy Equipment Cleared)',
      licenseNumber: 'MH-04-2015-0034599',
      role: 'worker', 
      verificationCode: 'WRK-104',
      assignedWard: 'Ward S - Powai Lake & Tech Enclave',
      vehicleType: 'C&D Debris Hydraulic Dumper (14T)',
      vehicleRegistration: 'MH-04-CD-5501',
      shiftStatus: 'active',
      lastKnownLat: 19.1255,
      lastKnownLng: 72.9120,
      lastLocationUpdatedAt: Date.now() - 300000
    },
    { 
      id: 'usr-10', 
      email: 'crew105@cleanward.org', 
      pass: 'demo123', 
      name: 'Sachin Kamble (Crew #105)', 
      crewNumber: '105',
      phone: '+91 98207-33100',
      emergencyContact: '+91 98208-44100 (Sunil Kamble - Brother)',
      bloodGroup: 'O-',
      mcgmBadgeId: 'MCGM-SWM-4028',
      assignedDepot: 'Borivali West Municipal Depot',
      shiftTiming: '10:00 PM - 06:00 AM (Night Sweep)',
      yearsOfService: 4,
      medicalClearance: '✓ Fit (Annual Check Complete)',
      licenseNumber: 'MH-02-2022-0045600',
      role: 'worker', 
      verificationCode: 'WRK-105',
      assignedWard: 'Ward R/Central - Borivali West',
      vehicleType: 'Mini Tipper E-Rickshaw (0.8T)',
      vehicleRegistration: 'MH-02-ET-5055',
      shiftStatus: 'off-shift',
      lastKnownLat: 19.2307,
      lastKnownLng: 72.8567,
      lastLocationUpdatedAt: Date.now() - 3600000
    },
    { 
      id: 'usr-11', 
      email: 'crew106@cleanward.org', 
      pass: 'demo123', 
      name: 'Pooja Shinde (Crew #106)', 
      crewNumber: '106',
      role: 'worker', 
      verificationCode: 'WRK-106',
      assignedWard: 'Ward D - Malabar Hill & Breach Candy',
      phone: '+91 98201-55011',
      emergencyContact: '+91 98202-66011 (Suresh Shinde - Spouse)',
      bloodGroup: 'A+',
      mcgmBadgeId: 'MCGM-SWM-4020',
      assignedDepot: 'Grant Road Ward Depot',
      shiftTiming: '06:00 AM - 02:00 PM',
      yearsOfService: 5,
      medicalClearance: '✓ Fit (Hep-B Active)',
      licenseNumber: 'MH-01-2021-0081234',
      vehicleType: 'Eco Tipper Van (1.5T)',
      vehicleRegistration: 'MH-01-EV-6011',
      shiftStatus: 'active',
      lastKnownLat: 18.9667,
      lastKnownLng: 72.8055,
      lastLocationUpdatedAt: Date.now() - 150000
    },
    { 
      id: 'usr-12', 
      email: 'crew107@cleanward.org', 
      pass: 'demo123', 
      name: 'Deepak Jadhav (Crew #107)', 
      crewNumber: '107',
      role: 'worker', 
      verificationCode: 'WRK-107',
      assignedWard: 'Ward K/West - Andheri West & Juhu Coastal',
      phone: '+91 98203-77012',
      emergencyContact: '+91 98204-88012 (Sunita Jadhav - Mother)',
      bloodGroup: 'B+',
      mcgmBadgeId: 'MCGM-SWM-4021',
      assignedDepot: 'Versova Mechanical Yard',
      shiftTiming: '07:00 AM - 03:00 PM',
      yearsOfService: 6,
      medicalClearance: '✓ Fit (Annual Audio OK)',
      licenseNumber: 'MH-02-2019-0092345',
      vehicleType: 'Beach Sand Cleaner & Compactor (8T)',
      vehicleRegistration: 'MH-02-SC-7012',
      shiftStatus: 'active',
      lastKnownLat: 19.1200,
      lastKnownLng: 72.8250,
      lastLocationUpdatedAt: Date.now() - 200000
    },
    { 
      id: 'usr-13', 
      email: 'crew108@cleanward.org', 
      pass: 'demo123', 
      name: 'Santosh Gaikwad (Crew #108)', 
      crewNumber: '108',
      role: 'worker', 
      verificationCode: 'WRK-108',
      assignedWard: 'Ward F/North - Matunga & Sion Central',
      phone: '+91 98205-99013',
      emergencyContact: '+91 98206-11013 (Rani Gaikwad - Spouse)',
      bloodGroup: 'AB+',
      mcgmBadgeId: 'MCGM-SWM-4022',
      assignedDepot: 'Matunga Central Garage',
      shiftTiming: '06:00 AM - 02:00 PM',
      yearsOfService: 9,
      medicalClearance: '✓ Fit (Booster Verified)',
      licenseNumber: 'MH-01-2016-0033456',
      vehicleType: 'Heavy Compactor (10T)',
      vehicleRegistration: 'MH-01-HC-8013',
      shiftStatus: 'active',
      lastKnownLat: 19.0350,
      lastKnownLng: 72.8550,
      lastLocationUpdatedAt: Date.now() - 250000
    },
    { 
      id: 'usr-14', 
      email: 'crew109@cleanward.org', 
      pass: 'demo123', 
      name: 'Manoj Kamble (Crew #109)', 
      crewNumber: '109',
      role: 'worker', 
      verificationCode: 'WRK-109',
      assignedWard: 'Ward M/East - Chembur & Govandi Eco-Hub',
      phone: '+91 98207-22014',
      emergencyContact: '+91 98208-33014 (Ajay Kamble - Brother)',
      bloodGroup: 'O-',
      mcgmBadgeId: 'MCGM-SWM-4023',
      assignedDepot: 'Deonar Solid Waste Facility Garage',
      shiftTiming: '02:00 PM - 10:00 PM',
      yearsOfService: 11,
      medicalClearance: '✓ Fit (Pulmonary Clear)',
      licenseNumber: 'MH-03-2014-0014567',
      vehicleType: 'Refuse Collector Truck (12T)',
      vehicleRegistration: 'MH-03-RC-9014',
      shiftStatus: 'active',
      lastKnownLat: 19.0550,
      lastKnownLng: 72.9050,
      lastLocationUpdatedAt: Date.now() - 300000
    },
    { 
      id: 'usr-15', 
      email: 'crew110@cleanward.org', 
      pass: 'demo123', 
      name: 'Vijay Patil (Crew #110)', 
      crewNumber: '110',
      role: 'worker', 
      verificationCode: 'WRK-110',
      assignedWard: 'Ward T - Mulund Green Corridor',
      phone: '+91 98209-44015',
      emergencyContact: '+91 98210-55015 (Meena Patil - Spouse)',
      bloodGroup: 'A-',
      mcgmBadgeId: 'MCGM-SWM-4024',
      assignedDepot: 'Mulund Check Naka Depot',
      shiftTiming: '06:00 AM - 02:00 PM',
      yearsOfService: 4,
      medicalClearance: '✓ Fit (Full Clearance)',
      licenseNumber: 'MH-04-2022-0055678',
      vehicleType: 'Electric Tipper Auto (1.5T)',
      vehicleRegistration: 'MH-04-EV-1015',
      shiftStatus: 'active',
      lastKnownLat: 19.1750,
      lastKnownLng: 72.9550,
      lastLocationUpdatedAt: Date.now() - 350000
    },
    { 
      id: 'usr-5', 
      email: 'admin@citygov.org', 
      pass: 'demo123', 
      name: 'Municipal Sanitation Officer', 
      role: 'admin', 
      verificationCode: 'ADMIN2026' 
    }
  ],
  reports: [
    {
      id: 'REP-1001',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward G/South - Dadar & Elphinstone',
      coords: { lat: 19.0210, lng: 72.8350 },
      latitude: 19.0210,
      longitude: 72.8350,
      landmark: 'City Plaza Market Gate 2 Bin Point',
      resolvedAddress: 'Dadar Commercial Plaza Gate 2, Senapati Bapat Marg, Ward G/South',
      category: 'plastic',
      severity: 'overflowing',
      notes: 'Plastic packaging spillage blocking pedestrian footpath.',
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-4',
      assignedWorkerName: 'Rajesh Singh (Crew #101)',
      createdAt: Date.now() - 45 * 60 * 1000,
      duplicateCount: 1,
      isEscalated: false
    },
    {
      id: 'EMG-401',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward G/South - Dadar & Elphinstone',
      coords: { lat: 19.0190, lng: 72.8420 },
      latitude: 19.0190,
      longitude: 72.8420,
      landmark: 'Dadar Station Road Chemical Hazard Point',
      resolvedAddress: 'Near Dadar Station East Exit, Ward G/South',
      category: 'chemical',
      severity: 'emergency',
      notes: 'Corrosive industrial battery leakage spreading on pavement.',
      isEmergency: true,
      status: 'assigned',
      assignedWorkerId: 'usr-4',
      assignedWorkerName: 'Rajesh Singh (Crew #101)',
      createdAt: Date.now() - 15 * 60 * 1000,
      duplicateCount: 0,
      isEscalated: false
    },
    {
      id: 'REP-1004',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward G/South - Dadar & Elphinstone',
      coords: { lat: 19.0168, lng: 72.8300 },
      latitude: 19.0168,
      longitude: 72.8300,
      landmark: 'Siddhivinayak Temple Perimeter Bins',
      resolvedAddress: 'SK Bole Marg, Prabhadevi / Dadar, Ward G/South',
      category: 'organic',
      severity: 'full',
      notes: 'Flower offerings and coconut husk bio-waste accumulating.',
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-4',
      assignedWorkerName: 'Rajesh Singh (Crew #101)',
      createdAt: Date.now() - 50 * 60 * 1000,
      duplicateCount: 0,
      isEscalated: false
    },
    {
      id: 'REP-1002',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward H/West - Bandra Residential',
      coords: { lat: 19.0580, lng: 72.8300 },
      latitude: 19.0580,
      longitude: 72.8300,
      landmark: 'Community Park Main Gate',
      resolvedAddress: 'Bandra 5th Cross, Community Park Gate, Ward H/West',
      category: 'organic',
      severity: 'full',
      notes: 'Dry leaves and organic bins filled after morning sweep.',
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-7',
      assignedWorkerName: 'Sunita Devi (Crew #102)',
      createdAt: Date.now() - (26 * 60 * 60 * 1000),
      assignedAt: Date.now() - (25 * 60 * 60 * 1000),
      duplicateCount: 2,
      isEscalated: true
    },
    {
      id: 'REP-1005',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward H/West - Bandra Residential',
      coords: { lat: 19.0620, lng: 72.8270 },
      latitude: 19.0620,
      longitude: 72.8270,
      landmark: 'Pali Hill Market Dry Waste Point',
      resolvedAddress: 'Nargis Dutt Road, Pali Hill, Bandra West, Ward H/West',
      category: 'plastic',
      severity: 'overflowing',
      notes: 'Recyclable packaging from weekend organic food stalls.',
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-7',
      assignedWorkerName: 'Sunita Devi (Crew #102)',
      createdAt: Date.now() - 80 * 60 * 1000,
      duplicateCount: 1,
      isEscalated: false
    },
    {
      id: 'EMG-402',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward H/West - Bandra Residential',
      coords: { lat: 19.0550, lng: 72.8340 },
      latitude: 19.0550,
      longitude: 72.8340,
      landmark: 'Bandra Polyclinic Alleyway',
      resolvedAddress: 'Waterfield Road Lane 3, Bandra West, Ward H/West',
      category: 'biomedical',
      severity: 'emergency',
      notes: 'Illegal dumping of clinic syringes and biohazard bags.',
      isEmergency: true,
      status: 'assigned',
      assignedWorkerId: 'usr-7',
      assignedWorkerName: 'Sunita Devi (Crew #102)',
      createdAt: Date.now() - 20 * 60 * 1000,
      duplicateCount: 0,
      isEscalated: false
    },
    {
      id: 'BULK-2002',
      userId: 'usr-6',
      userName: 'Tata Consultancy Services, Andheri (E)',
      institutionType: 'company',
      companyName: 'Tata Consultancy Services, Andheri (E)',
      businessType: 'IT / Tech Office',
      branchId: 'br-infy-main',
      branchName: 'Andheri Tech Park',
      userRole: 'institution',
      area: 'Ward K/East - Andheri Industrial Estate',
      coords: { lat: 19.1150, lng: 72.8680 },
      latitude: 19.1150,
      longitude: 72.8680,
      landmark: 'Server Room Recycling Bay #3',
      resolvedAddress: 'Plot 22 MIDC Innovation Park, Andheri East, Ward K/East',
      category: 'office_paper',
      severity: 'full',
      notes: 'Disposal of 420 kg confidential shredded documentation and corrugated paperboard.',
      isBulk: true,
      volumeKg: 420,
      containerCount: 6,
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-8',
      assignedWorkerName: 'Amit Verma (Crew #103)',
      createdAt: Date.now() - 60 * 60 * 1000,
      assignedAt: Date.now() - 40 * 60 * 1000,
      duplicateCount: 1,
      isEscalated: false
    },
    {
      id: 'REP-1006',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward K/East - Andheri Industrial Estate',
      coords: { lat: 19.1110, lng: 72.8610 },
      latitude: 19.1110,
      longitude: 72.8610,
      landmark: 'Chakala Metro Station Footbridge Bin',
      resolvedAddress: 'Andheri-Kurla Road, Chakala, Ward K/East',
      category: 'plastic',
      severity: 'overflowing',
      notes: 'Litter accumulation along metro entry stairway.',
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-8',
      assignedWorkerName: 'Amit Verma (Crew #103)',
      createdAt: Date.now() - 75 * 60 * 1000,
      duplicateCount: 0,
      isEscalated: false
    },
    {
      id: 'EMG-403',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward K/East - Andheri Industrial Estate',
      coords: { lat: 19.1180, lng: 72.8750 },
      latitude: 19.1180,
      longitude: 72.8750,
      landmark: 'Marol Pipeline Road Industrial Junction',
      resolvedAddress: 'Marol Pipeline Rd, Andheri East, Ward K/East',
      category: 'chemical',
      severity: 'emergency',
      notes: 'Hazardous solvent barrel punctured; chemical runoff approaching storm drain.',
      isEmergency: true,
      status: 'assigned',
      assignedWorkerId: 'usr-8',
      assignedWorkerName: 'Amit Verma (Crew #103)',
      createdAt: Date.now() - 10 * 60 * 1000,
      duplicateCount: 0,
      isEscalated: false
    },
    {
      id: 'BULK-2001',
      userId: 'usr-2',
      userName: 'Bombay Scottish School, Powai',
      institutionType: 'school',
      schoolName: 'Bombay Scottish School, Powai',
      branchId: 'br-dps-main',
      branchName: 'Powai Senior Campus',
      userRole: 'institution',
      area: 'Ward S - Powai Lake & Tech Enclave',
      coords: { lat: 19.1250, lng: 72.9150 },
      latitude: 19.1250,
      longitude: 72.9150,
      landmark: 'School Cafeteria Loading Dock',
      resolvedAddress: 'Plot 4 Technology Corridor, Powai, Ward S',
      category: 'commercial_food',
      severity: 'overflowing',
      notes: 'Bulk organic food waste from annual school environmental assembly.',
      isBulk: true,
      volumeKg: 350,
      containerCount: 5,
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-9',
      assignedWorkerName: 'Harish Kumar (Crew #104)',
      createdAt: Date.now() - 30 * 60 * 1000,
      duplicateCount: 1,
      isEscalated: false
    },
    {
      id: 'REP-1007',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward S - Powai Lake & Tech Enclave',
      coords: { lat: 19.1190, lng: 72.9080 },
      latitude: 19.1190,
      longitude: 72.9080,
      landmark: 'Hiranandani Gardens Central Avenue Bins',
      resolvedAddress: 'Central Ave, Hiranandani Gardens, Powai, Ward S',
      category: 'plastic',
      severity: 'full',
      notes: 'E-commerce delivery carton packaging overflowing community cage.',
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-9',
      assignedWorkerName: 'Harish Kumar (Crew #104)',
      createdAt: Date.now() - 95 * 60 * 1000,
      duplicateCount: 0,
      isEscalated: false
    },
    {
      id: 'EMG-404',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward S - Powai Lake & Tech Enclave',
      coords: { lat: 19.1280, lng: 72.9050 },
      latitude: 19.1280,
      longitude: 72.9050,
      landmark: 'Powai Lake Promenade Storm Drain',
      resolvedAddress: 'JVLR Promenade near IIT Gate, Powai, Ward S',
      category: 'construction_debris',
      severity: 'emergency',
      notes: 'Illegal masonry debris dumping blocking natural storm water runoff during rain alert.',
      isEmergency: true,
      status: 'assigned',
      assignedWorkerId: 'usr-9',
      assignedWorkerName: 'Harish Kumar (Crew #104)',
      createdAt: Date.now() - 25 * 60 * 1000,
      duplicateCount: 0,
      isEscalated: false
    },
    {
      id: 'REP-1008',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward R/Central - Borivali West',
      coords: { lat: 19.2295, lng: 72.8570 },
      latitude: 19.2295,
      longitude: 72.8570,
      landmark: 'Borivali Railway Station West Exit',
      resolvedAddress: 'Station Road West, Borivali West, Ward R/Central',
      category: 'plastic',
      severity: 'overflowing',
      notes: 'Single-use snack wrappers and plastic bottles surrounding ticket counter entrance.',
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-10',
      assignedWorkerName: 'Sachin Kamble (Crew #105)',
      createdAt: Date.now() - 110 * 60 * 1000,
      duplicateCount: 2,
      isEscalated: false
    },
    {
      id: 'REP-1009',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward R/Central - Borivali West',
      coords: { lat: 19.2340, lng: 72.8520 },
      latitude: 19.2340,
      longitude: 72.8520,
      landmark: 'Shimpoli Road Vegetable Market Organic Drop-off',
      resolvedAddress: 'Shimpoli Rd, Borivali West, Ward R/Central',
      category: 'organic',
      severity: 'full',
      notes: 'Vegetable trimmings and wholesale crate greens ready for compost transit.',
      isEmergency: false,
      status: 'assigned',
      assignedWorkerId: 'usr-10',
      assignedWorkerName: 'Sachin Kamble (Crew #105)',
      createdAt: Date.now() - 140 * 60 * 1000,
      duplicateCount: 0,
      isEscalated: false
    },
    {
      id: 'EMG-405',
      userId: 'usr-1',
      userName: 'Ananya Sharma',
      userRole: 'citizen',
      area: 'Ward R/Central - Borivali West',
      coords: { lat: 19.2380, lng: 72.8460 },
      latitude: 19.2380,
      longitude: 72.8460,
      landmark: 'Gorai Creek Bridge Access Road',
      resolvedAddress: 'Gorai Rd near Creek Gate, Borivali West, Ward R/Central',
      category: 'hazardous',
      severity: 'emergency',
      notes: 'Overturned industrial grease drum blocking one lane of vehicular traffic.',
      isEmergency: true,
      status: 'assigned',
      assignedWorkerId: 'usr-10',
      assignedWorkerName: 'Sachin Kamble (Crew #105)',
      createdAt: Date.now() - 18 * 60 * 1000,
      duplicateCount: 0,
      isEscalated: false
    }
  ],
  hospital_reports: [
    {
      id: 'BMW-3001',
      userId: 'usr-3',
      userName: 'CityCare Super Specialty Hospital',
      registrationNo: 'HOSP-NABH-4019',
      category: 'biomed_yellow',
      categoryName: '🟡 Yellow: Human Anatomical & Soiled Waste',
      hospitalWard: 'ICU Wing 3',
      containerCode: 'BMW-BAG-8841',
      volumeKg: 14.5,
      lifecycleStage: 'In Transit',
      treatmentFacility: 'CBWTF Sector 9 Central Treatment Plant',
      status: 'assigned',
      createdAt: Date.now() - 90 * 60 * 1000
    },
    {
      id: 'BMW-3002',
      userId: 'usr-3',
      userName: 'CityCare Super Specialty Hospital',
      registrationNo: 'HOSP-NABH-4019',
      category: 'biomed_red',
      categoryName: '🔴 Red: Contaminated Infectious Tubing & Gloves',
      hospitalWard: 'Operation Theatre #2',
      containerCode: 'BMW-BAG-9912',
      volumeKg: 12.0,
      lifecycleStage: 'Registered',
      treatmentFacility: 'Eco-Care Incinerator & Autoclave Unit 4',
      status: 'reported',
      createdAt: Date.now() - 180 * 60 * 1000
    }
  ],
  hospital_staff: [
    { id: 'st-1', name: 'Dr. Ramesh Kulkarni', department: 'Surgery & OT', date: '2026-08-14', certStatus: 'Certified (Valid until 2027)' },
    { id: 'st-2', name: 'Nurse Sunita Rao', department: 'ICU Critical Care', date: '2026-09-02', certStatus: 'Certified (Annual Refresher Complete)' },
    { id: 'st-3', name: 'Vikas Mehra (Sanitation Lead)', department: 'Hospital Bio-Waste Logistics', date: '2026-07-20', certStatus: 'Certified (Valid until 2027)' }
  ],
  redemptions: [
    { 
      id: 'RED-501', 
      userId: 'usr-1', 
      userName: 'Ananya Sharma', 
      itemId: 'digital_badge', 
      itemName: 'Digital Eco-Champion Badge', 
      creditCost: 0, 
      status: 'Fulfilled', 
      requestedAt: Date.now() - (24 * 60 * 60 * 1000), 
      fulfilledAt: Date.now() - (24 * 60 * 60 * 1000) 
    },
    { 
      id: 'RED-502', 
      userId: 'usr-1', 
      userName: 'Ananya Sharma', 
      itemId: 'sapling', 
      itemName: 'Sapling / Native Fruit Plant', 
      creditCost: 50, 
      status: 'Requested', 
      requestedAt: Date.now() - (3 * 60 * 60 * 1000), 
      fulfilledAt: null 
    }
  ],
  compliance_metrics: [
    { ward: 'Ward G/South - Dadar & Elphinstone', segregationRate: 74, coverageRate: 92, processingRate: 85, status: 'ontrack' },
    { ward: 'Ward H/West - Bandra Residential', segregationRate: 68, coverageRate: 88, processingRate: 82, status: 'ontrack' },
    { ward: 'Ward K/East - Andheri Industrial Estate', segregationRate: 78, coverageRate: 86, processingRate: 80, status: 'ontrack' },
    { ward: 'Ward S - Powai Lake & Tech Enclave', segregationRate: 44, coverageRate: 68, processingRate: 59, status: 'offtarget' },
    { ward: 'Ward A - Colaba & Fort Commercial', segregationRate: 62, coverageRate: 84, processingRate: 81, status: 'ontrack' },
    { ward: 'Ward D - Malabar Hill & Breach Candy', segregationRate: 92, coverageRate: 95, processingRate: 90, status: 'ontrack' },
    { ward: 'Ward K/West - Andheri West & Juhu Coastal', segregationRate: 81, coverageRate: 89, processingRate: 84, status: 'ontrack' },
    { ward: 'Ward F/North - Matunga & Sion Central', segregationRate: 72, coverageRate: 85, processingRate: 79, status: 'neartarget' },
    { ward: 'Ward M/East - Chembur & Govandi Eco-Hub', segregationRate: 61, coverageRate: 78, processingRate: 71, status: 'neartarget' },
    { ward: 'Ward T - Mulund Green Corridor', segregationRate: 84, coverageRate: 91, processingRate: 88, status: 'ontrack' }
  ],
  fleet: [
    { id: 'FLT-CT-401', type: 'Heavy Hydraulic Compactor (10T)', regNo: 'MH-01-GA-4401', ward: 'Ward G/South - Dadar & Elphinstone', driver: 'Rajesh Singh (Crew #101)', driverId: 'usr-4', contact: '+91 98112-40192', capacityTon: 10.0, currentPayloadTon: 7.8, fuelPercent: 84, status: 'Active Collection', icon: '🚛', lastKnownLat: 19.0200, lastKnownLng: 72.8350, lastLocationUpdatedAt: Date.now() - 120000 },
    { id: 'FLT-ET-108', type: 'Electric Multi-Bin Tipper Auto (1.5T)', regNo: 'MH-02-EV-1088', ward: 'Ward H/West - Bandra Residential', driver: 'Sunita Devi (Crew #102)', driverId: 'usr-7', contact: '+91 98711-20984', capacityTon: 1.5, currentPayloadTon: 1.35, fuelPercent: 68, status: 'Active Collection', icon: '🛺', lastKnownLat: 19.0595, lastKnownLng: 72.8295, lastLocationUpdatedAt: Date.now() - 180000 },
    { id: 'FLT-BM-09', type: 'Biomedical Closed-Chamber Van (2T)', regNo: 'MH-03-HA-0912', ward: 'Ward K/East - Andheri Industrial Estate', driver: 'Amit Verma (Crew #103)', driverId: 'usr-8', contact: '+91 98104-55120', capacityTon: 2.0, currentPayloadTon: 0.7, fuelPercent: 92, status: 'Active Collection', icon: '🚐', lastKnownLat: 19.1136, lastKnownLng: 72.8697, lastLocationUpdatedAt: Date.now() - 240000 },
    { id: 'FLT-CD-550', type: 'C&D Debris Hydraulic Dumper (14T)', regNo: 'MH-04-CD-5501', ward: 'Ward S - Powai Lake & Tech Enclave', driver: 'Harish Kumar (Crew #104)', driverId: 'usr-9', contact: '+91 98119-33829', capacityTon: 14.0, currentPayloadTon: 8.4, fuelPercent: 76, status: 'Active Collection', icon: '🚜', lastKnownLat: 19.1255, lastKnownLng: 72.9120, lastLocationUpdatedAt: Date.now() - 300000 },
    { id: 'FLT-MR-505', type: 'Mini Tipper E-Rickshaw (0.8T)', regNo: 'MH-02-ET-5055', ward: 'Ward R/Central - Borivali West', driver: 'Sachin Kamble (Crew #105)', driverId: 'usr-10', contact: '+91 98200-88411', capacityTon: 0.8, currentPayloadTon: 0.2, fuelPercent: 95, status: 'Idle / Off-Shift', icon: '🛺', lastKnownLat: 19.2307, lastKnownLng: 72.8567, lastLocationUpdatedAt: Date.now() - 3600000 }
  ],
  broadcasts: [
    {
      id: 'BC-101',
      message: 'Monsoon Protocol Active: Segregate wet organic waste into covered green bins to prevent drain blockages.',
      level: 'warning',
      author: 'Municipal Sanitation Officer',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      active: true
    }
  ],
  audit_logs: [
    { id: 'log-1', timestamp: Date.now() - 3 * 60 * 60 * 1000, actor: 'System', action: 'INIT', details: 'Municipal Waste Management Engine initialized.' },
    { id: 'log-2', timestamp: Date.now() - 2 * 60 * 60 * 1000, actor: 'Admin', action: 'BROADCAST', details: 'Published Monsoon Protocol directive to all municipal sectors.' },
    { id: 'log-3', timestamp: Date.now() - 40 * 60 * 1000, actor: 'Admin', action: 'AUTO_DISPATCH', details: 'Assigned bulk paper collection BULK-2002 to Crew #101.' }
  ]
};

// Database Access Layer with Auto-Persistence
let db = { ...DEFAULT_DB };

function initDatabase() {
  try {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        // Read-only filesystem fallback
      }
    }

    if (fs.existsSync(DB_PATH)) {
      try {
        const content = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(content);
        db = { ...DEFAULT_DB, ...parsed };
        console.log('📦 Database loaded successfully from data/db.json');
      } catch (e) {
        console.warn('⚠️ Error parsing data/db.json. Initializing with default seeds:', e.message);
        saveDatabase();
      }
    } else {
      console.log('🌱 Seeding fresh database at data/db.json...');
      saveDatabase();
    }
  } catch (err) {
    console.warn('⚠️ Fallback to in-memory database:', err.message);
    db = { ...DEFAULT_DB };
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to save database:', err.message);
  }
}

function logAudit(actor, action, details) {
  const entry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    actor: actor || 'Admin',
    action,
    details
  };
  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.unshift(entry);
  if (db.audit_logs.length > 200) db.audit_logs.pop();
  saveDatabase();
  return entry;
}

// Helper: Parse Request Body JSON
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) { // 10MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

// Helper: JSON Response Sender with CORS
function sendJson(res, statusCode, data) {
  if (res.headersSent) return;
  const payload = JSON.stringify(data);
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };
  if (typeof res.writeHead === 'function') {
    res.writeHead(statusCode, headers);
  } else {
    res.statusCode = statusCode;
    Object.entries(headers).forEach(([k, v]) => {
      if (typeof res.setHeader === 'function') res.setHeader(k, v);
    });
  }
  res.end(payload);
}

// REST API Route Handlers
async function handleApiRequest(req, res, parsedUrl) {
  const method = req.method.toUpperCase();
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    };
    if (typeof res.writeHead === 'function') {
      res.writeHead(204, corsHeaders);
    } else {
      res.statusCode = 204;
      Object.entries(corsHeaders).forEach(([k, v]) => {
        if (typeof res.setHeader === 'function') res.setHeader(k, v);
      });
    }
    res.end();
    return true;
  }

  // 1. Health & Server Info
  if (pathname === '/api/health') {
    sendJson(res, 200, {
      status: 'online',
      version: '2.0.0',
      system: 'Smart Waste Management Municipal Server',
      nodeVersion: process.version,
      timestamp: Date.now()
    });
    return true;
  }

  // 2. Operational Stats & Public Transparency Overview
  if (pathname === '/api/stats' || pathname === '/api/transparency') {
    const totalReports = db.reports.length;
    const pending = db.reports.filter(r => r.status === 'reported').length;
    const inProgress = db.reports.filter(r => r.status === 'assigned').length;
    const cleared = db.reports.filter(r => r.status === 'cleared').length;
    const emergency = db.reports.filter(r => r.isEmergency).length;
    const escalated = db.reports.filter(r => r.isEscalated).length;
    const totalHospitalReports = db.hospital_reports.length;
    const pendingRedemptions = db.redemptions.filter(r => r.status === 'Requested').length;
    const activeVehicles = db.fleet.length;

    sendJson(res, 200, {
      success: true,
      stats: {
        totalReports,
        pending,
        inProgress,
        cleared,
        emergency,
        escalated,
        totalHospitalReports,
        pendingRedemptions,
        activeVehicles,
        resolutionRate: totalReports > 0 ? Math.round((cleared / totalReports) * 100) : 0,
        segregationRate: 72,
        doorToDoorCoverage: 88,
        scientificProcessing: 82
      },
      wardRankings: db.compliance_metrics || []
    });
    return true;
  }

  // 3. User Management
  if (pathname === '/api/users') {
    if (method === 'GET') {
      sendJson(res, 200, db.users);
      return true;
    }
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      if (!body.email || !body.role) {
        return sendJson(res, 400, { error: 'Email and role are required' });
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        credits: body.credits || 0,
        transactions: [],
        ...body
      };
      db.users.push(newUser);
      logAudit(body.name || 'System', 'USER_REGISTERED', `Created account for ${body.email} (${body.role})`);
      saveDatabase();
      sendJson(res, 201, newUser);
      return true;
    }
  }

  // 4. Reports API
  if (pathname === '/api/reports') {
    if (method === 'GET') {
      let filtered = [...db.reports];
      if (query.status) filtered = filtered.filter(r => r.status === query.status);
      if (query.role) filtered = filtered.filter(r => r.userRole === query.role);
      if (query.ward) filtered = filtered.filter(r => (r.area || '').includes(query.ward));
      if (query.emergency === 'true') filtered = filtered.filter(r => r.isEmergency);
      sendJson(res, 200, filtered);
      return true;
    }
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const isBulk = !!body.isBulk;
      const prefix = isBulk ? 'BULK' : 'REP';
      const newId = `${prefix}-${Date.now().toString().slice(-4)}`;
      const newReport = {
        id: newId,
        createdAt: Date.now(),
        status: 'reported',
        duplicateCount: 1,
        isEscalated: false,
        ...body
      };
      db.reports.unshift(newReport);
      logAudit(body.userName || 'Citizen', 'REPORT_FILED', `Report ${newId} logged in ${body.area || 'Unknown Ward'}`);
      saveDatabase();
      sendJson(res, 201, newReport);
      return true;
    }
  }

  // Single Report Operations (/api/reports/:id/...)
  const reportMatch = pathname.match(/^\/api\/reports\/([a-zA-Z0-9_-]+)(?:\/(assign|clear|boost|escalate))?$/);
  if (reportMatch) {
    const reportId = reportMatch[1];
    const subAction = reportMatch[2];
    const index = db.reports.findIndex(r => r.id === reportId);

    if (index === -1) {
      sendJson(res, 404, { error: `Report ${reportId} not found` });
      return true;
    }

    if (!subAction) {
      if (method === 'GET') {
        sendJson(res, 200, db.reports[index]);
        return true;
      }
      if (method === 'PUT' || method === 'PATCH') {
        const body = await parseRequestBody(req);
        db.reports[index] = { ...db.reports[index], ...body };
        saveDatabase();
        sendJson(res, 200, db.reports[index]);
        return true;
      }
      if (method === 'DELETE') {
        const removed = db.reports.splice(index, 1)[0];
        logAudit('Admin', 'REPORT_DELETED', `Deleted report ${reportId}`);
        saveDatabase();
        sendJson(res, 200, { success: true, removed });
        return true;
      }
    }

    // Sub-actions
    if (subAction === 'assign' && method === 'POST') {
      const body = await parseRequestBody(req);
      const workerId = body.workerId;
      const worker = db.users.find(u => u.id === workerId);
      db.reports[index].assignedWorkerId = workerId || null;
      db.reports[index].assignedWorkerName = worker ? worker.name : '';
      db.reports[index].status = workerId ? 'assigned' : 'reported';
      db.reports[index].assignedAt = Date.now();
      logAudit('Admin', 'CREW_ASSIGNED', `Assigned ${reportId} to ${worker ? worker.name : 'Unassigned'}`);
      saveDatabase();
      sendJson(res, 200, db.reports[index]);
      return true;
    }

    if (subAction === 'clear' && method === 'POST') {
      const body = await parseRequestBody(req);
      db.reports[index].status = 'cleared';
      db.reports[index].clearedAt = Date.now();
      if (body.proofPhoto) db.reports[index].proofPhoto = body.proofPhoto;
      if (body.resolutionNotes) db.reports[index].resolutionNotes = body.resolutionNotes;
      logAudit(body.actor || 'Admin', 'REPORT_CLEARED', `Report ${reportId} marked cleared and sanitized`);
      saveDatabase();
      sendJson(res, 200, db.reports[index]);
      return true;
    }

    if (subAction === 'boost' && method === 'POST') {
      db.reports[index].isEmergency = true;
      db.reports[index].urgencyBoosted = true;
      db.reports[index].boostedAt = Date.now();
      logAudit('Admin', 'SLA_URGENCY_BOOST', `Urgency boost triggered on ticket ${reportId}`);
      saveDatabase();
      sendJson(res, 200, db.reports[index]);
      return true;
    }

    if (subAction === 'escalate' && method === 'POST') {
      db.reports[index].isEscalated = true;
      db.reports[index].escalatedTo = 'Zonal Municipal Commissioner';
      db.reports[index].escalatedAt = Date.now();
      logAudit('Admin', 'STATUTORY_ESCALATION', `Escalated ${reportId} to Zonal Municipal Commissioner`);
      saveDatabase();
      sendJson(res, 200, db.reports[index]);
      return true;
    }
  }

  // 5. Municipal Fleet & Dispatch
  if (pathname === '/api/fleet') {
    if (method === 'GET') {
      sendJson(res, 200, db.fleet);
      return true;
    }
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const newVehicle = {
        id: `FLT-ST-${Math.floor(100 + Math.random() * 900)}`,
        capacityTon: body.capacityTon || 3.5,
        currentPayloadTon: 0.0,
        fuelPercent: 100,
        status: 'Active Collection',
        icon: '🚛',
        ...body
      };
      db.fleet.push(newVehicle);
      logAudit('Admin', 'FLEET_DISPATCH', `Dispatched standby vehicle ${newVehicle.regNo || newVehicle.id} to ${newVehicle.ward}`);
      saveDatabase();
      sendJson(res, 201, newVehicle);
      return true;
    }
  }

  const fleetMatch = pathname.match(/^\/api\/fleet\/([a-zA-Z0-9_-]+)$/);
  if (fleetMatch) {
    const fleetId = fleetMatch[1];
    const fIdx = db.fleet.findIndex(f => f.id === fleetId);
    if (fIdx === -1) return sendJson(res, 404, { error: 'Vehicle not found' });

    if (method === 'PUT' || method === 'PATCH') {
      const body = await parseRequestBody(req);
      db.fleet[fIdx] = { ...db.fleet[fIdx], ...body };
      logAudit('Admin', 'FLEET_UPDATE', `Updated status of vehicle ${fleetId} to ${body.status || 'Updated'}`);
      saveDatabase();
      sendJson(res, 200, db.fleet[fIdx]);
      return true;
    }
  }

  // 6. Smart Auto-Assignment Engine
  if (pathname === '/api/admin/auto-assign' && method === 'POST') {
    const unassigned = db.reports.filter(r => r.status === 'reported');
    const workers = db.users.filter(u => u.role === 'worker');

    if (workers.length === 0) {
      return sendJson(res, 400, { error: 'No active sanitation workers available for automated dispatch' });
    }

    let assignedCount = 0;
    unassigned.forEach((rep, idx) => {
      const assignedWorker = workers[idx % workers.length];
      rep.status = 'assigned';
      rep.assignedWorkerId = assignedWorker.id;
      rep.assignedWorkerName = assignedWorker.name;
      rep.assignedAt = Date.now();
      assignedCount++;
    });

    logAudit('Admin', 'SMART_AUTO_ASSIGN', `Auto-dispatched ${assignedCount} reports across ${workers.length} municipal crew(s)`);
    saveDatabase();
    sendJson(res, 200, { success: true, count: assignedCount, reports: db.reports });
    return true;
  }

  // 7. Hospital Biomedical Waste Reports
  if (pathname === '/api/hospital-reports') {
    if (method === 'GET') {
      sendJson(res, 200, db.hospital_reports);
      return true;
    }
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const newReport = {
        id: `BMW-${Date.now().toString().slice(-4)}`,
        createdAt: Date.now(),
        lifecycleStage: 'Registered',
        status: 'reported',
        ...body
      };
      db.hospital_reports.unshift(newReport);
      logAudit(body.userName || 'Hospital', 'BMW_LOGGED', `Biomedical container ${newReport.containerCode || newReport.id} registered`);
      saveDatabase();
      sendJson(res, 201, newReport);
      return true;
    }
  }

  // 8. Hospital Staff
  if (pathname === '/api/hospital-staff') {
    if (method === 'GET') {
      sendJson(res, 200, db.hospital_staff);
      return true;
    }
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const newStaff = {
        id: `st-${Date.now().toString().slice(-3)}`,
        date: new Date().toISOString().split('T')[0],
        certStatus: 'Certified (Valid until 2027)',
        ...body
      };
      db.hospital_staff.push(newStaff);
      saveDatabase();
      sendJson(res, 201, newStaff);
      return true;
    }
  }

  // 9. Citizen Redemptions
  if (pathname === '/api/redemptions') {
    if (method === 'GET') {
      sendJson(res, 200, db.redemptions);
      return true;
    }
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const newRedemption = {
        id: `RED-${Date.now().toString().slice(-3)}`,
        requestedAt: Date.now(),
        status: body.creditCost === 0 ? 'Fulfilled' : 'Requested',
        fulfilledAt: body.creditCost === 0 ? Date.now() : null,
        ...body
      };
      db.redemptions.unshift(newRedemption);
      logAudit(body.userName || 'Citizen', 'REDEMPTION_REQUESTED', `Redeemed ${body.itemName} for ${body.creditCost} credits`);
      saveDatabase();
      sendJson(res, 201, newRedemption);
      return true;
    }
  }

  const redMatch = pathname.match(/^\/api\/redemptions\/([a-zA-Z0-9_-]+)\/fulfill$/);
  if (redMatch && method === 'POST') {
    const redId = redMatch[1];
    const rIdx = db.redemptions.findIndex(r => r.id === redId);
    if (rIdx === -1) return sendJson(res, 404, { error: 'Redemption request not found' });

    db.redemptions[rIdx].status = 'Fulfilled';
    db.redemptions[rIdx].fulfilledAt = Date.now();
    logAudit('Admin', 'REDEMPTION_FULFILLED', `Dispatched reward package for redemption ${redId}`);
    saveDatabase();
    sendJson(res, 200, db.redemptions[rIdx]);
    return true;
  }

  // 10. SBM 2.0 Compliance Metrics
  if (pathname === '/api/compliance') {
    if (method === 'GET') {
      sendJson(res, 200, db.compliance_metrics);
      return true;
    }
    if (method === 'PUT' || method === 'POST') {
      const body = await parseRequestBody(req);
      const wardName = body.ward;
      const idx = db.compliance_metrics.findIndex(m => m.ward === wardName);
      if (idx !== -1) {
        db.compliance_metrics[idx] = { ...db.compliance_metrics[idx], ...body };
      } else {
        db.compliance_metrics.push(body);
      }
      saveDatabase();
      sendJson(res, 200, db.compliance_metrics);
      return true;
    }
  }

  // 11. Broadcasts API
  if (pathname === '/api/broadcasts') {
    if (method === 'GET') {
      sendJson(res, 200, db.broadcasts);
      return true;
    }
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      if (!body.message) return sendJson(res, 400, { error: 'Message is required' });

      // Deactivate older broadcasts if single active broadcast model
      db.broadcasts.forEach(b => b.active = false);

      const newBroadcast = {
        id: `BC-${Date.now().toString().slice(-4)}`,
        message: body.message,
        level: body.level || 'warning',
        author: body.author || 'Municipal Sanitation Officer',
        timestamp: Date.now(),
        active: true
      };
      db.broadcasts.unshift(newBroadcast);
      logAudit('Admin', 'BROADCAST_PUBLISHED', `Broadcast alert sent: "${body.message.slice(0, 60)}..."`);
      saveDatabase();
      sendJson(res, 201, newBroadcast);
      return true;
    }
    if (method === 'DELETE') {
      db.broadcasts.forEach(b => b.active = false);
      logAudit('Admin', 'BROADCAST_CLEARED', 'Cleared all active municipal broadcast advisories');
      saveDatabase();
      sendJson(res, 200, { success: true, message: 'All active broadcasts cleared' });
      return true;
    }
  }

  // 12. Audit Logs API
  if (pathname === '/api/logs') {
    if (method === 'GET') {
      sendJson(res, 200, db.audit_logs || []);
      return true;
    }
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const entry = logAudit(body.actor, body.action || 'CUSTOM_ACTION', body.details || '');
      sendJson(res, 201, entry);
      return true;
    }
  }

  // 13. Worker Live Location API
  if (pathname === '/api/worker-location') {
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const workerId = body.workerId || body.userId || (body.id);
      const lat = Number(body.lat);
      const lng = Number(body.lng);
      const timestamp = body.timestamp || Date.now();

      const user = db.users.find(u => u.id === workerId);
      if (user) {
        user.lastKnownLat = lat;
        user.lastKnownLng = lng;
        user.lastLocationUpdatedAt = timestamp;
      }

      const fleetItem = db.fleet.find(f => f.driverId === workerId || (user && f.driver === user.name));
      if (fleetItem) {
        fleetItem.lastKnownLat = lat;
        fleetItem.lastKnownLng = lng;
        fleetItem.lastLocationUpdatedAt = timestamp;
      }

      saveDatabase();
      sendJson(res, 200, { success: true, workerId, lat, lng, timestamp });
      return true;
    }
  }

  // 14. Worker Shift Toggle API
  if (pathname === '/api/worker-shift') {
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const workerId = body.workerId || body.id;
      const shiftStatus = body.shiftStatus === 'active' ? 'active' : 'off-shift';

      const user = db.users.find(u => u.id === workerId);
      if (user) {
        user.shiftStatus = shiftStatus;
      }

      const fleetItem = db.fleet.find(f => f.driverId === workerId || (user && f.driver === user.name));
      if (fleetItem) {
        fleetItem.status = shiftStatus === 'active' ? 'Active Collection' : 'Idle / Off-Shift';
      }

      logAudit(user ? user.name : 'Worker', 'SHIFT_TOGGLE', `Worker ${workerId} shifted to ${shiftStatus}.`);
      saveDatabase();
      sendJson(res, 200, { success: true, workerId, shiftStatus });
      return true;
    }
  }

  // 15. Admin Reassign Stop Quick Action API
  if (pathname === '/api/reassign-stop') {
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const { reportId, toWorkerId } = body;

      const report = db.reports.find(r => r.id === reportId);
      if (!report) {
        sendJson(res, 404, { error: 'Report stop not found' });
        return true;
      }

      const toWorker = db.users.find(u => u.id === toWorkerId);
      if (!toWorker) {
        sendJson(res, 404, { error: 'Target worker not found' });
        return true;
      }

      const oldWorkerName = report.assignedWorkerName || report.assignedWorkerId || 'Unassigned';
      report.assignedWorkerId = toWorker.id;
      report.assignedWorkerName = toWorker.name;
      report.status = 'assigned';
      report.assignedAt = Date.now();

      logAudit('Admin', 'REASSIGN_STOP', `Reassigned stop ${reportId} (${report.landmark}) from ${oldWorkerName} to ${toWorker.name}.`);
      saveDatabase();
      sendJson(res, 200, { success: true, report, oldWorkerName, newWorkerName: toWorker.name });
      return true;
    }
  }

  if (pathname === '/api/worker-locations') {
    if (method === 'GET') {
      const workers = db.users.filter(u => u.role === 'worker').map(w => {
        const fleetItem = db.fleet.find(f => f.driverId === w.id || f.driver === w.name || (w.name && f.driver && w.name.includes(f.driver)) || (w.name && f.driver && f.driver.includes(w.name)));
        const pendingStops = db.reports.filter(r => r.status !== 'cleared' && (r.assignedWorkerId === w.id || (!r.assignedWorkerId && r.area === w.assignedWard))).length;
        return {
          id: w.id,
          name: w.name,
          crewNumber: w.crewNumber || w.name.match(/Crew #?(\d+)/i)?.[1] || '101',
          role: w.role,
          shiftStatus: w.shiftStatus || (fleetItem?.status?.toLowerCase().includes('idle') ? 'off-shift' : 'active'),
          assignedWard: w.assignedWard || (fleetItem ? fleetItem.ward : 'Ward G/South - Dadar & Elphinstone'),
          vehicleType: w.vehicleType || (fleetItem ? fleetItem.type : 'Compactor Truck'),
          vehicleRegistration: w.vehicleRegistration || (fleetItem ? fleetItem.regNo : 'MH-01-GA-4401'),
          lastKnownLat: w.lastKnownLat || (fleetItem ? fleetItem.lastKnownLat : 19.0200),
          lastKnownLng: w.lastKnownLng || (fleetItem ? fleetItem.lastKnownLng : 72.8350),
          lastLocationUpdatedAt: w.lastLocationUpdatedAt || (fleetItem ? fleetItem.lastLocationUpdatedAt : Date.now()),
          assignedStopsCount: pendingStops,
          assignedVehicle: fleetItem ? { id: fleetItem.id, type: fleetItem.type, regNo: fleetItem.regNo, status: fleetItem.status } : null
        };
      });
      sendJson(res, 200, workers);
      return true;
    }
  }

  return false; // Not handled by API
}

// Static File Server
function serveStaticFile(req, res, pathname) {
  let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '' || safePath === '\\') {
    safePath = '/index.html';
  }
  // Strip leading slashes/backslashes to ensure clean path join
  safePath = safePath.replace(/^[/\\]+/, '');

  const filePath = path.resolve(__dirname, safePath);

  // Prevent directory traversal (case-insensitive for Windows filesystems)
  if (!filePath.toLowerCase().startsWith(__dirname.toLowerCase())) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found - Smart Waste Management</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

// Master HTTP Request Handler (compatible with Vercel serverless & native Node.js)
async function handleRequest(req, res) {
  const host = req.headers ? req.headers.host : 'localhost';
  const reqUrl = new URL(req.url, `http://${host || 'localhost:8080'}`);
  const parsedUrl = {
    pathname: reqUrl.pathname,
    query: Object.fromEntries(reqUrl.searchParams),
    search: reqUrl.search
  };

  try {
    // If request starts with /api/, route to REST API
    if (parsedUrl.pathname.startsWith('/api/')) {
      const handled = await handleApiRequest(req, res, parsedUrl);
      if (handled) return;
      return sendJson(res, 404, { error: `Endpoint ${req.method} ${parsedUrl.pathname} not found` });
    }

    // Otherwise serve static client files
    serveStaticFile(req, res, parsedUrl.pathname);
  } catch (err) {
    console.error(`💥 Server Error handling ${req.method} ${req.url}:`, err);
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
    }
  }
}

// Master HTTP Server
const server = http.createServer(handleRequest);

// Start Server
initDatabase();
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Smart Waste Management Municipal REST Server`);
    console.log(`🌐 Live at: http://localhost:${PORT}/`);
    console.log(`📡 REST API Base: http://localhost:${PORT}/api/`);
    console.log(`📂 Database: ${DB_PATH}`);
    console.log(`======================================================\n`);
  });
}

handleRequest.server = server;
module.exports = handleRequest;
