const header=document.querySelector('[data-header]'),menu=document.querySelector('[data-menu]'),mobile=document.querySelector('[data-mobile-nav]'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const sync=()=>header?.classList.toggle('scrolled',scrollY>24);sync();addEventListener('scroll',sync,{passive:true});menu?.addEventListener('click',()=>mobile?.classList.toggle('open'));mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')));
if(reduce){document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))}else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -5%'});document.querySelectorAll('.reveal').forEach(e=>io.observe(e))}
const legs=[...document.querySelectorAll('.trip-leg[data-leg]')],route=document.querySelector('[data-route]'),counter=document.querySelector('[data-counter]'),rdate=document.querySelector('[data-route-date]'),rtitle=document.querySelector('[data-route-title]');let active=-1,tick=false;function update(){tick=false;if(!legs.length)return;const line=innerHeight*.52;let idx=0;for(let i=0;i<legs.length;i++){if(legs[i].getBoundingClientRect().top<=line)idx=i;else break}if(idx===active)return;active=idx;legs.forEach((e,i)=>e.classList.toggle('is-active',i===idx));if(counter)counter.textContent=String(idx+1).padStart(2,'0')+' / '+String(legs.length).padStart(2,'0');if(rdate)rdate.textContent=legs[idx].querySelector('small')?.textContent.split('·')[0].trim()||'';if(rtitle)rtitle.textContent=legs[idx].querySelector('h2')?.textContent||'';if(route)route.style.strokeDashoffset=String(1000-((idx+1)/legs.length)*1000)}function req(){if(tick)return;tick=true;requestAnimationFrame(update)}if(legs.length){update();addEventListener('scroll',req,{passive:true});addEventListener('resize',req,{passive:true})}

/* Analytics consent + GA4 */
const GA_MEASUREMENT_ID='G-QW0MD0ZH75';
const ANALYTICS_CONSENT_KEY='sw_analytics_consent';

function loadGoogleAnalytics(){
 if(window.__swGaLoaded)return;
 window.__swGaLoaded=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){dataLayer.push(arguments)};
 const s=document.createElement('script');
 s.async=true;
 s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(GA_MEASUREMENT_ID);
 document.head.appendChild(s);
 gtag('js',new Date());
 gtag('config',GA_MEASUREMENT_ID,{anonymize_ip:true});
}

function trackEvent(name,params={}){
 if(localStorage.getItem(ANALYTICS_CONSENT_KEY)!=='granted'||typeof window.gtag!=='function')return;
 gtag('event',name,params);
}

function setAnalyticsConsent(value){
 localStorage.setItem(ANALYTICS_CONSENT_KEY,value);
 document.querySelector('[data-consent-banner]')?.remove();
 if(value==='granted')loadGoogleAnalytics();
}

function showConsentBanner(){
 if(localStorage.getItem(ANALYTICS_CONSENT_KEY))return;
 const en=document.documentElement.lang==='en';
 const wrap=document.createElement('div');
 wrap.className='consent-banner';
 wrap.setAttribute('data-consent-banner','');
 wrap.innerHTML=`
  <div class="consent-copy">
   <strong>${en?'Analytics & privacy':'Analytics & Datenschutz'}</strong>
   <p>${en?'We use Google Analytics only with your consent to understand how visitors find and use this website.':'Wir verwenden Google Analytics nur mit deiner Zustimmung, um zu verstehen, wie Besucher unsere Website finden und nutzen.'} <a href="${en?'/en/privacy/':'/datenschutz/'}">${en?'Privacy policy':'Datenschutz'}</a></p>
  </div>
  <div class="consent-actions">
   <button type="button" class="consent-btn secondary" data-consent-essential>${en?'Necessary only':'Nur notwendige'}</button>
   <button type="button" class="consent-btn primary" data-consent-accept>${en?'Accept analytics':'Analytics akzeptieren'}</button>
  </div>`;
 document.body.appendChild(wrap);
 wrap.querySelector('[data-consent-essential]')?.addEventListener('click',()=>setAnalyticsConsent('denied'));
 wrap.querySelector('[data-consent-accept]')?.addEventListener('click',()=>setAnalyticsConsent('granted'));
}

const savedConsent=localStorage.getItem(ANALYTICS_CONSENT_KEY);
if(savedConsent==='granted')loadGoogleAnalytics();
else if(!savedConsent)showConsentBanner();

document.addEventListener('click',e=>{
 const settings=e.target.closest('[data-consent-settings]');
 if(settings){
  e.preventDefault();
  localStorage.removeItem(ANALYTICS_CONSENT_KEY);
  document.querySelector('[data-consent-banner]')?.remove();
  showConsentBanner();
  return;
 }
 const a=e.target.closest('a');
 if(!a)return;
 const href=a.getAttribute('href')||'';
 if(href.startsWith('mailto:')){
  const address=href.slice(7).split('?')[0];
  trackEvent(address.startsWith('booking@')?'booking_click':'email_click',{email_address:address});
 }else if(/\/trips\/?(?:$|[?#])/.test(href)){
  trackEvent('trips_view_click',{link_url:href});
 }else if(href.includes('sailingsabbatical.com')){
  trackEvent('sabbatical_switch',{link_url:href});
 }
});


/* Enquiry form analytics */
document.querySelectorAll('[data-booking-form]').forEach(form=>{
 let started=false;
 form.addEventListener('focusin',()=>{
  if(started)return;
  started=true;
  trackEvent('form_start',{form_name:'booking_inquiry'});
 },{once:true});
 form.addEventListener('submit',()=>{
  trackEvent('booking_inquiry_submit',{form_name:'booking_inquiry',transport_type:'beacon'});
  if(form.querySelector('[data-waitlist]')?.checked)trackEvent('waitlist_signup',{form_name:'booking_inquiry',transport_type:'beacon'});
 });
});


/* AJAX enquiry submission */
document.querySelectorAll('[data-booking-form]').forEach(form=>{
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(form.dataset.submitting==='1')return;
  form.dataset.submitting='1';

  const btn=form.querySelector('.form-submit');
  const original=btn?.innerHTML||'';
  const en=document.documentElement.lang==='en';
  let status=form.querySelector('[data-form-status]');
  if(!status){
   status=document.createElement('p');
   status.className='form-status';
   status.setAttribute('data-form-status','');
   btn?.insertAdjacentElement('afterend',status);
  }

  if(btn){
   btn.disabled=true;
   btn.innerHTML=en?'Sending…':'Wird gesendet…';
  }
  status.textContent=en?'Sending your enquiry…':'Deine Anfrage wird gesendet…';
  status.classList.remove('is-error');

  try{
   const endpoint=form.action.replace('https://formsubmit.co/','https://formsubmit.co/ajax/');
   const data=new URLSearchParams();
   new FormData(form).forEach((value,key)=>data.append(key,String(value)));
   const response=await fetch(endpoint,{
    method:'POST',
    headers:{'Accept':'application/json','Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
    body:data.toString()
   });
   const result=await response.json().catch(()=>({}));
   if(!response.ok || result.success===false || result.success==='false' || result.error)throw new Error(result.message||'Submission failed');
   trackEvent('booking_inquiry_success',{form_name:'booking_inquiry'});

   const next=form.querySelector('input[name="_next"]')?.value;
   status.textContent=en?'Sent. Redirecting…':'Gesendet. Einen Moment…';
   if(next)location.href=next;
   else form.reset();
  }catch(err){
   trackEvent('booking_inquiry_error',{form_name:'booking_inquiry'});
   form.dataset.submitting='0';
   if(btn){
    btn.disabled=false;
    btn.innerHTML=original;
   }
   status.textContent=en?'That took too long or failed. Please try again.':'Das Senden hat zu lange gedauert oder ist fehlgeschlagen. Bitte erneut versuchen.';
   status.classList.add('is-error');
  }
 });
});

/* Dependable static 2027 route atlas: progressive enhancement, no external map libraries. */
(()=>{
 const host=document.querySelector('[data-route-map]');
 const svg=host?.querySelector('[data-season-atlas]');
 if(!host||!svg)return;
 const cards=[...document.querySelectorAll('[data-route-leg]')];
 const routes=[...svg.querySelectorAll('[data-route-segment]')];
 const markers=[...svg.querySelectorAll('[data-route-marker]')];
 const heading=document.querySelector('[data-route-map-title]');
 const bounds=routes.map(route=>{
  const coords=[...(route.getAttribute('d')||'').matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(m=>[Number(m[1]),Number(m[2])]);
  if(!coords.length)return null;
  return {xmin:Math.min(...coords.map(p=>p[0])),xmax:Math.max(...coords.map(p=>p[0])),ymin:Math.min(...coords.map(p=>p[1])),ymax:Math.max(...coords.map(p=>p[1]))};
 });
 const W=900,H=620,aspect=W/H;
 let active=0,view={x:0,y:0,w:W,h:H},scrollScheduled=false,drag=null;
 function setView(x,y,w){
  w=Math.min(W,Math.max(W/18,w));
  const h=w/aspect;
  x=Math.max(0,Math.min(W-w,x));
  y=Math.max(0,Math.min(H-h,y));
  view={x,y,w,h};
  svg.setAttribute('viewBox',[x,y,w,h].map(n=>n.toFixed(2)).join(' '));
  host.dataset.zoom=(W/w).toFixed(2);
  // Keep map labels and endpoint markers readable at every geographic scale.
  const phone=window.matchMedia('(max-width:650px)').matches;
  const labelBoost=phone?Math.min(2.15,820/Math.max(1,svg.getBoundingClientRect().width)):1;
  svg.dataset.labelBoost=labelBoost.toFixed(2);
  svg.style.setProperty('--atlas-label-size',(Math.max(.9,18*w/W)*labelBoost).toFixed(2)+'px');
  svg.querySelectorAll('.trip-route-marker circle').forEach(dot=>{
   if(!dot.dataset.baseRadius)dot.dataset.baseRadius=dot.getAttribute('r')||'4';
   dot.setAttribute('r',Math.max(.6,Number(dot.dataset.baseRadius)*2*w/W*(phone?1.5:1)).toFixed(2));
  });
  const waterLabels=svg.querySelector('.route-water-labels');
  if(waterLabels)waterLabels.style.display=W/w>2.5?'none':'';
  layoutPlaceLabels();
 }
 // Avoid overlapping place names in the whole-season view; prioritize local names on focused legs.
 function layoutPlaceLabels(){
  const labels=[...svg.querySelectorAll('.route-place-label')];
  const b=bounds[active];
  const mx=b?(b.xmin+b.xmax)/2:W/2,my=b?(b.ymin+b.ymax)/2:H/2;
  const factor=W/view.w,boost=Number(svg.dataset.labelBoost)||1;
  const landmarkPriority={'BVI':20,'Bermuda':20,'Ponta Delgada':19,'Gibraltar':18,'Palma':17,'Korfu':16,'Malta':15,'Kanaren':14,'Mindelo':13,'Catania':8,'Lefkada':7,'Cagliari':7,'Horta':6,'Lagos':5,'Kalamata':4,'Sint Maarten':3};
  const candidates=labels.map((node,index)=>{
   const px=Number(node.getAttribute('x')),py=Number(node.getAttribute('y'));
   const x=(px-view.x)*factor,y=(py-view.y)*factor;
   const width=Math.min(boost>1?300:205,(node.textContent||'').trim().length*10*boost+8);
   const rect={left:x-4,right:x+width+4,top:y-23*boost,bottom:y+7*boost};
   return {node,index,rect,priority:Math.hypot(px-mx,py-my),importance:landmarkPriority[node.textContent?.trim()]||0};
  }).sort((a,b)=>factor>=2?a.priority-b.priority:b.importance-a.importance||a.index-b.index);
  const occupied=[];
  for(const label of candidates){
   const r=label.rect;
   const onMap=r.right>3&&r.left<W-3&&r.bottom>4&&r.top<H-4;
   const overlap=occupied.some(o=>r.left<o.right+9&&r.right>o.left-9&&r.top<o.bottom+5&&r.bottom>o.top-5);
   const visible=onMap&&!overlap;
   label.node.style.display=visible?'':'none';
   if(visible)occupied.push(r);
  }
 }
 function zoomForLeg(index){
  const b=bounds[index];if(!b||![b.xmin,b.xmax,b.ymin,b.ymax].every(Number.isFinite))return;
  const cx=(b.xmin+b.xmax)/2,cy=(b.ymin+b.ymax)/2;
  const dx=b.xmax-b.xmin,dy=b.ymax-b.ymin;
  // Stage-adaptive framing: show the full passage plus enough coast/islands for context.
  const w=Math.max(62,dx*1.64+50,(dy*1.7+32)*aspect);
  setView(cx-w/2,cy-w/aspect/2,w);
 }
 function activate(index,focus){
  if(!Number.isInteger(index)||index<0||index>=bounds.length)return;
  active=index;
  routes.forEach((route,i)=>{route.classList.toggle('is-active',i===index);route.classList.toggle('is-muted',i!==index)});
  markers.forEach((marker,i)=>marker.classList.toggle('is-active',i===index));
  cards.forEach((card,i)=>card.classList.toggle('is-active',i===index));
  const title=cards[index]?.querySelector('h2')?.textContent?.trim();
  if(heading&&title)heading.textContent=title;
  if(focus)zoomForLeg(index);
 }
 cards.forEach((card,i)=>card.addEventListener('click',event=>{
  if(event.target?.closest?.('a,button,input,select,textarea'))return;
  activate(i,true);
  if(window.matchMedia('(max-width:980px)').matches){
   const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   host.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
  }
 }));
 routes.forEach((route,i)=>route.addEventListener('click',()=>{
  activate(i,true);
  if(cards[i])cards[i].scrollIntoView({behavior:'smooth',block:'center'});
 }));
 function zoom(factor){
  const w=view.w/factor;
  setView(view.x+view.w/2-w/2,view.y+view.h/2-w/aspect/2,w);
 }
 host.querySelector('[data-map-zoom-in]')?.addEventListener('click',()=>zoom(1.3));
 host.querySelector('[data-map-zoom-out]')?.addEventListener('click',()=>zoom(1/1.3));
 host.querySelector('[data-map-reset]')?.addEventListener('click',()=>setView(0,0,W));
 // Desktop pointer-drag for exploring the map. Touch remains available for page scrolling.
 svg.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||e.button!==0)return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,view:{...view}};
  svg.setPointerCapture?.(e.pointerId);
 });
 svg.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const width=svg.getBoundingClientRect().width||1;
  const height=svg.getBoundingClientRect().height||1;
  const dx=(e.clientX-drag.x)*drag.view.w/width;
  const dy=(e.clientY-drag.y)*drag.view.h/height;
  if(Math.abs(dx)+Math.abs(dy)<.1)return;
  setView(drag.view.x-dx,drag.view.y-dy,drag.view.w);
 });
 svg.addEventListener('pointerup',()=>{drag=null});
 svg.addEventListener('pointercancel',()=>{drag=null});
 function sync(){
  scrollScheduled=false;
  if(!cards.length||window.matchMedia('(max-width:980px)').matches)return;
  const lineY=window.innerHeight*.52;
  let next=0;
  cards.forEach((card,i)=>{if(card.getBoundingClientRect().top<=lineY)next=i});
  if(next!==active)activate(next,true);
 }
 window.addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(sync)}},{passive:true});
 window.addEventListener('resize',()=>setView(view.x,view.y,view.w),{passive:true});
 // Full-year overview is visible immediately; selecting a leg gradually reveals regional detail.
 activate(0,false);
 setView(0,0,W);
})();


/* Conditional cabin choice */
document.querySelectorAll('[data-booking-form]').forEach(form=>{
 const guests=form.querySelector('[data-guests]');
 const cabin=form.querySelector('[data-cabin]');
 const shared=cabin?.querySelector('[data-two-guests]');
 const help=form.querySelector('[data-cabin-help]');
 if(!guests||!cabin||!shared)return;
 const syncCabin=()=>{
  const two=guests.value==='2';
  shared.disabled=!two;
  if(!two && cabin.value===shared.value)cabin.value='';
  if(help)help.style.display=two?'none':'block';
 };
 guests.addEventListener('change',syncCabin);
 syncCabin();
});


/* My Elli chunked image loader */
(async()=>{
  const nodes=[...document.querySelectorAll('[data-myelli-exterior]')];
  if(!nodes.length)return;
  try{
    const urls=Array.from({length:9},(_,i)=>`/assets/myelli/exterior-${String(i+1).padStart(2,'0')}.b64?v=1`);
    const parts=await Promise.all(urls.map(async url=>{
      const r=await fetch(url,{cache:'force-cache'});
      if(!r.ok) throw new Error(`Failed to load ${url}`);
      return (await r.text()).trim();
    }));
    const src='data:image/jpeg;base64,'+parts.join('');
    nodes.forEach(img=>{
      img.addEventListener('load',()=>img.classList.add('myelli-loaded'),{once:true});
      img.src=src;
    });
  }catch(err){
    console.error('My Elli image load failed',err);
  }
})();


/* My Elli gallery image loader */
(async()=>{
  const chunkCounts={cockpit:8,salon:8,galley:8,cabin:3,bath:3};
  const groups=[...document.querySelectorAll('[data-myelli-image]')].reduce((acc,img)=>{
    const key=img.dataset.myelliImage;
    (acc[key] ||= []).push(img);
    return acc;
  },{});
  const base64ToBlobUrl=(parts)=>{
    const clean=parts.join('').replace(/\s+/g,'');
    const binary=atob(clean);
    const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));
  };
  await Promise.all(Object.entries(groups).map(async([key,nodes])=>{
    const count=chunkCounts[key];
    if(!count)return;
    try{
      const parts=await Promise.all(Array.from({length:count},async(_,i)=>{
        const url=`/assets/myelli/${key}-${String(i+1).padStart(2,'0')}.b64?v=3`;
        const r=await fetch(url,{cache:'no-cache'});
        if(!r.ok)throw new Error(`Failed to load ${url}: ${r.status}`);
        const text=(await r.text()).trim();
        if(!text)throw new Error(`Empty image chunk: ${url}`);
        return text;
      }));
      const src=base64ToBlobUrl(parts);
      nodes.forEach(img=>{
        img.onload=()=>img.classList.add('myelli-loaded');
        img.onerror=()=>console.error(`My Elli ${key} image decode failed`);
        img.src=src;
      });
    }catch(err){console.error(`My Elli ${key} image load failed`,err);}
  }));
})();

/* 2027 itinerary: multi-leg selection, quote, and query-string preselection */
(()=>{
 const de=(document.documentElement.lang||'de').toLowerCase().startsWith('de');
 const money=n=>new Intl.NumberFormat(de?'de-DE':'en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
 document.querySelectorAll('[data-booking-form]').forEach(form=>{
  const options=[...form.querySelectorAll('[data-trip-option]')];
  if(!options.length)return;
  const disclosure=form.querySelector('[data-trip-disclosure]');
  const chosen=form.querySelector('[data-selected-trips]');
  const estimate=form.querySelector('[data-price-quote]');
  const status=form.querySelector('[data-trip-summary]');
  const cabin=form.querySelector('[data-cabin]');
  const guests=form.querySelector('[data-guests]');
  const query=new URLSearchParams(location.search);
  const requested=(query.get('trips')||query.get('trip')||'').split(',').map(id=>id.trim());
  const matches=options.filter(item=>requested.includes(item.dataset.id));
  matches.forEach(item=>{item.checked=true;});
  if(!matches.length&&disclosure)disclosure.open=true;
  const refresh=()=>{
   const selected=options.filter(item=>item.checked);
   const amount=selected.reduce((sum,item)=>sum+Number(item.dataset.price||0),0);
   const privateCabin=/(Einzelkabine|Private cabin)/i.test(cabin?.value||'');
   const individual=Math.round(amount*(privateCabin?1.85:1));
   const sailingDays=selected.reduce((sum,item)=>{
    const match=item.parentElement?.querySelector('small')?.textContent?.match(/(\d+)\s*(?:Tage|days)/i);
    return sum+(match?Number(match[1]):0);
   },0);
   const onboardFund=Math.round(sailingDays*200/7/10)*10;
   const headCount=Number(guests?.value||0);
   const labels=selected.map(item=>item.parentElement?.querySelector('strong')?.textContent?.trim()||item.dataset.id);
   const indexes=selected.map(item=>options.indexOf(item));
   const contiguous=indexes.every((idx,i)=>i===0||idx===indexes[i-1]+1);
   const seaGap=indexes.includes(13)&&indexes.includes(14);
   chosen.value=labels.join(' | ');
   estimate.value=selected.length?(de?'Törnpreis ':'Trip fare ')+money(individual)+(de?' p.P. + geschätzte Bordkasse ':' pp + estimated shared fund ')+money(onboardFund):'';
   if(!selected.length){
    status.textContent=de?'Bitte mindestens einen Törn auswählen.':'Please select at least one trip.';
    status.dataset.empty='1';
    return;
   }
   status.dataset.empty='0';
   let info=(de?selected.length+' Törn(e) · Törnpreis ':'Selected '+selected.length+' trip(s) · trip fare ')+money(individual)+(de?' p.P.':' pp');
   info+=(de?' + ca. ':' + approx. ')+money(onboardFund)+(de?' Bordkasse p.P. · geschätzt gesamt ':' onboard fund pp · estimated total ')+money(individual+onboardFund)+(de?' p.P.':' pp');
   if(headCount===1||headCount===2)info+=(de?' · für '+headCount+' Person(en) ca. ':' · for '+headCount+' guest(s) approx. ')+money((individual+onboardFund)*headCount);
   if(selected.length>1)info+=' · '+(contiguous?(de?'durchgehender Aufenthalt möglich':'continuous stay possible'):(de?'Termine nicht durchgehend':'dates not consecutive'));
   if(seaGap)info+=' · '+(de?'16.–19.12. sind ein wetterabhängiger Ankunftspuffer':'16–19 Dec is a weather-dependent arrival buffer');
   if(selected.some(item=>item.dataset.fit==='offshore'))info+=' · '+(de?'Hochsee: keine planbaren Meetings':'Offshore: no dependable meeting times');
   status.textContent=info;
  };
  options.forEach(opt=>opt.addEventListener('change',refresh));
  cabin?.addEventListener('change',refresh);
  guests?.addEventListener('change',refresh);
  form.addEventListener('submit',event=>{
   if(options.some(opt=>opt.checked))return;
   event.preventDefault();
   event.stopImmediatePropagation();
   if(disclosure)disclosure.open=true;
   status.textContent=de?'Bitte wähle mindestens einen Törn aus.':'Please choose at least one trip.';
   status.dataset.empty='1';
   status.scrollIntoView({behavior:'smooth',block:'center'});
  },true);
  refresh();
 });
})();
