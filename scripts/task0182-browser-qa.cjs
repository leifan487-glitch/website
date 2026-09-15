const { chromium } = require('playwright');
const { mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');
const out = path.resolve(__dirname, '../output/task0182');
const base = process.env.BASE_URL || 'http://127.0.0.1:4181';
(async () => {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const results = [];
  try {
    for (const width of [1728, 1440, 1280, 1024, 768, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [], missing = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if(m.type() === 'error') errors.push(m.text()); });
      page.on('response', r => { if(r.status() >= 400) missing.push([r.status(), r.url()]); });
      page.on('request', r => requests.push(r.url()));
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const initialMp4 = requests.filter(u => u.includes('.mp4'));
      await page.screenshot({ path: path.join(out, `hero-${width}.png`) });
      for (const id of ['mantis','official-film','forms','why-modular','real-world','technology','applications','news','home-contact']) {
        await page.locator('#' + id).scrollIntoViewIfNeeded();
        await page.waitForTimeout(160);
        if(id === 'real-world') {
          // Reduced-motion correctly uses preload=none. Explicitly play for the frame capture.
          await page.locator('#real-world video').evaluate(async v=>{v.muted=true;await v.play();});
          await page.waitForFunction(()=>document.querySelector('#real-world video')?.currentTime > 0.1);
          await page.locator('#real-world video').evaluate(v=>v.pause());
        }
        if ([1440,390].includes(width) && ['mantis','official-film','forms','real-world'].includes(id)) {
          const name = id === 'mantis' ? 'core-difference' : id;
          await page.locator('#' + id).screenshot({ path: path.join(out, `${name}-${width}.png`) });
        }
      }
      await page.waitForTimeout(400);
      const result = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i=>i.src),
        videoErrors: [...document.querySelectorAll('video')].filter(v=>v.error).map(v=>v.currentSrc),
        forbidden: document.querySelector('main').innerText.match(/效率工具|1400\s*mm|DIY王|王中王|DimOS|质保|旗舰|入门王/g) || [],
        price: document.querySelector('.product-hero__price').innerText,
        productCtas: [...document.querySelectorAll('main a[href="/products/mantis-standard"]')].filter(a=>!a.closest('.navbar')).length,
        partnersVisible: !!document.querySelector('.home-partners'),
        forms: document.querySelectorAll('.home-forms figure').length,
      }));
      await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0,0); });
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(out, `home-${width}.png`), fullPage: true });
      const filmRequestsBeforeClick = requests.filter(u=>u.includes('official-product-film.mp4')).length;
      await page.locator('.home-film__poster').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('.home-film video')?.currentTime > 0);
      const film = await page.locator('.home-film video').evaluate(v=>({ time:v.currentTime, duration:v.duration, muted:v.muted, controls:v.controls, inline:v.playsInline }));
      await page.locator('.home-film video').evaluate(v=>v.pause());
      results.push({width,initialMp4,filmRequestsBeforeClick,film,...result,errors,missing});
      await context.close();
    }
    // Exercise the retained motion and viewport playback path, then route cleanup.
    const context = await browser.newContext({viewport:{width:1440,height:900}, reducedMotion:'no-preference'});
    const page = await context.newPage();
    await page.goto(base, {waitUntil:'networkidle'});
    await page.locator('#real-world').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('#real-world video')?.currentTime > 0);
    const playing = await page.locator('#real-world video').evaluate(v=>!v.paused);
    await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(500);
    const offscreenPaused = await page.locator('#real-world video').evaluate(v=>v.paused);
    await page.locator('.product-hero__cta').click();
    const routeClean = await page.locator('.home-film, .real-world').count() === 0;
    await context.close();
    const failures = results.filter(r=>r.overflow || r.brokenImages.length || r.videoErrors.length || r.forbidden.length || r.errors.length || r.missing.length || r.initialMp4.length || r.filmRequestsBeforeClick || r.price !== '0.98 万起' || r.productCtas !== 1);
    await writeFile(path.join(out,'responsive-qa.json'),JSON.stringify({results,playing,offscreenPaused,routeClean,failures},null,2));
    console.log(JSON.stringify({checks:results.length,playing,offscreenPaused,routeClean,failures},null,2));
    if(failures.length || !playing || !offscreenPaused || !routeClean) process.exitCode=1;
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
