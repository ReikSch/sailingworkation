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
