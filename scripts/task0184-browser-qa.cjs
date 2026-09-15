const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const {createHash}=require('node:crypto');
const out=path.resolve(__dirname,'../output/task0184');
const base=process.env.BASE_URL||'http://127.0.0.1:4181';
const routes=['technology','applications','about','inquiry','support','support/documents','support/downloads','support/service','support/contact'];
const widths=[1728,1440,1280,1024,768,390];
const hash=b=>createHash('sha256').update(b).digest('hex');
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const results=[],documents=[],motion=[],navigation=[];
 try {
  for(const width of widths) for(const route of routes){
   const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await ctx.newPage();
   const errors=[],missing=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   page.on('response',r=>{if(r.status()>=400)missing.push([r.status(),r.url()]);});page.on('request',r=>requests.push(r.url()));
   await page.goto(base+'/'+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   const initialMp4=requests.filter(u=>u.includes('.mp4')),initialPdf=requests.filter(u=>u.includes('.pdf'));
   if(route==='inquiry'&&[1440,390].includes(width))await page.screenshot({path:path.join(out,'inquiry-'+width+'-first-screen.png')});
   for(const img of await page.locator('img').all()) if(await img.isVisible()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
   const data=await page.evaluate(()=>({
    overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
    brokenImages:[...document.querySelectorAll('img')].filter(i=>i.getClientRects().length&&!i.naturalWidth).map(i=>i.src),
    videoErrors:[...document.querySelectorAll('video')].filter(v=>v.error).map(v=>v.error.code),
    forbidden:document.querySelector('main').innerText.match(/\b(?:TODO|SOURCE|PRIVATE|INTERNAL|NEEDS CONFIRMATION|Pro|Ultra|FF8D|FF16)\b|青春|豪华|旗舰|入门王|DIY王|导览王|科研王|王中王|质保期限|专项服务/g)||[],
    title:document.title,h1:document.querySelector('h1')?.innerText,
    platforms:[...document.querySelectorAll('.aligned-platform h2')].map(e=>e.innerText),
    scenarios:[...document.querySelectorAll('.aligned-scenarios h3')].map(e=>e.innerText),
    bodyInquiry:document.querySelectorAll('main section a[href="/inquiry"]:not(.navbar a)').length,
    docCount:document.querySelectorAll('.document-card').length,
    docButtonMin:Math.min(...[...document.querySelectorAll('.document-card__actions a')].map(e=>e.getBoundingClientRect().height)),
    form:document.querySelector('.inquiry-form')?{majorFields:[...document.querySelectorAll('.inquiry-form__grid input,.inquiry-form__grid select')].map(e=>({name:e.name,bottom:e.getBoundingClientRect().bottom+scrollY})),readonly:document.querySelector('[name="product"]').readOnly,disabled:document.querySelector('.inquiry-form button[type="submit"]').disabled,notice:document.querySelector('.inquiry-availability')?.innerText,columns:getComputedStyle(document.querySelector('.inquiry-form__grid')).gridTemplateColumns}:null,
   }));
   await page.evaluate(()=>scrollTo(0,0));
   const capture=([1440,390].includes(width)&&['technology','applications','about','inquiry','support/documents'].includes(route))||(width===1440&&route==='support');
   if(capture)await page.screenshot({path:path.join(out,(route==='support/documents'?'documents':route)+'-'+width+'.png'),fullPage:true});
   let searchChecks=null;
   if(route==='support/documents'||route==='support/downloads'){
    const search=page.locator('#document-search-input');await search.fill('开发手册');const matched=await page.locator('.document-card').count();await search.fill('不存在的文档xyz');const empty=await page.locator('.document-results__empty').count();await search.fill('');searchChecks={matched,empty,restored:await page.locator('.document-card').count()};
    if(width===1440&&route==='support/documents')for(const a of await page.locator('.document-card__actions a[download]').all()){
     const href=await a.getAttribute('href'),response=await ctx.request.get(base+href),body=await response.body();documents.push({href,status:response.status(),bytes:body.length,hashMatches:hash(body)===hash(await fs.readFile(path.resolve(__dirname,'../public'+href)))});
    }
   }
   let formRequests=[];
   if(route==='inquiry'){
    await page.locator('#inquiry-name').fill('本地测试');await page.locator('#inquiry-company').fill('测试机构');await page.locator('#inquiry-name').press('Enter');
    formRequests=requests.filter(u=>u.includes('/api/inquiry'));
   }
   const row={width,route,...data,initialMp4,initialPdf,scrollMp4:requests.filter(u=>u.includes('.mp4')),errors,missing,searchChecks,formRequests};results.push(row);
   console.log(width+' /'+route+' checked');await ctx.close();
  }
  for(const width of [1440,390]){
   const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'}),page=await ctx.newPage();
   for(const route of ['technology','applications','about']){
    const req=[],errors=[];const listener=r=>req.push(r.url());const onError=e=>errors.push(e.message);page.on('request',listener);page.on('pageerror',onError);
    await page.goto(base+'/'+route,{waitUntil:'networkidle'});const initialMp4=req.filter(u=>u.includes('.mp4'));
    for(const section of await page.locator('[data-motion-section]').all()){await section.scrollIntoViewIfNeeded();await page.waitForTimeout(900);}
    const hidden=await page.locator('main h1,main h2,main h3').evaluateAll(es=>es.filter(e=>getComputedStyle(e).visibility==='hidden'||getComputedStyle(e).opacity==='0').map(e=>e.textContent));
    const videos=[];
    if(route==='applications'){
     for(const figure of await page.locator('.aligned-scenes figure').all()){
      await figure.locator('button').click();const v=figure.locator('video');await v.evaluate(v=>v.play());await page.waitForTimeout(400);videos.push(await v.evaluate(v=>({time:v.currentTime,error:v.error?.code||0})));await v.evaluate(v=>v.pause());
     }
     for(const img of await page.locator('img').all()) if(await img.isVisible()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
     await page.evaluate(()=>scrollTo(0,0));
     const heroVideo=page.locator('.applications-hero video');
     await heroVideo.evaluate(v=>v.play());await page.waitForTimeout(500);await heroVideo.evaluate(v=>v.pause());
     await page.screenshot({path:path.join(out,'applications-'+width+'.png'),fullPage:true});
    }
    await page.goto(base+'/inquiry',{waitUntil:'networkidle'});motion.push({width,route,initialMp4,hidden,videos,errors});page.off('request',listener);page.off('pageerror',onError);
   }
   await page.goto(base+'/support',{waitUntil:'networkidle'});
   if(width===390){await page.locator('.navbar__menu-button').click();}
   const support=page.locator('button[aria-controls="support-navigation"]');await support.focus();if(await support.getAttribute('aria-expanded')!=='true')await support.press('Enter');await page.waitForTimeout(200);
   const labels=await page.locator('[aria-label="服务与支持导航"] a').allTextContents();
   navigation.push({width,labels});await page.screenshot({path:path.join(out,width===1440?'navbar-1440.png':'mobile-menu-390.png')});await ctx.close();
  }
  const failed=results.filter(r=>r.overflow||r.brokenImages.length||r.videoErrors.length||r.forbidden.length||r.errors.length||r.missing.length||r.initialMp4.length||r.initialPdf.length||r.scrollMp4.length||r.formRequests.length||(['technology','applications'].includes(r.route)&&r.bodyInquiry)||(r.route==='technology'&&r.platforms.length!==4)||(r.route==='applications'&&r.scenarios.length!==6)||(r.searchChecks&&(r.docCount!==4||r.docButtonMin<44||r.searchChecks.matched!==1||r.searchChecks.empty!==1||r.searchChecks.restored!==4))||(r.form&&(!r.form.disabled||!r.form.readonly||!r.form.notice)));
  const passed=!failed.length&&documents.length===4&&documents.every(d=>d.status===200&&d.hashMatches)&&motion.every(m=>!m.errors.length&&!m.hidden.length&&(m.route==='applications'?m.initialMp4.length===1&&m.videos.length===3&&m.videos.every(v=>v.time>0&&!v.error):m.initialMp4.length===0))&&navigation.every(n=>n.labels.length===4&&!n.labels.join('').includes('视频'));
  await fs.writeFile(path.join(out,'browser-qa.json'),JSON.stringify({results,documents,motion,navigation,failed,passed},null,2));console.log(JSON.stringify({passed,failed,documents,motion,navigation},null,2));if(!passed)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
