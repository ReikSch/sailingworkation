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

/* Interactive 2027 season route map */
(function(){
 const el=document.querySelector('[data-route-map]');
 if(!el||typeof d3==='undefined'||typeof topojson==='undefined')return;

 const en=document.documentElement.lang==='en';
 const points={
  bvi:[-64.62,18.43],
  azores:[-28.63,38.54],
  gibraltar:[-5.35,36.14],
  palermo:[13.37,38.12],
  messina:[15.56,38.19],
  crotone:[17.13,39.08],
  otranto:[18.49,40.15],
  vlore:[19.49,40.45],
  sarande:[20.00,39.87],
  corfu:[19.92,39.62],
  paxos:[20.16,39.20],
  lefkada:[20.71,38.83],
  ithaca:[20.72,38.37],
  kefalonia:[20.55,38.18],
  zakynthos:[20.90,37.79],
  pylos:[21.70,36.91],
  cagliari:[9.12,39.22],
  mallorca:[2.65,39.35],
  malta:[14.51,35.90],
  trapani:[12.51,38.02],
  canaries:[-16.63,28.29],
  capeVerde:[-23.61,15.12],
  mallorcaPort:[2.64,39.55],
  cagliariPort:[9.10,39.20],
  palermoPort:[13.36,38.14],
  messinaSea:[15.58,38.16],
  crotoneSea:[17.16,39.08],
  otrantoSea:[18.50,40.15],
  vloreSea:[19.42,40.45],
  sarandeSea:[19.96,39.86],
  corfuSea:[19.90,39.62],
  paxosSea:[20.14,39.19],
  lefkadaSea:[20.72,38.82],
  ithacaEast:[20.75,38.37],
  kefaloniaEast:[20.69,38.24],
  kefaloniaSouth:[20.58,37.98],
  zakynthosEast:[20.92,37.78],
  zakynthosSouth:[20.86,37.65],
  pylosSea:[21.69,36.90],
  maltaSea:[14.55,35.90],
  trapaniSea:[12.44,38.04],
  gibraltarSea:[-5.30,36.08],
  mallorcaSouth:[2.63,39.46],
  cagliariSouth:[9.08,39.13],
  palermoNorth:[13.34,38.20],
  messinaNorth:[15.56,38.25],
  crotoneEast:[17.20,39.08],
  otrantoEast:[18.56,40.14],
  vloreWest:[19.34,40.44],
  sarandeWest:[19.90,39.86],
  corfuWest:[19.82,39.62],
  paxosWest:[20.08,39.20],
  lefkadaWest:[20.58,38.82],
  ithacaWest:[20.60,38.38],
  kefaloniaEastSea:[20.72,38.22],
  kefaloniaSouthSea:[20.62,37.95],
  zakynthosEastSea:[20.96,37.79],
  zakynthosSouthSea:[20.88,37.61],
  pylosWest:[21.60,36.91],
  maltaWest:[14.42,35.88],
  trapaniWest:[12.42,38.03]
 };

 const legs=[
  {name:en?"Caribbean Start & Bermuda":"Karibikstart & Bermuda",zoomBoost:0.95,labels:["bvi","sxm","bermuda"],coords:[[-64.62,18.42],[-63.1,18.03],[-63.3,22],[-63.7,27],[-64.2,30],[-64.68,32.38]]},
  {name:en?"Eastbound Atlantic & Azores":"Atlantiküberquerung Ost & Azoren",zoomBoost:0.95,labels:["bermuda","horta","pdl"],coords:[[-64.68,32.38],[-58,33.5],[-51,35.5],[-43,37.5],[-35,38.4],[-28.63,38.53],[-25.67,37.74]]},
  {name:en?"Azores to the Algarve":"Azoren bis zur Algarve",zoomBoost:0.95,labels:["pdl","lagos"],coords:[[-25.67,37.74],[-20,37.3],[-15,36.8],[-10,36.7],[-8.67,37.1]]},
  {name:en?"Algarve, Andalusia & Balearics":"Algarve, Andalusien & Balearen",zoomBoost:0.95,labels:["lagos","gib","palma"],coords:[[-8.67,37.1],[-5.35,36.14],[-4.43,36.72],[-1.8,36.8],[0.5,38],[1.42,38.91],[2.65,39.57]]},
  {name:en?"Mallorca, Menorca & Sardinia":"Mallorca, Menorca & Sardinien",zoomBoost:0.95,labels:["palma","cagliari"],coords:[[2.65,39.57],[4.1,39.9],[6,40.2],[8.2,40],[9.12,39.22]]},
  {name:en?"Sardinia & Sicily's Islands":"Sardinien & Siziliens Inselwelten",zoomBoost:0.95,labels:["cagliari","catania"],coords:[[9.12,39.22],[10.8,38.6],[12.4,38],[13.36,38.12],[14.8,38.5],[15.09,37.5]]},
  {name:en?"Southern Italy, Albania & Corfu":"Süditalien, Albanien & Korfu",zoomBoost:0.95,labels:["catania","corfu"],coords:[[15.09,37.5],[16,38],[17.1,39],[18.5,40.1],[19.3,39.9],[19.92,39.62]]},
  {name:en?"Ionian Islands & Slow Sailing":"Ionische Inseln & Slow Sailing",zoomBoost:1.35,labels:["corfu","lefkada"],coords:[[19.92,39.62],[20.1,39.2],[20.58,38.82],[20.6,38.37],[20.62,37.95],[20.58,38.82]]},
  {name:en?"Ionian Sea & Peloponnese":"Ionisches Meer & Peloponnes",zoomBoost:1.35,labels:["lefkada","kalamata"],coords:[[20.58,38.82],[20.8,37.75],[21.7,36.95],[21.8,36.8],[22.11,37.04]]},
  {name:en?"Peloponnese, Gozo & Malta":"Peloponnes, Gozo & Malta",zoomBoost:0.95,labels:["kalamata","malta"],coords:[[22.11,37.04],[20.2,36.4],[18.4,36],[16.2,36],[14.3,36.06],[14.52,35.9]]},
  {name:en?"Malta, Sicily & Mallorca":"Malta, Sizilien & Mallorca",zoomBoost:0.95,labels:["malta","palma"],coords:[[14.52,35.9],[12.8,37.7],[9.1,39.2],[6,39],[2.65,39.57]]},
  {name:en?"Balearics, Gibraltar & Canaries":"Balearen, Gibraltar & Kanaren",zoomBoost:0.95,labels:["palma","gib","canaries"],coords:[[2.65,39.57],[1.42,38.91],[-0.5,37],[-5.35,36.14],[-9.5,34],[-12,31],[-15.43,28.12]]},
  {name:en?"Canaries & Cape Verde":"Kanaren & Kap Verde",zoomBoost:0.95,labels:["canaries","mindelo"],coords:[[-15.43,28.12],[-17.3,25.6],[-20,21],[-24.99,16.89]]},
  {name:en?"Westbound Atlantic Crossing":"Atlantiküberquerung West",zoomBoost:0.95,labels:["mindelo","bvi"],coords:[[-24.99,16.89],[-32,14.2],[-42,14.5],[-51,15.2],[-60,17],[-64.62,18.42]]},
  {name:en?"BVI Christmas & New Year":"BVI Weihnachten & Silvester",zoomBoost:1.5,labels:["bvi"],coords:[[-64.62,18.42],[-64.44,18.44],[-64.35,18.52],[-64.73,18.45],[-64.6,18.72],[-64.62,18.42]]}
 ];
 const labels=[
  {key:"bvi",name:en?"BVI":"BVI",coord:[-64.62,18.42]},
  {key:"sxm",name:en?"Sint Maarten":"Sint Maarten",coord:[-63.1,18.03]},
  {key:"bermuda",name:en?"Bermuda":"Bermuda",coord:[-64.68,32.38]},
  {key:"horta",name:en?"Horta":"Horta",coord:[-28.63,38.53]},
  {key:"pdl",name:en?"Ponta Delgada":"Ponta Delgada",coord:[-25.67,37.74]},
  {key:"lagos",name:en?"Lagos":"Lagos",coord:[-8.67,37.1]},
  {key:"gib",name:en?"Gibraltar":"Gibraltar",coord:[-5.35,36.14]},
  {key:"palma",name:en?"Palma":"Palma",coord:[2.65,39.57]},
  {key:"cagliari",name:en?"Cagliari":"Cagliari",coord:[9.12,39.22]},
  {key:"catania",name:en?"Catania":"Catania",coord:[15.09,37.5]},
  {key:"corfu",name:en?"Corfu":"Korfu",coord:[19.92,39.62]},
  {key:"lefkada",name:en?"Lefkada":"Lefkada",coord:[20.58,38.82]},
  {key:"kalamata",name:en?"Kalamata":"Kalamata",coord:[22.11,37.04]},
  {key:"malta",name:en?"Malta":"Malta",coord:[14.52,35.9]},
  {key:"canaries",name:en?"Canaries":"Kanaren",coord:[-15.43,28.12]},
  {key:"mindelo",name:en?"Mindelo":"Mindelo",coord:[-24.99,16.89]}
 ];
 const cards=[...document.querySelectorAll('[data-route-leg]')];
 const title=document.querySelector('[data-route-map-title]');
 const width=900,height=620;
 const svg=d3.select(el).append('svg')
  .attr('viewBox',`0 0 ${width} ${height}`)
  .attr('role','img')
  .attr('aria-label',en?'Interactive season route map 2027':'Interaktive Saisonroutenkarte 2027');

 const viewport=svg.append('g').attr('class','route-map-viewport');
 const projection=d3.geoMercator()
  .center([-18,29])
  .scale(265)
  .translate([width/2,height/2+20]);
 const geoPath=d3.geoPath(projection);

 viewport.append('rect').attr('class','route-ocean').attr('x',0).attr('y',0).attr('width',width).attr('height',height);
 const landLayer=viewport.append('g').attr('class','route-land-layer');
 const routeLayer=viewport.append('g').attr('class','route-lines');
 const markerLayer=viewport.append('g').attr('class','route-markers');

 const line=d3.line()
  .x(d=>projection(d)[0])
  .y(d=>projection(d)[1])
  .curve(d3.curveLinear);

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
  .attr('data-stop',d=>d.key)
  .attr('transform',d=>`translate(${projection(d.coord)[0]},${projection(d.coord)[1]})`);
 markerGroups.append('circle').attr('r',4.6).attr('vector-effect','non-scaling-stroke');
 markerGroups.append('text').attr('x',8).attr('y',-7).text(d=>d.name);

 const activeStops=markerGroups;

 const zoom=d3.zoom()
  .scaleExtent([.5,40])
  .translateExtent([[-width*2,-height*2],[width*3,height*3]])
  .extent([[0,0],[width,height]])
  .on('zoom',event=>{
   viewport.attr('transform',event.transform);
   const inv=1/event.transform.k;
   markerGroups.attr('transform',d=>`translate(${projection(d.coord)[0]},${projection(d.coord)[1]}) scale(${inv})`);
  });
 svg.call(zoom).on('dblclick.zoom',null);

 function fitLeg(idx,animated=true){
  const coords=legs[idx]?.coords||[];
  if(!coords.length)return;
  const projected=coords.map(projection).filter(Boolean);
  const xs=projected.map(p=>p[0]),ys=projected.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const dx=Math.max(20,x1-x0),dy=Math.max(20,y1-y0);
  const pad=idx===2||idx===3?54:86;
  const baseK=Math.min((width-pad*2)/dx,(height-pad*2)/dy);
  const k=Math.max(.52,Math.min(10.5,baseK*(legs[idx]?.zoomBoost||1)));
  const cx=(x0+x1)/2,cy=(y0+y1)/2;
  const transform=d3.zoomIdentity.translate(width/2-k*cx,height/2-k*cy).scale(k);
  const target=animated?svg.transition().duration(650).ease(d3.easeCubicOut):svg;
  target.call(zoom.transform,transform);
 }

 function activate(idx,animated=true){
  cards.forEach((card,i)=>card.classList.toggle('is-active',i===idx));
  routePaths.classed('is-active',(d,i)=>i===idx).classed('is-muted',(d,i)=>i!==idx);
  const visible=new Set(legs[idx]?.labels||[]);
  activeStops
   .classed('is-active',d=>visible.has(d.key))
   .classed('is-hidden',d=>!visible.has(d.key));
  if(title)title.textContent=legs[idx]?.name||'';
  fitLeg(idx,animated);
 }

 function drawLand(world){
  try{
   const countries=topojson.feature(world,world.objects.countries);
   landLayer.selectAll('path').data(countries.features).join('path')
    .attr('class','route-country')
    .attr('d',geoPath);
  }catch(err){console.error('Route land drawing failed',err);}
 }

 d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json')
  .then(drawLand)
  .catch(err=>console.error('Route map geography load failed',err));

 const zoomIn=el.querySelector('[data-map-zoom-in]');
 const zoomOut=el.querySelector('[data-map-zoom-out]');
 const reset=el.querySelector('[data-map-reset]');
 zoomIn?.addEventListener('click',()=>svg.transition().duration(220).call(zoom.scaleBy,1.5));
 zoomOut?.addEventListener('click',()=>svg.transition().duration(220).call(zoom.scaleBy,1/1.5));
 reset?.addEventListener('click',()=>fitLeg(Math.max(0,current),true));

 cards.forEach((card,i)=>card.addEventListener('click',()=>{current=i;activate(i,true)}));

 let current=0,scheduled=false;
 function sync(){
  scheduled=false;
  if(!cards.length)return;
  const lineY=innerHeight*.5;
  let idx=0;
  cards.forEach((card,i)=>{
   if(card.getBoundingClientRect().top<=lineY)idx=i;
  });
  if(idx!==current){current=idx;activate(idx,true);}
 }
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(sync)}},{passive:true});
 addEventListener('resize',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{sync();fitLeg(current,false)})}},{passive:true});
 activate(0,false);
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
  const requested=new URLSearchParams(location.search).get('trip');
  const optionFromUrl=options.find(item=>item.dataset.id===requested);
  if(optionFromUrl)optionFromUrl.checked=true;
  else if(disclosure)disclosure.open=true;
  const refresh=()=>{
   const selected=options.filter(item=>item.checked);
   const amount=selected.reduce((sum,item)=>sum+Number(item.dataset.price||0),0);
   const privateCabin=/(Einzelkabine|Private cabin)/i.test(cabin?.value||'');
   const individual=Math.round(amount*(privateCabin?1.85:1));
   const headCount=Number(guests?.value||0);
   const labels=selected.map(item=>item.parentElement?.querySelector('strong')?.textContent?.trim()||item.dataset.id);
   const indexes=selected.map(item=>options.indexOf(item));
   const contiguous=indexes.every((idx,i)=>i===0||idx===indexes[i-1]+1);
   const seaGap=indexes.includes(13)&&indexes.includes(14);
   chosen.value=labels.join(' | ');
   estimate.value=selected.length?money(individual)+(de?' pro Person (Richtwert)':' per person (estimate)'):'';
   if(!selected.length){
    status.textContent=de?'Bitte mindestens einen Törn auswählen.':'Please select at least one trip.';
    status.dataset.empty='1';
    return;
   }
   status.dataset.empty='0';
   let info=(de?selected.length+' Törn(e) ausgewählt · Richtpreis ':'Selected '+selected.length+' trip(s) · indicative fare ')+money(individual)+(de?' pro Person':' per person');
   if(headCount===1||headCount===2)info+=(de?' · zusammen ':' · combined ')+money(individual*headCount);
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
