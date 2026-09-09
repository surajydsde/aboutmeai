import React, { useState } from 'react';
import { Database, Check, RotateCcw, Sparkles, Sliders, FileText, ArrowLeft, ShieldAlert, Lock } from 'lucide-react';

interface ContextViewProps {
  customContext: string;
  onSaveContext: (context: string) => void;
  onResetContext: () => void;
  defaultContext: string;
  onBackToChat: () => void;
  onLockAdmin?: () => void;
}

export const ContextView: React.FC<ContextViewProps> = ({
  customContext,
  onSaveContext,
  onResetContext,
  defaultContext,
  onBackToChat,
  onLockAdmin,
}) => {
  const [text, setText] = useState(customContext || defaultContext);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveContext(text);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    setText(defaultContext);
    onResetContext();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#1a1b20] text-slate-200 p-4 space-y-4">
      {/* Owner Security Banner */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span><strong>Owner Access Active:</strong> This panel is hidden from normal visitors.</span>
        </div>
        {onLockAdmin && (
          <button
            onClick={onLockAdmin}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-medium border border-amber-500/30 cursor-pointer transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Lock</span>
          </button>
        )}
      </div>

      {/* Header Card */}
      <div className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Gemini Knowledge Context</h2>
              <p className="text-[11px] text-slate-400">
                Grounding data and system instructions used by the model
              </p>
            </div>
          </div>

          <button
            onClick={onBackToChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-center">
          <div className="p-2 rounded-xl bg-[#1c1d24]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Model</span>
            <span className="text-xs font-semibold text-emerald-400">gemini-3.8-flash</span>
          </div>
          <div className="p-2 rounded-xl bg-[#1c1d24]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Words</span>
            <span className="text-xs font-semibold text-indigo-300">{wordCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#1c1d24]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Characters</span>
            <span className="text-xs font-semibold text-sky-300">{charCount}</span>
          </div>
        </div>
      </div>

      {/* Editable Context Editor */}
      <div className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-white">Personal Knowledge Editor</h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Customize details for Gemini's context
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          You can edit, add, or append custom notes below (e.g. current availability, preferred salary range, favorite hobbies, or project notes). The AI will immediately remember these during questions.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          id="context-knowledge-editor"
          className="w-full bg-[#18191f] text-slate-200 text-xs font-mono p-3.5 rounded-2xl border border-slate-700 focus:border-indigo-500 focus:outline-none leading-relaxed resize-y min-h-[220px]"
          placeholder="Enter profile context information..."
        />

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleReset}
            id="btn-reset-context"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
            title="Reset back to Suraj's verified resume"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Resume</span>
          </button>

          <button
            onClick={handleSave}
            id="btn-save-context"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Context Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply Context Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helpful Tips Card */}
      <div className="bg-[#1f2027] border border-slate-700/40 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span>Conversational Context Understanding</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          The app automatically retains chat history and conversation memory. If you ask follow-up questions like <em>"What was his title there?"</em> or <em>"Can you explain the technical architecture of that?"</em>, Gemini seamlessly links back to earlier answers.
        </p>
      </div>
    </div>
  );
};
