import React, { useState } from 'react';
import { Sparkles, Trash2, User, Check, RotateCcw, ShieldCheck, Lock, Database, Share2 } from 'lucide-react';

interface MaterialTopBarProps {
  currentTab: 'chat' | 'profile' | 'context';
  onTabChange: (tab: 'chat' | 'profile' | 'context') => void;
  onClearChat: () => void;
  messageCount: number;
  isAdmin?: boolean;
  onRequestAdmin: () => void;
  onLockAdmin: () => void;
  name: string;
  experienceYears?: string;
}

export const MaterialTopBar: React.FC<MaterialTopBarProps> = ({
  currentTab,
  onTabChange,
  onClearChat,
  messageCount,
  isAdmin = false,
  onRequestAdmin,
  onLockAdmin,
  name,
  experienceYears,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${name} | AI Portfolio`,
      text: `Ask ${name}'s AI assistant about their experience and projects.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="shrink-0 bg-[#202127] border-b border-[#2e3038] px-4 py-2.5 flex items-center justify-between z-20">
      {/* Profile & Identity Section */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => onTabChange(currentTab === 'profile' ? 'chat' : 'profile')}
            id="btn-avatar-profile"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer overflow-hidden"
            title={`View ${name}'s profile`}
          >
            <img
              src="/avatar.png"
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          {/* Active online pulse badge */}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1a1b1f] shadow-sm" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-[#e3e2e6] tracking-tight">{name}</h1>
            <span className="flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
              AI
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {experienceYears ? `Gemini AI • ${experienceYears} Yrs Exp` : 'Gemini AI'}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        {/* Profile Details Tab Toggle */}
        <button
          onClick={() => onTabChange(currentTab === 'profile' ? 'chat' : 'profile')}
          id="btn-topbar-profile"
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            currentTab === 'profile'
              ? 'bg-indigo-600/30 text-indigo-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Resume & experience"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Owner / Admin Context Toggle */}
        {isAdmin ? (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onTabChange(currentTab === 'context' ? 'chat' : 'context')}
              id="btn-topbar-context"
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                currentTab === 'context'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
              title="Configure AI Knowledge Base (Owner Mode)"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={onLockAdmin}
              id="btn-topbar-lock"
              className="p-2 rounded-full text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Lock & Exit Owner Mode"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={onRequestAdmin}
            id="btn-topbar-admin-lock"
            className="p-2 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Owner sign in"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={handleShare}
            id="btn-topbar-share"
            className={`p-2 rounded-full transition-all cursor-pointer ${
              copiedLink
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title={copiedLink ? 'Link copied to clipboard!' : 'Share Portfolio & AI Agent'}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
          </button>
          {copiedLink && (
            <div className="absolute top-10 right-0 z-30 px-2.5 py-1 bg-emerald-950/95 border border-emerald-500/40 text-emerald-200 text-[10px] font-medium rounded-xl whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
              Link copied!
            </div>
          )}
        </div>

        {/* Clear Conversation */}
        {messageCount > 0 && (
          <div className="relative">
            {showClearConfirm ? (
              <div className="flex items-center gap-1 bg-red-950/80 border border-red-800/60 rounded-full px-2 py-0.5 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] text-red-200">Reset?</span>
                <button
                  onClick={() => {
                    onClearChat();
                    setShowClearConfirm(false);
                  }}
                  id="btn-confirm-clear"
                  className="p-1 rounded-full text-red-300 hover:text-white hover:bg-red-800/80 cursor-pointer"
                  title="Confirm clear"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  id="btn-cancel-clear"
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  title="Cancel"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                id="btn-trigger-clear"
                className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
