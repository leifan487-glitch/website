const buildEnv = import.meta.env ?? {};

const internalReviewEnabled = buildEnv.VITE_SHOW_INTERNAL_STATUS === "true";

export const companyPublicMode = !internalReviewEnabled && (
  buildEnv.MODE === "production"
  || buildEnv.VITE_PUBLIC_PREVIEW === "true"
  || buildEnv.VITE_SHOW_INTERNAL_STATUS === "false"
);

export function isApprovedCompanyContent(record) {
  return Boolean(
    record
    && record.contentStatus === "VERIFIED"
    && record.publicApproved === true
    && record.visibility !== "PRIVATE"
    && record.excludedByProductStrategy !== true,
  );
}

export function selectCompanyContent(records, { publicMode = companyPublicMode } = {}) {
  if (!Array.isArray(records)) return [];
  return publicMode
    ? records.filter(isApprovedCompanyContent)
    : records.filter((record) => record.visibility !== "PRIVATE");
}
