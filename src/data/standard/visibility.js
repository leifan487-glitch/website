const buildEnv = import.meta.env ?? {};

const internalReviewEnabled = buildEnv.VITE_SHOW_INTERNAL_STATUS === "true";

export const standardPublicMode = !internalReviewEnabled && (
  buildEnv.MODE === "production"
  || buildEnv.VITE_PUBLIC_PREVIEW === "true"
  || buildEnv.VITE_SHOW_INTERNAL_STATUS === "false"
);

export function isApprovedStandardContent(record) {
  return Boolean(
    record
    && record.contentStatus === "VERIFIED"
    && record.publicApproved === true
    && record.visibility !== "PRIVATE"
    && record.conflict !== true,
  );
}

export function selectStandardContent(records, { publicMode = standardPublicMode } = {}) {
  if (!Array.isArray(records)) return [];
  return publicMode
    ? records.filter(isApprovedStandardContent)
    : records.filter((record) => record.visibility !== "PRIVATE");
}
