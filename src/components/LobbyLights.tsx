'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SingleLobbyHangingLampProps {
  position: [number, number, number];
  ceilingY?: number;
  flickerSpeed?: number;
  flickerOffset?: number;
  swayRate?: number;
  swayMagnitude?: number;
  baseIntensity?: number;
  color?: string;
}

function SingleLobbyHangingLamp({
  position,
  ceilingY = 9.8,
  flickerSpeed = 1.0,
  flickerOffset = 0,
  swayRate = 1.0,
  swayMagnitude = 0.025,
  baseIntensity = 32,
  color = '#ff9933',
}: SingleLobbyHangingLampProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const bulbMeshRef = useRef<THREE.Mesh>(null);

  const chainLength = ceilingY - position[1];

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime * flickerSpeed + flickerOffset;

    // 1. Spooky Physical Sway (Cold draft through the mansion)
    if (groupRef.current) {
      const swayTime = state.clock.elapsedTime * swayRate + flickerOffset;
      groupRef.current.rotation.z = Math.sin(swayTime * 0.8) * swayMagnitude;
      groupRef.current.rotation.x = Math.cos(swayTime * 0.6) * (swayMagnitude * 0.7);
    }

    // 2. Dynamic Organic Voltage Dim-and-Bright Logic
    if (lightRef.current && bulbMeshRef.current) {
      const noise = Math.sin(time * 2.5) * 0.25 + Math.sin(time * 7.1) * 0.15;
      const flickerMult = 1.0 + noise;

      const currentInt = lightRef.current.intensity;
      const targetInt = baseIntensity * Math.max(0.1, flickerMult);
      lightRef.current.intensity = THREE.MathUtils.lerp(currentInt, targetInt, delta * 8);

      const mat = bulbMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = THREE.MathUtils.clamp(lightRef.current.intensity / baseIntensity, 0.2, 2.0);
      }
    }
  });

  return (
    <group position={[position[0], ceilingY, position[2]]}>
      {/* Ceiling Mounting Bracket */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.08, 8]} />
        <meshStandardMaterial color="#181410" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Hanging Pivot Group */}
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Streamlined Iron Suspension Rod (replaces 12 separate torus meshes) */}
        <mesh position={[0, -chainLength / 2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, chainLength, 6]} />
          <meshStandardMaterial color="#1a1816" metalness={0.9} roughness={0.5} />
        </mesh>

        {/* Decorative Suspension Rings */}
        <mesh position={[0, -chainLength * 0.33, 0]}>
          <torusGeometry args={[0.035, 0.01, 6, 8]} />
          <meshStandardMaterial color="#221e1a" metalness={0.9} />
        </mesh>
        <mesh position={[0, -chainLength * 0.66, 0]}>
          <torusGeometry args={[0.035, 0.01, 6, 8]} />
          <meshStandardMaterial color="#221e1a" metalness={0.9} />
        </mesh>

        {/* Gothic Cage Fixture */}
        <group position={[0, -chainLength, 0]}>
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.09, 0.22, 0.12, 8]} />
            <meshStandardMaterial color="#221c16" metalness={0.85} roughness={0.4} />
          </mesh>

          {/* Combined Cage Body */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.28, 6, 1, true]} />
            <meshStandardMaterial color="#1a1612" metalness={0.9} wireframe />
          </mesh>

          <mesh position={[0, -0.12, 0]}>
            <torusGeometry args={[0.22, 0.014, 6, 10]} />
            <meshStandardMaterial color="#221c16" metalness={0.85} />
          </mesh>

          {/* Filament Bulb */}
          <mesh ref={bulbMeshRef} position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial
              color="#ffeedd"
              emissive={color}
              emissiveIntensity={1.2}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Point Light (castShadow is strictly false for 60FPS performance) */}
          <pointLight
            ref={lightRef}
            position={[0, 0, 0]}
            color={color}
            intensity={baseIntensity}
            distance={18}
            castShadow={false}
          />
        </group>
      </group>
    </group>
  );
}

export default function LobbyLights() {
  return (
    <group>
      {/* 1. Main Central Grand Chandelier */}
      <SingleLobbyHangingLamp
        position={[0, 4.2, -6]}
        ceilingY={9.8}
        flickerSpeed={1.2}
        flickerOffset={0}
        swayRate={0.9}
        swayMagnitude={0.03}
        baseIntensity={34}
        color="#ff9944"
      />

      {/* 2. Grand Staircase Base Hanging Light */}
      <SingleLobbyHangingLamp
        position={[0, 4.8, 6]}
        ceilingY={9.8}
        flickerSpeed={0.85}
        flickerOffset={2.5}
        swayRate={0.75}
        swayMagnitude={0.025}
        baseIntensity={28}
        color="#ff8833"
      />

      {/* 3. Upper Mezzanine Balcony Light */}
      <SingleLobbyHangingLamp
        position={[0, 7.8, 14]}
        ceilingY={9.8}
        flickerSpeed={1.1}
        flickerOffset={11.4}
        swayRate={0.7}
        swayMagnitude={0.025}
        baseIntensity={24}
        color="#ff8844"
      />
    </group>
  );
}

