import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function OpportunityScene() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 8);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    const coreMaterial = new THREE.MeshStandardMaterial({ color: '#b5eb62', roughness: 0.26, metalness: 0.1 });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 2), coreMaterial);
    group.add(core);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: '#e8a277', transparent: true, opacity: 0.72 });
    const rings = [
      new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.012, 8, 120), ringMaterial),
      new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.008, 8, 120), new THREE.MeshBasicMaterial({ color: '#d8e6d3', transparent: true, opacity: 0.3 })),
    ];
    rings[0].rotation.set(0.9, 0.4, -0.25);
    rings[1].rotation.set(1.25, -0.2, 0.45);
    group.add(...rings);
    const points = new THREE.Group();
    const colors = ['#e8a277', '#f4c95d', '#eff2e8', '#b5eb62'];
    for (let index = 0; index < 24; index += 1) {
      const angle = (index / 24) * Math.PI * 2;
      const radius = 1.6 + (index % 3) * 0.18;
      const dot = new THREE.Mesh(new THREE.SphereGeometry(index % 5 === 0 ? 0.07 : 0.035, 12, 12), new THREE.MeshBasicMaterial({ color: colors[index % colors.length] }));
      dot.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.73, (index % 4) * 0.13 - 0.2);
      points.add(dot);
    }
    group.add(points);
    scene.add(new THREE.AmbientLight('#ffffff', 1.25));
    const light = new THREE.PointLight('#f4c95d', 32, 16);
    light.position.set(3, 3, 5);
    scene.add(light);

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (event) => {
      const bounds = host.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.3;
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.24;
    };
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const animate = () => {
      frame = requestAnimationFrame(animate);
      group.rotation.y += 0.0025;
      group.rotation.x += (pointerY - group.rotation.x) * 0.015;
      group.rotation.z += (pointerX - group.rotation.z) * 0.015;
      core.rotation.y -= 0.003;
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    host.addEventListener('pointermove', onPointerMove);
    animate();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="scene-canvas" ref={hostRef} aria-hidden="true" />;
}
