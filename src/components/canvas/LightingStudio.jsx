import React from 'react';
import { ContactShadows, Environment } from '@react-three/drei';

export default function LightingStudio() {
  return (
    <>
      {/* 1. Clean Studio HDRI Environment for Natural Luminescence */}
      <Environment preset="studio" environmentIntensity={0.55} />

      {/* 2. Bright Pure White Ambient Light */}
      <ambientLight intensity={1.1} color="#ffffff" />

      {/* 3. Main Studio Key Light (Top-Left 45°) */}
      <directionalLight
        position={[-2.5, 4.5, 4.0]}
        intensity={1.6}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* 4. Soft Right Fill Light */}
      <directionalLight
        position={[3.0, 2.5, 3.2]}
        intensity={1.1}
        color="#ffffff"
      />

      {/* 5. Underside Soft Bounce Light to brighten bottom folds */}
      <directionalLight
        position={[0, -2.5, 2.8]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* 6. Rim / Back Silhouette Light */}
      <directionalLight
        position={[0, 4.0, -3.5]}
        intensity={0.7}
        color="#ffffff"
      />

      {/* 7. Soft Ground Contact Shadow */}
      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.25}
        scale={6.5}
        blur={2.4}
        far={3.2}
        color="#181a20"
      />
    </>
  );
}
