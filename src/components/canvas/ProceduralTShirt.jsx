import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useCustomizerStore } from '../../store/useCustomizerStore';

// Procedural fabric normal map for organic textile weave
function createFabricNormalMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 256, 256);
  
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const idx = (y * 256 + x) * 4;
      const patternX = (x % 4 < 2) ? 1 : -1;
      const patternY = (y % 4 < 2) ? 1 : -1;
      const noise = (Math.random() - 0.5) * 5;
      
      const val = patternX * patternY * 10 + noise;
      data[idx] = 128 + val;
      data[idx + 1] = 128 + val;
      data[idx + 2] = 255;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(28, 28);
  return texture;
}

export default function ProceduralTShirt() {
  const colors = useCustomizerStore(state => state.colors);
  const currentPartId = useCustomizerStore(state => state.currentPartId);
  const hoveredPartId = useCustomizerStore(state => state.hoveredPartId);
  const selectPart = useCustomizerStore(state => state.selectPart);
  const setHoveredPart = useCustomizerStore(state => state.setHoveredPart);

  const normalMap = useMemo(() => createFabricNormalMap(), []);

  const getMaterialProps = (partId) => {
    const isSelected = currentPartId === partId;
    const isHovered = hoveredPartId === partId;
    const baseColor = colors[partId] || '#ffffff';

    return {
      color: new THREE.Color(baseColor),
      roughness: 0.85,
      metalness: 0.05,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.035, 0.035),
      emissive: isSelected ? new THREE.Color('#333333') : isHovered ? new THREE.Color('#1a1a1a') : new THREE.Color('#000000'),
      emissiveIntensity: isSelected ? 0.08 : isHovered ? 0.04 : 0,
      side: THREE.DoubleSide,
    };
  };

  const handlePointerOver = (e, partId) => {
    e.stopPropagation();
    setHoveredPart(partId);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHoveredPart(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e, partId) => {
    e.stopPropagation();
    selectPart(partId);
  };

  // --- GEOMETRIES ---
  const frontBodyGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.88, 0.94, 2.0, 48, 32, true, -Math.PI / 2, Math.PI);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      let z = pos.getZ(i);

      if (y > 0.1 && y < 1.0) {
        const factor = Math.sin(((y - 0.1) / 0.9) * Math.PI);
        z += factor * 0.12 * Math.cos((x / 0.9) * (Math.PI / 2));
      }
      if (y < -0.2) {
        z += 0.02 * (y + 0.2);
      }
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const backBodyGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.88, 0.94, 2.0, 48, 32, true, Math.PI / 2, Math.PI);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      let z = pos.getZ(i);

      if (y > 0.3 && y < 0.9) {
        const factor = Math.sin(((y - 0.3) / 0.6) * Math.PI);
        z -= factor * 0.05 * Math.cos((x / 0.9) * (Math.PI / 2));
      }
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const collarGeo = useMemo(() => {
    const geo = new THREE.TorusGeometry(0.44, 0.055, 24, 64);
    geo.scale(1.0, 0.85, 1.2);
    return geo;
  }, []);

  const createWaveGeometry = (yOffset, amplitude = 0.06, freq = 3.2, thickness = 0.065) => {
    const points = [];
    const segments = 48;
    const width = 1.35;
    
    for (let i = 0; i <= segments; i++) {
      const u = (i / segments) * 2 - 1;
      const x = u * (width / 2);
      const y = yOffset + Math.sin(u * freq) * amplitude + Math.cos(u * 1.5) * 0.02;
      const z = Math.sqrt(Math.max(0, 0.88 * 0.88 - x * x)) * 0.58 + 0.035;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 64, thickness, 16, false);
  };

  const waveTopGeo = useMemo(() => createWaveGeometry(0.58, 0.05, 3.0, 0.048), []);
  const waveMidGeo = useMemo(() => createWaveGeometry(0.42, 0.045, 3.4, 0.044), []);
  const waveBotGeo = useMemo(() => createWaveGeometry(0.26, 0.04, 3.8, 0.040), []);

  const sleeveLeftGeo = useMemo(() => new THREE.CylinderGeometry(0.38, 0.32, 0.95, 32, 16), []);
  const sleeveRightGeo = useMemo(() => new THREE.CylinderGeometry(0.38, 0.32, 0.95, 32, 16), []);
  const hemGeo = useMemo(() => {
    const geo = new THREE.TorusGeometry(0.94, 0.045, 16, 64);
    geo.scale(1.0, 0.7, 1.0);
    return geo;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. FRONT BODY */}
      <mesh
        geometry={frontBodyGeo}
        onPointerOver={(e) => handlePointerOver(e, 'body_front')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'body_front')}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...getMaterialProps('body_front')} />
      </mesh>

      {/* 2. BACK BODY */}
      <mesh
        geometry={backBodyGeo}
        onPointerOver={(e) => handlePointerOver(e, 'body_back')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'body_back')}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...getMaterialProps('body_back')} />
      </mesh>

      {/* 3. COLLAR */}
      <mesh
        geometry={collarGeo}
        position={[0, 1.0, 0.02]}
        rotation={[Math.PI / 2 - 0.22, 0, 0]}
        onPointerOver={(e) => handlePointerOver(e, 'collar')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'collar')}
        castShadow
      >
        <meshStandardMaterial {...getMaterialProps('collar')} roughness={0.92} />
      </mesh>

      {/* 4. THREE RELIEF WAVES ON CHEST */}
      <mesh
        geometry={waveTopGeo}
        onPointerOver={(e) => handlePointerOver(e, 'waves_top')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'waves_top')}
        castShadow
      >
        <meshStandardMaterial {...getMaterialProps('waves_top')} />
      </mesh>

      <mesh
        geometry={waveMidGeo}
        onPointerOver={(e) => handlePointerOver(e, 'waves_mid')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'waves_mid')}
        castShadow
      >
        <meshStandardMaterial {...getMaterialProps('waves_mid')} />
      </mesh>

      <mesh
        geometry={waveBotGeo}
        onPointerOver={(e) => handlePointerOver(e, 'waves_bot')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'waves_bot')}
        castShadow
      >
        <meshStandardMaterial {...getMaterialProps('waves_bot')} />
      </mesh>

      {/* 5. SLEEVES */}
      <group position={[0.95, 0.72, 0]} rotation={[0.08, 0, -Math.PI / 4.2]}>
        <mesh
          geometry={sleeveLeftGeo}
          position={[0, -0.38, 0]}
          onPointerOver={(e) => handlePointerOver(e, 'sleeves')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'sleeves')}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial {...getMaterialProps('sleeves')} />
        </mesh>
      </group>

      <group position={[-0.95, 0.72, 0]} rotation={[0.08, 0, Math.PI / 4.2]}>
        <mesh
          geometry={sleeveRightGeo}
          position={[0, -0.38, 0]}
          onPointerOver={(e) => handlePointerOver(e, 'sleeves')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'sleeves')}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial {...getMaterialProps('sleeves')} />
        </mesh>
      </group>

      {/* 6. BOTTOM HEM */}
      <mesh
        geometry={hemGeo}
        position={[0, -1.0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={(e) => handlePointerOver(e, 'hem_bottom')}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, 'hem_bottom')}
        castShadow
      >
        <meshStandardMaterial {...getMaterialProps('hem_bottom')} />
      </mesh>
    </group>
  );
}
