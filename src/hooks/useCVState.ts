import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CVParsedResult,
  CVVersion,
  CVMutation,
  AIAnalysisResult,
  JobMatchResult
} from '../types/cv.ts';
import { parseAndAnnotateCV } from '../utils/cvParser.ts';
import { applyTargetedMutations } from '../utils/cvPatcher.ts';
import { SAMPLE_CVS } from '../data/sampleCVs.ts';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  mutations?: CVMutation[];
  warning?: string;
  confirmedInfo?: string[];
  missingOrNeedConfirmation?: string[];
}

const STORAGE_KEY = 'cv_ai_editor_v1';
const API_KEY_STORAGE = 'cv_ai_editor_user_api_key';
const MODEL_STORAGE = 'cv_ai_editor_model';

export function useCVState() {
  // Initialize with Sample 1 by default
  const defaultSample = SAMPLE_CVS[0];
  const initialAnnotated = useMemo(() => parseAndAnnotateCV(defaultSample.html), []);

  const [html, setHtml] = useState<string>(initialAnnotated.annotatedHtml);
  const [originalHtml, setOriginalHtml] = useState<string>(initialAnnotated.annotatedHtml);
  const [fileName, setFileName] = useState<string>('cv-alex-kouassi.html');
  const [parsed, setParsed] = useState<CVParsedResult>(initialAnnotated.parsed);
  
  // Versions history
  const [versions, setVersions] = useState<CVVersion[]>([
    {
      id: 'v0-orig',
      versionNumber: 0,
      title: 'Version Originale',
      timestamp: Date.now(),
      html: initialAnnotated.annotatedHtml,
      mutationsCount: 0,
      diffSummary: 'Import initial du document',
    }
  ]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(0);

  // Gemini state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(MODEL_STORAGE) || 'gemini-3.8-flash';
  });
  const [apiStatus, setApiStatus] = useState<{
    configured: boolean;
    hasServerKey: boolean;
    hasCustomKey: boolean;
    message?: string;
    error?: string;
  }>({
    configured: false,
    hasServerKey: false,
    hasCustomKey: false,
  });

  // UI state
  const [activeMobileTab, setActiveMobileTab] = useState<'source' | 'ai' | 'preview'>('preview');
  const [activeAITab, setActiveAITab] = useState<'chat' | 'job' | 'history'>('chat');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [diffMode, setDiffMode] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Analysis and Job Match results
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [jobMatchResult, setJobMatchResult] = useState<JobMatchResult | null>(null);

  // Chat conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Bonjour ! Je suis votre assistant **CV AI Editor**.\n\nVotre CV HTML a été analysé avec succès : j'ai identifié **${initialAnnotated.parsed.sections.length} sections** et **${initialAnnotated.parsed.nodes.length} éléments modifiables**.\n\nToutes vos règles de design, polices, couleurs et classes CSS sont verrouillées et 100% préservées.\n\nQue souhaitez-vous mettre à jour ? (ex: formation, nouveaux projets, contact, adapter à un poste...)`,
      timestamp: Date.now(),
    }
  ]);

  // Check backend Gemini API status
  const checkApiStatus = useCallback(async (customKey?: string) => {
    try {
      const headers: Record<string, string> = {};
      const keyToUse = customKey ?? apiKey;
      if (keyToUse) {
        headers['X-Gemini-Key'] = keyToUse;
      }
      const res = await fetch('/api/gemini/status', { headers });
      const data = await res.json();
      setApiStatus({
        configured: data.configured,
        hasServerKey: data.hasServerKey,
        hasCustomKey: data.hasCustomKey,
        message: data.message,
        error: data.error,
      });
    } catch (err: any) {
      setApiStatus({
        configured: false,
        hasServerKey: false,
        hasCustomKey: false,
        error: 'Serveur inaccessible ou hors-ligne',
      });
    }
  }, [apiKey]);

  useEffect(() => {
    checkApiStatus();
  }, [checkApiStatus]);

  // Load a new HTML document (from import or sample)
  const loadHTML = useCallback((newHtml: string, name = 'mon-cv.html') => {
    const { annotatedHtml, parsed: newParsed } = parseAndAnnotateCV(newHtml);
    setHtml(annotatedHtml);
    setOriginalHtml(annotatedHtml);
    setFileName(name);
    setParsed(newParsed);
    setAnalysisResult(null);
    setJobMatchResult(null);

    const initialVersion: CVVersion = {
      id: `v0-${Date.now()}`,
      versionNumber: 0,
      title: 'Version Originale',
      timestamp: Date.now(),
      html: annotatedHtml,
      mutationsCount: 0,
      diffSummary: `Import de "${name}" (${newParsed.nodes.length} éléments détectés)`,
    };
    setVersions([initialVersion]);
    setCurrentVersionIndex(0);

    setMessages([
      {
        id: `load-${Date.now()}`,
        sender: 'assistant',
        text: `Nouveau CV chargé : **${name}**.\n\nJ'ai détecté **${newParsed.candidateName}** (${newParsed.candidateRole}) avec **${newParsed.sections.length} sections principales**.\n\nVous pouvez maintenant demander n'importe quelle modification en langage naturel.`,
        timestamp: Date.now(),
      }
    ]);
  }, []);

  // Apply mutations and record new version
  const applyMutations = useCallback((
    mutations: CVMutation[],
    actionTitle: string,
    promptText?: string
  ) => {
    const patchResult = applyTargetedMutations(html, mutations);
    if (patchResult.appliedCount === 0) {
      throw new Error('Aucune modification n\'a pu être appliquée aux éléments ciblés.');
    }

    const { parsed: updatedParsed } = parseAndAnnotateCV(patchResult.updatedHtml);
    const newVersionNumber = versions.length;
    const newVersion: CVVersion = {
      id: `v${newVersionNumber}-${Date.now()}`,
      versionNumber: newVersionNumber,
      title: actionTitle,
      prompt: promptText,
      timestamp: Date.now(),
      html: patchResult.updatedHtml,
      mutationsCount: patchResult.appliedCount,
      diffSummary: patchResult.diffs.map(d => `${d.label} : "${d.newValue.slice(0, 30)}..."`).join(' | '),
    };

    setHtml(patchResult.updatedHtml);
    setParsed(updatedParsed);
    setVersions(prev => [...prev, newVersion]);
    setCurrentVersionIndex(newVersionNumber);

    return patchResult;
  }, [html, versions]);

  // Undo (Annuler la dernière modification)
  const undo = useCallback(() => {
    if (currentVersionIndex > 0) {
      const targetIndex = currentVersionIndex - 1;
      const targetVersion = versions[targetIndex];
      setHtml(targetVersion.html);
      const { parsed: p } = parseAndAnnotateCV(targetVersion.html);
      setParsed(p);
      setCurrentVersionIndex(targetIndex);
    }
  }, [currentVersionIndex, versions]);

  // Restore specific version
  const restoreVersion = useCallback((index: number) => {
    if (index >= 0 && index < versions.length) {
      const targetVersion = versions[index];
      setHtml(targetVersion.html);
      const { parsed: p } = parseAndAnnotateCV(targetVersion.html);
      setParsed(p);
      setCurrentVersionIndex(index);
    }
  }, [versions]);

  // Reset to original
  const resetToOriginal = useCallback(() => {
    restoreVersion(0);
  }, [restoreVersion]);

  // Send request to Gemini Update API
  const sendAIMessage = useCallback(async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userPrompt.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoadingAI(true);
    setAiError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['X-Gemini-Key'] = apiKey;
      }

      // Prepare context of editable nodes
      const editableNodes = parsed.nodes.map(n => ({
        nodeId: n.id,
        section: n.section,
        label: n.label,
        tag: n.tag,
        currentValue: n.textContent,
        href: n.href,
      }));

      const res = await fetch('/api/gemini/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          instruction: userPrompt.trim(),
          editableNodes,
          model: selectedModel,
          contextHistory: messages.map(m => ({ sender: m.sender, text: m.text })).slice(-4),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour IA');
      }

      // Apply the mutations
      if (data.mutations && data.mutations.length > 0) {
        const patchResult = applyMutations(data.mutations, data.summary || 'Mise à jour ciblée IA', userPrompt);

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.summary || 'Modifications ciblées appliquées avec succès.',
          timestamp: Date.now(),
          mutations: data.mutations,
          warning: data.designRiskWarning || undefined,
          confirmedInfo: data.confirmedInfo || [],
          missingOrNeedConfirmation: data.missingOrNeedConfirmation || [],
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.summary || 'Aucune modification directe requise ou information insuffisante.',
          timestamp: Date.now(),
          missingOrNeedConfirmation: data.missingOrNeedConfirmation || [],
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || 'Échec de la communication avec Gemini';
      setAiError(errorMsg);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Erreur lors de la mise à jour :** ${errorMsg}\n\n*Astuce : Vous pouvez vérifier la connexion ou modifier manuellement un élément dans l'onglet Structure.*`,
          timestamp: Date.now(),
        }
      ]);
    } finally {
      setIsLoadingAI(false);
    }
  }, [apiKey, parsed, selectedModel, messages, applyMutations]);

  // Run full AI structural analysis
  const runAIAnalysis = useCallback(async () => {
    setIsLoadingAI(true);
    setAiError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-Gemini-Key'] = apiKey;

      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parsedSections: parsed.sections,
          fullTextSummary: parsed.nodes.map(n => `${n.label}: ${n.textContent}`).join('\n'),
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur analyse');
      setAnalysisResult(data);
    } catch (err: any) {
      setAiError(err.message || 'Erreur lors de l\'analyse');
    } finally {
      setIsLoadingAI(false);
    }
  }, [apiKey, parsed, selectedModel]);

  // Tailor CV to a Job Offer
  const tailorToJobOffer = useCallback(async (jobDescription: string) => {
    if (!jobDescription.trim()) return;
    setIsLoadingAI(true);
    setAiError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-Gemini-Key'] = apiKey;

      const editableNodes = parsed.nodes.map(n => ({
        nodeId: n.id,
        section: n.section,
        label: n.label,
        currentValue: n.textContent,
      }));

      const res = await fetch('/api/gemini/tailor-job', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          editableNodes,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur adaptation offre');
      setJobMatchResult(data);
    } catch (err: any) {
      setAiError(err.message || 'Erreur lors de l\'adaptation à l\'offre');
    } finally {
      setIsLoadingAI(false);
    }
  }, [apiKey, parsed, selectedModel]);

  // Update API Key
  const saveApiKey = useCallback((newKey: string) => {
    const trimmed = newKey.trim();
    setApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE, trimmed);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
    checkApiStatus(trimmed);
  }, [checkApiStatus]);

  // Update Model
  const saveModel = useCallback((model: string) => {
    setSelectedModel(model);
    localStorage.setItem(MODEL_STORAGE, model);
  }, []);

  return {
    html,
    setHtml,
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
    activeMobileTab,
    setActiveMobileTab,
    activeAITab,
    setActiveAITab,
    viewportMode,
    setViewportMode,
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
  };
}
