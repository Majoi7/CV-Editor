export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

/**
 * Computes a line-by-line or word-by-word diff comparison between old and new text.
 */
export function computeWordDiff(oldText: string, newText: string): DiffPart[] {
  if (oldText === newText) {
    return [{ value: newText }];
  }

  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);

  const parts: DiffPart[] = [];
  let i = 0;
  let j = 0;

  while (i < oldWords.length && j < newWords.length) {
    if (oldWords[i] === newWords[j]) {
      parts.push({ value: newWords[j] });
      i++;
      j++;
    } else {
      // Lookahead
      const matchIndexInNew = newWords.indexOf(oldWords[i], j);
      const matchIndexInOld = oldWords.indexOf(newWords[j], i);

      if (matchIndexInNew !== -1 && (matchIndexInOld === -1 || matchIndexInNew - j <= matchIndexInOld - i)) {
        // Words were added in new
        while (j < matchIndexInNew) {
          parts.push({ value: newWords[j], added: true });
          j++;
        }
      } else if (matchIndexInOld !== -1) {
        // Words were removed from old
        while (i < matchIndexInOld) {
          parts.push({ value: oldWords[i], removed: true });
          i++;
        }
      } else {
        // Replaced word
        parts.push({ value: oldWords[i], removed: true });
        parts.push({ value: newWords[j], added: true });
        i++;
        j++;
      }
    }
  }

  while (i < oldWords.length) {
    parts.push({ value: oldWords[i], removed: true });
    i++;
  }

  while (j < newWords.length) {
    parts.push({ value: newWords[j], added: true });
    j++;
  }

  return parts;
}
