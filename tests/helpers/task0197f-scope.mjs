// Reverse only the exact Owner-approved public dimension/source edit when
// comparing with historical snapshots. No snapshot hash is changed or waived.
import { beforeProductRefresh } from './product-refresh-scope.mjs';
export function beforeParameterApproval(file, bytes) {
  bytes = beforeProductRefresh(file, bytes);
  if (file !== 'src/data/standard/specifications.js') return bytes;
  return Buffer.from(bytes.toString()
    .replaceAll('/* @__PURE__ */ spec(', 'spec(')
    .replace('source: record.source ?? "docs/STANDARD_SPEC_BASELINE_V1.md"', 'source: "docs/STANDARD_SPEC_BASELINE_V1.md"')
    .replace('value: "633 × 552 × 1400", unit: "mm", variant: "整机通用", source: "Owner-approved Performance PPT"', 'value: "633 x 552 x 1300", unit: "mm", variant: "整机通用"'));
}
