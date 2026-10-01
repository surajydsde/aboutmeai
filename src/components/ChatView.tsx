import React, { useRef, useEffect } from 'react';
import { ChatMessage, SuggestionChip } from '../types';
import { useProfile } from '../lib/ProfileContext';
import { MessageBubble } from './MessageBubble';
import { SuggestionChips } from './SuggestionChips';
import { MaterialInputBar } from './MaterialInputBar';
import { Sparkles, Bot, Clock, AlertCircle, ArrowDown } from 'lucide-react';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  chips: SuggestionChip[];
  onSelectChip: (text: string) => void;
  onClearError: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
  chips,
  onSelectChip,
  onClearError,
}) => {
  const profile = useProfile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages arrive or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18191e] overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-1 py-4 space-y-1 relative"
      >
        {/* Empty State Welcome Card */}
        {messages.length === 0 && (
          <div className="max-w-md mx-auto my-6 px-4 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto mb-3.5 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-xl shadow-indigo-600/20 flex items-center justify-center">
              <div className="w-full h-full rounded-3xl bg-[#1b1c22] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            <h2 className="text-base font-bold text-white tracking-tight mb-1">
              {profile.name} AI Agent
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Ask anything about {profile.name.split(' ')[0]}'s{profile.experienceYears ? ` ${profile.experienceYears} years of` : ''} experience, skills and projects.
            </p>

            {/* Quick Starter Suggestions */}
            <div className="bg-[#21222a] border border-slate-700/60 rounded-2xl p-3 text-left shadow-md">
              <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider block mb-2 px-1">
                Suggested Questions to Ask
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {chips.slice(0, 4).map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => onSelectChip(chip.text)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#1a1b22] hover:bg-indigo-950/40 hover:border-indigo-500/40 border border-slate-700/50 text-xs text-slate-200 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>{chip.text}</span>
                    <Sparkles className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Conversational context & memory enabled</span>
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 mb-3.5 px-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white flex items-center justify-center text-xs shadow-md shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#26272e] border border-[#343640] rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5 shadow-md">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] text-slate-400 ml-2 font-medium">Thinking with context...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mx-4 my-2 p-3 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={onClearError}
              className="text-[10px] text-red-300 hover:text-white underline cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <SuggestionChips
        chips={chips}
        onSelectChip={onSelectChip}
        isLoading={isLoading}
      />

      {/* Material 3 Input Field */}
      <MaterialInputBar
        onSendMessage={onSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};
