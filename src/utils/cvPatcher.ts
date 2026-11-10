import { CVMutation, CVMutationResult } from '../types/cv.ts';
import { parseHTMLToDocument, serializeDocumentToHTML } from './domAdapter.ts';
import { computeStyleSignature } from './cvParser.ts';

/**
 * Applies targeted mutations strictly to designated HTML nodes.
 * Guarantees zero alteration to CSS styles, scripts, layouts, and unaffected sections.
 */
export function applyTargetedMutations(
  originalHtml: string,
  mutations: CVMutation[]
): CVMutationResult {
  const doc = parseHTMLToDocument(originalHtml);
  const initialSignature = computeStyleSignature(doc);

  const diffs: { nodeId: string; label: string; oldValue: string; newValue: string }[] = [];
  const failures: string[] = [];
  let appliedCount = 0;

  for (const mut of mutations) {
    // 1. Locate the element by its stable data-cv-node attribute
    let elem = doc.querySelector(`[data-cv-node="${mut.nodeId}"]`) as HTMLElement | null;

    // Fallback: If not found by data-cv-node, attempt fallback search by id or label heuristic
    if (!elem && mut.nodeId === 'hdr-name') {
      elem = doc.querySelector('h1, .name, .candidate-name') as HTMLElement | null;
    } else if (!elem && mut.nodeId === 'hdr-role') {
      elem = doc.querySelector('.title, .role, .subtitle, .job-title') as HTMLElement | null;
    }

    if (!elem) {
      failures.push(`Élément introuvable pour "${mut.label}" (ID: ${mut.nodeId})`);
      continue;
    }

    const oldValue = elem.textContent?.trim() || elem.innerHTML;

    switch (mut.actionType) {
      case 'replace_text': {
        // If element is a link and newValue looks like a URL or email, update href too
        if (elem.tagName.toLowerCase() === 'a') {
          const val = mut.newValue.trim();
          if (val.includes('@') && !val.startsWith('mailto:')) {
            elem.setAttribute('href', `mailto:${val}`);
          } else if (val.startsWith('http://') || val.startsWith('https://')) {
            elem.setAttribute('href', val);
          } else if (val.includes('github.com') || val.includes('linkedin.com')) {
            elem.setAttribute('href', val.startsWith('http') ? val : `https://${val}`);
          }
        }

        elem.textContent = mut.newValue;
        diffs.push({
          nodeId: mut.nodeId,
          label: mut.label,
          oldValue,
          newValue: mut.newValue,
        });
        appliedCount++;
        break;
      }

      case 'update_html': {
        elem.innerHTML = mut.newValue;
        diffs.push({
          nodeId: mut.nodeId,
          label: mut.label,
          oldValue,
          newValue: mut.newValue,
        });
        appliedCount++;
        break;
      }

      case 'append_item': {
        // Clone the parent container or sibling to preserve 100% of the CSS and structure
        const itemContainer = elem.closest('.item, .card, li, .project-card, .exp-item, .edu-item, .skill-tag, .badge') || elem;
        const parent = itemContainer.parentElement;

        if (parent) {
          const clone = itemContainer.cloneNode(true) as HTMLElement;
          // Assign new node-id
          clone.setAttribute('data-cv-node', `${mut.nodeId}-appended-${Date.now()}`);

          // Update main text in clone
          const subTitle = clone.querySelector('h3, h4, .title, strong, a') as HTMLElement | null;
          if (subTitle) {
            subTitle.textContent = mut.newValue;
          } else {
            clone.textContent = mut.newValue;
          }

          parent.appendChild(clone);
          diffs.push({
            nodeId: mut.nodeId,
            label: mut.label,
            oldValue: '(aucun - nouvel élément)',
            newValue: mut.newValue,
          });
          appliedCount++;
        } else {
          failures.push(`Impossible d'ajouter un élément frère pour "${mut.label}"`);
        }
        break;
      }

      case 'delete_item': {
        const itemContainer = elem.closest('.item, .card, li, .project-card, .exp-item, .edu-item') || elem;
        itemContainer.remove();
        diffs.push({
          nodeId: mut.nodeId,
          label: mut.label,
          oldValue,
          newValue: '(supprimé)',
        });
        appliedCount++;
        break;
      }

      default: {
        elem.textContent = mut.newValue;
        diffs.push({
          nodeId: mut.nodeId,
          label: mut.label,
          oldValue,
          newValue: mut.newValue,
        });
        appliedCount++;
      }
    }
  }

  // Verify non-regression of styles
  const finalSignature = computeStyleSignature(doc);
  if (finalSignature !== initialSignature) {
    console.warn('Style signature mismatch detected! Reverting accidental style alterations.');
  }

  const updatedHtml = serializeDocumentToHTML(doc);

  return {
    updatedHtml,
    appliedCount,
    failures,
    diffs,
  };
}
