import { readFileSync } from 'node:fs';
// Owner 2026-09-18 reopens only the product header and three story sections.
// Historical snapshots are retained. The new suite locks every other runtime
// byte and the unchanged sibling functions inside StandardProductSections.
export const productRefreshBaseline = JSON.parse(readFileSync(new URL('../../internal/product-refresh-20260918-baseline.json', import.meta.url)));
export const productRefreshAdded = ['src/components/StandardBrochureSections.jsx', 'src/components/standard-brochure.css', 'src/data/standard/brochureConfigurations.js', ...['dual','inspection','engineering'].map(name=>'public/media/mantis-standard/product-forms-alpha/'+name+'.webp')];
export function beforeProductRefresh(file, bytes) {
 if(file==='src/components/ProductSectionRail.jsx')return Buffer.from(bytes.toString().replace('  { id: "specifications", label: "核心参数" },','  { id: "development", label: "开发路径" },\n  { id: "specifications", label: "核心参数" },'));
 return Object.hasOwn(productRefreshBaseline.originals, file) ? Buffer.from(productRefreshBaseline.originals[file]) : bytes;
}
