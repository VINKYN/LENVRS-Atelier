import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { GARMENT_PARTS } from '../../constants/garmentConfig';
import { useCustomizerStore } from '../../store/useCustomizerStore';

export default function StepNavigation() {
  const currentPartId = useCustomizerStore(state => state.currentPartId);
  const nextPart = useCustomizerStore(state => state.nextPart);
  const prevPart = useCustomizerStore(state => state.prevPart);
  const selectPart = useCustomizerStore(state => state.selectPart);

  const currentIndex = GARMENT_PARTS.findIndex(p => p.id === currentPartId);
  const currentPart = GARMENT_PARTS[currentIndex] || GARMENT_PARTS[0];

  return (
    <div className="flex flex-col gap-3 pb-3 border-b border-[#f0f0f0]">
      {/* Navigation Bar: Arrow Left | Part Name 1/12 | Arrow Right */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevPart}
          className="p-2 rounded-none border border-[#e5e5e5] text-[#111111] hover:bg-[#f5f5f5] transition-all active:scale-95"
          title="Étape précédente"
        >
          <ArrowLeft className="w-5 h-5 stroke-[1.75]" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#111111] tracking-tight">
              {currentPart.label}
            </h2>
            <span className="text-xs font-normal text-[#707072]">
              {currentIndex + 1}/{GARMENT_PARTS.length}
            </span>
          </div>
        </div>

        <button
          onClick={nextPart}
          className="p-2 rounded-none border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-all active:scale-95"
          title="Étape suivante"
        >
          <ArrowRight className="w-5 h-5 stroke-[1.75]" />
        </button>
      </div>

      {/* Pure Rectangular Progress Segments (No rounded corners) */}
      <div className="flex items-center gap-1 w-full pt-1">
        {GARMENT_PARTS.map((part, idx) => {
          const isActive = part.id === currentPartId;
          const isPassed = idx < currentIndex;
          return (
            <button
              key={part.id}
              onClick={() => selectPart(part.id)}
              className={`h-1 flex-1 rounded-none transition-all duration-200 ${
                isActive
                  ? 'bg-[#111111]'
                  : isPassed
                  ? 'bg-[#b8bcc5]'
                  : 'bg-[#e5e7eb] hover:bg-[#b8bcc5]'
              }`}
              title={`${part.label} (${idx + 1}/${GARMENT_PARTS.length})`}
            />
          );
        })}
      </div>
    </div>
  );
}
