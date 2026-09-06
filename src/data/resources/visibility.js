export const CONTENT_STATUSES = ["VERIFIED", "SOURCE", "TODO", "PRIVATE"];

export function isPublicResource(resource) {
  if (!resource || resource.publicApproved !== true) return false;
  if (resource.contentStatus !== "VERIFIED") return false;
  if (resource.visibility === "PRIVATE") return false;
  return Boolean(resource.fileUrl || resource.videoSrc || resource.href);
}

