'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { Vector3, Euler, MathUtils, SpotLight } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useTouchControls, touchStateRef } from '@/store/useTouchControls';
import { playFlashlightClickSound } from '@/utils/creepyAudio';
import HeldItem from './HeldItem';

const WALK_SPEED = 5.0;
const SPRINT_SPEED = 8.0;
const CROUCH_SPEED = 2.5;

// Audio references
const footstepAudio = typeof window !== 'undefined' ? new Audio('/footstep.mp3') : null;
const stairsAudio = typeof window !== 'undefined' ? new Audio('/stairs and doors.mp3') : null;

function playFootstep(volume: number = 0.5, onStairs: boolean = false, isSprinting: boolean = false) {
  const audio = onStairs ? stairsAudio : footstepAudio;
  if (typeof window === 'undefined' || !audio) return;
  audio.volume = volume;
  audio.currentTime = 0;
  audio.playbackRate = isSprinting ? 1.3 : 1.0;
  audio.play().catch(() => {});
}

export default function Player() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const hasFlashlight = useGameStore((s) => s.hasFlashlight);
  const isFlashlightOn = useGameStore((s) => s.isFlashlightOn);
  const isTouchDevice = useTouchControls((s) => s.isTouchDevice);
  const bodyRef = useRef<RapierRigidBody>(null);
  const spotLightRef = useRef<SpotLight>(null);

  const [isCrouched, setIsCrouched] = useState(false);

  const movementRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    crouch: false,
    sprint: false,
    turnLeft: false,
    turnRight: false,
    turnUp: false,
    turnDown: false,
  });

  const staminaRef = useRef(100);
  const currentSpeedRef = useRef(WALK_SPEED);
  const currentHeightRef = useRef(1.6);
  const smoothedVelocity = useRef(new Vector3());
  const flashlightTargetPos = useRef(new Vector3());
  const stepTimer = useRef(0);
  const headBobTimer = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (useGameStore.getState().gameState !== 'playing') return;
      const m = movementRef.current;
      switch (e.code) {
        case 'KeyW': m.forward = true; break;
        case 'KeyS': m.backward = true; break;
        case 'KeyA': m.left = true; break;
        case 'KeyD': m.right = true; break;
        case 'ArrowLeft': m.turnLeft = true; break;
        case 'ArrowRight': m.turnRight = true; break;
        case 'ArrowUp': m.turnUp = true; break;
        case 'ArrowDown': m.turnDown = true; break;
        case 'ShiftLeft':
        case 'ShiftRight': m.sprint = true; break;
        case 'KeyM': 
          useGameStore.getState().setShowMap(!useGameStore.getState().showMap);
          break;
        case 'KeyF':
          if (useGameStore.getState().hasFlashlight) {
            useGameStore.getState().toggleFlashlight();
            playFlashlightClickSound(useGameStore.getState().isFlashlightOn);
          }
          break;
        case 'KeyC':
        case 'ControlLeft': 
          m.crouch = true; 
          setIsCrouched(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const m = movementRef.current;
      switch (e.code) {
        case 'KeyW': m.forward = false; break;
        case 'KeyS': m.backward = false; break;
        case 'KeyA': m.left = false; break;
        case 'KeyD': m.right = false; break;
        case 'ArrowLeft': m.turnLeft = false; break;
        case 'ArrowRight': m.turnRight = false; break;
        case 'ArrowUp': m.turnUp = false; break;
        case 'ArrowDown': m.turnDown = false; break;
        case 'ShiftLeft':
        case 'ShiftRight': m.sprint = false; break;
        case 'KeyC':
        case 'ControlLeft': 
          m.crouch = false; 
          setIsCrouched(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const isStairDanceActive = useGameStore((s) => s.isStairDanceActive);
  const isRitualJumpscareActive = useGameStore((s) => s.isRitualJumpscareActive);

  // Pre-allocated vectors & euler for 60FPS zero-GC movement calculations
  const frontVec = useRef(new Vector3());
  const sideVec = useRef(new Vector3());
  const inputDir = useRef(new Vector3());
  const aimVec = useRef(new Vector3());
  const playerYawEuler = useRef(new Euler(0, 0, 0, 'YXZ'));
  const danceTargetPos = useRef(new Vector3(0, 5.8, 20.6));
  const danceLookVec = useRef(new Vector3());
  const ritualTargetPos = useRef(new Vector3(10.75, 6.4, 17.5));
  const ritualLookVec = useRef(new Vector3());
  const lastFlingTriggerRef = useRef(0);

  useFrame((state, rawDelta) => {
    if (!bodyRef.current || gameState !== 'playing') return;

    const camera = state.camera;
    // Set standard FPS rotation order (yaw around world Y, pitch around local X, zero roll)
    camera.rotation.order = 'YXZ';

    // Clamp delta to prevent physics explosion / micro-stutters during lag spikes
    const delta = Math.min(rawDelta, 0.05);
    const m = movementRef.current;

    // Check for player fling impulse event
    const store = useGameStore.getState();
    if (store.playerFlingTrigger > lastFlingTriggerRef.current) {
      lastFlingTriggerRef.current = store.playerFlingTrigger;
      // Violently blast player out through the doorway into the 2F corridor
      bodyRef.current.setTranslation({ x: 3.5, y: 5.2, z: 17.0 }, true);
      bodyRef.current.setLinvel({ x: -14.0, y: 2.5, z: 0 }, true);
      smoothedVelocity.current.set(-14.0, 0, 0);
      camera.rotation.y = -Math.PI / 2; // Look back towards the slamming door
      camera.rotation.x = -0.15;
    }

    // 0a. Freeze & Camera Focus during Stair Dance Sequence
    if (isStairDanceActive) {
      // Smoothly orient camera to gaze directly at dancing Lord Ravi Kishan at top of stairs
      danceLookVec.current.copy(danceTargetPos.current).sub(camera.position);
      const targetYaw = Math.atan2(-danceLookVec.current.x, -danceLookVec.current.z);
      const targetPitch = Math.atan2(danceLookVec.current.y, Math.hypot(danceLookVec.current.x, danceLookVec.current.z));

      camera.rotation.y = MathUtils.lerp(camera.rotation.y, targetYaw, delta * 6);
      camera.rotation.x = MathUtils.lerp(camera.rotation.x, targetPitch, delta * 6);
      camera.rotation.z = 0;

      // Halt movement and freeze player body in place
      smoothedVelocity.current.set(0, 0, 0);
      bodyRef.current.setLinvel({ x: 0, y: bodyRef.current.linvel().y, z: 0 }, true);

      const pos = bodyRef.current.translation();
      store.playerPos.x = pos.x;
      store.playerPos.y = pos.y;
      store.playerPos.z = pos.z;
      camera.position.set(pos.x, pos.y + currentHeightRef.current - 1, pos.z);
      return;
    }

    // 0b. Freeze & Camera Focus during Ritual Room Horror Monologue Sequence
    if (isRitualJumpscareActive) {
      // Smoothly orient camera to gaze directly at Lord Ravi Kishan in Ritual Room
      ritualLookVec.current.copy(ritualTargetPos.current).sub(camera.position);
      const targetYaw = Math.atan2(-ritualLookVec.current.x, -ritualLookVec.current.z);
      const targetPitch = Math.atan2(ritualLookVec.current.y, Math.hypot(ritualLookVec.current.x, ritualLookVec.current.z));

      // Subtle atmospheric trauma wobble
      const wobbleX = Math.sin(state.clock.elapsedTime * 28.0) * 0.008;
      const wobbleY = Math.cos(state.clock.elapsedTime * 22.0) * 0.008;

      camera.rotation.y = MathUtils.lerp(camera.rotation.y, targetYaw + wobbleY, delta * 7.5);
      camera.rotation.x = MathUtils.lerp(camera.rotation.x, targetPitch + wobbleX, delta * 7.5);
      camera.rotation.z = Math.sin(state.clock.elapsedTime * 18.0) * 0.005;

      // Halt movement and freeze player body in place
      smoothedVelocity.current.set(0, 0, 0);
      bodyRef.current.setLinvel({ x: 0, y: bodyRef.current.linvel().y, z: 0 }, true);

      const pos = bodyRef.current.translation();
      store.playerPos.x = pos.x;
      store.playerPos.y = pos.y;
      store.playerPos.z = pos.z;
      camera.position.set(pos.x, pos.y + currentHeightRef.current - 1, pos.z);
      return;
    }

    // Standard Touch Camera Look Consumption (Standard FPS yaw and pitch)
    const { dx, dy } = useTouchControls.getState().consumeLookDelta();
    if (dx !== 0 || dy !== 0) {
      camera.rotation.y -= dx * 1.5;
      camera.rotation.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, camera.rotation.x - dy * 1.5));
      camera.rotation.z = 0;
    }

    // Keyboard Camera Rotation Fallback
    if (m.turnLeft) camera.rotation.y += delta * 2.2;
    if (m.turnRight) camera.rotation.y -= delta * 2.2;
    if (m.turnUp) camera.rotation.x = Math.max(-Math.PI / 2.3, camera.rotation.x + delta * 1.5);
    if (m.turnDown) camera.rotation.x = Math.min(Math.PI / 2.3, camera.rotation.x - delta * 1.5);
    camera.rotation.z = 0;

    // 1. Sprint & Stamina Logic (without causing React re-renders)
    const joy = touchStateRef.joystick;
    const isTouchMoving = Math.abs(joy.x) > 0.05 || Math.abs(joy.y) > 0.05;
    const isKbMoving = m.forward || m.backward || m.left || m.right;
    const isMoving = isKbMoving || isTouchMoving;

    const isSprinting = m.sprint || touchStateRef.sprint;
    const isCrouching = m.crouch || touchStateRef.crouch;

    const canSprint = isSprinting && !isCrouching && isMoving && staminaRef.current > 5;

    if (canSprint) {
      staminaRef.current = Math.max(0, staminaRef.current - delta * 25);
    } else {
      staminaRef.current = Math.min(100, staminaRef.current + delta * 18);
    }

    // Direct DOM update for stamina bar if it exists (0 React overhead!)
    const staminaBar = document.getElementById('stamina-progress-bar');
    const staminaContainer = document.getElementById('stamina-container');
    if (staminaBar && staminaContainer) {
      staminaBar.style.width = `${staminaRef.current}%`;
      staminaContainer.style.opacity = staminaRef.current < 98 ? '1' : '0';
    }

    // 2. Smooth Speed Interpolation
    let targetSpeed = WALK_SPEED;
    if (isCrouching) {
      targetSpeed = CROUCH_SPEED;
    } else if (canSprint) {
      targetSpeed = SPRINT_SPEED;
    }
    currentSpeedRef.current = MathUtils.lerp(currentSpeedRef.current, targetSpeed, delta * 10);

    // 3. Smooth Crouch Height Interpolation
    const targetHeight = isCrouching ? 0.8 : 1.6;
    currentHeightRef.current = MathUtils.lerp(currentHeightRef.current, targetHeight, delta * 10);

    // 4. Direction & Movement Physics (Pure Horizontal Projection using Yaw)
    const linVel = bodyRef.current.linvel();
    playerYawEuler.current.set(0, camera.rotation.y, 0);

    if (isTouchMoving) {
      // Touch joystick movement: X is left/right, -Y is forward (camera space)
      inputDir.current.set(joy.x, 0, -joy.y);
      if (inputDir.current.lengthSq() > 0.001) {
        inputDir.current.normalize().multiplyScalar(currentSpeedRef.current);
        inputDir.current.applyEuler(playerYawEuler.current);
      }
    } else if (isKbMoving) {
      frontVec.current.set(0, 0, (m.backward ? 1 : 0) - (m.forward ? 1 : 0));
      sideVec.current.set((m.left ? 1 : 0) - (m.right ? 1 : 0), 0, 0);

      inputDir.current.subVectors(frontVec.current, sideVec.current);
      if (inputDir.current.lengthSq() > 0.001) {
        inputDir.current.normalize().multiplyScalar(currentSpeedRef.current);
        inputDir.current.applyEuler(playerYawEuler.current);
      }
    } else {
      inputDir.current.set(0, 0, 0);
    }

    smoothedVelocity.current.lerp(inputDir.current, delta * 15);
    bodyRef.current.setLinvel({ x: smoothedVelocity.current.x, y: linVel.y, z: smoothedVelocity.current.z }, true);

    // Update position in store for mini-map (direct mutation without set() prevents re-renders)
    const pos = bodyRef.current.translation();
    store.playerPos.x = pos.x;
    store.playerPos.y = pos.y;
    store.playerPos.z = pos.z;

    // 5. Head Bobbing
    let bobOffset = 0;
    const moveMagnitude = Math.sqrt(smoothedVelocity.current.x ** 2 + smoothedVelocity.current.z ** 2);
    if (moveMagnitude > 0.2 && pos.y < 7.5) {
      const bobSpeed = canSprint ? 14 : isCrouching ? 7 : 10;
      const bobAmount = canSprint ? 0.07 : isCrouching ? 0.03 : 0.045;
      headBobTimer.current += delta * bobSpeed;
      bobOffset = Math.sin(headBobTimer.current) * bobAmount;
    } else {
      bobOffset = Math.sin(headBobTimer.current) * 0.02;
      headBobTimer.current = MathUtils.lerp(headBobTimer.current, 0, delta * 5);
    }

    camera.position.set(pos.x, pos.y + currentHeightRef.current - 1 + bobOffset, pos.z);

    // 6. Dynamic Footstep Audio
    if (moveMagnitude > 0.3 && pos.y < 7.5) {
      stepTimer.current += delta;
      const stepInterval = canSprint ? 0.32 : isCrouching ? 0.65 : 0.44;
      if (stepTimer.current > stepInterval) {
        const onStairs = pos.z > 9.5 && pos.z < 19.5 && pos.y > 0.5 && pos.y < 6.0;
        const volume = isCrouching ? 0.2 : canSprint ? 0.65 : 0.45;
        playFootstep(volume, onStairs, canSprint);
        stepTimer.current = 0;
      }
    } else {
      stepTimer.current = 0;
    }

    // 7. Flashlight
    if (spotLightRef.current) {
      const isLit = hasFlashlight && isFlashlightOn;
      spotLightRef.current.visible = isLit;
      spotLightRef.current.intensity = isLit ? 60 : 0;

      if (isLit) {
        spotLightRef.current.position.set(
          camera.position.x + 0.16,
          camera.position.y - 0.16,
          camera.position.z
        );

        aimVec.current.set(0, 0, -6).applyQuaternion(camera.quaternion).add(camera.position);
        flashlightTargetPos.current.lerp(aimVec.current, delta * 16);
        spotLightRef.current.target.position.copy(flashlightTargetPos.current);
        spotLightRef.current.target.updateMatrixWorld();
      }
    }
  });

  return (
    <>
      {gameState === 'playing' && !isTouchDevice && (
        <PointerLockControls 
          onUnlock={() => {
            if (useGameStore.getState().gameState === 'playing') {
              setGameState('paused');
            }
          }}
        />
      )}
      
      {/* Player Physics Body */}
      <RigidBody 
        ref={bodyRef} 
        colliders={false} 
        mass={1} 
        type="dynamic" 
        position={[0, 2, 0]} 
 
        enabledRotations={[false, false, false]}
        name="player"
      >
        {isCrouched ? (
          <CapsuleCollider args={[0.2, 0.4]} position={[0, -0.4, 0]} friction={0} />
        ) : (
          <CapsuleCollider args={[0.5, 0.4]} friction={0} />
        )}
      </RigidBody>

      {/* Optimized Survival Horror Flashlight */}
      <spotLight
        ref={spotLightRef}
        angle={Math.PI / 5.5}
        penumbra={0.45}
        intensity={0}
        visible={false}
        distance={28}
        color="#fff4e0"
        castShadow={hasFlashlight && isFlashlightOn}
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0005}
      />

      {/* First-person viewmodel: flashlight + key visible when held */}
      <HeldItem />
    </>
  );
}
