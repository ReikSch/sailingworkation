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
   if(!response.ok || result.success===false)throw new Error(result.message||'Submission failed');

   const next=form.querySelector('input[name="_next"]')?.value;
   status.textContent=en?'Sent. Redirecting…':'Gesendet. Einen Moment…';
   if(next)location.href=next;
   else form.reset();
  }catch(err){
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

/* Interactive 2027/28 season route map */
(function(){
 const el=document.querySelector('[data-route-map]');
 if(!el||typeof d3==='undefined'||typeof topojson==='undefined')return;

 const en=document.documentElement.lang==='en';
 const points={
  bvi:[-64.62,18.43],
  azores:[-28.63,38.54],
  gibraltar:[-5.35,36.14],
  albania:[19.49,40.47],
  greece:[20.71,38.83],
  turkey:[27.43,37.03],
  canaries:[-16.63,28.29],
  capeVerde:[-23.61,15.12]
 };
 const legs=[
  {name:en?'BVI → Azores → Mediterranean':'BVI → Azoren → Mittelmeer',coords:[points.bvi,points.azores,points.gibraltar]},
  {name:en?'Gibraltar → Albania · Greece · Turkey':'Gibraltar → Albanien · Griechenland · Türkei',coords:[points.gibraltar,points.albania,points.greece,points.turkey]},
  {name:en?'Eastern Mediterranean → Gibraltar':'Östliches Mittelmeer → Gibraltar',coords:[points.turkey,points.greece,points.albania,points.gibraltar]},
  {name:en?'Gibraltar → Canaries → Cape Verde → BVI':'Gibraltar → Kanaren → Kap Verden → BVI',coords:[points.gibraltar,points.canaries,points.capeVerde,points.bvi]},
  {name:'British Virgin Islands',coords:[[-64.78,18.52],[-64.63,18.44],[-64.44,18.43],[-64.57,18.38],[-64.78,18.52]]}
 ];
 const labels=[
  ['BVI',points.bvi],['Azores / Azoren',points.azores],['Gibraltar',points.gibraltar],
  ['Albania / Albanien',points.albania],['Greece / Griechenland',points.greece],
  ['Turkey / Türkei',points.turkey],['Canaries / Kanaren',points.canaries],
  ['Cape Verde / Kap Verden',points.capeVerde]
 ];
 const cards=[...document.querySelectorAll('[data-route-leg]')];
 const title=document.querySelector('[data-route-map-title]');
 const width=900,height=620;
 const svg=d3.select(el).append('svg')
  .attr('viewBox',`0 0 ${width} ${height}`)
  .attr('role','img')
  .attr('aria-label',en?'Interactive season route map 2027/28':'Interaktive Saisonroutenkarte 2027/28');

 const viewport=svg.append('g').attr('class','route-map-viewport');
 const projection=d3.geoMercator()
  .center([-18,29])
  .scale(265)
  .translate([width/2,height/2+20]);
 const geoPath=d3.geoPath(projection);

 const ocean=viewport.append('rect').attr('class','route-ocean').attr('x',0).attr('y',0).attr('width',width).attr('height',height);
 const landLayer=viewport.append('g').attr('class','route-land-layer');
 const routeLayer=viewport.append('g').attr('class','route-lines');
 const markerLayer=viewport.append('g').attr('class','route-markers');

 const line=d3.line()
  .x(d=>projection(d)[0])
  .y(d=>projection(d)[1])
  .curve(d3.curveCatmullRom.alpha(.35));

 const routePaths=routeLayer.selectAll('path')
  .data(legs)
  .join('path')
  .attr('class',(d,i)=>`trip-route-line trip-route-line-${i}`)
  .attr('d',d=>line(d.coords))
  .attr('vector-effect','non-scaling-stroke');

 const markerGroups=markerLayer.selectAll('g')
  .data(labels)
  .join('g')
  .attr('class','trip-route-marker')
  .attr('transform',d=>`translate(${projection(d[1])[0]},${projection(d[1])[1]})`);
 markerGroups.append('circle').attr('r',4.8).attr('vector-effect','non-scaling-stroke');
 markerGroups.append('text').attr('x',8).attr('y',-8).text(d=>d[0]);

 const activeStops=markerGroups;

 function activate(idx){
  cards.forEach((card,i)=>card.classList.toggle('is-active',i===idx));
  routePaths.classed('is-active',(d,i)=>i===idx).classed('is-muted',(d,i)=>i!==idx);
  const activeCoords=legs[idx]?.coords||[];
  activeStops.classed('is-active',d=>activeCoords.some(p=>Math.abs(p[0]-d[1][0])<.8&&Math.abs(p[1]-d[1][1])<.8));
  if(title)title.textContent=legs[idx]?.name||'';
 }

 function drawLand(world){
  try{
   const countries=topojson.feature(world,world.objects.countries);
   landLayer.selectAll('path').data(countries.features).join('path')
    .attr('class','route-country')
    .attr('d',geoPath);
  }catch(err){console.error('Route land drawing failed',err);}
 }

 d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
  .then(drawLand)
  .catch(err=>console.error('Route map geography load failed',err));

 const zoom=d3.zoom()
  .scaleExtent([1,5])
  .translateExtent([[0,0],[width,height]])
  .extent([[0,0],[width,height]])
  .on('zoom',event=>viewport.attr('transform',event.transform));
 svg.call(zoom).on('dblclick.zoom',null);

 const zoomIn=el.querySelector('[data-map-zoom-in]');
 const zoomOut=el.querySelector('[data-map-zoom-out]');
 const reset=el.querySelector('[data-map-reset]');
 zoomIn?.addEventListener('click',()=>svg.transition().duration(220).call(zoom.scaleBy,1.35));
 zoomOut?.addEventListener('click',()=>svg.transition().duration(220).call(zoom.scaleBy,1/1.35));
 reset?.addEventListener('click',()=>svg.transition().duration(260).call(zoom.transform,d3.zoomIdentity));

 cards.forEach((card,i)=>card.addEventListener('click',()=>activate(i)));

 let current=-1,scheduled=false;
 function sync(){
  scheduled=false;
  if(!cards.length)return;
  const lineY=innerHeight*.5;
  let idx=0;
  cards.forEach((card,i)=>{
   if(card.getBoundingClientRect().top<=lineY)idx=i;
  });
  if(idx!==current){current=idx;activate(idx);}
 }
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(sync)}},{passive:true});
 addEventListener('resize',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(sync)}},{passive:true});
 activate(0);
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
  const chunkCounts={cockpit:8,salon:8,galley:8,cabin:10,bath:10};
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
        const url=`/assets/myelli/${key}-${String(i+1).padStart(2,'0')}.b64?v=2`;
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
