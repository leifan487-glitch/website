export const videoResourceFields = [
  "id",
  "assetId",
  "title",
  "product",
  "category",
  "taskType",
  "poster",
  "videoSrc",
  "duration",
  "date",
  "description",
  "contentStatus",
  "visibility",
  "publicApproved",
];

import { isPublicStandardMedia, standardTaskMedia } from "../standard/media.js";

export const videoResources = standardTaskMedia
  .filter((record) => record.usages?.includes("videoCenter") && isPublicStandardMedia(record))
  .map((record) => ({
    id: record.id,
    assetId: record.sourceId,
    title: record.titleZh,
    titleEn: record.titleEn,
    product: "Mantis Standard",
    category: record.category,
    taskType: record.taskGroup,
    poster: record.poster,
    videoSrc: record.video,
    duration: record.duration,
    durationLabel: record.durationLabel,
    date: "",
    description: record.descriptionZh,
    contentStatus: record.contentStatus,
    visibility: record.visibility,
    publicApproved: record.publicApproved,
  }));
