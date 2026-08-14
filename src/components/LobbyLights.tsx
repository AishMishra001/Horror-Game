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
  castShadow?: boolean;
}

function SingleLobbyHangingLamp({
  position,
  ceilingY = 9.8,
  flickerSpeed = 1.0,
  flickerOffset = 0,
  swayRate = 1.0,
  swayMagnitude = 0.03,
  baseIntensity = 32,
  color = '#ff9933',
  castShadow = false,
}: SingleLobbyHangingLampProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const bulbMeshRef = useRef<THREE.Mesh>(null);

  const chainLength = ceilingY - position[1];
  const chainSegments = Math.max(3, Math.floor(chainLength / 0.5));

  useFrame((state) => {
    const time = state.clock.elapsedTime * flickerSpeed + flickerOffset;

    // 1. Spooky Physical Sway (Cold draft through the mansion)
    if (groupRef.current) {
      const swayTime = state.clock.elapsedTime * swayRate + flickerOffset;
      groupRef.current.rotation.z = Math.sin(swayTime * 0.8) * swayMagnitude;
      groupRef.current.rotation.x = Math.cos(swayTime * 0.6) * (swayMagnitude * 0.7);
    }

    // 2. Dynamic Organic Voltage Dim-and-Bright Logic
    if (lightRef.current && bulbMeshRef.current) {
      const noise =
        Math.sin(time * 2.5) * 0.3 +
        Math.sin(time * 7.1) * 0.2 +
        Math.sin(time * 13.7) * 0.15;

      let flickerMult = 1.0 + noise;

      const rand = Math.random();
      if (rand > 0.97) {
        flickerMult = 0.08 + Math.random() * 0.2;
      } else if (rand > 0.92) {
        flickerMult = 1.7 + Math.random() * 0.6;
      }

      const currentInt = lightRef.current.intensity;
      const targetInt = baseIntensity * Math.max(0.05, flickerMult);
      const lerpedInt = THREE.MathUtils.lerp(currentInt, targetInt, 0.4);

      lightRef.current.intensity = lerpedInt;

      const mat = bulbMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = THREE.MathUtils.clamp(lerpedInt / baseIntensity, 0.1, 2.2);
      }
    }
  });

  return (
    <group position={[position[0], ceilingY, position[2]]}>
      {/* Ceiling Mounting Bracket */}
      <mesh position={[0, -0.04, 0]} castShadow={false}>
        <cylinderGeometry args={[0.14, 0.16, 0.08, 10]} />
        <meshStandardMaterial color="#181410" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Hanging Pivot Group */}
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Iron Chain Links */}
        {Array.from({ length: chainSegments }).map((_, i) => {
          const yPos = -((i + 0.5) * (chainLength / chainSegments));
          return (
            <mesh
              key={`chain-${i}`}
              position={[0, yPos, 0]}
              rotation={[0, (i % 2) * (Math.PI / 2), 0]}
              castShadow={false}
            >
              <torusGeometry args={[0.04, 0.012, 6, 8]} />
              <meshStandardMaterial color="#1a1816" metalness={0.9} roughness={0.5} />
            </mesh>
          );
        })}

        {/* Gothic Cage Fixture */}
        <group position={[0, -chainLength, 0]}>
          <mesh position={[0, 0.35, 0]} castShadow={false}>
            <torusGeometry args={[0.05, 0.012, 6, 10]} />
            <meshStandardMaterial color="#221e1a" metalness={0.9} />
          </mesh>

          <mesh position={[0, 0.26, 0]} castShadow={false}>
            <cylinderGeometry args={[0.09, 0.25, 0.12, 10]} />
            <meshStandardMaterial color="#221c16" metalness={0.85} roughness={0.4} />
          </mesh>

          {/* Protective Iron Cage Struts */}
          {Array.from({ length: 5 }).map((_, idx) => {
            const angle = (idx / 5) * Math.PI * 2;
            const cx = Math.cos(angle) * 0.22;
            const cz = Math.sin(angle) * 0.22;
            return (
              <mesh key={`strut-${idx}`} position={[cx, 0.06, cz]} castShadow={false}>
                <cylinderGeometry args={[0.01, 0.01, 0.34, 6]} />
                <meshStandardMaterial color="#1a1612" metalness={0.9} />
              </mesh>
            );
          })}

          <mesh position={[0, -0.12, 0]} castShadow={false}>
            <torusGeometry args={[0.22, 0.014, 6, 12]} />
            <meshStandardMaterial color="#221c16" metalness={0.85} />
          </mesh>

          {/* Filament Bulb */}
          <mesh ref={bulbMeshRef} position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial
              color="#ffeedd"
              emissive={color}
              emissiveIntensity={1.2}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Point Light */}
          <pointLight
            ref={lightRef}
            position={[0, 0, 0]}
            color={color}
            intensity={baseIntensity}
            distance={20}
            castShadow={castShadow}
            shadow-mapSize={[512, 512]}
            shadow-bias={-0.0005}
          />
        </group>
      </group>
    </group>
  );
}

export default function LobbyLights() {
  return (
    <group>
      {/* 1. Main Central Grand Chandelier (Casts shadows) */}
      <SingleLobbyHangingLamp
        position={[0, 4.2, -6]}
        ceilingY={9.8}
        flickerSpeed={1.2}
        flickerOffset={0}
        swayRate={0.9}
        swayMagnitude={0.03}
        baseIntensity={36}
        color="#ff9944"
        castShadow={true}
      />

      {/* 2. Grand Staircase Base Hanging Light */}
      <SingleLobbyHangingLamp
        position={[0, 4.8, 6]}
        ceilingY={9.8}
        flickerSpeed={0.85}
        flickerOffset={2.5}
        swayRate={0.75}
        swayMagnitude={0.025}
        baseIntensity={30}
        color="#ff8833"
        castShadow={false}
      />

      {/* 3. Lobby Left Wing Entrance Light */}
      <SingleLobbyHangingLamp
        position={[-5, 3.8, -3]}
        ceilingY={9.8}
        flickerSpeed={1.4}
        flickerOffset={5.1}
        swayRate={1.1}
        swayMagnitude={0.035}
        baseIntensity={26}
        color="#ffaa55"
        castShadow={false}
      />

      {/* 4. Lobby Right Wing Hanging Light */}
      <SingleLobbyHangingLamp
        position={[5, 3.8, -3]}
        ceilingY={9.8}
        flickerSpeed={0.95}
        flickerOffset={8.2}
        swayRate={0.8}
        swayMagnitude={0.025}
        baseIntensity={26}
        color="#ff7733"
        castShadow={false}
      />

      {/* 5. Upper Mezzanine Balcony Light */}
      <SingleLobbyHangingLamp
        position={[0, 7.8, 14]}
        ceilingY={9.8}
        flickerSpeed={1.1}
        flickerOffset={11.4}
        swayRate={0.7}
        swayMagnitude={0.025}
        baseIntensity={22}
        color="#ff8844"
        castShadow={false}
      />
    </group>
  );
}
