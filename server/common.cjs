'use strict';
const {createHmac}=require('node:crypto');
const areaIndex=require('../data/area-index.json');const ids=new Set(areaIndex.map(a=>a.id));
const EMAIL=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function error(status,message){return Object.assign(new Error(message),{status});}
function text(v,min,max,label){if(typeof v!=='string')throw error(400,'Please enter '+label+'.');const s=v.trim();if(s.length<min||s.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s))throw error(400,label+' must be '+min+'–'+max+' characters.');return s;}
function ward(v){if(v==null||v==='')return null;if(typeof v!=='string'||!ids.has(v))throw error(400,'Choose an area from the map.');return v;}
function json(res,status,payload){res.setHeader('Cache-Control','no-store');return res.status(status).json(payload);}
function guard(req,methods){if(!methods.includes(req.method))throw error(405,'Method not allowed.');if(req.method==='POST'){
 const ct=String(req.headers['content-type']||'');if(!ct.startsWith('application/json'))throw error(415,'Use application/json.');
 if(!req.body||Array.isArray(req.body)||typeof req.body!=='object'||Buffer.byteLength(JSON.stringify(req.body))>8192)throw error(400,'Invalid or oversized request.');
 const origin=req.headers.origin,host=req.headers.host;if(origin&&new URL(origin).host!==host)throw error(403,'Please submit from this website.');
 if(req.body.website)throw error(400,'Unable to accept this submission.');
 }}
function dbReady(){return Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SECRET_KEY);}
function postsReady(){return dbReady()&&Boolean(process.env.RATE_LIMIT_SALT);}
function contactReady(){return postsReady()&&Boolean(process.env.RESEND_API_KEY&&process.env.CONTACT_FROM_EMAIL&&process.env.CONTACT_TO_EMAIL);}
async function database(route,{method='GET',body,prefer}={}){
 if(!dbReady())throw error(503,'The community connection is not enabled yet.');
 const key=process.env.SUPABASE_SECRET_KEY;const headers={apikey:key,'Content-Type':'application/json'};
 if(!key.startsWith('sb_secret_'))headers.Authorization='Bearer '+key;
 if(prefer)headers.Prefer=prefer;
 const r=await fetch(process.env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/'+route,{method,headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw error(503,'The community service is temporarily unavailable.');
 return r.status===204?null:await r.json();
}
async function rate(req,scope,limit){
 if(!process.env.RATE_LIMIT_SALT)throw error(503,'Submissions are not enabled yet.');
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const key=createHmac('sha256',process.env.RATE_LIMIT_SALT).update(scope+':'+ip).digest('hex');
 const accepted=await database('rpc/raven_consume_rate',{method:'POST',body:{p_key:key,p_limit:limit}});
 if(accepted!==true)throw error(429,'You have reached the hourly limit. Please try again later.');
}
function failure(res,e){const status=e.status||503;return json(res,status,{error:e.status?e.message:'The service is temporarily unavailable. Please try again later.'});}
module.exports={EMAIL,UUID,error,text,ward,json,guard,dbReady,postsReady,contactReady,database,rate,failure};
