'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useGameStore } from '@/store/useGameStore';

import { SpotLight } from 'three';

const SPEED = 5;
const CROUCH_SPEED = 2;

// Walking Sound Effect
const footstepAudio = typeof window !== 'undefined' ? new Audio('/footstep.mp3') : null;
const stairsAudio = typeof window !== 'undefined' ? new Audio('/stairs and doors.mp3') : null;

function playFootstep(volume: number = 0.5, onStairs: boolean = false) {
  const audio = onStairs ? stairsAudio : footstepAudio;
  if (typeof window === 'undefined' || !audio) return;
  audio.volume = volume;
  audio.currentTime = 0;
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
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      switch (e.code) {
        case 'KeyW': setMovement((m) => ({ ...m, forward: true })); break;
        case 'KeyS': setMovement((m) => ({ ...m, backward: true })); break;
        case 'KeyA': setMovement((m) => ({ ...m, left: true })); break;
        case 'KeyD': setMovement((m) => ({ ...m, right: true })); break;
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
  }, [gameState]);

  const stepTimer = useRef(0);
  const headBobTimer = useRef(0);

  useFrame((state, delta) => {
    if (!bodyRef.current || gameState !== 'playing') return;

    // Movement Logic
    const speed = movement.crouch ? CROUCH_SPEED : SPEED;
    
    // Get current velocity
    const linVel = bodyRef.current.linvel();
    
    // Calculate input direction relative to camera
    const direction = new Vector3();
    const frontVector = new Vector3(0, 0, (movement.backward ? 1 : 0) - (movement.forward ? 1 : 0));
    const sideVector = new Vector3((movement.left ? 1 : 0) - (movement.right ? 1 : 0), 0, 0);

    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed);
    direction.applyEuler(camera.rotation);
    
    // Preserve vertical velocity (falling/gravity)
    bodyRef.current.setLinvel({ x: direction.x, y: linVel.y, z: direction.z }, true);

    // Update camera position to follow the rigid body
    const pos = bodyRef.current.translation();
    
    // Head Bob Logic
    let bobOffset = 0;
    if (direction.lengthSq() > 0.1 && pos.y < 7.5) { // apply bobbing if moving and on floor or stairs
      headBobTimer.current += delta * (movement.crouch ? 6 : 10); // bob speed
      bobOffset = Math.sin(headBobTimer.current) * (movement.crouch ? 0.05 : 0.1); // bob intensity
    } else {
      // Smoothly return to center when stopped
      bobOffset = Math.sin(headBobTimer.current) * 0.1;
      headBobTimer.current = headBobTimer.current * 0.9;
    }

    // Update camera position to follow the rigid body + head bob
    const cameraHeight = movement.crouch ? 0.8 : 1.6;
    camera.position.set(pos.x, pos.y + cameraHeight - 1 + bobOffset, pos.z); 
    // -1 because pos is the center of the 2-unit high collider

    // Footstep audio logic
    if (direction.lengthSq() > 0.1 && pos.y < 7.5) {
      stepTimer.current += delta;
      const stepInterval = movement.crouch ? 0.7 : 0.45;
      if (stepTimer.current > stepInterval) {
        const onStairs = pos.y > 2.5 && pos.y < 5.8;
        playFootstep(movement.crouch ? 0.2 : 0.5, onStairs);
        stepTimer.current = 0;
      }
    } else {
      stepTimer.current = 0;
    }

    // Update flashlight to follow camera
    if (spotLightRef.current) {
      spotLightRef.current.position.copy(camera.position);
      spotLightRef.current.position.y -= 0.2; // slightly below eyes
      spotLightRef.current.position.x += 0.2; // slightly to the right (like holding it)
      
      const targetPos = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      spotLightRef.current.target.position.copy(targetPos);
      spotLightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      {gameState === 'playing' && (
        <PointerLockControls 
          onUnlock={() => setGameState('paused')}
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
        {/* Dynamic collider size based on crouch */}
        {movement.crouch ? (
          <CapsuleCollider args={[0.2, 0.4]} position={[0, -0.4, 0]} />
        ) : (
          <CapsuleCollider args={[0.5, 0.4]} />
        )}
      </RigidBody>

      {/* Flashlight attached to camera */}
      <spotLight
        ref={spotLightRef}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={50} // Using modern Three.js lighting intensity units might require tweaking, 50 is safe for default
        distance={25}
        color="#fff5e6" // slightly warm, spooky flashlight
        castShadow
      />
    </>
  );
}
