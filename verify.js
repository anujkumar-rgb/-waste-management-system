// ==========================================================================
// Comprehensive Verification Test Suite for Smart Waste Management System
// Validates all user requirements, bug fixes, data models, and logic
// ==========================================================================

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Smart Waste Management System Verification...\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
    testsFailed++;
  }
}

// --------------------------------------------------------------------------
// 1. FILE INTEGRITY & TOKEN CHECKS
// --------------------------------------------------------------------------
console.log('📦 1. Checking Design Tokens & File Integrity...');

const stylesContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf-8');
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const appContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf-8');

runTest('Civic Token Palette: All required municipal tokens defined', () => {
  const requiredTokens = [
    '--civic-forest-ink',
    '--civic-paper-bg',
    '--civic-surface',
    '--civic-border',
    '--civic-cobalt-accent',
    '--civic-spruce-green',
    '--civic-signal-amber',
    '--civic-signal-crimson'
  ];
  requiredTokens.forEach(token => {
    assert(stylesContent.includes(token), `Missing token ${token} in styles.css`);
  });
});

runTest('Biomedical Waste Rules 2016: Regulatory tokens strictly preserved', () => {
  const bmwTokens = [
    '--bmw-yellow',
    '--bmw-red',
    '--bmw-white',
    '--bmw-black-blue'
  ];
  bmwTokens.forEach(token => {
    assert(stylesContent.includes(token), `Missing BMW token ${token} in styles.css`);
  });
});

runTest('Typography Tokens: Signage font and UI font defined', () => {
  assert(stylesContent.includes('--font-display'), 'Missing --font-display');
  assert(stylesContent.includes('--font-ui'), 'Missing --font-ui');
  assert(stylesContent.includes('Outfit'), 'Outfit font missing');
  assert(stylesContent.includes('Plus Jakarta Sans'), 'Plus Jakarta Sans missing');
});

runTest('Visual Status Steppers: Stepper CSS classes defined', () => {
  assert(stylesContent.includes('.status-stepper'), '.status-stepper missing');
  assert(stylesContent.includes('.container-lifecycle-bar'), '.container-lifecycle-bar missing');
});

// --------------------------------------------------------------------------
// 2. INSTITUTION SIGNUP & DASHBOARD (SCHOOL & COMPANY)
// --------------------------------------------------------------------------
console.log('\n🏢 2. Testing Institution Signup & Profile (School vs Company)...');

runTest('HTML Markup: Contains specific School and Company fields', () => {
  assert(htmlContent.includes('id="signupSchoolName"'), 'Missing signupSchoolName input');
  assert(htmlContent.includes('id="signupCompanyName"'), 'Missing signupCompanyName input');
  assert(htmlContent.includes('id="signupBusinessType"'), 'Missing signupBusinessType select');
  assert(htmlContent.includes('id="signupInstType"'), 'Missing signupInstType select');
});

runTest('HTML Markup: Multi-branch selector and branch modal in place', () => {
  assert(htmlContent.includes('id="instBranchSelect"'), 'Missing instBranchSelect in Institution view');
  assert(htmlContent.includes('id="addBranchModal"'), 'Missing addBranchModal');
  assert(htmlContent.includes('id="addBranchForm"'), 'Missing addBranchForm');
});

runTest('HTML Markup: Institution Bulk Form has 4 required waste types', () => {
  assert(htmlContent.includes('value="commercial_food"'), 'Missing commercial_food option');
  assert(htmlContent.includes('value="market_waste"'), 'Missing market_waste option');
  assert(htmlContent.includes('value="office_paper"'), 'Missing office_paper option');
  assert(htmlContent.includes('value="c_and_d"'), 'Missing c_and_d option');
});

runTest('HTML Markup: Recurring Schedule and Monthly Self-Audit forms in place', () => {
  assert(htmlContent.includes('id="recurringScheduleForm"'), 'Missing recurringScheduleForm');
  assert(htmlContent.includes('id="instSelfAuditForm"'), 'Missing instSelfAuditForm');
  assert(htmlContent.includes('id="auditComplianceRate"'), 'Missing auditComplianceRate input');
});

runTest('App Logic: Seed users include both School and Company profiles', () => {
  assert(appContent.includes("institutionType: 'school'"), 'School institution type missing in SEED_USERS');
  assert(appContent.includes("schoolName: 'Bombay Scottish School, Powai'"), 'School Name missing in SEED_USERS');
  assert(appContent.includes("institutionType: 'company'"), 'Company institution type missing in SEED_USERS');
  assert(appContent.includes("companyName: 'Tata Consultancy Services, Andheri (E)'"), 'Company Name missing in SEED_USERS');
  assert(appContent.includes("businessType: 'IT / Tech Office'"), 'Business Type missing in SEED_USERS');
});

runTest('App Logic: Header replaces generic label with School or Company name', () => {
  assert(appContent.includes("currentUser.schoolName || currentUser.name"), 'School name header logic missing');
  assert(appContent.includes("currentUser.companyName || currentUser.name"), 'Company name header logic missing');
});

// --------------------------------------------------------------------------
// 3. REAL LOCATION PICKER WITH LEAFLET
// --------------------------------------------------------------------------
console.log('\n🗺️ 3. Testing Real Location Picker with Leaflet...');

runTest('HTML Markup: Map containers embedded directly in Citizen & Institution report forms', () => {
  assert(htmlContent.includes('id="citizenMapPicker"'), 'citizenMapPicker container missing');
  assert(htmlContent.includes('id="instMapPicker"'), 'instMapPicker container missing');
  assert(htmlContent.includes('id="citizenLocateBtn"'), 'citizenLocateBtn (Use My Current Location) missing');
  assert(htmlContent.includes('id="instLocateBtn"'), 'instLocateBtn (Use My Current Location) missing');
});

runTest('App Logic: Leaflet location picker initialized with draggable marker & reverse geocoding', () => {
  assert(appContent.includes('L.map(mapContainerId'), 'L.map initialization missing');
  assert(appContent.includes('draggable: true'), 'Draggable marker missing');
  assert(appContent.includes('reverseGeocode'), 'reverseGeocode function missing');
  assert(appContent.includes('nominatim.openstreetmap.org/reverse'), 'Nominatim reverse geocoding API missing');
});

runTest('App Logic: Geolocation permission denial handled gracefully', () => {
  assert(appContent.includes('navigator.geolocation.getCurrentPosition'), 'getCurrentPosition missing');
  assert(appContent.includes('Location permission denied or unavailable'), 'Denial handler message missing');
});

runTest('App Logic: Coordinates (lat, lng, resolvedAddress) stored with reports', () => {
  assert(appContent.includes('latitude: lat'), 'latitude field missing in new report');
  assert(appContent.includes('longitude: lng'), 'longitude field missing in new report');
  assert(appContent.includes('resolvedAddress:'), 'resolvedAddress field missing in new report');
});

runTest('App Logic: Admin Hotspot Map plots real coordinates from submitted reports', () => {
  assert(appContent.includes('r.latitude || r.coords?.lat'), 'Admin Hotspot map not using real latitude');
  assert(appContent.includes('L.circleMarker([lat, lng]'), 'Circle marker plotting missing on hotspot map');
});

// --------------------------------------------------------------------------
// 4. HOSPITAL DASHBOARD BUG FIXES & FEATURES
// --------------------------------------------------------------------------
console.log('\n🏥 4. Testing Hospital Dashboard Features & Bug Fixes...');

runTest('CSV Export: RFC-4180 format, Blob type text/csv;charset=utf-8, date stamp filename', () => {
  assert(appContent.includes("type: 'text/csv;charset=utf-8;'"), 'Missing correct Blob MIME type');
  assert(appContent.includes("compliance-audit-log-"), 'Missing date stamped filename');
  assert(appContent.includes('.csv'), 'Missing .csv extension in download');
  assert(appContent.includes('URL.createObjectURL(blob)'), 'Missing createObjectURL in CSV export');
  assert(appContent.includes('URL.revokeObjectURL(url)'), 'Missing revokeObjectURL in CSV export');
});

runTest('CSV Export: Empty data alert prevents broken file creation', () => {
  assert(appContent.includes('if (bmwReports.length === 0)'), 'Missing empty check in exportHospitalAuditCSV');
});

runTest('Form Validation: Register Hazardous button active logic implemented', () => {
  assert(appContent.includes('validateBMWForm'), 'Missing validateBMWForm function');
  assert(appContent.includes('registerBMWBtn'), 'Missing registerBMWBtn reference');
});

runTest('New Feature: Container Lifecycle 5-state tracking implemented', () => {
  const stages = ['Registered', 'Collected', 'In Transit', 'Treated', 'Disposed'];
  stages.forEach(stage => {
    assert(appContent.includes(`'${stage}'`), `Lifecycle stage '${stage}' missing in app.js`);
  });
  assert(appContent.includes('advanceContainerLifecycle'), 'advanceContainerLifecycle function missing');
});

runTest('New Feature: Authorized Treatment Facility field in form and logs', () => {
  assert(htmlContent.includes('id="bmwTreatmentFacility"'), 'bmwTreatmentFacility select missing in HTML');
  assert(appContent.includes('treatmentFacility'), 'treatmentFacility missing in BMW report object');
});

runTest('New Feature: Staff Training Compliance Log implemented', () => {
  assert(htmlContent.includes('id="hospitalStaffTable"'), 'hospitalStaffTable missing in HTML');
  assert(htmlContent.includes('id="staffTrainingModal"'), 'staffTrainingModal missing in HTML');
  assert(appContent.includes('SEED_HOSPITAL_STAFF'), 'SEED_HOSPITAL_STAFF missing in app.js');
});

runTest('New Feature: Configurable High-Priority Hazard Threshold implemented', () => {
  assert(htmlContent.includes('id="hospitalThresholdInput"'), 'hospitalThresholdInput missing in HTML');
  assert(appContent.includes('updateHospitalHazardThreshold'), 'updateHospitalHazardThreshold missing in app.js');
  assert(appContent.includes('currentUser.hazardThreshold'), 'currentUser.hazardThreshold missing in app.js');
});

// --------------------------------------------------------------------------
// 5. CITIZEN DASHBOARD BUG FIXES & CREDIT STORE
// --------------------------------------------------------------------------
console.log('\n👤 5. Testing Citizen Dashboard Bug Fixes & Credit Store...');

runTest('Bug Fix: Severity selector is interactive and required', () => {
  assert(htmlContent.includes('class="severity-selector"'), 'severity-selector missing in HTML');
  assert(htmlContent.includes('selectSeverity'), 'selectSeverity call missing in HTML');
  assert(appContent.includes('window.selectSeverity = function'), 'selectSeverity function missing in app.js');
  assert(appContent.includes('Please select a Severity Level'), 'Severity requirement validation missing');
});

runTest('Bug Fix: Voice recorder with functional playback controls', () => {
  assert(htmlContent.includes('id="audioPlayerContainer"'), 'audioPlayerContainer missing in HTML');
  assert(htmlContent.includes('id="audioPlayToggleBtn"'), 'audioPlayToggleBtn missing in HTML');
  assert(htmlContent.includes('id="audioSeekBar"'), 'audioSeekBar missing in HTML');
  assert(htmlContent.includes('id="audioVolumeBar"'), 'audioVolumeBar missing in HTML');
  assert(appContent.includes('toggleAudioPlayback'), 'toggleAudioPlayback missing in app.js');
  assert(appContent.includes('seekAudioPlayback'), 'seekAudioPlayback missing in app.js');
  assert(appContent.includes('setAudioVolume'), 'setAudioVolume missing in app.js');
});

runTest('Credit Store: Sapling reward featured as primary largest card first', () => {
  assert(appContent.includes("id: 'sapling'"), 'Sapling reward missing');
  assert(appContent.includes("featured: true"), 'Sapling not marked as featured');
  assert(stylesContent.includes('.reward-card.featured-card'), 'featured-card CSS class missing');
});

runTest('Credit Store: Updated secondary reward items in catalog with 4 replacements', () => {
  const currentSecondaryItemIds = [
    'compost_kit',
    'seed_paper',
    'recycled_notebook',
    'digital_badge',
    'segregation_bin_set',
    'ewaste_voucher',
    'priority_pickup_pass',
    'recycler_marketplace_credit'
  ];
  currentSecondaryItemIds.forEach(id => {
    assert(appContent.includes(`id: '${id}'`), `Missing reward item ${id}`);
  });
  const removedItemIds = ['jute_bag', 'cutlery_set', 'transit_fare', 'tax_voucher'];
  removedItemIds.forEach(id => {
    assert(!appContent.includes(`id: '${id}'`), `Removed reward item ${id} is still in catalog`);
  });
});

runTest('Credit Store: Redemption flow differentiates physical vs digital badges & priority pass', () => {
  assert(appContent.includes("status: isDigital ? 'Fulfilled' : 'Requested'"), 'Status logic for physical vs digital badge missing');
  assert(appContent.includes('swm_redemptions'), 'swm_redemptions data store missing');
  assert(appContent.includes('redeemCreditStoreItem'), 'redeemCreditStoreItem function missing');
  assert(appContent.includes('priorityPickupCredits'), 'priorityPickupCredits logic missing');
});

runTest('Admin Dashboard: Redemption requests queue view with Mark Fulfilled button', () => {
  assert(htmlContent.includes('id="adminTabRedemptions"'), 'adminTabRedemptions tab missing in HTML');
  assert(htmlContent.includes('id="adminPanelRedemptions"'), 'adminPanelRedemptions panel missing in HTML');
  assert(appContent.includes('adminFulfillRedemption'), 'adminFulfillRedemption function missing in app.js');
});

// --------------------------------------------------------------------------
// 6. PART A: VERIFY & FIX EXISTING LOGIC
// --------------------------------------------------------------------------
console.log('\n⚙️ 6. Testing Part A: Tiered Credit Split, Segregation, Routing, and Impact Tracker...');

runTest('Tiered Credit-Split: Logic table properly defined in checkAndMergeDuplicates', () => {
  assert(appContent.includes('function getTierCredit(num)'), 'getTierCredit function missing in app.js');
  // Check tiered thresholds: 1 -> 5, 2-3 -> 4, 4-6 -> 3, 7-10 -> 2, 11+ -> 1
  assert(appContent.includes('if (num === 1) return 5;'), 'Tier 1 credit missing (5)');
  assert(appContent.includes('if (num <= 3) return 4;'), 'Tier 2-3 credit missing (4)');
  assert(appContent.includes('if (num <= 6) return 3;'), 'Tier 4-6 credit missing (3)');
  assert(appContent.includes('if (num <= 10) return 2;'), 'Tier 7-10 credit missing (2)');
  assert(appContent.includes('return 1;'), 'Floor credit missing (1)');
});

runTest('Tiered Credit-Split: Retroactive credit adjustments & transactions logged to all prior reporters', () => {
  assert(appContent.includes('Adjusted duplicate report #'), 'Retroactive adjustment transaction description missing');
  assert(appContent.includes('creditHistory.unshift'), 'creditHistory update missing');
  assert(appContent.includes('reporterIds'), 'reporterIds tracking array missing');
});

runTest('Tiered Credit-Split: Emergency reports award 25 credits to first reporter and standard tiered to duplicates', () => {
  assert(appContent.includes("existing.isEmergency || existing.category === 'emergency'"), 'Emergency duplicate check missing');
  assert(appContent.includes("creditsAwarded: 25"), 'First emergency reporter 25 credits missing');
});

runTest('Segregation Guide: Live keyword filter search implemented in initSegregationGuide', () => {
  assert(appContent.includes('function initSegregationGuide()'), 'initSegregationGuide function missing');
  assert(htmlContent.includes('id="segregationSearchInput"'), 'segregationSearchInput missing in HTML');
  assert(appContent.includes('.addEventListener(\'input\''), 'input event listener for live segregation filtering missing');
});

runTest('Route Optimizer: Haversine distance and Nearest-Neighbor algorithm implemented', () => {
  assert(appContent.includes('function calcDistance(lat1, lon1, lat2, lon2)'), 'calcDistance function missing');
  assert(appContent.includes('6371'), 'Earth radius 6371km missing in Haversine formula');
  assert(appContent.includes('Math.sin(dLat / 2)'), 'Haversine formula trigonometric calculations missing');
  assert(appContent.includes('runSoftwareRouteOptimizer'), 'runSoftwareRouteOptimizer function missing');
});

runTest('Route Optimizer: Emergency pinned to top and Priority Pickup Pass pinned right below', () => {
  assert(appContent.includes('const emergencyReports = unassigned.filter('), 'Emergency filtering in route optimizer missing');
  assert(appContent.includes('const priorityPassReports = unassigned.filter('), 'Priority pass filtering in route optimizer missing');
  assert(appContent.includes('[...emergencyReports, ...priorityPassReports, ...optimizedStandard]'), 'Pinned queue order missing');
});

runTest('Personal Impact Tracker: Renders non-zero demo metrics and trend chart for demo accounts', () => {
  assert(appContent.includes('function renderPersonalImpactTracker()'), 'renderPersonalImpactTracker function missing');
  assert(htmlContent.includes('id="impactReportsCount"'), 'impactReportsCount element missing');
  assert(htmlContent.includes('id="impactKgDiverted"'), 'impactKgDiverted element missing');
  assert(htmlContent.includes('id="impactCo2Saved"'), 'impactCo2Saved element missing');
  assert(htmlContent.includes('id="impactTrendChart"'), 'impactTrendChart canvas element missing');
});

// --------------------------------------------------------------------------
// 7. PART B: MUNICIPAL COMPLIANCE DASHBOARD
// --------------------------------------------------------------------------
console.log('\n🏛️ 7. Testing Part B: Municipal Compliance Dashboard (SBM 2.0 / SWM Rules 2026)...');

runTest('Municipal Compliance: Statutory KPI summary cards and statutory thresholds defined', () => {
  assert(htmlContent.includes('id="adminPanelCompliance"'), 'adminPanelCompliance panel missing');
  assert(htmlContent.includes('id="kpiCitySegregation"'), 'kpiCitySegregation card missing');
  assert(htmlContent.includes('id="kpiCityCoverage"'), 'kpiCityCoverage card missing');
  assert(htmlContent.includes('id="kpiCityProcessing"'), 'kpiCityProcessing card missing');
  assert(appContent.includes('const SBM_TARGETS = {'), 'SBM_TARGETS constant missing');
  assert(appContent.includes('segregation: 60'), 'SBM 2.0 segregation target 60% missing');
  assert(appContent.includes('coverage: 80'), 'SBM 2.0 coverage target 80% missing');
  assert(appContent.includes('processing: 80'), 'SBM 2.0 processing target 80% missing');
});

runTest('Municipal Compliance: Color-coded status badge logic (Green >= target, Amber >= target-10, Red otherwise)', () => {
  assert(appContent.includes('function getComplianceStatus(value, target)'), 'getComplianceStatus function missing');
  assert(appContent.includes('value >= target - 10'), '10% amber tolerance logic missing');
});

runTest('Municipal Compliance: Ward Metrics edit modal & handler implemented', () => {
  assert(htmlContent.includes('id="updateComplianceModal"'), 'updateComplianceModal missing in HTML');
  assert(htmlContent.includes('id="updateComplianceForm"'), 'updateComplianceForm missing in HTML');
  assert(appContent.includes('function openUpdateComplianceModal'), 'openUpdateComplianceModal function missing');
  assert(appContent.includes('function saveWardComplianceMetrics'), 'saveWardComplianceMetrics function missing');
});

// --------------------------------------------------------------------------
// 8. PART B: TRANSPARENCY PAGE, DEMO SWITCHER & ABOUT PROJECT
// --------------------------------------------------------------------------
console.log('\n🌐 8. Testing Part B: Transparency Page, Demo Switcher & About Project...');

const transparencyHtml = fs.readFileSync(path.join(__dirname, 'transparency.html'), 'utf-8');

runTest('Transparency Page: Standalone public page exists and requires no login', () => {
  assert(fs.existsSync(path.join(__dirname, 'transparency.html')), 'transparency.html file does not exist');
  assert(transparencyHtml.includes('Public Civic Waste Transparency Portal'), 'Portal title missing');
  assert(!transparencyHtml.includes('id="loginForm"'), 'Login form should not be on transparency portal');
});

runTest('Transparency Page: Displays aggregated civic metrics and ward rankings', () => {
  assert(transparencyHtml.includes('id="statReportsToday"'), 'statReportsToday stat card missing');
  assert(transparencyHtml.includes('id="statClearedToday"'), 'statClearedToday stat card missing');
  assert(transparencyHtml.includes('id="statSegregationAvg"'), 'statSegregationAvg stat card missing');
  assert(transparencyHtml.includes('id="statProcessingRate"'), 'statProcessingRate stat card missing');
  assert(transparencyHtml.includes('id="cleanestWardsList"'), 'cleanestWardsList ranking container missing');
  assert(transparencyHtml.includes('id="mostReportedWardsList"'), 'mostReportedWardsList ranking container missing');
});

runTest('Transparency Page: Zero personal data, no hospital or patient identifiers', () => {
  assert(transparencyHtml.includes('Privacy & Statutory Disclosure Notice'), 'Privacy disclosure notice missing');
  assert(transparencyHtml.includes('Zero Personal Identifiable Information (PII)'), 'Zero PII commitment notice missing');
  assert(!transparencyHtml.includes('patient'), 'Transparency page must not contain patient references');
  assert(!transparencyHtml.includes('hospitalStaffTable'), 'Hospital staff table must not be on public transparency page');
});

runTest('Demo Role-Switch Control: Quick Demo Switcher on login screen supports all 5 roles', () => {
  assert(htmlContent.includes('id="demoRoleSelect"'), 'demoRoleSelect dropdown missing on login page');
  assert(htmlContent.includes('id="demoQuickLoginBtn"'), 'demoQuickLoginBtn missing on login page');
  assert(appContent.includes("function demoSwitchRole(role)"), 'demoSwitchRole function missing in app.js');
  const roles = ['citizen', 'institution', 'hospital', 'worker', 'admin'];
  roles.forEach(role => {
    assert(htmlContent.includes(`demoSwitchRole('${role}')`), `Quick demo button for ${role} missing in HTML`);
  });
});

runTest('About This Project: Briefing modal with root-cause analysis and 2000-2026 policy timeline', () => {
  assert(htmlContent.includes('id="aboutProjectModal"'), 'aboutProjectModal missing in HTML');
  assert(htmlContent.includes('Urban Waste Management Crisis & SBM 2.0 Solution'), 'About modal heading missing');
  assert(htmlContent.includes('Root-Cause Breakdown'), 'Root-cause analysis missing');
  assert(htmlContent.includes('Indian Waste Governance Timeline (2000 - 2026)'), 'Policy timeline missing');
  assert(htmlContent.includes('MSW Rules 2000'), 'MSW Rules 2000 milestone missing');
  assert(htmlContent.includes('SWM Rules 2016'), 'SWM Rules 2016 milestone missing');
  assert(htmlContent.includes('SBM 2.0 Mandates (2024-2026)'), 'SBM 2.0 milestone missing');
});

// --------------------------------------------------------------------------
// 9. PART C: FUNCTIONAL PRIORITY PICKUP PASS
// --------------------------------------------------------------------------
console.log('\n🎫 9. Testing Part C: Functional Priority Pickup Pass...');

runTest('Priority Pickup Pass: Decrements on citizen report submission and marks report as isPriorityPickup', () => {
  assert(appContent.includes('currentUser.priorityPickupCredits > 0'), 'Priority pass check missing in report submission');
  assert(appContent.includes('currentUser.priorityPickupCredits--'), 'Priority pass decrement missing in report submission');
  assert(appContent.includes('isPriorityPickup: usedPriorityPass'), 'isPriorityPickup flag missing in report');
  assert(htmlContent.includes('id="citizenPriorityPassNotice"'), 'citizenPriorityPassNotice banner missing in HTML');
});

runTest('Priority Pickup Pass: Bypasses admin physical redemption fulfillment queue', () => {
  assert(appContent.includes("const isDigital = item.digitalBadge || item.id === 'priority_pickup_pass';"), 'Priority pass not classified as auto-fulfilled digital reward');
});

// --------------------------------------------------------------------------
// 10. BACKEND REST SERVER & ATOMIC PERSISTENCE
// --------------------------------------------------------------------------
console.log('\n🖥️ 10. Testing Backend REST Server & Data Persistence...');

const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf-8');

runTest('Backend Server: Native REST API routes implemented', () => {
  const routes = [
    '/api/health',
    '/api/stats',
    '/api/reports',
    '/api/fleet',
    '/api/compliance',
    '/api/broadcasts',
    '/api/logs',
    '/api/admin/auto-assign'
  ];
  routes.forEach(route => {
    assert(serverContent.includes(route), `Missing server route ${route}`);
  });
});

runTest('Backend Server: Atomic persistence to data/db.json', () => {
  assert(serverContent.includes('data/db.json'), 'Missing data/db.json path in server.js');
  assert(serverContent.includes('saveDatabase()'), 'Missing saveDatabase function in server.js');
  assert(fs.existsSync(path.join(__dirname, 'data', 'db.json')), 'data/db.json does not exist');
});

// --------------------------------------------------------------------------
// 11. WORKER NAVIGATION, LIVE TRACKING & WARD AUTO-FILL
// --------------------------------------------------------------------------
console.log('\n🧭 11. Testing Worker Navigation, Live Admin Tracking & Ward Auto-Fill...');

runTest('Worker Dashboard: Route line drawn on Leaflet map from worker location through optimized stops', () => {
  assert(htmlContent.includes('id="workerRouteMap"'), 'workerRouteMap container missing in HTML');
  assert(htmlContent.includes('id="workerActiveNavHUD"'), 'workerActiveNavHUD banner missing in HTML');
  assert(appContent.includes('function initWorkerRouteMap'), 'initWorkerRouteMap function missing in app.js');
  assert(appContent.includes('workerRoutePolyline = L.polyline(pathCoords'), 'L.polyline route line connecting stops missing in app.js');
  assert(appContent.includes('workerCurrentPos'), 'workerCurrentPos live starting point missing in app.js');
  assert(appContent.includes('navigator.geolocation.watchPosition'), 'watchPosition geolocation tracking missing in app.js');
});

runTest('Worker Dashboard: Target stop highlighting, remaining distance, and 50m proximity auto-advance', () => {
  assert(appContent.includes('selectWorkerTargetStop'), 'selectWorkerTargetStop function missing in app.js');
  assert(appContent.includes('PROXIMITY_THRESHOLD_METERS = 50'), '50m proximity threshold constant missing in app.js');
  assert(appContent.includes('workerProximityNotice'), 'workerProximityNotice handler missing in app.js');
  assert(appContent.includes('workerDirectGuidanceLine'), 'workerDirectGuidanceLine direct destination line missing in app.js');
  assert(htmlContent.includes('id="workerTargetDistanceBadge"'), 'workerTargetDistanceBadge missing in HTML');
});

runTest('Admin Dashboard: Live Worker Location Tracking panel & active worker markers', () => {
  assert(htmlContent.includes('id="adminTabWorkerLocations"'), 'adminTabWorkerLocations tab missing in HTML');
  assert(htmlContent.includes('id="adminPanelWorkerLocations"'), 'adminPanelWorkerLocations panel missing in HTML');
  assert(htmlContent.includes('id="adminWorkerLocationsMap"'), 'adminWorkerLocationsMap map container missing in HTML');
  assert(appContent.includes('function initAdminWorkerLocationsMap'), 'initAdminWorkerLocationsMap function missing in app.js');
  assert(appContent.includes('Stops Remaining:'), 'Remaining stops detail in worker marker popup missing');
  assert(appContent.includes('Last Updated:'), 'Last updated timestamp in worker marker popup missing');
});

runTest('Admin Dashboard: Clicking worker marker overlays full assigned route on map', () => {
  assert(appContent.includes('adminOverlayWorkerRoute'), 'adminOverlayWorkerRoute function missing in app.js');
  assert(appContent.includes('adminWorkerRouteLine = L.polyline('), 'adminWorkerRouteLine overlay missing in app.js');
  assert(htmlContent.includes('id="adminWorkerRouteOverlayPanel"'), 'adminWorkerRouteOverlayPanel missing in HTML');
});

runTest('Auto-Fill Municipal Ward: Derived from map picker coordinates across Citizen, Institution & Branch setup', () => {
  assert(htmlContent.includes('id="citizenArea"') && htmlContent.includes('readonly'), 'citizenArea must be read-only auto-filled input');
  assert(htmlContent.includes('id="instArea"') && htmlContent.includes('readonly'), 'instArea must be read-only auto-filled input');
  assert(htmlContent.includes('id="newBranchWard"') && htmlContent.includes('readonly'), 'newBranchWard must be read-only auto-filled input');
  assert(appContent.includes('function deriveWardFromCoordinates'), 'deriveWardFromCoordinates function missing in app.js');
  assert(appContent.includes('function updateWardFieldFromCoords'), 'updateWardFieldFromCoords function missing in app.js');
  assert(appContent.includes('locateNewBranch'), 'locateNewBranch branch auto-detect function missing in app.js');
});

runTest('Auto-Fill Municipal Ward: Fallback to Approximate zone nearest match', () => {
  assert(appContent.includes('Approximate zone — nearest match:'), 'Approximate zone labeling missing in fallback logic');
});

runTest('Data Models: Worker profile and fleet include lastKnownLat, lastKnownLng, lastLocationUpdatedAt', () => {
  assert(appContent.includes('lastKnownLat'), 'lastKnownLat missing in app.js');
  assert(appContent.includes('lastKnownLng'), 'lastKnownLng missing in app.js');
  assert(appContent.includes('lastLocationUpdatedAt'), 'lastLocationUpdatedAt missing in app.js');
  assert(serverContent.includes('lastKnownLat'), 'lastKnownLat missing in server.js');
  assert(appContent.includes('wardZone'), 'wardZone property missing in report/branch models');
});

// --------------------------------------------------------------------------
// 12. MUMBAI LOCATION DEFAULTS & REAL CURRENT LOCATION PRIORITIZATION
// --------------------------------------------------------------------------
console.log('\n🌆 12. Testing Mumbai Location Defaults & Geolocation Prioritization...');

runTest('Mumbai Default Coordinates: Map centers and defaults use Mumbai coordinates (19.0760, 72.8777)', () => {
  assert(appContent.includes('19.0760'), 'Mumbai default latitude 19.0760 missing in app.js');
  assert(appContent.includes('72.8777'), 'Mumbai default longitude 72.8777 missing in app.js');
  assert(htmlContent.includes('19.0760') && htmlContent.includes('72.8777'), 'Mumbai default coords missing in index.html');
  assert(appContent.includes("adminMapObj = L.map('adminHotspotMap').setView([19.0760, 72.8777]"), 'Admin hotspot map not centered on Mumbai');
  assert(appContent.includes("adminWorkerMapObj = L.map('adminWorkerLocationsMap', { zoomControl: true }).setView([19.0760, 72.8777]"), 'Admin worker tracking map not centered on Mumbai');
});

runTest('Mumbai Statutory Wards: Real Mumbai wards defined with localized search keywords', () => {
  assert(appContent.includes('Ward K/East - Andheri Industrial Estate'), 'Ward K/East missing in app.js');
  assert(appContent.includes('Ward G/South - Dadar & Elphinstone'), 'Ward G/South missing in app.js');
  assert(appContent.includes('Ward H/West - Bandra Residential'), 'Ward H/West missing in app.js');
  assert(appContent.includes('Ward S - Powai Lake & Tech Enclave'), 'Ward S missing in app.js');
  assert(appContent.includes('Ward A - Colaba & Fort Commercial'), 'Ward A missing in app.js');
  assert(htmlContent.includes('Ward K/East - Andheri Industrial Estate'), 'Ward K/East missing in index.html');
});

runTest('Mumbai Fleet & Seed Data: Vehicles use MH registration and Mumbai locations', () => {
  assert(appContent.includes('MH-01-GA-4401'), 'MH-01-GA-4401 compactor missing');
  assert(appContent.includes('MH-02-EV-1088'), 'MH-02-EV-1088 tipper missing');
  assert(appContent.includes('MH-03-HA-0912'), 'MH-03-HA-0912 biomedical van missing');
  assert(appContent.includes('MH-04-CD-5501'), 'MH-04-CD-5501 debris dumper missing');
  assert(htmlContent.includes('MH-02-EV-9921'), 'MH-02-EV-9921 standby placeholder missing in index.html');
});

runTest('Real Current Location Prioritization: Map load initiates GPS detection with loading state', () => {
  assert(appContent.includes('map-gps-loading-indicator'), 'Loading indicator class missing in app.js');
  assert(stylesContent.includes('.map-gps-loading-indicator'), 'Loading indicator style missing in styles.css');
  assert(appContent.includes('Detecting your location...'), 'Detecting location banner missing');
});

runTest('Geolocation Fallback Notice: Clear inline guidance when location access is unavailable', () => {
  assert(appContent.includes("Location access unavailable — showing default area. Tap the map or click 'Use My Current Location' to set your exact spot."), 'Inline location access fallback message missing in app.js');
});

// --------------------------------------------------------------------------
// 13. EXPANDED LIVE GPS TRACKING & MULTI-WORKER FLEET OPERATIONS
// --------------------------------------------------------------------------
console.log('\n🚚 13. Testing Expanded Live GPS Tracking & Multi-Worker Fleet Operations...');

runTest('Worker Profiles: At least 5 distinct seeded workers across Mumbai localities', () => {
  const seedWorkers = [
    { email: 'crew101@cleanward.org', crew: '101', name: 'Rajesh Singh', ward: 'Dadar' },
    { email: 'crew102@cleanward.org', crew: '102', name: 'Sunita Devi', ward: 'Bandra' },
    { email: 'crew103@cleanward.org', crew: '103', name: 'Amit Verma', ward: 'Andheri' },
    { email: 'crew104@cleanward.org', crew: '104', name: 'Harish Kumar', ward: 'Powai' },
    { email: 'crew105@cleanward.org', crew: '105', name: 'Sachin Kamble', ward: 'Borivali' }
  ];

  seedWorkers.forEach(w => {
    assert(appContent.includes(w.email), `Worker email ${w.email} missing in app.js`);
    assert(appContent.includes(w.name), `Worker name ${w.name} missing in app.js`);
    assert(serverContent.includes(w.email), `Worker email ${w.email} missing in server.js`);
  });

  // Verify distinct vehicle types
  assert(appContent.includes('Heavy Hydraulic Compactor (10T)'), 'Compactor missing');
  assert(appContent.includes('Electric Multi-Bin Tipper Auto (1.5T)'), 'Tipper auto missing');
  assert(appContent.includes('Biomedical Closed-Chamber Van (2T)'), 'Biomedical van missing');
  assert(appContent.includes('C&D Debris Hydraulic Dumper (14T)'), 'Debris dumper missing');
  assert(appContent.includes('Mini Tipper E-Rickshaw (0.8T)'), 'Mini tipper e-rickshaw missing');
});

runTest('Worker Stop Lists: Each seeded worker has assigned stops including at least one emergency stop', () => {
  const emergencyStops = ['EMG-401', 'EMG-402', 'EMG-403', 'EMG-404', 'EMG-405'];
  emergencyStops.forEach(emg => {
    assert(appContent.includes(emg), `Emergency stop ${emg} missing in app.js`);
    assert(serverContent.includes(emg), `Emergency stop ${emg} missing in server.js`);
  });
});

runTest('Worker Status Filter: Filter chips narrow map view (All, Active, Idle, On Route)', () => {
  assert(htmlContent.includes('setAdminWorkerFilter(\'all\')'), 'Filter chip All missing in HTML');
  assert(htmlContent.includes('setAdminWorkerFilter(\'active\')'), 'Filter chip Active missing in HTML');
  assert(htmlContent.includes('setAdminWorkerFilter(\'idle\')'), 'Filter chip Idle missing in HTML');
  assert(htmlContent.includes('setAdminWorkerFilter(\'on_route\')'), 'Filter chip On Route missing in HTML');
  assert(appContent.includes('window.setAdminWorkerFilter = function(filter)'), 'setAdminWorkerFilter missing in app.js');
  assert(htmlContent.includes('id="adminFilteredWorkerCount"'), 'adminFilteredWorkerCount missing in HTML');
});

runTest('Worker List Panel: Compact sidebar renders cards and centers map with popup on click', () => {
  assert(htmlContent.includes('id="adminWorkerListPanel"'), 'adminWorkerListPanel container missing in HTML');
  assert(appContent.includes('window.focusAdminWorkerMarker = function(workerId)'), 'focusAdminWorkerMarker missing in app.js');
  assert(appContent.includes('adminWorkerMapObj.setView([lat, lng], 14);'), 'Map zoom-center on worker click missing in app.js');
  assert(appContent.includes('found.marker.openPopup();'), 'Marker popup open on card click missing in app.js');
});

runTest('Multi-Worker Route Overlay Comparison: Multi-crew simultaneous route rendering in distinct colors', () => {
  assert(htmlContent.includes('id="adminMultiRouteLegend"'), 'adminMultiRouteLegend missing in HTML');
  assert(htmlContent.includes('id="adminMultiRouteLegendItems"'), 'adminMultiRouteLegendItems missing in HTML');
  assert(appContent.includes('window.toggleWorkerMultiRouteCompare = function('), 'toggleWorkerMultiRouteCompare missing in app.js');
  assert(appContent.includes('window.renderMultiWorkerRouteOverlays = function()'), 'renderMultiWorkerRouteOverlays missing in app.js');
  assert(appContent.includes('MULTI_ROUTE_COLORS ='), 'MULTI_ROUTE_COLORS palette missing in app.js');
  assert(appContent.includes('window.clearAllWorkerRouteOverlays = function()'), 'clearAllWorkerRouteOverlays missing in app.js');
});

runTest('Reassign Nearest Stop Quick Action: Reassigns stop to closest nearby crew and recalculates routes', () => {
  assert(appContent.includes('window.reassignNearestWorkerStop = function(fromWorkerId)'), 'reassignNearestWorkerStop function missing in app.js');
  assert(appContent.includes('minDistanceKm'), 'Proximity distance calculation for nearest worker missing in app.js');
  assert(appContent.includes('runSoftwareRouteOptimizer();'), 'Route optimizer re-calculation on reassign missing in app.js');
  assert(serverContent.includes('/api/reassign-stop'), 'Backend /api/reassign-stop endpoint missing in server.js');
});

runTest('Fleet Utilization Summary: Dynamic stat strip above tracking map', () => {
  assert(htmlContent.includes('id="adminStatActiveCrews"'), 'adminStatActiveCrews stat element missing in HTML');
  assert(htmlContent.includes('id="adminStatIdleCrews"'), 'adminStatIdleCrews stat element missing in HTML');
  assert(htmlContent.includes('id="adminStatAvgStops"'), 'adminStatAvgStops stat element missing in HTML');
  assert(htmlContent.includes('id="adminStatTotalUnits"'), 'adminStatTotalUnits stat element missing in HTML');
  assert(appContent.includes('function renderFleetUtilizationSummary('), 'renderFleetUtilizationSummary function missing in app.js');
});

runTest('Worker Shift Status: Start Shift / End Shift toggle controls active state and map visibility', () => {
  assert(htmlContent.includes('id="workerShiftToggleBtn"'), 'workerShiftToggleBtn missing in HTML');
  assert(htmlContent.includes('id="workerShiftStatusBadge"'), 'workerShiftStatusBadge missing in HTML');
  assert(htmlContent.includes('id="workerShiftInactivePrompt"'), 'workerShiftInactivePrompt missing in HTML');
  assert(appContent.includes('window.toggleWorkerShift = function()'), 'toggleWorkerShift function missing in app.js');
  assert(appContent.includes('shiftStatus = newStatus'), 'shiftStatus update logic missing in app.js');
});

runTest('Worker Live Distance Remaining Display: Straight-line distance readout updates with location', () => {
  assert(htmlContent.includes('id="workerLiveDistanceReadout"'), 'workerLiveDistanceReadout element missing in HTML');
  assert(htmlContent.includes('id="workerTargetDistanceBadge"'), 'workerTargetDistanceBadge element missing in HTML');
  assert(appContent.includes('liveReadoutElem.textContent ='), 'liveReadoutElem update missing in app.js');
});

runTest('Worker Today Route Summary Card: Reflects assigned, completed, remaining, and covered distance', () => {
  assert(htmlContent.includes('id="workerTodayRouteSummaryCard"'), 'workerTodayRouteSummaryCard missing in HTML');
  assert(htmlContent.includes('id="workerSummaryTotal"'), 'workerSummaryTotal missing in HTML');
  assert(htmlContent.includes('id="workerSummaryCompleted"'), 'workerSummaryCompleted missing in HTML');
  assert(htmlContent.includes('id="workerSummaryRemaining"'), 'workerSummaryRemaining missing in HTML');
  assert(htmlContent.includes('id="workerSummaryEstDistance"'), 'workerSummaryEstDistance missing in HTML');
  assert(htmlContent.includes('id="workerSummaryProgressPct"'), 'workerSummaryProgressPct missing in HTML');
  assert(htmlContent.includes('id="workerSummaryProgressBar"'), 'workerSummaryProgressBar missing in HTML');
});

runTest('Worker Vehicle & Crew Banner: Pulls consistent fleet details for current worker', () => {
  assert(htmlContent.includes('id="workerVehicleCrewBanner"'), 'workerVehicleCrewBanner missing in HTML');
  assert(htmlContent.includes('id="workerCrewNumBanner"'), 'workerCrewNumBanner missing in HTML');
  assert(htmlContent.includes('id="workerVehicleTypeBanner"'), 'workerVehicleTypeBanner missing in HTML');
  assert(htmlContent.includes('id="workerVehicleRegBanner"'), 'workerVehicleRegBanner missing in HTML');
  assert(htmlContent.includes('id="workerWardBanner"'), 'workerWardBanner missing in HTML');
});

// --------------------------------------------------------------------------
// 14. CITIZEN & ADMIN DASHBOARD CHARTS (CHART.JS)
// --------------------------------------------------------------------------
console.log('\n📊 14. Testing Citizen & Admin Dashboard Visual Charts (Chart.js)...');

runTest('Citizen Dashboard: Credit Earnings Breakdown chart implemented with source categories', () => {
  assert(htmlContent.includes('id="citizenCreditBreakdownChart"'), 'citizenCreditBreakdownChart canvas missing in HTML');
  assert(appContent.includes('function renderCitizenCreditBreakdownChart()'), 'renderCitizenCreditBreakdownChart function missing in app.js');
  assert(appContent.includes('type: \'doughnut\''), 'Doughnut chart type for credit breakdown missing');
  assert(appContent.includes('Segregation Bonus'), 'Segregation bonus label missing in credit chart');
  assert(appContent.includes('Emergency Tier'), 'Emergency tier label missing in credit chart');
});

runTest('Citizen Dashboard: Report Status Breakdown chart implemented', () => {
  assert(htmlContent.includes('id="citizenReportStatusChart"'), 'citizenReportStatusChart canvas missing in HTML');
  assert(appContent.includes('function renderCitizenReportStatusChart()'), 'renderCitizenReportStatusChart function missing in app.js');
});

runTest('Admin Dashboard: Reports Over Time (14-30 day trend line chart) implemented', () => {
  assert(htmlContent.includes('id="adminReportsOverTimeChart"'), 'adminReportsOverTimeChart canvas missing in HTML');
  assert(appContent.includes('function renderAdminReportsOverTimeChart()'), 'renderAdminReportsOverTimeChart function missing in app.js');
  assert(appContent.includes('type: \'line\''), 'Line chart type missing in reports over time');
});

runTest('Admin Dashboard: Reports by Category bar chart implemented', () => {
  assert(htmlContent.includes('id="adminCategoryChart"'), 'adminCategoryChart canvas missing in HTML');
  assert(appContent.includes('function renderAdminCategoryChart()'), 'renderAdminCategoryChart function missing in app.js');
  assert(appContent.includes('Reports by Waste Stream'), 'Waste stream label missing in category chart');
});

runTest('Admin Dashboard: Reports by Ward horizontal bar chart implemented', () => {
  assert(htmlContent.includes('id="adminWardReportsChart"'), 'adminWardReportsChart canvas missing in HTML');
  assert(appContent.includes('function renderAdminWardReportsChart()'), 'renderAdminWardReportsChart function missing in app.js');
  assert(appContent.includes('indexAxis: \'y\''), 'Horizontal bar indexAxis: y missing in ward chart');
});

runTest('Admin Dashboard: Worker Performance Comparison bar chart implemented', () => {
  assert(htmlContent.includes('id="adminWorkerPerformanceChart"'), 'adminWorkerPerformanceChart canvas missing in HTML');
  assert(htmlContent.includes('id="adminWorkerPerformanceChartEmbedded"'), 'adminWorkerPerformanceChartEmbedded canvas missing in HTML');
  assert(appContent.includes('function renderAdminWorkerPerformanceChart()'), 'renderAdminWorkerPerformanceChart function missing in app.js');
  assert(appContent.includes('Stops Cleared'), 'Stops Cleared dataset missing');
  assert(appContent.includes('Stops Remaining'), 'Stops Remaining dataset missing');
});

runTest('Admin Dashboard: Operational Status Funnel chart implemented', () => {
  assert(htmlContent.includes('id="adminStatusFunnelChart"'), 'adminStatusFunnelChart canvas missing in HTML');
  assert(appContent.includes('function renderAdminStatusFunnelChart()'), 'renderAdminStatusFunnelChart function missing in app.js');
});

runTest('Admin Dashboard: Statutory Compliance Trend vs SBM 2.0 Targets multi-line chart implemented', () => {
  assert(htmlContent.includes('id="adminComplianceTrendChart"'), 'adminComplianceTrendChart canvas missing in HTML');
  assert(htmlContent.includes('id="adminComplianceTrendChartEmbedded"'), 'adminComplianceTrendChartEmbedded canvas missing in HTML');
  assert(appContent.includes('function renderAdminComplianceTrendChart()'), 'renderAdminComplianceTrendChart function missing in app.js');
  assert(appContent.includes('SBM Segregation Target (60%)'), 'SBM segregation target reference line missing');
  assert(appContent.includes('SBM Coverage Target (80%)'), 'SBM coverage target reference line missing');
  assert(appContent.includes('SBM Processing Target (80%)'), 'SBM processing target reference line missing');
});

runTest('Admin Dashboard: Dedicated Operational Intelligence & Analytics tab and panel implemented', () => {
  assert(htmlContent.includes('id="adminTabAnalytics"'), 'adminTabAnalytics tab missing in HTML');
  assert(htmlContent.includes('id="adminPanelAnalytics"'), 'adminPanelAnalytics panel missing in HTML');
  assert(appContent.includes('window.renderAdminAnalyticsCharts = function()'), 'renderAdminAnalyticsCharts function missing in app.js');
});

runTest('Chart Lifecycle Management: Chart instances destroy previous instances before re-rendering', () => {
  assert(appContent.includes('citizenCreditBreakdownChartObj.destroy()'), 'citizenCreditBreakdownChartObj destruction missing');
  assert(appContent.includes('citizenReportStatusChartObj.destroy()'), 'citizenReportStatusChartObj destruction missing');
  assert(appContent.includes('adminReportsOverTimeChartObj.destroy()'), 'adminReportsOverTimeChartObj destruction missing');
  assert(appContent.includes('adminCategoryChartObj.destroy()'), 'adminCategoryChartObj destruction missing');
  assert(appContent.includes('adminWardReportsChartObj.destroy()'), 'adminWardReportsChartObj destruction missing');
  assert(appContent.includes('adminWorkerPerformanceChartObj.destroy()'), 'adminWorkerPerformanceChartObj destruction missing');
  assert(appContent.includes('adminStatusFunnelChartObj.destroy()'), 'adminStatusFunnelChartObj destruction missing');
  assert(appContent.includes('adminComplianceTrendChartObj.destroy()'), 'adminComplianceTrendChartObj destruction missing');
});

// --------------------------------------------------------------------------
// 15. ADVANCED MUNICIPAL OPERATIONS, PWA & CIVIC ENGAGEMENT
// --------------------------------------------------------------------------
console.log('\n🚀 15. Testing Advanced Municipal Operations, PWA & Civic Engagement...');

runTest('PWA Manifest & Service Worker: Progressive Web App assets configured', () => {
  assert(fs.existsSync(path.join(__dirname, 'manifest.json')), 'manifest.json missing');
  assert(fs.existsSync(path.join(__dirname, 'sw.js')), 'sw.js service worker missing');
  assert(appContent.includes('navigator.serviceWorker.register'), 'Service worker registration missing in app.js');
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf-8'));
  assert(manifest.name.includes('EcoClear'), 'PWA name mismatch in manifest.json');
  assert(manifest.display === 'standalone', 'PWA display mode must be standalone');
});

runTest('Offline Queue & Banner: Offline capability and synchronization logic', () => {
  assert(htmlContent.includes('id="offlineQueueBanner"'), 'offlineQueueBanner element missing in HTML');
  assert(appContent.includes('function initOfflineQueueSync()'), 'initOfflineQueueSync function missing in app.js');
  assert(appContent.includes('window.flushOfflineQueue'), 'flushOfflineQueue function missing in app.js');
});

runTest('In-App Notification Center: Dropdown, badge, and notification store', () => {
  assert(htmlContent.includes('id="notificationBadge"'), 'notificationBadge missing in HTML');
  assert(htmlContent.includes('id="notificationDropdown"'), 'notificationDropdown missing in HTML');
  assert(htmlContent.includes('id="notificationList"'), 'notificationList missing in HTML');
  assert(appContent.includes('function addNotification('), 'addNotification function missing in app.js');
  assert(appContent.includes('window.toggleNotificationDropdown'), 'toggleNotificationDropdown missing in app.js');
  assert(appContent.includes('window.markAllNotificationsRead'), 'markAllNotificationsRead missing in app.js');
});

runTest('Multi-Language Switcher (i18n): Language toggling with English and Hindi support', () => {
  assert(htmlContent.includes('id="langToggleBtn"'), 'langToggleBtn missing in HTML');
  assert(appContent.includes('const I18N = {'), 'I18N dictionary missing in app.js');
  assert(appContent.includes('window.toggleAppLanguage'), 'toggleAppLanguage missing in app.js');
  assert(appContent.includes('function applyAppLanguage('), 'applyAppLanguage missing in app.js');
});

runTest('Keyboard Shortcuts: Global navigation overlay and key listeners', () => {
  assert(htmlContent.includes('id="keyboardShortcutsModal"'), 'keyboardShortcutsModal missing in HTML');
  assert(appContent.includes('window.openKeyboardShortcutsModal'), 'openKeyboardShortcutsModal missing in app.js');
  assert(appContent.includes('initKeyboardShortcuts()'), 'initKeyboardShortcuts missing in app.js');
});

runTest('Worker Daily Pre-Shift Safety Checklist: 5 PPE/vehicle items and inspection log', () => {
  assert(htmlContent.includes('id="checkPpeGloves"'), 'checkPpeGloves checkbox missing in HTML');
  assert(htmlContent.includes('id="workerSafetyChecklistProgress"'), 'workerSafetyChecklistProgress missing in HTML');
  assert(htmlContent.includes('id="workerSafetySubmitBtn"'), 'workerSafetySubmitBtn missing in HTML');
  assert(appContent.includes('window.updateWorkerSafetyChecklist'), 'updateWorkerSafetyChecklist missing in app.js');
  assert(appContent.includes('window.saveWorkerSafetyLog'), 'saveWorkerSafetyLog missing in app.js');
});

runTest('Worker Clearance Photo Gallery: Completed route clearance visual proof feed', () => {
  assert(htmlContent.includes('id="workerPhotoProofGrid"'), 'workerPhotoProofGrid missing in HTML');
  assert(htmlContent.includes('id="workerPhotoProofCountBadge"'), 'workerPhotoProofCountBadge missing in HTML');
  assert(appContent.includes('function renderWorkerPhotoProofGallery()'), 'renderWorkerPhotoProofGallery missing in app.js');
});

runTest('Admin Operational Audit Trail: Historical event log table with action tagging', () => {
  assert(htmlContent.includes('id="adminLogsTableBody"'), 'adminLogsTableBody missing in HTML');
  assert(appContent.includes('function logAdminAction('), 'logAdminAction missing in app.js');
  assert(appContent.includes('function renderAdminLogsTable()'), 'renderAdminLogsTable missing in app.js');
});

runTest('Admin Weekly Digest Report: Executive summary modal with SLA, clearance rate, and top wards', () => {
  assert(htmlContent.includes('id="adminWeeklyDigestModal"'), 'adminWeeklyDigestModal missing in HTML');
  assert(htmlContent.includes('id="digestTotalReports"'), 'digestTotalReports missing in HTML');
  assert(htmlContent.includes('id="digestClearanceRate"'), 'digestClearanceRate missing in HTML');
  assert(appContent.includes('window.openAdminWeeklyDigestModal'), 'openAdminWeeklyDigestModal missing in app.js');
});

runTest('Hospital Pharmaceutical Expiry Tracking: Medicine batch expiry modal and alert table', () => {
  assert(htmlContent.includes('id="addPharmaExpiryModal"'), 'addPharmaExpiryModal missing in HTML');
  assert(htmlContent.includes('id="addPharmaExpiryForm"'), 'addPharmaExpiryForm missing in HTML');
  assert(htmlContent.includes('id="hospitalPharmaExpiryTableBody"'), 'hospitalPharmaExpiryTableBody missing in HTML');
  assert(appContent.includes('window.openAddPharmaExpiryModal'), 'openAddPharmaExpiryModal missing in app.js');
  assert(appContent.includes('window.handleAddPharmaExpirySubmit'), 'handleAddPharmaExpirySubmit missing in app.js');
});

runTest('Institution Waste Audit Certificate & Peer Benchmarking: Printable certificate with seal', () => {
  assert(htmlContent.includes('id="instAuditCertModal"'), 'instAuditCertModal missing in HTML');
  assert(htmlContent.includes('id="certOrgName"'), 'certOrgName missing in HTML');
  assert(htmlContent.includes('id="certOrgWard"'), 'certOrgWard missing in HTML');
  assert(stylesContent.includes('.inst-cert-card'), 'inst-cert-card styling missing in styles.css');
  assert(appContent.includes('window.openWasteAuditCertModal'), 'openWasteAuditCertModal missing in app.js');
});

// --------------------------------------------------------------------------
// 16. PURPOSEFUL ANIMATIONS & SELF-CONTAINED INLINE SVG GRAPHICS
// --------------------------------------------------------------------------
console.log('\n🎨 16. Testing Purposeful Animations & Self-Contained Inline SVG Graphics...');

runTest('Signup Animations: Interactive Role selection cards, Google Sign-In & conditional reveals', () => {
  assert(stylesContent.includes('.role-select-card'), 'role-select-card CSS missing');
  assert(stylesContent.includes('.role-card-grid'), 'role-card-grid CSS missing');
  assert(htmlContent.includes('role-card-grid'), 'role-card-grid container missing in HTML');
  assert(htmlContent.includes('selectSignupRole(\'citizen\')'), 'Role selection trigger citizen missing');
  assert(htmlContent.includes('selectSignupRole(\'hospital\')'), 'Role selection trigger hospital missing');
  assert(appContent.includes('window.selectSignupRole = function(role)'), 'selectSignupRole function missing in app.js');
  assert(appContent.includes('window.switchAuthTab = function(tab)'), 'switchAuthTab function missing in app.js');
  assert(htmlContent.includes('btn-google'), 'Google Sign-In button missing in index.html');
  assert(stylesContent.includes('.btn-google'), 'btn-google styling missing in styles.css');
  assert(appContent.includes('window.handleGoogleSignIn = function()'), 'handleGoogleSignIn function missing in app.js');
});

runTest('Form Validation & Submission: Feedback shake animation and button loading spinner', () => {
  assert(stylesContent.includes('.form-input-error'), 'form-input-error class missing in styles.css');
  assert(stylesContent.includes('@keyframes formShake'), 'formShake keyframes missing in styles.css');
  assert(stylesContent.includes('.btn-loading'), 'btn-loading class missing in styles.css');
  assert(stylesContent.includes('.btn-spinner'), 'btn-spinner class missing in styles.css');
  assert(appContent.includes('function triggerFieldValidationError('), 'triggerFieldValidationError function missing in app.js');
  assert(appContent.includes('btn-loading') && appContent.includes('btn-spinner'), 'Loading spinner triggers on auth submission missing in app.js');
});

runTest('Live Worker Tracking Map: Smooth marker interpolation, vehicle SVGs & route draw-in', () => {
  assert(appContent.includes('function animateMarkerTo('), 'animateMarkerTo interpolation function missing in app.js');
  assert(appContent.includes('adminWorkerMarkersMap = new Map()'), 'adminWorkerMarkersMap diffing map missing in app.js');
  assert(appContent.includes('function getVehicleSvgIcon('), 'getVehicleSvgIcon function missing in app.js');
  assert(stylesContent.includes('.emergency-pulse-marker'), 'emergency-pulse-marker class missing in styles.css');
  assert(stylesContent.includes('.animated-route-line'), 'animated-route-line class missing in styles.css');
  assert(appContent.includes('function animatePolylineDrawIn('), 'animatePolylineDrawIn progressive draw function missing in app.js');
  assert(stylesContent.includes('.stop-count-badge-pop'), 'stop-count-badge-pop class missing in styles.css');
  assert(stylesContent.includes('.spin-refresh-icon'), 'spin-refresh-icon class missing in styles.css');
});

runTest('Self-Contained Inline SVGs: Hero illustration, segregation guide, rewards & empty states', () => {
  // Hero illustration in HTML
  assert(htmlContent.includes('hero-svg-graphic'), 'hero-svg-graphic SVG missing in index.html');
  assert(htmlContent.includes('Mumbai Skyline'), 'Skyline layer missing in hero SVG');
  assert(htmlContent.includes('Smart Waste Compactor Truck'), 'Compactor layer missing in hero SVG');
  
  // Inline category & reward SVGs
  assert(appContent.includes('function getCategorySvgIcon('), 'getCategorySvgIcon missing in app.js');
  assert(appContent.includes('function getRewardSvgIcon('), 'getRewardSvgIcon missing in app.js');
  assert(appContent.includes('function getEmptyStateHTML('), 'getEmptyStateHTML helper missing in app.js');
  
  // Zero external photo stock CDNs
  assert(!htmlContent.includes('images.unsplash.com'), 'Unsplash external photo found in index.html');
  assert(!htmlContent.includes('images.pexels.com'), 'Pexels external photo found in index.html');
});

runTest('Accessibility: Comprehensive prefers-reduced-motion overrides in CSS and JS', () => {
  assert(stylesContent.includes('@media (prefers-reduced-motion: reduce)'), 'prefers-reduced-motion media query missing in styles.css');
  assert(stylesContent.includes('animation-duration: 0.001ms !important'), 'Reduced motion duration override missing');
  assert(appContent.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"), 'Reduced motion media query check missing in app.js');
});

// --------------------------------------------------------------------------
// 17. CUSTOM ANIMATED VEHICLE GPS MARKERS & LIVE FLEET ROUTE MOTION
// --------------------------------------------------------------------------
console.log('\n🚛 17. Testing Custom Animated Vehicle GPS Markers & Route Motion...');

runTest('Vehicle Markers: Inline SVGs for Compactor, Tipper, E-Rickshaw & Mini-Truck', () => {
  assert(appContent.includes('vehicle-compactor-svg'), 'Compactor truck SVG missing in app.js');
  assert(appContent.includes('vehicle-tipper-svg'), 'Tipper truck SVG missing in app.js');
  assert(appContent.includes('vehicle-erickshaw-svg'), 'E-rickshaw SVG missing in app.js');
  assert(appContent.includes('vehicle-minitruck-svg'), 'Mini-truck SVG missing in app.js');
  assert(appContent.includes('function createVehicleMarkerHtml('), 'createVehicleMarkerHtml function missing in app.js');
});

runTest('Directional Rotation & Bearing Calculation', () => {
  assert(appContent.includes('function calculateBearing('), 'calculateBearing function missing in app.js');
  assert(stylesContent.includes('.vehicle-icon-rotator'), '.vehicle-icon-rotator CSS class missing in styles.css');
  assert(stylesContent.includes('transform-origin: 50% 50%'), 'transform-origin: 50% 50% missing in styles.css');
});

runTest('Idle vs Moving States: Subtle bounce, ripple ring and exhaust particles', () => {
  assert(stylesContent.includes('.vehicle-marker-container.vehicle-state-idle'), 'vehicle-state-idle class missing in styles.css');
  assert(stylesContent.includes('.vehicle-marker-container.vehicle-state-moving'), 'vehicle-state-moving class missing in styles.css');
  assert(stylesContent.includes('@keyframes vehicleIdleBounce'), 'vehicleIdleBounce keyframes missing in styles.css');
  assert(stylesContent.includes('.vehicle-exhaust-stream'), 'vehicle-exhaust-stream missing in styles.css');
  assert(stylesContent.includes('@keyframes vehicleExhaustPuff'), 'vehicleExhaustPuff keyframes missing in styles.css');
  assert(stylesContent.includes('.vehicle-motion-trail'), 'vehicle-motion-trail class missing in styles.css');
});

runTest('Pacing, Reusable Interpolation & Reduced Motion', () => {
  assert(appContent.includes('function animateMarkerTo('), 'animateMarkerTo interpolation missing in app.js');
  assert(stylesContent.includes('.vehicle-marker-container.vehicle-state-idle .vehicle-icon-body') && 
         stylesContent.includes('@media (prefers-reduced-motion: reduce)'), 'prefers-reduced-motion override missing for vehicle animations in styles.css');
  assert(htmlContent.includes('btnAdminLiveSimulationToggle'), 'btnAdminLiveSimulationToggle missing in index.html');
});

// --------------------------------------------------------------------------
// TEST SUMMARY
// --------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`📊 Verification Summary: ${testsPassed} Passed, ${testsFailed} Failed`);
console.log('======================================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL COMPREHENSIVE VERIFICATION TESTS PASSED!');
  process.exit(0);
}

