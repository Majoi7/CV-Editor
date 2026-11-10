import React from 'react';
import { ArrowUpRight, GraduationCap, FolderGit2, Sparkles, Globe } from 'lucide-react';

interface HeroBannerProps {
  candidateName: string;
  candidateRole: string;
  onApplyPreset: (prompt: string) => void;
  onOpenAI: () => void;
  mutationsCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  candidateName,
  candidateRole,
  onApplyPreset,
  onOpenAI,
  mutationsCount,
}) => {
  return (
    <div className="bg-[#EAE5D7] rounded-3xl p-7 md:p-8 relative overflow-hidden shadow-xs border border-[#E0DBCB] select-none">
      {/* Decorative subtle background wave line */}
      <svg
        className="absolute top-0 right-1/4 w-96 h-full pointer-events-none opacity-40"
        viewBox="0 0 300 150"
        fill="none"
      >
        <path
          d="M 0 100 C 100 0, 200 180, 300 20"
          stroke="#F59E0B"
          strokeWidth="3"
        />
      </svg>

      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 relative z-10">
        {/* Left Editorial Copy */}
        <div className="flex-1 max-w-xl flex flex-col justify-between py-1">
          <div>
            <span className="text-xs font-semibold text-[#66635C] tracking-wide block mb-2">
              Salut, {candidateName} !
            </span>
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-[#1A1917] tracking-tight leading-[1.15] font-['Space_Grotesk'] mb-3">
              Votre CV HTML est analysé et prêt pour l'IA ciblée
            </h1>
            <p className="text-xs sm:text-sm text-[#54514A] leading-relaxed max-w-md">
              Modifiez vos sections en langage naturel. Toutes vos règles CSS, typographies, marges et grilles restent 100% verrouillées.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAI}
              className="py-3 px-5 bg-[#1A1917] hover:bg-[#2B2925] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
            >
              <span>Ouvrir l'Assistant IA</span>
              <ArrowUpRight className="w-4 h-4 text-[#FBBF24]" />
            </button>

            {mutationsCount > 0 && (
              <span className="text-xs font-semibold text-[#7C3AED] bg-white/70 px-3 py-2 rounded-xl border border-[#DCD6C4]">
                ✨ {mutationsCount} modification{mutationsCount > 1 ? 's' : ''} en cours
              </span>
            )}
          </div>
        </div>

        {/* Right side: 3 cards (01 White, 02 Yellow, 03 Purple) matching reference */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 shrink-0 w-full lg:w-[460px] xl:w-[500px]">
          {/* Card 01 - Formation IFRI (White) */}
          <button
            onClick={() =>
              onApplyPreset(
                "Actualise ma formation en troisième année (Licence 3) à l'IFRI (UAC)."
              )
            }
            className="bg-white hover:bg-[#FDFCF9] rounded-2xl p-4 text-left border border-[#DDD7C6] flex flex-col justify-between transition-all hover:scale-[1.02] shadow-2xs group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-mono font-bold text-[#8C8982] block mb-1">
                01
              </span>
              <h3 className="font-extrabold text-xs text-[#1A1917] leading-tight">
                Formation L3 à l'IFRI
              </h3>
            </div>

            {/* Graphic illustration */}
            <div className="my-3 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#F7F5EE] flex items-center justify-center text-[#7C3AED] group-hover:rotate-6 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
            </div>

            <div className="text-[10px] font-bold text-[#7C3AED] flex items-center gap-1">
              <span>Actualiser ↗</span>
            </div>
          </button>

          {/* Card 02 - Projets Amphix (Vibrant Sunshine Yellow) */}
          <button
            onClick={() =>
              onApplyPreset(
                "Ajoute mes nouveaux projets Amphix Game et Amphix Meet (Plateforme de tournois gaming et visioconférence interactive en React, Node.js, WebSockets)."
              )
            }
            className="bg-[#FBBF24] hover:bg-[#F59E0B] rounded-2xl p-4 text-left text-[#1A1917] flex flex-col justify-between transition-all hover:scale-[1.02] shadow-2xs group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-mono font-bold text-[#4A453A] block mb-1">
                02
              </span>
              <h3 className="font-extrabold text-xs text-[#1A1917] leading-tight">
                Projets Amphix Game & Meet
              </h3>
            </div>

            {/* Wireframe sphere graphic representation */}
            <div className="my-3 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#1A1917]/20 flex items-center justify-center relative">
                <div className="w-10 h-10 rounded-full border border-[#1A1917]/30 flex items-center justify-center">
                  <FolderGit2 className="w-5 h-5 text-[#1A1917]" />
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-[#1A1917] flex items-center gap-1">
              <span>Ajouter projets ↗</span>
            </div>
          </button>

          {/* Card 03 - Profil & GitHub (Deep Purple with White text) */}
          <button
            onClick={() =>
              onApplyPreset(
                "Mets à jour mon titre pour Développeur Full Stack et ajoute mon profil GitHub https://github.com/alexkouassi aux coordonnées."
              )
            }
            className="bg-[#7C3AED] hover:bg-[#6D28D9] rounded-2xl p-4 text-left text-white flex flex-col justify-between transition-all hover:scale-[1.02] shadow-2xs group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-mono font-bold text-white/70 block mb-1">
                03
              </span>
              <h3 className="font-extrabold text-xs text-white leading-tight">
                Rôle Full Stack & GitHub
              </h3>
            </div>

            {/* Code tower illustration representation */}
            <div className="my-3 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-[#FBBF24] group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
            </div>

            <div className="text-[10px] font-bold text-white flex items-center gap-1">
              <span>Aligner profil ↗</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
