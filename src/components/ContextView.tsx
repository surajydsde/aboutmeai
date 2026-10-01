import React, { useState } from 'react';
import { ArrowLeft, Database, Lock, Pencil, ShieldAlert, Copy, Check } from 'lucide-react';

interface ContextViewProps {
  context: string;
  onEditProfile: () => void;
  onBackToChat: () => void;
  onLockAdmin?: () => void;
}

/** Owner-only, read-only view of exactly what the AI is told about the profile. */
export const ContextView: React.FC<ContextViewProps> = ({ context, onEditProfile, onBackToChat, onLockAdmin }) => {
  const [copied, setCopied] = useState(false);
  const wordCount = context.trim().split(/\s+/).filter(Boolean).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(context);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1a1b20] text-slate-200 p-4 space-y-4">
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Owner view.</strong> Hidden from visitors.
          </span>
        </div>
        {onLockAdmin && (
          <button
            onClick={onLockAdmin}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-medium border border-amber-500/30 cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Lock</span>
          </button>
        )}
      </div>

      <div className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">What the AI knows</h2>
              <p className="text-[11px] text-slate-400">Built automatically from the Resume tab · {wordCount} words</p>
            </div>
          </div>
          <button
            onClick={onBackToChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          To change this, edit the profile on the Resume tab. Saving there updates both the resume and the AI for every visitor. Private notes for the AI go in the editor's “Notes for the AI” box.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onEditProfile}
            id="btn-context-edit-profile"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit profile
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <pre
          id="context-preview"
          className="w-full bg-[#18191f] text-slate-300 text-[11px] font-mono p-3.5 rounded-2xl border border-slate-700 leading-relaxed whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto"
        >
          {context || 'Loading…'}
        </pre>
      </div>
    </div>
  );
};
