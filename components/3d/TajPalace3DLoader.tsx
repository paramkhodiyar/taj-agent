'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface TajPalace3DLoaderProps {
  onAssembled?: () => void;
  speedMultiplier?: number;
  autoReassemble?: boolean;
}

interface ArchitecturalPart {
  mesh: THREE.Mesh;
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  startPos: THREE.Vector3;
  startRot: THREE.Euler;
  delay: number; // Staggered flight delay
  category: 'foundation' | 'facade' | 'dome' | 'crest' | 'turret' | 'arch';
}

/**
 * TajPalace3DLoader — Three.js Procedural 3D Architectural Assembly
 * 
 * Concept:
 * - Over 150 architectural blocks, domes, arches, and the Taj crest start
 *   scattered in randomized 3D directions in space.
 * - Smooth physics-guided interpolation flies each element inward along
 *   random arcs to construct the iconic Taj Palace facade and grand domes.
 * - Features metallic gold and burgundy PBR shaders, dynamic point lights,
 *   floating ambient dust particles, and full mouse/touch 3D orbit controls.
 */
export const TajPalace3DLoader: React.FC<TajPalace3DLoaderProps> = ({
  onAssembled,
  speedMultiplier = 1,
  autoReassemble = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Scattering architectural elements…');
  const [isAssembled, setIsAssembled] = useState(false);

  // Controls refs to expose actions to parent/buttons
  const triggerReassembleRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a060d, 0.025);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Taj Royal Palette: Warm Gold, Soft Ivory, Deep Burgundy Rim)
    const ambientLight = new THREE.AmbientLight(0xffecd1, 0.9);
    scene.add(ambientLight);

    const mainGoldLight = new THREE.DirectionalLight(0xd4af37, 2.5);
    mainGoldLight.position.set(10, 15, 12);
    scene.add(mainGoldLight);

    const blueBackLight = new THREE.DirectionalLight(0xb88e2e, 1.2);
    blueBackLight.position.set(-10, -5, -10);
    scene.add(blueBackLight);

    const centerGlow = new THREE.PointLight(0xffd700, 3, 20);
    centerGlow.position.set(0, 3, 2);
    scene.add(centerGlow);

    // 3. Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x332200,
      emissiveIntensity: 0.2,
    });

    const domeBurgundyMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a1827,
      metalness: 0.6,
      roughness: 0.35,
      emissive: 0x22050b,
      emissiveIntensity: 0.3,
    });

    const creamStoneMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5efe6,
      metalness: 0.15,
      roughness: 0.65,
    });

    const darkTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0x380e18,
      metalness: 0.5,
      roughness: 0.4,
    });

    const crestGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xb88e2e,
      emissiveIntensity: 0.6,
    });

    // 4. Build the Taj Palace Blueprint
    const parts: ArchitecturalPart[] = [];
    const palaceGroup = new THREE.Group();
    scene.add(palaceGroup);

    // Helper to generate random spherical starting positions
    const getRandomStartPos = (radius = 22) => {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius + 10;
      const sinPhi = Math.sin(phi);
      return new THREE.Vector3(
        r * sinPhi * Math.cos(theta),
        r * sinPhi * Math.sin(theta) + 3,
        r * Math.cos(phi)
      );
    };

    const getRandomStartRot = () => {
      return new THREE.Euler(
        (Math.random() - 0.5) * Math.PI * 4,
        (Math.random() - 0.5) * Math.PI * 4,
        (Math.random() - 0.5) * Math.PI * 4
      );
    };

    const registerPart = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      targetPos: THREE.Vector3,
      targetRot: THREE.Euler,
      category: ArchitecturalPart['category'],
      delayOrder: number
    ) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const startPos = getRandomStartPos();
      const startRot = getRandomStartRot();

      mesh.position.copy(startPos);
      mesh.rotation.copy(startRot);

      palaceGroup.add(mesh);

      parts.push({
        mesh,
        targetPos,
        targetRot,
        startPos,
        startRot,
        delay: delayOrder,
        category,
      });
    };

    // A. Foundation & Grand Podium
    const baseWidth = 14;
    const baseDepth = 4;
    for (let x = -6; x <= 6; x += 1.5) {
      for (let z = -1.5; z <= 1.5; z += 1.5) {
        registerPart(
          new THREE.BoxGeometry(1.4, 0.4, 1.4),
          creamStoneMaterial,
          new THREE.Vector3(x, -1.8, z),
          new THREE.Euler(0, 0, 0),
          'foundation',
          0.05 + Math.abs(x) * 0.04
        );
      }
    }

    // B. Main Palace Facade & Arches (Multi-Tier)
    // Left Wing, Center Pavilion, Right Wing
    for (let x = -5.5; x <= 5.5; x += 1.1) {
      const isCenter = Math.abs(x) < 1.8;
      const heightTiers = isCenter ? 4 : 3;

      for (let y = 0; y < heightTiers; y++) {
        const posY = -1.4 + y * 0.95;

        // Pillars
        registerPart(
          new THREE.CylinderGeometry(0.12, 0.12, 0.85, 8),
          goldMaterial,
          new THREE.Vector3(x, posY, 1.2),
          new THREE.Euler(0, 0, 0),
          'arch',
          0.3 + y * 0.15 + Math.abs(x) * 0.05
        );

        // Arched Window Pediment / Block
        registerPart(
          new THREE.BoxGeometry(0.9, 0.8, 0.6),
          isCenter ? domeBurgundyMaterial : darkTrimMaterial,
          new THREE.Vector3(x, posY, 0.6),
          new THREE.Euler(0, 0, 0),
          'facade',
          0.4 + y * 0.12 + Math.abs(x) * 0.04
        );
      }
    }

    // C. Center Grand Arch (The Iconic Taj Portal Entrance)
    registerPart(
      new THREE.TorusGeometry(1.2, 0.18, 8, 16, Math.PI),
      goldMaterial,
      new THREE.Vector3(0, 0.8, 1.3),
      new THREE.Euler(0, 0, 0),
      'arch',
      0.8
    );

    // D. Iconic Central Grand Onion Dome (Multi-Segment)
    const domeCenterY = 3.6;
    // Dome Base Drum
    registerPart(
      new THREE.CylinderGeometry(1.8, 2.0, 0.8, 16),
      goldMaterial,
      new THREE.Vector3(0, 2.7, 0.6),
      new THREE.Euler(0, 0, 0),
      'dome',
      1.1
    );

    // Onion Dome Body (Layered Spherical Segments)
    registerPart(
      new THREE.SphereGeometry(1.9, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.75),
      domeBurgundyMaterial,
      new THREE.Vector3(0, domeCenterY, 0.6),
      new THREE.Euler(0, 0, 0),
      'dome',
      1.25
    );

    // Dome Gold Ribs (4 decorative arches around the main dome)
    for (let r = 0; r < 4; r++) {
      const angle = (r * Math.PI) / 2;
      registerPart(
        new THREE.TorusGeometry(1.85, 0.08, 6, 12, Math.PI * 0.8),
        goldMaterial,
        new THREE.Vector3(0, domeCenterY, 0.6),
        new THREE.Euler(0, angle, 0),
        'dome',
        1.35 + r * 0.05
      );
    }

    // Dome Lotus Petal Crest Collar
    registerPart(
      new THREE.ConeGeometry(0.8, 1.1, 12),
      goldMaterial,
      new THREE.Vector3(0, domeCenterY + 1.6, 0.6),
      new THREE.Euler(0, 0, 0),
      'dome',
      1.5
    );

    // E. Left & Right Flanking Turret Domes (The Taj Mahal Palace Mumbai Wings)
    [-4.5, 4.5].forEach((wingX, i) => {
      // Turret Tower Base
      registerPart(
        new THREE.CylinderGeometry(0.8, 0.9, 2.8, 12),
        creamStoneMaterial,
        new THREE.Vector3(wingX, 0.8, 0.6),
        new THREE.Euler(0, 0, 0),
        'turret',
        0.9 + i * 0.1
      );

      // Flanking Domes
      registerPart(
        new THREE.SphereGeometry(1.0, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.75),
        domeBurgundyMaterial,
        new THREE.Vector3(wingX, 2.6, 0.6),
        new THREE.Euler(0, 0, 0),
        'turret',
        1.2 + i * 0.1
      );

      // Flanking Spires
      registerPart(
        new THREE.ConeGeometry(0.2, 0.8, 8),
        goldMaterial,
        new THREE.Vector3(wingX, 3.4, 0.6),
        new THREE.Euler(0, 0, 0),
        'turret',
        1.4 + i * 0.1
      );
    });

    // F. The Sovereign Taj Crest Emblem (Floating at the Crown with Golden Radiance)
    const crestRadius = 0.55;
    registerPart(
      new THREE.TorusGeometry(crestRadius, 0.08, 12, 24),
      crestGoldMaterial,
      new THREE.Vector3(0, domeCenterY + 2.4, 0.6),
      new THREE.Euler(0, 0, 0),
      'crest',
      1.75
    );

    // Royal Crown / Trefoil Finial inside Crest
    registerPart(
      new THREE.OctahedronGeometry(0.3, 0),
      crestGoldMaterial,
      new THREE.Vector3(0, domeCenterY + 2.4, 0.6),
      new THREE.Euler(Math.PI / 4, Math.PI / 4, 0),
      'crest',
      1.85
    );

    // 5. Golden Stardust Ambient Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePositions[p] = (Math.random() - 0.5) * 30;
      particlePositions[p + 1] = (Math.random() - 0.5) * 20 + 2;
      particlePositions[p + 2] = (Math.random() - 0.5) * 25;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.15,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Interactive Orbit & Mouse Parallax
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.1;
    let rotY = 0;
    let targetRotY = 0;
    let targetRotX = 0.1;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      targetRotY += deltaX * 0.008;
      targetRotX = Math.max(-0.2, Math.min(0.6, targetRotX + deltaY * 0.005));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 7. Animation State & Flight Logic
    let animClock = 0;
    let assembling = true;
    let assembledNotified = false;

    const triggerReassemble = () => {
      animClock = 0;
      assembling = true;
      assembledNotified = false;
      setIsAssembled(false);

      // Re-scatter elements to new random positions
      parts.forEach((part) => {
        part.startPos = getRandomStartPos();
        part.startRot = getRandomStartRot();
        part.mesh.position.copy(part.startPos);
        part.mesh.rotation.copy(part.startRot);
      });
    };

    triggerReassembleRef.current = triggerReassemble;

    // 8. Main Render & Physics Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      animClock += 0.016 * speedMultiplier;

      // Smooth camera orbit damping
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;

      if (!isDragging) {
        // Continuous majestic auto-rotation once assembled
        targetRotY += 0.003;
      }

      palaceGroup.rotation.y = rotY;
      palaceGroup.rotation.x = rotX;

      // Float ambient particles
      particleSystem.rotation.y += 0.0008;

      // Interpolate each part toward target based on staggered delay
      let allSettled = true;
      let assembledCount = 0;

      parts.forEach((part) => {
        const partTime = Math.max(0, animClock - part.delay);
        const flightDuration = 1.6; // seconds per part
        const t = Math.min(1, partTime / flightDuration);

        // Smooth cubic ease out
        const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
        const easeT = easeOutCubic(t);

        part.mesh.position.lerpVectors(part.startPos, part.targetPos, easeT);

        // Slerp rotation
        part.mesh.rotation.x = THREE.MathUtils.lerp(part.startRot.x, part.targetRot.x, easeT);
        part.mesh.rotation.y = THREE.MathUtils.lerp(part.startRot.y, part.targetRot.y, easeT);
        part.mesh.rotation.z = THREE.MathUtils.lerp(part.startRot.z, part.targetRot.z, easeT);

        if (t < 0.98) {
          allSettled = false;
        } else {
          assembledCount++;
        }
      });

      const currentProgress = Math.round((assembledCount / parts.length) * 100);
      setProgress(currentProgress);

      if (currentProgress < 25) {
        setStatusText('Aligning foundations & royal podium…');
      } else if (currentProgress < 65) {
        setStatusText('Constructing multi-tier colonnades & Saracenic arches…');
      } else if (currentProgress < 90) {
        setStatusText('Forming majestic grand domes & Victorian turrets…');
      } else if (currentProgress < 100) {
        setStatusText('Affixing Taj royal sovereign crest finial…');
      } else {
        setStatusText('Taj Palace Fully Assembled • Live Intelligence Ready');
      }

      if (allSettled && assembling) {
        assembling = false;
        setIsAssembled(true);
        if (!assembledNotified) {
          assembledNotified = true;
          if (onAssembled) onAssembled();
        }

        if (autoReassemble) {
          // Optional subtle breather before auto-reassembling if requested
        }
      }

      // Center light subtle breathing effect
      centerGlow.intensity = 2.2 + Math.sin(animClock * 3) * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [speedMultiplier]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Three.js 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-[480px] sm:h-[560px] cursor-grab active:cursor-grabbing" />

      {/* Luxury Telemetry HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-taj-gold/30 px-3.5 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-taj-gold animate-ping" />
          <span className="font-serif text-[11px] tracking-widest text-taj-gold uppercase font-semibold">
            3D Palace Assembly Engine
          </span>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-taj-gray-border/30 px-3 py-1.5 rounded-full text-[11px] text-taj-cream font-mono">
          {progress}% COMPLETED
        </div>
      </div>

      {/* Bottom Status & Reassembly Trigger */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 rounded-2xl pointer-events-none">
        <div className="text-center sm:text-left space-y-0.5">
          <p className="text-xs font-serif text-white tracking-wide">
            {statusText}
          </p>
          <p className="text-[10px] text-taj-cream/70 font-sans">
            Drag to orbit in 3D • Dynamic PBR Gold Shaders • Over 150 Architectural Voxels
          </p>
        </div>

        <button
          type="button"
          onClick={() => triggerReassembleRef.current()}
          className="pointer-events-auto px-4 py-2 bg-taj-burgundy hover:bg-taj-burgundy-deep text-white border border-taj-gold/50 rounded-xl text-xs font-serif font-medium tracking-wider uppercase shadow-lg active:scale-95 transition-all"
        >
          ↻ Reassemble 3D Palace
        </button>
      </div>
    </div>
  );
};
