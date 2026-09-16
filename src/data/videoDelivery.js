// Delivery-only variants of the existing approved edits; no new scenes or audio.
// Source selection is held for each mounted player, so resizing cannot restart playback.
export const videoDelivery = {
  "/assets/videos/standard/applications-montage-v2/video.mp4": {
    "desktop": "/media/web-v2/applications-montage-v2-1080.mp4",
    "mobile": "/media/web-v2/applications-montage-v2-720.mp4"
  },
  "/assets/videos/standard/home-real-world/video.mp4": {
    "desktop": "/media/web-v2/home-real-world-1080.mp4",
    "mobile": "/media/web-v2/home-real-world-720.mp4"
  },
  "/assets/videos/standard/sv001/video.mp4": {
    "desktop": "/assets/videos/standard/sv001/video.mp4",
    "mobile": "/media/web-v2/sv001-720.mp4"
  },
  "/assets/videos/standard/sv003/video.mp4": {
    "desktop": "/assets/videos/standard/sv003/video.mp4",
    "mobile": "/media/web-v2/sv003-720.mp4"
  },
  "/assets/videos/standard/sv007/video.mp4": {
    "desktop": "/assets/videos/standard/sv007/video.mp4",
    "mobile": "/media/web-v2/sv007-720.mp4"
  },
  "/assets/videos/standard/sv010/video.mp4": {
    "desktop": "/assets/videos/standard/sv010/video.mp4",
    "mobile": "/media/web-v2/sv010-720.mp4"
  },
  "/assets/videos/standard/sv018/video.mp4": {
    "desktop": "/assets/videos/standard/sv018/video.mp4",
    "mobile": "/media/web-v2/sv018-720.mp4"
  },
  "/assets/videos/standard/sv035/video.mp4": {
    "desktop": "/assets/videos/standard/sv035/video.mp4",
    "mobile": "/media/web-v2/sv035-720.mp4"
  },
  "/assets/videos/standard/sv037/video.mp4": {
    "desktop": "/media/web-v2/sv037-1080.mp4",
    "mobile": "/media/web-v2/sv037-720.mp4"
  },
  "/assets/videos/standard/sv054/video.mp4": {
    "desktop": "/media/web-v2/sv054-1080.mp4",
    "mobile": "/media/web-v2/sv054-720.mp4"
  },
  "/media/mantis-standard/official-product-film.mp4": {
    "desktop": "/media/mantis-standard/official-product-film.mp4",
    "mobile": "/media/web-v2/official-product-film-720.mp4"
  }
};

export function selectVideoDelivery(source, options = {}) {
  const compact = options.compact ?? (typeof window !== "undefined" && (window.matchMedia("(max-width: 900px)").matches || Boolean(navigator.connection?.saveData)));
  const variants = videoDelivery[source];
  return variants ? (compact ? variants.mobile : variants.desktop) : source;
}
