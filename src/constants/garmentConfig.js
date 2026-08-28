import pantoneData from './pantoneColors.json';

// 50mm Optical Equivalent Camera Focus with Compact Sizing (FOV 28°)
export const GARMENT_PARTS = [
  {
    id: 'body_front',
    label: 'CORPS AVANT',
    sublabel: 'Torse principal & face',
    meshNames: ['body_front', 'Body_Front'],
    cameraFocus: { position: [0, -0.05, 4.4], target: [0, -0.05, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'waves_top',
    label: 'VAGUE SUPÉRIEURE',
    sublabel: 'Relief haut de poitrine',
    meshNames: ['wave_top', 'Wave_Top'],
    cameraFocus: { position: [0, 0.22, 1.15], target: [0, 0.20, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'waves_mid',
    label: 'VAGUE MÉDIANE',
    sublabel: 'Relief central de poitrine',
    meshNames: ['wave_middle', 'Wave_Middle'],
    cameraFocus: { position: [0, 0.14, 1.15], target: [0, 0.12, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'waves_bot',
    label: 'VAGUE INFÉRIEURE',
    sublabel: 'Relief bas de poitrine',
    meshNames: ['wave_bottom', 'Wave_Bottom'],
    cameraFocus: { position: [0, 0.05, 1.15], target: [0, 0.03, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'collar',
    label: 'COL CÔTELÉ',
    sublabel: 'Encolure renforcée 1x1',
    meshNames: ['collar', 'Collar', 'rib', 'RIB_2494'],
    cameraFocus: { position: [0, 0.38, 1.55], target: [0, 0.32, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'sleeve_left',
    label: 'MANCHE GAUCHE',
    sublabel: 'Épaule & manche gauche',
    meshNames: ['sleeve_left', 'Sleeve_Left'],
    cameraFocus: { position: [-1.6, 0.05, 2.8], target: [-0.3, -0.05, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'sleeve_cuff_left',
    label: 'BORD GAUCHE',
    sublabel: 'Bordure manche gauche',
    meshNames: ['20'],
    cameraFocus: { position: [-1.5, -0.1, 2.2], target: [-0.4, -0.1, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'sleeve_right',
    label: 'MANCHE DROITE',
    sublabel: 'Épaule & manche droite',
    meshNames: ['sleeve_right', 'Sleeve_Right'],
    cameraFocus: { position: [1.6, 0.05, 2.8], target: [0.3, -0.05, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'sleeve_cuff_right',
    label: 'BORD DROIT',
    sublabel: 'Bordure manche droite',
    meshNames: ['21'],
    cameraFocus: { position: [1.5, -0.1, 2.2], target: [0.4, -0.1, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'body_back',
    label: 'CORPS ARRIÈRE',
    sublabel: 'Dos & carrure dorsale',
    meshNames: ['body_back', 'Body_Back'],
    cameraFocus: { position: [0, -0.05, -4.4], target: [0, -0.05, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'hem_bottom',
    label: 'OURLET BAS',
    sublabel: 'Finition basse',
    meshNames: ['hem_bottom', 'Hem_Bottom'],
    cameraFocus: { position: [0, -0.32, 2.3], target: [0, -0.36, 0] },
    defaultColor: '#ffffff'
  },
  {
    id: 'topstitches',
    label: 'SURPIQÛRES',
    sublabel: 'Surpiqûres col, manches, ourlet & corps',
    meshNames: ['topstitch', 'Topstitch'],
    cameraFocus: { position: [0, 0.0, 3.8], target: [0, -0.05, 0] },
    defaultColor: '#8e9096'
  }
];

export const VIEW_PRESETS = [
  { id: 'front', label: 'Face', position: [0, -0.05, 4.4], target: [0, -0.05, 0] },
  { id: 'back', label: 'Dos', position: [0, -0.05, -4.4], target: [0, -0.05, 0] },
  { id: 'profile', label: 'Profil', position: [3.8, 0.1, 2.1], target: [0, -0.05, 0] },
  { id: 'waves_detail', label: 'Détail Vagues', position: [0, 0.14, 1.15], target: [0, 0.12, 0] },
  { id: 'collar_detail', label: 'Détail Col', position: [0, 0.38, 1.55], target: [0, 0.32, 0] },
];

// Blanc Pur #FFFFFF et Noir #000000 placés tout en haut du nuancier
export const ALL_PANTONE_COLORS = [
  { name: 'PANTONE Blanc Pur', hex: '#FFFFFF' },
  { name: 'PANTONE Noir Pur', hex: '#000000' },
  ...pantoneData
];
