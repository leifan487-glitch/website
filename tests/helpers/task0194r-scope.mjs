// Task 019.4R explicitly reopens seven existing view/data entry points.
// Historical snapshots remain intact; task0194r.test.mjs locks every other byte.
export const reopened0194r = new Set([
  'src/components/Navbar.jsx',
  'src/components/HomeProductStory.jsx',
  'src/components/HomeSections.jsx',
  'src/components/TechnologyExplorer.jsx',
  'src/pages/TechnologyPage.jsx',
  'src/data/alignment.js',
  'src/main.jsx',
]);
