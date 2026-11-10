# CLAUDE.md — Guide Technique & Architecture pour Claude Code

Ce fichier documente l'architecture, les conventions, les règles métier et les commandes de **CV AI Editor**, permettant à Claude Code ou à tout ingénieur de comprendre, naviguer et faire évoluer le projet sans régression.

---

## 1. Vision & Règle Absolue du Projet

**CV AI Editor** est un éditeur web intelligent qui permet de mettre à jour le contenu d'un CV HTML existant via l'intelligence artificielle (Google Gemini) **sans jamais casser ni altérer son design, son template, ses feuilles de style CSS, ses typographies, ses colonnes, ses icônes ou ses scripts originaux**.

### La Règle d'Or : Le Moteur de Modification Ciblée
L'application **ne demande JAMAIS** à l'IA de régénérer ou réécrire tout le document HTML.
À la place, elle applique un pipeline strict :
1. **Analyse DOM non-destructive (`src/utils/cvParser.ts`)** : Identifie les sections (Identité, Contact, Formation, Expériences, Projets, Compétences, Langues) et appose des attributs `data-cv-node="id"` uniquement sur les éléments textuels éditables.
2. **Extraction de contexte** : Seuls les nœuds modifiables et l'instruction de l'utilisateur sont envoyés au backend Gemini.
3. **Réponse JSON structurée** : L'IA retourne une liste de mutations précises (`replace_text`, `update_html`, `append_item`, `delete_item`).
4. **Application ciblée (`src/utils/cvPatcher.ts`)** : Le moteur patche strictement les nœuds ciblés dans le DOM. Lors de l'ajout d'un élément (ex: nouveau projet ou nouvelle compétence), il clone un élément frère pour hériter fidèlement des classes CSS, badges, SVGs et conteneurs.
5. **Vérification d'intégrité CSS** : Une empreinte cryptographique des balises `<style>` et `<link rel="stylesheet">` garantit que zéro octet de CSS n'a été corrompu.

---

## 2. Commandes Utiles

```bash
# Démarrer le serveur de développement full-stack (Port 3000)
npm run dev
# Lance tsx server.ts qui monte Express et les middlewares Vite

# Exécuter les tests unitaires de logique pure
npx --yes tsx --test src/utils/cvEngine.test.ts

# Vérifier la compilation TypeScript
npm run lint
# ou tsc --noEmit

# Compiler pour la production
npm run build
```

---

## 3. Structure des Fichiers

```
/
├── CLAUDE.md                  # Ce fichier guide pour Claude Code
├── server.ts                  # Serveur Express full-stack + proxy Gemini API + Vite dev
├── package.json               # Scripts et dépendances (@google/genai, express, tsx, linkedom, etc.)
├── metadata.json              # Métadonnées AI Studio ("CV AI Editor")
├── index.html                 # Point d'entrée HTML avec polices et métas
├── src/
│   ├── main.tsx               # Montage React 19
│   ├── App.tsx                # Composant racine avec layout inspiré du design Filko
│   ├── index.css              # Import Tailwind CSS v4 (@import "tailwindcss";)
│   ├── types/
│   │   └── cv.ts              # Types TypeScript (CVNode, CVMutation, CVParsedResult, CVVersion)
│   ├── utils/
│   │   ├── domAdapter.ts      # Parser universel compatible Browser (DOMParser) et Node (linkedom)
│   │   ├── cvParser.ts        # Analyse sémantique et tagging non-destructif data-cv-node
│   │   ├── cvPatcher.ts       # Patching ciblé des nœuds et préservation CSS
│   │   ├── diffUtils.ts       # Algorithme de calcul de diff mot-à-mot
│   │   └── cvEngine.test.ts   # Tests unitaires automatisés (node:test)
│   ├── hooks/
│   │   └── useCVState.ts      # Hook d'état central (document, mutations, Gemini, versions, historique)
│   ├── data/
│   │   └── sampleCVs.ts       # 3 CVs HTML/CSS prêts à l'emploi (Amphix/IFRI, Exécutif, Créatif)
│   └── components/
│       ├── Sidebar.tsx        # Barre latérale Filko (navigation, branding, card Level Up)
│       ├── TopHeader.tsx      # Barre supérieure avec recherche/prompt, badges Gemini, exports
│       ├── HeroBanner.tsx     # Bannière d'accueil crème avec cards d'actions 01/02/03
│       ├── ModulesWorkflow.tsx# Vue type module éducatif avec timeline d'éléments et édition ciblée
│       ├── PreviewPanel.tsx   # Panneau latéral A4 fidèle, iframe sandboxé, comparateur Avant/Après
│       ├── SettingsModal.tsx  # Configuration clé Gemini, quotas, modèle actif
│       └── TemplateModal.tsx  # Choix rapide parmi les modèles HTML de démonstration
```

---

## 4. Endpoints Backend (`server.ts`)

- `GET /api/gemini/status` : Vérifie la présence de `GEMINI_API_KEY` côté serveur ou clé `X-Gemini-Key` client, liste les modèles actifs (`gemini-3.8-flash`, `gemini-3.1-flash-lite`).
- `POST /api/gemini/analyze` : Diagnostic RH et complétude du CV sans toucher au code.
- `POST /api/gemini/update` : Reçoit `{ instruction, editableNodes, model }` et retourne `{ summary, mutations: [...], confirmedInfo, missingOrNeedConfirmation }`. Utilise `ThinkingLevel.LOW` pour un temps de réponse rapide (< 2s) et dispose d'un fallback intelligent en cas de quota dépassé.
- `POST /api/gemini/tailor-job` : Analyse l'adéquation CV vs Offre d'emploi sans jamais inventer d'expérience ni de diplôme.

---

## 5. Types Clés (`src/types/cv.ts`)

```typescript
export interface CVNode {
  id: string;            // ex: "education-0-title", "hdr-role", "proj-1-title"
  section: CVSectionType;// "header" | "summary" | "education" | "experience" | "projects" | ...
  label: string;          // Intitulé lisible
  tag: string;            // "h1", "h3", "p", "span", "li"
  textContent: string;    // Texte actuel
  innerHtml: string;
  href?: string;          // Si c'est un lien a[href]
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
```

---

## 6. Règles de Conception et d'Évolution

1. **Sécurité Iframe** : L'aperçu du CV s'exécute toujours avec `sandbox="allow-same-origin"`. Ne jamais ajouter `allow-scripts` sans précaution d'isolation.
2. **Compatibilité Node / Test** : `src/utils/domAdapter.ts` permet à `cvParser.ts` et `cvPatcher.ts` de tourner sous Node.js via `linkedom` et dans le navigateur via `window.DOMParser`. Tout nouvel utilitaire de manipulation HTML doit utiliser `parseHTMLToDocument`.
3. **Tests de non-régression** : Toujours exécuter `npx --yes tsx --test src/utils/cvEngine.test.ts` après avoir modifié les parsers ou le patcher.
4. **Style Filko** : L'interface utilise une palette chaleureuse (crème `#FBF9F4`, jaune solaire `#F59E0B`, violet `#7C3AED`, anthracite `#1E1D1B`, bordures sable `#EBE6D7`) inspirée du dashboard éducatif moderne de référence.
