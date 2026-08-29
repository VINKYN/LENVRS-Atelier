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

// 100% Identical Studio Lighting & Pipeline Snapshot (Zero Overexposure, Full Sleeves on both PC & Mobile)
function CanvasSnapshotBridge() {
  const { gl, scene, camera } = useThree();
  const setCaptureHandler = useCustomizerStore(state => state.setCaptureHandler);

  useEffect(() => {
    setCaptureHandler(() => {
      try {
        // 1. Save original interactive camera state
        const origPos = camera.position.clone();
        const origRot = camera.rotation.clone();
        const origFov = camera.fov;

        // 2. Exact Studio 50mm Front View (Z = 3.00 for full frame garment, lookAt [0, -0.05, 0])
        camera.position.set(0, -0.05, 3.00);
        camera.lookAt(0, -0.05, 0);

        // 3. Adapt FOV so narrow mobile screens capture the full horizontal width (sleeves) exactly like PC
        const aspect = gl.domElement.width / gl.domElement.height;
        if (aspect < 1.0) {
          const halfFovRad = (28 * Math.PI) / 360;
          const adaptedHalfFov = Math.atan(Math.tan(halfFovRad) / aspect);
          camera.fov = (adaptedHalfFov * 360) / Math.PI;
        } else {
          camera.fov = 28;
        }
        camera.updateProjectionMatrix();

        // 4. Render through the live studio pipeline (perfect ACESFilmic tone mapping & shadow quality)
        gl.render(scene, camera);
        const dataUrl = gl.domElement.toDataURL('image/png');

        // 5. Restore user camera
        camera.position.copy(origPos);
        camera.rotation.copy(origRot);
        camera.fov = origFov;
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
