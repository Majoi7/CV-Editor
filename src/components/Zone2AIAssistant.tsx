import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Target,
  History,
  Bot,
  User,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  PlusCircle,
  FileCheck2,
  Check
} from 'lucide-react';
import { ChatMessage } from '../hooks/useCVState.ts';
import { CVVersion, CVMutation, JobMatchResult, AIAnalysisResult } from '../types/cv.ts';

interface Zone2AIAssistantProps {
  messages: ChatMessage[];
  versions: CVVersion[];
  currentVersionIndex: number;
  isLoadingAI: boolean;
  aiError: string | null;
  activeTab: 'chat' | 'job' | 'history';
  setActiveTab: (tab: 'chat' | 'job' | 'history') => void;
  onSendMessage: (text: string) => void;
  onRestoreVersion: (index: number) => void;
  onTailorJob: (jobDesc: string) => void;
  jobMatchResult: JobMatchResult | null;
  analysisResult: AIAnalysisResult | null;
  onApplyMutations: (mutations: CVMutation[], title: string) => void;
  selectedModel: string;
}

export const Zone2AIAssistant: React.FC<Zone2AIAssistantProps> = ({
  messages,
  versions,
  currentVersionIndex,
  isLoadingAI,
  aiError,
  activeTab,
  setActiveTab,
  onSendMessage,
  onRestoreVersion,
  onTailorJob,
  jobMatchResult,
  analysisResult,
  onApplyMutations,
  selectedModel,
}) => {
  const [inputText, setInputText] = useState('');
  const [jobInput, setJobInput] = useState('');
  const [selectedMutations, setSelectedMutations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAI]);

  useEffect(() => {
    if (jobMatchResult?.suggestedMutations) {
      const initial: Record<string, boolean> = {};
      jobMatchResult.suggestedMutations.forEach((m, idx) => {
        initial[idx] = m.category !== 'to_confirm';
      });
      setSelectedMutations(initial);
    }
  }, [jobMatchResult]);

  const handleSend = () => {
    if (!inputText.trim() || isLoadingAI) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApplySelectedJobMutations = () => {
    if (!jobMatchResult?.suggestedMutations) return;
    const toApply = jobMatchResult.suggestedMutations.filter((_, idx) => selectedMutations[idx]);
    if (toApply.length === 0) return;

    onApplyMutations(toApply, `Adaptation offre (${toApply.length} modifications ciblées)`);
  };

  const quickPrompts = [
    "Mets à jour mon CV pour une candidature en stage Full Stack. Ajoute mes projets Amphix Game et Amphix Meet, actualise ma formation en troisième année à l'IFRI et ajoute mon profil GitHub.",
    "Actualise ma formation en troisième année à l'IFRI (UAC).",
    "Ajoute mon projet Amphix Game (Plateforme de tournois gaming en React/TypeScript).",
    "Ajoute mon profil GitHub https://github.com/alexkouassi dans les coordonnées.",
    "Remplace mon niveau d'anglais par Notions.",
    "Rends les descriptions d'expériences plus percutantes et professionnelles.",
  ];

  return (
    <div className="flex flex-col h-full bg-[#FBF9F4] text-[#1A1917] select-none">
      {/* Header with Subtabs in Ivory style */}
      <div className="p-4 border-b border-[#E8E4D8] bg-[#F7F5EE]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#1A1917] font-['Space_Grotesk']">
                Assistant IA Ciblée
              </h2>
              <p className="text-[11px] text-[#6B6963]">
                Modifications chirurgicales avec préservation CSS garantie
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#7C3AED] bg-white px-2 py-1 rounded-lg border border-[#E8E4D8]">
            {selectedModel}
          </span>
        </div>

        {/* Subtabs matching Filko style */}
        <div className="flex rounded-xl bg-white p-1 border border-[#E8E4D8] text-xs font-semibold shadow-2xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-[#1A1917] text-white shadow-xs'
                : 'text-[#6B6963] hover:text-[#1A1917]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Édition Ciblée</span>
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'job'
                ? 'bg-[#1A1917] text-white shadow-xs'
                : 'text-[#6B6963] hover:text-[#1A1917]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Offre d'emploi</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#1A1917] text-white shadow-xs'
                : 'text-[#6B6963] hover:text-[#1A1917]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique ({versions.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {/* Quick chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#8C8982] uppercase tracking-wider block">
                Suggestions prêtes en 1 clic :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(prompt)}
                    disabled={isLoadingAI}
                    className="text-xs text-left bg-white hover:bg-[#F2EFE6] text-[#1A1917] border border-[#E8E4D8] hover:border-[#D4CEBF] rounded-xl px-3 py-1.5 transition-all shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3.5 pt-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-[#1A1917] text-white rounded-tr-none'
                        : 'bg-white text-[#1A1917] border border-[#E8E4D8] rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Mutations receipt */}
                    {msg.mutations && msg.mutations.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-[#E8E4D8] space-y-2">
                        <div className="text-[11px] font-bold text-[#7C3AED] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {msg.mutations.length} modification{msg.mutations.length > 1 ? 's' : ''} ciblée{msg.mutations.length > 1 ? 's' : ''} appliquée{msg.mutations.length > 1 ? 's' : ''} :
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {msg.mutations.map((mut, idx) => (
                            <div
                              key={idx}
                              className="bg-[#F7F5EE] rounded-xl p-2.5 border border-[#E8E4D8] text-[11px] space-y-1"
                            >
                              <div className="flex items-center justify-between text-[#6B6963] font-semibold">
                                <span>{mut.label}</span>
                                <span className="font-mono text-[10px] text-[#7C3AED] bg-white px-1.5 py-0.2 rounded border border-[#E8E4D8]">
                                  {mut.actionType}
                                </span>
                              </div>
                              <div className="text-[#1A1917] font-semibold">
                                → {mut.newValue}
                              </div>
                              {mut.rationale && (
                                <div className="text-[10px] text-[#8C8982] italic">
                                  {mut.rationale}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.warning && (
                      <div className="mt-2.5 p-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-[#92400E] text-[11px] flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
                        <div>
                          <strong>Attention :</strong> {msg.warning}
                        </div>
                      </div>
                    )}

                    {msg.confirmedInfo && msg.confirmedInfo.length > 0 && (
                      <div className="mt-2.5 text-[10px] text-[#6B6963]">
                        <span className="font-bold text-[#1A1917]">Validé :</span>{' '}
                        {msg.confirmedInfo.join(', ')}
                      </div>
                    )}

                    {msg.missingOrNeedConfirmation && msg.missingOrNeedConfirmation.length > 0 && (
                      <div className="mt-2.5 p-2.5 bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl text-[11px] text-[#5B21B6]">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>À préciser :</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                          {msg.missingOrNeedConfirmation.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#1A1917] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoadingAI && (
                <div className="flex gap-3 items-center text-xs text-[#6B6963] bg-white p-3.5 rounded-2xl border border-[#E8E4D8] shadow-2xs">
                  <div className="w-4 h-4 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                  <span>L'IA analyse les sections et prépare les mutations...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Tab Job */}
        {activeTab === 'job' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-[#E8E4D8] space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#7C3AED]">
                <Target className="w-4 h-4" />
                <span>Adapter le CV à une Offre d'Emploi</span>
              </div>
              <p className="text-xs text-[#6B6963] leading-relaxed">
                Collez l'intitulé et les compétences d'une offre. L'IA compare sans inventer de fausses qualifications.
              </p>
              <textarea
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
                placeholder="Collez ici l'intitulé du poste et les compétences requises..."
                rows={4}
                className="w-full text-xs bg-[#FBF9F4] border border-[#E8E4D8] rounded-xl p-3 text-[#1A1917] placeholder-[#8C8982] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
              />
              <button
                onClick={() => onTailorJob(jobInput)}
                disabled={isLoadingAI || !jobInput.trim()}
                className="w-full py-2.5 bg-[#1A1917] hover:bg-[#2B2925] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Analyser la correspondance</span>
              </button>
            </div>

            {jobMatchResult && (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-[#E8E4D8] flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] text-[#8C8982] uppercase tracking-wider font-bold block">
                      Score de correspondance
                    </span>
                    <span className="text-2xl font-extrabold text-[#1A1917]">
                      {jobMatchResult.matchScore}%
                    </span>
                  </div>
                  <div className="w-28 h-2.5 bg-[#E8E4D8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FBBF24] to-[#7C3AED]"
                      style={{ width: `${jobMatchResult.matchScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8E4D8] text-xs text-[#1A1917] space-y-1.5 shadow-2xs">
                  <div className="font-bold text-[#1A1917]">Diagnostic RH :</div>
                  <p className="text-[#6B6963] leading-relaxed">{jobMatchResult.analysisSummary}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1A1917]">
                      Suggestions ciblées ({jobMatchResult.suggestedMutations.length})
                    </span>
                    <button
                      onClick={handleApplySelectedJobMutations}
                      className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold shadow-2xs"
                    >
                      Appliquer la sélection
                    </button>
                  </div>

                  {jobMatchResult.suggestedMutations.map((mut, idx) => {
                    const isSelected = selectedMutations[idx] ?? false;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'bg-white border-[#7C3AED] shadow-2xs'
                            : 'bg-[#F2EFE6] border-[#E5E0D0] opacity-70'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              setSelectedMutations((prev) => ({
                                ...prev,
                                [idx]: e.target.checked,
                              }))
                            }
                            className="mt-0.5 rounded text-[#7C3AED] focus:ring-[#7C3AED]"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between font-bold text-[#1A1917]">
                              <span>{mut.label}</span>
                              <span className="text-[10px] bg-[#F7F5EE] px-2 py-0.5 rounded-md font-mono border border-[#E8E4D8]">
                                {mut.category}
                              </span>
                            </div>
                            <div className="text-[#7C3AED] font-semibold">
                              → {mut.newValue}
                            </div>
                            <div className="text-[10px] text-[#8C8982] italic">
                              {mut.rationale}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#8C8982] uppercase tracking-wider block">
              Historique des versions ({versions.length})
            </span>

            <div className="space-y-2">
              {versions.map((ver, idx) => {
                const isCurrent = idx === currentVersionIndex;

                return (
                  <div
                    key={ver.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-white border-[#7C3AED] shadow-2xs ring-1 ring-[#7C3AED]/20'
                        : 'bg-white border-[#E8E4D8] hover:border-[#D5CFC0]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                            isCurrent
                              ? 'bg-[#7C3AED] text-white'
                              : 'bg-[#F7F5EE] text-[#6B6963] border border-[#E8E4D8]'
                          }`}
                        >
                          v{ver.versionNumber}
                        </span>
                        <span className="text-xs font-bold text-[#1A1917]">
                          {ver.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8C8982]">
                        {new Date(ver.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {ver.prompt && (
                      <p className="text-xs text-[#6B6963] italic mb-2 line-clamp-2">
                        "{ver.prompt}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#F2EFE6] text-xs">
                      <span className="text-[10px] text-[#8C8982]">
                        {ver.mutationsCount} modif{ver.mutationsCount > 1 ? 's' : ''}
                      </span>
                      {isCurrent ? (
                        <span className="text-[#7C3AED] font-bold text-[11px]">
                          ● Version active
                        </span>
                      ) : (
                        <button
                          onClick={() => onRestoreVersion(idx)}
                          className="text-[#7C3AED] hover:underline font-bold text-xs flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restaurer</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      {activeTab === 'chat' && (
        <div className="p-4 border-t border-[#E8E4D8] bg-[#F7F5EE]">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoadingAI}
              placeholder="Décrivez en langage naturel ce que vous souhaitez mettre à jour... (Entrée pour envoyer)"
              rows={2}
              className="w-full text-xs bg-white border border-[#E8E4D8] rounded-xl p-3 pr-12 text-[#1A1917] placeholder-[#8C8982] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] shadow-2xs resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoadingAI}
              className="absolute right-2.5 bottom-3 p-2 bg-[#1A1917] hover:bg-[#33312E] disabled:opacity-30 text-white rounded-lg transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#8C8982] px-1">
            <span>Règle absolue : Le CSS et le template d'origine restent 100% préservés</span>
            <span>Shift + Entrée pour nouvelle ligne</span>
          </div>
        </div>
      )}
    </div>
  );
};
