import { readFileSync } from 'node:fs';
import { reopened0194r } from './task0194r-scope.mjs';
import { reopened0196 } from './task0196-scope.mjs';
export const finalPolish = JSON.parse(readFileSync(new URL('../../internal/final-polish-20260916.json', import.meta.url)));
// Owner explicitly reopened only these local visual/player surfaces. Historical hashes are retained.
// Subsequent Owner request also removes the two product-page tail anchors.
export const reopenedFinalPolish = new Set([...finalPolish.editable, 'src/components/ProductSectionRail.jsx', ...reopened0194r, ...reopened0196]);
