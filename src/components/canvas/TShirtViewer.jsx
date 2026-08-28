import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Center, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import LightingStudio from './LightingStudio';
import CameraDirector from './CameraDirector';
import GLBTShirt from './GLBTShirt';
import { useCustomizerStore } from '../../store/useCustomizerStore';

function GarmentContainer({ children }) {
  const autoRotate = useCustomizerStore(state => state.autoRotate);
  return (
    <Float
      speed={autoRotate ? 0 : 1.0}
      rotationIntensity={0.03}
      floatIntensity={0.06}
      floatingRange={[-0.015, 0.015]}
    >
      <Center position={[0, 0, 0]}>
        {children}
      </Center>
    </Float>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
        <div className="w-8 h-8 rounded-full border-2 border-black/15 border-t-black animate-spin" />
        <span className="text-[11px] font-semibold tracking-wider text-black/60 font-sans uppercase">
          Chargement 3D...
        </span>
      </div>
    </Html>
  );
}

// 100% Identical Screen-Pipeline Snapshot Bridge in Perfect Front View
function CanvasSnapshotBridge() {
  const { gl, scene, camera } = useThree();
  const setCaptureHandler = useCustomizerStore(state => state.setCaptureHandler);

  useEffect(() => {
    setCaptureHandler(() => {
      try {
        // 1. Save active interactive camera state
        const originalPos = camera.position.clone();
        const originalRot = camera.rotation.clone();

        // 2. Set camera to Optimal Front View with zero cropping (collar & hem fully visible)
        camera.position.set(0, -0.01, 2.50);
        camera.lookAt(0, -0.01, 0);
        camera.updateProjectionMatrix();

        // 3. Render directly to screen buffer (exact tone mapping & lighting pipeline)
        gl.render(scene, camera);
        const dataUrl = gl.domElement.toDataURL('image/png');

        // 4. Restore original camera position
        camera.position.copy(originalPos);
        camera.rotation.copy(originalRot);
        camera.updateProjectionMatrix();
        gl.render(scene, camera);

        return dataUrl;
      } catch (err) {
        console.error('Snapshot capture error:', err);
        return null;
      }
    });
  }, [gl, scene, camera, setCaptureHandler]);

  return null;
}

export default function TShirtViewer() {
  const canvasRef = useRef();
  const customGlbUrl = useCustomizerStore(state => state.customGlbUrl);
  const setCustomGlb = useCustomizerStore(state => state.setCustomGlb);

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
        const url = URL.createObjectURL(file);
        setCustomGlb(url);
      }
    }
  };

  return (
    <div
      className="relative w-full h-full nike-studio-bg select-none overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 3D Canvas with 50mm Lens (FOV 28°) */}
      <Canvas
        ref={canvasRef}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, -0.05, 4.4], fov: 28, near: 0.1, far: 50 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance'
        }}
        shadows
        className="w-full h-full"
      >
        <CanvasSnapshotBridge />
        <LightingStudio />
        <CameraDirector />

        <Suspense fallback={<Loader />}>
          <GarmentContainer>
            <GLBTShirt url={customGlbUrl || `${import.meta.env.BASE_URL}models/tshirt.glb`} />
          </GarmentContainer>
        </Suspense>
      </Canvas>

      {/* Drag & Drop Visual Cue */}
      {isDragOver && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs border-2 border-dashed border-black/50 flex flex-col items-center justify-center pointer-events-none transition-all z-20">
          <div className="p-4 rounded-full bg-white shadow-xl mb-3">
            <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="font-semibold text-xs tracking-wider text-white uppercase font-sans">
            DÉPOSEZ VOTRE FICHIER 3D CLO 3D (.GLB)
          </p>
        </div>
      )}
    </div>
  );
}
