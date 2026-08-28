import React, { useRef } from 'react';
import { Upload, Trash2, Eye, EyeOff, Plus } from 'lucide-react';
import { SAMPLE_DECALS } from '../../constants/garmentConfig';
import { useCustomizerStore } from '../../store/useCustomizerStore';

export default function DecalUploader() {
  const fileInputRef = useRef();
  const decal = useCustomizerStore(state => state.decal);
  const setDecalImage = useCustomizerStore(state => state.setDecalImage);
  const setDecalScale = useCustomizerStore(state => state.setDecalScale);
  const setDecalRotation = useCustomizerStore(state => state.setDecalRotation);
  const setDecalOpacity = useCustomizerStore(state => state.setDecalOpacity);
  const toggleDecal = useCustomizerStore(state => state.toggleDecal);
  const removeDecal = useCustomizerStore(state => state.removeDecal);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDecalImage(url, file.name);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
            Graphismes & Logos
          </span>
          <span className="text-xs text-[#707072] mt-0.5">
            Apposez un badge d'atelier ou importez votre visuel
          </span>
        </div>

        {decal.url && (
          <div className="flex items-center gap-1">
            <button
              onClick={toggleDecal}
              className="p-1.5 rounded-full text-[#555555] hover:bg-[#f0f0f0] transition-all"
              title={decal.enabled ? "Masquer le visuel" : "Afficher le visuel"}
            >
              {decal.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={removeDecal}
              className="p-1.5 rounded-full text-[#707072] hover:text-red-500 hover:bg-red-50 transition-all"
              title="Supprimer le visuel"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Upload Custom Image Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-dashed border-[#d1d1d6] hover:border-[#111111] bg-[#fafafa] hover:bg-[#f5f5f5] transition-all aspect-square group active:scale-95 text-center"
        >
          <Upload className="w-4 h-4 text-[#707072] group-hover:text-black mb-1 transition-colors" />
          <span className="text-[10px] font-semibold text-[#555555] uppercase">Upload</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/svg+xml, image/webp"
            onChange={handleFileUpload}
            className="sr-only"
          />
        </button>

        {/* Sample Badges */}
        {SAMPLE_DECALS.map((sample) => {
          const isSelected = decal.url === sample.url;
          return (
            <button
              key={sample.id}
              onClick={() => setDecalImage(sample.url, sample.name)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all aspect-square relative active:scale-95 ${
                isSelected
                  ? 'border-[#111111] bg-[#f5f5f5] shadow-xs ring-1 ring-[#111111]'
                  : 'border-[#e5e5e5] bg-white hover:border-[#b0b0b0] hover:bg-[#fafafa]'
              }`}
              title={sample.name}
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-7 h-7 object-contain opacity-90"
              />
              <span className="text-[8px] font-medium text-[#707072] uppercase mt-1 truncate max-w-full">
                {sample.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sliders for Size & Rotation */}
      {decal.enabled && decal.url && (
        <div className="flex flex-col gap-3 pt-3 border-t border-[#f0f0f0]">
          {/* Scale Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#555555]">
              <span>Taille</span>
              <span className="font-medium text-[#111111]">{Math.round(decal.scale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="1.2"
              step="0.01"
              value={decal.scale}
              onChange={(e) => setDecalScale(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Rotation Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#555555]">
              <span>Orientation</span>
              <span className="font-medium text-[#111111]">{Math.round(decal.rotation)}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={decal.rotation}
              onChange={(e) => setDecalRotation(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Opacity Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#555555]">
              <span>Opacité</span>
              <span className="font-medium text-[#111111]">{Math.round(decal.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.02"
              value={decal.opacity}
              onChange={(e) => setDecalOpacity(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
