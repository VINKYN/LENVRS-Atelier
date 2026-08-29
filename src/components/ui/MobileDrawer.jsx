import React from 'react';
import StepNavigation from './StepNavigation';
import ColorPalette from './ColorPalette';

export default function MobileDrawer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#e5e5e5] h-[34vh] max-h-[34vh] min-h-[34vh] shadow-2xl flex flex-col overflow-hidden">
      {/* Content strictly fitting 1/3 of the screen */}
      <div className="px-3.5 pt-2 pb-1 flex flex-col h-full min-h-0">
        <StepNavigation isMobile={true} />
        <div className="flex-1 min-h-0 mt-1.5 overflow-hidden flex flex-col">
          <ColorPalette isMobile={true} />
        </div>
      </div>
    </div>
  );
}
