import React from 'react';

export interface StickerTrayProps {
  onSelectSticker: (stickerId: string) => void;
  onClose: () => void;
}

export const StickerTray: React.FC<StickerTrayProps> = ({ onSelectSticker, onClose }) => {
  return (
    <div className="h-60 border-t border-stone-200 bg-stone-50 flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 border-b border-stone-200">
        <span className="text-xs font-bold text-stone-700">Dudu Stickers</span>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-sm">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-2">
        {Array.from({ length: 95 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSticker(String(idx))}
            className="p-1 rounded-xl bg-white border border-stone-200 hover:border-amber-400 flex items-center justify-center"
          >
            <span className="text-[10px] text-stone-600">#{idx}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
