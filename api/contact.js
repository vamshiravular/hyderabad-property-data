const c=require('../server/common.cjs');
module.exports=async(req,res)=>{try{
 c.guard(req,['POST']);if(!c.contactReady())throw c.error(503,'Email delivery is not connected yet. Your query has not been sent.');
 const name=c.text(req.body.name,2,80,'your name'),email=c.text(req.body.email,5,254,'your email address'),message=c.text(req.body.message,20,4000,'your query');
 if(!c.EMAIL.test(email)||/[\r\n]/.test(name))throw c.error(400,'Enter a valid name and email address.');
 const wardId=c.ward(req.body.wardId);if(req.body.consent!==true)throw c.error(400,'Please agree to send these details.');
 const id=req.body.requestId;if(!c.UUID.test(id||''))throw c.error(400,'Invalid request identifier. Please reload the form.');
 await c.rate(req,'contact',3);
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'raven-contact-'+id},body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL,to:[process.env.CONTACT_TO_EMAIL],reply_to:email,subject:'Raven enquiry'+(wardId?' · '+wardId:''),text:'Name: '+name+'\nReply email: '+email+'\nArea: '+(wardId||'Hyderabad in general')+'\n\n'+message}),signal:AbortSignal.timeout(10000)});
 const data=await r.json();if(!r.ok||!data.id)throw c.error(503,'Your query could not be sent. Please try again or copy your query text.');
 return c.json(res,200,{ok:true,message:'Your query has been accepted for email delivery. We will reply to the address you provided.'});
 }catch(e){return c.failure(res,e);}};
