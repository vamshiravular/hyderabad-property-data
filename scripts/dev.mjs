import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const root=path.resolve(import.meta.dirname,'../dist');
const args=process.argv.slice(2),at=args.indexOf('--port');const port=Number(at>=0?args[at+1]:process.env.PORT||3000);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.geojson':'application/geo+json','.svg':'image/svg+xml','.png':'image/png'};
const routes={'/api/config':require('../api/config.js'),'/api/contact':require('../api/contact.js'),'/api/discussions':require('../api/discussions.js')};
http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://localhost');req.query=Object.fromEntries(u.searchParams);
  if(routes[u.pathname]){
   let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>8192){res.writeHead(413);res.end();return;}}
   if(body){try{req.body=JSON.parse(body);}catch{res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Invalid JSON.'}));return;}}
   res.status=n=>(res.statusCode=n,res);res.json=v=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(v));};return routes[u.pathname](req,res);
  }
  const pathname=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname);const target=path.resolve(root,'.'+pathname);
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const data=await fs.readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log('Raven preview listening on '+port));
