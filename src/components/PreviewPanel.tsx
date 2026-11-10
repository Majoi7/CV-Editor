import React, { useState, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Columns,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  History,
  Maximize2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { CVVersion } from '../types/cv.ts';

interface PreviewPanelProps {
  html: string;
  originalHtml: string;
  diffMode: boolean;
  setDiffMode: (diff: boolean) => void;
  versions: CVVersion[];
  currentVersionIndex: number;
  onRestoreVersion: (index: number) => void;
  onPrint: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  html,
  originalHtml,
  diffMode,
  setDiffMode,
  versions,
  currentVersionIndex,
  onRestoreVersion,
  onPrint,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState<number>(100);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return '360px';
      case 'tablet':
        return '640px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  return (
    <aside className="w-full xl:w-[460px] 2xl:w-[500px] shrink-0 bg-[#F7F5EE] border-l border-[#E8E4D8] flex flex-col p-6 select-none">
      {/* Header matching "Scheduled" section style */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#1A1917] font-['Space_Grotesk'] tracking-tight">
            Aperçu Haute Fidélité
          </h2>
          <span className="text-[11px] text-[#8C8982]">
            Format A4 • Rendu CSS fidèle
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#E8E4D8] shadow-2xs text-xs font-semibold">
          <button
            onClick={() => setDiffMode(false)}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              !diffMode
                ? 'bg-[#1A1917] text-white shadow-xs'
                : 'text-[#6B6963] hover:text-[#1A1917]'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setDiffMode(true)}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              diffMode
                ? 'bg-[#1A1917] text-white shadow-xs'
                : 'text-[#6B6963] hover:text-[#1A1917]'
            }`}
          >
            Diff
          </button>
        </div>
      </div>

      {/* Sub-toolbar: Viewports, zoom, refresh */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#E8E4D8] mb-4 shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewport === 'desktop' ? 'bg-[#7C3AED] text-white' : 'text-[#8C8982] hover:text-[#1A1917]'
            }`}
            title="A4 / Bureau"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewport === 'tablet' ? 'bg-[#7C3AED] text-white' : 'text-[#8C8982] hover:text-[#1A1917]'
            }`}
            title="Tablette"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewport === 'mobile' ? 'bg-[#7C3AED] text-white' : 'text-[#8C8982] hover:text-[#1A1917]'
            }`}
            title="Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-1 text-[#8C8982] hover:text-[#1A1917]"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-[#6B6963] px-1">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(130, z + 10))}
            className="p-1 text-[#8C8982] hover:text-[#1A1917]"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 text-[#8C8982] hover:text-[#1A1917] ml-1"
            title="Recharger l'aperçu"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 bg-[#EBE7D8] rounded-2xl p-3 overflow-auto flex justify-center items-start shadow-inner border border-[#E0DBCB] min-h-[420px]">
        {diffMode ? (
          <div className="w-full space-y-3">
            <div className="bg-white rounded-xl overflow-hidden border border-[#D9D3C3] shadow-sm">
              <div className="px-3 py-1.5 bg-[#F7F5EE] border-b border-[#E8E4D8] text-[11px] font-bold text-[#8C8982] flex justify-between">
                <span>Original (Avant)</span>
                <span>v0</span>
              </div>
              <div className="h-64 overflow-hidden relative">
                <iframe
                  key={`orig-${refreshKey}`}
                  srcDoc={originalHtml}
                  title="CV Original"
                  sandbox="allow-same-origin"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border-2 border-[#7C3AED] shadow-sm">
              <div className="px-3 py-1.5 bg-[#7C3AED] text-white text-[11px] font-bold flex justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FBBF24]" />
                  <span>Actuel (Après IA)</span>
                </span>
                <span>v{currentVersionIndex}</span>
              </div>
              <div className="h-64 overflow-hidden relative">
                <iframe
                  key={`curr-${refreshKey}`}
                  srcDoc={html}
                  title="CV Actuel"
                  sandbox="allow-same-origin"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="transition-all duration-150 flex justify-center w-full"
            style={{
              width: getViewportWidth(),
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <div className="w-full min-h-[580px] bg-white rounded-xl shadow-md overflow-hidden border border-[#DCD6C4]">
              <iframe
                key={`single-${refreshKey}`}
                srcDoc={html}
                title="Aperçu Réel CV"
                sandbox="allow-same-origin"
                className="w-full min-h-[650px] border-0 bg-white block"
              />
            </div>
          </div>
        )}
      </div>

      {/* Recent History / Restauration points matching "Today / Tomorrow" cards from image */}
      <div className="mt-4 pt-3 border-t border-[#E8E4D8] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#1A1917]">Historique Récent</span>
          <span className="text-[10px] text-[#7C3AED] font-semibold">
            {versions.length} version{versions.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {versions.slice(-3).reverse().map((ver, idx) => {
            const actualIndex = versions.length - 1 - idx;
            const isCurrent = actualIndex === currentVersionIndex;

            return (
              <div
                key={ver.id}
                onClick={() => onRestoreVersion(actualIndex)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  isCurrent
                    ? 'bg-white border-[#7C3AED] shadow-2xs ring-1 ring-[#7C3AED]/30'
                    : 'bg-[#F2EFE6] border-[#E5E0D0] hover:bg-white text-[#6B6963]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[10px] text-[#7C3AED]">
                      v{ver.versionNumber}
                    </span>
                    <span className="font-bold text-[11px] text-[#1A1917] truncate">
                      {ver.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8C8982] block truncate">
                    {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="shrink-0">
                  {isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block" title="Active" />
                  ) : (
                    <span className="text-[10px] text-[#7C3AED] font-semibold hover:underline">
                      Restaurer
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
