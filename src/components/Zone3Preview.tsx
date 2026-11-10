import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Columns,
  Eye,
  Printer,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface Zone3PreviewProps {
  html: string;
  originalHtml: string;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  diffMode: boolean;
  setDiffMode: (diff: boolean) => void;
  onPrint: () => void;
}

export const Zone3Preview: React.FC<Zone3PreviewProps> = ({
  html,
  originalHtml,
  viewportMode,
  setViewportMode,
  diffMode,
  setDiffMode,
  onPrint,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const originalIframeRef = useRef<HTMLIFrameElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '680px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-slate-950 text-slate-200 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950' : 'relative'
      }`}
    >
      {/* Top Toolbar */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Left: Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`p-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
              viewportMode === 'desktop'
                ? 'bg-slate-800 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Format Bureau / A4"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bureau (A4)</span>
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            className={`p-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
              viewportMode === 'tablet'
                ? 'bg-slate-800 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Format Tablette (680px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablette</span>
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`p-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
              viewportMode === 'mobile'
                ? 'bg-slate-800 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Format Mobile (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Center: Mode switcher (Direct vs Diff Comparaison) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setDiffMode(false)}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              !diffMode
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu Réel</span>
          </button>
          <button
            onClick={() => setDiffMode(true)}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              diffMode
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Comparateur Avant / Après</span>
          </button>
        </div>

        {/* Right: Zoom, Refresh, Print, Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950 px-1 py-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1 text-slate-400 hover:text-slate-200 rounded"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-300 min-w-[36px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="p-1 text-slate-400 hover:text-slate-200 rounded"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleRefresh}
            title="Recharger l'aperçu"
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onPrint}
            title="Imprimer ou enregistrer en PDF (A4)"
            className="p-1.5 text-slate-300 hover:text-emerald-400 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-6 flex justify-center items-start">
        {diffMode ? (
          /* Side-by-Side Comparison (Avant / Après) */
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Original version */}
            <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Version Initiale (Avant)</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  Modèle Original
                </span>
              </div>
              <div className="flex-1 bg-white overflow-hidden relative">
                <iframe
                  ref={originalIframeRef}
                  key={`orig-${refreshKey}`}
                  srcDoc={originalHtml}
                  title="CV Original"
                  sandbox="allow-same-origin"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>

            {/* Right: Updated version */}
            <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-emerald-500/40 overflow-hidden shadow-xl">
              <div className="px-3 py-2 bg-slate-900 border-b border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Version Actuelle (Après IA)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                  Design 100% Préservé
                </span>
              </div>
              <div className="flex-1 bg-white overflow-hidden relative">
                <iframe
                  ref={iframeRef}
                  key={`curr-${refreshKey}`}
                  srcDoc={html}
                  title="CV Mis à jour"
                  sandbox="allow-same-origin"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Direct Full Preview */
          <div
            className="transition-all duration-200 flex justify-center items-start"
            style={{
              width: getViewportWidth(),
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <div className="w-full min-h-[900px] bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-700/60 ring-1 ring-black/40">
              <iframe
                ref={iframeRef}
                key={`single-${refreshKey}`}
                srcDoc={html}
                title="Aperçu Réel CV"
                sandbox="allow-same-origin"
                className="w-full min-h-[1100px] border-0 bg-white block"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/80 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Iframe sandboxé étanche • Aucun script non autorisé n'est exécuté dans l'app</span>
        </div>
        <div className="hidden sm:block">
          Format A4 standard (210 × 297 mm) à l'impression
        </div>
      </div>
    </div>
  );
};
