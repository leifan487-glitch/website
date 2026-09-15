const { chromium } = require('playwright');
const { mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');
const out = path.resolve(__dirname, '../output/task0182r');
const base = process.env.BASE_URL || 'http://127.0.0.1:4181';
(async () => {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const results = [];
  try {
    for (const width of [1440, 390, 768, 1024]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [], missing = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('response', r => { if (r.status() >= 400) missing.push([r.status(), r.url()]); });
      page.on('request', r => requests.push(r.url()));
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const initialMp4 = requests.filter(u => u.includes('.mp4'));
      const initialFormPosters = requests.filter(u => u.includes('/mantis-standard/forms/'));
      const heroHierarchy = await page.evaluate(() => ['name','variant','price'].map(name => {
        const element = document.querySelector('.product-hero__' + name), style = getComputedStyle(element);
        return { name, text: element.innerText, size: style.fontSize, weight: style.fontWeight };
      }));
      if ([1440,390].includes(width)) await page.screenshot({ path: path.join(out, `hero-${width}-after-review.png`) });
      for (const id of ['mantis','official-film','forms','why-modular','real-world','technology','applications','news','home-contact']) {
        await page.locator('#' + id).scrollIntoViewIfNeeded();
        if (id === 'forms') {
          for (const figure of await page.locator('#forms figure').all()) {
            await figure.scrollIntoViewIfNeeded();
            await figure.locator('img').evaluate(img => img.decode());
          }
        }
        await page.waitForTimeout(160);
        if (id === 'real-world') {
          await page.locator('#real-world video').evaluate(async v => { v.muted=true; await v.play(); });
          await page.waitForFunction(() => document.querySelector('#real-world video')?.currentTime > 0.1);
          await page.locator('#real-world video').evaluate(v => v.pause());
        }
        // Tall section capture otherwise places the fixed navbar inside the stitched section.
        // Hide only global chrome during this capture; homepage screenshots remain unmodified.
        if ([1440,390].includes(width) && id === 'forms') await page.locator('#forms').screenshot({ path: path.join(out, `forms-${width}-six.png`), style: '.navbar, .skip-link { visibility: hidden !important; }' });
        if (width === 1440 && id === 'why-modular') await page.locator('#why-modular').screenshot({ path: path.join(out, 'why-modular-1440.png') });
      }
      const result = await page.evaluate(() => ({
        horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src),
        videoErrors: [...document.querySelectorAll('video')].filter(v => v.error).map(v => v.currentSrc),
        forms: document.querySelectorAll('.home-forms figure').length,
        formColumns: getComputedStyle(document.querySelector('.home-forms__gallery')).gridTemplateColumns,
        price: document.querySelector('.product-hero__price').innerText,
      }));
      await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0,0); });
      await page.waitForTimeout(100);
      if ([1440,390].includes(width)) await page.screenshot({ path: path.join(out, `home-${width}-final.png`), fullPage: true });
      const filmRequestsBeforeClick = requests.filter(u => u.includes('official-product-film.mp4')).length;
      await page.locator('.home-film__poster').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('.home-film video')?.currentTime > 0);
      const film = await page.locator('.home-film video').evaluate(v => ({time:v.currentTime, muted:v.muted, controls:v.controls}));
      results.push({ width, initialMp4, initialFormPosters, heroHierarchy, filmRequestsBeforeClick, film, ...result, errors, missing });
      await context.close();
    }
    const context = await browser.newContext({ viewport:{width:1440,height:900}, reducedMotion:'no-preference' });
    const page = await context.newPage();
    const motionInitialRequests = [];
    page.on('request', r => motionInitialRequests.push(r.url()));
    await page.goto(base, {waitUntil:'networkidle'});
    const motionInitialMp4 = motionInitialRequests.filter(u => u.includes('.mp4'));
    await page.locator('#real-world').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#real-world video')?.currentTime > 0);
    const playing = await page.locator('#real-world video').evaluate(v => !v.paused);
    await page.evaluate(() => scrollTo(0,0));
    await page.waitForTimeout(500);
    const offscreenPaused = await page.locator('#real-world video').evaluate(v => v.paused);
    await page.locator('.product-hero__cta').click();
    const routeClean = await page.locator('.home-film, .real-world').count() === 0;
    await context.close();
    const failures = results.filter(r => r.horizontalOverflow || r.brokenImages.length || r.videoErrors.length || r.errors.length || r.missing.length || r.initialMp4.length || r.filmRequestsBeforeClick || r.forms !== 6 || r.price !== '0.98 万起');
    await writeFile(path.join(out, 'responsive-qa.json'), JSON.stringify({results,motionInitialMp4,playing,offscreenPaused,routeClean,failures},null,2));
    console.log(JSON.stringify({checks:results.length,motionInitialMp4,playing,offscreenPaused,routeClean,failures},null,2));
    if (failures.length || motionInitialMp4.length || !playing || !offscreenPaused || !routeClean) process.exitCode=1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });
