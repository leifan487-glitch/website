const {chromium}=require('playwright');
const fs=require('node:fs/promises'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4190';
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const results={mobile:[],routes:[],media:[],errors:[]};
  const page=async(width=1440,motion='reduce')=>{
    const p=await browser.newPage({viewport:{width,height:844},reducedMotion:motion});
    p.on('pageerror',e=>results.errors.push(e.message));
    p.on('console',m=>{if(m.type()==='error')results.errors.push(m.text());});
    return p;
  };
  try{
    for(const width of [390,768]){
      const p=await page(width);await p.goto(base,{waitUntil:'networkidle'});
      await p.evaluate(()=>scrollTo(0,220));
      const start=await p.evaluate(()=>scrollY);
      const button=p.locator('.navbar__menu-button'),nav=p.locator('.navbar');
      await button.click();
      const state=await p.evaluate(()=>({fixed:getComputedStyle(document.body).position==='fixed',inert:[...document.querySelectorAll('[inert]')].length>0,bottom:document.querySelector('.navbar__links').getBoundingClientRect().bottom,viewport:innerHeight,lang:document.querySelector('.navbar__language-status')?.tagName}));
      assert.ok(state.fixed&&state.inert);assert.ok(Math.abs(state.bottom-state.viewport)<2);assert.equal(state.lang,'SPAN');
      for(let i=0;i<25;i++){await p.keyboard.press('Tab');assert.ok(await p.evaluate(()=>!!document.activeElement.closest('.navbar')));}
      await p.keyboard.press('Escape');assert.equal(await nav.getAttribute('data-open'),'false');
      assert.equal(await p.evaluate(()=>scrollY),start);
      await button.click();await button.click();assert.equal(await nav.getAttribute('data-open'),'false');assert.equal(await p.evaluate(()=>scrollY),start);
      await button.click();await p.locator('.navbar__links > a[href="/support/documents"]').click();await p.waitForURL('**/support/documents');
      const cleanup=await p.evaluate(()=>({fixed:getComputedStyle(document.body).position==='fixed',inert:document.querySelectorAll('[inert]').length,route:location.pathname,open:document.querySelector('.navbar').dataset.open}));
      assert.equal(cleanup.fixed,false);assert.equal(cleanup.inert,0);assert.equal(cleanup.open,'false');
      results.mobile.push({width,...state,tabCycles:25,escape:true,close:true,scrollRestored:true,cleanup});
      await p.close();
    }
    const p=await page();
    for(const route of ['/','/products/mantis-standard','/technology','/applications','/about','/inquiry','/support','/support/documents','/support/downloads','/support/service','/support/contact','/news','/policy/privacy','/policy/terms']){
      const response=await p.goto(base+route,{waitUntil:'networkidle'});
      assert.equal(response.status(),200,route);
      const refreshed=await p.reload({waitUntil:'networkidle'});assert.equal(refreshed.status(),200,route);
      assert.equal(await p.locator('.navbar__links > a[href="/support/documents"]').count(),1);
      assert.equal(await p.locator('.navbar__support-trigger').count(),0);
      results.routes.push({route,direct:response.status(),refresh:refreshed.status()});
    }
    await p.goto(base,{waitUntil:'networkidle'});
    const product=p.locator('.navbar__product-trigger');await product.focus();assert.equal(await product.getAttribute('aria-expanded'),'true');
    await p.keyboard.press('Escape');assert.equal(await product.getAttribute('aria-expanded'),'false');assert.ok(await product.evaluate(e=>e===document.activeElement));
    await product.hover();assert.equal(await product.getAttribute('aria-expanded'),'true');await p.locator('.navbar__links > a[href="/support/documents"]').click();await p.waitForURL('**/support/documents');
    results.productMenu={focusOpen:true,escapeRestore:true,hoverOpen:true,documentsDirect:true};
    const pdfs=await p.locator('a[href$=".pdf"]').evaluateAll(es=>[...new Set(es.map(e=>e.getAttribute('href')))]);
    assert.equal(pdfs.length,4);results.pdfCount=pdfs.length;
    let apiRequests=0;p.on('request',r=>{if(r.url().includes('/api/inquiry'))apiRequests++;});
    await p.goto(base+'/inquiry',{waitUntil:'networkidle'});assert.ok(await p.locator('button[type="submit"]').isDisabled());
    await p.locator('input').first().focus();await p.keyboard.press('Enter');await p.waitForTimeout(250);assert.equal(apiRequests,0);
    results.inquiry={submitDisabled:true,enterRequests:apiRequests};
    for(const [route,destination,status] of [['/products','/products/mantis-standard',308],['/products/mantis-pro','/products/mantis-standard',308],['/contact','/inquiry',308],['/progress',null,404],['/task0187-missing',null,404]]){
      const r=await p.request.get(base+route,{maxRedirects:0});
      assert.equal(r.status(),status,route);if(destination)assert.ok(r.headers().location.endsWith(destination));
      results.routes.push({route,status:r.status(),location:r.headers().location||null});
    }
    await p.close();
    for(const group of ['Official Film','Real World']){
      const m=await page(1440,group==='Real World'?'no-preference':'reduce'),requests=[];
      m.on('request',r=>{if(r.url().includes('.mp4'))requests.push(r.url());});
      await m.goto(base,{waitUntil:'networkidle'});await m.waitForTimeout(1000);assert.equal(requests.length,0);
      const selector=group==='Official Film'?'.home-film video':'.real-world video';
      if(group==='Official Film')await m.locator('.home-film__poster').click();
      else await m.locator('.real-world').scrollIntoViewIfNeeded();
      await m.waitForFunction(s=>document.querySelector(s)?.currentTime>0.5,selector,{timeout:20000});
      const v=await m.locator(selector).evaluate(e=>({time:e.currentTime,inline:e.playsInline,controls:e.controls,error:e.error?.code||0,src:e.currentSrc,poster:e.poster}));
      await m.waitForTimeout(500);assert.ok(await m.locator(selector).evaluate((e,t)=>e.currentTime>t,v.time));assert.ok(v.inline);assert.equal(v.error,0);
      if(group==='Official Film')assert.ok(v.controls);
      else{
        const toggle=m.locator('.real-world .standard-media-player__control');await toggle.click();
        assert.ok(await m.locator(selector).evaluate(e=>e.paused));await toggle.click();assert.ok(await m.locator(selector).evaluate(e=>!e.paused));
      }
      const poster=await m.request.get(v.poster);assert.equal(poster.status(),200);
      await m.locator(selector).evaluate(e=>window.__task0187Video=e);
      await m.locator('.navbar__links > a[href="/support/documents"]').click();await m.waitForURL('**/support/documents');await m.waitForTimeout(100);
      const released=await m.evaluate(()=>({paused:window.__task0187Video.paused,src:window.__task0187Video.getAttribute('src'),connected:window.__task0187Video.isConnected}));
      assert.ok(released.paused&&!released.connected&&released.src===null);
      results.media.push({group,initialMp4:0,...v,released});
      await m.close();
    }
    assert.deepEqual(results.errors,[]);
    console.log(JSON.stringify(results,null,2));
  }finally{await fs.mkdir('output/task0187',{recursive:true});await fs.writeFile('output/task0187/interactions.json',JSON.stringify(results,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
