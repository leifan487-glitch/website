// Stable editorial anchors; media identity and source records remain unchanged.
const taskAnchors = { SV035: "task-textile-handling", SV037: "task-home-service", SV054: "task-industrial-operation" };

export function getApplicationTaskAnchor(media) {
  return taskAnchors[media.sourceId];
}
