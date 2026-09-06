export {
  getVisibleSupportModules,
  isSupportModuleVisible,
  publicPreviewEnabled,
  supportModules,
} from "./supportModules.js";

import { supportModules } from "./supportModules.js";

export const supportDestinations = Object.values(supportModules);
