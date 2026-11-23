import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ZDepthTier, GlobePin, SolarBody } from '../types/slabletOS';
import { CANONICAL_SOLAR_SYSTEM } from '../utils/celestial';
import { CANONICAL_GLOBE_PINS, CONTINENT_BOUNDING_BOXES } from '../utils/legendKeeperData';
import { getCelestialNow, getCelestialSimMs } from '../hooks/useCelestialClock';
import { playDetentTick, triggerHaptic, playOptionSelect } from '../utils/audio';

// Generates a 100% seamless, continuous 360-degree cloud and storm sphere
// Preserves r < 308px core clarity with delicate translucent storm clusters
const createCloudTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture() as THREE.CanvasTexture;

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;

  const drawCloud = (cx: number, cy: number, radius: number, opacity: number) => {
    const drawAt = (x: number) => {
      const grad = ctx.createRadialGradient(x, cy, 0, x, cy, radius);
      grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      grad.addColorStop(0.35, `rgba(240, 248, 255, ${opacity * 0.55})`);
      grad.addColorStop(0.7, `rgba(220, 240, 255, ${opacity * 0.18})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    drawAt(cx);
    if (cx - radius < 0) drawAt(cx + w);
    if (cx + radius > w) drawAt(cx - w);
  };

  for (const yBand of [h * 0.28, h * 0.72]) {
    for (let x = 0; x < w; x += 20) {
      const theta = (x / w) * Math.PI * 2;
      const yOffset = Math.sin(theta * 3) * 38 + Math.cos(theta * 6) * 18;
      const py = yBand + yOffset;
      const rad = 42 + Math.sin(theta * 8) * 16;
      drawCloud(x, py, rad, 0.38);
    }
  }

  const numClusters = 70;
  for (let i = 0; i < numClusters; i++) {
    const cx = Math.random() * w;
    const lat = (Math.random() - 0.5) * 0.72;
    const cy = h * (0.5 + lat);
    const radius = 55 + Math.random() * 75;
    drawCloud(cx, cy, radius, 0.58);
  }

  const storms = [
    { x: w * 0.28, y: h * 0.34, rad: 82 },
    { x: w * 0.76, y: h * 0.66, rad: 95 },
  ];

  storms.forEach(({ x, y, rad }) => {
    drawCloud(x, y, rad * 0.6, 0.65);

    for (let angle = 0; angle < Math.PI * 4; angle += 0.18) {
      const r = (angle / (Math.PI * 4)) * rad;
      const px = x + Math.cos(angle * 1.5) * r;
      const py = y + Math.sin(angle * 1.5) * r;
      drawCloud(px, py, 20, 0.55);
    }
  });

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let y = 0; y < h; y++) {
    const rowStart = y * w * 4;
    const rowEnd = rowStart + (w - 1) * 4;
    for (let c = 0; c < 4; c++) {
      const avg = Math.round((data[rowStart + c] + data[rowEnd + c]) / 2);
      data[rowStart + c] = avg;
      data[rowEnd + c] = avg;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

/**
 * Projects a GlobePin's coordinates into spherical [lat, lng],
 * transforming nested Tier 2+ city 2D [0..1] coordinates via CONTINENT_BOUNDING_BOXES
 * when lat/lng are missing or unprojected.
 */
const resolvePinLatLng = (pin: GlobePin, allPins: GlobePin[]): { lat: number; lng: number } => {
  if (
    typeof pin.lat === 'number' &&
    typeof pin.lng === 'number' &&
    (pin.lat !== 0 || pin.lng !== 0)
  ) {
    return { lat: pin.lat, lng: pin.lng };
  }

  if (pin.pos && pin.parentResourceId && CONTINENT_BOUNDING_BOXES[pin.parentResourceId]) {
    const bbox = CONTINENT_BOUNDING_BOXES[pin.parentResourceId];
    const [u, v] = pin.pos;
    return {
      lng: bbox.minLng + u * (bbox.maxLng - bbox.minLng),
      lat: bbox.maxLat - v * (bbox.maxLat - bbox.minLat),
    };
  }

  if (pin.pos && pin.parentId) {
    const parent = allPins.find((p) => p.id === pin.parentId);
    if (parent) {
      const [u, v] = pin.pos;
      return {
        lat: parent.lat + (0.5 - v) * 24,
        lng: parent.lng + (u - 0.5) * 32,
      };
    }
  }

  if (pin.pos) {
    const [u, v] = pin.pos;
    return {
      lng: (u - 0.5) * 360,
      lat: (0.5 - v) * 180,
    };
  }

  return { lat: pin.lat || 0, lng: pin.lng || 0 };
};

export interface KonranGlobeProps {
  zTier?: ZDepthTier;
  screensaver?: boolean;
  focusedBodyId?: string;
  onGlobeClick?: () => void;
  onZTierChange?: (tier: ZDepthTier) => void;
  onPinClick?: (pin: GlobePin) => void;
  onCelestialBodyClick?: (body: SolarBody) => void;
  onEyeEclipseChange?: (eclipsed: boolean) => void;
}

const TIER_CAM_Z: Record<ZDepthTier, number> = {
  surface: 2.35,
  planet: 5.8,
  system: 18.0,
};

export const KonranGlobe = ({
  zTier = 'planet',
  screensaver = false,
  focusedBodyId = 'plane-konran',
  onGlobeClick,
  onZTierChange,
  onPinClick,
  onCelestialBodyClick,
  onEyeEclipseChange,
}: KonranGlobeProps = {}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onGlobeClickRef = useRef(onGlobeClick);
  onGlobeClickRef.current = onGlobeClick;
  const onZTierChangeRef = useRef(onZTierChange);
  onZTierChangeRef.current = onZTierChange;
  const onPinClickRef = useRef(onPinClick);
  onPinClickRef.current = onPinClick;
  const onCelestialBodyClickRef = useRef(onCelestialBodyClick);
  onCelestialBodyClickRef.current = onCelestialBodyClick;
  const onEyeEclipseChangeRef = useRef(onEyeEclipseChange);
  onEyeEclipseChangeRef.current = onEyeEclipseChange;

  const zTierRef = useRef<ZDepthTier>(zTier);
  zTierRef.current = zTier;
  const screensaverRef = useRef<boolean>(screensaver);
  screensaverRef.current = screensaver;
  const focusedBodyIdRef = useRef<string>(focusedBodyId);
  focusedBodyIdRef.current = focusedBodyId;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
    camera.position.set(0, 0, TIER_CAM_Z[zTier]);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ==========================================
    // 1. PLANET KONRAN & MOONS (TIER 1 & 2)
    // ==========================================
    const planet = new THREE.Group();
    scene.add(planet);

    // 1. Planetary Surface (Matte PBR standard material for crisp day/night terminator)
    const texture = new THREE.TextureLoader().load(
      '/assets/konran-map.jpg',
      undefined,
      undefined,
      (error) => console.error('Unable to load the Konran map texture.', error)
    );
    texture.colorSpace = THREE.SRGBColorSpace;

    const sphereGeometry = new THREE.SphereGeometry(1.35, 64, 48);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.82,
      metalness: 0.06,
    });
    const globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
    planet.add(globe);

    // 2. Seamless Translucent Weather Cloud Layer (keeps planet core r < 308px crisp & clear)
    const cloudTexture = createCloudTexture();
    const cloudGeometry = new THREE.SphereGeometry(1.366, 64, 48);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.52,
      blending: THREE.NormalBlending,
      roughness: 0.92,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planet.add(clouds);

    // 3. Atmospheric Halo Glow (BackSide only, preserving center clarity)
    const atmosphereGeometry = new THREE.SphereGeometry(1.39, 64, 48);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: '#39ff14',
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    planet.add(atmosphere);

    // 4. Olysphere / Lyra (Gold Sentinel Tidal Moon) — Calibrated r=1.68
    const olysphereOrbit = new THREE.Group();
    planet.add(olysphereOrbit);

    const olysphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 32, 24),
      new THREE.MeshStandardMaterial({
        color: '#ffc86b',
        emissive: '#7a4a08',
        emissiveIntensity: 0.45,
        roughness: 0.6,
        metalness: 0.1,
      })
    );
    olysphere.position.set(1.68, 0.16, 0);
    olysphereOrbit.add(olysphere);

    const sentinelLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 16, 12),
      new THREE.MeshBasicMaterial({ color: '#fffdf0' })
    );
    sentinelLight.position.set(0.03, 0.05, 0.09);
    olysphere.add(sentinelLight);

    // 5. Ayanath / Eyenath (Violet Watchtower Moon) — Calibrated r=-1.86
    const ayanathOrbit = new THREE.Group();
    ayanathOrbit.rotation.z = THREE.MathUtils.degToRad(28);
    planet.add(ayanathOrbit);

    const ayanath = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 32, 24),
      new THREE.MeshStandardMaterial({
        color: '#9c68dc',
        emissive: '#4e287a',
        emissiveIntensity: 0.5,
        roughness: 0.5,
        metalness: 0.2,
      })
    );
    ayanath.position.set(-1.86, -0.22, 0);
    ayanathOrbit.add(ayanath);

    const watchtowerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.01, 12, 48),
      new THREE.MeshBasicMaterial({ color: '#c49cff', transparent: true, opacity: 0.85 })
    );
    watchtowerRing.rotation.x = THREE.MathUtils.degToRad(72);
    ayanath.add(watchtowerRing);

    // ==========================================
    // 2. NIGHT CITY LIGHTS & LEGENDKEEPER GLOBE PINS
    // ==========================================
    const nightLightsGroup = new THREE.Group();
    planet.add(nightLightsGroup);

    const pinsGroup = new THREE.Group();
    planet.add(pinsGroup);

    const nightCityLights: Array<{
      clusterGroup: THREE.Group;
      materials: THREE.MeshBasicMaterial[];
      normal: THREE.Vector3;
    }> = [];

    const pinMeshes: Array<{
      mesh: THREE.Mesh;
      pin: GlobePin;
      normal: THREE.Vector3;
      pinMat: THREE.MeshStandardMaterial;
      ringMat: THREE.MeshBasicMaterial;
      portalRing?: THREE.Mesh;
      portalRingMat?: THREE.MeshBasicMaterial;
      hasSubMap: boolean;
    }> = [];

    // Seed immediate canonical night city lights so the dark hemisphere glows warmly right away
    const buildNightCityLightCluster = (lat: number, lng: number, isCapital: boolean) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = 1.354;

      const x = -r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      const normal = new THREE.Vector3(x, y, z).normalize();

      const clusterGroup = new THREE.Group();
      clusterGroup.position.set(x, y, z);
      clusterGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      const materials: THREE.MeshBasicMaterial[] = [];

      // Core warm amber city glow disc
      const coreMat = new THREE.MeshBasicMaterial({
        color: '#ffb74d',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const coreDisc = new THREE.Mesh(
        new THREE.CircleGeometry(isCapital ? 0.038 : 0.025, 16),
        coreMat
      );
      clusterGroup.add(coreDisc);
      materials.push(coreMat);

      // Soft outer golden halo
      const haloMat = new THREE.MeshBasicMaterial({
        color: '#ff9800',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const haloDisc = new THREE.Mesh(
        new THREE.CircleGeometry(isCapital ? 0.072 : 0.048, 16),
        haloMat
      );
      clusterGroup.add(haloDisc);
      materials.push(haloMat);

      // Suburban satellite light nodes around major capitals (Vantya, Padd City, Crafton Cove, etc.)
      const numSatellites = isCapital ? 5 : 3;
      for (let i = 0; i < numSatellites; i++) {
        const satMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? '#ffe082' : '#ffab40',
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const satMesh = new THREE.Mesh(new THREE.CircleGeometry(0.011, 8), satMat);
        const ang = (i / numSatellites) * Math.PI * 2 + lat * 0.1;
        const dist = (isCapital ? 0.032 : 0.02) + (i % 2) * 0.014;
        satMesh.position.set(Math.cos(ang) * dist, Math.sin(ang) * dist, 0.001);
        clusterGroup.add(satMesh);
        materials.push(satMat);
      }

      nightLightsGroup.add(clusterGroup);
      nightCityLights.push({ clusterGroup, materials, normal });
    };

    const populatePinsAndLights = (rawPins: GlobePin[]) => {
      // Clear any previous pins/lights if reloaded
      while (pinsGroup.children.length > 0) {
        pinsGroup.remove(pinsGroup.children[0]);
      }
      while (nightLightsGroup.children.length > 0) {
        nightLightsGroup.remove(nightLightsGroup.children[0]);
      }
      pinMeshes.length = 0;
      nightCityLights.length = 0;

      rawPins.forEach((pin) => {
        const { lat, lng } = resolvePinLatLng(pin, rawPins);
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const r = 1.38;

        const x = -r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);

        const normal = new THREE.Vector3(x, y, z).normalize();

        // Add warm emissive night city light clusters for cities & settlements
        if (pin.tier === 'city' || pin.isCapital) {
          buildNightCityLightCluster(lat, lng, Boolean(pin.isCapital));
        }

        const isProvince = pin.tier === 'province';
        const hasSubMap = Boolean((pin as unknown as { hasSubMap?: boolean }).hasSubMap) || isProvince;
        const pinSize = isProvince ? 0.042 : 0.026;
        const color = pin.iconColor || (isProvince ? '#ffd700' : '#38bdf8');

        // Diamond / Beacon Mesh
        const pGeom = new THREE.OctahedronGeometry(pinSize, 0);
        const pMat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.78,
          roughness: 0.3,
          metalness: 0.8,
          transparent: true,
          opacity: 1,
        });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        pMesh.position.set(x, y, z);
        pMesh.userData = { globePin: pin };

        // Inner base ring
        const ringGeom = new THREE.RingGeometry(pinSize * 1.2, pinSize * 1.65, 20);
        const ringMat = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        pMesh.add(ring);

        // Pulsing Sub-Map Portal Reticle Ring for pins with nested maps or provinces
        let portalRing: THREE.Mesh | undefined;
        let portalRingMat: THREE.MeshBasicMaterial | undefined;
        if (hasSubMap) {
          const portalGeom = new THREE.RingGeometry(pinSize * 1.95, pinSize * 2.45, 24);
          portalRingMat = new THREE.MeshBasicMaterial({
            color: isProvince ? '#fde047' : '#38bdf8',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
          });
          portalRing = new THREE.Mesh(portalGeom, portalRingMat);
          portalRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
          pMesh.add(portalRing);
        }

        pinsGroup.add(pMesh);
        pinMeshes.push({
          mesh: pMesh,
          pin,
          normal,
          pinMat: pMat,
          ringMat,
          portalRing,
          portalRingMat,
          hasSubMap,
        });
      });
    };

    // Immediately populate with canonical pins so first frame is ready, then upgrade from API if available
    populatePinsAndLights(CANONICAL_GLOBE_PINS);

    let isDisposed = false;
    const loadPins = async () => {
      try {
        const res = await fetch('/api/lore/legendkeeper?pins=1');
        if (res.ok && !isDisposed) {
          const json: unknown = await res.json();
          const data = (json as { data?: GlobePin[] })?.data;
          if (Array.isArray(data) && data.length > 0) {
            populatePinsAndLights(data);
          }
        }
      } catch {
        // Fallback already populated with CANONICAL_GLOBE_PINS
      }
    };
    loadPins();

    // ==========================================
    // 3. FULL CANONICAL 3D SOLAR SYSTEM (TIER 3)
    // ==========================================
    const solarSystemGroup = new THREE.Group();
    solarSystemGroup.visible = false;
    scene.add(solarSystemGroup);

    const solarClickableMeshes: THREE.Object3D[] = [];
    const rotatingParts: Array<{ obj: THREE.Object3D; speed: number; axis?: 'x' | 'y' | 'z' }> = [];

    // Canonical Landmark references for dynamic per-frame animation
    let kayHalfMesh: THREE.Mesh | null = null;
    let keeHalfMesh: THREE.Mesh | null = null;
    let passingGlowRing: THREE.Mesh | null = null;
    let lantycaMoonOrbit: THREE.Group | null = null;
    let lantycaMoonMesh: THREE.Mesh | null = null;
    let waterspoutBridge: THREE.Mesh | null = null;
    let waterspoutMat: THREE.MeshBasicMaterial | null = null;
    let singularityEyeGroup: THREE.Group | null = null;
    let kestoxPlanetHolder: THREE.Group | null = null;
    let konranPlanetHolder: THREE.Group | null = null;

    const planetOrbitMeshes: Array<{
      group: THREE.Group;
      mesh: THREE.Group;
      detailGroup: THREE.Group;
      proxyMesh: THREE.Mesh;
      isLandmark: boolean;
      speed: number;
      orbitRadius: number;
      body: SolarBody;
      index: number;
    }> = [];

    // Canonical landmark styles that always keep their high-detail 3D signature in Solar System view
    const LANDMARK_STYLES = new Set([
      'mushroom_basin',    // Kay-Kee (Kayzoku)
      'volcanic_dust',     // Synthelavor (Slavyna)
      'aerial_islands',    // Lona Uyn (Lyricia)
      'rainforest_spouts', // Vaya Mar & Lantyca (Ousava)
      'brain_lobes',       // Kestox / Keztox & The Singularity Eye (Krayvuk)
    ]);

    // Build the 10 Canonical Celestial Bodies
    CANONICAL_SOLAR_SYSTEM.forEach((body, idx) => {
      if (body.type === 'sun') {
        // Ayan (The Sun — Ay)
        const sunHolder = new THREE.Group();
        sunHolder.userData = { solarBody: body };

        // Bright white core
        const coreGeom = new THREE.SphereGeometry(body.size, 32, 24);
        const coreMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        sunHolder.add(coreMesh);
        solarClickableMeshes.push(coreMesh);

        // Pulsating Solar Corona
        const coronaGeom = new THREE.SphereGeometry(body.size * 1.35, 32, 24);
        const coronaMat = new THREE.MeshBasicMaterial({
          color: '#facc15',
          transparent: true,
          opacity: 0.45,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
        });
        const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat);
        sunHolder.add(coronaMesh);

        // Woven Blue & Yellow Thread-like Filaments
        const blueLoop = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 1.45, 0.022, 12, 64),
          new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.88 })
        );
        blueLoop.rotation.x = Math.PI / 3;
        sunHolder.add(blueLoop);
        rotatingParts.push({ obj: blueLoop, speed: 0.012, axis: 'y' });

        const yellowLoop = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 1.52, 0.022, 12, 64),
          new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.88 })
        );
        yellowLoop.rotation.y = Math.PI / 4;
        yellowLoop.rotation.z = Math.PI / 5;
        sunHolder.add(yellowLoop);
        rotatingParts.push({ obj: yellowLoop, speed: -0.014, axis: 'z' });

        solarSystemGroup.add(sunHolder);
        return;
      }

      // Thin orbital track ring
      const ringGeom = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 96;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
          new THREE.Vector3(Math.cos(theta) * body.orbitRadius, 0, Math.sin(theta) * body.orbitRadius)
        );
      }
      ringGeom.setFromPoints(points);
      const ringLine = new THREE.Line(
        ringGeom,
        new THREE.LineBasicMaterial({ color: body.color, transparent: true, opacity: 0.28 })
      );
      solarSystemGroup.add(ringLine);

      // Orbit Holder
      const orbitHolder = new THREE.Group();
      solarSystemGroup.add(orbitHolder);

      // Planet Holder placed at orbitRadius
      const planetHolder = new THREE.Group();
      planetHolder.position.set(body.orbitRadius, 0, 0);
      planetHolder.userData = { solarBody: body };
      orbitHolder.add(planetHolder);

      if (body.id === 'plane-konran') {
        konranPlanetHolder = planetHolder;
      }

      const isLandmark =
        Boolean(body.visualStyle && LANDMARK_STYLES.has(body.visualStyle)) ||
        body.id === 'plane-konran';

      // High-detail group vs lightweight proxy mesh for Focus LOD
      const detailGroup = new THREE.Group();
      planetHolder.add(detailGroup);

      const proxyMesh = new THREE.Mesh(
        new THREE.SphereGeometry(body.size * 0.85, 12, 10),
        new THREE.MeshBasicMaterial({ color: body.color })
      );
      proxyMesh.visible = false;
      planetHolder.add(proxyMesh);
      solarClickableMeshes.push(proxyMesh);

      // Distinct Canonical Mesh & Shading per visualStyle
      if (body.visualStyle === 'mushroom_basin') {
        // 1. Kay-Kee (Kayzoku): Two separated counter-rotating halves aligning for The Passing
        // Kay (top, hot desert mushroom-shaped cap, clockwise)
        const kayGeom = new THREE.SphereGeometry(
          body.size,
          28,
          18,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.46
        );
        const kayMesh = new THREE.Mesh(
          kayGeom,
          new THREE.MeshStandardMaterial({
            color: '#d4b35e',
            roughness: 0.78,
            emissive: '#854d0e',
            emissiveIntensity: 0.35,
          })
        );
        kayMesh.position.y = 0.055;
        detailGroup.add(kayMesh);
        solarClickableMeshes.push(kayMesh);
        kayHalfMesh = kayMesh;

        // Mushroom stem underside cap on Kay
        const stemMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(body.size * 0.55, body.size * 0.35, 0.06, 20),
          new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.85 })
        );
        stemMesh.position.y = -0.02;
        kayMesh.add(stemMesh);

        // Kee (bottom, overflowing water basin/bowl, counterclockwise)
        const keeGeom = new THREE.SphereGeometry(
          body.size,
          28,
          18,
          0,
          Math.PI * 2,
          Math.PI * 0.54,
          Math.PI * 0.46
        );
        const keeMesh = new THREE.Mesh(
          keeGeom,
          new THREE.MeshStandardMaterial({
            color: '#38bdf8',
            roughness: 0.35,
            emissive: '#0284c7',
            emissiveIntensity: 0.45,
          })
        );
        keeMesh.position.y = -0.055;
        detailGroup.add(keeMesh);
        solarClickableMeshes.push(keeMesh);
        keeHalfMesh = keeMesh;

        // Overflowing waterfall rim on Kee
        const basinRim = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 0.96, 0.018, 10, 32),
          new THREE.MeshBasicMaterial({ color: '#bae6fd', transparent: true, opacity: 0.8 })
        );
        basinRim.rotation.x = Math.PI / 2;
        keeMesh.add(basinRim);

        // The Passing Alignment Resonance Ring between Kay and Kee
        const passingRing = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 0.45, body.size * 1.25, 32),
          new THREE.MeshBasicMaterial({
            color: '#22d3ee',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
          })
        );
        passingRing.rotation.x = Math.PI / 2;
        detailGroup.add(passingRing);
        passingGlowRing = passingRing;
      } else if (body.visualStyle === 'volcanic_dust') {
        // 2. Synthelavor (Slavyna): Scorched volcanic sphere + glittering red dust rings + 5 moons
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size, 28, 20),
          new THREE.MeshStandardMaterial({
            color: '#ef4444',
            roughness: 0.68,
            emissive: '#991b1b',
            emissiveIntensity: 0.65,
          })
        );
        detailGroup.add(pMesh);
        solarClickableMeshes.push(pMesh);

        // Inner & outer glittering crimson dust rings
        const rMeshInner = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 1.32, body.size * 1.78, 48),
          new THREE.MeshBasicMaterial({
            color: '#dc2626',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.82,
          })
        );
        rMeshInner.rotation.x = Math.PI / 2.3;
        detailGroup.add(rMeshInner);

        const rMeshOuter = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 1.86, body.size * 2.32, 48),
          new THREE.MeshBasicMaterial({
            color: '#f87171',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.55,
          })
        );
        rMeshOuter.rotation.x = Math.PI / 2.3;
        detailGroup.add(rMeshOuter);

        // Swirling magenta-red nebula dust shroud
        const dustMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size * 1.85, 20, 14),
          new THREE.MeshBasicMaterial({
            color: '#ec4899',
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
          })
        );
        detailGroup.add(dustMesh);
      } else if (body.visualStyle === 'aerial_islands') {
        // 3. Lona Uyn (Lyricia): Azure/emerald world with bioluminescent crystal veins, floating aerial rock islands, and 3 moons
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size, 28, 20),
          new THREE.MeshStandardMaterial({
            color: '#0ea5e9',
            roughness: 0.45,
            emissive: '#10b981',
            emissiveIntensity: 0.38,
          })
        );
        detailGroup.add(pMesh);
        solarClickableMeshes.push(pMesh);

        // Bioluminescent crystal vein lattice overlay
        const veinMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size * 1.015, 14, 12),
          new THREE.MeshBasicMaterial({
            color: '#f472b6',
            wireframe: true,
            transparent: true,
            opacity: 0.38,
          })
        );
        detailGroup.add(veinMesh);

        // Vibrant ring halo
        const haloMesh = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 1.5, 0.015, 12, 48),
          new THREE.MeshBasicMaterial({ color: '#ec4899', transparent: true, opacity: 0.85 })
        );
        haloMesh.rotation.x = Math.PI / 2.5;
        detailGroup.add(haloMesh);

        // Floating aerial rock islands orbiting close to the upper atmosphere
        const islandsHolder = new THREE.Group();
        detailGroup.add(islandsHolder);
        rotatingParts.push({ obj: islandsHolder, speed: 0.008, axis: 'y' });

        for (let i = 0; i < 6; i++) {
          const island = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.038 + (i % 2) * 0.014, 0),
            new THREE.MeshStandardMaterial({
              color: '#22c55e',
              emissive: '#38bdf8',
              emissiveIntensity: 0.3,
              roughness: 0.85,
            })
          );
          const ang = (i / 6) * Math.PI * 2;
          const elev = (i % 2 === 0 ? 1 : -1) * (0.06 + (i % 3) * 0.03);
          island.position.set(
            Math.cos(ang) * (body.size + 0.11),
            elev,
            Math.sin(ang) * (body.size + 0.11)
          );
          islandsHolder.add(island);
        }
      } else if (body.visualStyle === 'rainforest_spouts') {
        // 4. Vaya Mar & Lantyca (Ousava): Deep aquatic world + rainforest moon Lantyca + animated sky-waterspout bridge
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size, 28, 20),
          new THREE.MeshStandardMaterial({
            color: '#0284c7',
            roughness: 0.3,
            metalness: 0.15,
            emissive: '#0369a1',
            emissiveIntensity: 0.45,
          })
        );
        detailGroup.add(pMesh);
        solarClickableMeshes.push(pMesh);

        // Animated Sky-Waterspout column bridging Vaya Mar and Lantyca during close tidal pass
        waterspoutMat = new THREE.MeshBasicMaterial({
          color: '#7dd3fc',
          transparent: true,
          opacity: 0.72,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        // Cylinder along X axis from planet surface to Lantyca (distance ~0.72)
        const spoutGeom = new THREE.CylinderGeometry(0.022, 0.055, 0.72, 16, 1, true);
        spoutGeom.rotateZ(-Math.PI / 2);
        waterspoutBridge = new THREE.Mesh(spoutGeom, waterspoutMat);
        waterspoutBridge.position.set(0.36, 0, 0);

        // Inner swirling vortex line inside the waterspout
        const innerSpout = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.02, 0.72, 10, 1, true).rotateZ(-Math.PI / 2),
          new THREE.MeshBasicMaterial({
            color: '#e0f2fe',
            transparent: true,
            opacity: 0.85,
            wireframe: true,
          })
        );
        waterspoutBridge.add(innerSpout);
      } else if (body.visualStyle === 'dragon_eye') {
        // Dyata (Oray): Golden world with dark caldera & glowing dragon pupil
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size, 24, 18),
          new THREE.MeshStandardMaterial({
            color: '#d97706',
            roughness: 0.6,
            emissive: '#b45309',
            emissiveIntensity: 0.5,
          })
        );
        detailGroup.add(pMesh);
        solarClickableMeshes.push(pMesh);

        const eyeRing = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 0.4, body.size * 0.75, 24),
          new THREE.MeshBasicMaterial({ color: '#171717', side: THREE.DoubleSide })
        );
        eyeRing.position.z = body.size * 0.95;
        pMesh.add(eyeRing);
      } else if (body.visualStyle === 'brain_lobes') {
        // 5. Kestox / Keztox (Krayvuk) & The Singularity Eye
        kestoxPlanetHolder = planetHolder;

        const stationGroup = new THREE.Group();
        detailGroup.add(stationGroup);

        // Kes Lobe (left: toxic bio-organic green/yellow lightning clouds)
        const kesLobe = new THREE.Mesh(
          new THREE.SphereGeometry(body.size * 0.76, 24, 18),
          new THREE.MeshStandardMaterial({
            color: '#84cc16',
            roughness: 0.68,
            emissive: '#4d7c0f',
            emissiveIntensity: 0.5,
          })
        );
        kesLobe.position.x = -body.size * 0.42;
        stationGroup.add(kesLobe);
        solarClickableMeshes.push(kesLobe);

        // Tox Lobe (right: purple steel & obsidian clockwork city)
        const toxLobe = new THREE.Mesh(
          new THREE.SphereGeometry(body.size * 0.76, 24, 18),
          new THREE.MeshStandardMaterial({
            color: '#7e22ce',
            roughness: 0.4,
            metalness: 0.6,
            emissive: '#581c87',
            emissiveIntensity: 0.5,
          })
        );
        toxLobe.position.x = body.size * 0.42;
        stationGroup.add(toxLobe);
        solarClickableMeshes.push(toxLobe);

        // Glowing Yellow Acid Equator Trench splitting Kes and Tox
        const trench = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 0.68, 0.028, 14, 36),
          new THREE.MeshBasicMaterial({ color: '#facc15' })
        );
        trench.rotation.y = Math.PI / 2;
        stationGroup.add(trench);

        // Krayvuk's High-Definition Black-Hole Singularity Eyeball
        // Positioned just beyond Kestox so Kestox periodically eclipses its line of sight to Konran
        singularityEyeGroup = new THREE.Group();
        singularityEyeGroup.position.set(body.size * 2.55, 0.08, 0);
        detailGroup.add(singularityEyeGroup);

        // Event Horizon Black Hole Core
        const blackHoleCore = new THREE.Mesh(
          new THREE.SphereGeometry(body.size * 0.58, 28, 22),
          new THREE.MeshBasicMaterial({ color: '#030108' })
        );
        singularityEyeGroup.add(blackHoleCore);
        solarClickableMeshes.push(blackHoleCore);

        // Accretion Disk (blazing violet & gold gravitational lens ring)
        const accretionDisk = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 0.92, 0.032, 14, 48),
          new THREE.MeshBasicMaterial({
            color: '#a855f7',
            transparent: true,
            opacity: 0.88,
            blending: THREE.AdditiveBlending,
          })
        );
        accretionDisk.rotation.x = Math.PI / 2.6;
        singularityEyeGroup.add(accretionDisk);

        // Glowing Singularity Iris & Slit Pupil pointing along +Z (so lookAt(Konran) aims the Eye directly at Konran)
        const irisRing = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 0.24, body.size * 0.54, 32),
          new THREE.MeshBasicMaterial({
            color: '#c084fc',
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92,
          })
        );
        irisRing.position.z = body.size * 0.56;
        singularityEyeGroup.add(irisRing);

        const innerIris = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 0.14, body.size * 0.26, 24),
          new THREE.MeshBasicMaterial({
            color: '#facc15',
            side: THREE.DoubleSide,
          })
        );
        innerIris.position.z = body.size * 0.57;
        singularityEyeGroup.add(innerIris);

        // Vertical cat/dragon singularity slit pupil
        const slitPupil = new THREE.Mesh(
          new THREE.PlaneGeometry(body.size * 0.08, body.size * 0.42),
          new THREE.MeshBasicMaterial({ color: '#000000', side: THREE.DoubleSide })
        );
        slitPupil.position.z = body.size * 0.58;
        singularityEyeGroup.add(slitPupil);
      } else {
        // Standard Sphere with Rings / Mist
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size, 24, 18),
          new THREE.MeshStandardMaterial({
            color: body.color,
            roughness: 0.6,
            metalness: 0.2,
            emissive: body.color,
            emissiveIntensity: 0.35,
          })
        );
        detailGroup.add(pMesh);
        solarClickableMeshes.push(pMesh);

        if (body.visualStyle === 'purple_mist') {
          const mistMesh = new THREE.Mesh(
            new THREE.SphereGeometry(body.size * 1.35, 16, 12),
            new THREE.MeshBasicMaterial({
              color: '#c084fc',
              transparent: true,
              opacity: 0.28,
              side: THREE.BackSide,
            })
          );
          detailGroup.add(mistMesh);
        }
      }

      // Add Moons if configured
      if (body.moons && body.moons.length > 0) {
        body.moons.forEach((m, mIdx) => {
          const mOrbit = new THREE.Group();
          detailGroup.add(mOrbit);

          const moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(m.size, 16, 12),
            new THREE.MeshStandardMaterial({
              color: m.color,
              roughness: 0.65,
              emissive: m.color,
              emissiveIntensity: 0.22,
            })
          );
          moonMesh.position.set(m.orbitDistance, 0, 0);
          mOrbit.add(moonMesh);

          // Pair Vaya Mar's first moon (Lantyca) with the Sky-Waterspout bridge
          if (body.visualStyle === 'rainforest_spouts' && mIdx === 0 && waterspoutBridge) {
            lantycaMoonOrbit = mOrbit;
            lantycaMoonMesh = moonMesh;
            mOrbit.add(waterspoutBridge);
          }

          rotatingParts.push({ obj: mOrbit, speed: m.orbitSpeed, axis: 'y' });
        });
      }

      planetOrbitMeshes.push({
        group: orbitHolder,
        mesh: planetHolder,
        detailGroup,
        proxyMesh,
        isLandmark,
        speed: body.orbitSpeed,
        orbitRadius: body.orbitRadius,
        body,
        index: idx,
      });
    });

    // 6. Lighting (Unified 36-Hour Solar Terminator + Ambient & Rim Fill)
    // Low ambient so the dark hemisphere exhibits a genuine night shadow for city lights
    scene.add(new THREE.AmbientLight(0xdbeafe, 0.22));

    // Directional Sun Light driven live by the 36-hour Konran solar day
    const keyLight = new THREE.DirectionalLight(0xfff5e0, 3.1);
    keyLight.position.set(-4.5, 1.4, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight('#39ff14', 0.9, 10);
    rimLight.position.set(2.8, -1.8, -2.5);
    scene.add(rimLight);

    const sunLight = new THREE.PointLight('#ffffff', 3.8, 45);
    sunLight.position.set(0, 0, 0);
    solarSystemGroup.add(sunLight);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    let isDragging = false;
    let dragDistance = 0;
    let previousX = 0;
    let previousY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    let userYawOffset = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: PointerEvent) => {
      isDragging = true;
      dragDistance = 0;
      previousX = event.clientX;
      previousY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;
      dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

      if (zTierRef.current === 'system') {
        solarSystemGroup.rotation.y += deltaX * 0.005;
        solarSystemGroup.rotation.x = THREE.MathUtils.clamp(
          solarSystemGroup.rotation.x + deltaY * 0.005,
          -Math.PI / 3,
          Math.PI / 3
        );
      } else {
        userYawOffset += deltaX * 0.008;
        planet.rotation.y += deltaX * 0.008;
        planet.rotation.x = THREE.MathUtils.clamp(
          planet.rotation.x + deltaY * 0.008,
          -Math.PI / 2,
          Math.PI / 2
        );
      }
      dragVelocityX = deltaX * 0.0008;
      dragVelocityY = deltaY * 0.0008;
      previousX = event.clientX;
      previousY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (isDragging && dragDistance < 8) {
        // Raycasting on Globe Pins and Celestial Bodies
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        if (camera.position.length() > 9.0) {
          // Solar System view raycasting
          const intersects = raycaster.intersectObjects(solarClickableMeshes, true);
          if (intersects.length > 0) {
            let hit: THREE.Object3D | null = intersects[0].object;
            while (hit && !hit.userData.solarBody) {
              hit = hit.parent;
            }
            if (hit?.userData?.solarBody) {
              playOptionSelect();
              onCelestialBodyClickRef.current?.(hit.userData.solarBody);
              isDragging = false;
              return;
            }
          }
        } else {
          // Globe Pins raycasting (Planet / Surface view)
          const visiblePins = pinMeshes.filter((p) => p.mesh.visible).map((p) => p.mesh);
          const intersects = raycaster.intersectObjects(visiblePins, true);
          if (intersects.length > 0) {
            let hit: THREE.Object3D | null = intersects[0].object;
            while (hit && !hit.userData.globePin) {
              hit = hit.parent;
            }
            if (hit?.userData?.globePin) {
              playOptionSelect();
              onPinClickRef.current?.(hit.userData.globePin);
              isDragging = false;
              return;
            }
          }
        }

        onGlobeClickRef.current?.();
      }
      isDragging = false;
    };

    // Pinch / Wheel Zoom between Z-Depth Tiers
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const current = zTierRef.current;
      if (e.deltaY > 20) {
        if (current === 'surface') {
          playDetentTick(1);
          triggerHaptic(14);
          onZTierChangeRef.current?.('planet');
        } else if (current === 'planet') {
          playDetentTick(2);
          triggerHaptic([14, 18]);
          onZTierChangeRef.current?.('system');
        }
      } else if (e.deltaY < -20) {
        if (current === 'system') {
          playDetentTick(1);
          triggerHaptic(14);
          onZTierChangeRef.current?.('planet');
        } else if (current === 'planet') {
          playDetentTick(0);
          triggerHaptic([14, 18]);
          onZTierChangeRef.current?.('surface');
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    const cameraDir = new THREE.Vector3();
    const pinWorldNormal = new THREE.Vector3();
    const cityWorldNormal = new THREE.Vector3();
    const sunDirWorld = new THREE.Vector3();
    const eyeWorldPos = new THREE.Vector3();
    const kestoxWorldPos = new THREE.Vector3();
    const konranWorldPos = new THREE.Vector3();
    const eyeToKonranDir = new THREE.Vector3();
    const eyeToKestoxDir = new THREE.Vector3();

    let lastSimMs = getCelestialSimMs();
    let lastEclipseState: boolean | null = null;
    let screensaverAngle = 0;

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);

      // 1. Unified Celestial Clock (Single Source of Truth)
      const simMs = getCelestialSimMs();
      const celestialState = getCelestialNow();
      const deltaSimSec = (simMs - lastSimMs) / 1000;
      lastSimMs = simMs;

      // 2. Camera Positioning & Screensaver / Attract Mode Orbital Drift
      const targetRadius = TIER_CAM_Z[zTierRef.current];
      if (screensaverRef.current) {
        screensaverAngle += 0.0035;
        const orbitR = targetRadius * 0.94;
        const targetX = Math.sin(screensaverAngle) * orbitR;
        const targetZ = Math.cos(screensaverAngle) * orbitR;
        const targetY = Math.sin(screensaverAngle * 0.5) * (orbitR * 0.24);
        camera.position.x += (targetX - camera.position.x) * 0.04;
        camera.position.y += (targetY - camera.position.y) * 0.04;
        camera.position.z += (targetZ - camera.position.z) * 0.04;
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.x += (0 - camera.position.x) * 0.08;
        camera.position.y += (0 - camera.position.y) * 0.08;
        camera.position.z += (targetRadius - camera.position.z) * 0.08;
        camera.lookAt(0, 0, 0);
      }

      const camDist = camera.position.length();
      const isSystem = zTierRef.current === 'system';
      solarSystemGroup.visible = camDist > 9.0;
      planet.visible = camDist < 12.0;

      // 3. 36-Hour Solar Diurnal Terminator & Sun Direction
      const solarRad = THREE.MathUtils.degToRad(celestialState.solarDiurnalAngle);
      keyLight.position.set(
        Math.cos(solarRad) * 5.2,
        1.25 * Math.sin(solarRad * 0.5),
        Math.sin(solarRad) * 5.2
      );
      sunDirWorld.copy(keyLight.position).normalize();

      if (!isDragging) {
        userYawOffset += dragVelocityX;
        planet.rotation.x = THREE.MathUtils.clamp(
          planet.rotation.x + dragVelocityY,
          -Math.PI / 2,
          Math.PI / 2
        );
        if (isSystem) {
          solarSystemGroup.rotation.y += dragVelocityX;
        }
        dragVelocityX *= 0.95;
        dragVelocityY *= 0.95;
      }

      // Sync planet diurnal spin + user inspection yaw
      planet.rotation.y = solarRad * 0.25 + userYawOffset;

      // 4. Translucent Weather Cloud Layer & Canonical Lunar Cycles (Lyra 28d, Eyenath 60d retrograde)
      clouds.rotation.y = (simMs * 0.00004) % (Math.PI * 2);
      olysphereOrbit.rotation.y = THREE.MathUtils.degToRad(celestialState.lyra.orbitalAngle);
      ayanathOrbit.rotation.y = THREE.MathUtils.degToRad(celestialState.eyenath.orbitalAngle);

      // 5. Solar System Orbital Mechanics & Performance-Optimized Focus LOD
      const simTimeFactor = simMs * 0.00006;
      planetOrbitMeshes.forEach((item) => {
        item.group.rotation.y = simTimeFactor * (item.speed * 1000) + item.index * 0.7;

        // Focus LOD: Full detail for focused body OR canonical landmarks; proxy mesh otherwise
        const isFocused = item.body.id === focusedBodyIdRef.current;
        const showFullDetail = item.isLandmark || isFocused;
        item.detailGroup.visible = showFullDetail;
        item.proxyMesh.visible = !showFullDetail;
      });

      // Kay-Kee (Kayzoku) counter-rotation & "The Passing" annual alignment pulse
      if (kayHalfMesh && keeHalfMesh) {
        const kayAngle = (simTimeFactor * 18) % (Math.PI * 2);
        const keeAngle = (-simTimeFactor * 18) % (Math.PI * 2);
        kayHalfMesh.rotation.y = kayAngle;
        keeHalfMesh.rotation.y = keeAngle;

        if (passingGlowRing) {
          const alignDiff = Math.abs(Math.sin((kayAngle - keeAngle) * 0.5));
          const passingIntensity = Math.max(0.15, 1 - alignDiff);
          (passingGlowRing.material as THREE.MeshBasicMaterial).opacity = passingIntensity * 0.75;
          passingGlowRing.scale.setScalar(0.95 + passingIntensity * 0.25);
        }
      }

      // Vaya Mar & Lantyca (Ousava) Sky-Waterspout close-pass tidal animation
      if (lantycaMoonOrbit && waterspoutBridge && waterspoutMat && lantycaMoonMesh) {
        const lantycaPhase = Math.sin(simTimeFactor * 14);
        const closePassFactor = Math.max(0, (lantycaPhase + 0.35) / 1.35);
        // Modulate Lantyca's orbital distance slightly during 8-month tidal close pass
        const currentDist = 0.64 + (1 - closePassFactor) * 0.16;
        lantycaMoonMesh.position.x = currentDist;
        waterspoutBridge.visible = closePassFactor > 0.1;
        waterspoutBridge.scale.set(currentDist / 0.72, 0.7 + closePassFactor * 0.6, 0.7 + closePassFactor * 0.6);
        waterspoutBridge.position.x = currentDist * 0.5;
        waterspoutMat.opacity = closePassFactor * 0.78;
      }

      // Kestox / Keztox & Krayvuk's Singularity Eyeball watching Konran + Eclipse detection
      if (singularityEyeGroup && kestoxPlanetHolder && konranPlanetHolder) {
        singularityEyeGroup.getWorldPosition(eyeWorldPos);
        kestoxPlanetHolder.getWorldPosition(kestoxWorldPos);
        konranPlanetHolder.getWorldPosition(konranWorldPos);

        // The Singularity Eyeball continuously watches Konran
        singularityEyeGroup.lookAt(konranWorldPos);

        // Check if Kestox eclipses the Singularity Eye's line of sight to Konran
        eyeToKonranDir.subVectors(konranWorldPos, eyeWorldPos).normalize();
        eyeToKestoxDir.subVectors(kestoxWorldPos, eyeWorldPos).normalize();
        const alignmentDot = eyeToKonranDir.dot(eyeToKestoxDir);
        const isEclipsed = alignmentDot > 0.965;

        if (isEclipsed !== lastEclipseState) {
          lastEclipseState = isEclipsed;
          onEyeEclipseChangeRef.current?.(isEclipsed);
        }
      }

      // Rotating sub-parts (Ayan filaments, Lona Uyn floating islands, moons)
      const stepScale = Math.max(0.2, Math.min(4, Math.abs(deltaSimSec) * 60 || 1));
      rotatingParts.forEach((part) => {
        const ax = part.axis || 'y';
        part.obj.rotation[ax] += part.speed * stepScale;
      });

      // 6. Night City Lights & Globe Pins Horizon Culling + Sub-Map Portal Reticles
      if (planet.visible) {
        cameraDir.copy(camera.position).normalize();
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.0045);

        // Emissive Night City Lights on the dark hemisphere (dot(sunDir, cityNormal) < 0.1)
        nightCityLights.forEach(({ clusterGroup, materials, normal }) => {
          cityWorldNormal.copy(normal).applyQuaternion(planet.quaternion);
          const sunDot = sunDirWorld.dot(cityWorldNormal);
          const camDot = cameraDir.dot(cityWorldNormal);

          if (camDot <= 0 || sunDot >= 0.1) {
            clusterGroup.visible = false;
            return;
          }

          clusterGroup.visible = true;
          // Smoothly ramp up warm city glow as location moves deeper into night
          const nightStrength = THREE.MathUtils.clamp((0.1 - sunDot) / 0.45, 0, 1);
          materials.forEach((mat, idx) => {
            const baseAlpha = idx === 0 ? 0.92 : idx === 1 ? 0.38 : 0.75;
            mat.opacity = nightStrength * baseAlpha;
          });
        });

        // Smooth fade factor for tier === 'city' pins as camera zooms closer to surface
        const cityZoomAlpha = THREE.MathUtils.clamp((4.8 - camDist) / 1.6, 0, 1);

        pinMeshes.forEach(({ mesh, pin, normal, pinMat, ringMat, portalRing, portalRingMat }) => {
          // Transform pin normal to world space
          pinWorldNormal.copy(normal).applyQuaternion(planet.quaternion);

          // Horizon culling: hide far-hemisphere pins when dot(cameraDir, pinNormal) < 0
          const dot = cameraDir.dot(pinWorldNormal);
          if (dot < 0) {
            mesh.visible = false;
            return;
          }

          // Smooth horizon edge fade
          const horizonFade = THREE.MathUtils.clamp(dot / 0.2, 0, 1);

          // Zoom LOD: provinces & capitals always visible on near hemisphere; cities fade in smoothly as camera zooms closer
          let tierAlpha = 1;
          if (pin.tier === 'city' && !pin.isCapital) {
            tierAlpha = cityZoomAlpha;
          } else if (pin.tier === 'city' && pin.isCapital) {
            tierAlpha = Math.max(0.55, cityZoomAlpha);
          } else if (pin.tier === 'landmark') {
            tierAlpha = cityZoomAlpha;
          }

          const finalAlpha = horizonFade * tierAlpha;
          if (finalAlpha <= 0.02) {
            mesh.visible = false;
            return;
          }

          mesh.visible = true;
          pinMat.opacity = finalAlpha;
          ringMat.opacity = finalAlpha * 0.65;

          // Animate pulsing sub-map portal reticle ring
          if (portalRing && portalRingMat) {
            const scale = 1 + pulse * 0.28;
            portalRing.scale.set(scale, scale, 1);
            portalRingMat.opacity = finalAlpha * (0.45 + (1 - pulse) * 0.45);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material?.dispose());
        }
      });
      texture.dispose();
      cloudTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="konran-globe w-full h-full cursor-grab active:cursor-grabbing"
      role="img"
      aria-label="Interactive 3-tier celestial globe and solar system of Konran"
    />
  );
};
