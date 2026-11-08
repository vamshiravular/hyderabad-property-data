import {readdir,cp,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {validateAll} from './validate-data.mjs';
validateAll();
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'dist');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const entry of await readdir(root,{withFileTypes:true})){
 if(entry.isFile()&&/\.(html|css|svg)$/.test(entry.name)||['script.js','raven.js','contact.js','citizen-guide.js'].includes(entry.name))await cp(path.join(root,entry.name),path.join(out,entry.name));
}
for(const name of ['data','images','vendor'])await cp(path.join(root,name),path.join(out,name),{recursive:true});
console.log('Raven built into dist; server source, tests, and setup files excluded.');
