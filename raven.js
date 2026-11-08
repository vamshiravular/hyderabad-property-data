'use strict';
(()=>{
 const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const discussionForm=$('#discussion-form');
 const corps={ghmc:{name:'Greater Hyderabad Municipal Corporation',short:'GHMC',color:'#428c84'},cyberabad:{name:'Cyberabad Municipal Corporation',short:'Cyberabad',color:'#ce914b'},malkajgiri:{name:'Malkajgiri Municipal Corporation',short:'Malkajgiri',color:'#8b72bd'},scb:{name:'Secunderabad Cantonment Board',short:'SCB',color:'#9299aa'}};
 let data={},map,subLayer,corpLayer,specialLayer,highlight,labelLayer,selected=null,corp='all',activeType='wards',services={posting:false,discussions:false},nextPage=null,discussionVersion=0;
 const getJSON=async u=>{const r=await fetch(u);if(!r.ok)throw Error('Could not load '+u);return r.json();};
 const options=(values,first)=>'<option value="">'+first+'</option>'+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
 const featureName=f=>f.properties.ward||f.properties.circle||f.properties.zone;
 function filtered(fs=data.wards.features){return fs.filter(f=>{const p=f.properties;return(corp==='all'||p.corporation_id===corp)&&(!$('#zone-filter').value||p.zone===$('#zone-filter').value)&&(!$('#circle-filter').value||p.circle===$('#circle-filter').value);});}
 function updateFilters(resetZone=false,resetCircle=false){
  const candidates=data.wards.features.filter(f=>corp==='all'||f.properties.corporation_id===corp);
  const zone=resetZone?'':$('#zone-filter').value;$('#zone-filter').innerHTML=options([...new Set(candidates.map(f=>f.properties.zone))].sort(),'All zones');$('#zone-filter').value=zone;
  const inZone=candidates.filter(f=>!zone||f.properties.zone===zone),circle=resetZone||resetCircle?'':$('#circle-filter').value;
  $('#circle-filter').innerHTML=options([...new Set(inZone.map(f=>f.properties.circle))].sort(),'All circles');$('#circle-filter').value=circle;
  const wards=filtered().sort((a,b)=>featureName(a).localeCompare(featureName(b)));
  $('#ward-picker').innerHTML='<option value="">Choose a ward</option>'+wards.map(f=>`<option value="${esc(f.properties.id)}">${esc(f.properties.ward)} · ${f.properties.ward_no}</option>`).join('');
  if(selected&&wards.some(f=>f.properties.id===selected.id))$('#ward-picker').value=selected.id;
  $('#area-count').textContent=wards.length+' wards in this view';
 }
 function style(f){const p=f.properties;return{color:corps[p.corporation_id]?.color||'#999',weight:activeType==='wards'?.7:1.2,opacity:.7,fillColor:corps[p.corporation_id]?.color||'#aaa',fillOpacity:activeType==='wards'?.17:.12};}
 function draw(fit=false){
  if(subLayer)map.removeLayer(subLayer);if(corpLayer)map.removeLayer(corpLayer);if(specialLayer)map.removeLayer(specialLayer);
  const fs=activeType==='wards'?filtered():data[activeType].features.filter(f=>(corp==='all'||f.properties.corporation_id===corp)&&(!$('#zone-filter').value||f.properties.zone===$('#zone-filter').value)&&(!$('#circle-filter').value||activeType==='zones'||f.properties.circle===$('#circle-filter').value));
  subLayer=L.geoJSON({type:'FeatureCollection',features:fs},{style,onEachFeature:(f,layer)=>{
   const p=f.properties;layer.bindTooltip(esc(featureName(f))+(p.ward_no?' · Ward '+p.ward_no:''),{sticky:true});
   layer.on('mouseover',()=>layer.setStyle({fillOpacity:.32,weight:1.6}));layer.on('mouseout',()=>subLayer.resetStyle(layer));
   layer.on('click',e=>{if(activeType==='wards')selectWard(p.id,{latlng:e.latlng});else{clearSelection();corp=p.corporation_id;$('#zone-filter').value=p.zone;updateFilters();if(activeType==='circles'){$('#circle-filter').value=p.circle;updateFilters();}activeType='wards';$('#map-layer').value='wards';updateTabs();draw(true);}});
  }}).addTo(map);
  const cs=data.corporations.features.filter(f=>f.properties.corporation_id!=='scb'&&(corp==='all'||f.properties.corporation_id===corp));
  corpLayer=L.geoJSON({type:'FeatureCollection',features:cs},{interactive:false,style:f=>({color:corps[f.properties.corporation_id].color,weight:3,opacity:.95,fill:false})}).addTo(map);
  specialLayer=L.geoJSON(data.special,{interactive:false,style:{color:'#8d95a5',weight:1.2,dashArray:'4 4',fillColor:'#a7adba',fillOpacity:.15}}).addTo(map);
  if(highlight)highlight.bringToFront();renderLabels();
  if(fit&&subLayer.getBounds().isValid())map.fitBounds(subLayer.getBounds(),{paddingTopLeft:[35,85],paddingBottomRight:[35,35],maxZoom:13,animate:false});
 }
 function renderLabels(){
  if(labelLayer)map.removeLayer(labelLayer);labelLayer=L.layerGroup().addTo(map);
  const features=map.getZoom()<11?data.corporations.features.filter(f=>f.properties.corporation_id!=='scb'&&(corp==='all'||f.properties.corporation_id===corp)):filtered(data.circles.features);
  for(const f of features){const p=f.properties;const text=map.getZoom()<11?corps[p.corporation_id].short.toUpperCase():p.circle;const coords=p.label||null;const pt=coords?L.latLng(coords[1],coords[0]):L.geoJSON(f).getBounds().getCenter();L.marker(pt,{interactive:false,keyboard:false,icon:L.divIcon({className:'map-label '+(map.getZoom()<11?'corp-label':''),html:esc(text),iconSize:[140,18],iconAnchor:[70,9]})}).addTo(labelLayer);}
 }
 function verified(v){return v&&v.status==='verified'&&typeof v.sourceUrl==='string'&&v.sourceUrl.startsWith('https://')&&v.reviewedAt&&v.unit&&v.propertyType;}
 function showValues(id){const record=data.values.records.find(r=>r.wardId===id),g=record?.government,m=record?.market;const fmt=n=>'₹'+Number(n).toLocaleString('en-IN');
  $('#government-value').textContent=verified(g)&&Number.isFinite(g.value)?fmt(g.value)+' / '+g.unit:'Exact-property check needed';
  $('#government-note').textContent=verified(g)?g.scope+' · '+g.propertyType+' · Effective '+g.effectiveDate:'No reviewed rate is published for this ward. Select the exact village, street, and property type on the government portal.';
  $('#government-source').href=verified(g)?g.sourceUrl:data.values.governmentLookup;
  $('#market-value').textContent=verified(m)&&Number.isFinite(m.low)&&Number.isFinite(m.high)?fmt(m.low)+'–'+fmt(m.high)+' / '+m.unit:'Not yet researched';
  $('#market-note').textContent=verified(m)?m.basis+' evidence · '+m.sampleSize+' observations · '+m.observedFrom+' to '+m.observedTo:'No reviewed market observations are available here yet. A ward does not have one universal transaction price.';
  $('#value-status').textContent=verified(m)?'Reviewed '+m.reviewedAt:'0 verified market observations · values not estimated';
 }
 function selectWard(id,{latlng,zoom=true}={}){
  const f=data.wards.features.find(f=>f.properties.id===id);if(!f)return;
  const p=f.properties;selected={id:p.id,name:p.ward,ward:p.ward_no,corporation:p.corporation_id};
  if(corp!=='all'&&corp!==p.corporation_id){corp=p.corporation_id;updateFilters(true,true);updateTabs();draw();}
  $('#area-corp').textContent=corps[p.corporation_id].name.toUpperCase();$('#area-title').textContent=p.ward;
  $('#area-meta').textContent='Ward '+p.ward_no+' · '+corps[p.corporation_id].short;
  $('#area-breadcrumb').hidden=false;$('#area-breadcrumb').textContent=p.zone+' zone → '+p.circle+' circle';showValues(p.id);
  $('#ward-picker').value=p.id;$('#discuss-area').disabled=false;if(discussionForm)$('#post-area').value=p.id;
  if(highlight)map.removeLayer(highlight);highlight=L.geoJSON(f,{interactive:false,style:{color:'#253353',weight:2.5,fillOpacity:.24,fillColor:corps[p.corporation_id].color}}).addTo(map);
  const bounds=highlight.getBounds();if(zoom)map.fitBounds(bounds,{paddingTopLeft:[35,100],paddingBottomRight:[35,35],maxZoom:14,animate:false});
  L.popup({maxWidth:250}).setLatLng(latlng||bounds.getCenter()).setContent('<span class="panel-eyebrow">'+esc(corps[p.corporation_id].short)+' · WARD '+p.ward_no+'</span><h4>'+esc(p.ward)+'</h4><p>Government value: exact-property lookup needed.<br>Market evidence: not yet researched.</p><a href="#area-title">View area details →</a>').openOn(map);
  document.dispatchEvent(new CustomEvent('raven:area',{detail:selected}));
  const url=new URL(location.href);url.searchParams.set('ward',p.ward_no);history.replaceState(null,'',url);
 }
 function updateTabs(){document.querySelectorAll('[data-corp]').forEach(b=>{const active=b.dataset.corp===corp;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
 function clearSelection(){selected=null;if(highlight){map.removeLayer(highlight);highlight=null;}map.closePopup();$('#area-corp').textContent='WARD DETAILS';$('#area-title').textContent='Select a ward';$('#area-meta').textContent='Click the map or search for a neighbourhood.';$('#area-breadcrumb').hidden=true;$('#government-value').textContent='Select an area';$('#market-value').textContent='Select an area';$('#discuss-area').disabled=true;document.dispatchEvent(new CustomEvent('raven:area',{detail:null}));const url=new URL(location.href);url.searchParams.delete('ward');history.replaceState(null,'',url);}
 async function initMap(){
  try{
   const values=await Promise.all(['wards','circles','zones','corporations','special'].map(n=>getJSON('data/'+n+'.geojson')));['wards','circles','zones','corporations','special'].forEach((n,i)=>data[n]=values[i]);data.values=await getJSON('data/area-values.json');
   if(discussionForm){
    const index=data.wards.features.map(f=>f.properties).sort((a,b)=>a.ward.localeCompare(b.ward));
    const opt=index.map(p=>`<option value="${esc(p.id)}">${esc(p.ward)} · ${p.ward_no}</option>`).join('');$('#post-area').insertAdjacentHTML('beforeend',opt);$('#discussion-area').insertAdjacentHTML('beforeend',opt);
   }
   $('#map-loading').remove();if(!window.L)throw Error('The map library is unavailable. Use the ward selector below.');
   map=L.map('city-map',{zoomControl:false,scrollWheelZoom:false,zoomSnap:.25,minZoom:9,maxZoom:17,maxBounds:[[16.9,77.9],[17.95,79.1]],maxBoundsViscosity:.8});
   L.control.zoom({position:'bottomleft'}).addTo(map);L.control.scale({imperial:false,position:'bottomright'}).addTo(map);map.attributionControl.addAttribution('Boundaries: <a href="https://access.hyderabad.urbanobservatory.in/">Hyderabad Urban Lab</a> · 2026 digitisation');map.getPane('overlayPane').setAttribute('aria-hidden','true');
   map.on('zoomend',renderLabels);updateFilters();draw(true);map.invalidateSize();
   document.querySelectorAll('[data-corp]').forEach(b=>b.onclick=()=>{corp=b.dataset.corp;clearSelection();updateTabs();updateFilters(true,true);draw(true);});
   $('#zone-filter').onchange=()=>{clearSelection();updateFilters(false,true);draw(true);};$('#circle-filter').onchange=()=>{clearSelection();updateFilters();draw(true);};
   $('#ward-picker').onchange=()=>{if($('#ward-picker').value)selectWard($('#ward-picker').value);};$('#map-layer').onchange=()=>{activeType=$('#map-layer').value;draw();};
   $('#reset-map').onclick=()=>{corp='all';activeType='wards';$('#map-layer').value='wards';$('#area-search').value='';$('#search-results').hidden=true;clearSelection();updateTabs();updateFilters(true,true);draw(true);};
   $('#area-search').oninput=()=>{const q=$('#area-search').value.trim().toLowerCase();const box=$('#search-results');box.hidden=!q;if(!q)return;const found=data.wards.features.filter(f=>[f.properties.ward,f.properties.circle,f.properties.zone,f.properties.ward_no].join(' ').toLowerCase().includes(q)).slice(0,15);$('#search-summary').textContent=found.length+' matching areas';box.innerHTML=found.length?found.map(f=>`<button type="button" data-ward="${esc(f.properties.id)}">${esc(f.properties.ward)}<small>${esc(corps[f.properties.corporation_id].short)} · Ward ${f.properties.ward_no} · ${esc(f.properties.circle)}</small></button>`).join(''):'<p>No matching wards. Try a circle or zone name.</p>';};
   $('#search-results').onclick=e=>{const b=e.target.closest('[data-ward]');if(!b)return;corp='all';updateTabs();updateFilters(true,true);draw();selectWard(b.dataset.ward);$('#area-search').value=data.wards.features.find(f=>f.properties.id===b.dataset.ward).properties.ward;$('#search-results').hidden=true;};
   $('#area-search').onkeydown=e=>{if(e.key==='Escape')$('#search-results').hidden=true;if(e.key==='Enter'){e.preventDefault();$('#search-results button')?.click();}};
   document.addEventListener('click',e=>{if(!e.target.closest('.map-search'))$('#search-results').hidden=true;});
   $('#discuss-area').onclick=()=>{
    if(!discussionForm){location.href='property-map.html?ward='+selected.ward+'#community';return;}
    $('#discussion-area').value=selected.id;loadDiscussions();location.hash='community';
   };
   const ward=new URLSearchParams(location.search).get('ward');
   if(ward){
    selectWard('ward-'+ward);
    if(discussionForm&&selected&&location.hash==='#community')$('#discussion-area').value=selected.id;
   }
  }catch(e){$('#area-count').textContent='Map loading failed. Please reload.';$('#city-map').innerHTML='<div class="map-loading">Map unavailable. Please reload or <a href="areas.html">browse area guides</a>.</div>';}
 }
 $('#map-sources').onclick=()=>{const d=document.createElement('dialog');d.className='raven-dialog';d.setAttribute('aria-label','Map boundary notes');d.innerHTML='<div class="dialog-top"><span>RAVEN · MAP NOTES</span><button class="dialog-close" aria-label="Close map notes">×</button></div><h2>The expanded Hyderabad.</h2><p>Three corporations, 12 zones, 60 circles, and 300 wards. Cyberabad includes the Serilingampally, Kukatpally, and Quthbullapur zones. Malkajgiri includes the Malkajgiri, Uppal, and LB Nagar zones. GHMC covers the remaining six zones.</p><p>Geometry digitised by Hyderabad Urban Lab, published in its July 2026 Accessibility Atlas, and simplified for this map. This is an indicative visualisation, not a legal boundary survey. Airport, BHEL, and Secunderabad Cantonment are shown separately in grey.</p><p><a href="data-sources.html">Read sources, coverage, and value methodology ↗</a></p>';document.body.append(d);d.querySelector('button').onclick=()=>d.close();d.onclose=()=>d.remove();d.showModal();};
 const time=s=>new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
 const wardName=id=>data.wards?.features.find(f=>f.properties.id===id)?.properties.ward||'Hyderabad';
 function threadHTML(t,replies){return `<article class="conversation-card" data-thread="${esc(t.id)}"><div class="conversation-author"><span class="conversation-avatar">${esc(t.display_name.slice(0,2).toUpperCase())}</span><div><strong>${esc(t.display_name)}</strong><time datetime="${esc(t.created_at)}">${esc(time(t.created_at))}</time></div><span class="conversation-area">${esc(wardName(t.ward_id))}</span></div><p>${esc(t.body)}</p><div class="conversation-actions"><button type="button" data-reply="${esc(t.id)}">↳ Reply</button><span>${replies.length} ${replies.length===1?'reply':'replies'}</span></div><div class="reply-list">${replies.map(r=>`<div class="reply-item"><strong>${esc(r.display_name)}</strong><time datetime="${esc(r.created_at)}">${esc(time(r.created_at))}</time><p>${esc(r.body)}</p></div>`).join('')}</div><div class="reply-slot"></div></article>`;}
 async function loadDiscussions(append=false){
  const version=++discussionVersion,status=$('#discussion-status');if(!services.discussions){status.innerHTML='<strong>The neighbourhood conversation is opening soon.</strong>Shared discussions are awaiting their database connection. Once connected, comments and replies will be visible to everyone. You can already explore the map or send an email enquiry.';$('#post-status').textContent='Public posting is awaiting setup.';return;}
  if(!append){$('#discussion-list').innerHTML='';status.hidden=false;status.textContent='Loading conversations…';}$('#load-more').disabled=true;
  try{const params=new URLSearchParams();if($('#discussion-area').value!=='all')params.set('wardId',$('#discussion-area').value);if(append&&nextPage)params.set('before',nextPage);const r=await fetch('/api/discussions?'+params);const j=await r.json();if(version!==discussionVersion)return;if(!r.ok)throw Error(j.error||'Could not load discussions.');
   status.hidden=Boolean(j.threads.length||append);status.innerHTML='<strong>Be the first to start a conversation.</strong>Share something useful about this neighbourhood.';
   $('#discussion-list').insertAdjacentHTML('beforeend',j.threads.map(t=>threadHTML(t,j.replies.filter(r=>r.parent_id===t.id))).join(''));nextPage=j.next;$('#load-more').hidden=!nextPage;
  }catch(e){status.hidden=false;status.textContent=e.message;}finally{$('#load-more').disabled=false;}
 }
 async function submitComment(form,status,button,parentId=null){
  const f=new FormData(form);button.disabled=true;status.textContent='Posting your comment…';
  try{const r=await fetch('/api/discussions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({displayName:f.get('displayName'),body:f.get('body'),wardId:f.get('wardId')||null,parentId,consent:f.has('consent'),website:f.get('website')||''})});const j=await r.json();if(!r.ok)throw Error(j.error||'Could not post your comment.');form.reset();status.textContent='Your comment is published.';await loadDiscussions();}
  catch(e){status.textContent=e.message;}finally{button.disabled=!services.posting;}
 }
 if(!discussionForm){initMap();return;}
 discussionForm.onsubmit=e=>{e.preventDefault();submitComment(e.currentTarget,$('#post-status'),$('#post-discussion'));};
 $('#discussion-area').onchange=()=>loadDiscussions();$('#refresh-discussions').onclick=()=>loadDiscussions();$('#load-more').onclick=()=>loadDiscussions(true);
 $('#discussion-list').onclick=e=>{const b=e.target.closest('[data-reply]');if(!b)return;const slot=b.closest('article').querySelector('.reply-slot');if(slot.firstChild){slot.innerHTML='';return;}if(!services.posting)return;
  slot.innerHTML='<form class="reply-form"><label>Your display name<input name="displayName" required minlength="2" maxlength="60"></label><label>Your reply<textarea name="body" required minlength="10" maxlength="2000" rows="3"></textarea></label><label class="consent"><input name="consent" type="checkbox" required><span>I understand this reply will be public.</span></label><div class="honey" aria-hidden="true"><input name="website" tabindex="-1"></div><button class="primary" type="submit">Post reply ↗</button><p class="form-status" role="status"></p></form>';const form=slot.querySelector('form');form.onsubmit=e=>{e.preventDefault();submitComment(form,form.querySelector('.form-status'),form.querySelector('button'),b.dataset.reply);};form.querySelector('input').focus();};
 Promise.all([initMap(),window.RavenServices.config()]).then(([,c])=>{services=c;$('#post-discussion').disabled=!services.posting;loadDiscussions();});
})();
