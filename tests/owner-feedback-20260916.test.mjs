import test from 'node:test';
import { reopenedFinalPolish } from './helpers/final-polish-scope.mjs';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ownerFeedback as scope } from './helpers/owner-feedback-scope.mjs';
import { standardPublicSpecs } from '../src/data/standard/specifications.js';
import { partners } from '../src/data/partners.js';
const bytes = file => readFile(new URL('../' + file, import.meta.url));
const text = async file => (await bytes(file)).toString();
const blob = b => createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
test('Owner feedback preserves all media, company facts, price, inquiry, backend and unrelated source', async () => {
  for (const [file, hash] of Object.entries(scope.files)) {
    if (scope.editable.includes(file) || reopenedFinalPolish.has(file)) continue;
    let b = await bytes(file);
    if (scope.phraseOnly.includes(file)) b = Buffer.from(b.toString().replaceAll('一脑多型', '一脑多形'));
    if (scope.dimensionsOnly.includes(file)) b = Buffer.from(b.toString().replaceAll('label: "尺寸"', 'label: "全尺寸"').replaceAll('633 x 552 x 1300', '633 × 552 × 1300'));
    assert.equal(blob(b), hash, file);
  }
});
test('All website source uses the corrected slogan and exact dimension value', async () => {
  async function walk(dir) {
    for (const entry of await readdir(new URL('../' + dir, import.meta.url), { withFileTypes: true })) {
      const file = dir + '/' + entry.name;
      if (entry.isDirectory()) await walk(file);
      else assert.ok(!(await text(file)).includes('一脑多' + '形'), file);
    }
  }
  await walk('src');
  const dimensions = standardPublicSpecs.find(s => s.id === 'public-dimensions');
  assert.equal(dimensions.label, '尺寸');
  assert.equal(dimensions.value + ' ' + dimensions.unit, '633 x 552 x 1300 mm');
});
test('Partners retain four official identities and show names alongside logos; core-tech CTA removed', async () => {
  const sections = await text('src/components/HomeSections.jsx');
  assert.equal(partners.length, 4);
  assert.match(sections, /home-partners__logo/);
  assert.match(sections, /home-partners__name">\{item.name\}/);
  const technology = sections.split('export function HomeApplications')[0];
  assert.doesNotMatch(technology, /查看技术体系|home-section-action/);
});
test('Anatomy links six real parts with numbered, keyboard-operable controls', async () => {
  const source = await text('src/components/StandardProductSections.jsx');
  for (const part of ['robot-body', 'dual-arms', 'mobile-base', 'lift', 'vision', 'quick-connect']) assert.ok(source.includes(part));
  assert.match(source, /aria-pressed=\{activePart === item.id\}/);
  assert.match(source, /sp-development-interface/);
  assert.match(source, /视觉头部/);
});
