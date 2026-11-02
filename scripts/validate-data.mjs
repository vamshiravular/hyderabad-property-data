import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(import.meta.dirname,'..');
const date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s));
export function validateValues(data,ids){
 if(!Array.isArray(data.records))throw Error('Values records must be an array.');const used=new Set();
 for(const r of data.records){if(!ids.has(r.wardId)||used.has(r.wardId))throw Error('Unknown or duplicate ward ID.');used.add(r.wardId);
  for(const kind of ['government','market']){const v=r[kind];if(v==null)continue;
   if(v.status!=='verified'||!['sq ft','sq yard','acre'].includes(v.unit)||!v.propertyType||!date(v.reviewedAt))throw Error('A value needs verified status, units, property type, and review date.');
   try{if(new URL(v.sourceUrl).protocol!=='https:')throw Error();}catch{throw Error('A value needs a valid HTTPS source URL.');}
   if(kind==='government'&&(!(v.value>0)||!Number.isFinite(v.value)||!v.scope||!date(v.effectiveDate)))throw Error('Government rate needs positive value, scope, and effective date.');
   if(kind==='market'&&(!(v.low>0)||!Number.isFinite(v.low)||!Number.isFinite(v.high)||v.high<v.low||!Number.isInteger(v.sampleSize)||v.sampleSize<1||!['asking','transaction'].includes(v.basis)||!date(v.observedFrom)||!date(v.observedTo)||v.observedFrom>v.observedTo))throw Error('Market range needs dated, positive observed evidence and sample size.');
  }
 }return true;
}
export function validateAll(){
 const get=n=>JSON.parse(fs.readFileSync(path.join(root,'data',n),'utf8'));
 const wards=get('wards.geojson').features,index=get('area-index.json'),counts={};
 if(wards.length!==300||index.length!==300||new Set(index.map(x=>x.id)).size!==300)throw Error('Expected 300 unique wards.');
 for(const f of wards){const p=f.properties;counts[p.corporation_id]=(counts[p.corporation_id]||0)+1;if(!p.ward||!p.circle||!p.zone||!['Polygon','MultiPolygon'].includes(f.geometry.type))throw Error('Invalid ward geometry or hierarchy.');}
 if(counts.ghmc!==150||counts.cyberabad!==76||counts.malkajgiri!==74)throw Error('Unexpected corporation coverage.');
 if(get('circles.geojson').features.length!==60||get('zones.geojson').features.length!==12)throw Error('Incomplete circle or zone coverage.');
 validateValues(get('area-values.json'),new Set(index.map(x=>x.id)));return counts;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log('Validated Raven data:',validateAll());
