import { readFileSync } from 'node:fs';
export const finalPolish = JSON.parse(readFileSync(new URL('../../internal/final-polish-20260916.json', import.meta.url)));
// Owner explicitly reopened only these local visual/player surfaces. Historical hashes are retained.
// Subsequent Owner request also removes the two product-page tail anchors.
export const reopenedFinalPolish = new Set([...finalPolish.editable, 'src/components/ProductSectionRail.jsx']);
