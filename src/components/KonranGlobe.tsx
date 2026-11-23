import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ZDepthTier } from '../types/slabletOS';
import { CANONICAL_SOLAR_SYSTEM } from '../utils/celestial';
import { playDetentTick, triggerHaptic } from '../utils/audio';

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

  // Helper: Draws a soft cloud mass with calibrated wrap-around gradients
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
    // Properly center wrapped gradients so edges fuse seamlessly
    if (cx - radius < 0) drawAt(cx + w);
    if (cx + radius > w) drawAt(cx - w);
  };

  // 1. Seamless Jet Streams (Exact 2*PI harmonic frequencies)
  for (const yBand of [h * 0.32, h * 0.68]) {
    for (let x = 0; x < w; x += 18) {
      const theta = (x / w) * Math.PI * 2;
      const yOffset = Math.sin(theta * 3) * 40 + Math.cos(theta * 6) * 20;
      const py = yBand + yOffset;
      const rad = 45 + Math.sin(theta * 8) * 18;
      drawCloud(x, py, rad, 0.45);
    }
  }

  // 2. Continental Cumulus Cloud Clusters
  const numClusters = 85;
  for (let i = 0; i < numClusters; i++) {
    const cx = Math.random() * w;
    const lat = (Math.random() - 0.5) * 0.72; // Keep off pinched poles
    const cy = h * (0.5 + lat);
    const radius = 65 + Math.random() * 85;
    drawCloud(cx, cy, radius, 0.8);
  }

  // 3. Two Major Cyclonic Storm Vortexes with Wrapped Spiral Arms
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

  // 4. Seam Stitch Pass: Fuses column 0 and column (w - 1)
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
}

const TIER_CAM_Z: Record<ZDepthTier, number> = {
  surface: 2.35,
  planet: 5.8,
  system: 18.0,
};

export const KonranGlobe = ({ 
  zTier = 'planet', 
  onGlobeClick, 
  onZTierChange 
}: KonranGlobeProps = {}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onGlobeClickRef = useRef(onGlobeClick);
  onGlobeClickRef.current = onGlobeClick;
  const onZTierChangeRef = useRef(onZTierChange);
  onZTierChangeRef.current = onZTierChange;
  const zTierRef = useRef(zTier);
  zTierRef.current = zTier;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 150);
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
      (error) => console.error('Unable to load the Konran map texture.', error),
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

    // 3. Atmospheric Halo Glow (No grid lines)
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

    // 4. Olysphere (Gold Sentinel Moon) — Calibrated distance to prevent viewport clipping
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
      }),
    );
    olysphere.position.set(1.68, 0.16, 0);
    olysphereOrbit.add(olysphere);

    const sentinelLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 16, 12),
      new THREE.MeshBasicMaterial({ color: '#fffdf0' }),
    );
    sentinelLight.position.set(0.03, 0.05, 0.09);
    olysphere.add(sentinelLight);

    // 5. Ayanath (Violet Watchtower Moon) — Calibrated distance to prevent clipping
    const ayanathOrbit = new THREE.Group();
    ayanathOrbit.rotation.z = THREE.MathUtils.degToRad(28);
    planet.add(ayanathOrbit);

    const ayanath = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 32, 24),
      new THREE.MeshStandardMaterial({
        color: '#9c68dc',
        emissive: '#441673',
        emissiveIntensity: 0.5,
        roughness: 0.5,
        metalness: 0.2,
      }),
    );
    ayanath.position.set(-1.86, 0.05, 0);
    ayanathOrbit.add(ayanath);

    const watchtowerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.01, 12, 48),
      new THREE.MeshBasicMaterial({ color: '#c49cff', transparent: true, opacity: 0.85 }),
    );
    watchtowerRing.rotation.x = THREE.MathUtils.degToRad(72);
    ayanath.add(watchtowerRing);

    // ==========================================
    // 2. FULL SOLAR SYSTEM VIEW (TIER 3)
    // ==========================================
    const solarSystemGroup = new THREE.Group();
    solarSystemGroup.visible = false;
    scene.add(solarSystemGroup);

    // Central Sun (Sol-Prime / Ay)
    const sunGeom = new THREE.SphereGeometry(0.72, 32, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: '#ffdd44' });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    solarSystemGroup.add(sunMesh);

    // Sun Corona Halo
    const coronaGeom = new THREE.SphereGeometry(0.88, 32, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: '#f59e0b',
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    solarSystemGroup.add(new THREE.Mesh(coronaGeom, coronaMat));

    // Celestial Planetary Planes & Orbits
    const planetOrbitMeshes: Array<{
      group: THREE.Group;
      mesh: THREE.Mesh;
      speed: number;
      orbitRadius: number;
      bodyId: string;
    }> = [];

    CANONICAL_SOLAR_SYSTEM.forEach((body) => {
      if (body.type === 'sun') return;

      // Thin orbital ring
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

      // Planet Orbit Holder
      const orbitHolder = new THREE.Group();
      if (body.orbitTilt) {
        orbitHolder.rotation.x = THREE.MathUtils.degToRad(body.orbitTilt);
      }
      solarSystemGroup.add(orbitHolder);

      // Planet Mesh
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(body.size, 24, 18),
        new THREE.MeshStandardMaterial({
          color: body.color,
          roughness: 0.6,
          metalness: 0.2,
          emissive: body.color,
          emissiveIntensity: 0.25,
        })
      );
      pMesh.position.set(body.orbitRadius, 0, 0);

      // Planetary rings if applicable
      if (body.hasRings && body.ringColor) {
        const rMesh = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 1.4, body.size * 2.1, 32),
          new THREE.MeshBasicMaterial({
            color: body.ringColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6,
          })
        );
        rMesh.rotation.x = Math.PI / 2.3;
        pMesh.add(rMesh);
      }

      orbitHolder.add(pMesh);

      planetOrbitMeshes.push({
        group: orbitHolder,
        mesh: pMesh,
        speed: body.orbitSpeed,
        orbitRadius: body.orbitRadius,
        bodyId: body.id,
      });
    });

    // 6. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.8);
    keyLight.position.set(-3.5, 1.8, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight('#39ff14', 1.1, 10);
    rimLight.position.set(2.8, -1.8, -2.5);
    scene.add(rimLight);

    const sunLight = new THREE.PointLight('#ffdd44', 3.0, 30);
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
          Math.PI / 3,
        );
      } else {
        planet.rotation.y += deltaX * 0.008;
        planet.rotation.x = THREE.MathUtils.clamp(
          planet.rotation.x + deltaY * 0.008,
          -Math.PI / 2,
          Math.PI / 2,
        );
      }
      dragVelocityX = deltaX * 0.0008;
      dragVelocityY = deltaY * 0.0008;
      previousX = event.clientX;
      previousY = event.clientY;
    };

    const onPointerUp = () => {
      if (isDragging && dragDistance < 6) {
        onGlobeClickRef.current?.();
      }
      isDragging = false;
    };

    // Pinch / Wheel Zoom between Z-Depth Tiers with tactile haptic feedback
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const current = zTierRef.current;
      if (e.deltaY > 20) {
        // Zoom Out
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
        // Zoom In
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

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);

      // Smooth camera interpolation toward target tier Z
      const targetZ = TIER_CAM_Z[zTierRef.current];
      camera.position.z += (targetZ - camera.position.z) * 0.08;

      // Visibility transitions between Planet vs System
      const isSystem = zTierRef.current === 'system';
      solarSystemGroup.visible = camera.position.z > 9.0;
      planet.visible = camera.position.z < 12.0;

      if (!isDragging) {
        planet.rotation.y += 0.0018 + dragVelocityX;
        planet.rotation.x = THREE.MathUtils.clamp(
          planet.rotation.x + dragVelocityY,
          -Math.PI / 2,
          Math.PI / 2,
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

      // Solar system orbits (including dual reverse orbit of torn twins)
      planetOrbitMeshes.forEach((item) => {
        item.group.rotation.y += item.speed;
      });

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