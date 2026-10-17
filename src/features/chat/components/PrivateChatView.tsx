import React, { useState } from 'react';
import { SessionBar } from './SessionBar';
import { MessageList, ChatMessageItem } from './MessageList';
import { ChatInputBar } from './ChatInputBar';
import { StickerTray } from './StickerTray';

export const PrivateChatView: React.FC = () => {
  const [sessions] = useState([
    { id: 'daily_banter', title: 'Daily Banter', emoji: '💬', isPinned: true },
    { id: 'date_ideas', title: 'Date Ideas', emoji: '🍱', isPinned: false },
    { id: 'watchlist', title: 'Watchlist', emoji: '🎬', isPinned: false },
    { id: 'vent_space', title: 'Vent Space', emoji: '🧸', isPinned: false },
    { id: 'deep_talks', title: 'Deep Talks', emoji: '🌙', isPinned: false },
  ]);
  const [activeSessionId, setActiveSessionId] = useState('daily_banter');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isStickerOpen, setIsStickerOpen] = useState(false);

  const handleSendText = (text: string) => {
    const newMsg: ChatMessageItem = {
      id: 'msg_' + Date.now(),
      sender: 'Kevin',
      type: 'text',
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleSendSticker = (stickerId: string) => {
    const newMsg: ChatMessageItem = {
      id: 'msg_' + Date.now(),
      sender: 'Kevin',
      type: 'sticker',
      content: stickerId,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMsg]);
    setIsStickerOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#fff8f4] rounded-3xl overflow-hidden border border-stone-200">
      <div className="p-3 border-b border-stone-200 bg-white/80 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-sm text-stone-800">Private Duo Chat</h2>
          <span className="text-[10px] text-stone-500">🔒 E2EE 256-bit AES-GCM</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
          Connected
        </span>
      </div>

      <SessionBar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewTopic={() => {}}
      />

      <MessageList messages={messages} currentUser="Kevin" />

      {isStickerOpen && (
        <StickerTray
          onSelectSticker={handleSendSticker}
          onClose={() => setIsStickerOpen(false)}
        />
      )}

      <ChatInputBar
        onSendMessage={handleSendText}
        onToggleStickers={() => setIsStickerOpen(!isStickerOpen)}
      />
    </div>
  );
};
