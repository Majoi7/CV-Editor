import React, { useState, useRef } from 'react';
import { useCVState } from './hooks/useCVState.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { ModulesWorkflow } from './components/ModulesWorkflow.tsx';
import { PreviewPanel } from './components/PreviewPanel.tsx';
import { Zone1Source } from './components/Zone1Source.tsx';
import { Zone2AIAssistant } from './components/Zone2AIAssistant.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { TemplateModal } from './components/TemplateModal.tsx';
import { SampleCV } from './data/sampleCVs.ts';
import { CVSectionType } from './types/cv.ts';
import {
  LayoutDashboard,
  Sparkles,
  Target,
  ListTree,
  History,
  Eye,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const {
    html,
    originalHtml,
    fileName,
    parsed,
    versions,
    currentVersionIndex,
    apiKey,
    saveApiKey,
    selectedModel,
    saveModel,
    apiStatus,
    activeAITab,
    setActiveAITab,
    diffMode,
    setDiffMode,
    isLoadingAI,
    aiError,
    analysisResult,
    jobMatchResult,
    messages,
    loadHTML,
    applyMutations,
    undo,
    restoreVersion,
    resetToOriginal,
    sendAIMessage,
    runAIAnalysis,
    tailorToJobOffer,
  } = useCVState();

  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'job' | 'sections' | 'history'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'content' | 'preview'>('content');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateNodeValue = (nodeId: string, newValue: string) => {
    applyMutations(
      [
        {
          nodeId,
          actionType: 'replace_text',
          label: `Modification manuelle (${nodeId})`,
          newValue,
          rationale: "Édition directe par l'utilisateur",
        },
      ],
      `Édition manuelle : ${nodeId}`
    );
  };

  const handleManualHtmlChange = (newHtml: string) => {
    loadHTML(newHtml, fileName);
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.html') ? fileName : `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 500);
    }
  };

  const handleSelectTemplate = (sample: SampleCV) => {
    loadHTML(sample.html, `${sample.id}.html`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        loadHTML(text, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleQuickPrompt = (prompt: string) => {
    setActiveView('chat');
    sendAIMessage(prompt);
  };

  return (
    <div className="flex h-screen w-screen bg-[#FBF9F4] text-[#1A1917] font-sans overflow-hidden antialiased">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".html,.htm"
        className="hidden"
      />

      {/* Desktop Left Sidebar (Filko style) */}
      <div className="hidden lg:block">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onImportClick={() => fileInputRef.current?.click()}
          mutationsCount={versions.length - 1}
        />
      </div>

      {/* Center & Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header matching reference image */}
        <TopHeader
          onQuickPrompt={handleQuickPrompt}
          isLoadingAI={isLoadingAI}
          apiStatus={apiStatus}
          selectedModel={selectedModel}
          nodesCount={parsed.nodes.length}
          currentVersionIndex={currentVersionIndex}
          onUndo={undo}
          onResetOriginal={resetToOriginal}
          onPrint={handlePrintPdf}
          onDownload={handleDownloadHtml}
          onCopy={handleCopyHtml}
          copied={copied}
          candidateName={parsed.candidateName}
        />

        {/* Mobile View Switcher (< lg) */}
        <div className="lg:hidden flex border-b border-[#E8E4D8] bg-[#F7F5EE] text-xs font-bold">
          <button
            onClick={() => setMobileTab('content')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              mobileTab === 'content'
                ? 'border-[#7C3AED] text-[#7C3AED] bg-white'
                : 'border-transparent text-[#6B6963]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tableau de bord</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              mobileTab === 'preview'
                ? 'border-[#7C3AED] text-[#7C3AED] bg-white'
                : 'border-transparent text-[#6B6963]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Aperçu CV A4</span>
          </button>
        </div>

        {/* Workspace Body: Main Scrollable Content + Right Preview Panel */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          {/* Main scrollable view */}
          <div
            className={`flex-1 overflow-y-auto p-5 sm:p-7 xl:p-8 space-y-7 ${
              mobileTab === 'content' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* VIEW 1: DASHBOARD (Filko Hero Banner + Modules Workflow) */}
            {activeView === 'dashboard' && (
              <div className="space-y-8 max-w-5xl mx-auto">
                <HeroBanner
                  candidateName={parsed.candidateName}
                  candidateRole={parsed.candidateRole}
                  onApplyPreset={handleQuickPrompt}
                  onOpenAI={() => setActiveView('chat')}
                  mutationsCount={versions.length - 1}
                />

                <ModulesWorkflow
                  parsed={parsed}
                  onEditSection={(sec) => setActiveView('sections')}
                  onQuickPrompt={handleQuickPrompt}
                />
              </div>
            )}

            {/* VIEW 2: ASSISTANT IA (Dedicated chat & targeted execution) */}
            {activeView === 'chat' && (
              <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] bg-white rounded-3xl border border-[#E8E4D8] shadow-sm overflow-hidden flex flex-col">
                <Zone2AIAssistant
                  messages={messages}
                  versions={versions}
                  currentVersionIndex={currentVersionIndex}
                  isLoadingAI={isLoadingAI}
                  aiError={aiError}
                  activeTab={activeAITab}
                  setActiveTab={setActiveAITab}
                  onSendMessage={sendAIMessage}
                  onRestoreVersion={restoreVersion}
                  onTailorJob={tailorToJobOffer}
                  jobMatchResult={jobMatchResult}
                  analysisResult={analysisResult}
                  onApplyMutations={(muts, title) => applyMutations(muts, title)}
                  selectedModel={selectedModel}
                />
              </div>
            )}

            {/* VIEW 3: OFFRE D'EMPLOI */}
            {activeView === 'job' && (
              <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] bg-white rounded-3xl border border-[#E8E4D8] shadow-sm overflow-hidden flex flex-col">
                <Zone2AIAssistant
                  messages={messages}
                  versions={versions}
                  currentVersionIndex={currentVersionIndex}
                  isLoadingAI={isLoadingAI}
                  aiError={aiError}
                  activeTab="job"
                  setActiveTab={setActiveAITab}
                  onSendMessage={sendAIMessage}
                  onRestoreVersion={restoreVersion}
                  onTailorJob={tailorToJobOffer}
                  jobMatchResult={jobMatchResult}
                  analysisResult={analysisResult}
                  onApplyMutations={(muts, title) => applyMutations(muts, title)}
                  selectedModel={selectedModel}
                />
              </div>
            )}

            {/* VIEW 4: STRUCTURE & SOURCE */}
            {activeView === 'sections' && (
              <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] bg-white rounded-3xl border border-[#E8E4D8] shadow-sm overflow-hidden flex flex-col">
                <Zone1Source
                  html={html}
                  parsed={parsed}
                  fileName={fileName}
                  onUpdateNodeValue={handleUpdateNodeValue}
                  onManualHtmlChange={handleManualHtmlChange}
                  onRunAnalysis={runAIAnalysis}
                  isLoadingAI={isLoadingAI}
                />
              </div>
            )}

            {/* VIEW 5: HISTORIQUE */}
            {activeView === 'history' && (
              <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] bg-white rounded-3xl border border-[#E8E4D8] shadow-sm overflow-hidden flex flex-col">
                <Zone2AIAssistant
                  messages={messages}
                  versions={versions}
                  currentVersionIndex={currentVersionIndex}
                  isLoadingAI={isLoadingAI}
                  aiError={aiError}
                  activeTab="history"
                  setActiveTab={setActiveAITab}
                  onSendMessage={sendAIMessage}
                  onRestoreVersion={restoreVersion}
                  onTailorJob={tailorToJobOffer}
                  jobMatchResult={jobMatchResult}
                  analysisResult={analysisResult}
                  onApplyMutations={(muts, title) => applyMutations(muts, title)}
                  selectedModel={selectedModel}
                />
              </div>
            )}
          </div>

          {/* Right Preview Panel (Scheduled side panel style) */}
          <div
            className={`w-full lg:w-auto ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <PreviewPanel
              html={html}
              originalHtml={originalHtml}
              diffMode={diffMode}
              setDiffMode={setDiffMode}
              versions={versions}
              currentVersionIndex={currentVersionIndex}
              onRestoreVersion={restoreVersion}
              onPrint={handlePrintPdf}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={saveApiKey}
        selectedModel={selectedModel}
        onSaveModel={saveModel}
        apiStatus={apiStatus}
        onRefreshStatus={() => {}}
      />

      <TemplateModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
