import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

    const texture = new THREE.TextureLoader().load(
      '/assests/konran-map.jpg',
      undefined,
      undefined,
      (error) => console.error('Unable to load the Konran map texture.', error),
    );
    texture.colorSpace = THREE.SRGBColorSpace;

    const sphereGeometry = new THREE.SphereGeometry(1.35, 64, 48);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 14,
      specular: new THREE.Color('#42694b'),
    });
    const globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
    planet.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.43, 32, 24),
      new THREE.MeshBasicMaterial({
        color: '#39ff14',
        wireframe: true,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    );
    planet.add(atmosphere);

    const olysphereOrbit = new THREE.Group();
    planet.add(olysphereOrbit);
    const olysphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 24, 18),
      new THREE.MeshStandardMaterial({
        color: '#ffbd58',
        emissive: '#6b3d0d',
        roughness: 0.5,
        metalness: 0.3,
      }),
    );
    olysphere.position.set(1.88, 0.22, 0);
    olysphereOrbit.add(olysphere);
    const sentinelLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 10),
      new THREE.MeshBasicMaterial({ color: '#fff8d8' }),
    );
    sentinelLight.position.set(0.045, 0.08, 0.105);
    olysphere.add(sentinelLight);

    const ayanathOrbit = new THREE.Group();
    ayanathOrbit.rotation.z = THREE.MathUtils.degToRad(32);
    planet.add(ayanathOrbit);
    const ayanath = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 24, 18),
      new THREE.MeshStandardMaterial({
        color: '#9c68dc',
        emissive: '#35135a',
        roughness: 0.6,
        metalness: 0.2,
      }),
    );
    ayanath.position.set(-2.02, 0.05, 0);
    ayanathOrbit.add(ayanath);
    const watchtowerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.23, 0.012, 8, 40),
      new THREE.MeshBasicMaterial({ color: '#c49cff', transparent: true, opacity: 0.8 }),
    );
    watchtowerRing.rotation.x = THREE.MathUtils.degToRad(72);
    ayanath.add(watchtowerRing);

    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const keyLight = new THREE.DirectionalLight(0xfff1d0, 2.25);
    keyLight.position.set(-3, 2, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight('#39ff14', 1.3, 8);
    rimLight.position.set(2.8, -1.5, -2.5);
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
