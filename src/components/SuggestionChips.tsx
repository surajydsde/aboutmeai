import React from 'react';
import { SuggestionChip } from '../types';
import { Sparkles, Code2, Briefcase, Award, Mail } from 'lucide-react';

interface SuggestionChipsProps {
  chips: SuggestionChip[];
  onSelectChip: (text: string) => void;
  isLoading: boolean;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  chips,
  onSelectChip,
  isLoading,
}) => {
  const getIcon = (category?: string) => {
    switch (category) {
      case 'skills':
        return <Code2 className="w-3 h-3 text-emerald-400" />;
      case 'experience':
        return <Briefcase className="w-3 h-3 text-sky-400" />;
      case 'projects':
        return <Sparkles className="w-3 h-3 text-amber-400" />;
      case 'education':
        return <Award className="w-3 h-3 text-indigo-400" />;
      case 'contact':
        return <Mail className="w-3 h-3 text-rose-400" />;
      default:
        return <Sparkles className="w-3 h-3 text-indigo-400" />;
    }
  };

  return (
    <div className="shrink-0 py-2 px-3 border-t border-[#262831] bg-[#1a1b21]/80 backdrop-blur-xs flex items-center gap-2 overflow-x-auto no-scrollbar select-none z-10">
      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-indigo-400" />
        Prompts:
      </span>
      {chips.map((chip) => (
        <button
          key={chip.id}
          disabled={isLoading}
          onClick={() => onSelectChip(chip.text)}
          id={`suggestion-chip-${chip.id}`}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#262730] hover:bg-indigo-950/40 text-slate-300 hover:text-indigo-200 border border-slate-700/60 hover:border-indigo-500/50 text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs whitespace-nowrap"
        >
          {getIcon(chip.category)}
          <span>{chip.text}</span>
        </button>
      ))}
    </div>
  );
};
