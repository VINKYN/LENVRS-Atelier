import React from 'react';
import { X, Box, Keyboard, Layers, Sliders, Palette } from 'lucide-react';
import { useCustomizerStore } from '../../store/useCustomizerStore';

export default function InfoModal() {
  const isInfoModalOpen = useCustomizerStore(state => state.isInfoModalOpen);
  const setInfoModalOpen = useCustomizerStore(state => state.setInfoModalOpen);

  if (!isInfoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121216] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setInfoModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">DOSSIER TECHNIQUE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          LENVRS STUDIO // ARCHITECTURE 3D
        </h2>
        <p className="text-xs text-white/50 mt-1">
          Direction artistique inspirée du brutalisme chic et de la philosophie « Less is more » (Dieter Rams).
        </p>

        {/* Section 1: 3D Mesh Structure */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-white/80 uppercase">
            <Box className="w-4 h-4 text-white/60" />
            <span>STRUCTURE DES MAILLAGES (CLO 3D & BLENDER)</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 font-mono text-[11px] text-white/70 space-y-1.5">
            <div>• <strong className="text-white">Body_Front & Body_Back</strong> : Torse & dos avec retombée textile</div>
            <div>• <strong className="text-white">Collar</strong> : Col côtelé 1x1 avec matière élastique</div>
            <div>• <strong className="text-white">Sleeve_Left & Sleeve_Right</strong> : Manches courtes angulées</div>
            <div>• <strong className="text-white">Wave_Top, Wave_Middle, Wave_Bottom</strong> : 3 vagues en relief 3D</div>
            <div>• <strong className="text-white">Hem_Bottom</strong> : Ourlet bas avec surpiqûres & étiquette tissée</div>
          </div>
        </div>

        {/* Section 2: Shortcuts */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-white/80 uppercase">
            <Keyboard className="w-4 h-4 text-white/60" />
            <span>RACCOURCIS CLAVIER DE L'ATELIER</span>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white/50">Rotation 360°</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 text-[10px]">ESPACE</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white/50">Pièce Préc. / Suiv.</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 text-[10px]">← / →</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white/50">Harmonie Aléatoire</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 text-[10px]">R</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white/50">Exporter le design</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 text-[10px]">E</kbd>
            </div>
          </div>
        </div>

        {/* Section 3: Drag and drop info */}
        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-dashed border-white/15 text-xs text-white/60">
          <span className="text-white font-medium">Glisser-Déposer Direct :</span> Vous pouvez à tout moment glisser votre propre modèle 3D <code className="text-white bg-white/10 px-1 py-0.5 rounded">.glb</code> ou votre logo <code className="text-white bg-white/10 px-1 py-0.5 rounded">.png</code> directement sur la scène 3D.
        </div>
      </div>
    </div>
  );
}
