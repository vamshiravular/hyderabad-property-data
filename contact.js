'use strict';
(()=>{
 let currentWard=null,configPromise;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const config=()=>configPromise||(configPromise=fetch('/api/config').then(r=>{if(!r.ok)throw Error();return r.json();}).catch(()=>({contact:false,posting:false,discussions:false})));
 window.RavenServices={config};
 document.addEventListener('raven:area',e=>{currentWard=e.detail;});
 const dialog=document.createElement('dialog');dialog.className='raven-dialog';dialog.setAttribute('aria-label','Contact Raven');
 document.body.append(dialog);
 let requestId;
 function close(){dialog.close();}
 async function open(){
  requestId=crypto.randomUUID?.()||'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
  dialog.innerHTML=`<div class="dialog-top"><span>RAVEN · A CONVERSATION STARTS HERE</span><button class="dialog-close" aria-label="Close contact form" type="button">×</button></div><h2>A place in mind?<br>We’re listening.</h2><p>Tell us what you want to understand${currentWard?' about '+esc(currentWard.name):' about Hyderabad property'}. Include the street or property type when asking about a value.</p><div class="contact-options"><button id="copy-query" type="button" class="quiet">Copy query text ↗</button></div><form id="raven-contact-form"><div class="form-row"><label>Your name<input name="name" autocomplete="name" required minlength="2" maxlength="80" placeholder="Your name"></label><label>Your email<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label></div><label>Area<input name="area" readonly value="${esc(currentWard?.name||'Hyderabad in general')}"></label><label>How can we help?<textarea name="message" required minlength="20" maxlength="4000" rows="4" placeholder="Tell us your question and the locality you’re researching…"></textarea></label><label class="consent"><input name="consent" type="checkbox" required><span>I agree to send these details to Raven so the team can reply to my query.</span></label><div class="honey" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><button class="primary full" id="send-query" type="submit" disabled>Send your query ↗</button><p class="form-status" id="contact-status" role="status">Checking email connection…</p></form><p class="privacy-note">Your query is sent privately to the Raven team when email delivery is enabled. Please don’t include confidential documents or payment information.</p>`;
  dialog.querySelector('.dialog-close').onclick=close;dialog.showModal();
  const form=dialog.querySelector('form'),status=dialog.querySelector('#contact-status'),button=dialog.querySelector('#send-query'),copy=dialog.querySelector('#copy-query');
  copy.onclick=async()=>{const f=new FormData(form);const value='Raven query\nName: '+f.get('name')+'\nReply email: '+f.get('email')+'\nArea: '+f.get('area')+'\n\n'+f.get('message');try{await navigator.clipboard.writeText(value);status.textContent='Query text copied. No message has been sent.';}catch{status.textContent='Select and copy your query from the form. No message has been sent.';}};
  form.onsubmit=async e=>{e.preventDefault();button.disabled=true;status.textContent='Sending your query…';const f=new FormData(form);
   try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId,name:f.get('name'),email:f.get('email'),message:f.get('message'),wardId:currentWard?.id||null,consent:f.has('consent'),website:f.get('website')})});const j=await r.json();if(!r.ok)throw Error(j.error||'Your query could not be sent.');status.textContent=j.message;form.querySelectorAll('input,textarea').forEach(el=>el.disabled=true);button.textContent='Query accepted ✓';}
   catch(error){status.textContent=error.message;button.disabled=false;}
  };
  const services=await config();if(!dialog.open)return;
  button.disabled=!services.contact;status.textContent=services.contact?'Your message will be sent securely to our inbox.':'Direct email delivery is awaiting setup. You can draft and copy your query here; it has not been sent.';
 }
 document.addEventListener('click',e=>{if(e.target.closest('.contact-trigger'))open();});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close();});
})();
