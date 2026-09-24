let SITE, TREATMENTS, PACKAGES, LEGAL;
const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

async function loadData(){
  [SITE,TREATMENTS,PACKAGES,LEGAL] = await Promise.all([
    fetch('data/site.json').then(r=>r.json()),
    fetch('data/treatments.json').then(r=>r.json()),
    fetch('data/packages.json').then(r=>r.json()),
    fetch('data/legal.json').then(r=>r.json())
  ]);
  renderSite(); renderTreatments(); renderPrices(); renderPackages(); renderGallery(); setupQuiz(); setupBooking(); setupLegal();
}


function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
function treatmentOptions(t){return (t.options?.length?t.options:(t.durations||[]).map(duration=>({duration,price:null})))}
function money(v){return Number.isFinite(Number(v))?new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(v)):'Prijs op aanvraag'}
function renderSite(){
  const h=SITE.hero||{};
  if($('#hero-eyebrow')) $('#hero-eyebrow').textContent=h.eyebrow||SITE.tagline||'';
  if($('#hero-title')) $('#hero-title').textContent=h.title||SITE.tagline||SITE.name;
  if($('#hero-subtitle')) $('#hero-subtitle').textContent=h.subtitle||'';
  $$('[data-primary-cta]').forEach(x=>x.textContent=h.primaryCta||'Afspraak maken');
  if($('#secondary-cta')) $('#secondary-cta').textContent=h.secondaryCta||'Vind mijn massage';
  if($('#hero-review')) $('#hero-review').innerHTML=`<strong>${String(SITE.reviews.googleRating).replace('.',',')}/5</strong> Google · ${SITE.reviews.googleCount} reviews`;
  if($('#hero-image')) { $('#hero-image').src=SITE.images.hero; $('#hero-image').alt=`${SITE.owner.name} van ${SITE.name} in ${SITE.address.city}`; }
  if($('#intro-address')) $('#intro-address').textContent=`${SITE.address.street}, ${SITE.address.city}`;
  if($('#intro-hours')) $('#intro-hours').textContent=`Ma–za volgens website ${SITE.openingHours.monday}`;
  if($('#intro-phone')) { $('#intro-phone').textContent=SITE.phoneDisplay; $('#intro-phone').href=`tel:${SITE.phone}`; }
  const a=SITE.about||{};
  if($('#about-eyebrow')) $('#about-eyebrow').textContent=a.eyebrow||`Over ${SITE.name}`;
  if($('#about-title')) $('#about-title').textContent=a.title||'';
  if($('#about-intro')) $('#about-intro').textContent=a.intro||SITE.owner.intro||'';
  if($('#about-principles') && a.principles?.length) $('#about-principles').innerHTML=a.principles.slice(0,3).map((x,i)=>`<div><b>${String(i+1).padStart(2,'0')}</b><span><strong>${esc(x.title)}</strong><small>${esc(x.text)}</small></span></div>`).join('');
  if($('#about-image')) { $('#about-image').src=SITE.images.interior; $('#about-image').alt=`Interieur van ${SITE.name} in ${SITE.address.city}`; }
  if($('#review-score')) $('#review-score').textContent=String(SITE.reviews.googleRating).replace('.',',');
  if($('#review-count')) $('#review-count').textContent=`${SITE.reviews.googleCount} openbare Google-reviews op het moment van controle.`;
  if($('#contact-address')) $('#contact-address').innerHTML=`${esc(SITE.address.street)}<br>${esc(SITE.address.postalCode)} ${esc(SITE.address.city)}`;
  if($('#contact-phone')) { $('#contact-phone').textContent=SITE.phoneDisplay; $('#contact-phone').href=`tel:${SITE.phone}`; }
  if($('#contact-whatsapp')) $('#contact-whatsapp').href=`https://wa.me/${SITE.whatsapp}`;
  if($('#hours-list')) {
    const oh=SITE.openingHours, days=[['Ma',oh.monday],['Di',oh.tuesday],['Wo',oh.wednesday],['Do',oh.thursday],['Vr',oh.friday],['Za',oh.saturday],['Zo',oh.sunday]];
    const sameWeek=days.slice(0,6).every(([,v])=>v===days[0][1]);
    $('#hours-list').innerHTML=sameWeek?`<div><dt>Ma–za</dt><dd>${esc(days[0][1])} <small>volgens eigen website</small></dd></div><div><dt>Zondag</dt><dd>${esc(days[6][1])}</dd></div>`:days.map(([d,v])=>`<div><dt>${d}</dt><dd>${esc(v)}</dd></div>`).join('');
  }
  if($('#hours-conflict')) $('#hours-conflict').textContent=`Let op: ${SITE.hoursConflictNote}`;
  if($('#review-read')) $('#review-read').href=SITE.reviews.googleUrl;
  if($('#review-write')) $('#review-write').href=SITE.reviews.writeGoogleUrl;
  if($('#footer-street')) $('#footer-street').textContent=SITE.address.street;
  if($('#footer-city')) $('#footer-city').textContent=`${SITE.address.postalCode} ${SITE.address.city}`;
  if($('#footer-phone')) { $('#footer-phone').textContent=SITE.phoneDisplay; $('#footer-phone').href=`tel:${SITE.phone}`; }
  const social=$('#social-links'); const socials=Object.entries(SITE.socials||{}).filter(([,url])=>url);
  if(social && socials.length){social.hidden=false;social.innerHTML=socials.map(([name,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(name[0].toUpperCase()+name.slice(1))}</a>`).join('');}
}

function renderPackages(){
  const gift=(PACKAGES||[]).find(x=>x.id==='giftcard')||(PACKAGES||[])[0]; if(!gift)return;
  if($('#gift-description')) $('#gift-description').textContent=gift.description||'';
  if($('#gift-price')) $('#gift-price').textContent=gift.price==null?'Op aanvraag':money(gift.price);
  if($('#gift-validity')) $('#gift-validity').textContent=gift.validity||'Op aanvraag';
  if($('#gift-cta')) { const msg=`Hallo ${SITE.name}, ik wil graag informatie over een cadeaubon.`; $('#gift-cta').href=`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`; $('#gift-cta').textContent=gift.cta||'Vraag via WhatsApp'; }
}

function renderGallery(){
  const section=$('#galerij'), root=$('#gallery-grid'), items=(SITE.gallery||[]).filter(x=>x.src);
  if(!section||!root||!items.length)return; section.hidden=false;
  root.innerHTML=items.slice(0,6).map(x=>`<figure><img src="${esc(x.src)}" alt="${esc(x.alt||'Foto van Thai Smile')}" loading="lazy"><figcaption>${esc(x.caption||'')}</figcaption></figure>`).join('');
}

function renderTreatments(){
  const root=$('#treatment-grid');
  root.innerHTML=TREATMENTS.filter(t=>t.active).map(t=>`
    <article class="treatment-card">
      <span class="type">${t.type}</span>
      <h3>${t.name}</h3>
      <p>${t.short}</p>
      <div class="treatment-meta"><span>${t.intensity}</span><span>${t.oil}</span><span>${treatmentOptions(t)[0].duration}–${treatmentOptions(t).at(-1).duration} min</span></div>
      <div class="treatment-actions">
        <button class="text-link bare" data-treatment="${t.id}">Bekijk behandeling</button>
        <button class="button button-ghost compact" data-book-treatment="${t.id}">Afspraak</button>
      </div>
    </article>`).join('');
  $$('.bare').forEach(b=>{b.style.background='none';b.style.border='0';b.style.padding='0';b.style.cursor='pointer'});
  $$('[data-treatment]').forEach(btn=>btn.addEventListener('click',()=>openTreatment(btn.dataset.treatment)));
  $$('[data-book-treatment]').forEach(btn=>btn.addEventListener('click',()=>openBooking(btn.dataset.bookTreatment)));
}

function renderPrices(){
  $('#price-list').innerHTML=TREATMENTS.filter(t=>t.active).map(t=>{
    const opts=treatmentOptions(t);
    const detail=opts.map(o=>`${o.duration} min · ${o.price==null?'prijs controleren':money(o.price)}`).join('<br>');
    return `<div class="price-row"><strong>${t.name}</strong><span>${detail}</span></div>`;
  }).join('');
}

function openTreatment(id){
  const t=TREATMENTS.find(x=>x.id===id); if(!t)return;
  $('#treatment-content').innerHTML=`
    <span class="eyebrow">${t.type}</span><h2 id="treatment-title">${t.name}</h2><p class="modal-intro">${t.long}</p>
    <div class="modal-details"><div><small>Intensiteit</small><strong>${t.intensity}</strong></div><div><small>Olie</small><strong>${t.oil}</strong></div><div><small>Duur</small><strong>${treatmentOptions(t)[0].duration}–${treatmentOptions(t).at(-1).duration} min</strong></div></div>
    <div class="modal-price-list">${treatmentOptions(t).map(o=>`<div><span>${o.duration} minuten</span><strong>${o.price==null?'Prijs op aanvraag':money(o.price)}</strong></div>`).join('')}</div>
    <button class="button button-primary" style="margin-top:24px" data-modal-book="${t.id}">Afspraak aanvragen</button>`;
  $('[data-modal-book]').addEventListener('click',()=>{closeDialog($('#treatment-modal'));openBooking(t.id)});
  openDialog($('#treatment-modal'));
}

const questions=[
  {q:'Waar heb je vandaag vooral behoefte aan?',a:[['Ontspannen','relax',3],['Spieren stevig aanpakken','deep',3],['Traditionele technieken','thai',3],['Gerichte aandacht bovenlichaam','neck',3]]},
  {q:'Waar wil je vooral aandacht voor?',a:[['Hele lichaam','thai',2],['Nek, rug & schouders','neck',3],['Voeten & onderbenen','foot',3],['Rust en warmte','hotstone',3]]},
  {q:'Hoe stevig mag de massage zijn?',a:[['Zacht','relax',3],['Gemiddeld','aroma',2],['Stevig','deep',3],['Geen voorkeur','thai',1]]},
  {q:'Heb je voorkeur voor olie?',a:[['Met olie','aroma',3],['Zonder olie','thai',3],['Maakt niet uit','neck',1],['Liever warmte','hotstone',3]]},
  {q:'Wat past het beste bij vandaag?',a:[['Veel zitten','neck',2],['Sport / fysieke belasting','deep',2],['Stress / behoefte aan rust','relax',3],['Iets traditioneels ervaren','herbal',3]]}
];
let qi=0,scores={};
function setupQuiz(){qi=0;scores={};renderQuestion()}
function renderQuestion(){
  const root=$('#quiz-card'); const item=questions[qi];
  root.innerHTML=`<div class="quiz-progress"><span>Vraag ${qi+1} van 5</span><div class="progress-line"><i style="width:${((qi+1)/5)*100}%"></i></div></div><h3>${item.q}</h3><div class="answer-grid">${item.a.map((x,i)=>`<button class="answer-button" data-answer="${i}">${x[0]}</button>`).join('')}</div>`;
  $$('[data-answer]',root).forEach(b=>b.addEventListener('click',()=>{const a=item.a[+b.dataset.answer];scores[a[1]]=(scores[a[1]]||0)+a[2];qi++;qi<5?renderQuestion():renderResult()}));
}
function renderResult(){
  const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]); const id=ranked[0]?.[0]||'relax'; const t=TREATMENTS.find(x=>x.id===id) || TREATMENTS[0];
  $('#quiz-card').innerHTML=`<div class="quiz-result"><span class="eyebrow">Jouw beste match</span><div class="result-name">${t.name}</div><p class="result-reason">Op basis van je antwoorden sluit deze behandeling het beste aan. De masseuse kan de intensiteit altijd verder afstemmen op wat jij prettig vindt.</p><div class="result-tags"><span>${t.type}</span><span>${t.intensity}</span><span>${t.oil}</span></div><div class="result-actions"><button class="button button-ghost" id="result-view">Bekijk behandeling</button><button class="button button-primary" id="result-book">Afspraak aanvragen</button></div><button class="restart" id="restart-quiz">Opnieuw beginnen</button></div>`;
  $('#result-view').onclick=()=>openTreatment(t.id); $('#result-book').onclick=()=>openBooking(t.id); $('#restart-quiz').onclick=setupQuiz;
}

function setupBooking(){
  const sel=$('#booking-treatment'); sel.innerHTML='<option value="">Kies behandeling</option>'+TREATMENTS.filter(t=>t.active).map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  sel.addEventListener('change',updateDuration); updateDuration();
  $$('[data-book]').forEach(b=>b.addEventListener('click',()=>openBooking()));
  $('#booking-form').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const t=TREATMENTS.find(x=>x.id===fd.get('treatment'));const opt=t? treatmentOptions(t).find(o=>String(o.duration)===String(fd.get('duration'))):null;const msg=[`Hallo Thai Smile, ik wil graag een afspraak aanvragen.`,``,`Behandeling: ${t?.name||''}`,`Duur: ${fd.get('duration')} minuten`,`Prijs: ${opt?.price==null?'op aanvraag':money(opt.price)}`,`Datum: ${fd.get('date')}`,`Tijd: ${fd.get('time')}`,`Naam: ${fd.get('name')}`,`Opmerking: ${fd.get('note')||'-'}`,``,`Is dit tijdstip nog beschikbaar? Ik hoor graag of jullie de afspraak kunnen bevestigen.`].join('\n');window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`,'_blank','noopener')});
}
function updateDuration(){const id=$('#booking-treatment').value;const t=TREATMENTS?.find(x=>x.id===id);$('#booking-duration').innerHTML=(t?treatmentOptions(t).map(o=>o.duration):[30,60,90]).map(d=>`<option value="${d}">${d} minuten</option>`).join('')}
function openBooking(id){if(id){$('#booking-treatment').value=id;updateDuration()}else{$('#booking-treatment').value='';updateDuration()}openDialog($('#booking-modal'))}

function setupLegal(){ $$('[data-legal]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.legal;const d=LEGAL[key];let html=`<h2>${d.title}</h2>`;if(d.sections)html+=d.sections.map(s=>`<section class="legal-section"><h3>${s.heading}</h3><p>${s.text}</p></section>`).join('');else html+=`<p>${d.text}</p>`;$('#legal-content').innerHTML=html;openDialog($('#legal-modal'))})) }
function openDialog(d){d.showModal();document.body.classList.add('modal-open')}
function closeDialog(d){d.close();document.body.classList.remove('modal-open')}
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.closest('dialog'))));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)closeDialog(d)}));

const mt=$('.menu-toggle'),mm=$('.mobile-menu');
mt.addEventListener('click',()=>{const open=mm.classList.toggle('open');mt.setAttribute('aria-expanded',open);mm.setAttribute('aria-hidden',!open)});
$$('.mobile-menu a,.mobile-menu button').forEach(x=>x.addEventListener('click',()=>{mm.classList.remove('open');mt.setAttribute('aria-expanded','false');mm.setAttribute('aria-hidden','true')}));

window.addEventListener('scroll',()=>{$('.sticky-book').classList.toggle('visible',scrollY>520)} ,{passive:true});
$('#load-map').addEventListener('click',()=>{$('#map-card').innerHTML=`<iframe title="Kaart Thai Smile Delft" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(`${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`)}&output=embed"></iframe>`});

const bookingDate = $('#booking-date');
if (bookingDate) {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  bookingDate.min = today.toISOString().slice(0,10);
}

loadData().catch(err=>{console.error(err);document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;bottom:10px;left:10px;background:#fff;padding:10px;border:1px solid #ddd;z-index:99">Inhoud kon niet worden geladen.</div>')});
