import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Volume2, VolumeX, Sparkles, User } from 'lucide-react';
import { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = message.text.replace(/[*#`_\[\]]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`flex flex-col mb-3.5 px-3 ${
        isUser ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`flex items-end gap-2 max-w-[90%] md:max-w-[85%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Role Avatar Badge */}
        <div
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs select-none shadow-sm overflow-hidden ${
            isUser
              ? 'bg-slate-700 text-slate-300'
              : 'p-0.5 bg-gradient-to-br from-indigo-600 to-sky-500 shadow-indigo-500/20'
          }`}
        >
          {isUser ? (
            <User className="w-3.5 h-3.5" />
          ) : (
            <img
              src="/avatar.png"
              alt="Suraj AI"
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>

        {/* Message Bubble Card */}
        <div
          className={`relative px-4 py-3 text-[13.5px] leading-relaxed transition-all shadow-md ${
            isUser
              ? 'bg-[#3b3a6e] text-[#f2efff] rounded-2xl rounded-tr-xs border border-indigo-500/30'
              : 'bg-[#26272e] text-[#e3e2e6] rounded-2xl rounded-tl-xs border border-[#343640]'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap font-normal break-words">{message.text}</div>
          ) : (
            <div className="markdown-body prose prose-invert max-w-none text-slate-200 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-indigo-200 prose-strong:font-semibold prose-code:text-sky-300 prose-code:bg-slate-900/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
            </div>
          )}

          {/* Bottom Bubble Metadata & Action Bar */}
          <div
            className={`flex items-center gap-2 mt-2 pt-1 border-t ${
              isUser
                ? 'border-indigo-400/20 justify-end text-indigo-200/70'
                : 'border-slate-700/50 justify-between text-slate-400'
            } text-[10px]`}
          >
            <span>{message.timestamp}</span>

            <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="hover:text-indigo-300 p-0.5 rounded cursor-pointer transition-colors"
                title="Copy text"
                aria-label="Copy text"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>

              {!isUser && 'speechSynthesis' in window && (
                <button
                  onClick={handleSpeak}
                  className={`p-0.5 rounded cursor-pointer transition-colors ${
                    speaking ? 'text-indigo-400 animate-pulse' : 'hover:text-indigo-300'
                  }`}
                  title={speaking ? 'Stop speech' : 'Listen with Speech'}
                  aria-label={speaking ? 'Stop speech' : 'Listen with Speech'}
                >
                  {speaking ? (
                    <VolumeX className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
