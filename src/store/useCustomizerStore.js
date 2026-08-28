import { create } from 'zustand';
import { GARMENT_PARTS, VIEW_PRESETS } from '../constants/garmentConfig';

const initialColors = {
  body_front: '#ffffff',
  waves_top: '#ffffff',
  waves_top_topstitch: '#8e9096',
  waves_mid: '#ffffff',
  waves_mid_topstitch: '#8e9096',
  waves_bot: '#ffffff',
  waves_bot_topstitch: '#8e9096',
  collar: '#ffffff',
  sleeve_left: '#ffffff',
  sleeve_right: '#ffffff',
  sleeve_cuff_left: '#ffffff',
  sleeve_cuff_right: '#ffffff',
  body_back: '#ffffff',
  hem_bottom: '#ffffff',
  topstitches: '#8e9096'
};

export const useCustomizerStore = create((set, get) => ({
  // Active part ID
  currentPartId: 'body_front',
  hoveredPartId: null,

  // Wave sub-mode: 'fabric' | 'topstitch'
  waveSubMode: 'fabric',
  setWaveSubMode: (mode) => set({ waveSubMode: mode }),

  // Colors per part
  colors: initialColors,

  // Recent colors applied
  recentColors: [
    '#ffffff',
    '#8e9096',
    '#111111',
    '#4b5563',
    '#d1d5db'
  ],

  // Camera & View
  cameraFocus: GARMENT_PARTS[0].cameraFocus,
  activePresetId: 'front',
  autoRotate: false,

  // Custom GLB URL
  customGlbUrl: null,

  // Modals & UI states
  isShareModalOpen: false,

  // History stack for undo/redo
  historyPast: [],
  historyFuture: [],

  // Canvas snapshot bridge
  captureSnapshot: null,
  setCaptureHandler: (fn) => set({ captureSnapshot: fn }),

  // Actions
  selectPart: (partId) => {
    const part = GARMENT_PARTS.find(p => p.id === partId);
    if (!part) return;
    set({
      currentPartId: partId,
      activePresetId: null,
      waveSubMode: 'fabric',
      cameraFocus: { ...part.cameraFocus }
    });
  },

  setHoveredPart: (partId) => set({ hoveredPartId: partId }),

  // Returns the actual color key to update (e.g. waves_top vs waves_top_topstitch)
  getActiveColorKey: () => {
    const { currentPartId, waveSubMode } = get();
    if (['waves_top', 'waves_mid', 'waves_bot'].includes(currentPartId) && waveSubMode === 'topstitch') {
      return `${currentPartId}_topstitch`;
    }
    return currentPartId;
  },

  setPartColor: (targetKey, colorHex) => {
    const { colors, recentColors, historyPast, getActiveColorKey } = get();
    const effectiveKey = targetKey || getActiveColorKey();

    if (colors[effectiveKey] === colorHex) return;

    const newPast = [...historyPast, { ...colors }].slice(-20);
    const newRecent = [colorHex, ...recentColors.filter(c => c.toLowerCase() !== colorHex.toLowerCase())].slice(0, 5);

    set({
      colors: {
        ...colors,
        [effectiveKey]: colorHex
      },
      recentColors: newRecent,
      historyPast: newPast,
      historyFuture: []
    });
  },

  applyRecentColor: (colorHex) => {
    const { getActiveColorKey, setPartColor } = get();
    const effectiveKey = getActiveColorKey();
    if (effectiveKey) {
      setPartColor(effectiveKey, colorHex);
    }
  },

  nextPart: () => {
    const { currentPartId, selectPart } = get();
    const currentIndex = GARMENT_PARTS.findIndex(p => p.id === currentPartId);
    const nextIndex = (currentIndex + 1) % GARMENT_PARTS.length;
    selectPart(GARMENT_PARTS[nextIndex].id);
  },

  prevPart: () => {
    const { currentPartId, selectPart } = get();
    const currentIndex = GARMENT_PARTS.findIndex(p => p.id === currentPartId);
    const prevIndex = (currentIndex - 1 + GARMENT_PARTS.length) % GARMENT_PARTS.length;
    selectPart(GARMENT_PARTS[prevIndex].id);
  },

  setPresetView: (presetId) => {
    const preset = VIEW_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    set({
      activePresetId: presetId,
      cameraFocus: { position: [...preset.position], target: [...preset.target] }
    });
  },

  toggleAutoRotate: () => set(state => ({ autoRotate: !state.autoRotate })),

  setCustomGlb: (url) => set({ customGlbUrl: url }),

  setShareModalOpen: (open) => set({ isShareModalOpen: open }),

  undo: () => {
    const { historyPast, historyFuture, colors } = get();
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, historyPast.length - 1);
    set({
      colors: previous,
      historyPast: newPast,
      historyFuture: [{ ...colors }, ...historyFuture]
    });
  },

  redo: () => {
    const { historyPast, historyFuture, colors } = get();
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);
    set({
      colors: next,
      historyPast: [...historyPast, { ...colors }],
      historyFuture: newFuture
    });
  }
}));
