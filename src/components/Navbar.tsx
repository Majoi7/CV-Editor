import React, { useRef } from 'react';
import {
  FileCode2,
  Upload,
  Download,
  Printer,
  Copy,
  RotateCcw,
  Undo2,
  Settings,
  Sparkles,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';
import { CVVersion } from '../types/cv.ts';

interface NavbarProps {
  fileName: string;
  versions: CVVersion[];
  currentVersionIndex: number;
  apiStatus: {
    configured: boolean;
    hasServerKey: boolean;
    hasCustomKey: boolean;
    error?: string;
  };
  selectedModel: string;
  onUndo: () => void;
  onResetOriginal: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onImportFile: (content: string, name: string) => void;
  onDownloadHtml: () => void;
  onPrintPdf: () => void;
  onCopyHtml: () => void;
  copied: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  fileName,
  versions,
  currentVersionIndex,
  apiStatus,
  selectedModel,
  onUndo,
  onResetOriginal,
  onOpenSettings,
  onOpenTemplates,
  onImportFile,
  onDownloadHtml,
  onPrintPdf,
  onCopyHtml,
  copied,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onImportFile(text, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 select-none">
      <div className="max-w-[1920px] mx-auto px-4 h-15 flex items-center justify-between gap-3">
        {/* Left: Branding & Current File */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">CV AI Editor</span>
                <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Design Safe
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
                {fileName}
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden md:block" />

          {/* Quick templates & Import */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={onOpenTemplates}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modèles prêts</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span>Importer HTML</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".html,.htm"
              className="hidden"
            />
          </div>
        </div>

        {/* Center: Version / Undo Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onUndo}
            disabled={currentVersionIndex <= 0}
            title="Annuler la dernière modification"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentVersionIndex > 0
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
                : 'text-slate-500 bg-slate-900/50 cursor-not-allowed border border-slate-800'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Annuler</span>
            {currentVersionIndex > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                v{currentVersionIndex}
              </span>
            )}
          </button>

          {currentVersionIndex > 0 && (
            <button
              onClick={onResetOriginal}
              title="Revenir au CV original initial"
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Original</span>
            </button>
          )}
        </div>

        {/* Right: API Status, Export & Settings */}
        <div className="flex items-center gap-2">
          {/* Gemini status badge */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
              apiStatus.configured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }`}
            title={apiStatus.configured ? 'Gemini connecté' : 'Vérifier la configuration Gemini'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden xl:inline">
              {apiStatus.configured ? 'Gemini Actif' : 'Gemini Config'}
            </span>
          </button>

          {/* Action exports */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80">
            <button
              onClick={onCopyHtml}
              title="Copier le code HTML complet"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onPrintPdf}
              title="Imprimer / Exporter en PDF (Format A4 direct)"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">PDF / Imprimer</span>
            </button>

            <button
              onClick={onDownloadHtml}
              title="Télécharger le fichier HTML mis à jour"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">HTML</span>
            </button>
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="Paramètres de l'IA et clé API"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
