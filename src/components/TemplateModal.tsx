import React from 'react';
import { X, Layers, Check, ArrowRight } from 'lucide-react';
import { SAMPLE_CVS, SampleCV } from '../data/sampleCVs.ts';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (sample: SampleCV) => void;
  currentTemplateId?: string;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1917]/60 backdrop-blur-xs select-none">
      <div className="bg-[#FBF9F4] border border-[#E0DBCB] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden text-[#1A1917]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E4D8] flex items-center justify-between bg-[#F7F5EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/20 text-[#B45309] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1A1917] font-['Space_Grotesk']">
                Modèles de CV HTML Inclus
              </h2>
              <p className="text-xs text-[#6B6963]">
                Templates complets avec CSS pour tester immédiatement l'édition IA ciblée
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8C8982] hover:text-[#1A1917] hover:bg-[#EAE5D7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates list */}
        <div className="p-6 grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto">
          {SAMPLE_CVS.map((sample) => {
            const isSelected = sample.id === currentTemplateId;

            return (
              <div
                key={sample.id}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-white border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-xs'
                    : 'bg-white border-[#E8E4D8] hover:border-[#D5CFC0] hover:bg-[#FDFCF9]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#1A1917] font-['Space_Grotesk']">
                      {sample.title}
                    </span>
                    <span className="text-[10px] bg-[#F7F5EE] text-[#7C3AED] border border-[#E8E4D8] px-2 py-0.5 rounded-full font-bold">
                      {sample.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6963]">{sample.tagline}</p>
                </div>

                <button
                  onClick={() => {
                    onSelectTemplate(sample);
                    onClose();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#F7F5EE] text-[#7C3AED] border border-[#E8E4D8]'
                      : 'bg-[#1A1917] hover:bg-[#2B2925] text-white shadow-2xs'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Chargé</span>
                    </>
                  ) : (
                    <>
                      <span>Charger ce CV</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E4D8] bg-[#F7F5EE] flex items-center justify-between text-xs text-[#6B6963]">
          <span>Vous pouvez également importer tout fichier .html via le bouton Importer</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-[#6B6963] hover:text-[#1A1917]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
