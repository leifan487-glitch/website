const {chromium}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const base='http://127.0.0.1:4190',out=path.resolve(__dirname,'../output/task0185'),phase=process.env.QA_PHASE||'before';
const routes=['/','/products/mantis-standard','/technology','/applications','/about','/news','/support','/support/documents','/support/downloads','/support/service','/support/contact','/inquiry','/policy/privacy','/policy/terms','/support/videos','/support/knowledge'];
const matrix=new Set(['/','/products/mantis-standard','/technology','/applications','/about','/support','/support/documents','/inquiry']);
const result={phase,generatedAt:new Date().toISOString(),pages:[],menus:[],desktopNavigation:[],videos:[],questions:[],routes:[],documents:[],links:[]};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function images(page){for(const img of await page.locator('img').all())if(await img.isVisible()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode()).catch(()=>{});}}
async function save(){await fs.writeFile(path.join(out,phase==='final'?'browser-final-qa.json':'browser-before-qa.json'),JSON.stringify(result,null,2));}
(async()=>{
 await fs.mkdir(out,{recursive:true});const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});result.browser=browser.version();
 try{
 const linkMap=new Map();
 for(const width of [1440,1024,768,390])for(const route of routes.filter(r=>width===1440||matrix.has(r))){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await ctx.newPage(),consoleErrors=[],pageErrors=[],networkErrors=[],requests=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});page.on('pageerror',e=>pageErrors.push(e.message));page.on('response',r=>{if(r.status()>=400)networkErrors.push([r.status(),r.url()]);});page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{window.__cls=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
  const response=await page.goto(base+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);const initialMp4=requests.filter(u=>u.includes('.mp4')),initialRequests=requests.length,initialPdf=requests.filter(u=>u.includes('.pdf'));
  await images(page);await page.evaluate(()=>scrollTo(0,0));
  const data=await page.evaluate(()=>({overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),cls:window.__cls,
   brokenMedia:[...document.images].filter(i=>i.getClientRects().length&&!i.naturalWidth).map(i=>i.src),videoErrors:[...document.querySelectorAll('video')].filter(v=>v.error).map(v=>v.error.code),
   h1:document.querySelectorAll('h1').length,headings:[...document.querySelectorAll('main h1,main h2,main h3')].map(e=>({level:Number(e.tagName[1]),text:e.innerText})),
   clipped:[...document.querySelectorAll('main h1,main h2,main h3,main p')].filter(e=>{const s=getComputedStyle(e);return s.overflow==='hidden'&&e.scrollHeight>e.clientHeight+2;}).map(e=>e.textContent),
   forbidden:document.body.innerText.match(/\b(?:TODO|SOURCE|PRIVATE|INTERNAL|NEEDS CONFIRMATION|HIGH RISK|Pro|Ultra|FF8D|FF16)\b|待确认|待补充|等待资料|测试数据|localhost|127\.0\.0\.1|file:\/\/|经验素材取地|新资料|MANTIS Standard|Mantis STANDARD|Mantas|Manits|Mantix|0\.98w|9,800|¥9800|\b9800\b/g)||[],
   emails:[...new Set(document.body.innerText.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi)||[])],
   footer:document.querySelector('footer.site-footer')?.innerText||document.querySelector('.site-footer')?.innerText,
   meta:{title:document.title,description:document.querySelector('meta[name="description"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.href||null,ogTitle:document.querySelector('meta[property="og:title"]')?.content,ogDescription:document.querySelector('meta[property="og:description"]')?.content,ogUrl:document.querySelector('meta[property="og:url"]')?.content||null},
   skip:document.querySelector('.skip-link')?.getAttribute('href'),missingLabels:[...document.querySelectorAll('input:not([type="hidden"]),select,textarea')].filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')).map(e=>e.name),
   docCount:document.querySelectorAll('.document-card').length,docActions:[...document.querySelectorAll('.document-card__actions a')].map(e=>({href:e.getAttribute('href'),download:e.hasAttribute('download'),height:e.getBoundingClientRect().height})),
   links:[...document.querySelectorAll('a')].map(e=>({href:e.getAttribute('href'),text:e.textContent.trim(),target:e.target})),
   language:{buttons:document.querySelectorAll('button.navbar__language-trigger').length,text:document.querySelector('.navbar__language')?.innerText},
   form:document.querySelector('.inquiry-form')?{disabled:document.querySelector('.inquiry-form button[type="submit"]').disabled,required:[...document.querySelectorAll('.inquiry-form [required]')].map(e=>e.name),notice:document.querySelector('.inquiry-availability')?.innerText}:null
  }));
  for(const l of data.links){if(l.href?.startsWith('#')){const exists=await page.locator(l.href==='#'?'#unlikely-empty-anchor':l.href).count().catch(()=>0);if(!exists)result.links.push({route,...l,status:'bad-anchor'});}else if(l.href&&!l.href.startsWith('mailto:')&&!/^https?:/.test(l.href))linkMap.set(l.href,{route,...l});else if(!l.href||l.href.startsWith('javascript:'))result.links.push({route,...l,status:'invalid'});}
  if([1440,390].includes(width)&&matrix.has(route)){await page.screenshot({path:path.join(out,`${phase}-${route==='/'?'home':route.replaceAll('/','-').slice(1)}-${width}.png`),fullPage:true});}
  if(route==='/products/mantis-standard'){
   const checks=[];for(const q of await page.locator('.sp-question').all()){await q.locator('button').focus();await page.keyboard.press('Enter');checks.push(await q.locator('[role="region"]').evaluate(e=>({visible:!e.hidden,clipped:e.scrollHeight>e.clientHeight+1})));await page.keyboard.press('Space');}result.questions.push({width,checks,closed:await page.locator('.sp-question [aria-expanded="true"]').count()===0});
  }
  if(route==='/support/documents'){
   const s=page.locator('#document-search-input');await s.fill('开发手册');data.searchCount=await page.locator('.document-card').count();await s.fill('不存在xyz');data.emptyCount=await page.locator('.document-results__empty').count();await s.fill('');
   if(width===1440)for(const a of data.docActions){const r=await ctx.request.get(base+a.href),b=await r.body();result.documents.push({...a,status:r.status(),hashMatches:hash(b)===hash(await fs.readFile(path.resolve(__dirname,'../public'+a.href)))});}
  }
  if(data.form){await page.locator('#inquiry-name').fill('本地验收');await page.locator('#inquiry-name').press('Enter');data.form.apiRequests=requests.filter(u=>u.includes('/api/inquiry'));}
  result.pages.push({route,width,status:response.status(),initialRequests,initialMp4,initialPdf,...data,links:undefined,consoleErrors,pageErrors,networkErrors});await ctx.close();console.log(phase+' '+width+' '+route);await save();
 }
 const ctx=await browser.newContext({viewport:{width:1440,height:900}}),page=await ctx.newPage();
 for(const [href,l] of linkMap){const r=await ctx.request.get(base+href,{maxRedirects:0,headers:{Accept:'text/html'}});result.links.push({...l,status:r.status()});}
 for(const route of [...routes,'/progress','/products','/products/mantis-pro','/contact','/not-a-real-route','/api/not-found','/assets/not-found.webp']){const r=await ctx.request.get(base+route,{maxRedirects:0,headers:{Accept:'text/html'}});result.routes.push({route,status:r.status(),location:r.headers().location||null});}
 for(const name of ['product','support']){await page.goto(base+'/support',{waitUntil:'networkidle'});const trigger=page.locator(`.navbar__${name}-trigger`);await trigger.focus();const open=await trigger.getAttribute('aria-expanded');await page.keyboard.press('Escape');const escape=await trigger.getAttribute('aria-expanded');await trigger.press('Enter');await page.mouse.click(1100,850);const outside=await trigger.getAttribute('aria-expanded');result.desktopNavigation.push({name,open,escape,outside});}
 await ctx.close();
 for(const width of [390,768]){
  const ctx=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',hasTouch:true}),page=await ctx.newPage();await page.goto(base+'/support',{waitUntil:'networkidle'});await page.evaluate(()=>scrollTo(0,240));const before=await page.evaluate(()=>scrollY);
  await page.locator('.navbar__menu-button').click();const state=await page.evaluate(()=>({navBottom:document.querySelector('.navbar__links').getBoundingClientRect().bottom,viewport:innerHeight,pointBlocked:!!document.elementFromPoint(innerWidth/2,innerHeight-5)?.closest('.navbar'),bodyPosition:getComputedStyle(document.body).position,overflow:document.documentElement.scrollWidth-innerWidth}));
  await page.screenshot({path:path.join(out,`${phase}-menu-${width}-viewport.png`)});await page.mouse.move(width/2,800);await page.mouse.wheel(0,300);await page.waitForTimeout(150);state.afterWheel=await page.evaluate(()=>scrollY);
  const focus=[];for(let i=0;i<25;i++){await page.keyboard.press('Tab');focus.push(await page.evaluate(()=>!!document.activeElement.closest('.navbar')));}state.focusContained=focus.every(Boolean);
  await page.keyboard.press('Escape');state.escapeClosed=await page.locator('.navbar').getAttribute('data-open')==='false';if(!state.escapeClosed)await page.locator('.navbar__menu-button').click();state.afterClose=await page.evaluate(()=>scrollY);result.menus.push({width,before,...state});await ctx.close();await save();
 }
 for(const route of ['/','/products/mantis-standard','/applications']){
  const ctx=await browser.newContext({viewport:{width:1440,height:900}}),page=await ctx.newPage(),requests=[];page.on('request',r=>requests.push(r.url()));await page.goto(base+route,{waitUntil:'networkidle'});const initialMp4=requests.filter(u=>u.includes('.mp4')),playbacks=[];
  if(route==='/'){await page.locator('.home-film button').click();}
  if(route==='/products/mantis-standard')for(const f of await page.locator('.sp-real-tasks__grid figure').all()){await f.locator('button').click();await f.locator('video').evaluate(v=>v.play());await page.waitForTimeout(300);playbacks.push(await f.locator('video').evaluate(v=>({time:v.currentTime,controls:v.controls,inline:v.playsInline,error:v.error?.code||0})));await f.locator('video').evaluate(v=>v.pause());}
  if(route==='/applications')for(const f of await page.locator('.aligned-scenes figure').all()){await f.locator('button').click();await f.locator('video').evaluate(v=>v.play());await page.waitForTimeout(300);playbacks.push(await f.locator('video').evaluate(v=>({time:v.currentTime,controls:v.controls,inline:v.playsInline,error:v.error?.code||0})));await f.locator('video').evaluate(v=>v.pause());}
  if(route==='/'){await page.waitForTimeout(500);playbacks.push(await page.locator('.home-film video').evaluate(v=>({time:v.currentTime,controls:v.controls,inline:v.playsInline,muted:v.muted,error:v.error?.code||0})));await page.locator('.real-world').scrollIntoViewIfNeeded();await page.waitForTimeout(800);}
  await page.evaluate(()=>{window.__oldVideos=[...document.querySelectorAll('video')];});await page.locator('.navbar__links > a[href="/about"]').click();await page.waitForTimeout(300);const cleanup=await page.evaluate(()=>window.__oldVideos.map(v=>({paused:v.paused,src:v.getAttribute('src'),connected:v.isConnected})));result.videos.push({route,initialMp4,playbacks,cleanup});await ctx.close();await save();
 }
 await save();console.log('Audit captured: '+result.pages.length+' page/viewport cases');
 }finally{await save();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
