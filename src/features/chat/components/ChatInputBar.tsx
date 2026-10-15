import React, { useState } from 'react';

export interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  onToggleStickers: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage, onToggleStickers }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="p-2 border-t border-stone-200 bg-white/95 flex items-center gap-2">
      <button
        onClick={onToggleStickers}
        className="w-10 h-10 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100"
        title="Send Sticker"
      >
        🧸
      </button>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a cozy message..."
        className="flex-1 bg-stone-100 text-xs px-3.5 py-2.5 rounded-full outline-none focus:ring-1 focus:ring-stone-400"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center disabled:opacity-40"
      >
        ➤
      </button>
    </div>
  );
};
