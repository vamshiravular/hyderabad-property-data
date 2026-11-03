const c=require('../server/common.cjs');
module.exports=async(req,res)=>{try{
 c.guard(req,['GET','POST']);
 if(req.method==='GET'){
  const wardId=c.ward(req.query?.wardId),before=req.query?.before;
  if(before&&(!Number.isFinite(Date.parse(before))||String(before).length>40))throw c.error(400,'Invalid pagination date.');
  let path='raven_comments?select=id,parent_id,display_name,body,ward_id,created_at&status=eq.published&parent_id=is.null&order=created_at.desc,id.desc&limit=20';
  if(wardId)path+='&ward_id=eq.'+encodeURIComponent(wardId);if(before)path+='&created_at=lt.'+encodeURIComponent(before);
  const threads=await c.database(path);let replies=[];
  if(threads.length)replies=await c.database('raven_comments?select=id,parent_id,display_name,body,ward_id,created_at&status=eq.published&parent_id=in.('+threads.map(t=>t.id).join(',')+')&order=created_at.asc&limit=200');
  return c.json(res,200,{threads,replies,next:threads.length===20?threads.at(-1).created_at:null});
 }
 if(!c.postsReady())throw c.error(503,'Community posting is not connected yet.');
 const name=c.text(req.body.displayName,2,60,'your display name'),body=c.text(req.body.body,10,2000,'your comment');
 if(req.body.consent!==true)throw c.error(400,'Please confirm that your comment will be public.');
 let wardId=c.ward(req.body.wardId),parent=null;
 if(req.body.parentId){if(!c.UUID.test(req.body.parentId))throw c.error(400,'Invalid conversation.');const rows=await c.database('raven_comments?select=id,ward_id,parent_id&id=eq.'+req.body.parentId+'&status=eq.published');if(!rows.length||rows[0].parent_id)throw c.error(400,'Reply to an existing top-level conversation.');parent=rows[0].id;wardId=rows[0].ward_id;}
 await c.rate(req,'discussion',5);
 const row=await c.database('raven_comments',{method:'POST',body:{display_name:name,body,ward_id:wardId,parent_id:parent,status:'published'},prefer:'return=representation'});
 return c.json(res,201,{comment:row[0]});
 }catch(e){return c.failure(res,e);}};
