import { readFileSync } from 'node:fs';
// Historical snapshots are retained. Only the explicitly authorized 018.8B view/route files reopen.
// 018.8B-F opens partner data / source-URL filtering, scoped CSS and the Home rendering slot.
export const reopened0188bf = new Set(['src/data/home.js', 'src/home.css', 'src/pages/HomePage.jsx']);
// Owner's final homepage card reopens only headings/forms and contact IA (not email logic).
export const reopenedHomeFinal = new Set(['src/pages/HomePage.jsx', 'src/components/HomeProductStory.jsx', 'src/components/HomeSections.jsx', 'src/components/Navbar.jsx', 'src/App.jsx', 'src/data/siteMetadata.js', 'worker/index.js']);
export const reopened0188b = new Set([...JSON.parse(readFileSync(new URL('../../internal/task0188b-locked-files.json', import.meta.url))).reopened, ...reopened0188bf, ...reopenedHomeFinal]);
