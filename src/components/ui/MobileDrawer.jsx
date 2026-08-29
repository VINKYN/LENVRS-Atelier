import React from 'react';
import ColorPalette from './ColorPalette';

export default function MobileDrawer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t border-[#e5e5e5] h-[25vh] max-h-[25vh] min-h-[25vh] shadow-2xl flex flex-col overflow-hidden">
      {/* Color Palette strictly occupying compact lower quarter */}
      <div className="px-3 py-1.5 flex flex-col h-full min-h-0">
        <ColorPalette isMobile={true} />
      </div>
    </div>
  );
}
