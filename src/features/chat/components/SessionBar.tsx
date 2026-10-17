import React from 'react';

export interface SessionBarProps {
  sessions: Array<{ id: string; title: string; emoji: string; isPinned: boolean }>;
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewTopic: () => void;
}

export const SessionBar: React.FC<SessionBarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewTopic
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
      {sessions.map(s => (
        <button
          key={s.id}
          onClick={() => onSelectSession(s.id)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            s.id === activeSessionId
              ? 'bg-secondary text-white shadow-xs'
              : 'bg-white text-stone-800 border border-stone-200'
          }`}
        >
          <span>{s.emoji}</span>
          <span>{s.title}</span>
          {s.isPinned && <span className="text-[10px]">📌</span>}
        </button>
      ))}
      <button
        onClick={onNewTopic}
        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
      >
        <span>+</span>
        <span>New Topic</span>
      </button>
    </div>
  );
};
