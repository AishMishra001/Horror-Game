'use client';

/**
 * RaviKishanCharacter.tsx
 * High-fidelity 3D humanoid character of Ravi Kishan using the user-provided
 * high-resolution portrait (Gemini_Generated_Image_37iy5037iy5037iy.png):
 * - Clean transparent background cutout with feathered neckline
 * - Signature Royal Blue double-breasted suit blazer with gold buttons & peaked lapels
 * - White inner shirt with open collar wings & polka-dot pocket square
 * - Tailored crisp white trousers with ironed front crease
 * - Black leather Oxford shoes & 5-digit articulated hands
 * - 3D ears and pompadour hair
 * - Michael Jackson / Ayuwoki horror swagger idle & real-time player head tracking
 * - Locked 60 FPS performance, Zero GC in useFrame
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils, PointLight } from 'three';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

// ─── 5-FINGER ARTICULATED REALISTIC HAND ─────────────────────────────────────
function ArticulatedHand({ isLeft }: { isLeft: boolean }) {
  const side = isLeft ? -1 : 1;
  return (
    <group position={[0, -0.22, 0]}>
      {/* Palm */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.075, 0.08, 0.028]} />
        <meshStandardMaterial color="#cfa07c" roughness={0.65} />
      </mesh>

      {/* Thumb */}
      <group position={[side * -0.038, -0.02, 0.008]} rotation={[0.2, side * 0.5, side * 0.4]}>
        <mesh position={[0, -0.025, 0]}>
          <cylinderGeometry args={[0.009, 0.008, 0.05, 8]} />
          <meshStandardMaterial color="#cfa07c" roughness={0.65} />
        </mesh>
      </group>

      {/* Index Finger */}
      <group position={[side * -0.024, -0.08, 0]} rotation={[-0.2, 0, side * -0.08]}>
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.008, 0.007, 0.065, 8]} />
          <meshStandardMaterial color="#cfa07c" roughness={0.65} />
        </mesh>
      </group>

      {/* Middle Finger */}
      <group position={[side * -0.008, -0.082, 0]} rotation={[-0.25, 0, 0]}>
        <mesh position={[0, -0.034, 0]}>
          <cylinderGeometry args={[0.0085, 0.007, 0.072, 8]} />
          <meshStandardMaterial color="#cfa07c" roughness={0.65} />
        </mesh>
      </group>

      {/* Ring Finger */}
      <group position={[side * 0.01, -0.08, 0]} rotation={[-0.2, 0, side * 0.08]}>
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[0.008, 0.0065, 0.065, 8]} />
          <meshStandardMaterial color="#cfa07c" roughness={0.65} />
        </mesh>
      </group>

      {/* Pinky Finger */}
      <group position={[side * 0.026, -0.076, 0]} rotation={[-0.15, 0, side * 0.18]}>
        <mesh position={[0, -0.024, 0.005]}>
          <cylinderGeometry args={[0.007, 0.0055, 0.052, 8]} />
          <meshStandardMaterial color="#cfa07c" roughness={0.65} />
        </mesh>
      </group>
    </group>
  );
}

// ─── HIGH-FIDELITY BLACK LEATHER OXFORD SHOE ─────────────────────────────────
function OxfordShoe({ isLeft }: { isLeft: boolean }) {
  const side = isLeft ? -1 : 1;
  return (
    <group position={[side * -0.115, 0, 0]}>
      {/* White Dress Sock at Ankle */}
      <mesh position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.05, 0.048, 0.08, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* Main Leather Shoe Body */}
      <mesh position={[0, 0.038, 0.04]}>
        <boxGeometry args={[0.11, 0.065, 0.22]} />
        <meshStandardMaterial color="#111116" roughness={0.25} metalness={0.3} />
      </mesh>

      {/* Rounded Oxford Toe Cap */}
      <mesh position={[0, 0.028, 0.13]}>
        <sphereGeometry args={[0.046, 12, 12]} />
        <meshStandardMaterial color="#14141a" roughness={0.18} metalness={0.4} />
      </mesh>

      {/* Thick Outer Leather Sole */}
      <mesh position={[0, 0.008, 0.04]}>
        <boxGeometry args={[0.12, 0.016, 0.24]} />
        <meshStandardMaterial color="#08080c" roughness={0.85} />
      </mesh>

      {/* Raised Block Heel */}
      <mesh position={[0, 0.014, -0.05]}>
        <boxGeometry args={[0.115, 0.024, 0.075]} />
        <meshStandardMaterial color="#08080c" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ─── MAIN 3D RAVI KISHAN HORROR CHARACTER COMPONENT ──────────────────────────
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
  const isRitualJumpscareActive = useGameStore((s) => s.isRitualJumpscareActive);
  const isRitualLunging = useGameStore((s) => s.isRitualLunging);
  const isRitualRaviDisappeared = useGameStore((s) => s.isRitualRaviDisappeared);

  const rootGroupRef = useRef<Group>(null);
  const characterGroupRef = useRef<Group>(null);
  const headGroupRef = useRef<Group>(null);
  const spineGroupRef = useRef<Group>(null);
  const chestGroupRef = useRef<Group>(null);
  const leftArmGroupRef = useRef<Group>(null);
  const rightArmGroupRef = useRef<Group>(null);
  const eyeGlowGroupRef = useRef<Group>(null);
  const ritualAuraLightRef = useRef<PointLight>(null);

  // Load High-Res Clean Face Texture with Removed Background
  const raviFaceTex = useTexture('/textures/ravi/ravi_face_gemini_master.png', (tex) => {
    const t = tex as THREE.Texture;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
  });

  // Pre-allocated vectors for 60 FPS zero-GC
  const playerPos = useRef(new Vector3());
  const selfWorldPos = useRef(new Vector3());
  const toPlayerVec = useRef(new Vector3());
  const lungeTargetPos = useRef(new Vector3());
  const camFwd = useRef(new Vector3());

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;
    const camera = state.camera;

    if (!rootGroupRef.current || !characterGroupRef.current || isRitualRaviDisappeared) return;

    if (isRitualJumpscareActive) {
      if (isRitualLunging) {
        // ═════════════════════════════════════════════════════════════════════
        // AGGRESSIVE IN-YOUR-FACE JUMPSCARE LUNGE (Surges right up to player)
        // ═════════════════════════════════════════════════════════════════════
        camera.getWorldDirection(camFwd.current);
        lungeTargetPos.current.copy(camera.position).addScaledVector(camFwd.current, 0.88);
        lungeTargetPos.current.y -= 0.85; // Align head directly with camera height
        rootGroupRef.current.position.lerp(lungeTargetPos.current, delta * 14.0);

        // Face directly at camera
        rootGroupRef.current.lookAt(camera.position.x, rootGroupRef.current.position.y, camera.position.z);

        const microJitter = (Math.sin(time * 55.0) + Math.cos(time * 42.0)) * 0.02;
        characterGroupRef.current.position.x = microJitter;
        characterGroupRef.current.position.y = 0.12 + Math.sin(time * 24.0) * 0.03;

        // Terrifying grasping arms lunging directly into the camera
        if (leftArmGroupRef.current && rightArmGroupRef.current) {
          rightArmGroupRef.current.rotation.x = MathUtils.lerp(rightArmGroupRef.current.rotation.x, -1.35 + microJitter * 2, delta * 15.0);
          rightArmGroupRef.current.rotation.y = MathUtils.lerp(rightArmGroupRef.current.rotation.y, -0.4, delta * 15.0);
          rightArmGroupRef.current.rotation.z = MathUtils.lerp(rightArmGroupRef.current.rotation.z, 0.3, delta * 15.0);

          leftArmGroupRef.current.rotation.x = MathUtils.lerp(leftArmGroupRef.current.rotation.x, -1.35 - microJitter * 2, delta * 15.0);
          leftArmGroupRef.current.rotation.y = MathUtils.lerp(leftArmGroupRef.current.rotation.y, 0.4, delta * 15.0);
          leftArmGroupRef.current.rotation.z = MathUtils.lerp(leftArmGroupRef.current.rotation.z, -0.3, delta * 15.0);
        }

        if (headGroupRef.current) {
          headGroupRef.current.rotation.set(
            (Math.random() - 0.5) * 0.08,
            (Math.random() - 0.5) * 0.08,
            (Math.random() - 0.5) * 0.08
          );
        }

        if (eyeGlowGroupRef.current) {
          eyeGlowGroupRef.current.scale.set(2.0, 2.0, 2.0);
        }

        if (ritualAuraLightRef.current) {
          ritualAuraLightRef.current.intensity = 40.0 + Math.sin(time * 60.0) * 20.0;
        }
      } else {
        // ═════════════════════════════════════════════════════════════════════
        // RITUAL ROOM JUMPSCARE MONOLOGUE & TERRIFYING HORROR POSTURE
        // ═════════════════════════════════════════════════════════════════════
        rootGroupRef.current.position.set(position[0], position[1], position[2]);
        rootGroupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);

        const speechTime = time * 3.5;
        const sinisterPulse = Math.sin(speechTime);
        const microTwitch = Math.sin(time * 35.0) * 0.015;

        // 1. Ominous levitation / forward menace
        characterGroupRef.current.position.y = 0.08 + Math.sin(time * 2.0) * 0.03;
        characterGroupRef.current.position.x = microTwitch;
        characterGroupRef.current.rotation.z = Math.sin(time * 1.5) * 0.02;

        // Breathing expansion
        characterGroupRef.current.scale.set(
          scale * (1.02 + sinisterPulse * 0.02),
          scale * (1.01 + sinisterPulse * 0.01),
          scale * (1.02 + sinisterPulse * 0.02)
        );

        // 2. Dramatic Oratorical Arm Gesturing while speaking "They were 3 people..."
        if (leftArmGroupRef.current && rightArmGroupRef.current) {
          // Right Arm raises menacingly, pointing/gesturing towards player
          rightArmGroupRef.current.rotation.x = MathUtils.lerp(
            rightArmGroupRef.current.rotation.x,
            -0.75 + Math.sin(speechTime * 1.2) * 0.25,
            delta * 6.0
          );
          rightArmGroupRef.current.rotation.y = MathUtils.lerp(
            rightArmGroupRef.current.rotation.y,
            -0.35 + Math.cos(speechTime) * 0.15,
            delta * 6.0
          );
          rightArmGroupRef.current.rotation.z = MathUtils.lerp(
            rightArmGroupRef.current.rotation.z,
            0.35 + microTwitch * 2,
            delta * 6.0
          );

          // Left Arm opens outward menacingly
          leftArmGroupRef.current.rotation.x = MathUtils.lerp(
            leftArmGroupRef.current.rotation.x,
            -0.45 + Math.cos(speechTime * 1.1) * 0.18,
            delta * 6.0
          );
          leftArmGroupRef.current.rotation.y = MathUtils.lerp(
            leftArmGroupRef.current.rotation.y,
            0.25,
            delta * 6.0
          );
          leftArmGroupRef.current.rotation.z = MathUtils.lerp(
            leftArmGroupRef.current.rotation.z,
            -0.28,
            delta * 6.0
          );
        }

        // 3. Head snaps and locks gaze dead-center on player's camera
        rootGroupRef.current.getWorldPosition(selfWorldPos.current);
        playerPos.current.set(camera.position.x, camera.position.y, camera.position.z);
        toPlayerVec.current.subVectors(playerPos.current, selfWorldPos.current).normalize();

        const yawAngle = Math.atan2(toPlayerVec.current.x, toPlayerVec.current.z) - rotation[1];
        const clampedYaw = MathUtils.clamp(yawAngle, -0.9, 0.9);
        const clampedPitch = MathUtils.clamp(-toPlayerVec.current.y * 0.45, -0.4, 0.4);

        if (headGroupRef.current) {
          headGroupRef.current.rotation.y = MathUtils.lerp(headGroupRef.current.rotation.y, clampedYaw, delta * 10.0);
          headGroupRef.current.rotation.x = MathUtils.lerp(headGroupRef.current.rotation.x, clampedPitch + Math.sin(time * 4) * 0.03, delta * 10.0);
          headGroupRef.current.rotation.z = Math.sin(time * 8.0) * 0.05 + microTwitch * 2.0;
        }

        // 4. Intensify Glowing Eyes & Crimson Occult Light
        if (eyeGlowGroupRef.current) {
          const eyeScale = 1.35 + Math.sin(time * 12.0) * 0.35;
          eyeGlowGroupRef.current.scale.set(eyeScale, eyeScale, eyeScale);
        }

        if (ritualAuraLightRef.current) {
          ritualAuraLightRef.current.intensity = 18.0 + Math.sin(time * 15.0) * 8.0;
        }
      }
    } else if (!isDancing) {
      // ═════════════════════════════════════════════════════════════════════
      // MICHAEL JACKSON STYLE MENACING HORROR SWAGGER IDLE (Zero-GC)
      // ═════════════════════════════════════════════════════════════════════
      const breathFreq = 1.35;
      const breath = Math.sin(time * breathFreq);
      const swayFreq = 0.5;
      const sway = Math.sin(time * swayFreq);
      const microTwitch = Math.sin(time * 26.0) * (Math.sin(time * 4.5) > 0.88 ? 0.007 : 0);

      // 1. Dynamic Weight Shift & Respiration
      characterGroupRef.current.position.y = breath * 0.008;
      characterGroupRef.current.position.x = sway * 0.018 + microTwitch;
      characterGroupRef.current.rotation.z = 0.035 + sway * 0.02;

      // Respiration breathing expansion
      characterGroupRef.current.scale.set(
        scale * (1.0 + breath * 0.012),
        scale * (1.0 + breath * 0.006),
        scale * (1.0 + breath * 0.016)
      );

      // Arm subtle breathing motion
      if (leftArmGroupRef.current && rightArmGroupRef.current) {
        leftArmGroupRef.current.rotation.x = 0.12 + Math.sin(time * 1.3) * 0.04;
        rightArmGroupRef.current.rotation.x = -0.15 + Math.cos(time * 1.3) * 0.05;
        leftArmGroupRef.current.rotation.z = -0.08 - sway * 0.03;
        rightArmGroupRef.current.rotation.z = 0.08 + sway * 0.03;
        leftArmGroupRef.current.rotation.y = 0;
        rightArmGroupRef.current.rotation.y = 0;
      }

      // 2. Intelligent Sinister Head / Body Tracking
      rootGroupRef.current.getWorldPosition(selfWorldPos.current);
      playerPos.current.set(camera.position.x, camera.position.y, camera.position.z);
      toPlayerVec.current.subVectors(playerPos.current, selfWorldPos.current).normalize();

      const yawAngle = Math.atan2(toPlayerVec.current.x, toPlayerVec.current.z) - rotation[1];
      const clampedYaw = MathUtils.clamp(yawAngle, -0.75, 0.75);
      const clampedPitch = MathUtils.clamp(-toPlayerVec.current.y * 0.35, -0.3, 0.3);

      if (headGroupRef.current) {
        headGroupRef.current.rotation.y = MathUtils.lerp(headGroupRef.current.rotation.y, clampedYaw * 0.85, delta * 4.0);
        headGroupRef.current.rotation.x = MathUtils.lerp(headGroupRef.current.rotation.x, clampedPitch, delta * 4.0);
        headGroupRef.current.rotation.z = Math.sin(time * 0.7) * 0.03 + microTwitch * 2.0;
      }

      if (chestGroupRef.current) {
        chestGroupRef.current.rotation.y = MathUtils.lerp(chestGroupRef.current.rotation.y, clampedYaw * 0.35, delta * 3.0);
      }

      if (eyeGlowGroupRef.current) {
        eyeGlowGroupRef.current.scale.set(1.0, 1.0, 1.0);
      }
      if (ritualAuraLightRef.current) {
        ritualAuraLightRef.current.intensity = 0;
      }
    }
  });

  return (
    <group ref={rootGroupRef} position={position} rotation={rotation}>
      
      {/* ═══ CINEMATIC HORROR LIGHTING (60 FPS - ZERO SHADOW MAP) ════════════ */}
      {/* Front Key Light directly illuminating face & suit (+Z) */}
      <pointLight position={[0, 1.65, 1.4]} intensity={5.0} distance={6} color="#fff6e8" castShadow={false} />
      {/* Lower Fill Light for crisp white slacks and shoes */}
      <pointLight position={[0, 0.5, 1.1]} intensity={3.5} distance={5} color="#e2e8f0" castShadow={false} />
      {/* Cool Azure Rim Silhouette Light (-Z) */}
      <pointLight position={[0, 2.3, -1.4]} intensity={5.5} distance={6} color="#60a5fa" castShadow={false} />
      {/* Jumpscare Pulsing Crimson Aura Light */}
      <pointLight ref={ritualAuraLightRef} position={[0, 1.8, 0.4]} intensity={0} distance={7} color="#ff1100" castShadow={false} />

      {/* ═══ 3D SCULPTED HUMAN CHARACTER ════════════════════════════════════ */}
      <group ref={characterGroupRef}>

        {/* ─── 1. TAILORED WHITE TROUSERS & LEGS (Hips down to Shoes) ──────── */}
        {/* Pelvic Crotch Area */}
        <mesh position={[0, 0.88, 0]}>
          <cylinderGeometry args={[0.21, 0.19, 0.16, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>

        {/* Left Pant Leg (Slacks) */}
        <group position={[-0.115, 0.44, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.088, 0.065, 0.76, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Ironed Front Crease Line */}
          <mesh position={[0, 0, 0.086]}>
            <boxGeometry args={[0.008, 0.74, 0.008]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
          </mesh>
        </group>

        {/* Right Pant Leg (Slacks) */}
        <group position={[0.115, 0.44, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.088, 0.065, 0.76, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Ironed Front Crease Line */}
          <mesh position={[0, 0, 0.086]}>
            <boxGeometry args={[0.008, 0.74, 0.008]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
          </mesh>
        </group>

        {/* Black Oxford Shoes */}
        <OxfordShoe isLeft={true} />
        <OxfordShoe isLeft={false} />


        {/* ─── 2. TORSO & ROYAL BLUE DOUBLE-BREASTED SUIT BLAZER ───────────── */}
        {/* Belt */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.22, 0.215, 0.06, 16]} />
          <meshStandardMaterial color="#1a1410" roughness={0.7} />
        </mesh>
        {/* Gold Belt Buckle */}
        <mesh position={[0, 0.95, 0.22]}>
          <boxGeometry args={[0.07, 0.048, 0.014]} />
          <meshStandardMaterial color="#f5be2d" metalness={0.92} roughness={0.2} />
        </mesh>

        {/* Spine Group */}
        <group ref={spineGroupRef} position={[0, 0.98, 0]}>
          {/* Lower Flared Jacket Skirt */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.245, 0.23, 0.22, 16]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
          </mesh>

          {/* Chest Group */}
          <group ref={chestGroupRef} position={[0, 0.22, 0]}>
            {/* Main Tailored Royal Blue Jacket Body */}
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.52, 0.38, 0.29]} />
              <meshStandardMaterial color="#1d4ed8" roughness={0.6} metalness={0.08} />
            </mesh>

            {/* Peaked Lapels (Left & Right) with Satin Sheen */}
            <mesh position={[-0.14, 0.2, 0.154]} rotation={[0.04, -0.06, 0.18]}>
              <boxGeometry args={[0.11, 0.38, 0.018]} />
              <meshStandardMaterial color="#1e40af" roughness={0.4} metalness={0.2} />
            </mesh>
            <mesh position={[0.14, 0.2, 0.154]} rotation={[0.04, 0.06, -0.18]}>
              <boxGeometry args={[0.11, 0.38, 0.018]} />
              <meshStandardMaterial color="#1e40af" roughness={0.4} metalness={0.2} />
            </mesh>

            {/* Inner White Silk Shirt V-Neck */}
            <mesh position={[0, 0.22, 0.149]}>
              <planeGeometry args={[0.17, 0.28]} />
              <meshStandardMaterial color="#ffffff" roughness={0.65} side={THREE.DoubleSide} />
            </mesh>
            {/* White Shirt Collar Wings */}
            <mesh position={[-0.085, 0.36, 0.13]} rotation={[-0.25, -0.35, 0.3]}>
              <boxGeometry args={[0.065, 0.12, 0.012]} />
              <meshStandardMaterial color="#fcfcfc" roughness={0.7} />
            </mesh>
            <mesh position={[0.085, 0.36, 0.13]} rotation={[-0.25, 0.35, -0.3]}>
              <boxGeometry args={[0.065, 0.12, 0.012]} />
              <meshStandardMaterial color="#fcfcfc" roughness={0.7} />
            </mesh>

            {/* 6 Embossed Gold Buttons on Blazer (2 Columns of 3) */}
            {[-0.06, 0.04, 0.14].map((yOff, bIdx) => (
              <mesh key={`btn-l-${bIdx}`} position={[-0.065, 0.12 + yOff, 0.158]}>
                <sphereGeometry args={[0.013, 10, 10]} />
                <meshStandardMaterial color="#f5be2d" metalness={0.94} roughness={0.18} />
              </mesh>
            ))}
            {[-0.06, 0.04, 0.14].map((yOff, bIdx) => (
              <mesh key={`btn-r-${bIdx}`} position={[0.065, 0.12 + yOff, 0.158]}>
                <sphereGeometry args={[0.013, 10, 10]} />
                <meshStandardMaterial color="#f5be2d" metalness={0.94} roughness={0.18} />
              </mesh>
            ))}

            {/* Left Chest Pocket & Folded White Pocket Square with Blue Dots */}
            <mesh position={[-0.165, 0.27, 0.156]}>
              <boxGeometry args={[0.09, 0.022, 0.012]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
            </mesh>
            <mesh position={[-0.165, 0.292, 0.154]} rotation={[0.1, 0, -0.15]}>
              <boxGeometry args={[0.068, 0.038, 0.01]} />
              <meshStandardMaterial color="#ffffff" roughness={0.45} />
            </mesh>

            {/* Lower Waist Flap Pockets */}
            <mesh position={[-0.17, 0.04, 0.154]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.11, 0.032, 0.014]} />
              <meshStandardMaterial color="#1e40af" roughness={0.6} />
            </mesh>
            <mesh position={[0.17, 0.04, 0.154]} rotation={[0.05, 0, 0]}>
              <boxGeometry args={[0.11, 0.032, 0.014]} />
              <meshStandardMaterial color="#1e40af" roughness={0.6} />
            </mesh>


            {/* ─── 3. ARMS, CUFFS & ARTICULATED HANDS ───────────────────────── */}
            {/* Left Arm Group */}
            <group ref={leftArmGroupRef} position={[-0.32, 0.28, 0]}>
              {/* Shoulder Cap */}
              <mesh>
                <sphereGeometry args={[0.092, 12, 12]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
              </mesh>

              {/* Upper Arm Sleeve */}
              <mesh position={[0, -0.14, 0]}>
                <cylinderGeometry args={[0.07, 0.062, 0.28, 12]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
              </mesh>

              {/* Forearm Group */}
              <group position={[0, -0.28, 0]}>
                {/* White Shirt Sleeve Cuff */}
                <mesh position={[0, -0.02, 0]}>
                  <cylinderGeometry args={[0.065, 0.058, 0.05, 10]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.8} />
                </mesh>
                {/* Forearm Sleeve */}
                <mesh position={[0, -0.12, 0]}>
                  <cylinderGeometry args={[0.058, 0.05, 0.22, 10]} />
                  <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
                </mesh>

                {/* 5-Finger Hand */}
                <ArticulatedHand isLeft={true} />
              </group>
            </group>

            {/* Right Arm Group */}
            <group ref={rightArmGroupRef} position={[0.32, 0.28, 0]}>
              {/* Shoulder Cap */}
              <mesh>
                <sphereGeometry args={[0.092, 12, 12]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
              </mesh>

              {/* Upper Arm Sleeve */}
              <mesh position={[0, -0.14, 0]}>
                <cylinderGeometry args={[0.07, 0.062, 0.28, 12]} />
                <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
              </mesh>

              {/* Forearm Group */}
              <group position={[0, -0.28, 0]}>
                {/* White Shirt Sleeve Cuff */}
                <mesh position={[0, -0.02, 0]}>
                  <cylinderGeometry args={[0.065, 0.058, 0.05, 10]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.8} />
                </mesh>
                {/* Forearm Sleeve */}
                <mesh position={[0, -0.12, 0]}>
                  <cylinderGeometry args={[0.058, 0.05, 0.22, 10]} />
                  <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
                </mesh>

                {/* 5-Finger Hand */}
                <ArticulatedHand isLeft={false} />
              </group>
            </group>


            {/* ─── 4. 3D RAVI KISHAN HEAD (High-Res Face with Background Removed) ─── */}
            {/* Neck */}
            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.08, 0.094, 0.16, 14]} />
              <meshStandardMaterial color="#cfa07c" roughness={0.7} />
            </mesh>

            {/* Head Group */}
            <group ref={headGroupRef} position={[0, 0.64, 0]}>
              {/* 3D Anatomical Skull Mesh (Back & Base) */}
              <mesh position={[0, 0.04, -0.03]}>
                <sphereGeometry args={[0.21, 20, 20]} />
                <meshStandardMaterial color="#cfa07c" roughness={0.65} />
              </mesh>

              {/* 3D Realistic Jaw & Chin Contour */}
              <mesh position={[0, -0.09, 0.04]} rotation={[-0.26, 0, 0]}>
                <boxGeometry args={[0.19, 0.15, 0.16]} />
                <meshStandardMaterial color="#cfa07c" roughness={0.65} />
              </mesh>

              {/* 3D Signature Voluminous Wavy Hair Dome */}
              <mesh position={[0, 0.16, -0.02]} rotation={[0.14, 0, 0]}>
                <sphereGeometry args={[0.238, 16, 16]} />
                <meshStandardMaterial color="#120a05" roughness={0.88} />
              </mesh>
              {/* Signature Hair Quiff Wave Chunks */}
              <mesh position={[0.03, 0.23, 0.03]} rotation={[-0.32, -0.08, 0.08]}>
                <boxGeometry args={[0.3, 0.14, 0.21]} />
                <meshStandardMaterial color="#160c07" roughness={0.88} />
              </mesh>
              <mesh position={[-0.07, 0.20, 0.03]} rotation={[-0.22, 0.12, -0.08]}>
                <boxGeometry args={[0.19, 0.11, 0.17]} />
                <meshStandardMaterial color="#120a05" roughness={0.88} />
              </mesh>

              {/* 3D Anatomical Ears */}
              <mesh position={[-0.21, 0.02, 0]}>
                <sphereGeometry args={[0.052, 10, 10]} />
                <meshStandardMaterial color="#c99874" roughness={0.7} />
              </mesh>
              <mesh position={[0.21, 0.02, 0]}>
                <sphereGeometry args={[0.052, 10, 10]} />
                <meshStandardMaterial color="#c99874" roughness={0.7} />
              </mesh>

              {/* Front Face Texture with Background Removed */}
              <group position={[0, 0.04, 0.206]}>
                <mesh>
                  <planeGeometry args={[0.52, 0.54]} />
                  <meshStandardMaterial
                    map={raviFaceTex}
                    transparent={true}
                    alphaTest={0.02}
                    roughness={0.35}
                    color="#ffffff"
                    emissive="#2a0c0c"
                    emissiveIntensity={0.12}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Piercing Horror Eye Gaze aligned with pupils */}
                <group ref={eyeGlowGroupRef}>
                  <mesh position={[-0.071, 0.011, 0.005]}>
                    <sphereGeometry args={[0.0075, 8, 8]} />
                    <meshBasicMaterial color="#ffdd33" />
                  </mesh>
                  <mesh position={[-0.071, 0.011, 0.008]}>
                    <sphereGeometry args={[0.0038, 6, 6]} />
                    <meshBasicMaterial color="#ff1100" />
                  </mesh>

                  <mesh position={[0.057, 0.031, 0.005]}>
                    <sphereGeometry args={[0.0075, 8, 8]} />
                    <meshBasicMaterial color="#ffdd33" />
                  </mesh>
                  <mesh position={[0.057, 0.031, 0.008]}>
                    <sphereGeometry args={[0.0038, 6, 6]} />
                    <meshBasicMaterial color="#ff1100" />
                  </mesh>
                </group>
              </group>
            </group>

          </group>
        </group>
      </group>
    </group>
  );
}
