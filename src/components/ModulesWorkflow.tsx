import React from 'react';
import {
  Folder,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  Globe,
  CheckCircle2,
  Edit3,
  Check,
  ChevronRight
} from 'lucide-react';
import { CVParsedResult, CVSectionType } from '../types/cv.ts';

interface ModulesWorkflowProps {
  parsed: CVParsedResult;
  onEditSection: (section: CVSectionType) => void;
  onQuickPrompt: (prompt: string) => void;
}

export const ModulesWorkflow: React.FC<ModulesWorkflowProps> = ({
  parsed,
  onEditSection,
  onQuickPrompt,
}) => {
  // Workflow items representing the CV sections
  const modules = [
    {
      id: 'header' as CVSectionType,
      title: 'Identité & Poste recherché',
      desc: `${parsed.candidateName} • ${parsed.candidateRole}`,
      icon: Folder,
      count: parsed.nodes.filter((n) => n.section === 'header' || n.section === 'summary').length,
      samplePrompt: "Mettre à jour le poste recherché pour Développeur Full Stack",
    },
    {
      id: 'education' as CVSectionType,
      title: 'Formation & Diplômes',
      desc: parsed.nodes.find((n) => n.section === 'education')?.textContent || "Parcours universitaire et certifications",
      icon: GraduationCap,
      count: parsed.nodes.filter((n) => n.section === 'education').length,
      samplePrompt: "Actualise ma formation en troisième année à l'IFRI (UAC)",
    },
    {
      id: 'experience' as CVSectionType,
      title: 'Expériences Professionnelles',
      desc: parsed.nodes.find((n) => n.section === 'experience')?.textContent || "Stages, emplois et missions techniques",
      icon: Briefcase,
      count: parsed.nodes.filter((n) => n.section === 'experience').length,
      samplePrompt: "Rendre mes descriptions de missions plus percutantes",
    },
    {
      id: 'projects' as CVSectionType,
      title: 'Projets Réalisés & Portfolio',
      desc: parsed.nodes.find((n) => n.section === 'projects')?.textContent || "Applications web, projets Open Source",
      icon: Sparkles,
      count: parsed.nodes.filter((n) => n.section === 'projects').length,
      samplePrompt: "Ajouter les projets Amphix Game et Amphix Meet",
    },
    {
      id: 'skills' as CVSectionType,
      title: 'Compétences & Technologies',
      desc: parsed.nodes.filter((n) => n.section === 'skills').map((n) => n.textContent).slice(0, 5).join(', ') || "Technologies maîtrisées",
      icon: Layers,
      count: parsed.nodes.filter((n) => n.section === 'skills').length,
      samplePrompt: "Ajouter Docker, TailwindCSS et PostgreSQL aux compétences",
    },
    {
      id: 'contact' as CVSectionType,
      title: 'Coordonnées & Réseaux',
      desc: parsed.nodes.filter((n) => n.section === 'contact').map((n) => n.textContent).slice(0, 3).join(' • ') || "Email, Téléphone, LinkedIn, GitHub",
      icon: Globe,
      count: parsed.nodes.filter((n) => n.section === 'contact').length,
      samplePrompt: "Ajouter mon profil GitHub https://github.com/alexkouassi",
    },
  ];

  return (
    <div className="bg-transparent select-none">
      {/* Module Title & Progress Bar matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pt-2">
        <div>
          <span className="text-xs font-semibold text-[#8C8982] uppercase tracking-wider block mb-1">
            Sections du CV
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1917] font-['Space_Grotesk'] tracking-tight">
            Structure & Éléments Détectés
          </h2>
        </div>

        {/* Purple Progress bar matching reference */}
        <div className="flex items-center gap-3">
          <div className="w-32 sm:w-44 h-2 bg-[#E5E0D0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7C3AED] rounded-full transition-all duration-500"
              style={{ width: '92%' }}
            />
          </div>
          <span className="text-xs font-extrabold text-[#1A1917] font-mono">
            {parsed.nodes.length} nœuds
          </span>
        </div>
      </div>

      {/* Connected Timeline list matching reference image */}
      <div className="relative pl-6 space-y-4">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-[#E8E4D8]" />

        {modules.map((mod, idx) => {
          const Icon = mod.icon;

          return (
            <div
              key={mod.id}
              className="relative flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#FDFCF9] border border-[#E8E4D8] transition-all hover:border-[#D9D3C3] shadow-2xs group"
            >
              {/* Left: Boxed Icon with checkmark badge matching reference */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[#F7F5EE] border-2 border-[#1A1917] flex items-center justify-center text-[#1A1917] group-hover:bg-[#EAE5D7] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  {/* Yellow checkmark badge at bottom-right */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FBBF24] border border-white flex items-center justify-center text-[#1A1917]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-[#1A1917] truncate">
                      {mod.title}
                    </h3>
                    <span className="text-[10px] bg-[#F7F5EE] text-[#6B6963] px-2 py-0.2 rounded-md font-mono border border-[#E8E4D8]">
                      {mod.count} {mod.count > 1 ? 'nœuds' : 'nœud'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6963] truncate mt-0.5 max-w-sm sm:max-w-md">
                    {mod.desc}
                  </p>
                </div>
              </div>

              {/* Right: Quick action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onQuickPrompt(mod.samplePrompt)}
                  className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-colors"
                >
                  <span>Mettre à jour</span>
                </button>

                <button
                  onClick={() => onEditSection(mod.id)}
                  title="Inspecter les nœuds de cette section"
                  className="p-2 text-[#8C8982] hover:text-[#1A1917] hover:bg-[#F7F5EE] rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
