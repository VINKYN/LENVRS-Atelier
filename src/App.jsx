import React, { useEffect } from 'react';
import { Undo2, Redo2, Share2 } from 'lucide-react';
import { useCustomizerStore } from './store/useCustomizerStore';
import TShirtViewer from './components/canvas/TShirtViewer';
import ViewPresets from './components/ui/ViewPresets';
import StepNavigation from './components/ui/StepNavigation';
import ColorPalette from './components/ui/ColorPalette';
import ShareModal from './components/ui/ShareModal';
import MobileDrawer from './components/ui/MobileDrawer';

export default function App() {
  const autoRotate = useCustomizerStore(state => state.autoRotate);
  const toggleAutoRotate = useCustomizerStore(state => state.toggleAutoRotate);
  const nextPart = useCustomizerStore(state => state.nextPart);
  const prevPart = useCustomizerStore(state => state.prevPart);
  const setShareModalOpen = useCustomizerStore(state => state.setShareModalOpen);
  const undo = useCustomizerStore(state => state.undo);
  const redo = useCustomizerStore(state => state.redo);
  const historyPast = useCustomizerStore(state => state.historyPast);
  const historyFuture = useCustomizerStore(state => state.historyFuture);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleAutoRotate();
      } else if (e.key === 'ArrowRight') {
        nextPart();
      } else if (e.key === 'ArrowLeft') {
        prevPart();
      } else if (e.key === 'e' || e.key === 'E') {
        setShareModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAutoRotate, nextPart, prevPart, setShareModalOpen, undo, redo]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white text-[#111111] flex font-sans select-none">
      {/* LEFT: Full Height 3D Studio Canvas Viewport */}
      <main className="relative flex-1 min-w-0 h-full overflow-hidden bg-white">
        {/* 3D Canvas */}
        <TShirtViewer />

        {/* Floating Top-Left Official Brand Logo */}
        <div className="absolute top-3 left-4 md:top-6 md:left-7 z-20 pointer-events-auto">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="LENVRS Atelier"
            className="h-8 sm:h-10 md:h-14 w-auto object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Floating Top-Right Action Controls (Sharp Rectangles) */}
        <div className="absolute top-3 right-4 md:top-6 md:right-7 z-20 flex items-center gap-1.5 md:gap-2 pointer-events-auto">
          {/* Undo / Redo */}
          <div className="flex items-center bg-white/95 border border-[#e5e5e5] rounded-none p-0.5 shadow-xs backdrop-blur-xs">
            <button
              onClick={undo}
              disabled={historyPast.length === 0}
              className="p-1 md:p-1.5 rounded-none text-[#111111] hover:bg-[#f0f0f0] disabled:opacity-25 disabled:hover:bg-transparent transition-all"
              title="Annuler"
            >
              <Undo2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyFuture.length === 0}
              className="p-1 md:p-1.5 rounded-none text-[#111111] hover:bg-[#f0f0f0] disabled:opacity-25 disabled:hover:bg-transparent transition-all"
              title="Rétablir"
            >
              <Redo2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>

          {/* 360 Auto-Rotate (Pure 360° Text Badge) */}
          <button
            onClick={toggleAutoRotate}
            className={`px-2 py-1.5 md:px-3 md:py-2 rounded-none border text-[11px] md:text-xs font-bold tracking-tight transition-all active:scale-95 shadow-xs font-sans ${
              autoRotate
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white/95 border-[#e5e5e5] text-[#111111] hover:bg-[#f0f0f0] backdrop-blur-xs'
            }`}
            title="Activer/Désactiver la rotation 360°"
          >
            360°
          </button>

          {/* Primary CTA: "Terminé" */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2 rounded-none bg-[#111111] text-white font-medium text-xs md:text-sm tracking-wide hover:bg-black transition-all active:scale-95 shadow-xs ml-0.5 md:ml-1"
          >
            <Share2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>Terminé</span>
          </button>
        </div>

        {/* Floating Bottom-Center View Presets (Floats above 1/3 drawer on mobile, standard on desktop) */}
        <div className="absolute bottom-[35.5vh] md:bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto scale-90 md:scale-100 origin-bottom">
          <ViewPresets />
        </div>
      </main>

      {/* RIGHT: Lateral Control Panel (Desktop: Completely untouched) */}
      <aside className="hidden md:flex w-[380px] lg:w-[410px] flex-shrink-0 h-full flex-col bg-white border-l border-[#e5e5e5] z-20 p-7 pt-7 pb-4 shadow-xs">
        {/* Step Navigation Bar */}
        <div className="flex-shrink-0 mb-3">
          <StepNavigation />
        </div>

        {/* Square Color Swatches */}
        <ColorPalette />
      </aside>

      {/* MOBILE BOTTOM DRAWER (Mobile: strictly 1/3 of the screen height) */}
      <MobileDrawer />

      {/* SHARE / EXPORT MODAL */}
      <ShareModal />
    </div>
  );
}
