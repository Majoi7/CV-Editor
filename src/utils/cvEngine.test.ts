import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndAnnotateCV, computeStyleSignature } from './cvParser.ts';
import { applyTargetedMutations } from './cvPatcher.ts';
import { computeWordDiff } from './diffUtils.ts';
import { SAMPLE_CVS } from '../data/sampleCVs.ts';
import { parseHTMLToDocument } from './domAdapter.ts';

test('parseAndAnnotateCV correctly extracts candidate identity, sections, and nodes', () => {
  const sample = SAMPLE_CVS[0].html;
  const { annotatedHtml, parsed } = parseAndAnnotateCV(sample);

  assert.equal(parsed.candidateName, 'Alex Kouassi');
  assert.equal(parsed.candidateRole, 'Étudiant Développeur Web & Mobile');
  assert.ok(parsed.nodes.length >= 5, `Expected at least 5 nodes, got ${parsed.nodes.length}`);
  assert.ok(parsed.sections.some(s => s.type === 'education'), 'Should detect education section');
  assert.ok(parsed.sections.some(s => s.type === 'projects'), 'Should detect projects section');
  assert.ok(parsed.sections.some(s => s.type === 'contact'), 'Should detect contact section');

  // Verify annotated HTML contains data-cv-node attributes
  assert.ok(annotatedHtml.includes('data-cv-node="hdr-name"'), 'Must have hdr-name tag');
  assert.ok(annotatedHtml.includes('data-cv-node="hdr-role"'), 'Must have hdr-role tag');
});

test('applyTargetedMutations updates only targeted nodes without altering CSS or layout', () => {
  const sample = SAMPLE_CVS[0].html;
  const { annotatedHtml } = parseAndAnnotateCV(sample);

  const docBefore = parseHTMLToDocument(annotatedHtml);
  const sigBefore = computeStyleSignature(docBefore);
  const styleContentBefore = Array.from(docBefore.querySelectorAll('style')).map(s => s.textContent).join('');

  // Apply targeted update: change education and add GitHub
  const mutations = [
    {
      nodeId: 'hdr-role',
      actionType: 'replace_text' as const,
      label: 'Poste recherché',
      newValue: 'Stagiaire Développeur Full Stack',
      rationale: 'Alignement avec la candidature'
    },
    {
      nodeId: 'education-0-title',
      actionType: 'replace_text' as const,
      label: 'Formation IFRI',
      newValue: 'Licence 3 Génie Logiciel — IFRI (UAC)',
      rationale: 'Actualisation en 3ème année'
    }
  ];

  const patchResult = applyTargetedMutations(annotatedHtml, mutations);
  assert.equal(patchResult.appliedCount, 2, 'Both mutations should be successfully applied');
  assert.equal(patchResult.failures.length, 0, 'No failures expected');

  const docAfter = parseHTMLToDocument(patchResult.updatedHtml);
  const sigAfter = computeStyleSignature(docAfter);
  const styleContentAfter = Array.from(docAfter.querySelectorAll('style')).map(s => s.textContent).join('');

  // 1. Verify targeted nodes updated
  const roleAfter = docAfter.querySelector('[data-cv-node="hdr-role"]')?.textContent;
  assert.equal(roleAfter, 'Stagiaire Développeur Full Stack');

  const eduAfter = docAfter.querySelector('[data-cv-node="education-0-title"]')?.textContent;
  assert.equal(eduAfter, 'Licence 3 Génie Logiciel — IFRI (UAC)');

  // 2. CRITICAL NON-REGRESSION CHECK: CSS and styles must remain 100% strictly identical!
  assert.equal(sigAfter, sigBefore, 'CSS style signature must remain identical');
  assert.equal(styleContentAfter, styleContentBefore, 'CSS stylesheet content must be 100% unchanged');

  // 3. Verify other sections were untouched
  const expTitle = docAfter.querySelector('[data-cv-node="experience-0-title"]')?.textContent;
  assert.ok(expTitle?.includes('BeninTech'), 'Experience section must remain untouched');
});

test('computeWordDiff computes clean diff parts', () => {
  const oldText = 'Licence 2 Génie Logiciel IFRI';
  const newText = 'Licence 3 Génie Logiciel IFRI';

  const diff = computeWordDiff(oldText, newText);
  assert.ok(diff.some(d => d.value.includes('2') && d.removed));
  assert.ok(diff.some(d => d.value.includes('3') && d.added));
});
