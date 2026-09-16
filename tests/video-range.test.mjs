import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';

const payload=Uint8Array.from({length:256},(_,i)=>i);
function fixture({status=200,type='video/mp4',length=256,extra={},method='GET'}={}) {
 let canceled=false,reads=0;
 const env={ASSETS:{fetch:async()=>new Response(method==='HEAD'||status===304?null:new ReadableStream({
  pull(c){const offset=reads++*16;if(offset>=payload.length)c.close();else c.enqueue(payload.slice(offset,offset+16));},
  cancel(){canceled=true;},
 }),{status,headers:{'Content-Type':type,'Content-Length':String(length),ETag:'"v1"','Last-Modified':'Wed, 16 Sep 2026 00:00:00 GMT',...extra}})}};
 return {env,stats:()=>({canceled,reads})};
}
const request=(range,extra={},method='GET',pathname='/media/test.mp4')=>new Request('https://example.test'+pathname,{method,headers:{...(range?{Range:range}:{}),...extra}});

for(const [range,start,end]of [['bytes=0-15',0,15],['bytes=100-131',100,131],['bytes=230-',230,255],['bytes=-10',246,255],['bytes=200-999',200,255],['bytes=-999',0,255]])test('MP4 returns exact partial bytes: '+range,async()=>{
 const f=fixture(),r=await worker.fetch(request(range),f.env);
 assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),`bytes ${start}-${end}/256`);
 assert.equal(r.headers.get('Content-Length'),String(end-start+1));assert.equal(r.headers.get('Accept-Ranges'),'bytes');
 assert.equal(r.headers.get('X-Content-Type-Options'),'nosniff');
 assert.deepEqual(new Uint8Array(await r.arrayBuffer()),payload.slice(start,end+1));
 if(end<255) assert.equal(f.stats().canceled,true); // At EOF the origin may already be closed.
});
for(const range of ['bytes=256-','bytes=150-149','bytes=-0'])test('Unsatisfiable range returns 416: '+range,async()=>{
 const f=fixture(),r=await worker.fetch(request(range),f.env);assert.equal(r.status,416);assert.equal(r.headers.get('Content-Range'),'bytes */256');assert.equal((await r.arrayBuffer()).byteLength,0);assert.equal(f.stats().canceled,true);
});
test('Malformed/multipart ranges safely fall back to an unchanged full response',async()=>{
 for(const range of ['items=0-1','bytes=-','bytes=a-b','bytes=0-2,4-6','bytes=9999999999999999999999-']){
  const r=await worker.fetch(request(range),fixture().env);assert.equal(r.status,200);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),payload);
 }
});
test('If-Range only slices matching strong validators',async()=>{
 for(const [validator,status]of [['"v1"',206],['"v0"',200],['W/"v1"',200],['Wed, 16 Sep 2026 00:00:00 GMT',206],['Tue, 15 Sep 2026 00:00:00 GMT',200]]){
  const r=await worker.fetch(request('bytes=0-15',{'If-Range':validator}),fixture().env);assert.equal(r.status,status);await r.body.cancel();
 }
});
test('HEAD and full GET advertise seeking; non-video, encoded, missing and upstream partial responses stay intact',async()=>{
 const head=await worker.fetch(request('bytes=0-1',{},'HEAD'),fixture({method:'HEAD'}).env);assert.equal(head.status,200);assert.equal(head.headers.get('Content-Length'),'256');assert.equal(head.body,null);
 const full=await worker.fetch(request(),fixture().env);assert.equal(full.status,200);assert.equal(full.headers.get('Accept-Ranges'),'bytes');await full.body.cancel();
 for(const config of [{status:404},{status:206,extra:{'Content-Range':'bytes 0-255/256'}},{status:304},{type:'text/html'},{extra:{'Content-Encoding':'gzip'}},{length:'unknown'}]){
  const r=await worker.fetch(request('bytes=0-15'),fixture(config).env);assert.equal(r.status,config.status||200);await r.body?.cancel();
 }
 const other=await worker.fetch(request('bytes=0-15',{},'GET','/assets/image.png'),fixture().env);assert.equal(other.status,200);await other.body.cancel();
});
test('Range stream cancels upstream and does not eagerly consume the whole file',async()=>{
 const f=fixture(),r=await worker.fetch(request('bytes=0-1'),f.env);await r.arrayBuffer();assert.ok(f.stats().reads<16);
 const aborted=fixture(),response=await worker.fetch(request('bytes=0-'),aborted.env);await response.body.cancel();assert.equal(aborted.stats().canceled,true);
 const short=await worker.fetch(request('bytes=250-299'),fixture({length:300}).env);await assert.rejects(()=>short.arrayBuffer(),/ended before/);
});
