// Local-only adapter for testing the built Cloudflare worker, not a deployment.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import worker from '../dist/client/_worker.js';
const root=path.resolve('dist/client');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf','.mp4':'video/mp4','.txt':'text/plain','.xml':'application/xml'};
const assets={async fetch(req){
 const url=new URL(req.url),relative=decodeURIComponent(url.pathname).replace(/^\/+/,''),file=path.resolve(root,relative||'index.html');
 if(!file.startsWith(root+path.sep)||relative==='_worker.js')return new Response('Not found',{status:404});
 try{const data=await fs.readFile(file),headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':String(data.length),'Accept-Ranges':'bytes'};const range=req.headers.get('range');
 if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(m){const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),data.length-1):data.length-1;if(start> end)return new Response(null,{status:416});headers['Content-Range']=`bytes ${start}-${end}/${data.length}`;headers['Content-Length']=String(end-start+1);return new Response(req.method==='HEAD'?null:data.subarray(start,end+1),{status:206,headers});}}
 return new Response(req.method==='HEAD'?null:data,{headers});
 }catch{return new Response('Not found',{status:404});}
}};
http.createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const init={method:req.method,headers:req.headers};if(!['GET','HEAD'].includes(req.method))init.body=Buffer.concat(chunks);const response=await worker.fetch(new Request('http://127.0.0.1:4190'+req.url,init),{ASSETS:assets});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500);res.end(e.message);}}).listen(4190,'127.0.0.1',()=>console.log('Local built-worker preview http://127.0.0.1:4190'));
