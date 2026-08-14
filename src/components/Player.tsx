'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { Vector3, MathUtils, SpotLight } from 'three';
import { useGameStore } from '@/store/useGameStore';

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
  const { gameState, setGameState } = useGameStore();
  const bodyRef = useRef<RapierRigidBody>(null);
  const spotLightRef = useRef<SpotLight>(null);
  const { camera } = useThree();

  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    crouch: false,
    sprint: false,
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
      switch (e.code) {
        case 'KeyW': setMovement((m) => ({ ...m, forward: true })); break;
        case 'KeyS': setMovement((m) => ({ ...m, backward: true })); break;
        case 'KeyA': setMovement((m) => ({ ...m, left: true })); break;
        case 'KeyD': setMovement((m) => ({ ...m, right: true })); break;
        case 'ShiftLeft':
        case 'ShiftRight': setMovement((m) => ({ ...m, sprint: true })); break;
        case 'KeyM': 
          useGameStore.getState().setShowMap(!useGameStore.getState().showMap);
          break;
        case 'KeyC':
        case 'ControlLeft': setMovement((m) => ({ ...m, crouch: true })); break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setMovement((m) => ({ ...m, forward: false })); break;
        case 'KeyS': setMovement((m) => ({ ...m, backward: false })); break;
        case 'KeyA': setMovement((m) => ({ ...m, left: false })); break;
        case 'KeyD': setMovement((m) => ({ ...m, right: false })); break;
        case 'ShiftLeft':
        case 'ShiftRight': setMovement((m) => ({ ...m, sprint: false })); break;
        case 'KeyC':
        case 'ControlLeft': setMovement((m) => ({ ...m, crouch: false })); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!bodyRef.current || gameState !== 'playing') return;

    // 1. Sprint & Stamina Logic (without causing React re-renders)
    const isMoving = movement.forward || movement.backward || movement.left || movement.right;
    const canSprint = movement.sprint && !movement.crouch && isMoving && staminaRef.current > 5;

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
    if (movement.crouch) {
      targetSpeed = CROUCH_SPEED;
    } else if (canSprint) {
      targetSpeed = SPRINT_SPEED;
    }
    currentSpeedRef.current = MathUtils.lerp(currentSpeedRef.current, targetSpeed, delta * 10);

    // 3. Smooth Crouch Height Interpolation
    const targetHeight = movement.crouch ? 0.8 : 1.6;
    currentHeightRef.current = MathUtils.lerp(currentHeightRef.current, targetHeight, delta * 10);

    // 4. Direction & Movement Physics
    const linVel = bodyRef.current.linvel();
    const frontVector = new Vector3(0, 0, (movement.backward ? 1 : 0) - (movement.forward ? 1 : 0));
    const sideVector = new Vector3((movement.left ? 1 : 0) - (movement.right ? 1 : 0), 0, 0);

    const inputDirection = new Vector3();
    inputDirection.subVectors(frontVector, sideVector);
    if (inputDirection.lengthSq() > 0.001) {
      inputDirection.normalize().multiplyScalar(currentSpeedRef.current);
      inputDirection.applyEuler(camera.rotation);
    }

    smoothedVelocity.current.lerp(inputDirection, delta * 15);
    bodyRef.current.setLinvel({ x: smoothedVelocity.current.x, y: linVel.y, z: smoothedVelocity.current.z }, true);

    // Update position in store for mini-map (direct mutation without set() prevents re-renders)
    const pos = bodyRef.current.translation();
    const store = useGameStore.getState();
    store.playerPos.x = pos.x;
    store.playerPos.y = pos.y;
    store.playerPos.z = pos.z;

    // 5. Head Bobbing
    let bobOffset = 0;
    const moveMagnitude = Math.sqrt(smoothedVelocity.current.x ** 2 + smoothedVelocity.current.z ** 2);
    if (moveMagnitude > 0.2 && pos.y < 7.5) {
      const bobSpeed = canSprint ? 14 : movement.crouch ? 7 : 10;
      const bobAmount = canSprint ? 0.07 : movement.crouch ? 0.03 : 0.045;
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
      const stepInterval = canSprint ? 0.32 : movement.crouch ? 0.65 : 0.44;
      if (stepTimer.current > stepInterval) {
        const onStairs = pos.z > 9.5 && pos.z < 19.5 && pos.y > 0.5 && pos.y < 6.0;
        const volume = movement.crouch ? 0.2 : canSprint ? 0.65 : 0.45;
        playFootstep(volume, onStairs, canSprint);
        stepTimer.current = 0;
      }
    } else {
      stepTimer.current = 0;
    }

    // 7. Flashlight
    if (spotLightRef.current) {
      spotLightRef.current.position.set(
        camera.position.x + 0.16,
        camera.position.y - 0.16,
        camera.position.z
      );

      const aimTarget = new Vector3(0, 0, -6).applyQuaternion(camera.quaternion).add(camera.position);
      flashlightTargetPos.current.lerp(aimTarget, delta * 16);
      spotLightRef.current.target.position.copy(flashlightTargetPos.current);
      spotLightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      {gameState === 'playing' && (
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
        {movement.crouch ? (
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
        intensity={60}
        distance={28}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0005}
      />
    </>
  );
}
