import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

export const KonranGlobe = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 5.4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const planet = new THREE.Group();
    scene.add(planet);

    // 1. Planetary Surface (Matte PBR standard material)
    const texture = new THREE.TextureLoader().load(
      '/assests/konran-map.jpg',
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

    // 4. Olysphere (Gold Sentinel Moon)
    const olysphereOrbit = new THREE.Group();
    planet.add(olysphereOrbit);

    const olysphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 32, 24),
      new THREE.MeshStandardMaterial({
        color: '#ffc86b',
        emissive: '#7a4a08',
        emissiveIntensity: 0.45,
        roughness: 0.6,
        metalness: 0.1,
      }),
    );
    olysphere.position.set(1.95, 0.22, 0);
    olysphereOrbit.add(olysphere);

    const sentinelLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 12),
      new THREE.MeshBasicMaterial({ color: '#fffdf0' }),
    );
    sentinelLight.position.set(0.04, 0.06, 0.1);
    olysphere.add(sentinelLight);

    // 5. Ayanath (Violet Watchtower Moon)
    const ayanathOrbit = new THREE.Group();
    ayanathOrbit.rotation.z = THREE.MathUtils.degToRad(32);
    planet.add(ayanathOrbit);

    const ayanath = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 32, 24),
      new THREE.MeshStandardMaterial({
        color: '#9c68dc',
        emissive: '#441673',
        emissiveIntensity: 0.5,
        roughness: 0.5,
        metalness: 0.2,
      }),
    );
    ayanath.position.set(-2.2, 0.05, 0);
    ayanathOrbit.add(ayanath);

    const watchtowerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.012, 12, 48),
      new THREE.MeshBasicMaterial({ color: '#c49cff', transparent: true, opacity: 0.85 }),
    );
    watchtowerRing.rotation.x = THREE.MathUtils.degToRad(72);
    ayanath.add(watchtowerRing);

    // 6. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.8);
    keyLight.position.set(-3.5, 1.8, 4.2);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight('#39ff14', 1.1, 7);
    rimLight.position.set(2.8, -1.8, -2.5);
    scene.add(rimLight);

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
    let previousX = 0;
    let previousY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;

    const onPointerDown = (event: PointerEvent) => {
      isDragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;
      planet.rotation.y += deltaX * 0.008;
      planet.rotation.x = THREE.MathUtils.clamp(
        planet.rotation.x + deltaY * 0.008,
        -Math.PI / 2,
        Math.PI / 2,
      );
      dragVelocityX = deltaX * 0.0008;
      dragVelocityY = deltaY * 0.0008;
      previousX = event.clientX;
      previousY = event.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      if (!isDragging) {
        planet.rotation.y += 0.0018 + dragVelocityX;
        planet.rotation.x = THREE.MathUtils.clamp(
          planet.rotation.x + dragVelocityY,
          -Math.PI / 2,
          Math.PI / 2,
        );
        dragVelocityX *= 0.96;
        dragVelocityY *= 0.96;
      }
      // Natural atmospheric parallax drift
      clouds.rotation.y += 0.0007;
      olysphereOrbit.rotation.y += 0.004;
      ayanathOrbit.rotation.y -= 0.0026;
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
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
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
      className="konran-globe"
      role="img"
      aria-label="Interactive rotating globe of Konran with Olysphere and Ayanath in orbit"
    />
  );
};