import React from 'react';
import { 
  RotateCw, 
  Undo2, 
  Redo2, 
  Share2
} from 'lucide-react';
import { useCustomizerStore } from '../../store/useCustomizerStore';

export default function Header() {
  const autoRotate = useCustomizerStore(state => state.autoRotate);
  const toggleAutoRotate = useCustomizerStore(state => state.toggleAutoRotate);
  const undo = useCustomizerStore(state => state.undo);
  const redo = useCustomizerStore(state => state.redo);
  const historyPast = useCustomizerStore(state => state.historyPast);
  const historyFuture = useCustomizerStore(state => state.historyFuture);
  const setShareModalOpen = useCustomizerStore(state => state.setShareModalOpen);

  return (
    <header className="h-16 w-full border-b border-[#e5e5e5] bg-white flex items-center justify-between px-6 sm:px-8 z-30 flex-shrink-0">
      {/* Top Left: Product Title */}
      <div>
        <h1 className="font-semibold tracking-tight text-base sm:text-lg text-[#111111]">
          T-Shirt Architectural Relief By You
        </h1>
      </div>

      {/* Top Right: Undo/Redo, 360, "Terminé" Button (Clean & perfectly aligned) */}
      <div className="flex items-center gap-2.5">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#f7f7f8] border border-[#e5e5e5] rounded-full p-0.5 shadow-2xs">
          <button
            onClick={undo}
            disabled={historyPast.length === 0}
            className="p-1.5 rounded-full text-[#111111] hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent transition-all"
            title="Annuler"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyFuture.length === 0}
            className="p-1.5 rounded-full text-[#111111] hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent transition-all"
            title="Rétablir"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* 360 Auto-Rotate */}
        <button
          onClick={toggleAutoRotate}
          className={`p-2 rounded-full border transition-all active:scale-95 ${
            autoRotate
              ? 'bg-[#111111] text-white border-[#111111]'
              : 'bg-[#f7f7f8] border-[#e5e5e5] text-[#111111] hover:bg-white'
          }`}
          title="Rotation 360°"
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        </button>

        {/* Primary CTA: "Terminé" */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#111111] text-white font-medium text-xs sm:text-sm tracking-wide hover:bg-black transition-all active:scale-95 shadow-sm ml-1"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Terminé</span>
        </button>
      </div>
    </header>
  );
}
