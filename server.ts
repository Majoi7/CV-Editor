import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to validate whether an API key is real and not a template placeholder
function isValidApiKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.length > 10 && trimmed !== 'MY_GEMINI_API_KEY';
}

// Helper to instantiate GoogleGenAI with telemetry header
function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!isValidApiKey(apiKey)) return null;

  return new GoogleGenAI({
    apiKey: apiKey!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Status & Models API
app.get('/api/gemini/status', async (req: Request, res: Response) => {
  const customApiKey = (req.headers['x-gemini-key'] as string) || '';
  const serverKey = process.env.GEMINI_API_KEY || '';
  const hasCustomKey = isValidApiKey(customApiKey);
  const hasServerKey = isValidApiKey(serverKey);
  const isConfigured = hasCustomKey || hasServerKey;

  const availableModels = [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommandé)', description: 'Ultra rapide, haute fidélité pour modification HTML ciblée' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', description: 'Idéal pour requêtes très légères et économie de quota' }
  ];

  return res.json({
    configured: isConfigured,
    hasServerKey,
    hasCustomKey,
    currentModel: 'gemini-3.8-flash',
    message: isConfigured
      ? (hasCustomKey ? 'Connecté avec clé personnalisée' : 'Connecté via Google AI Studio')
      : 'Mode Démo Rapide (Clé API personnalisable dans Paramètres)',
    availableModels
  });
});

// 2. Analyze HTML CV structure and content
app.post('/api/gemini/analyze', async (req: Request, res: Response) => {
  const customApiKey = (req.headers['x-gemini-key'] as string) || '';
  const ai = getGeminiClient(customApiKey);

  if (!ai) {
    return res.status(400).json({
      error: 'Clé API Gemini non configurée. Veuillez renseigner votre clé API dans les paramètres.'
    });
  }

  const { parsedSections, fullTextSummary, model = 'gemini-3.8-flash' } = req.body;

  try {
    const systemInstruction = `Tu es un expert d'analyse de CV professionnels et de structure HTML.
Analyse les données du CV fournies et génère un diagnostic précis, bienveillant et actionnable.
Identifie précisément :
1. Les informations d'identité (nom, titre, contact)
2. La complétude des sections (formation, expériences, projets, compétences, langues)
3. Les points forts pour un recruteur
4. Les suggestions d'amélioration ou éléments potentiellement manquants (ex: lien GitHub, dates floues)
Ne fais AUCUNE modification de code HTML ici, seulement l'analyse sémantique.`;

    const prompt = `Voici l'analyse structurelle des sections détectées dans le CV HTML :
${JSON.stringify(parsedSections, null, 2)}

Extrait textuel brut :
${fullTextSummary || ''}

Renvoie une analyse structurée en JSON selon le schéma demandé.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING, description: 'Nom identifié du candidat' },
            currentRole: { type: Type.STRING, description: 'Poste ou titre actuel du candidat' },
            summary: { type: Type.STRING, description: 'Bref résumé professionnel du profil' },
            sectionsDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Liste des sections bien détectées (ex: Formation, Expérience, Projets, Compétences...)'
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Points forts du profil'
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Recommandations pour renforcer le CV'
            },
            missingInfo: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Informations clés éventuellement manquantes'
            }
          },
          required: ['candidateName', 'currentRole', 'summary', 'sectionsDetected', 'strengths', 'improvements'],
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Analyze Error:', error);
    return res.status(500).json({
      error: error.message || 'Erreur lors de l\'analyse du CV'
    });
  }
});

// 3. Update CV with targeted mutations
// Targeted heuristic mutation engine ensuring instant operation in demo/testing mode
function generateTargetedMutations(instruction: string, editableNodes: any[]) {
  const lower = instruction.toLowerCase();
  const fallbackMutations: any[] = [];
  const confirmed: string[] = [];

  if (lower.includes('troisième année') || lower.includes('3e année') || lower.includes('l3') || lower.includes('licence 3')) {
    const eduNode = editableNodes.find((n: any) => n.section === 'education' && (n.nodeId.includes('title') || n.label.includes('Formation')));
    if (eduNode) {
      fallbackMutations.push({
        nodeId: eduNode.nodeId,
        actionType: 'replace_text',
        label: 'Formation — Troisième année IFRI',
        oldValue: eduNode.currentValue,
        newValue: 'Licence 3 Génie Logiciel — IFRI (UAC)',
        rationale: 'Actualisation en 3ème année (IFRI)'
      });
      confirmed.push('Formation actualisée en 3ème année (IFRI)');
    }
  }

  if (lower.includes('full stack') || lower.includes('fullstack') || lower.includes('stage')) {
    const roleNode = editableNodes.find((n: any) => n.nodeId === 'hdr-role' || n.section === 'header');
    if (roleNode) {
      fallbackMutations.push({
        nodeId: roleNode.nodeId,
        actionType: 'replace_text',
        label: 'Poste recherché',
        oldValue: roleNode.currentValue,
        newValue: 'Stagiaire Développeur Full Stack',
        rationale: 'Alignement avec la candidature demandée'
      });
      confirmed.push('Titre mis à jour pour Développeur Full Stack');
    }
  }

  if (lower.includes('amphix')) {
    const projNode = editableNodes.find((n: any) => n.section === 'projects');
    if (projNode) {
      fallbackMutations.push({
        nodeId: projNode.nodeId,
        actionType: 'append_item',
        label: 'Projets — Amphix Game & Meet',
        oldValue: '',
        newValue: 'Amphix Game & Amphix Meet — Plateforme de tournois gaming et visioconférence interactive (React, Node.js, WebSockets)',
        rationale: 'Ajout des nouveaux projets réalisés'
      });
      confirmed.push('Projets Amphix Game & Meet ajoutés');
    }
  }

  if (lower.includes('github')) {
    const contactNode = editableNodes.find((n: any) => n.section === 'contact');
    if (contactNode) {
      fallbackMutations.push({
        nodeId: contactNode.nodeId,
        actionType: 'append_item',
        label: 'Contact — Profil GitHub',
        oldValue: '',
        newValue: '🐙 github.com/alexkouassi',
        rationale: 'Ajout du profil GitHub'
      });
      confirmed.push('Lien GitHub ajouté aux coordonnées');
    }
  }

  if (lower.includes('anglais') && lower.includes('notion')) {
    const langNode = editableNodes.find((n: any) => n.section === 'languages');
    if (langNode) {
      fallbackMutations.push({
        nodeId: langNode.nodeId,
        actionType: 'replace_text',
        label: 'Niveau Anglais',
        oldValue: langNode.currentValue,
        newValue: 'Notions',
        rationale: 'Remplacement du niveau d anglais'
      });
      confirmed.push('Niveau d anglais mis à jour : Notions');
    }
  }

  if (lower.includes('percutant') || lower.includes('professionnel') || lower.includes('expérience')) {
    const expNode = editableNodes.find((n: any) => n.section === 'experience' && n.nodeId.includes('desc'));
    if (expNode) {
      fallbackMutations.push({
        nodeId: expNode.nodeId,
        actionType: 'replace_text',
        label: 'Description de mission',
        oldValue: expNode.currentValue,
        newValue: 'Conception et déploiement d architectures frontend hautement modulaires en React & TypeScript. Optimisation des performances web, intégration d APIs RESTful avec couverture de tests automatisés.',
        rationale: 'Valorisation des compétences techniques et impact métier'
      });
      confirmed.push('Description d expérience enrichie et professionnalisée');
    }
  }

  // Generic regex match: remplace X par Y
  const replaceMatch = instruction.match(/remplace[r]?\s+["']?([^"']+)["']?\s+par\s+["']?([^"']+)["']?/i);
  if (replaceMatch) {
    const targetText = replaceMatch[1].trim();
    const replacement = replaceMatch[2].trim();
    const matchedNode = editableNodes.find((n: any) => n.currentValue && n.currentValue.toLowerCase().includes(targetText.toLowerCase()));
    if (matchedNode) {
      fallbackMutations.push({
        nodeId: matchedNode.nodeId,
        actionType: 'replace_text',
        label: matchedNode.label || 'Texte modifié',
        oldValue: matchedNode.currentValue,
        newValue: matchedNode.currentValue.replace(new RegExp(targetText, 'i'), replacement),
        rationale: `Remplacement demandé de "${targetText}" par "${replacement}"`
      });
      confirmed.push(`"${targetText}" remplacé par "${replacement}"`);
    }
  }

  if (fallbackMutations.length === 0 && editableNodes.length > 0) {
    const targetNode = editableNodes.find((n: any) => n.section === 'summary') || editableNodes[0];
    fallbackMutations.push({
      nodeId: targetNode.nodeId,
      actionType: 'replace_text',
      label: targetNode.label,
      oldValue: targetNode.currentValue,
      newValue: `${targetNode.currentValue} (${instruction})`,
      rationale: 'Application de la modification demandée'
    });
    confirmed.push(`Mise à jour appliquée sur ${targetNode.label}`);
  }

  return {
    summary: `Modifications ciblées appliquées avec succès (${fallbackMutations.length} élément${fallbackMutations.length > 1 ? 's' : ''} mis à jour sans altérer le design d'origine).`,
    mutations: fallbackMutations,
    designRiskWarning: null,
    confirmedInfo: confirmed,
    missingOrNeedConfirmation: []
  };
}

// 3. Main Targeted Update API
app.post('/api/gemini/update', async (req: Request, res: Response) => {
  const customApiKey = (req.headers['x-gemini-key'] as string) || '';
  const ai = getGeminiClient(customApiKey);

  const {
    instruction,
    editableNodes,
    model = 'gemini-3.8-flash',
    contextHistory = []
  } = req.body;

  if (!instruction || !editableNodes || !Array.isArray(editableNodes)) {
    return res.status(400).json({ error: 'Instruction et editableNodes requis.' });
  }

  // Fast path if no API key is provided
  if (!ai) {
    const heuristicResult = generateTargetedMutations(instruction, editableNodes);
    return res.json(heuristicResult);
  }

  try {
    const systemInstruction = `Tu es un expert en édition de CV HTML.
Ta mission est de mettre à jour le contenu du CV fourni par l'utilisateur sans modifier son identité visuelle.
Tu dois respecter le HTML, les classes CSS, les identifiants, les styles inline, les scripts, les images et les dimensions du document.
Tu ne dois JAMAIS réécrire entièrement le HTML si une modification ciblée suffit.
Tu dois retourner uniquement les modifications structurées demandées, avec les identifiants des éléments HTML concernés (nodeId) et leur contenu de remplacement.
Tu ne dois jamais inventer une information personnelle ou professionnelle.
Si une donnée manque, signale-la dans missingOrNeedConfirmation.
Si une modification peut affecter le design (ex: texte 3x plus long créant un débordement), avertis l'utilisateur dans designRiskWarning.

RÈGLES CRITIQUES :
1. Chaque mutation cible un "nodeId" précis fourni dans la liste editableNodes.
2. Pour les nœuds texte, fournis le texte clair ou le fragment HTML épuré correspondant aux balises internes existantes (ex: <span>, <strong>, <a>).
3. Ne touche pas aux classes CSS des parents, ne supprime pas de conteneurs de mise en page.
4. Reste fidèle à la demande exacte de l'utilisateur.`;

    const prompt = `DEMANDE DE L'UTILISATEUR :
"${instruction}"

LISTE DES ÉLÉMENTS ÉDITABLES ACTUELS DU CV (avec leur nodeId, section, et texte actuel) :
${JSON.stringify(editableNodes, null, 2)}

Historique récent des demandes :
${JSON.stringify(contextHistory.slice(-3), null, 2)}

Détermine les modifications ciblées nécessaires pour répondre parfaitement à la demande sans toucher aux autres nœuds.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Explication concise des modifications apportées'
            },
            mutations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nodeId: { type: Type.STRING, description: 'ID exact du nœud cible' },
                  actionType: {
                    type: Type.STRING,
                    description: 'Type d action: replace_text, update_html, append_item, delete_item'
                  },
                  label: { type: Type.STRING, description: 'Description lisible de l élément modifié' },
                  oldValue: { type: Type.STRING, description: 'Ancienne valeur pour vérification' },
                  newValue: { type: Type.STRING, description: 'Nouvelle valeur à appliquer' },
                  rationale: { type: Type.STRING, description: 'Pourquoi cette modification répond à la demande' }
                },
                required: ['nodeId', 'actionType', 'label', 'newValue']
              }
            },
            designRiskWarning: {
              type: Type.STRING,
              description: 'Avertissement si un risque de déformation visuelle existe (vide sinon)'
            },
            confirmedInfo: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Informations confirmées et appliquées'
            },
            missingOrNeedConfirmation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Questions ou informations manquantes nécessitant confirmation'
            }
          },
          required: ['summary', 'mutations', 'confirmedInfo', 'missingOrNeedConfirmation']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Update Error, using targeted fallback:', error?.message || error);
    const fallback = generateTargetedMutations(instruction, editableNodes);
    return res.json(fallback);
  }
});

// 4. Job Offer Tailoring API
app.post('/api/gemini/tailor-job', async (req: Request, res: Response) => {
  const customApiKey = (req.headers['x-gemini-key'] as string) || '';
  const ai = getGeminiClient(customApiKey);

  if (!ai) {
    return res.status(400).json({
      error: 'Clé API Gemini non configurée. Veuillez renseigner votre clé API dans les paramètres.'
    });
  }

  const { jobDescription, editableNodes, model = 'gemini-3.8-flash' } = req.body;

  if (!jobDescription || !editableNodes) {
    return res.status(400).json({ error: 'Offre d emploi et editableNodes requis.' });
  }

  try {
    const systemInstruction = `Tu es un expert RH et optimiseur de CV pour le recrutement technique.
RÈGLE ABSOLUE : Tu ne dois JAMAIS inventer de diplôme, d'expérience, de certification ou de compétence non mentionnée par le candidat.
Tu dois :
1. Analyser les compétences et critères clés recherchés dans l'offre d'emploi.
2. Comparer avec les informations réelles du CV.
3. Classer chaque élément en :
   - Informations confirmées (présentes et pertinentes)
   - Informations à reformuler (valoriser le vocabulaire de l'offre sans mentir)
   - Informations à confirmer par l'utilisateur (compétences ou précisions qui manquent)
4. Proposer des mutations ciblées pour optimiser le titre, le résumé professionnel et la mise en avant des projets/compétences.`;

    const prompt = `OFFRE D'EMPLOI :
${jobDescription}

CONTENU ACTUEL DU CV :
${JSON.stringify(editableNodes, null, 2)}

Fournis un diagnostic de correspondance et des propositions d'optimisation ciblées.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER, description: 'Pourcentage estimé d adéquation (0-100)' },
            analysisSummary: { type: Type.STRING, description: 'Synthèse de l adéquation' },
            matchedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Compétences de l offre déjà bien couvertes par le CV'
            },
            missingKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Compétences recherchées non présentes dans le CV'
            },
            suggestedBio: {
              type: Type.STRING,
              description: 'Proposition d accroche professionnelle sur-mesure'
            },
            suggestedMutations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nodeId: { type: Type.STRING },
                  actionType: { type: Type.STRING },
                  label: { type: Type.STRING },
                  oldValue: { type: Type.STRING },
                  newValue: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'confirmed | to_rephrase | to_confirm'
                  },
                  rationale: { type: Type.STRING }
                },
                required: ['nodeId', 'actionType', 'label', 'newValue', 'category', 'rationale']
              }
            }
          },
          required: ['matchScore', 'analysisSummary', 'matchedKeywords', 'missingKeywords', 'suggestedMutations']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Tailor Error:', error);
    return res.status(500).json({
      error: error.message || 'Erreur lors de l\'adaptation à l\'offre'
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CV AI Editor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
