const {json,dbReady,postsReady,contactReady}=require('../server/common.cjs');
module.exports=async(req,res)=>{if(req.method!=='GET')return json(res,405,{error:'Method not allowed.'});return json(res,200,{discussions:dbReady(),posting:postsReady(),contact:contactReady()});};
