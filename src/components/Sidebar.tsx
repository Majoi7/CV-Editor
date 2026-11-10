import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Target,
  ListTree,
  History,
  Settings,
  Zap,
  ArrowUpRight,
  Upload,
  Layers
} from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'chat' | 'job' | 'sections' | 'history';
  setActiveView: (view: 'dashboard' | 'chat' | 'job' | 'sections' | 'history') => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onImportClick: () => void;
  mutationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onOpenSettings,
  onOpenTemplates,
  onImportClick,
  mutationsCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'chat', label: 'Assistant IA', icon: Sparkles, badge: mutationsCount > 0 ? `${mutationsCount}` : undefined },
    { id: 'job', label: "Offre d'emploi", icon: Target },
    { id: 'sections', label: 'Structure & Nœuds', icon: ListTree },
    { id: 'history', label: 'Historique', icon: History },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#F7F5EE] border-r border-[#E8E4D8] flex flex-col justify-between p-6 select-none relative z-20">
      {/* Top section: Logo and Nav */}
      <div className="space-y-8">
        {/* Logo matching Filko typography with playful trailing yellow stroke */}
        <div className="relative pt-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight text-[#1A1917] font-['Space_Grotesk']">
              Filko
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-0.5 rounded-full border border-[#7C3AED]/20">
              CV AI
            </span>
          </div>

          {/* Decorative curved SVG wave line like in the reference image */}
          <svg
            className="absolute -top-3 left-12 w-48 h-14 pointer-events-none opacity-80"
            viewBox="0 0 180 50"
            fill="none"
          >
            <path
              d="M 5 35 Q 60 5, 120 25 T 180 15"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-sm shadow-[#7C3AED]/30'
                    : 'text-[#6B6963] hover:text-[#1A1917] hover:bg-[#EFECE1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-[#7C3AED]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#7C3AED]/10 text-[#7C3AED]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#6B6963] hover:text-[#1A1917] hover:bg-[#EFECE1] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#8C8982]" />
            <span>Paramètres</span>
          </button>
        </nav>
      </div>

      {/* Bottom Promo Card matching the yellow card in the reference image */}
      <div className="space-y-3">
        <div className="bg-[#FBBF24] rounded-2xl p-5 relative overflow-hidden shadow-sm">
          {/* Circular badge with lightning bolt */}
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
            <Zap className="w-5 h-5 text-[#1A1917] fill-[#1A1917]" />
          </div>

          <h3 className="font-extrabold text-base text-[#1A1917] leading-tight mb-1">
            100% Design Safe Garanti
          </h3>
          <p className="text-[11px] text-[#4A453A] leading-relaxed mb-4">
            Vos CSS, polices et marges sont protégés par empreinte cryptographique.
          </p>

          <button
            onClick={onImportClick}
            className="w-full py-2.5 px-3 bg-white hover:bg-[#FAF9F5] text-[#1A1917] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
          >
            <span>Importer un CV</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onOpenTemplates}
          className="w-full py-2 text-[11px] font-semibold text-[#7C3AED] hover:text-[#6D28D9] flex items-center justify-center gap-1.5 transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Voir les modèles inclus</span>
        </button>
      </div>
    </aside>
  );
};
