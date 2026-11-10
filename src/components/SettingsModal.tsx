import React, { useState } from 'react';
import {
  X,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Zap
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSaveModel: (model: string) => void;
  apiStatus: {
    configured: boolean;
    hasServerKey: boolean;
    hasCustomKey: boolean;
    message?: string;
    error?: string;
  };
  onRefreshStatus: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSaveModel,
  apiStatus,
  onRefreshStatus,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1917]/60 backdrop-blur-xs select-none">
      <div className="bg-[#FBF9F4] border border-[#E0DBCB] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden text-[#1A1917]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E4D8] flex items-center justify-between bg-[#F7F5EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1A1917] font-['Space_Grotesk']">
                Paramètres & IA Gemini
              </h2>
              <p className="text-xs text-[#6B6963]">
                Configuration du modèle et sécurité
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

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Status Alert */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 shadow-2xs ${
              apiStatus.configured
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
            }`}
          >
            {apiStatus.configured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <div className="font-bold text-xs text-[#1A1917]">
                {apiStatus.configured
                  ? 'Connexion Gemini Opérationnelle'
                  : 'Configuration requise'}
              </div>
              <p className="text-xs leading-relaxed text-[#54514A]">
                {apiStatus.configured
                  ? 'Le backend Express communique avec Google Gemini pour appliquer les modifications ciblées ultra-rapides sans altérer le CSS.'
                  : apiStatus.error ||
                    'Renseignez votre clé API Google Gemini ci-dessous pour activer les modifications intelligentes.'}
              </p>
              <div className="pt-1 flex items-center gap-3 text-[10px] text-[#6B6963]">
                <span>
                  Clé serveur :{' '}
                  <strong className={apiStatus.hasServerKey ? 'text-emerald-700' : 'text-[#8C8982]'}>
                    {apiStatus.hasServerKey ? 'Active (Secrets)' : 'Non détectée'}
                  </strong>
                </span>
                <span>
                  Clé custom :{' '}
                  <strong className={apiStatus.hasCustomKey ? 'text-emerald-700' : 'text-[#8C8982]'}>
                    {apiStatus.hasCustomKey ? 'Oui' : 'Aucune'}
                  </strong>
                </span>
              </div>
            </div>
            <button
              onClick={onRefreshStatus}
              title="Tester la connexion"
              className="p-1.5 hover:bg-black/5 rounded-lg text-[#6B6963] transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="font-extrabold text-xs text-[#1A1917] block">
              Modèle Gemini Recommandé :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onSaveModel('gemini-3.8-flash')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-white border-[#7C3AED] text-[#1A1917] ring-2 ring-[#7C3AED]/20 shadow-xs'
                    : 'bg-white border-[#E8E4D8] text-[#6B6963] hover:border-[#D9D3C3]'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between text-[#1A1917] mb-1">
                  <span>Gemini 3.8 Flash</span>
                  <span className="text-[10px] text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-full font-bold">
                    Recommandé
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6963]">
                  Haute précision DOM et vitesse ultra-rapide sous 2 secondes.
                </p>
              </button>

              <button
                onClick={() => onSaveModel('gemini-3.1-flash-lite')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-white border-[#7C3AED] text-[#1A1917] ring-2 ring-[#7C3AED]/20 shadow-xs'
                    : 'bg-white border-[#E8E4D8] text-[#6B6963] hover:border-[#D9D3C3]'
                }`}
              >
                <div className="font-bold text-xs text-[#1A1917] mb-1">
                  Gemini 3.1 Flash Lite
                </div>
                <p className="text-[11px] text-[#6B6963]">
                  Ultra-léger pour préserver les quotas gratuits.
                </p>
              </button>
            </div>
          </div>

          {/* Personal Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-xs text-[#1A1917]">
                Clé API Gemini Personnelle (Optionnelle) :
              </label>
              {apiKey && (
                <button
                  onClick={handleClear}
                  className="text-[10px] text-rose-600 hover:underline font-bold"
                >
                  Effacer
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-white border border-[#E8E4D8] rounded-xl p-2.5 text-xs text-[#1A1917] placeholder-[#8C8982] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 font-mono shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-[#8C8982] hover:text-[#1A1917] text-[11px] font-semibold"
              >
                {showKey ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          {/* Notice */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#E8E4D8] space-y-1 text-xs text-[#6B6963] shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-[#1A1917]">
              <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
              <span>Garantie de Confidentialité</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Vos CV restent strictement confidentiels et ne sont stockés sur aucun serveur tiers. Seuls les fragments textuels éditables sont transmis pour modification ciblée.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E4D8] bg-[#F7F5EE] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B6963] hover:text-[#1A1917] hover:bg-[#EAE5D7] transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              handleSave();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1A1917] hover:bg-[#2B2925] text-white shadow-sm transition-all"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
