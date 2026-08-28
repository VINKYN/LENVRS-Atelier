import React from 'react';
import { VIEW_PRESETS } from '../../constants/garmentConfig';
import { useCustomizerStore } from '../../store/useCustomizerStore';

export default function ViewPresets() {
  const activePresetId = useCustomizerStore(state => state.activePresetId);
  const setPresetView = useCustomizerStore(state => state.setPresetView);

  return (
    <div className="flex items-center gap-1 p-1 bg-white/95 border border-[#e5e5e5] rounded-none shadow-xs backdrop-blur-xs">
      {VIEW_PRESETS.map((preset) => {
        const isActive = activePresetId === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => setPresetView(preset.id)}
            className={`px-3 py-1.5 rounded-none text-[11px] font-semibold transition-all duration-150 ${
              isActive
                ? 'bg-[#111111] text-white shadow-2xs'
                : 'text-[#666666] hover:text-[#111111] hover:bg-[#f5f5f5]'
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
