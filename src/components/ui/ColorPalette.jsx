import React from 'react';
import { History } from 'lucide-react';
import { ALL_PANTONE_COLORS } from '../../constants/garmentConfig';
import { useCustomizerStore } from '../../store/useCustomizerStore';

export default function ColorPalette({ isMobile = false }) {
  const currentPartId = useCustomizerStore(state => state.currentPartId);
  const waveSubMode = useCustomizerStore(state => state.waveSubMode);
  const setWaveSubMode = useCustomizerStore(state => state.setWaveSubMode);
  const colors = useCustomizerStore(state => state.colors);
  const setPartColor = useCustomizerStore(state => state.setPartColor);
  const recentColors = useCustomizerStore(state => state.recentColors);
  const applyRecentColor = useCustomizerStore(state => state.applyRecentColor);
  const getActiveColorKey = useCustomizerStore(state => state.getActiveColorKey);

  const isWaveZone = ['waves_top', 'waves_mid', 'waves_bot'].includes(currentPartId);
  const activeColorKey = getActiveColorKey();
  const activeColorHex = (colors[activeColorKey] || '#ffffff').toLowerCase();

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${isMobile ? 'gap-1' : 'gap-3.5'}`}>
      {/* Wave Sub-Selector Rectangles (Tissu Vague vs Surpiqûre Vague) */}
      {isWaveZone && (
        <div className={`flex items-center gap-1 ${isMobile ? 'p-0.5' : 'p-1'} bg-[#f4f4f6] rounded-none flex-shrink-0`}>
          <button
            onClick={() => setWaveSubMode('fabric')}
            className={`flex-1 ${isMobile ? 'py-0.5 text-[10px]' : 'py-1.5 text-xs'} rounded-none font-semibold transition-all ${
              waveSubMode === 'fabric'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#707072] hover:text-[#111111]'
            }`}
          >
            Tissu Vague
          </button>
          <button
            onClick={() => setWaveSubMode('topstitch')}
            className={`flex-1 ${isMobile ? 'py-0.5 text-[10px]' : 'py-1.5 text-xs'} rounded-none font-semibold transition-all ${
              waveSubMode === 'topstitch'
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#707072] hover:text-[#111111]'
            }`}
          >
            Surpiqûre Vague
          </button>
        </div>
      )}

      {/* 1. RECENT COLORS - Compact single line on mobile */}
      <div className={`flex items-center justify-between ${isMobile ? 'py-0.5 border-b border-[#f0f0f0]' : 'flex-col gap-2 pb-3 border-b border-[#f0f0f0]'} flex-shrink-0`}>
        <div className={`flex items-center gap-1 ${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-[#707072]`}>
          <History className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-[#8e8e93]`} />
          <span>
            {isWaveZone && waveSubMode === 'topstitch'
              ? (isMobile ? 'Récents fil' : 'Couleur Surpiqûre Récente')
              : (isMobile ? 'Récents' : 'Couleurs Récentes')}
          </span>
        </div>

        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2.5'}`}>
          {recentColors.map((hex, idx) => {
            const isSelected = hex.toLowerCase() === activeColorHex;
            const isLight = hex.toLowerCase() === '#ffffff' || hex.toLowerCase().startsWith('#f');
            return (
              <button
                key={`${hex}-${idx}`}
                onClick={() => applyRecentColor(hex)}
                style={{ backgroundColor: hex }}
                className={`${isMobile ? 'w-4 h-4' : 'flex-1 aspect-square'} rounded-none transition-all active:scale-95 ${
                  isSelected
                    ? 'border-2 border-[#111111]'
                    : isLight
                    ? 'border border-[#dcdfe4]'
                    : 'border border-black/15'
                }`}
                title={`Appliquer ${hex}`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. TITLE: Nuancier de couleur */}
      <div className="flex items-center justify-between flex-shrink-0">
        <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold text-[#111111]`}>
          {isWaveZone && waveSubMode === 'topstitch'
            ? 'Nuancier Fil Surpiqûre'
            : 'Nuancier de couleur'}
        </span>
      </div>

      {/* 3. PANTONE SHARP SQUARES GRID (7-8 columns on mobile for maximum space and visibility) */}
      <div className={`flex-1 min-h-0 overflow-y-auto ${isMobile ? 'p-0.5 pr-1 grid grid-cols-7 sm:grid-cols-8 gap-1.5' : 'p-1 pr-1.5 grid grid-cols-6 gap-2.5'} content-start`}>
        {ALL_PANTONE_COLORS.map((colorItem) => {
          const isSelected = colorItem.hex.toLowerCase() === activeColorHex;
          const isLight = colorItem.hex.toLowerCase() === '#ffffff' || colorItem.hex.toLowerCase().startsWith('#f');
          return (
            <button
              key={`${colorItem.name}-${colorItem.hex}`}
              onClick={() => setPartColor(null, colorItem.hex)}
              style={{ backgroundColor: colorItem.hex }}
              className={`aspect-square rounded-none transition-all active:scale-95 relative ${
                isSelected
                  ? 'border-2 border-[#111111] scale-105 shadow-xs'
                  : isLight
                  ? 'border border-[#dcdfe4] hover:border-[#111111]'
                  : 'border border-black/15 hover:border-[#111111]'
              }`}
              title={colorItem.name}
            />
          );
        })}
      </div>
    </div>
  );
}
