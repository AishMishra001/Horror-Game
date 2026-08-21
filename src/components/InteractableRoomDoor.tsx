'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

function playDoorSound() {
  if (typeof window === 'undefined') return;
  const audio = new Audio('/stairs and doors.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
}

interface InteractableRoomDoorProps {
  position: [number, number, number];
  rotY?: number;
  woodTex: THREE.Texture;
  doorName?: string;
}

export default function InteractableRoomDoor({
  position,
  rotY = 0,
  woodTex,
  doorName = 'Door',
}: InteractableRoomDoorProps) {
  const setInteractPrompt = useGameStore((s) => s.setInteractPrompt);
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const canInteractRef = useRef(false);

  const leftPivotRef = useRef<THREE.Group>(null);
  const rightPivotRef = useRef<THREE.Group>(null);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const targetLeft = isOpen ? -Math.PI / 1.75 : 0;
    const targetRight = isOpen ? Math.PI / 1.75 : 0;
    const lerpFactor = Math.min(1, delta * 5.0);

    if (leftPivotRef.current) {
      const diff = targetLeft - leftPivotRef.current.rotation.y;
      if (Math.abs(diff) > 0.002) {
        leftPivotRef.current.rotation.y += diff * lerpFactor;
      }
    }
    if (rightPivotRef.current) {
      const diff = targetRight - rightPivotRef.current.rotation.y;
      if (Math.abs(diff) > 0.002) {
        rightPivotRef.current.rotation.y += diff * lerpFactor;
      }
    }
  });

  useEffect(() => {
    const handleKey = (evt: KeyboardEvent) => {
      if (evt.code === 'KeyE' && canInteractRef.current) {
        playDoorSound();
        const next = !isOpenRef.current;
        setIsOpen(next);
        isOpenRef.current = next;
        setInteractPrompt(next ? `Press E to Close ${doorName}` : `Press E to Open ${doorName}`);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [doorName, setInteractPrompt]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* ── Timber Doorframe Moldings ── */}
      {/* Left Jam Post */}
      <mesh position={[0, 1.5, -1.2]} receiveShadow>
        <boxGeometry args={[0.42, 3.0, 0.12]} />
        <meshStandardMaterial color="#1a0f0a" map={woodTex} roughness={0.75} />
      </mesh>
      {/* Right Jam Post */}
      <mesh position={[0, 1.5, 1.2]} receiveShadow>
        <boxGeometry args={[0.42, 3.0, 0.12]} />
        <meshStandardMaterial color="#1a0f0a" map={woodTex} roughness={0.75} />
      </mesh>
      {/* Top Header Trim */}
      <mesh position={[0, 3.01, 0]} receiveShadow>
        <boxGeometry args={[0.44, 0.14, 2.52]} />
        <meshStandardMaterial color="#1a0f0a" map={woodTex} roughness={0.75} />
      </mesh>

      {/* ── Left Door Leaf ── */}
      <group position={[0, 1.46, -1.14]} ref={leftPivotRef}>
        <mesh position={[0, 0, 0.57]} receiveShadow>
          <boxGeometry args={[0.08, 2.88, 1.13]} />
          <meshStandardMaterial color="#2d180e" map={woodTex} roughness={0.7} />
        </mesh>
        {/* Brass Handle */}
        <mesh position={[0.05, -0.05, 1.02]}>
          <boxGeometry args={[0.012, 0.28, 0.06]} />
          <meshStandardMaterial color="#967830" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* ── Right Door Leaf ── */}
      <group position={[0, 1.46, 1.14]} ref={rightPivotRef}>
        <mesh position={[0, 0, -0.57]} receiveShadow>
          <boxGeometry args={[0.08, 2.88, 1.13]} />
          <meshStandardMaterial color="#2d180e" map={woodTex} roughness={0.7} />
        </mesh>
        {/* Brass Handle */}
        <mesh position={[0.05, -0.05, -1.02]}>
          <boxGeometry args={[0.012, 0.28, 0.06]} />
          <meshStandardMaterial color="#967830" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* ── Solid Doorway Barrier Collider (Active only when closed) ── */}
      {!isOpen && (
        <RigidBody type="fixed" colliders="cuboid" position={[0, 1.46, 0]}>
          <mesh visible={false}>
            <boxGeometry args={[0.3, 2.9, 2.3]} />
          </mesh>
        </RigidBody>
      )}

      {/* ── Interaction Trigger Zone ── */}
      <RigidBody
        type="fixed"
        position={[0, 1.46, 0]}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = true;
            setInteractPrompt(isOpenRef.current ? `Press E to Close ${doorName}` : `Press E to Open ${doorName}`);
          }
        }}
        onIntersectionExit={(e) => {
          if (e.other.rigidBodyObject?.name === 'player') {
            canInteractRef.current = false;
            setInteractPrompt(null);
          }
        }}
      >
        <CuboidCollider args={[2.0, 1.5, 2.0]} />
      </RigidBody>
    </group>
  );
}
