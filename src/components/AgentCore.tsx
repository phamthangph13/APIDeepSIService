import { useEffect, useRef } from "react";
import type * as Three from "three";

type AgentCoreProps = {
  className?: string;
};

export function AgentCore({ className = "" }: AgentCoreProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const boot = async () => {
      const THREE = await import("three");
      if (disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 6.4);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const ico = new THREE.IcosahedronGeometry(1.5, 1);
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(ico),
        new THREE.LineBasicMaterial({
          color: 0x171812,
          transparent: true,
          opacity: 0.58,
        }),
      );
      group.add(wire);

      const points = new THREE.Points(
        ico,
        new THREE.PointsMaterial({
          color: 0xb65f43,
          size: 0.05,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.9,
        }),
      );
      group.add(points);

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.66, 0),
        new THREE.MeshBasicMaterial({ color: 0xe9e2d3 }),
      );
      const coreEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(core.geometry),
        new THREE.LineBasicMaterial({ color: 0x171812, transparent: true, opacity: 0.55 }),
      );
      group.add(core, coreEdges);

      const ringA = new THREE.Mesh(
        new THREE.TorusGeometry(2.02, 0.008, 6, 160),
        new THREE.MeshBasicMaterial({ color: 0x244136, transparent: true, opacity: 0.55 }),
      );
      ringA.rotation.x = Math.PI / 2.55;
      ringA.rotation.y = Math.PI / 7;
      group.add(ringA);

      const ringB = new THREE.Mesh(
        new THREE.TorusGeometry(2.36, 0.006, 6, 160),
        new THREE.MeshBasicMaterial({ color: 0xc9a961, transparent: true, opacity: 0.65 }),
      );
      ringB.rotation.x = Math.PI / 1.85;
      ringB.rotation.z = Math.PI / 5;
      group.add(ringB);

      const satellites = new THREE.Group();
      const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0x244136 });
      [
        [2.02, 0, 0],
        [-1.4, 1.25, 0.8],
        [0.6, -1.9, 0.5],
      ].forEach(([x, y, z]) => {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), satelliteMaterial);
        mesh.position.set(x, y, z);
        satellites.add(mesh);
      });
      group.add(satellites);

      const resize = () => {
        const width = host.clientWidth || 1;
        const height = host.clientHeight || 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(host);
      resize();

      let pointerX = 0;
      let pointerY = 0;
      let smoothX = 0;
      let smoothY = 0;
      const onPointerMove = (event: PointerEvent) => {
        pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = new THREE.Clock();
      let frame = 0;

      const animate = () => {
        const time = clock.getElapsedTime();
        if (!reduced) {
          smoothX += (pointerX - smoothX) * 0.035;
          smoothY += (pointerY - smoothY) * 0.035;
          group.rotation.y = time * 0.11 + smoothX * 0.24;
          group.rotation.x = Math.sin(time * 0.18) * 0.08 + smoothY * 0.18;
          ringA.rotation.z = time * 0.06;
          ringB.rotation.z = -time * 0.045;
          satellites.rotation.y = -time * 0.15;
        }
        renderer.render(scene, camera);
        if (!reduced) frame = requestAnimationFrame(animate);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        ico.dispose();
        wire.geometry.dispose();
        (wire.material as Three.Material).dispose();
        points.geometry.dispose();
        (points.material as Three.Material).dispose();
        core.geometry.dispose();
        (core.material as Three.Material).dispose();
        coreEdges.geometry.dispose();
        (coreEdges.material as Three.Material).dispose();
        ringA.geometry.dispose();
        (ringA.material as Three.Material).dispose();
        ringB.geometry.dispose();
        (ringB.material as Three.Material).dispose();
        satellites.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
          }
        });
        satelliteMaterial.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement.parentElement === host) {
          host.removeChild(renderer.domElement);
        }
      };
    };

    boot().catch(() => {
      // The static orbit behind the canvas remains as a graceful fallback.
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className={`agent-core${className ? ` ${className}` : ""}`} aria-hidden="true">
      <svg className="agent-core__orbit" viewBox="0 0 600 600" fill="none">
        <circle cx="300" cy="300" r="232" stroke="var(--line)" strokeDasharray="2 8" />
        <circle cx="300" cy="300" r="284" stroke="var(--line)" strokeDasharray="1 12" />
        <circle cx="300" cy="300" r="164" stroke="var(--line)" strokeDasharray="2 6" />
        <path d="M300 18v30M300 552v30M18 300h30M552 300h30" stroke="var(--line-strong)" />
        <circle cx="300" cy="68" r="4" fill="var(--clay)" />
        <circle cx="532" cy="300" r="3" fill="var(--moss)" />
        <circle cx="146" cy="442" r="3" fill="var(--ochre)" />
        <path d="M300 232v136M232 300h136" stroke="var(--line)" strokeDasharray="2 6" />
      </svg>
      <div className="agent-core__canvas" ref={hostRef} />
      <span className="agent-core__label mono">DEEPSI / CORE 01</span>
    </div>
  );
}
