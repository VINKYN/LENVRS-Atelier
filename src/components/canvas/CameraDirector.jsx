import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useCustomizerStore } from '../../store/useCustomizerStore';

export default function CameraDirector() {
  const controlsRef = useRef();
  const { camera } = useThree();

  const cameraFocus = useCustomizerStore(state => state.cameraFocus);
  const autoRotate = useCustomizerStore(state => state.autoRotate);

  const isMobileInitial = typeof window !== 'undefined' && window.innerWidth < 768;

  const initPosX = (cameraFocus?.position?.[0] ?? 0) * (isMobileInitial ? 1.35 : 1);
  const initPosZ = (cameraFocus?.position?.[2] ?? 4.4) * (isMobileInitial ? 1.35 : 1);
  const initHDist = Math.sqrt(initPosX * initPosX + initPosZ * initPosZ);
  const initYOffset = isMobileInitial ? -initHDist * 0.078 : 0;

  const targetPosition = useRef(
    new THREE.Vector3(
      initPosX,
      (cameraFocus?.position?.[1] ?? -0.05) + initYOffset,
      initPosZ
    )
  );

  const targetLookAt = useRef(
    new THREE.Vector3(
      cameraFocus?.target?.[0] ?? 0,
      (cameraFocus?.target?.[1] ?? -0.08) + initYOffset,
      cameraFocus?.target?.[2] ?? 0
    )
  );

  const targetSpherical = useRef(new THREE.Spherical());
  const currentSpherical = useRef(new THREE.Spherical());

  const isTransitioning = useRef(false);
  const userInteracting = useRef(false);

  useEffect(() => {
    if (cameraFocus?.position && cameraFocus?.target) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

      let posX = cameraFocus.position[0];
      let posY = cameraFocus.position[1];
      let posZ = cameraFocus.position[2];

      let tgtX = cameraFocus.target[0];
      let tgtY = cameraFocus.target[1];
      let tgtZ = cameraFocus.target[2];

      if (isMobile) {
        // Calculate distance on horizontal plane
        const hDist = Math.sqrt(posX * posX + posZ * posZ);

        // Dynamic zoom scaling on mobile so close-up steps don't crop and full body is well-framed
        const scaleFactor = hDist < 2.0 ? 1.60 : (hDist < 3.2 ? 1.45 : 1.35);
        posX *= scaleFactor;
        posZ *= scaleFactor;

        const newHDist = Math.sqrt(posX * posX + posZ * posZ);

        // Exact vertical perspective offset to center the focused part in the upper 66% mobile viewing zone
        const yOffset = -newHDist * 0.078;
        posY += yOffset;
        tgtY += yOffset;
      }

      targetPosition.current.set(posX, posY, posZ);
      targetLookAt.current.set(tgtX, tgtY, tgtZ);

      // Compute spherical coordinates relative to the target center
      const targetOffset = new THREE.Vector3().subVectors(targetPosition.current, targetLookAt.current);
      targetSpherical.current.setFromVector3(targetOffset);

      isTransitioning.current = true;
    }
  }, [cameraFocus]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      userInteracting.current = true;
      isTransitioning.current = false;
    };

    const handleEnd = () => {
      userInteracting.current = false;
    };

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
    };
  }, []);

  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (isTransitioning.current && !userInteracting.current) {
      const lerpSpeed = Math.min(delta * 4.5, 0.12);

      // Convert current camera position relative to control target into spherical coords
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      currentSpherical.current.setFromVector3(offset);

      // Shortest azimuthal angle path around the circle (avoids straight line passing through the t-shirt)
      let deltaTheta = targetSpherical.current.theta - currentSpherical.current.theta;
      deltaTheta = Math.atan2(Math.sin(deltaTheta), Math.cos(deltaTheta));

      // If passing front to back (exact 180° opposite), choose consistent smooth orbit along the side
      if (Math.abs(Math.abs(deltaTheta) - Math.PI) < 0.01) {
        deltaTheta = Math.PI;
      }

      currentSpherical.current.theta += deltaTheta * lerpSpeed;
      currentSpherical.current.phi += (targetSpherical.current.phi - currentSpherical.current.phi) * lerpSpeed;
      currentSpherical.current.radius += (targetSpherical.current.radius - currentSpherical.current.radius) * lerpSpeed;

      // Reconstruct 3D Cartesian position from spherical orbit
      offset.setFromSpherical(currentSpherical.current);
      controls.target.lerp(targetLookAt.current, lerpSpeed);
      camera.position.copy(controls.target).add(offset);

      // Check for completion
      const posDist = camera.position.distanceTo(targetPosition.current);
      const lookDist = controls.target.distanceTo(targetLookAt.current);

      if (posDist < 0.015 && lookDist < 0.015) {
        camera.position.copy(targetPosition.current);
        controls.target.copy(targetLookAt.current);
        isTransitioning.current = false;
      }
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2 + 0.15}
      minPolarAngle={0.15}
      autoRotate={autoRotate}
      autoRotateSpeed={1.0}
      makeDefault
    />
  );
}
