import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { GARMENT_PARTS } from '../../constants/garmentConfig';
import { useCustomizerStore } from '../../store/useCustomizerStore';

export default function StepNavigation({ isMobile = false }) {
  const currentPartId = useCustomizerStore(state => state.currentPartId);
  const nextPart = useCustomizerStore(state => state.nextPart);
  const prevPart = useCustomizerStore(state => state.prevPart);
  const selectPart = useCustomizerStore(state => state.selectPart);

  const currentIndex = GARMENT_PARTS.findIndex(p => p.id === currentPartId);
  const currentPart = GARMENT_PARTS[currentIndex] || GARMENT_PARTS[0];

  return (
    <div className={`flex flex-col ${isMobile ? 'gap-1.5 pb-1.5' : 'gap-3 pb-3'} border-b border-[#f0f0f0] flex-shrink-0`}>
      {/* Navigation Bar: Arrow Left | Part Name 1/12 | Arrow Right */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevPart}
          className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-none border border-[#e5e5e5] text-[#111111] hover:bg-[#f5f5f5] transition-all active:scale-95`}
          title="Étape précédente"
        >
          <ArrowLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} stroke-[1.75]`} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <h2 className={`${isMobile ? 'text-xs' : 'text-base'} font-semibold text-[#111111] tracking-tight uppercase`}>
              {currentPart.label}
            </h2>
            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-normal text-[#707072]`}>
              {currentIndex + 1}/{GARMENT_PARTS.length}
            </span>
          </div>
        </div>

        <button
          onClick={nextPart}
          className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-none border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-all active:scale-95`}
          title="Étape suivante"
        >
          <ArrowRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} stroke-[1.75]`} />
        </button>
      </div>

      {/* Pure Rectangular Progress Segments */}
      <div className="flex items-center gap-1 w-full pt-0.5">
        {GARMENT_PARTS.map((part, idx) => {
          const isActive = part.id === currentPartId;
          const isPassed = idx < currentIndex;
          return (
            <button
              key={part.id}
              onClick={() => selectPart(part.id)}
              className={`${isMobile ? 'h-0.5' : 'h-1'} flex-1 rounded-none transition-all duration-200 ${
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
