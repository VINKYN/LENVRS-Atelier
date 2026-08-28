import React from 'react';
import StepNavigation from './StepNavigation';
import ColorPalette from './ColorPalette';

export default function MobileDrawer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#e5e5e5] rounded-none shadow-2xl flex flex-col max-h-[82vh]">
      {/* Pull Pill */}
      <div className="flex flex-col items-center pt-3 pb-2 px-6">
        <div className="w-10 h-1 rounded-none bg-[#d1d1d6] mb-1" />
      </div>

      {/* Content */}
      <div className="p-5 pt-1 overflow-y-auto space-y-4 pb-8">
        <StepNavigation />
        <ColorPalette />
      </div>
    </div>
  );
}
