import React from 'react';
import { Check } from 'lucide-react';
import { FABRIC_FINISHES } from '../../constants/garmentConfig';
import { useCustomizerStore } from '../../store/useCustomizerStore';

export default function MaterialFinishSelector() {
  const fabricFinish = useCustomizerStore(state => state.fabricFinish);
  const setFabricFinish = useCustomizerStore(state => state.setFabricFinish);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
          Sélectionnez la matière & le tissage
        </span>
        <p className="text-xs text-[#707072] mt-0.5">
          Le rendu PBR haute définition s'applique instantanément sur l'ensemble du t-shirt.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 pt-1">
        {FABRIC_FINISHES.map((finish) => {
          const isActive = fabricFinish === finish.id;
          return (
            <button
              key={finish.id}
              onClick={() => setFabricFinish(finish.id)}
              className={`flex items-start justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-98 ${
                isActive
                  ? 'border-[#111111] bg-[#f9f9f9] shadow-sm'
                  : 'border-[#e5e5e5] bg-white hover:border-[#b0b0b0] hover:bg-[#fafafa]'
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#111111]">
                    {finish.name}
                  </span>
                  <span className="text-[10px] font-medium text-[#555555] bg-[#ececec] px-2 py-0.5 rounded-full">
                    {finish.tag}
                  </span>
                </div>
                <p className="text-xs text-[#707072] mt-1 line-clamp-2 leading-relaxed">
                  {finish.desc}
                </p>
              </div>

              {isActive && (
                <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center flex-shrink-0 ml-2 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
