import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useCustomizerStore } from '../../store/useCustomizerStore';

function DecalPlane({ url, position, rotation, scale, opacity }) {
  const texture = useTexture(url);

  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
    }
  }, [texture]);

  // Radians from degree
  const rotZ = (rotation * Math.PI) / 180;

  return (
    <group position={position} rotation={[0, 0, rotZ]}>
      <mesh position={[0, 0, 0.08]} castShadow>
        <planeGeometry args={[scale, scale]} />
        <meshBasicMaterial
          map={texture}
          transparent={true}
          opacity={opacity}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function DecalMesh() {
  const decal = useCustomizerStore(state => state.decal);

  if (!decal.enabled || !decal.url) return null;

  return (
    <React.Suspense fallback={null}>
      <DecalPlane
        url={decal.url}
        position={decal.position}
        rotation={decal.rotation}
        scale={decal.scale}
        opacity={decal.opacity}
      />
    </React.Suspense>
  );
}
