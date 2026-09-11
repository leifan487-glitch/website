import { standardPublicMode } from "./visibility.js";

export const standardTaskMediaFields = [
  "id",
  "sourceId",
  "titleZh",
  "titleEn",
  "taskGroup",
  "identity",
  "batchPublicPermission",
  "mediaApproved",
  "privacyRisk",
  "audioRemoved",
  "poster",
  "video",
  "duration",
  "usage",
  "usages",
  "publicApproved",
  "derivedCompilation",
  "sourceMediaIds",
  "derivedFrom",
  "clipRanges",
  "generatedAt",
  "derivativeType",
  "notes",
];

export const standardTaskMedia = [
  {
    id: "standard-video-sv001", sourceId: "SV001",
    titleZh: "产品展示", titleEn: "Product overview",
    descriptionZh: "镜头记录 Mantis Standard 的整机外观与结构。", descriptionEn: "A visual record of the Mantis Standard product form and structure.",
    category: "PRODUCT", taskGroup: "TG01", identity: "STANDARD_CONFIRMED", productIdentity: "STANDARD",
    contentStatus: "VERIFIED", visibility: "PUBLIC", batchPublicPermission: true, mediaApproved: true, privacyRisk: "LOW", audioRemoved: true,
    poster: "/assets/videos/standard/sv001/poster.webp", video: "/assets/videos/standard/sv001/video.mp4",
    duration: 10.18, durationLabel: "00:10", width: 1920, height: 1080, usages: ["videoCenter"], publicApproved: true,
    notes: "Task 014.2B web derivative; original audio removed.",
  },
  {
    id: "standard-video-sv003", sourceId: "SV003",
    titleZh: "桌面取放", titleEn: "Tabletop pick and place",
    descriptionZh: "桌面场景中的物体取放过程。", descriptionEn: "A tabletop object pick-and-place sequence.",
    category: "MANIPULATION", taskGroup: "TG02", identity: "STANDARD_LIKELY", productIdentity: "STANDARD",
    contentStatus: "VERIFIED", visibility: "PUBLIC", batchPublicPermission: true, mediaApproved: true, privacyRisk: "LOW", audioRemoved: true,
    poster: "/assets/videos/standard/sv003/poster.webp", video: "/assets/videos/standard/sv003/video.mp4",
    duration: 16, durationLabel: "00:16", width: 1920, height: 1080, usages: ["videoCenter"], publicApproved: true,
    notes: "Locked Video Center supplement; identity retained as STANDARD_LIKELY for traceability.",
  },
  {
    id: "standard-video-sv007", sourceId: "SV007",
    titleZh: "产品体系", titleEn: "Product family overview",
    descriptionZh: "镜头记录 Mantis Standard 多种产品形态的整体外观。", descriptionEn: "A visual overview of multiple Mantis Standard product forms.",
    category: "PRODUCT", taskGroup: "TG04", identity: "STANDARD_CONFIRMED", productIdentity: "STANDARD",
    contentStatus: "VERIFIED", visibility: "PUBLIC", batchPublicPermission: true, mediaApproved: true, privacyRisk: "LOW", audioRemoved: true,
    poster: "/assets/videos/standard/sv007/poster.webp", video: "/assets/videos/standard/sv007/video.mp4",
    duration: 10.37, durationLabel: "00:10", width: 1920, height: 1080, usages: ["videoCenter"], publicApproved: true,
    notes: "Task 014.2B web derivative; original audio removed.",
  },
  {
    id: "standard-video-sv010", sourceId: "SV010",
    titleZh: "双臂操作", titleEn: "Dual-arm operation",
    descriptionZh: "双臂配合完成操作过程的连续记录。", descriptionEn: "A continuous record of a coordinated dual-arm operation.",
    category: "MANIPULATION", taskGroup: "TG06", identity: "STANDARD_CONFIRMED", productIdentity: "STANDARD",
    contentStatus: "VERIFIED", visibility: "PUBLIC", batchPublicPermission: true, mediaApproved: true, privacyRisk: "MEDIUM", audioRemoved: true,
    poster: "/assets/videos/standard/sv010/poster.webp", video: "/assets/videos/standard/sv010/video.mp4",
    duration: 7.49, durationLabel: "00:07", width: 1920, height: 1080, usages: ["productRealTasks", "videoCenter"], publicApproved: true,
    notes: "Final segment audited at full resolution; cropped to remove readable device/board markings.",
  },
  {
    id: "standard-video-sv018", sourceId: "SV018",
    titleZh: "物体抓取", titleEn: "Object manipulation",
    descriptionZh: "抓取并移动物体的连续记录。", descriptionEn: "A continuous record of grasping and moving an object.",
    category: "MANIPULATION", taskGroup: "TG09", identity: "STANDARD_CONFIRMED", productIdentity: "STANDARD",
    contentStatus: "VERIFIED", visibility: "PUBLIC", batchPublicPermission: true, mediaApproved: true, privacyRisk: "LOW", audioRemoved: true,
    poster: "/assets/videos/standard/sv018/poster.webp", video: "/assets/videos/standard/sv018/video.mp4",
    duration: 16, durationLabel: "00:16", width: 1920, height: 1080, usages: ["productRealTasks", "videoCenter"], publicApproved: true,
    notes: "Task 014.2B web derivative; selected source segment 00:06–00:22.",
  },
  {
    id: "standard-video-sv035", sourceId: "SV035",
    titleZh: "织物处理", titleEn: "Textile handling",
    descriptionZh: "抓取、移动与放置织物的连续记录。", descriptionEn: "A continuous record of grasping, moving, and placing a textile item.",
    category: "SERVICE", taskGroup: "TG16", identity: "STANDARD_CONFIRMED", productIdentity: "STANDARD",
    contentStatus: "VERIFIED", visibility: "PUBLIC", batchPublicPermission: true, mediaApproved: true, privacyRisk: "LOW", audioRemoved: true,
    poster: "/assets/videos/standard/sv035/poster.webp", video: "/assets/videos/standard/sv035/video.mp4",
    duration: 19.54, durationLabel: "00:20", width: 1920, height: 1080,
    usages: ["productRealTasks", "applications", "videoCenter"], publicApproved: true,
    notes: "Task 014.2B web derivative; retained for Product Real Tasks, Applications, and Video Center.",
  },
  {
    id: "standard-video-sv037", sourceId: "SV037",
    titleZh: "家居设备操作", titleEn: "Home appliance interaction",
    descriptionZh: "家居场景中与设备交互的连续记录。", descriptionEn: "A continuous record of interacting with equipment in a home setting.",
    category: "SERVICE", taskGroup: "TG17", identity: "STANDARD_CONFIRMED", productIdentity: "STANDARD",
    contentStatus: "VERIFIED", visibility: "PUBLIC", batchPublicPermission: true, mediaApproved: true, privacyRisk: "MEDIUM", audioRemoved: true,
    poster: "/assets/videos/standard/sv037/poster.webp", video: "/assets/videos/standard/sv037/video.mp4",
    duration: 24, durationLabel: "00:24", width: 1920, height: 1080, usages: ["applications", "videoCenter"], publicApproved: true,
    notes: "Task 014.3 unmasked public derivative; source segment 00:34–00:58, natural scene retained, original audio removed.",
  },
  {
    id: "standard-video-sv054", sourceId: "SV054",
    titleZh: "工业设备操作", titleEn: "Industrial equipment operation",
    descriptionZh: "工业设备场景中的操作过程记录。", descriptionEn: "A record of an operation sequence in an industrial equipment setting.",
    category: "INDUSTRIAL", taskGroup: "TG25", identity: "STANDARD_CONFIRMED", productIdentity: "STANDARD",
    contentStatus: "VERIFIED", visibility: "PUBLIC", batchPublicPermission: true, mediaApproved: true, privacyRisk: "MEDIUM", audioRemoved: true,
    poster: "/assets/videos/standard/sv054/poster.webp", video: "/assets/videos/standard/sv054/video.mp4",
    duration: 24, durationLabel: "00:24", width: 1920, height: 1080, usages: ["productRealTasks", "applications", "videoCenter"], publicApproved: true,
    notes: "Final 00:03–00:27 segment audited at full resolution; background sign remains unreadable without additional masking.",
  },
];

export const standardDerivedMedia = [
  {
    id: "standard-home-real-world-reel",
    sourceId: "HOME-REAL-WORLD-REEL",
    titleZh: "多任务现场实录",
    titleEn: "Multi-task field reel",
    descriptionZh: "从双臂操作、物体抓取、工业设备操作到产品体系。",
    descriptionEn: "A concise reel spanning dual-arm operation, object manipulation, industrial equipment interaction, and product form.",
    category: "MULTI-TASK",
    taskGroup: "HOMEPAGE_REEL",
    identity: "STANDARD_CONFIRMED",
    productIdentity: "STANDARD",
    contentStatus: "VERIFIED",
    visibility: "PUBLIC",
    batchPublicPermission: true,
    mediaApproved: true,
    privacyRisk: "MEDIUM",
    audioRemoved: true,
    poster: "/assets/videos/standard/home-real-world/poster.webp",
    video: "/assets/videos/standard/home-real-world/video.mp4",
    duration: 14,
    durationLabel: "00:14",
    width: 1920,
    height: 1080,
    usage: "homeRealWorld",
    usages: ["homeRealWorld"],
    publicApproved: true,
    derivedCompilation: true,
    sourceMediaIds: ["SV010", "SV018", "SV054", "SV007"],
    derivedFrom: "Task 014.2B approved public derivatives",
    clipRanges: [
      { sourceMediaId: "SV010", start: 2.5, end: 5.5, duration: 3 },
      { sourceMediaId: "SV018", start: 6, end: 10, duration: 4 },
      { sourceMediaId: "SV054", start: 8, end: 12, duration: 4 },
      { sourceMediaId: "SV007", start: 2, end: 5, duration: 3 },
    ],
    generatedAt: "2026-09-05",
    derivativeType: "HOMEPAGE_REEL",
    notes: "Task 015.1 action-first clean-cut homepage compilation; no speed changes, overlays, audio, or runtime source rotation. Poster uses reel 00:01.00 (SV010 source 00:03.50).",
  },
  {
    id: "standard-applications-multi-task-reel",
    sourceId: "APPLICATIONS-MULTI-TASK-REEL",
    titleZh: "多任务现场",
    titleEn: "Multi-task applications",
    descriptionZh: "整机动作、桌面取放、纸袋操作与末端工具任务的连续实录。",
    descriptionEn: "A concise field reel spanning full-body motion, tabletop pick and place, bag handling, and an end-effector tool task.",
    category: "MULTI-TASK",
    taskGroup: "APPLICATIONS_REEL",
    identity: "STANDARD_CONFIRMED",
    productIdentity: "STANDARD",
    contentStatus: "VERIFIED",
    visibility: "PUBLIC",
    batchPublicPermission: true,
    mediaApproved: true,
    privacyRisk: "LOW",
    audioRemoved: true,
    poster: "/assets/videos/standard/applications-hero/poster.webp",
    video: "/assets/videos/standard/applications-hero/video.mp4",
    duration: 14,
    durationLabel: "00:14",
    width: 1920,
    height: 1080,
    usage: "applicationsHero",
    usages: ["applicationsHero"],
    publicApproved: true,
    derivedCompilation: true,
    sourceMediaIds: ["SV028", "SV004", "SV016", "SV043"],
    derivedFrom: "Four owner-supplied Standard source masters not otherwise published on the website",
    clipRanges: [
      { sourceMediaId: "SV028", start: 0.4, end: 3.6, duration: 3.2 },
      { sourceMediaId: "SV004", start: 2.2, end: 5.6, duration: 3.4 },
      { sourceMediaId: "SV016", start: 4.2, end: 8.4, duration: 4.2 },
      { sourceMediaId: "SV043", start: 3, end: 6.2, duration: 3.2 },
    ],
    generatedAt: "2026-09-11",
    derivativeType: "APPLICATIONS_REEL",
    notes: "Task 020 action-led Applications compilation; four website-exclusive source files, clean cuts, no speed changes, overlays, audio, or runtime source rotation.",
  },
];

export const standardMedia = [...standardTaskMedia, ...standardDerivedMedia];

export function isPublicStandardMedia(record) {
  return Boolean(
    record
    && record.productIdentity === "STANDARD"
    && record.identity !== "UNCERTAIN"
    && record.contentStatus === "VERIFIED"
    && record.batchPublicPermission === true
    && record.publicApproved === true
    && record.mediaApproved === true
    && record.audioRemoved === true
    && record.visibility === "PUBLIC"
    && record.poster
    && record.video,
  );
}

export const hasPublicStandardTaskMedia = standardMedia.some((record) => (
  isPublicStandardMedia(record)
  && record.usages?.includes("homeRealWorld")
));

export function getStandardMediaByUsage(usage, { publicMode = standardPublicMode } = {}) {
  return standardMedia.filter((record) => (
    record.usages?.includes(usage)
    && (publicMode ? isPublicStandardMedia(record) : true)
  ));
}
