export const downloadResourceFields = [
  "id",
  "title",
  "product",
  "category",
  "platform",
  "version",
  "fileUrl",
  "fileSize",
  "updatedAt",
  "contentStatus",
  "visibility",
  "publicApproved",
];

// Viewing and downloading use the same approved files and metadata.
export { documentResources as downloadResources } from "./documents.js";
