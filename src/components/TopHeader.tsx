import React, { useState } from 'react';
import {
  Search,
  Zap,
  Target,
  Printer,
  Download,
  Copy,
  Undo2,
  Check,
  Send,
  RotateCcw
} from 'lucide-react';

interface TopHeaderProps {
  onQuickPrompt: (prompt: string) => void;
  isLoadingAI: boolean;
  apiStatus: {
    configured: boolean;
    hasServerKey: boolean;
    hasCustomKey: boolean;
    error?: string;
  };
  selectedModel: string;
  nodesCount: number;
  currentVersionIndex: number;
  onUndo: () => void;
  onResetOriginal: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onCopy: () => void;
  copied: boolean;
  candidateName: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onQuickPrompt,
  isLoadingAI,
  apiStatus,
  selectedModel,
  nodesCount,
  currentVersionIndex,
  onUndo,
  onResetOriginal,
  onPrint,
  onDownload,
  onCopy,
  copied,
  candidateName,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim() || isLoadingAI) return;
    onQuickPrompt(searchInput.trim());
    setSearchInput('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CV';
  };

  return (
    <header className="h-18 bg-[#F7F5EE] border-b border-[#E8E4D8] px-8 flex items-center justify-between gap-4 select-none shrink-0">
      {/* Search / Natural language prompt bar matching image style */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 max-w-xl relative flex items-center"
      >
        <Search className="w-4 h-4 text-[#8C8982] absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Décrivez une modification (ex: formation 3e année IFRI, projets Amphix...)"
          disabled={isLoadingAI}
          className="w-full pl-10 pr-28 py-2.5 bg-white border border-[#E8E4D8] rounded-xl text-xs text-[#1A1917] placeholder-[#8C8982] placeholder:truncate focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all shadow-2xs"
        />
        <button
          type="submit"
          disabled={!searchInput.trim() || isLoadingAI}
          className="absolute right-1.5 px-2.5 py-1.5 bg-[#1A1917] hover:bg-[#33312E] disabled:opacity-30 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
        >
          <span>Appliquer</span>
          <Send className="w-3 h-3" />
        </button>
      </form>

      {/* Right side stats and actions matching image style */}
      <div className="flex items-center gap-3">
        {/* Undo controls */}
        {currentVersionIndex > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onUndo}
              title="Annuler la dernière modification"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F2EFE6] text-[#1A1917] rounded-xl text-xs font-bold border border-[#E8E4D8] shadow-2xs transition-all"
            >
              <Undo2 className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Annuler</span>
              <span className="bg-[#7C3AED]/10 text-[#7C3AED] text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                v{currentVersionIndex}
              </span>
            </button>
            <button
              onClick={onResetOriginal}
              title="Restaurer l'original"
              className="p-1.5 bg-white hover:bg-[#F2EFE6] text-[#B45309] rounded-xl text-xs border border-[#E8E4D8] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Gemini status badge matching image's XP badge style */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-2xs ${
            apiStatus.configured
              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
              : 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-[#DC2626] text-white flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 fill-white" />
          </div>
          <span className="hidden sm:inline">
            {apiStatus.configured ? 'Gemini 3.8 Flash' : 'Gemini Config'}
          </span>
        </div>

        {/* Targeted nodes count badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-[#E8E4D8] text-[#1A1917] shadow-2xs">
          <Target className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>{nodesCount} nœuds</span>
        </div>

        {/* Export action group */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8E4D8] shadow-2xs">
          <button
            onClick={onPrint}
            title="Imprimer ou enregistrer en PDF (A4)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">PDF / Imprimer</span>
          </button>
          <button
            onClick={onDownload}
            title="Télécharger le fichier HTML"
            className="p-2 text-[#4A4843] hover:text-[#1A1917] hover:bg-[#F7F5EE] rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCopy}
            title="Copier le code HTML"
            className="p-2 text-[#4A4843] hover:text-[#1A1917] hover:bg-[#F7F5EE] rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Candidate Avatar matching reference image */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-sm shrink-0">
          {getInitials(candidateName)}
        </div>
      </div>
    </header>
  );
};
