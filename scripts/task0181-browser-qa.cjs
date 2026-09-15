const { chromium } = require('playwright');
const { mkdir, writeFile, readFile } = require('node:fs/promises');
const { createHash } = require('node:crypto');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'output', 'task0181');
const base = process.env.BASE_URL || 'http://127.0.0.1:4181';
const routes = ['/support', '/support/documents', '/support/downloads', '/inquiry', '/technology', '/applications', '/support/service', '/support/contact'];
const widths = [1440, 1024, 768, 390];
const sha = (data) => createHash('sha256').update(data).digest('hex');

(async () => {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const results = [];
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', acceptDownloads: true });
      const page = await context.newPage();
      for (const route of routes) {
        const errors = [], missing = [];
        const onConsole = (msg) => { if (msg.type() === 'error') errors.push(msg.text()); };
        const onError = (err) => errors.push(err.message);
        const onResponse = (response) => { if (response.status() >= 400) missing.push([response.status(), response.url()]); };
        page.on('console', onConsole); page.on('pageerror', onError); page.on('response', onResponse);
        const response = await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 650) {
            scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 30));
          }
          scrollTo(0, 0);
        });
        await page.waitForTimeout(200);
        const result = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          forbidden: document.body.innerText.match(/\b(?:TODO|SOURCE|PRIVATE|INTERNAL)\b|待补充|等待资料|正式资料待提供|[A-Z]:\\|file:\/\/|经验素材取地|效率工具|Efficiency Tools/gi) || [],
          brokenImages: [...document.images].filter((img) => (img.complete && img.naturalWidth === 0) || (img.checkVisibility() && !img.complete)).map((img) => img.src),
          brokenVideos: [...document.querySelectorAll('video')].filter((video) => video.error).map((video) => video.currentSrc),
          truncatedTitles: [...document.querySelectorAll('.document-card h3')].filter((el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1).length,
          title: document.title,
        }));
        if (route.includes('/documents') || route.includes('/downloads')) {
          assert.equal(await page.locator('.document-card').count(), 4);
          assert.deepEqual(await page.locator('.document-categories button span:last-child').allTextContents(), ['4', '4']);
          await page.getByRole('searchbox').fill('开发');
          assert.equal(await page.locator('.document-card').count(), 1);
          await page.getByRole('searchbox').fill('无匹配测试');
          assert.equal(await page.locator('.document-card').count(), 0);
          assert.ok(await page.getByText('没有找到相关文档').isVisible());
          await page.getByRole('searchbox').fill('');
          await page.locator('.document-categories button').nth(1).click();
          assert.equal(await page.locator('.document-card').count(), 4);
          for (const anchor of await page.locator('.document-card__actions a[download]').all()) {
            const href = await anchor.getAttribute('href');
            const file = await context.request.get(base + href);
            assert.equal(file.status(), 200);
            assert.match(file.headers()['content-type'], /application\/pdf/);
            assert.equal(sha(await file.body()), sha(await readFile(path.join(root, 'public', href))));
            if (width === 390) {
              const [download] = await Promise.all([page.waitForEvent('download'), anchor.click()]);
              assert.equal(await download.failure(), null);
            }
          }
          for (const anchor of await page.locator('.document-card__actions a[target="_blank"]').all()) {
            assert.equal(await anchor.getAttribute('rel'), 'noopener noreferrer');
          }
        }
        if (route === '/technology' || route === '/applications') {
          assert.equal(await page.locator('main a[href="/inquiry"]:not(.navbar a)').count(), 0);
        }
        for (const src of await page.locator('img').evaluateAll((images) => [...new Set(images.map((img) => img.src))])) {
          assert.equal((await context.request.head(src)).status(), 200, src);
        }
        await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(out, `${route.slice(1).replaceAll('/', '-')}-${width}.png`), fullPage: true });
        results.push({ route, width, status: response.status(), errors, missing, ...result });
        page.off('console', onConsole); page.off('pageerror', onError); page.off('response', onResponse);
      }
      await page.goto(base + '/support/documents', { waitUntil: 'networkidle' });
      const menu = page.locator('.navbar__menu-button');
      if (await menu.isVisible()) await menu.click();
      const support = page.locator('.navbar__support-trigger');
      await support.click();
      assert.deepEqual(await page.locator('#support-navigation a span:first-child').allTextContents(), ['文档中心', '下载中心', '售后与服务', '联系支持']);
      await page.screenshot({ path: path.join(out, `support-menu-${width}.png`), fullPage: false });
      await page.keyboard.press('Escape');
      assert.equal(await support.getAttribute('aria-expanded'), 'false');
      await context.close();
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(base + '/support', { waitUntil: 'networkidle' });
    const media = await page.evaluate(async () => {
      const v = document.createElement('video'); v.muted = true; v.controls = true;
      v.src = '/media/mantis-standard/official-product-film.mp4'; document.body.append(v);
      await new Promise((resolve, reject) => { v.onloadeddata = resolve; v.onerror = () => reject(new Error('film decode failed')); });
      await v.play();
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = { width: v.videoWidth, height: v.videoHeight, duration: v.duration, currentTime: v.currentTime, readyState: v.readyState };
      v.pause(); v.remove(); return result;
    });
    assert.ok(media.currentTime > 0);
    await context.close();
    const failures = results.filter((r) => r.status !== 200 || r.overflow || r.forbidden.length || r.brokenImages.length || r.brokenVideos.length || r.truncatedTitles || r.errors.length || r.missing.length);
    await writeFile(path.join(out, 'responsive-qa.json'), JSON.stringify({ results, media, failures }, null, 2));
    console.log(JSON.stringify({ checks: results.length, media, failures }, null, 2));
    assert.equal(failures.length, 0);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
