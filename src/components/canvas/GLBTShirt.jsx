import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useCustomizerStore } from '../../store/useCustomizerStore';
import { GARMENT_PARTS } from '../../constants/garmentConfig';

function findPartIdForObject(obj) {
  const name = (obj.name || '').trim();
  const parentName = (obj.parent?.name || '').trim();
  const nameLower = name.toLowerCase();
  const parentLower = parentName.toLowerCase();
  const combined = `${nameLower} ${parentLower}`;

  // 1. Specific Wave Topstitches
  if (combined.includes('topstitch_3372213') || combined.includes('3372213')) {
    return 'waves_top_topstitch';
  }
  if (combined.includes('topstitch_3424276') || combined.includes('3424276')) {
    return 'waves_mid_topstitch';
  }
  if (combined.includes('topstitch_3424775') || combined.includes('3424775')) {
    return 'waves_bot_topstitch';
  }

  // 2. Global Topstitches
  if (combined.includes('topstitch')) {
    return 'topstitches';
  }

  // 3. Numeric Cuffs (20 = Left Cuff, 21 = Right Cuff)
  if (name === '20' || name.startsWith('20_') || parentName === '20') {
    return 'sleeve_cuff_left';
  }
  if (name === '21' || name.startsWith('21_') || parentName === '21') {
    return 'sleeve_cuff_right';
  }

  // 4. Sleeves Left / Right
  if (combined.includes('sleeve_left') || combined.includes('left_sleeve') || combined.includes('manche_gauche')) {
    return 'sleeve_left';
  }
  if (combined.includes('sleeve_right') || combined.includes('right_sleeve') || combined.includes('manche_droite')) {
    return 'sleeve_right';
  }

  // 5. Body Front / Back
  if (combined.includes('body_front') || combined.includes('front') || combined.includes('devant')) {
    return 'body_front';
  }
  if (combined.includes('body_back') || combined.includes('back') || combined.includes('dos')) {
    return 'body_back';
  }

  // 6. Waves, Collar & Hem
  if (combined.includes('collar') || combined.includes('col') || combined.includes('rib')) {
    return 'collar';
  }
  if (combined.includes('wave_top') || combined.includes('wavetop') || combined.includes('vague1')) {
    return 'waves_top';
  }
  if (combined.includes('wave_middle') || combined.includes('wave_mid') || combined.includes('vague2')) {
    return 'waves_mid';
  }
  if (combined.includes('wave_bottom') || combined.includes('wave_bot') || combined.includes('vague3')) {
    return 'waves_bot';
  }
  if (combined.includes('hem_bottom') || combined.includes('hem') || combined.includes('ourlet')) {
    return 'hem_bottom';
  }

  for (const part of GARMENT_PARTS) {
    if (part.meshNames.some(pName => combined.includes(pName.toLowerCase()))) {
      return part.id;
    }
  }

  return 'body_front';
}

export default function GLBTShirt({ url = '/models/tshirt.glb' }) {
  const { scene } = useGLTF(url);
  const colors = useCustomizerStore(state => state.colors);
  const currentPartId = useCustomizerStore(state => state.currentPartId);
  const waveSubMode = useCustomizerStore(state => state.waveSubMode);
  const hoveredPartId = useCustomizerStore(state => state.hoveredPartId);
  const selectPart = useCustomizerStore(state => state.selectPart);
  const setHoveredPart = useCustomizerStore(state => state.setHoveredPart);

  const meshMapRef = useRef([]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    meshMapRef.current = [];

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const targetSize = 1.22;
      const scaleFactor = targetSize / maxDim;
      clone.scale.setScalar(scaleFactor);
      clone.position.set(
        -center.x * scaleFactor,
        -center.y * scaleFactor,
        -center.z * scaleFactor
      );
    }

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const partId = findPartIdForObject(child);
        child.userData.partId = partId;

        if (child.material) {
          const origMat = child.material;
          child.material = origMat.clone();
          child.material.side = THREE.DoubleSide;
          child.material.roughness = 0.65;
          child.material.metalness = 0.0;
          child.material.envMapIntensity = 0.45;

          if (child.material.normalMap) {
            child.material.normalScale = new THREE.Vector2(0.5, 0.5);
          }
        }

        meshMapRef.current.push(child);
      }
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    for (const child of meshMapRef.current) {
      if (!child.material) continue;

      const partId = child.userData.partId;
      const hexColor = colors[partId] || '#ffffff';

      let isSelected = currentPartId === partId;
      if (['waves_top', 'waves_mid', 'waves_bot'].includes(currentPartId)) {
        if (waveSubMode === 'topstitch' && partId === `${currentPartId}_topstitch`) {
          isSelected = true;
        } else if (waveSubMode === 'fabric' && partId === currentPartId) {
          isSelected = true;
        }
      }

      const isHovered = hoveredPartId === partId;

      child.material.color.set(hexColor);

      if (isSelected) {
        child.material.emissive.set('#222222');
        child.material.emissiveIntensity = 0.08;
      } else if (isHovered) {
        child.material.emissive.set('#111111');
        child.material.emissiveIntensity = 0.04;
      } else {
        child.material.emissive.set('#000000');
        child.material.emissiveIntensity = 0;
      }
    }
  }, [colors, currentPartId, waveSubMode, hoveredPartId]);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (e.object?.userData?.partId) {
      setHoveredPart(e.object.userData.partId);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHoveredPart(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (e.object?.userData?.partId) {
      const partId = e.object.userData.partId;
      if (partId.includes('_topstitch')) {
        const baseWave = partId.replace('_topstitch', '');
        selectPart(baseWave);
        useCustomizerStore.getState().setWaveSubMode('topstitch');
      } else {
        selectPart(partId);
      }
    }
  };

  return (
    <primitive
      object={clonedScene}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}

useGLTF.preload('/models/tshirt.glb');
