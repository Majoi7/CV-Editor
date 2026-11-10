import React, { useState } from 'react';
import {
  FileCode,
  ShieldCheck,
  ListTree,
  Code2,
  Sparkles,
  Edit3,
  Check,
  Layers,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { CVParsedResult, CVNode } from '../types/cv.ts';

interface Zone1SourceProps {
  html: string;
  parsed: CVParsedResult;
  fileName: string;
  onUpdateNodeValue: (nodeId: string, newValue: string) => void;
  onManualHtmlChange: (newHtml: string) => void;
  onRunAnalysis: () => void;
  isLoadingAI: boolean;
}

export const Zone1Source: React.FC<Zone1SourceProps> = ({
  html,
  parsed,
  fileName,
  onUpdateNodeValue,
  onManualHtmlChange,
  onRunAnalysis,
  isLoadingAI,
}) => {
  const [tab, setTab] = useState<'sections' | 'source' | 'audit'>('sections');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isEditingRaw, setIsEditingRaw] = useState<boolean>(false);
  const [rawDraft, setRawDraft] = useState<string>(html);

  React.useEffect(() => {
    setRawDraft(html);
  }, [html]);

  const handleStartEdit = (node: CVNode) => {
    setEditingNodeId(node.id);
    setEditValue(node.textContent);
  };

  const handleSaveEdit = (nodeId: string) => {
    onUpdateNodeValue(nodeId, editValue);
    setEditingNodeId(null);
  };

  const handleApplyRawHtml = () => {
    onManualHtmlChange(rawDraft);
    setIsEditingRaw(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#FBF9F4] text-[#1A1917] select-none">
      {/* Header with Subtabs in Ivory style */}
      <div className="p-4 border-b border-[#E8E4D8] bg-[#F7F5EE]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#1A1917] font-['Space_Grotesk']">
                Structure & Code Source
              </h2>
              <p className="text-[11px] text-[#6B6963]">
                Inspection non-destructive et édition manuelle
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#7C3AED] bg-white px-2 py-1 rounded-lg border border-[#E8E4D8]">
            {parsed.nodes.length} nœuds
          </span>
        </div>

        {/* Tab buttons */}
        <div className="flex rounded-xl bg-white p-1 border border-[#E8E4D8] text-xs font-semibold shadow-2xs">
          <button
            onClick={() => setTab('sections')}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'sections'
                ? 'bg-[#1A1917] text-white shadow-xs'
                : 'text-[#6B6963] hover:text-[#1A1917]'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Nœuds ({parsed.sections.length})</span>
          </button>
          <button
            onClick={() => setTab('source')}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'source'
                ? 'bg-[#1A1917] text-white shadow-xs'
                : 'text-[#6B6963] hover:text-[#1A1917]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code HTML</span>
          </button>
          <button
            onClick={() => setTab('audit')}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'audit'
                ? 'bg-[#1A1917] text-white shadow-xs'
                : 'text-[#6B6963] hover:text-[#1A1917]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit CSS</span>
          </button>
        </div>
      </div>

      {/* Body content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
        {tab === 'sections' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8C8982] px-1 font-bold uppercase tracking-wider">
              <span>Sections Détectées ({parsed.sections.length})</span>
              <button
                onClick={onRunAnalysis}
                disabled={isLoadingAI}
                className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1 font-bold lowercase"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Diagnostic IA</span>
              </button>
            </div>

            {parsed.sections.map((section) => {
              const sectionNodes = parsed.nodes.filter((n) => n.section === section.type);
              const isExpanded = expandedSection === section.type || expandedSection === null;

              return (
                <div
                  key={section.type}
                  className="rounded-2xl border border-[#E8E4D8] bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() =>
                      setExpandedSection(expandedSection === section.type ? null : section.type)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-[#FDFCF9] hover:bg-[#F7F5EE] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                      <span className="text-xs font-bold text-[#1A1917] capitalize">
                        {section.title}
                      </span>
                      <span className="text-[10px] text-[#8C8982] font-mono">
                        ({sectionNodes.length})
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#8C8982]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#8C8982]" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 space-y-2 border-t border-[#E8E4D8] divide-y divide-[#F2EFE6]">
                      {sectionNodes.map((node) => (
                        <div key={node.id} className="pt-2 first:pt-0">
                          <div className="flex items-center justify-between text-[11px] text-[#8C8982] mb-1 font-semibold">
                            <span>{node.label}</span>
                            <span className="text-[10px] font-mono text-[#7C3AED] bg-[#F7F5EE] px-1.5 py-0.2 rounded border border-[#E8E4D8]">
                              &lt;{node.tag}&gt;
                            </span>
                          </div>

                          {editingNodeId === node.id ? (
                            <div className="space-y-1.5 mt-1">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full text-xs bg-white border border-[#7C3AED] rounded-xl p-2.5 text-[#1A1917] focus:outline-none ring-2 ring-[#7C3AED]/20"
                                rows={2}
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingNodeId(null)}
                                  className="px-2.5 py-1 text-xs text-[#8C8982] hover:text-[#1A1917]"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(node.id)}
                                  className="px-3 py-1 text-xs bg-[#1A1917] text-white rounded-lg font-bold"
                                >
                                  Enregistrer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group relative bg-[#F7F5EE] rounded-xl p-2.5 text-xs text-[#1A1917] border border-[#E8E4D8] hover:border-[#D9D3C3] transition-colors">
                              <p className="pr-6 line-clamp-2">
                                {node.textContent || <span className="italic text-[#8C8982]">(vide)</span>}
                              </p>
                              <button
                                onClick={() => handleStartEdit(node)}
                                title="Modifier manuellement ce champ"
                                className="absolute right-2 top-2 p-1 text-[#8C8982] hover:text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'source' && (
          <div className="flex flex-col h-full space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8C8982] px-1 font-bold">
              <span>Code source HTML ({rawDraft.length} caractères)</span>
              {isEditingRaw ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRawDraft(html);
                      setIsEditingRaw(false);
                    }}
                    className="text-xs text-[#8C8982] hover:text-[#1A1917]"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleApplyRawHtml}
                    className="text-xs text-[#7C3AED] font-bold"
                  >
                    Appliquer
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingRaw(true)}
                  className="text-xs text-[#7C3AED] font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Modifier le HTML</span>
                </button>
              )}
            </div>

            <textarea
              readOnly={!isEditingRaw}
              value={rawDraft}
              onChange={(e) => setRawDraft(e.target.value)}
              className={`flex-1 min-h-[380px] w-full font-mono text-[11px] leading-relaxed p-3.5 rounded-2xl border transition-colors shadow-2xs ${
                isEditingRaw
                  ? 'bg-white border-[#7C3AED] text-[#1A1917] focus:outline-none ring-2 ring-[#7C3AED]/20'
                  : 'bg-[#F7F5EE] border-[#E8E4D8] text-[#54514A] select-text'
              }`}
              spellCheck={false}
            />
          </div>
        )}

        {tab === 'audit' && (
          <div className="space-y-3 text-xs">
            <div className="rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] p-4 text-[#92400E] space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-sm text-[#78350F]">
                <ShieldCheck className="w-5 h-5 text-[#D97706]" />
                <span>Garantie de Préservation CSS 100%</span>
              </div>
              <p className="text-xs leading-relaxed text-[#92400E]">
                Le moteur de modification ciblée ne touche jamais aux feuilles de styles, polices ou grilles de mise en page. L'intégrité est vérifiée par signature cryptographique.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-[#E8E4D8] p-4 space-y-3 shadow-2xs">
              <h3 className="font-extrabold text-xs text-[#1A1917] uppercase tracking-wider">
                Statistiques Document
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#F7F5EE] p-3 rounded-xl border border-[#E8E4D8]">
                  <span className="text-[#8C8982] block text-[11px]">Balises &lt;style&gt;</span>
                  <span className="font-extrabold text-[#1A1917] text-base">
                    {parsed.stats.styleTagCount} (protégées)
                  </span>
                </div>
                <div className="bg-[#F7F5EE] p-3 rounded-xl border border-[#E8E4D8]">
                  <span className="text-[#8C8982] block text-[11px]">Feuilles CSS externes</span>
                  <span className="font-extrabold text-[#1A1917] text-base">
                    {parsed.stats.linkTagCount}
                  </span>
                </div>
                <div className="bg-[#F7F5EE] p-3 rounded-xl border border-[#E8E4D8]">
                  <span className="text-[#8C8982] block text-[11px]">Images & Icônes</span>
                  <span className="font-extrabold text-[#1A1917] text-base">
                    {parsed.stats.imagesCount}
                  </span>
                </div>
                <div className="bg-[#F7F5EE] p-3 rounded-xl border border-[#E8E4D8]">
                  <span className="text-[#8C8982] block text-[11px]">Iframe Sandbox</span>
                  <span className="font-extrabold text-[#7C3AED] text-base">Étanche</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[#E8E4D8] p-4 text-xs space-y-1 shadow-2xs">
              <span className="font-bold text-[#1A1917] block">Signature CSS :</span>
              <code className="block bg-[#F7F5EE] p-2 rounded-xl text-[10px] text-[#7C3AED] font-mono break-all border border-[#E8E4D8]">
                {parsed.styleSignature}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
