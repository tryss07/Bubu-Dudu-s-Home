import React from 'react';

export interface ChatMessageItem {
  id: string;
  sender: string;
  type: 'text' | 'sticker';
  content: string;
  timestamp: number;
}

export interface MessageListProps {
  messages: ChatMessageItem[];
  currentUser: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-500 gap-2">
        <span className="text-3xl">💌</span>
        <p className="font-bold text-sm text-stone-700">No messages yet in this topic</p>
        <p className="text-xs text-stone-400">Send a warm message or cute Dudu sticker to Bubu!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
      {messages.map(msg => {
        const isMe = msg.sender === currentUser;
        return (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
          >
            {!isMe && <span className="text-[10px] font-bold text-stone-500 px-1 mb-0.5">{msg.sender}</span>}
            <div
              className={`px-3.5 py-2 rounded-2xl shadow-xs ${
                isMe
                  ? 'bg-amber-200 text-amber-950 rounded-tr-xs'
                  : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs'
              }`}
            >
              {msg.type === 'sticker' ? (
                <div className="w-24 h-24 p-1">
                  <img src={`Dudu Stickers/${msg.content}.webp`} alt="Sticker" className="w-full h-full object-contain" />
                </div>
              ) : (
                <p className="text-xs break-words">{msg.content}</p>
              )}
            </div>
            <span className="text-[9px] text-stone-400 px-1 mt-0.5">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      })}
    </div>
  );
};
