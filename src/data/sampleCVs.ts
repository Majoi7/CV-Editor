export interface SampleCV {
  id: string;
  title: string;
  tagline: string;
  category: string;
  html: string;
}

export const SAMPLE_CVS: SampleCV[] = [
  {
    id: 'amphix-tech',
    title: 'CV Développeur Tech (IFRI & Amphix)',
    tagline: 'Mise en page 2 colonnes avec sidebar sombre, badges et timeline technique',
    category: 'Tech / Développeur',
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - Alex Kouassi</title>
  <style>
    :root {
      --primary: #0f172a;
      --accent: #10b981;
      --accent-light: #ecfdf5;
      --text: #334155;
      --text-light: #64748b;
      --bg: #ffffff;
      --sidebar-bg: #1e293b;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background-color: #f1f5f9;
      color: var(--text);
      line-height: 1.5;
      display: flex;
      justify-content: center;
      padding: 24px;
    }
    .cv-container {
      width: 100%;
      max-width: 820px;
      min-height: 1060px;
      background: var(--bg);
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      display: grid;
      grid-template-columns: 280px 1fr;
      border-radius: 8px;
      overflow: hidden;
    }
    .sidebar {
      background-color: var(--sidebar-bg);
      color: #f8fafc;
      padding: 32px 24px;
    }
    .avatar-box {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .sidebar h2 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--accent);
      margin-top: 28px;
      margin-bottom: 14px;
      border-bottom: 1px solid #334155;
      padding-bottom: 6px;
    }
    .contact-list {
      list-style: none;
    }
    .contact-list li {
      font-size: 13px;
      color: #cbd5e1;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      word-break: break-all;
    }
    .contact-list a {
      color: #cbd5e1;
      text-decoration: none;
      transition: color 0.2s;
    }
    .contact-list a:hover {
      color: var(--accent);
    }
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .skill-badge {
      background: rgba(255,255,255,0.08);
      color: #e2e8f0;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .lang-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 8px;
      color: #cbd5e1;
    }
    .main-content {
      padding: 36px 32px;
      background: #ffffff;
    }
    .header-section {
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .candidate-name {
      font-size: 28px;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: -0.5px;
    }
    .role {
      font-size: 16px;
      font-weight: 600;
      color: var(--accent);
      margin-top: 4px;
    }
    .summary {
      font-size: 13.5px;
      color: var(--text-light);
      margin-top: 12px;
      line-height: 1.6;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 26px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }
    .timeline-item {
      position: relative;
      padding-left: 20px;
      margin-bottom: 20px;
      border-left: 2px solid #e2e8f0;
    }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -6px;
      top: 4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent);
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }
    .title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--primary);
    }
    .period {
      font-size: 12px;
      color: var(--text-light);
      font-weight: 500;
    }
    .details {
      font-size: 13px;
      color: var(--text-light);
      line-height: 1.5;
    }
    .project-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .project-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 4px;
    }
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      body {
        background: transparent;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .cv-container {
        box-shadow: none;
        border-radius: 0;
        max-width: 100%;
        min-height: 100vh;
      }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <aside class="sidebar">
      <div class="avatar-box">AK</div>
      <h2>Contact</h2>
      <ul class="contact-list" id="contact">
        <li><span>📧</span>&nbsp;<a href="mailto:alex.kouassi@example.com">alex.kouassi@example.com</a></li>
        <li><span>📱</span>&nbsp;+229 97 00 11 22</li>
        <li><span>📍</span>&nbsp;Cotonou, Bénin</li>
        <li><span>🌐</span>&nbsp;<a href="https://linkedin.com/in/alexkouassi">linkedin.com/in/alexkouassi</a></li>
      </ul>

      <h2>Compétences</h2>
      <div class="skills-grid">
        <span class="skill-badge">React</span>
        <span class="skill-badge">TypeScript</span>
        <span class="skill-badge">Node.js</span>
        <span class="skill-badge">Express</span>
        <span class="skill-badge">TailwindCSS</span>
        <span class="skill-badge">Git & GitHub</span>
        <span class="skill-badge">PostgreSQL</span>
      </div>

      <h2>Langues</h2>
      <div class="lang-item">
        <span>Français</span>
        <strong>Natif</strong>
      </div>
      <div class="lang-item">
        <span>Anglais</span>
        <strong>Intermédiaire (B2)</strong>
      </div>
    </aside>

    <main class="main-content">
      <header class="header-section">
        <h1 class="candidate-name">Alex Kouassi</h1>
        <div class="role">Étudiant Développeur Web & Mobile</div>
        <p class="summary">
          Étudiant passionné par les technologies web modernes et l'ingénierie logicielle. Rigoureux, curieux et motivé à concevoir des architectures robustes et interactives.
        </p>
      </header>

      <section>
        <h2 class="section-title">Formation</h2>
        <div class="timeline-item">
          <div class="item-header">
            <h3 class="title">Licence 2 Génie Logiciel — IFRI (UAC)</h3>
            <span class="period">2023 - 2024</span>
          </div>
          <p class="details">Institut de Formation et de Recherche en Informatique. Algorithmique avancée, bases de données relationnelles et POO.</p>
        </div>
      </section>

      <section>
        <h2 class="section-title">Expériences</h2>
        <div class="timeline-item">
          <div class="item-header">
            <h3 class="title">Développeur Frontend Stagiaire — BeninTech</h3>
            <span class="period">Juil 2024 - Sept 2024</span>
          </div>
          <p class="details">Développement de composants UI modulaires en React et intégration d'APIs RESTful avec gestion d'état Zustand.</p>
        </div>
      </section>

      <section>
        <h2 class="section-title">Projets Réalisés</h2>
        <div class="project-card">
          <h3 class="project-title">Mini-Chat Temps Réel</h3>
          <p class="details">Application de messagerie instantanée utilisant WebSockets et Node.js avec authentification sécurisée.</p>
        </div>
      </section>
    </main>
  </div>
</body>
</html>`
  },
  {
    id: 'executive-minimal',
    title: 'CV Exécutif & Moderne (Minimaliste)',
    tagline: 'Typographie soignée, style suisse épuré, idéal pour postes seniors et ingénieurs',
    category: 'Exécutif / Ingénieur',
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - Thomas Laurent</title>
  <style>
    :root {
      --dark: #18181b;
      --muted: #52525b;
      --border: #e4e4e7;
      --bg: #ffffff;
      --accent: #2563eb;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', Times, serif;
      background: #f4f4f5;
      color: var(--dark);
      padding: 30px;
      display: flex;
      justify-content: center;
    }
    .cv-sheet {
      background: var(--bg);
      width: 100%;
      max-width: 800px;
      min-height: 1000px;
      padding: 50px 60px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .header {
      border-bottom: 2px solid var(--dark);
      padding-bottom: 24px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    h1.name {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 15px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 6px;
    }
    .contact-block {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      color: var(--muted);
      text-align: right;
      line-height: 1.6;
    }
    .contact-block a { color: inherit; text-decoration: none; }
    .summary {
      font-size: 15px;
      line-height: 1.7;
      color: #3f3f46;
      margin-bottom: 32px;
      font-style: italic;
    }
    h2.section-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--dark);
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
      margin-top: 28px;
      margin-bottom: 18px;
    }
    .entry {
      margin-bottom: 20px;
    }
    .entry-head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .entry-title {
      font-size: 16px;
      font-weight: 700;
    }
    .entry-date {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      color: var(--muted);
    }
    .entry-desc {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      color: #52525b;
      line-height: 1.5;
    }
    @media print {
      @page { size: A4; margin: 0; }
      body { background: transparent; padding: 0; }
      .cv-sheet { box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="cv-sheet">
    <div class="header">
      <div>
        <h1 class="name">Thomas Laurent</h1>
        <div class="title">Lead Développeur Full-Stack</div>
      </div>
      <div class="contact-block">
        <div><a href="mailto:thomas.laurent@example.com">thomas.laurent@example.com</a></div>
        <div>+33 6 12 34 56 78</div>
        <div>Paris, France • <a href="https://github.com/tlaurent">github.com/tlaurent</a></div>
      </div>
    </div>

    <p class="summary">
      Ingénieur logiciel avec 6 ans d'expérience dans la conception d'applications web scalables à fort trafic. Spécialisé en écosystème TypeScript, architectures cloud serverless et direction d'équipes techniques.
    </p>

    <h2 class="section-title">Expériences Professionnelles</h2>
    <div class="entry">
      <div class="entry-head">
        <h3 class="entry-title">Lead Tech — SaaS Flow Dynamics</h3>
        <span class="entry-date">2021 — Présent</span>
      </div>
      <p class="entry-desc">Supervision technique d'une équipe de 5 développeurs. Migration de l'architecture micro-services vers Next.js et PostgreSQL.</p>
    </div>

    <h2 class="section-title">Formation</h2>
    <div class="entry">
      <div class="entry-head">
        <h3 class="entry-title">Master Informatique & Systèmes d'Information — Sorbonne</h3>
        <span class="entry-date">2016 — 2018</span>
      </div>
      <p class="entry-desc">Diplôme d'ingénieur universitaire avec mention Très Bien.</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'creative-cards',
    title: 'CV Créatif / Product Designer',
    tagline: 'Design moderne avec cartes interactives, badges arrondis et palette indigo',
    category: 'Design & Frontend',
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - Sarah Martin</title>
  <style>
    :root {
      --primary: #4f46e5;
      --primary-soft: #eef2ff;
      --dark: #0f172a;
      --text: #475569;
      --card-bg: #f8fafc;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f1f5f9;
      color: var(--dark);
      padding: 30px;
      display: flex;
      justify-content: center;
    }
    .cv-box {
      background: #ffffff;
      width: 100%;
      max-width: 840px;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    }
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    h1.name {
      font-size: 30px;
      font-weight: 800;
      color: var(--dark);
    }
    .role {
      font-size: 16px;
      color: var(--primary);
      font-weight: 600;
      margin-top: 4px;
    }
    .badge-pill {
      background: var(--primary-soft);
      color: var(--primary);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
    }
    .summary {
      font-size: 14.5px;
      color: var(--text);
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 15px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #64748b;
      margin-top: 24px;
      margin-bottom: 14px;
    }
    .project-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .project-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 4px;
    }
    .desc {
      font-size: 13.5px;
      color: var(--text);
    }
    @media print {
      @page { size: A4; margin: 0; }
      body { background: transparent; padding: 0; }
      .cv-box { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="cv-box">
    <div class="top-bar">
      <div>
        <h1 class="name">Sarah Martin</h1>
        <div class="role">Product Designer & Frontend Engineer</div>
      </div>
      <span class="badge-pill">Disponible pour missions</span>
    </div>

    <p class="summary">
      Passionnée par l'intersection entre le design d'interface soigné et le code performant. Plus de 4 ans d'expérience dans la création de design systems et de prototypes React haute fidélité.
    </p>

    <h2 class="section-title">Projets Récents</h2>
    <div class="project-card">
      <h3 class="project-title">Design System Aurora</h3>
      <p class="desc">Bibliothèque de 40+ composants accessibles avec documentation interactive sous Storybook.</p>
    </div>

    <h2 class="section-title">Formation</h2>
    <div class="project-card">
      <h3 class="project-title">Mastère Design Interactif — Gobelins</h3>
      <p class="desc">Spécialisation UX research, prototypage rapide et interfaces visuelles avancées.</p>
    </div>
  </div>
</body>
</html>`
  }
];
