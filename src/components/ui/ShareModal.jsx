import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Mail, 
  Instagram,
  AtSign
} from 'lucide-react';
import { useCustomizerStore } from '../../store/useCustomizerStore';
import { generateEmailSummary, generateInstagramStoryCard } from '../../utils/canvasExport';

export default function ShareModal() {
  const isShareModalOpen = useCustomizerStore(state => state.isShareModalOpen);
  const setShareModalOpen = useCustomizerStore(state => state.setShareModalOpen);
  const captureSnapshot = useCustomizerStore(state => state.captureSnapshot);
  const colors = useCustomizerStore(state => state.colors);

  const [instagramHandle, setInstagramHandle] = useState('');
  const [storyCardUrl, setStoryCardUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate or re-generate story card when modal opens, handle changes, or colors change
  useEffect(() => {
    if (isShareModalOpen && captureSnapshot) {
      setIsGenerating(true);
      const imgData = captureSnapshot();
      if (imgData) {
        generateInstagramStoryCard(imgData, colors, instagramHandle)
          .then(storyUrl => {
            setStoryCardUrl(storyUrl);
            setIsGenerating(false);
          })
          .catch(() => setIsGenerating(false));
      } else {
        setIsGenerating(false);
      }
    }
  }, [isShareModalOpen, captureSnapshot, colors, instagramHandle]);

  if (!isShareModalOpen) return null;

  // 1. Direct Download Story Render Image (No confetti)
  const handleDownload = () => {
    if (!storyCardUrl) return;
    const a = document.createElement('a');
    a.href = storyCardUrl;
    a.download = `lenvrs-atelier-${Date.now()}.png`;
    a.click();
  };

  // 2. Share to Instagram
  const handleShareInstagram = async () => {
    if (storyCardUrl && navigator.canShare) {
      try {
        const res = await fetch(storyCardUrl);
        const blob = await res.blob();
        const file = new File([blob], 'lenvrs-atelier-story.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'LENVRS Atelier',
            text: 'Ma création sur-mesure LENVRS Atelier'
          });
          return;
        }
      } catch (err) {
        console.log('Web share fallback', err);
      }
    }

    handleDownload();
    setTimeout(() => {
      window.open('https://www.instagram.com', '_blank');
    }, 500);
  };

  // 3. Send by Email
  const handleSendEmail = () => {
    const mailtoUrl = generateEmailSummary(colors);
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn">
      {/* Modal Container (Sharp Pure Rectangle) */}
      <div className="relative w-full max-w-md bg-white rounded-none p-6 sm:p-7 shadow-2xl flex flex-col items-center border border-[#e5e5e5]">
        {/* Close Button */}
        <button
          onClick={() => setShareModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-none text-[#707072] hover:text-[#111111] hover:bg-[#f5f5f5] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <h2 className="text-lg font-bold text-[#111111] tracking-tight text-center">
          Votre Pièce Sur-Mesure
        </h2>
        <p className="text-xs text-[#707072] text-center mt-0.5 mb-4">
          Édition officielle au format Story Instagram 9:16
        </p>

        {/* Instagram Handle Input */}
        <div className="w-full mb-3.5">
          <label className="block text-[10px] font-semibold tracking-wider text-[#707072] uppercase mb-1.5 font-sans">
            Personnaliser la signature
          </label>
          <div className="relative flex items-center">
            <AtSign className="absolute left-3 w-4 h-4 text-[#8e8e93]" />
            <input
              type="text"
              value={instagramHandle.replace(/^@/, '')}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="votre_pseudo_instagram"
              className="w-full pl-9 pr-4 py-2 bg-[#f6f6f8] border border-[#e5e5e5] rounded-none text-xs text-[#111111] placeholder-[#a0a0a5] focus:outline-none focus:border-black font-sans transition-all"
            />
          </div>
        </div>

        {/* Story Format Preview Card */}
        <div className="relative w-full flex items-center justify-center max-h-[340px] mb-5 overflow-hidden rounded-none bg-[#eff1f5] border border-[#e5e5e5] p-2 shadow-inner">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="w-8 h-8 rounded-none border-2 border-[#111111]/20 border-t-[#111111] animate-spin" />
              <span className="text-xs font-medium text-[#707072]">Génération de l'édition...</span>
            </div>
          ) : storyCardUrl ? (
            <img
              src={storyCardUrl}
              alt="Story 9:16 Preview"
              className="max-h-[320px] w-auto object-contain rounded-none shadow-md aspect-[9/16]"
            />
          ) : (
            <div className="text-xs text-[#8e8e93] py-12">Visuel en cours de préparation...</div>
          )}
        </div>

        {/* Action Buttons (Sharp Pure Rectangles) */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-none bg-[#111111] text-white font-medium text-xs sm:text-sm hover:bg-black transition-all active:scale-98 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger la Story HD</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareInstagram}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-none bg-[#f6f6f6] border border-[#e5e5e5] text-[#111111] font-medium text-xs hover:bg-[#ececec] transition-all active:scale-98"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-none bg-[#f6f6f6] border border-[#e5e5e5] text-[#111111] font-medium text-xs hover:bg-[#ececec] transition-all active:scale-98"
            >
              <Mail className="w-4 h-4" />
              <span>E-mail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
