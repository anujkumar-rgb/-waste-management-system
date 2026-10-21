/**
 * Smart Waste Management System — Three.js 3D Digital Twin Engine
 * High-performance WebGL interactive visualizations:
 * 1. Hero 3D Viewport (Eco-Globe, Smart IoT Bin, Municipal EV Compactor)
 * 2. Fullscreen 3D Digital Twin City Explorer (Isometric City, Wards, Dynamic Fleet)
 * 3. Citizen 3D Virtual Segregation Studio (Interactive sorting with physics drops)
 */

(function () {
  'use strict';

  // Global namespace
  window.EcoClear3D = {
    hero: null,
    cityTwin: null,
    segregationStudio: null,
    init: initAll3D,
    openCityTwin: open3DCityTwinModal,
    closeCityTwin: close3DCityTwinModal,
    setHeroMode: setHeroMode,
    setBinFill: setBinFill,
    toggleBinLid: toggleBinLid,
    setBinCategory: setBinCategory,
    triggerCompactorCycle: triggerCompactorCycle,
    setCityTimeOfDay: setCityTimeOfDay,
    setCityCameraPreset: setCityCameraPreset,
    dropSegregationItem: dropSegregationItem
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not yet loaded. Will retry...');
      setTimeout(initAll3D, 500);
    } else {
      initAll3D();
    }
  });

  function initAll3D() {
    if (typeof THREE === 'undefined') return;
    try {
      initHero3D();
      initCitizenSegregationStudio();
      // Listen for theme changes to update 3D ambient lighting and background
      const observer = new MutationObserver(() => {
        updateThemesForAll3D();
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch (err) {
      console.error('Error initializing 3D Engine:', err);
    }
  }

  /* ==========================================================================
     SHARED HELPERS & MATERIALS
     ========================================================================== */
  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function getThemeColors() {
    const dark = isDarkMode();
    return {
      bg: dark ? 0x0b1310 : 0xf4f5f2,
      cardBg: dark ? 0x121e19 : 0xffffff,
      forestInk: dark ? 0x34d399 : 0x166534,
      spruceGreen: 0x22c55e,
      cobaltAccent: 0x3b82f6,
      signalAmber: 0xf59e0b,
      signalCrimson: 0xef4444,
      wireframe: dark ? 0x1e3a2f : 0xccd5cf,
      ambient: dark ? 0x22332a : 0xe8ece9
    };
  }

  function updateThemesForAll3D() {
    if (window.EcoClear3D.hero) window.EcoClear3D.hero.updateTheme();
    if (window.EcoClear3D.cityTwin) window.EcoClear3D.cityTwin.updateTheme();
    if (window.EcoClear3D.segregationStudio) window.EcoClear3D.segregationStudio.updateTheme();
  }

  /* ==========================================================================
     1. HERO 3D VIEWPORT ENGINE
     ========================================================================== */
  function initHero3D() {
    const container = document.getElementById('hero3DCanvasContainer');
    if (!container) return;

    // Avoid double init
    if (window.EcoClear3D.hero && window.EcoClear3D.hero.renderer) return;

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDarkMode() ? 0x09140f : 0xebf0ec, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    let controls = null;
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.maxDistance = 9;
      controls.minDistance = 2.5;
      controls.maxPolarAngle = Math.PI / 2 + 0.1;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.2;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode() ? 0.7 : 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const greenPointLight = new THREE.PointLight(0x22c55e, 1.5, 10);
    greenPointLight.position.set(-3, 2, 2);
    scene.add(greenPointLight);

    const bluePointLight = new THREE.PointLight(0x3b82f6, 1.2, 10);
    bluePointLight.position.set(3, -1, -2);
    scene.add(bluePointLight);

    // Root groups for 3 distinct 3D models
    const rootGlobe = new THREE.Group();
    const rootBin = new THREE.Group();
    const rootTruck = new THREE.Group();

    scene.add(rootGlobe);
    scene.add(rootBin);
    scene.add(rootTruck);

    rootBin.visible = false;
    rootTruck.visible = false;

    // --- Build Model A: Eco-Globe Digital Twin ---
    const globeComponents = buildEcoGlobe(rootGlobe);

    // --- Build Model B: Smart IoT Bin ---
    const binComponents = buildSmartBin(rootBin);

    // --- Build Model C: Municipal EV Compactor Truck ---
    const truckComponents = buildEVTruck(rootTruck);

    // Particles Cloud (Floating Eco Sparkles)
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 120;
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 12;
      particlePos[i + 1] = (Math.random() - 0.5) * 8;
      particlePos[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x4ade80,
      size: 0.07,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Raycasting for interactive clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (rootGlobe.visible) {
        const intersects = raycaster.intersectObjects(globeComponents.clickableMarkers, true);
        if (intersects.length > 0) {
          const marker = intersects[0].object;
          onWardMarkerClicked(marker.userData);
        }
      } else if (rootBin.visible) {
        const intersects = raycaster.intersectObjects(rootBin.children, true);
        if (intersects.length > 0) {
          toggleBinLid();
        }
      } else if (rootTruck.visible) {
        triggerCompactorCycle();
      }
    });

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || 460;
      const h = container.clientHeight || 260;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();
    let currentMode = 'globe';

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (controls) controls.update();

      // Globe specific animations
      if (rootGlobe.visible) {
        globeComponents.ring.rotation.z += 0.005;
        globeComponents.ring2.rotation.x += 0.004;
        globeComponents.orbitArcPulse(elapsed);
        globeComponents.satelliteOrbit(elapsed);
      }

      // Bin specific animations
      if (rootBin.visible) {
        binComponents.update(delta, elapsed);
      }

      // Truck specific animations
      if (rootTruck.visible) {
        truckComponents.update(delta, elapsed);
      }

      // Ambient particle slow float
      particleSystem.rotation.y = elapsed * 0.03;

      renderer.render(scene, camera);
    }
    animate();

    window.EcoClear3D.hero = {
      scene,
      camera,
      renderer,
      controls,
      rootGlobe,
      rootBin,
      rootTruck,
      binComponents,
      truckComponents,
      globeComponents,
      setMode(mode) {
        currentMode = mode;
        rootGlobe.visible = (mode === 'globe');
        rootBin.visible = (mode === 'bin');
        rootTruck.visible = (mode === 'truck');

        if (mode === 'globe') {
          camera.position.set(0, 1.8, 5.5);
          if (controls) {
            controls.target.set(0, 0, 0);
            controls.autoRotate = true;
          }
        } else if (mode === 'bin') {
          camera.position.set(0, 1.2, 4.2);
          if (controls) {
            controls.target.set(0, 0.4, 0);
            controls.autoRotate = false;
          }
        } else if (mode === 'truck') {
          camera.position.set(3.5, 1.8, 4.2);
          if (controls) {
            controls.target.set(0, 0.3, 0);
            controls.autoRotate = false;
          }
        }
      },
      updateTheme() {
        const dark = isDarkMode();
        scene.fog.color.setHex(dark ? 0x09140f : 0xebf0ec);
        ambientLight.intensity = dark ? 0.7 : 0.95;
      }
    };
  }

  // --- Sub-builder: Eco-Globe ---
  function buildEcoGlobe(group) {
    const clickableMarkers = [];

    // Core sphere with wireframe & inner glow
    const sphereGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0d281e,
      roughness: 0.6,
      metalness: 0.2,
      emissive: 0x051a12,
      emissiveIntensity: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    group.add(sphere);

    // Wireframe grid overlay
    const wireGeo = new THREE.SphereGeometry(1.62, 18, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // Concentric Circular Economy Orbital Rings
    const ringGeo = new THREE.RingGeometry(2.1, 2.14, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    group.add(ring);

    const ring2Geo = new THREE.RingGeometry(2.35, 2.38, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3;
    group.add(ring2);

    // Mumbai Municipal Ward Beacons on Sphere Surface
    const wards = [
      { name: 'Ward G/South (Dadar)', lat: 19.02, lng: 72.84, color: 0x22c55e, status: '94% Diverted', score: 'A+' },
      { name: 'Ward S (Powai)', lat: 19.12, lng: 72.91, color: 0x38bdf8, status: '89% Diverted', score: 'A' },
      { name: 'Ward K/East (Andheri)', lat: 19.11, lng: 72.86, color: 0xf59e0b, status: '82% Diverted', score: 'B+' },
      { name: 'Ward H/West (Bandra)', lat: 19.05, lng: 72.83, color: 0x22c55e, status: '96% Diverted', score: 'A+' },
      { name: 'Ward A (Colaba)', lat: 18.91, lng: 72.81, color: 0xa855f7, status: '91% Diverted', score: 'A' }
    ];

    const wardMeshes = [];
    wards.forEach((w, idx) => {
      // Map spherical coordinates
      const phi = (90 - (w.lat - 19.0) * 12) * (Math.PI / 180);
      const theta = ((w.lng - 72.85) * 15 + idx * 72) * (Math.PI / 180);
      const r = 1.63;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      // Beacon Base
      const pinGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.35, 8);
      const pinMat = new THREE.MeshStandardMaterial({
        color: w.color,
        emissive: w.color,
        emissiveIntensity: 0.8
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(x, y, z);
      pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y, z).normalize());
      pin.userData = w;
      group.add(pin);
      clickableMarkers.push(pin);

      // Pulsing Beacon Halo
      const haloGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const haloMat = new THREE.MeshBasicMaterial({ color: w.color, wireframe: true, transparent: true, opacity: 0.8 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(x * 1.12, y * 1.12, z * 1.12);
      halo.userData = w;
      group.add(halo);
      clickableMarkers.push(halo);

      wardMeshes.push({ pin, halo, basePos: new THREE.Vector3(x, y, z) });
    });

    // 3D Connecting Logistics Arcs between wards
    const arcCurves = [];
    for (let i = 0; i < wardMeshes.length; i++) {
      const p1 = wardMeshes[i].basePos;
      const p2 = wardMeshes[(i + 1) % wardMeshes.length].basePos;
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.multiplyScalar(1.35); // Pull outward to form high arc

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      arcCurves.push(curve);

      const points = curve.getPoints(30);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.45 });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      group.add(arcLine);
    }

    // Moving Data Pulses along arcs
    const pulseCount = arcCurves.length;
    const pulseGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pulses = [];
    for (let i = 0; i < pulseCount; i++) {
      const p = new THREE.Mesh(pulseGeo, pulseMat);
      group.add(p);
      pulses.push(p);
    }

    // Floating IoT Satellite / Drone
    const droneGroup = new THREE.Group();
    const droneBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.12), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 }));
    droneGroup.add(droneBody);
    const wingGeo = new THREE.BoxGeometry(0.4, 0.015, 0.1);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    droneGroup.add(wings);
    const droneLight = new THREE.PointLight(0x22c55e, 1.2, 1);
    droneGroup.add(droneLight);
    group.add(droneGroup);

    return {
      ring,
      ring2,
      clickableMarkers,
      orbitArcPulse: (elapsed) => {
        pulses.forEach((pulse, idx) => {
          const t = (elapsed * 0.4 + idx * (1 / pulseCount)) % 1;
          const pos = arcCurves[idx].getPoint(t);
          pulse.position.copy(pos);
        });
        wardMeshes.forEach((w, idx) => {
          const scale = 1 + 0.3 * Math.sin(elapsed * 3 + idx);
          w.halo.scale.set(scale, scale, scale);
        });
      },
      satelliteOrbit: (elapsed) => {
        const angle = elapsed * 0.6;
        droneGroup.position.set(Math.cos(angle) * 2.4, Math.sin(angle * 1.5) * 0.6, Math.sin(angle) * 2.4);
        droneGroup.rotation.y = -angle + Math.PI / 2;
      }
    };
  }

  // --- Sub-builder: Smart IoT Bin ---
  function buildSmartBin(group) {
    // Pedestal
    const basePlateGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.1, 32);
    const basePlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const basePlate = new THREE.Mesh(basePlateGeo, basePlateMat);
    basePlate.position.y = -1.25;
    basePlate.receiveShadow = true;
    group.add(basePlate);

    // Bin Body (tapered container with rounded appearance)
    const binGeo = new THREE.CylinderGeometry(0.72, 0.58, 2.0, 16);
    const binMat = new THREE.MeshStandardMaterial({
      color: 0x166534, // Forest green default (wet waste)
      roughness: 0.4,
      metalness: 0.2
    });
    const binBody = new THREE.Mesh(binGeo, binMat);
    binBody.position.y = -0.2;
    binBody.castShadow = true;
    binBody.receiveShadow = true;
    group.add(binBody);

    // Decorative embossed civic ribs
    for (let r = -0.8; r <= 0.4; r += 0.4) {
      const ribGeo = new THREE.TorusGeometry(0.66 + r * 0.08, 0.02, 8, 24);
      const ribMat = new THREE.MeshStandardMaterial({ color: 0x0f3d20, roughness: 0.5 });
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.rotation.x = Math.PI / 2;
      rib.position.y = r;
      group.add(rib);
    }

    // Hinged Lid Group
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.8, -0.65); // Pivot point at back edge
    group.add(lidGroup);

    const lidMeshGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.14, 16);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.3,
      metalness: 0.1
    });
    const lidMesh = new THREE.Mesh(lidMeshGeo, lidMat);
    lidMesh.position.set(0, 0.07, 0.65); // offset relative to hinge pivot
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    // Solar Panel on Lid
    const solarGeo = new THREE.BoxGeometry(0.6, 0.02, 0.6);
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x1e293b,
      emissiveIntensity: 0.5
    });
    const solar = new THREE.Mesh(solarGeo, solarMat);
    solar.position.set(0, 0.15, 0.65);
    lidGroup.add(solar);

    // Ultrasonic Sensor underneath lid emitting scanning cone
    const sensorGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(0, -0.04, 0.65);
    lidGroup.add(sensor);

    const laserConeGeo = new THREE.ConeGeometry(0.5, 1.4, 16, 1, true);
    const laserConeMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const laserCone = new THREE.Mesh(laserConeGeo, laserConeMat);
    laserCone.position.set(0, -0.75, 0.65);
    laserCone.rotation.x = Math.PI;
    lidGroup.add(laserCone);

    // Dynamic Internal Waste Level
    const wasteGeo = new THREE.CylinderGeometry(0.68, 0.56, 1.6, 16);
    const wasteMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.9,
      wireframe: false
    });
    const wasteMesh = new THREE.Mesh(wasteGeo, wasteMat);
    wasteMesh.position.y = -0.3;
    wasteMesh.scale.set(0.95, 0.45, 0.95); // Starts at ~45% full
    group.add(wasteMesh);

    // Wheels & Axle
    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const wheel1 = new THREE.Mesh(wheelGeo, wheelMat);
    wheel1.rotation.z = Math.PI / 2;
    wheel1.position.set(0.56, -1.05, -0.5);
    wheel1.castShadow = true;
    group.add(wheel1);

    const wheel2 = wheel1.clone();
    wheel2.position.x = -0.56;
    group.add(wheel2);

    // Fill Status LED on Front
    const ledGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 1.0
    });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0, 0.4, 0.68);
    group.add(led);

    let isLidOpen = false;
    let targetLidAngle = 0;
    let currentLidAngle = 0;
    let targetFillScale = 0.45;

    return {
      binBody,
      lidGroup,
      wasteMesh,
      laserCone,
      led,
      toggleLid: () => {
        isLidOpen = !isLidOpen;
        targetLidAngle = isLidOpen ? -Math.PI / 2.2 : 0;
        return isLidOpen;
      },
      setFillLevel: (pct) => {
        const clamped = Math.max(0.05, Math.min(1.0, pct / 100));
        targetFillScale = clamped;
        // Adjust LED color based on fill
        if (clamped < 0.6) {
          led.material.color.setHex(0x22c55e);
          led.material.emissive.setHex(0x22c55e);
          laserCone.material.color.setHex(0x22c55e);
        } else if (clamped < 0.85) {
          led.material.color.setHex(0xf59e0b);
          led.material.emissive.setHex(0xf59e0b);
          laserCone.material.color.setHex(0xf59e0b);
        } else {
          led.material.color.setHex(0xef4444);
          led.material.emissive.setHex(0xef4444);
          laserCone.material.color.setHex(0xef4444);
        }
      },
      setCategory: (cat) => {
        const colors = {
          wet: { body: 0x166534, lid: 0x15803d, waste: 0x3f6212 },
          dry: { body: 0x1d4ed8, lid: 0x2563eb, waste: 0x60a5fa },
          hazardous: { body: 0xb45309, lid: 0xd97706, waste: 0xfef08a },
          biomedical: { body: 0xb91c1c, lid: 0xdc2626, waste: 0xfca5a5 }
        };
        const c = colors[cat] || colors.wet;
        binBody.material.color.setHex(c.body);
        lidMesh.material.color.setHex(c.lid);
        wasteMesh.material.color.setHex(c.waste);
      },
      update: (delta, elapsed) => {
        // Smooth lid open/close interpolation
        currentLidAngle += (targetLidAngle - currentLidAngle) * 0.15;
        lidGroup.rotation.x = currentLidAngle;

        // Smooth waste fill height
        wasteMesh.scale.y += (targetFillScale - wasteMesh.scale.y) * 0.1;
        wasteMesh.position.y = -1.1 + wasteMesh.scale.y * 0.8;

        // Pulsing laser cone
        laserCone.material.opacity = 0.25 + 0.15 * Math.sin(elapsed * 6);
      }
    };
  }

  // --- Sub-builder: Municipal EV Compactor Truck ---
  function buildEVTruck(group) {
    // Road Bed with Animated Dashed Lane
    const roadGeo = new THREE.PlaneGeometry(12, 3.2);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = -0.8;
    road.receiveShadow = true;
    group.add(road);

    // Dashed road lane stripes
    const laneLines = [];
    for (let i = -5; i <= 5; i += 2) {
      const stripeGeo = new THREE.PlaneGeometry(0.9, 0.12);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i, -0.79, 0);
      group.add(stripe);
      laneLines.push(stripe);
    }

    // Truck Body Assembly
    const truck = new THREE.Group();
    group.add(truck);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.2, 1.2, 1.4);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.3 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(1.4, 0.1, 0);
    cabin.castShadow = true;
    truck.add(cabin);

    // Windshield & Side Windows
    const glassGeo = new THREE.BoxGeometry(0.3, 0.55, 1.25);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75
    });
    const windshield = new THREE.Mesh(glassGeo, glassMat);
    windshield.position.set(1.9, 0.35, 0);
    truck.add(windshield);

    // Front Bumper & Headlights
    const bumperGeo = new THREE.BoxGeometry(0.2, 0.3, 1.45);
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const bumper = new THREE.Mesh(bumperGeo, bumperMat);
    bumper.position.set(2.05, -0.35, 0);
    truck.add(bumper);

    const lightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const leftLight = new THREE.Mesh(lightGeo, lightMat);
    leftLight.rotation.z = Math.PI / 2;
    leftLight.position.set(2.1, -0.3, 0.45);
    truck.add(leftLight);
    const rightLight = leftLight.clone();
    rightLight.position.z = -0.45;
    truck.add(rightLight);

    // Volumetric Headlight Beams
    const beamGeo = new THREE.ConeGeometry(0.8, 3.5, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const leftBeam = new THREE.Mesh(beamGeo, beamMat);
    leftBeam.rotation.z = -Math.PI / 2;
    leftBeam.position.set(3.8, -0.3, 0.45);
    truck.add(leftBeam);
    const rightBeam = leftBeam.clone();
    rightBeam.position.z = -0.45;
    truck.add(rightBeam);

    // Compactor Cargo Body
    const compactorGeo = new THREE.BoxGeometry(2.4, 1.5, 1.5);
    const compactorMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.4 });
    const compactor = new THREE.Mesh(compactorGeo, compactorMat);
    compactor.position.set(-0.4, 0.3, 0);
    compactor.castShadow = true;
    truck.add(compactor);

    // Hydraulic Compactor Blade (Rear Hopper)
    const bladeGeo = new THREE.BoxGeometry(0.1, 0.9, 1.35);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const compactorBlade = new THREE.Mesh(bladeGeo, bladeMat);
    compactorBlade.position.set(-1.4, 0.1, 0);
    truck.add(compactorBlade);

    // Roof Solar Array
    const solarGeo = new THREE.BoxGeometry(1.8, 0.05, 1.3);
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
    const solar = new THREE.Mesh(solarGeo, solarMat);
    solar.position.set(-0.4, 1.1, 0);
    truck.add(solar);

    // Green Roof Municipal Beacon
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.15, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(1.3, 0.78, 0);
    truck.add(beacon);

    // 6 Sturdy Wheels
    const wheels = [];
    const wheelPositions = [
      [1.4, -0.45, 0.75], [1.4, -0.45, -0.75],
      [-0.1, -0.45, 0.75], [-0.1, -0.45, -0.75],
      [-1.0, -0.45, 0.75], [-1.0, -0.45, -0.75]
    ];
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    wheelPositions.forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(...pos);
      w.castShadow = true;
      truck.add(w);
      wheels.push(w);
    });

    let compactorCycleActive = false;
    let cycleTime = 0;

    return {
      triggerCycle: () => {
        compactorCycleActive = true;
        cycleTime = 0;
      },
      update: (delta, elapsed) => {
        // Rotate wheels & scroll road to simulate driving motion
        wheels.forEach(w => {
          w.rotation.y += delta * 6;
        });

        laneLines.forEach(stripe => {
          stripe.position.x -= delta * 4;
          if (stripe.position.x < -6) stripe.position.x = 6;
        });

        // Gentle chassis suspension bounce
        truck.position.y = Math.sin(elapsed * 10) * 0.02;

        // Flashing green roof beacon
        beacon.material.opacity = 0.5 + 0.5 * Math.sin(elapsed * 8);

        // Compactor blade hydraulic cycle animation
        if (compactorCycleActive) {
          cycleTime += delta * 2;
          compactorBlade.position.x = -1.4 + Math.sin(cycleTime * Math.PI) * 0.5;
          if (cycleTime >= 1.0) {
            compactorCycleActive = false;
            compactorBlade.position.x = -1.4;
          }
        }
      }
    };
  }

  /* ==========================================================================
     HERO CONTROLLER APIS
     ========================================================================== */
  function setHeroMode(mode) {
    if (!window.EcoClear3D.hero) return;
    window.EcoClear3D.hero.setMode(mode);

    // Update active tab buttons
    document.querySelectorAll('.hero-3d-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    // Show/hide contextual bottom toolbars
    const binToolbar = document.getElementById('hero3DBinToolbar');
    const globeToolbar = document.getElementById('hero3DGlobeToolbar');
    const truckToolbar = document.getElementById('hero3DTruckToolbar');

    if (binToolbar) binToolbar.style.display = (mode === 'bin') ? 'flex' : 'none';
    if (globeToolbar) globeToolbar.style.display = (mode === 'globe') ? 'flex' : 'none';
    if (truckToolbar) truckToolbar.style.display = (mode === 'truck') ? 'flex' : 'none';
  }

  function setBinFill(value) {
    if (window.EcoClear3D.hero && window.EcoClear3D.hero.binComponents) {
      window.EcoClear3D.hero.binComponents.setFillLevel(value);
      const label = document.getElementById('heroBinFillLabel');
      if (label) label.textContent = `${value}%`;
    }
  }

  function toggleBinLid() {
    if (window.EcoClear3D.hero && window.EcoClear3D.hero.binComponents) {
      const isOpen = window.EcoClear3D.hero.binComponents.toggleLid();
      const btn = document.getElementById('heroToggleLidBtn');
      if (btn) btn.textContent = isOpen ? 'Close Lid' : 'Open Lid';
      if (typeof playCivicAudio === 'function') playCivicAudio('click');
    }
  }

  function setBinCategory(cat) {
    if (window.EcoClear3D.hero && window.EcoClear3D.hero.binComponents) {
      window.EcoClear3D.hero.binComponents.setCategory(cat);
      document.querySelectorAll('.hero-bin-cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
      });
      if (typeof playCivicAudio === 'function') playCivicAudio('click');
    }
  }

  function triggerCompactorCycle() {
    if (window.EcoClear3D.hero && window.EcoClear3D.hero.truckComponents) {
      window.EcoClear3D.hero.truckComponents.triggerCycle();
      if (typeof playCivicAudio === 'function') playCivicAudio('success');
    }
  }

  function onWardMarkerClicked(wardData) {
    const banner = document.getElementById('hero3DWardInfoBanner');
    if (!banner) return;
    banner.style.display = 'block';
    banner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>📍 ${wardData.name}</strong>
          <span style="font-size: 0.75rem; color: #34d399; margin-left: 0.5rem;">● ${wardData.status}</span>
        </div>
        <span class="badge" style="background: rgba(34,197,94,0.2); color: #22c55e;">SLA Rating: ${wardData.score}</span>
      </div>
    `;
    if (typeof playCivicAudio === 'function') playCivicAudio('notification');
  }

  /* ==========================================================================
     2. FULLSCREEN 3D MUNICIPAL DIGITAL TWIN CITY EXPLORER
     ========================================================================== */
  function open3DCityTwinModal() {
    const modal = document.getElementById('threeCityModal');
    if (!modal) return;
    modal.classList.add('active');

    if (!window.EcoClear3D.cityTwin) {
      initCityTwinEngine();
    } else {
      window.EcoClear3D.cityTwin.resume();
    }
    if (typeof playCivicAudio === 'function') playCivicAudio('open');
  }

  function close3DCityTwinModal() {
    const modal = document.getElementById('threeCityModal');
    if (!modal) return;
    modal.classList.remove('active');
    if (window.EcoClear3D.cityTwin) {
      window.EcoClear3D.cityTwin.pause();
    }
    if (typeof playCivicAudio === 'function') playCivicAudio('click');
  }

  function initCityTwinEngine() {
    const container = document.getElementById('cityTwin3DViewport');
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode() ? 0x08100c : 0xdde3de);
    scene.fog = new THREE.FogExp2(isDarkMode() ? 0x08100c : 0xdde3de, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 200);
    camera.position.set(30, 24, 34);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 75;
    controls.target.set(0, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode() ? 0.6 : 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(25, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    scene.add(sunLight);

    // Ground Plane with Grid
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isDarkMode() ? 0x0f1c16 : 0xe2e8e4,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Floor Overlay
    const gridHelper = new THREE.GridHelper(60, 30, 0x22c55e, isDarkMode() ? 0x1b3528 : 0xb8c7bc);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // --- City Infrastructure (Buildings, Wards, Central Plant) ---
    const clickableObjects = [];
    const cityData = buildProceduralCity(scene, clickableObjects);

    // Raycasting for Ward / Building / Fleet inspections
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(clickableObjects, true);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.telemetry && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData.telemetry) {
          renderCityTwinHUD(obj.userData.telemetry);
        }
      }
    });

    // Resize Handler
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    let isPaused = false;
    let clock = new THREE.Clock();
    let simSpeed = 1.0;

    function animate() {
      if (!isPaused) requestAnimationFrame(animate);
      const delta = clock.getDelta() * simSpeed;
      const elapsed = clock.getElapsedTime() * simSpeed;

      controls.update();
      cityData.update(delta, elapsed);
      renderer.render(scene, camera);
    }
    animate();

    window.EcoClear3D.cityTwin = {
      scene,
      camera,
      renderer,
      controls,
      pause: () => { isPaused = true; },
      resume: () => {
        if (isPaused) {
          isPaused = false;
          clock.getDelta();
          animate();
        }
      },
      setSimSpeed: (s) => { simSpeed = s; },
      setTimeOfDay: (time) => {
        const isNight = time === 'night';
        scene.background.setHex(isNight ? 0x050a08 : 0xdde3de);
        scene.fog.color.setHex(isNight ? 0x050a08 : 0xdde3de);
        ambientLight.intensity = isNight ? 0.35 : 0.85;
        sunLight.intensity = isNight ? 0.4 : 1.4;
        cityData.toggleNightLights(isNight);
      },
      setPreset: (preset) => {
        if (preset === 'iso') {
          gsapOrLerpCamera(camera, controls, { x: 30, y: 24, z: 34 }, { x: 0, y: 0, z: 0 });
        } else if (preset === 'top') {
          gsapOrLerpCamera(camera, controls, { x: 0, y: 48, z: 0.1 }, { x: 0, y: 0, z: 0 });
        } else if (preset === 'plant') {
          gsapOrLerpCamera(camera, controls, { x: 0, y: 12, z: 14 }, { x: 0, y: 3, z: 0 });
        } else if (preset === 'truck') {
          const t = cityData.trucks[0];
          if (t) {
            gsapOrLerpCamera(camera, controls, { x: t.position.x + 8, y: t.position.y + 6, z: t.position.z + 8 }, { x: t.position.x, y: t.position.y, z: t.position.z });
          }
        }
      },
      updateTheme: () => {
        const dark = isDarkMode();
        scene.background.setHex(dark ? 0x08100c : 0xdde3de);
        scene.fog.color.setHex(dark ? 0x08100c : 0xdde3de);
        groundMat.color.setHex(dark ? 0x0f1c16 : 0xe2e8e4);
      }
    };
  }

  function gsapOrLerpCamera(camera, controls, targetPos, targetLookAt) {
    camera.position.set(targetPos.x, targetPos.y, targetPos.z);
    controls.target.set(targetLookAt.x, targetLookAt.y, targetLookAt.z);
    controls.update();
  }

  // --- Builder: Procedural City Layout ---
  function buildProceduralCity(scene, clickableObjects) {
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // 1. Central Waste-to-Energy & High-Tech Circular Sorting Hub (Center: 0, 0, 0)
    const plantGroup = new THREE.Group();
    plantGroup.userData.telemetry = {
      title: '🏭 Central Integrated Waste-to-Energy Hub',
      type: 'Municipal Treatment Facility',
      metrics: [
        { label: 'Scientific Processing Rate', val: '92.4%', color: '#22c55e' },
        { label: 'CO₂ Emissions Abated', val: '412 MT / mo', color: '#38bdf8' },
        { label: 'Power Generated', val: '3.8 MW Clean Grid', color: '#f59e0b' },
        { label: 'Refuse Derived Fuel (RDF)', val: '128 MT daily', color: '#a855f7' }
      ]
    };
    clickableObjects.push(plantGroup);

    // Plant main dome
    const domeGeo = new THREE.SphereGeometry(3.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.3, metalness: 0.5 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0;
    dome.castShadow = true;
    plantGroup.add(dome);

    // Glowing core reactor ring
    const reactorGeo = new THREE.TorusGeometry(3.4, 0.15, 12, 32);
    const reactorMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const reactorRing = new THREE.Mesh(reactorGeo, reactorMat);
    reactorRing.rotation.x = Math.PI / 2;
    reactorRing.position.y = 0.5;
    plantGroup.add(reactorRing);

    // 2 Stacks with animated smoke particles
    const stackGeo = new THREE.CylinderGeometry(0.35, 0.5, 4.5, 12);
    const stackMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const stack1 = new THREE.Mesh(stackGeo, stackMat);
    stack1.position.set(-1.8, 2.25, -1.8);
    stack1.castShadow = true;
    plantGroup.add(stack1);

    const stack2 = stack1.clone();
    stack2.position.set(1.8, 2.25, -1.8);
    plantGroup.add(stack2);

    cityGroup.add(plantGroup);

    // 2. Five Distinct Municipal Wards arranged radially
    const wardConfigs = [
      { name: 'Ward G/South (Dadar & Elphinstone)', x: -16, z: -14, color: 0x22c55e, segRate: '78%', trucks: 3, cleared: '94%' },
      { name: 'Ward S (Powai Lake & Tech Enclave)', x: 16, z: -14, color: 0x38bdf8, segRate: '85%', trucks: 2, cleared: '98%' },
      { name: 'Ward K/East (Andheri Industrial)', x: -18, z: 14, color: 0xf59e0b, segRate: '68%', trucks: 4, cleared: '88%' },
      { name: 'Ward H/West (Bandra Residential)', x: 18, z: 14, color: 0x10b981, segRate: '91%', trucks: 3, cleared: '99%' },
      { name: 'Ward A (Colaba & Fort Commercial)', x: 0, z: 22, color: 0xa855f7, segRate: '82%', trucks: 2, cleared: '93%' }
    ];

    const nightLights = [];

    wardConfigs.forEach((w) => {
      const wardZone = new THREE.Group();
      wardZone.position.set(w.x, 0, w.z);
      wardZone.userData.telemetry = {
        title: `📍 ${w.name}`,
        type: 'Statutory Municipal Ward',
        metrics: [
          { label: 'Source Segregation Rate', val: w.segRate, color: '#22c55e' },
          { label: 'Active Fleet Crews', val: `${w.trucks} Vehicles`, color: '#38bdf8' },
          { label: 'SLA Cleared Reports', val: w.cleared, color: '#f59e0b' },
          { label: 'Statutory SBM Mandate', val: '🟢 Compliant', color: '#10b981' }
        ]
      };
      clickableObjects.push(wardZone);

      // Boundary Halo Plate
      const plateGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.08, 24);
      const plateMat = new THREE.MeshStandardMaterial({
        color: w.color,
        roughness: 0.6,
        transparent: true,
        opacity: 0.22
      });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.y = 0.04;
      wardZone.add(plate);

      // Holographic Floating Beacon Marker
      const beaconPinGeo = new THREE.ConeGeometry(0.6, 2.0, 4);
      const beaconPinMat = new THREE.MeshBasicMaterial({ color: w.color, wireframe: true });
      const beaconPin = new THREE.Mesh(beaconPinGeo, beaconPinMat);
      beaconPin.rotation.x = Math.PI;
      beaconPin.position.y = 8.5;
      wardZone.add(beaconPin);

      // Procedural Commercial & Residential Buildings inside Ward
      for (let b = 0; b < 6; b++) {
        const h = 2.5 + Math.random() * 4.5;
        const bGeo = new THREE.BoxGeometry(1.6 + Math.random() * 1.2, h, 1.6 + Math.random() * 1.2);
        const bMat = new THREE.MeshStandardMaterial({
          color: isDarkMode() ? 0x1a2e24 : 0x94a3b8,
          roughness: 0.4
        });
        const building = new THREE.Mesh(bGeo, bMat);
        const angle = (b / 6) * Math.PI * 2;
        const dist = 3.5 + Math.random() * 2.5;
        building.position.set(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist);
        building.castShadow = true;
        building.receiveShadow = true;
        wardZone.add(building);

        // Emissive window panes for night mode
        const winGeo = new THREE.BoxGeometry(0.1, 0.4, 0.4);
        const winMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0 });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(building.position.x + 0.8, building.position.y, building.position.z);
        wardZone.add(win);
        nightLights.push(win);
      }

      cityGroup.add(wardZone);
    });

    // 3. Roads & Animated Waste Trucks Moving Between Wards and Central Hub
    const trucks = [];
    wardConfigs.forEach((w, i) => {
      // Connect each ward to central hub with road line
      const pathCurve = new THREE.LineCurve3(new THREE.Vector3(w.x, 0.1, w.z), new THREE.Vector3(0, 0.1, 0));
      const roadGeo = new THREE.BufferGeometry().setFromPoints(pathCurve.getPoints(10));
      const roadLine = new THREE.Line(roadGeo, new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 2 }));
      cityGroup.add(roadLine);

      // Mini 3D Waste Truck
      const tGroup = new THREE.Group();
      tGroup.userData.telemetry = {
        title: `🚛 Municipal Compactor #${101 + i}`,
        type: 'Active Electric Compactor Fleet',
        metrics: [
          { label: 'Assigned Route', val: w.name, color: '#38bdf8' },
          { label: 'Current Payload', val: '4.8 Metric Tons', color: '#22c55e' },
          { label: 'Battery Level', val: '86% Clean EV', color: '#10b981' },
          { label: 'GPS Speed', val: '28 km/h', color: '#f59e0b' }
        ]
      };
      clickableObjects.push(tGroup);

      const tCabin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x166534 }));
      tCabin.position.set(0.35, 0.25, 0);
      tGroup.add(tCabin);
      const tCargo = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.6), new THREE.MeshStandardMaterial({ color: 0x14532d }));
      tCargo.position.set(-0.4, 0.35, 0);
      tGroup.add(tCargo);

      cityGroup.add(tGroup);
      trucks.push({
        group: tGroup,
        start: new THREE.Vector3(w.x, 0, w.z),
        end: new THREE.Vector3(0, 0, 0),
        progress: (i * 0.2) % 1.0,
        direction: 1
      });
    });

    return {
      trucks,
      update: (delta, elapsed) => {
        // Rotate Central Reactor ring
        reactorRing.rotation.z += delta * 1.5;

        // Drive trucks along routes
        trucks.forEach(t => {
          t.progress += delta * 0.08 * t.direction;
          if (t.progress >= 1.0) {
            t.progress = 1.0;
            t.direction = -1;
          } else if (t.progress <= 0) {
            t.progress = 0;
            t.direction = 1;
          }

          const currentPos = new THREE.Vector3().lerpVectors(t.start, t.end, t.progress);
          t.group.position.copy(currentPos);
          if (t.direction > 0) {
            t.group.lookAt(t.end);
          } else {
            t.group.lookAt(t.start);
          }
        });
      },
      toggleNightLights: (isNight) => {
        nightLights.forEach(win => {
          win.material.opacity = isNight ? 0.9 : 0;
        });
      }
    };
  }

  function renderCityTwinHUD(telemetry) {
    const card = document.getElementById('cityTwinInfoHUD');
    if (!card) return;
    card.style.display = 'block';

    let metricsHtml = telemetry.metrics.map(m => `
      <div style="background: rgba(0,0,0,0.25); padding: 0.5rem 0.75rem; border-radius: 4px; border-left: 3px solid ${m.color};">
        <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">${m.label}</div>
        <div style="font-size: 1.05rem; font-weight: 700; color: ${m.color};">${m.val}</div>
      </div>
    `).join('');

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div>
          <span style="font-size: 0.72rem; color: #34d399; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${telemetry.type}</span>
          <h4 style="margin: 0.2rem 0 0 0; font-size: 1.15rem; color: white;">${telemetry.title}</h4>
        </div>
        <button class="btn btn-outline btn-xs" style="color: white; border-color: rgba(255,255,255,0.3);" onclick="document.getElementById('cityTwinInfoHUD').style.display='none'">×</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        ${metricsHtml}
      </div>
    `;

    if (typeof playCivicAudio === 'function') playCivicAudio('click');
  }

  function setCityTimeOfDay(time) {
    if (window.EcoClear3D.cityTwin) {
      window.EcoClear3D.cityTwin.setTimeOfDay(time);
      document.querySelectorAll('.city-twin-time-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-time') === time);
      });
    }
  }

  function setCityCameraPreset(preset) {
    if (window.EcoClear3D.cityTwin) {
      window.EcoClear3D.cityTwin.setPreset(preset);
      document.querySelectorAll('.city-twin-preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-preset') === preset);
      });
    }
  }

  /* ==========================================================================
     3. CITIZEN 3D VIRTUAL SEGREGATION STUDIO
     ========================================================================== */
  function initCitizenSegregationStudio() {
    const container = document.getElementById('citizen3DSegregationCanvas');
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 2.5, 4.5);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(2, 5, 3);
    dir.castShadow = true;
    scene.add(dir);

    // 3 Mini Bins: Wet (Green), Dry (Blue), Hazardous (Amber)
    const bins = [];
    const binData = [
      { type: 'wet', label: 'Wet Organic', color: 0x166534, x: -1.3 },
      { type: 'dry', label: 'Dry Recyclable', color: 0x1d4ed8, x: 0 },
      { type: 'hazardous', label: 'Hazardous / E-Waste', color: 0xb45309, x: 1.3 }
    ];

    binData.forEach(bd => {
      const bGroup = new THREE.Group();
      bGroup.position.set(bd.x, 0, 0);

      const bodyGeo = new THREE.CylinderGeometry(0.48, 0.38, 1.3, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: bd.color, roughness: 0.4 });
      const bMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bMesh.position.y = 0.65;
      bMesh.castShadow = true;
      bGroup.add(bMesh);

      // Lid
      const lidGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.1, 16);
      const lidMat = new THREE.MeshStandardMaterial({ color: bd.color, roughness: 0.2 });
      const lidMesh = new THREE.Mesh(lidGeo, lidMat);
      lidMesh.position.y = 1.35;
      bGroup.add(lidMesh);

      scene.add(bGroup);
      bins.push({ group: bGroup, type: bd.type, x: bd.x, lidMesh });
    });

    // Falling Item Particles & Physics Animation
    const fallingItems = [];

    function animate() {
      requestAnimationFrame(animate);
      const delta = 0.016;

      for (let i = fallingItems.length - 1; i >= 0; i--) {
        const item = fallingItems[i];
        item.mesh.position.y -= item.speed * delta;
        item.mesh.rotation.x += item.rotSpeed;
        item.mesh.rotation.y += item.rotSpeed;

        if (item.mesh.position.y <= 0.8) {
          // Drop inside bin
          scene.remove(item.mesh);
          fallingItems.splice(i, 1);
          triggerBinWobble(item.targetBin);
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    function triggerBinWobble(bin) {
      if (!bin) return;
      bin.group.scale.set(1.15, 0.9, 1.15);
      setTimeout(() => {
        bin.group.scale.set(1, 1, 1);
      }, 150);
    }

    window.EcoClear3D.segregationStudio = {
      scene,
      camera,
      renderer,
      dropItem: (itemType) => {
        // Map item to target bin
        const itemMap = {
          organic: { binType: 'wet', color: 0x84cc16, geo: new THREE.SphereGeometry(0.18, 12, 12) },
          plastic: { binType: 'dry', color: 0x38bdf8, geo: new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12) },
          battery: { binType: 'hazardous', color: 0xf59e0b, geo: new THREE.BoxGeometry(0.2, 0.3, 0.15) }
        };

        const def = itemMap[itemType] || itemMap.organic;
        const target = bins.find(b => b.type === def.binType);
        if (!target) return;

        const mesh = new THREE.Mesh(def.geo, new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.3 }));
        mesh.position.set(target.x, 2.4, 0);
        scene.add(mesh);

        fallingItems.push({
          mesh,
          targetBin: target,
          speed: 4.5,
          rotSpeed: 0.08
        });

        // Award EcoCredits in UI
        if (typeof awardCitizenEcoCredits === 'function') {
          awardCitizenEcoCredits(10, `3D Segregation Verification (${itemType.toUpperCase()})`);
        } else if (typeof showToast === 'function') {
          showToast(`+10 EcoCredits Earned for 3D Segregation!`, 'success');
        }
        if (typeof playCivicAudio === 'function') playCivicAudio('success');
      },
      updateTheme: () => {}
    };
  }

  function dropSegregationItem(type) {
    if (window.EcoClear3D.segregationStudio) {
      window.EcoClear3D.segregationStudio.dropItem(type);
    }
  }

})();
