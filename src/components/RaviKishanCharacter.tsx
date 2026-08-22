'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils, Texture, Vector2 } from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.preload('/models/ravi_kishan_character.glb');

interface RaviKishanCharacterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isDancing?: boolean;
}

export default function RaviKishanCharacter({
  position = [0, 0, -2.5],
  rotation = [0, 0, 0],
  scale = 1.0,
  isDancing = false,
}: RaviKishanCharacterProps) {
  const rootGroupRef = useRef<Group>(null);
  const characterGroupRef = useRef<Group>(null);

  // Master Photorealistic Texture Atlas, Normal Map & Roughness Map
  const [atlasTex, normalTex, roughnessTex] = useTexture([
    '/textures/ravi/ravi_character_atlas.jpg',
    '/textures/ravi/ravi_character_normal.jpg',
    '/textures/ravi/ravi_character_roughness.jpg',
  ], (textures) => {
    const [diffuse, normal, rough] = textures as Texture[];
    diffuse.colorSpace = THREE.SRGBColorSpace;
    diffuse.flipY = false;
    normal.colorSpace = THREE.NoColorSpace;
    normal.flipY = false;
    rough.colorSpace = THREE.NoColorSpace;
    rough.flipY = false;
  });

  // Load Sculpted Humanoid Model
  const { scene } = useGLTF('/models/ravi_kishan_character.glb');

  // Pre-allocate normal scale vector
  const normalScaleVec = useMemo(() => new Vector2(0.85, 0.85), []);

  // Clone scene & assign high-fidelity PBR materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        mesh.material = new THREE.MeshStandardMaterial({
          map: atlasTex,
          normalMap: normalTex,
          normalScale: normalScaleVec,
          roughnessMap: roughnessTex,
          roughness: 0.52,
          metalness: 0.12,
        });
      }
    });
    return clone;
  }, [scene, atlasTex, normalTex, roughnessTex, normalScaleVec]);

  // Pre-allocated vectors for 60 FPS zero GC
  const playerPos = useRef(new Vector3());
  const selfWorldPos = useRef(new Vector3());
  const toPlayerVec = useRef(new Vector3());

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;
    const camera = state.camera;

    if (!rootGroupRef.current || !characterGroupRef.current) return;

    if (!isDancing) {
      // ═════════════════════════════════════════════════════════════════════
      // MICHAEL JACKSON STYLE MENACING HORROR SWAGGER IDLE (Zero-GC)
      // ═════════════════════════════════════════════════════════════════════
      const breathFreq = 1.35;
      const breath = Math.sin(time * breathFreq);
      const swayFreq = 0.5;
      const sway = Math.sin(time * swayFreq);
      const microTwitch = Math.sin(time * 26.0) * (Math.sin(time * 4.5) > 0.88 ? 0.007 : 0);

      // 1. Dynamic Weight Shift & Respiration
      characterGroupRef.current.position.y = breath * 0.007;
      characterGroupRef.current.position.x = sway * 0.016 + microTwitch;

      // Respiration breathing scale
      characterGroupRef.current.scale.set(
        scale * (1.0 + breath * 0.012),
        scale * (1.0 + breath * 0.006),
        scale * (1.0 + breath * 0.016)
      );

      // 2. Intelligent Sinister Head / Body Tracking
      rootGroupRef.current.getWorldPosition(selfWorldPos.current);
      playerPos.current.set(camera.position.x, camera.position.y, camera.position.z);
      toPlayerVec.current.subVectors(playerPos.current, selfWorldPos.current).normalize();

      const yawAngle = Math.atan2(toPlayerVec.current.x, toPlayerVec.current.z) - rotation[1];
      const clampedYaw = MathUtils.clamp(yawAngle, -0.65, 0.65);
      const clampedPitch = MathUtils.clamp(toPlayerVec.current.y * 0.28, -0.22, 0.22);

      const swaggerTilt = 0.035 + Math.sin(time * 0.65) * 0.025;

      characterGroupRef.current.rotation.y = MathUtils.lerp(characterGroupRef.current.rotation.y, clampedYaw, delta * 3.5);
      characterGroupRef.current.rotation.x = MathUtils.lerp(characterGroupRef.current.rotation.x, clampedPitch, delta * 3.5);
      characterGroupRef.current.rotation.z = swaggerTilt + microTwitch * 2.0;
    }
  });

  return (
    <group ref={rootGroupRef} position={position} rotation={rotation}>
      
      {/* ═══ CINEMATIC HORROR LIGHTING (60 FPS - ZERO SHADOW MAP) ════════════ */}
      {/* Front Key Light facing upper body (+Z) */}
      <pointLight position={[0, 1.65, 1.2]} intensity={4.8} distance={6} color="#fff6e8" castShadow={false} />
      {/* Lower Fill Light for pants and shoes */}
      <pointLight position={[0, 0.55, 1.0]} intensity={3.2} distance={5} color="#e2e8f0" castShadow={false} />
      {/* Cool Azure Rim Silhouette Light (-Z) */}
      <pointLight position={[0, 2.3, -1.4]} intensity={6.0} distance={6} color="#60a5fa" castShadow={false} />

      {/* ═══ 3D SCULPTED CHARACTER MODEL ═══════════════════════════════════ */}
      <group ref={characterGroupRef}>
        <primitive object={clonedScene} />

        {/* Piercing Glowing Horror Eyes in Sockets */}
        <group position={[0, 1.64, 0.136]}>
          {/* Left Eye */}
          <group position={[-0.040, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.0075, 8, 8]} />
              <meshBasicMaterial color="#ffcc00" />
            </mesh>
            <mesh position={[0, 0, 0.003]}>
              <sphereGeometry args={[0.0035, 6, 6]} />
              <meshBasicMaterial color="#ff1100" />
            </mesh>
          </group>

          {/* Right Eye */}
          <group position={[0.040, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.0075, 8, 8]} />
              <meshBasicMaterial color="#ffcc00" />
            </mesh>
            <mesh position={[0, 0, 0.003]}>
              <sphereGeometry args={[0.0035, 6, 6]} />
              <meshBasicMaterial color="#ff1100" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
