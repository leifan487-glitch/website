const { chromium } = require('playwright');
const { mkdir, writeFile, readFile } = require('node:fs/promises');
const { createHash } = require('node:crypto');
const path = require('node:path');
const out = path.resolve(__dirname, '../output/task0183');
const base = process.env.BASE_URL || 'http://127.0.0.1:4181';
const sectionNames = { 'product-top':'hero', overview:'overview', modular:'modular', 'six-forms':'six-forms', 'why-modular':'why-modular', 'capability-system':'capabilities', 'real-tasks':'real-tasks', development:'development', specifications:'specs', questions:'qa', 'product-documents':'documents', 'product-inquiry':'contact' };
const chromeMask = '.navbar, .skip-link, .product-section-rail { visibility: hidden !important; }';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

(async () => {
  await mkdir(out, {recursive:true});
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const results = [], documents = [], motion = [];
  try {
    for (const width of [1728,1440,1280,1024,768,390]) {
      const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      const page = await context.newPage();
      const errors = [], missing = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
      page.on('request', r => requests.push(r.url()));
      page.on('response', r => { if(r.status()>=400) missing.push([r.status(),r.url()]); });
      await page.goto(base + '/products/mantis-standard',{waitUntil:'networkidle'});
      await page.evaluate(() => document.fonts.ready);
      const initialMp4 = requests.filter(u=>/\.mp4(?:\?|$)/.test(u));
      const initialPdf = requests.filter(u=>/\.pdf(?:\?|$)/.test(u));
      await page.locator('.standard-product-hero__visual img').evaluate(img=>img.decode());
      if ([1440,390].includes(width)) await page.screenshot({path:path.join(out,'standard-hero-'+width+'.png')});
      for (const [id,name] of Object.entries(sectionNames)) {
        if(id==='product-top') continue;
        const section = page.locator('#'+id);
        await section.scrollIntoViewIfNeeded();
        for(const img of await section.locator('img').all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(i=>i.decode());
        }
        await page.waitForTimeout(80);
        if(width===1440 || (width===390 && ['six-forms','specs','qa','documents'].includes(name))) {
          await section.screenshot({path:path.join(out,'standard-'+name+'-'+width+'.png'),style:chromeMask});
        }
      }
      const scrollOnlyMp4 = requests.filter(u=>u.includes('.mp4'));
      const scrollOnlyPdf = requests.filter(u=>u.includes('.pdf'));
      const data = await page.evaluate(() => ({
        horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
        overflowingElements:[...document.querySelectorAll('main *')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0 && b.right>innerWidth+1 && getComputedStyle(e).position!=='fixed';}).slice(0,10).map(e=>e.className),
        brokenImages:[...document.querySelectorAll('main img')].filter(i=>(i.complete || i.getClientRects().length>0) && !i.naturalWidth).map(i=>i.src),
        videoErrors:[...document.querySelectorAll('main video')].filter(v=>v.error).map(v=>v.src),
        forbidden:document.querySelector('main').textContent.match(/\b(?:SOURCE|PRIVATE|INTERNAL|TODO)\b|待确认|HIGH RISK|青春|入门|进阶|豪华|旗舰|DIY王|导览王|科研王|王中王|质保期限|专项服务|1400\s*mm/g)||[],
        forms:document.querySelectorAll('.sp-forms__grid figure').length,
        formColumns:getComputedStyle(document.querySelector('.sp-forms__grid')).gridTemplateColumns,
        specs:[...document.querySelectorAll('.sp-specs dl > div')].map(e=>e.innerText),
        questions:document.querySelectorAll('.sp-question').length,
        initiallyExpanded:document.querySelectorAll('.sp-question [aria-expanded="true"]').length,
        documents:document.querySelectorAll('.sp-documents li').length,
        inquiryCtas:document.querySelectorAll('main .sp-contact a[href="/inquiry"]').length,
        price:document.querySelector('.standard-product-hero__price').innerText,
      }));
      await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});
      if([1440,390].includes(width)) await page.screenshot({path:path.join(out,'standard-'+width+'-full.png'),fullPage:true});

      // Each question remains readable by default; full content is keyboard reachable.
      const questionChecks = [];
      for(const question of await page.locator('.sp-question').all()) {
        const button = question.locator('button');
        await button.focus();
        await page.keyboard.press('Enter');
        const panel = question.locator('[role="region"]');
        const state = await panel.evaluate(e=>({visible:!e.hidden,paragraphs:e.querySelectorAll('p').length,clipped:e.scrollHeight>e.clientHeight+1,width:e.getBoundingClientRect().width}));
        questionChecks.push(state);
      }
      if([1440,390].includes(width)) await page.locator('#questions').screenshot({path:path.join(out,'standard-qa-'+width+'-expanded.png'),style:chromeMask});
      for(const button of await page.locator('.sp-question button').all()) {await button.focus();await page.keyboard.press('Space');}
      const questionsClosed = await page.locator('.sp-question [aria-expanded="true"]').count()===0;

      const videos = [];
      for(const figure of await page.locator('.sp-real-tasks__grid figure').all()) {
        await figure.locator('button').focus();
        await page.keyboard.press('Enter');
        const video = figure.locator('video');
        await video.evaluate(v=>v.play());
        await video.evaluate(v=>new Promise((resolve,reject)=>{
          if(v.currentTime>0) return resolve();
          const done=()=>{if(v.currentTime>0){v.removeEventListener('timeupdate',done);resolve();}};
          v.addEventListener('timeupdate',done);v.addEventListener('error',()=>reject(new Error('video playback failed')),{once:true});
        }));
        videos.push(await video.evaluate(v=>({src:v.currentSrc,time:v.currentTime,error:v.error?.code||0,controls:v.controls,inline:v.playsInline})));
        await video.evaluate(v=>v.pause());
      }
      if(width===1440) {
        for(const link of await page.locator('.sp-documents a[download]').all()) {
          const href=await link.getAttribute('href');
          const response=await context.request.get(base+href);
          const body=await response.body();
          documents.push({href,status:response.status(),type:response.headers()['content-type'],bytes:body.length,hashMatches:hash(body)===hash(await readFile(path.resolve(__dirname,'../public'+href)))});
        }
      }
      results.push({width,initialMp4,initialPdf,scrollOnlyMp4,scrollOnlyPdf,...data,questionChecks,questionsClosed,videos,errors,missing});
      await context.close();
    }
    for(const width of [1440,390]) {
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'});
      const page=await context.newPage(), requests=[], errors=[];
      page.on('request',r=>requests.push(r.url()));
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+'/products/mantis-standard',{waitUntil:'networkidle'});
      await page.waitForTimeout(1500);
      const initialMp4=requests.filter(u=>u.includes('.mp4')), initialPdf=requests.filter(u=>u.includes('.pdf'));
      for(const id of Object.keys(sectionNames)) {await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(140);}
      await page.waitForTimeout(900);
      const hiddenHeadings=await page.locator('main h1,main h2').evaluateAll(items=>items.filter(e=>getComputedStyle(e).visibility==='hidden'||Number(getComputedStyle(e).opacity)===0).map(e=>e.textContent));
      await page.locator('.sp-contact a[href="/inquiry"]').click();
      const routeClean=await page.locator('.standard-page-v2').count()===0;
      motion.push({width,initialMp4,initialPdf,hiddenHeadings,routeClean,errors});
      await context.close();
    }
    const failures=results.filter(r=>r.horizontalOverflow||r.brokenImages.length||r.videoErrors.length||r.forbidden.length||r.errors.length||r.missing.length||r.initialMp4.length||r.initialPdf.length||r.scrollOnlyMp4.length||r.scrollOnlyPdf.length||r.forms!==6||r.questions!==6||r.initiallyExpanded||r.documents!==4||r.inquiryCtas!==1||r.price!=='0.98 万起'||!r.questionsClosed||r.questionChecks.some(q=>!q.visible||q.clipped||q.paragraphs<3)||r.videos.some(v=>v.error||!v.controls||!v.inline||v.time<=0));
    const passed=!failures.length&&documents.every(d=>d.status===200&&d.hashMatches)&&motion.every(m=>!m.initialMp4.length&&!m.initialPdf.length&&!m.hiddenHeadings.length&&m.routeClean&&!m.errors.length);
    await writeFile(path.join(out,'browser-qa.json'),JSON.stringify({results,documents,motion,failures,passed},null,2));
    console.log(JSON.stringify({viewports:results.length,documents,motion,failures,passed},null,2));
    if(!passed) process.exitCode=1;
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
