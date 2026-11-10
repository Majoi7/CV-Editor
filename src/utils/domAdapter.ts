import { parseHTML } from 'linkedom';

export function parseHTMLToDocument(html: string): Document {
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    const parser = new window.DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  // Fallback for Node.js / unit tests using linkedom
  const { document } = parseHTML(html);
  return document as unknown as Document;
}

export function serializeDocumentToHTML(doc: Document): string {
  // Check if doctype exists
  let doctype = '<!DOCTYPE html>\n';
  if (doc.doctype) {
    doctype = `<!DOCTYPE ${doc.doctype.name || 'html'}>\n`;
  }
  return doctype + (doc.documentElement ? doc.documentElement.outerHTML : '');
}
