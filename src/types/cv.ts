export type CVSectionType =
  | 'header'
  | 'contact'
  | 'summary'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'interests'
  | 'custom';

export interface CVNode {
  id: string;
  section: CVSectionType;
  label: string;
  tag: string;
  selector: string;
  textContent: string;
  innerHtml: string;
  href?: string;
  isList?: boolean;
}

export interface CVSectionSummary {
  type: CVSectionType;
  title: string;
  nodeCount: number;
  sampleText: string;
}

export interface CVParsedResult {
  nodes: CVNode[];
  sections: CVSectionSummary[];
  candidateName: string;
  candidateRole: string;
  stats: {
    totalWords: number;
    styleTagCount: number;
    linkTagCount: number;
    imagesCount: number;
    scriptsCount: number;
  };
  styleSignature: string;
}

export interface CVMutation {
  nodeId: string;
  actionType: 'replace_text' | 'update_html' | 'append_item' | 'delete_item';
  label: string;
  oldValue?: string;
  newValue: string;
  rationale?: string;
  category?: 'confirmed' | 'to_rephrase' | 'to_confirm';
}

export interface CVMutationResult {
  updatedHtml: string;
  appliedCount: number;
  failures: string[];
  diffs: {
    nodeId: string;
    label: string;
    oldValue: string;
    newValue: string;
  }[];
}

export interface CVVersion {
  id: string;
  versionNumber: number;
  title: string;
  prompt?: string;
  timestamp: number;
  html: string;
  mutationsCount: number;
  diffSummary?: string;
}

export interface AIAnalysisResult {
  candidateName: string;
  currentRole: string;
  summary: string;
  sectionsDetected: string[];
  strengths: string[];
  improvements: string[];
  missingInfo: string[];
}

export interface JobMatchResult {
  matchScore: number;
  analysisSummary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestedBio?: string;
  suggestedMutations: (CVMutation & { category: 'confirmed' | 'to_rephrase' | 'to_confirm' })[];
}
