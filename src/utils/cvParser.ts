import { CVNode, CVParsedResult, CVSectionSummary, CVSectionType } from '../types/cv.ts';
import { parseHTMLToDocument, serializeDocumentToHTML } from './domAdapter.ts';

// Simple hash utility to compute CSS signature
export function computeStyleSignature(doc: Document): string {
  const styles = Array.from(doc.querySelectorAll('style')).map(s => s.textContent || '').join('||');
  const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(l => l.getAttribute('href') || '').join('||');
  
  // Compute basic hash
  const str = styles + '##' + links;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sig_${hash}_${doc.querySelectorAll('style').length}styles_${doc.querySelectorAll('link[rel="stylesheet"]').length}links`;
}

/**
 * Analyzes and tags the HTML CV with non-destructive data-cv-node identifiers.
 * Returns the annotated HTML and the extracted node metadata.
 */
export function parseAndAnnotateCV(html: string): { annotatedHtml: string; parsed: CVParsedResult } {
  const doc = parseHTMLToDocument(html);

  const nodes: CVNode[] = [];
  const sectionsMap = new Map<CVSectionType, { title: string; count: number; samples: string[] }>();

  function registerNode(node: CVNode) {
    nodes.push(node);
    const existing = sectionsMap.get(node.section) || { title: node.section.toUpperCase(), count: 0, samples: [] };
    existing.count++;
    if (existing.samples.length < 3 && node.textContent.trim()) {
      existing.samples.push(node.textContent.trim().slice(0, 40));
    }
    sectionsMap.set(node.section, existing);
  }

  // 1. Identify Candidate Name & Header Info
  let candidateName = '';
  let candidateRole = '';

  const nameElem = doc.querySelector('h1, .name, .candidate-name, [data-field="name"], .header-title');
  if (nameElem && nameElem.textContent?.trim()) {
    candidateName = nameElem.textContent.trim();
    nameElem.setAttribute('data-cv-node', 'hdr-name');
    registerNode({
      id: 'hdr-name',
      section: 'header',
      label: 'Nom et Prénom',
      tag: nameElem.tagName.toLowerCase(),
      selector: 'h1',
      textContent: candidateName,
      innerHtml: nameElem.innerHTML,
    });
  }

  // Title / Subtitle / Role
  const roleElem = doc.querySelector('.title, .role, .subtitle, .job-title, .profession, h2.subtitle, p.role');
  if (roleElem && roleElem.textContent?.trim()) {
    candidateRole = roleElem.textContent.trim();
    roleElem.setAttribute('data-cv-node', 'hdr-role');
    registerNode({
      id: 'hdr-role',
      section: 'header',
      label: 'Titre ou Poste recherché',
      tag: roleElem.tagName.toLowerCase(),
      selector: roleElem.className ? `.${roleElem.className.split(' ')[0]}` : 'role',
      textContent: candidateRole,
      innerHtml: roleElem.innerHTML,
    });
  }

  // Bio / Summary
  const summaryElem = doc.querySelector('.summary, .bio, .about, .profil, .profile, #summary, #profile, [data-field="bio"]');
  if (summaryElem && summaryElem !== roleElem && summaryElem !== nameElem) {
    const pElem = summaryElem.tagName.toLowerCase() === 'p' ? summaryElem : summaryElem.querySelector('p') || summaryElem;
    pElem.setAttribute('data-cv-node', 'hdr-summary');
    registerNode({
      id: 'hdr-summary',
      section: 'summary',
      label: 'Résumé / Profil professionnel',
      tag: pElem.tagName.toLowerCase(),
      selector: '.summary',
      textContent: pElem.textContent?.trim() || '',
      innerHtml: pElem.innerHTML,
    });
  }

  // 2. Identify Contact items (email, phone, location, github, linkedin, site)
  const contactLinks = Array.from(doc.querySelectorAll('a[href^="mailto:"], a[href^="tel:"], a[href*="github.com"], a[href*="linkedin.com"], .contact, .contact-item, #contact li, .contacts li'));
  contactLinks.forEach((elem, index) => {
    const text = elem.textContent?.trim() || '';
    const href = elem.getAttribute('href') || undefined;
    if (!text && !href) return;

    let label = `Contact #${index + 1}`;
    if (href?.startsWith('mailto:') || text.includes('@')) label = 'Email de contact';
    else if (href?.startsWith('tel:') || /[\d\s+()-]{8,}/.test(text)) label = 'Téléphone';
    else if (href?.includes('github.com') || text.toLowerCase().includes('github')) label = 'Lien GitHub';
    else if (href?.includes('linkedin.com') || text.toLowerCase().includes('linkedin')) label = 'Lien LinkedIn';
    else if (text.toLowerCase().includes('portfolio') || href?.includes('http')) label = 'Site web / Portfolio';
    else label = `Coordonnée (${text.slice(0, 20)})`;

    const id = `contact-${index}`;
    elem.setAttribute('data-cv-node', id);
    registerNode({
      id,
      section: 'contact',
      label,
      tag: elem.tagName.toLowerCase(),
      selector: elem.tagName.toLowerCase(),
      textContent: text,
      innerHtml: elem.innerHTML,
      href,
    });
  });

  // 3. Helper to detect CV sections by headings (Formation, Expériences, Projets, Compétences, Langues)
  const headings = Array.from(doc.querySelectorAll('h2, h3, .section-title, .title-section, [data-section]'));
  
  headings.forEach((heading, hIndex) => {
    const headingText = (heading.textContent || '').toLowerCase().trim();
    if (!headingText) return;

    let sectionType: CVSectionType = 'custom';
    if (headingText.includes('format') || headingText.includes('éducat') || headingText.includes('diplôm') || headingText.includes('etude') || headingText.includes('étude')) {
      sectionType = 'education';
    } else if (headingText.includes('expér') || headingText.includes('exper') || headingText.includes('professionnel') || headingText.includes('parcours')) {
      sectionType = 'experience';
    } else if (headingText.includes('projet') || headingText.includes('réalisat') || headingText.includes('portfolio')) {
      sectionType = 'projects';
    } else if (headingText.includes('compét') || headingText.includes('skill') || headingText.includes('techno') || headingText.includes('outils') || headingText.includes('savoir')) {
      sectionType = 'skills';
    } else if (headingText.includes('langue') || headingText.includes('language')) {
      sectionType = 'languages';
    } else if (headingText.includes('certif') || headingText.includes('attest')) {
      sectionType = 'certifications';
    } else if (headingText.includes('intérêt') || headingText.includes('loisir') || headingText.includes('passion')) {
      sectionType = 'interests';
    }

    if (sectionType === 'custom') return;

    // Find elements strictly belonging to this heading (siblings until next heading, or inside section wrapper)
    const sectionContainers: Element[] = [];
    const sectionWrapper = heading.closest('section, article, .section');
    if (sectionWrapper && sectionWrapper.querySelectorAll('h2, h3').length === 1) {
      sectionContainers.push(sectionWrapper);
    } else {
      let next = heading.nextElementSibling;
      while (next && !['H1', 'H2', 'H3'].includes(next.tagName)) {
        sectionContainers.push(next);
        next = next.nextElementSibling;
      }
    }

    // Collect all candidate items inside these containers
    const items: Element[] = [];
    sectionContainers.forEach(sc => {
      // Direct matches or sub items
      if (sc.matches('.item, .entry, .card, li, .timeline-item, .project-card, .exp-item, .edu-item, .skill-badge, .badge, .lang-item')) {
        items.push(sc);
      } else {
        const sub = sc.querySelectorAll('.item, .entry, .card, li, .timeline-item, .project-card, .exp-item, .edu-item, .skill-badge, .badge, .lang-item');
        if (sub.length > 0) {
          sub.forEach(el => items.push(el));
        } else {
          // If no specific class, collect paragraphs or spans or direct children
          const direct = Array.from(sc.children).filter(c => c.textContent?.trim());
          if (direct.length > 0) {
            direct.forEach(el => items.push(el));
          } else if (sc.textContent?.trim()) {
            items.push(sc);
          }
        }
      }
    });

    if (items.length > 0) {
      items.forEach((item, itemIdx) => {
        // Tag sub-elements inside item if possible
        const subTitle = item.querySelector('h3, h4, .title, .degree, .position, .project-title, strong');
        const subDesc = item.querySelector('.desc, .description, p, .details');
        const subDates = item.querySelector('.date, .period, .year, time');

        if (subTitle && subTitle.textContent?.trim() && subTitle !== item) {
          const id = `${sectionType}-${itemIdx}-title`;
          subTitle.setAttribute('data-cv-node', id);
          registerNode({
            id,
            section: sectionType,
            label: `${heading.textContent?.trim()} : Titre #${itemIdx + 1}`,
            tag: subTitle.tagName.toLowerCase(),
            selector: subTitle.tagName.toLowerCase(),
            textContent: subTitle.textContent.trim(),
            innerHtml: subTitle.innerHTML,
          });
        }

        if (subDates && subDates.textContent?.trim() && subDates !== subTitle && subDates !== item) {
          const id = `${sectionType}-${itemIdx}-date`;
          subDates.setAttribute('data-cv-node', id);
          registerNode({
            id,
            section: sectionType,
            label: `${heading.textContent?.trim()} : Période #${itemIdx + 1}`,
            tag: subDates.tagName.toLowerCase(),
            selector: subDates.tagName.toLowerCase(),
            textContent: subDates.textContent.trim(),
            innerHtml: subDates.innerHTML,
          });
        }

        if (subDesc && subDesc.textContent?.trim() && subDesc !== subTitle && subDesc !== item) {
          const id = `${sectionType}-${itemIdx}-desc`;
          subDesc.setAttribute('data-cv-node', id);
          registerNode({
            id,
            section: sectionType,
            label: `${heading.textContent?.trim()} : Détails #${itemIdx + 1}`,
            tag: subDesc.tagName.toLowerCase(),
            selector: subDesc.tagName.toLowerCase(),
            textContent: subDesc.textContent.trim(),
            innerHtml: subDesc.innerHTML,
          });
        }

        // If no distinct sub-elements, tag the item itself
        if (!subTitle && !subDesc) {
          const id = `${sectionType}-item-${itemIdx}`;
          item.setAttribute('data-cv-node', id);
          registerNode({
            id,
            section: sectionType,
            label: `${heading.textContent?.trim()} : ${item.textContent?.trim().slice(0, 20) || `Élément #${itemIdx + 1}`}`,
            tag: item.tagName.toLowerCase(),
            selector: item.tagName.toLowerCase(),
            textContent: item.textContent?.trim() || '',
            innerHtml: item.innerHTML,
          });
        }
      });
    }
  });

  // Calculate stats
  const totalWords = (doc.body?.textContent || '').trim().split(/\s+/).filter(Boolean).length;
  const styleTagCount = doc.querySelectorAll('style').length;
  const linkTagCount = doc.querySelectorAll('link[rel="stylesheet"]').length;
  const imagesCount = doc.querySelectorAll('img, svg').length;
  const scriptsCount = doc.querySelectorAll('script').length;
  const styleSignature = computeStyleSignature(doc);

  const sections: CVSectionSummary[] = Array.from(sectionsMap.entries()).map(([type, val]) => ({
    type,
    title: val.title,
    nodeCount: val.count,
    sampleText: val.samples.join(', '),
  }));

  const annotatedHtml = serializeDocumentToHTML(doc);

  return {
    annotatedHtml,
    parsed: {
      nodes,
      sections,
      candidateName: candidateName || 'Candidat',
      candidateRole: candidateRole || 'Profil Professionnel',
      stats: {
        totalWords,
        styleTagCount,
        linkTagCount,
        imagesCount,
        scriptsCount,
      },
      styleSignature,
    },
  };
}
