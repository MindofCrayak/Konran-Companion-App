import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ZDepthTier, GlobePin, SolarBody } from '../types/slabletOS';
import { CANONICAL_SOLAR_SYSTEM } from '../utils/celestial';
import { CANONICAL_GLOBE_PINS } from '../utils/legendKeeperData';
import { playDetentTick, triggerHaptic, playOptionSelect } from '../utils/audio';

// Generates a 100% seamless, continuous 360-degree cloud and storm sphere
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
      grad.addColorStop(0.35, `rgba(240, 248, 255, ${opacity * 0.6})`);
      grad.addColorStop(0.7, `rgba(220, 240, 255, ${opacity * 0.2})`);
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

  for (const yBand of [h * 0.32, h * 0.68]) {
    for (let x = 0; x < w; x += 18) {
      const theta = (x / w) * Math.PI * 2;
      const yOffset = Math.sin(theta * 3) * 40 + Math.cos(theta * 6) * 20;
      const py = yBand + yOffset;
      const rad = 45 + Math.sin(theta * 8) * 18;
      drawCloud(x, py, rad, 0.45);
    }
  }

  const numClusters = 85;
  for (let i = 0; i < numClusters; i++) {
    const cx = Math.random() * w;
    const lat = (Math.random() - 0.5) * 0.72;
    const cy = h * (0.5 + lat);
    const radius = 65 + Math.random() * 85;
    drawCloud(cx, cy, radius, 0.8);
  }

  const storms = [
    { x: w * 0.28, y: h * 0.36, rad: 90 },
    { x: w * 0.76, y: h * 0.62, rad: 105 },
  ];

  storms.forEach(({ x, y, rad }) => {
    drawCloud(x, y, rad * 0.65, 0.85);

    for (let angle = 0; angle < Math.PI * 4; angle += 0.16) {
      const r = (angle / (Math.PI * 4)) * rad;
      const px = x + Math.cos(angle * 1.5) * r;
      const py = y + Math.sin(angle * 1.5) * r;
      drawCloud(px, py, 24, 0.75);
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

interface KonranGlobeProps {
  zTier?: ZDepthTier;
  onGlobeClick?: () => void;
  onZTierChange?: (tier: ZDepthTier) => void;
  onPinClick?: (pin: GlobePin) => void;
  onCelestialBodyClick?: (body: SolarBody) => void;
}

const TIER_CAM_Z: Record<ZDepthTier, number> = {
  surface: 2.35,
  planet: 5.8,
  system: 18.0,
};

export const KonranGlobe = ({
  zTier = 'planet',
  onGlobeClick,
  onZTierChange,
  onPinClick,
  onCelestialBodyClick,
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

  const zTierRef = useRef<ZDepthTier>(zTier);
  zTierRef.current = zTier;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
    camera.position.z = TIER_CAM_Z[zTier];

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ==========================================
    // 1. PLANET KONRAN & MOONS (TIER 1 & 2)
    // ==========================================
    const planet = new THREE.Group();
    scene.add(planet);

    // 1. Planetary Surface (Matte PBR standard material)
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
      roughness: 0.78,
      metalness: 0.05,
    });
    const globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
    planet.add(globe);

    // 2. Seamless Cloud Layer
    const cloudTexture = createCloudTexture();
    const cloudGeometry = new THREE.SphereGeometry(1.368, 64, 48);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.NormalBlending,
      roughness: 0.9,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planet.add(clouds);

    // 3. Atmospheric Halo Glow (Transparent center preserving core)
    const atmosphereGeometry = new THREE.SphereGeometry(1.39, 64, 48);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: '#39ff14',
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    planet.add(atmosphere);

    // 4. Olysphere (Gold Sentinel Moon) — Calibrated r=1.68
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

    // 5. Ayanath (Violet Watchtower Moon) — Calibrated r=-1.86
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
    // 2. LEGENDKEEPER GLOBE PINS (PROVINCES & CITIES)
    // ==========================================
    const pinsGroup = new THREE.Group();
    planet.add(pinsGroup);

    const pinMeshes: Array<{
      mesh: THREE.Mesh;
      pin: GlobePin;
      normal: THREE.Vector3;
    }> = [];

    const loadPins = async () => {
      let rawPins: GlobePin[] = CANONICAL_GLOBE_PINS;
      try {
        const res = await fetch('/api/lore/legendkeeper?pins=1');
        if (res.ok) {
          const json: any = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            rawPins = json.data;
          }
        }
      } catch {
        // Fallback to canonical pins
      }

      rawPins.forEach((pin) => {
        const phi = (90 - pin.lat) * (Math.PI / 180);
        const theta = (pin.lng + 180) * (Math.PI / 180);
        const r = 1.38;

        const x = -r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);

        const normal = new THREE.Vector3(x, y, z).normalize();

        const isProvince = pin.tier === 'province';
        const pinSize = isProvince ? 0.042 : 0.026;
        const color = pin.iconColor || (isProvince ? '#ffd700' : '#38bdf8');

        // Diamond / Beacon Mesh
        const pGeom = new THREE.OctahedronGeometry(pinSize, 0);
        const pMat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.75,
          roughness: 0.3,
          metalness: 0.8,
        });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        pMesh.position.set(x, y, z);
        pMesh.userData = { globePin: pin };

        // Outer pulsing ring
        const ringGeom = new THREE.RingGeometry(pinSize * 1.2, pinSize * 1.7, 16);
        const ringMat = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        pMesh.add(ring);

        pinsGroup.add(pMesh);
        pinMeshes.push({ mesh: pMesh, pin, normal });
      });
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

    const planetOrbitMeshes: Array<{
      group: THREE.Group;
      mesh: THREE.Object3D;
      speed: number;
      orbitRadius: number;
      body: SolarBody;
    }> = [];

    // Build the 10 Canonical Celestial Bodies
    CANONICAL_SOLAR_SYSTEM.forEach((body) => {
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

        // Woven Blue & Yellow Filaments
        const blueLoop = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 1.45, 0.02, 12, 64),
          new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.85 })
        );
        blueLoop.rotation.x = Math.PI / 3;
        sunHolder.add(blueLoop);
        rotatingParts.push({ obj: blueLoop, speed: 0.012, axis: 'y' });

        const yellowLoop = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 1.52, 0.02, 12, 64),
          new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.85 })
        );
        yellowLoop.rotation.y = Math.PI / 4;
        yellowLoop.rotation.z = Math.PI / 5;
        sunHolder.add(yellowLoop);
        rotatingParts.push({ obj: yellowLoop, speed: -0.014, axis: 'z' });

        solarSystemGroup.add(sunHolder);
        return;
      }

      // Thin orbital line
      const ringGeom = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 96;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * body.orbitRadius, 0, Math.sin(theta) * body.orbitRadius));
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

      // Distinct Canonical Mesh & Shading per visualStyle
      if (body.visualStyle === 'mushroom_basin') {
        // Kay-Kee (Kayzoku): Two separated counter-rotating halves
        const kayGeom = new THREE.SphereGeometry(body.size, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.46);
        const kayMesh = new THREE.Mesh(
          kayGeom,
          new THREE.MeshStandardMaterial({ color: '#d4b35e', roughness: 0.8, emissive: '#854d0e', emissiveIntensity: 0.3 })
        );
        kayMesh.position.y = 0.04;
        planetHolder.add(kayMesh);
        solarClickableMeshes.push(kayMesh);
        rotatingParts.push({ obj: kayMesh, speed: 0.02, axis: 'y' });

        const keeGeom = new THREE.SphereGeometry(body.size, 24, 16, 0, Math.PI * 2, Math.PI * 0.54, Math.PI * 0.46);
        const keeMesh = new THREE.Mesh(
          keeGeom,
          new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.4, emissive: '#0284c7', emissiveIntensity: 0.4 })
        );
        keeMesh.position.y = -0.04;
        planetHolder.add(keeMesh);
        solarClickableMeshes.push(keeMesh);
        rotatingParts.push({ obj: keeMesh, speed: -0.02, axis: 'y' });
      } else if (body.visualStyle === 'volcanic_dust') {
        // Synthelavor (Slavyna): Scorched sphere + red rings + nebula shroud
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size, 24, 18),
          new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.7, emissive: '#7f1d1d', emissiveIntensity: 0.6 })
        );
        planetHolder.add(pMesh);
        solarClickableMeshes.push(pMesh);

        // Glittering red rings
        const rMesh = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 1.35, body.size * 2.2, 32),
          new THREE.MeshBasicMaterial({ color: '#b91c1c', side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
        );
        rMesh.rotation.x = Math.PI / 2.3;
        planetHolder.add(rMesh);

        // Nebula dust shroud
        const dustMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size * 1.8, 16, 12),
          new THREE.MeshBasicMaterial({
            color: '#ec4899',
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
          })
        );
        planetHolder.add(dustMesh);
      } else if (body.visualStyle === 'aerial_islands') {
        // Lona Uyn (Lyricia): Azure water & green land + ring halo + floating rock islands
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size, 24, 18),
          new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.5, emissive: '#0284c7', emissiveIntensity: 0.35 })
        );
        planetHolder.add(pMesh);
        solarClickableMeshes.push(pMesh);

        // Ring halo
        const haloMesh = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 1.5, 0.015, 12, 48),
          new THREE.MeshBasicMaterial({ color: '#ec4899', transparent: true, opacity: 0.85 })
        );
        haloMesh.rotation.x = Math.PI / 2.5;
        planetHolder.add(haloMesh);

        // Floating aerial rock islands
        for (let i = 0; i < 4; i++) {
          const island = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.04, 0),
            new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.9 })
          );
          const ang = (i / 4) * Math.PI * 2;
          island.position.set(Math.cos(ang) * (body.size + 0.1), 0.05 * (i % 2 === 0 ? 1 : -1), Math.sin(ang) * (body.size + 0.1));
          planetHolder.add(island);
        }
      } else if (body.visualStyle === 'dragon_eye') {
        // Dyata (Oray): Golden world with dark caldera & glowing dragon pupil
        const pMesh = new THREE.Mesh(
          new THREE.SphereGeometry(body.size, 24, 18),
          new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.6, emissive: '#b45309', emissiveIntensity: 0.5 })
        );
        planetHolder.add(pMesh);
        solarClickableMeshes.push(pMesh);

        // Caldera eye ring
        const eyeRing = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 0.4, body.size * 0.75, 24),
          new THREE.MeshBasicMaterial({ color: '#171717', side: THREE.DoubleSide })
        );
        eyeRing.position.z = body.size * 0.95;
        pMesh.add(eyeRing);
      } else if (body.visualStyle === 'brain_lobes') {
        // Kestox / Keztox (Krayvuk): Two-lobed battle station split by yellow acid trench
        const kesLobe = new THREE.Mesh(
          new THREE.SphereGeometry(body.size * 0.75, 20, 16),
          new THREE.MeshStandardMaterial({ color: '#84cc16', roughness: 0.7, emissive: '#4d7c0f', emissiveIntensity: 0.4 })
        );
        kesLobe.position.x = -body.size * 0.4;
        planetHolder.add(kesLobe);
        solarClickableMeshes.push(kesLobe);

        const toxLobe = new THREE.Mesh(
          new THREE.SphereGeometry(body.size * 0.75, 20, 16),
          new THREE.MeshStandardMaterial({ color: '#7e22ce', roughness: 0.5, metalness: 0.4, emissive: '#581c87', emissiveIntensity: 0.4 })
        );
        toxLobe.position.x = body.size * 0.4;
        planetHolder.add(toxLobe);
        solarClickableMeshes.push(toxLobe);

        // Acid trench
        const trench = new THREE.Mesh(
          new THREE.TorusGeometry(body.size * 0.65, 0.02, 12, 32),
          new THREE.MeshBasicMaterial({ color: '#facc15' })
        );
        trench.rotation.y = Math.PI / 2;
        planetHolder.add(trench);
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
        planetHolder.add(pMesh);
        solarClickableMeshes.push(pMesh);

        if (body.visualStyle === 'purple_mist') {
          const mistMesh = new THREE.Mesh(
            new THREE.SphereGeometry(body.size * 1.35, 16, 12),
            new THREE.MeshBasicMaterial({ color: '#c084fc', transparent: true, opacity: 0.28, side: THREE.BackSide })
          );
          planetHolder.add(mistMesh);
        }
      }

      // Add Moons if configured
      if (body.moons && body.moons.length > 0) {
        body.moons.forEach((m) => {
          const mOrbit = new THREE.Group();
          planetHolder.add(mOrbit);

          const moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(m.size, 16, 12),
            new THREE.MeshStandardMaterial({ color: m.color, roughness: 0.7 })
          );
          moonMesh.position.set(m.orbitDistance, 0, 0);
          mOrbit.add(moonMesh);
          rotatingParts.push({ obj: mOrbit, speed: m.orbitSpeed, axis: 'y' });
        });
      }

      planetOrbitMeshes.push({
        group: orbitHolder,
        mesh: planetHolder,
        speed: body.orbitSpeed,
        orbitRadius: body.orbitRadius,
        body,
      });
    });

    // 6. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.8);
    keyLight.position.set(-3.5, 1.8, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight('#39ff14', 1.1, 10);
    rimLight.position.set(2.8, -1.8, -2.5);
    scene.add(rimLight);

    const sunLight = new THREE.PointLight('#ffffff', 3.5, 40);
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

        if (camera.position.z > 9.0) {
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

    const cameraWorldPos = new THREE.Vector3();
    const pinWorldNormal = new THREE.Vector3();

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);

      // Smooth camera interpolation toward target tier Z
      const targetZ = TIER_CAM_Z[zTierRef.current];
      camera.position.z += (targetZ - camera.position.z) * 0.08;

      const isSystem = zTierRef.current === 'system';
      solarSystemGroup.visible = camera.position.z > 9.0;
      planet.visible = camera.position.z < 12.0;

      if (!isDragging) {
        planet.rotation.y += 0.0018 + dragVelocityX;
        planet.rotation.x = THREE.MathUtils.clamp(
          planet.rotation.x + dragVelocityY,
          -Math.PI / 2,
          Math.PI / 2
        );
        if (isSystem) {
          solarSystemGroup.rotation.y += 0.0006 + dragVelocityX;
        }
        dragVelocityX *= 0.96;
        dragVelocityY *= 0.96;
      }

      // Orbital motion
      clouds.rotation.y += 0.0007;
      olysphereOrbit.rotation.y += 0.004;
      ayanathOrbit.rotation.y -= 0.0026;

      // Solar system orbits
      planetOrbitMeshes.forEach((item) => {
        item.group.rotation.y += item.speed;
      });

      // Rotating sub-parts (Kay-Kee counter-rotation, filaments, moons)
      rotatingParts.forEach((part) => {
        const ax = part.axis || 'y';
        part.obj.rotation[ax] += part.speed;
      });

      // Globe Pins Horizon Occlusion & Zoom LOD
      if (planet.visible) {
        camera.getWorldPosition(cameraWorldPos);
        const camDist = camera.position.z;

        pinMeshes.forEach(({ mesh, pin, normal }) => {
          // Transform normal to world space
          pinWorldNormal.copy(normal).applyQuaternion(planet.quaternion);

          // Dot product: if facing away from camera, hide (horizon culling)
          const dot = pinWorldNormal.dot(camera.position.clone().normalize());
          const isFacingCamera = dot > 0.15;

          if (!isFacingCamera) {
            mesh.visible = false;
            return;
          }

          // Zoom LOD:
          // Orbital distance: show provinces and major capitals (Crafton Cove, Vantya, Padd City, etc.)
          // Surface distance: show all cities and landmarks
          if (camDist > 4.2) {
            mesh.visible = pin.tier === 'province' || Boolean(pin.isCapital);
          } else {
            mesh.visible = true;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
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
