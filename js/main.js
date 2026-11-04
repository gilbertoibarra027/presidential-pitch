/* Presidential Aviation · concept v2 */
(function(){
  'use strict';
  var html=document.documentElement,
      RM=html.classList.contains('rm'),
      $=function(s,c){return (c||document).querySelector(s);},
      $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));},
      isMobile=function(){return window.innerWidth<=768;};

  /* split statement words */
  var st=$('.statement');
  if(st){st.innerHTML=st.textContent.trim().split(/\s+/).map(function(w){return '<span class="w">'+w+'</span>';}).join(' ');}

  /* globe + cycling city pill (shared by every mode) */
  var CITIES=[['Nassau',25.05,-77.35],['New York',40.71,-74.0],['Aspen',39.19,-106.82],['Los Angeles',34.05,-118.24],['Cabo San Lucas',22.89,-109.91],['St. Barts',17.90,-62.85]];
  var canvas=$('.globe'),globe=null,cityEl=$('.route__city'),ci=0;
  if(canvas&&window.Globe){
    globe=new window.Globe(canvas,{static:RM});
    globe.setTarget(CITIES[0][1],CITIES[0][2]);
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?globe.start():globe.stop();});},{rootMargin:'100px'}).observe(canvas);
    } else globe.start();
  }
  function nextCity(){
    ci=(ci+1)%CITIES.length;var c=CITIES[ci];
    if(globe)globe.setTarget(c[1],c[2]);
    if(!cityEl)return;
    if(RM||!window.gsap){cityEl.textContent=c[0];return;}
    gsap.to(cityEl,{yPercent:-110,duration:.35,ease:'power2.in',onComplete:function(){
      cityEl.textContent=c[0];gsap.fromTo(cityEl,{yPercent:110},{yPercent:0,duration:.5,ease:'power3.out'});
    }});
  }
  var cityTimer=null;
  function startCities(){if(!cityTimer)cityTimer=setInterval(nextCity,2800);}
  function stopCities(){clearInterval(cityTimer);cityTimer=null;}
  if(cityEl&&'IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?startCities():stopCities();});}).observe(cityEl);
  } else startCities();

  /* perks: shared activation */
  var perks=$$('.perk'),frames=$$('.frame__img'),countEl=$('.frame__count b'),cur=0,z=2;
  function activate(i,animate){
    if(i===cur||i<0||i>=perks.length)return;
    var dir=i>cur?1:-1;cur=i;
    perks.forEach(function(p,k){p.classList.toggle('is-active',k===i);});
    if(countEl)countEl.textContent=('0'+(i+1)).slice(-2);
    var f=frames[i];if(!f)return;
    z++;f.style.zIndex=z;
    if(animate&&window.gsap){
      gsap.killTweensOf(f);
      gsap.fromTo(f,{clipPath:dir>0?'inset(100% 0% 0% 0%)':'inset(0% 0% 100% 0%)',scale:1.08},{clipPath:'inset(0% 0% 0% 0%)',scale:1,duration:1,ease:'power3.inOut',onComplete:function(){
        frames.forEach(function(o){if(o!==f&&cur===i){o.classList.remove('is-on');gsap.set(o,{clipPath:'inset(100% 0% 0% 0%)'});}});f.classList.add('is-on');
      }});
    } else {
      frames.forEach(function(o){o.classList.toggle('is-on',o===f);o.style.clipPath='';});
    }
  }


  /* =====================================================
     v3 · lead capture: quote forms, modal, route bar
     (runs in every motion mode)
     ===================================================== */
  var today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
  var todayStr=today.toISOString().slice(0,10);
  $$('input[type="date"]').forEach(function(d){d.min=todayStr;});

  function setErr(form,name,msg){
    var el=form.elements[name];if(!el||!el.id)return;
    var err=document.getElementById(el.id+'-err');
    if(msg){el.setAttribute('aria-invalid','true');if(err)err.textContent=msg;}
    else{el.removeAttribute('aria-invalid');if(err)err.textContent='';}
  }
  function tripOf(form){var r=form.querySelector('input[name="trip"]:checked');return r?r.value:'one-way';}
  function syncTrip(form){
    var t=tripOf(form),ret=$('.fld--ret',form),legs=$('.fld--legs',form);
    if(ret)ret.hidden=t!=='round-trip';
    if(legs)legs.hidden=t!=='multi-leg';
    if(t!=='round-trip')setErr(form,'return','');
  }
  function validate(form){
    var v=function(n){var e=form.elements[n];return e?String(e.value).trim():'';},bad=[];
    function chk(n,msg){setErr(form,n,msg);if(msg)bad.push(n);}
    chk('from',v('from').length<2?'Enter a departure city or airport.':'');
    chk('to',v('to').length<2?'Enter a destination city or airport.':'');
    var d=v('date');chk('date',!d?'Choose a departure date.':(d<todayStr?'Choose today or a later date.':''));
    if(tripOf(form)==='round-trip'){var r=v('return');chk('return',!r?'Choose a return date.':(d&&r<d?'Return must be on or after departure.':''));}
    var p=parseInt(v('passengers'),10);chk('passengers',!(p>=1&&p<=99)?'Enter 1 to 99 passengers.':'');
    chk('name',v('name').length<2?'Enter your full name.':'');
    chk('phone',v('phone').replace(/\D/g,'').length<7?'Enter a phone number we can reach you on.':'');
    chk('email',!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))?'Enter a valid email address.':'');
    return bad;
  }
  $$('form[data-qf]').forEach(function(form){
    var done=form.nextElementSibling;
    $$('input[name="trip"]',form).forEach(function(r){r.addEventListener('change',function(){syncTrip(form);});});
    syncTrip(form);
    var sw=$('.qf__swap',form);
    if(sw)sw.addEventListener('click',function(){var a=form.elements.from,b=form.elements.to,t=a.value;a.value=b.value;b.value=t;});
    $$('[data-pax]',form).forEach(function(b){b.addEventListener('click',function(){
      var i=form.elements.passengers,n=(parseInt(i.value,10)||0)+parseInt(b.getAttribute('data-pax'),10);
      i.value=Math.max(1,Math.min(99,n));setErr(form,'passengers','');});});
    form.addEventListener('input',function(e){if(e.target.getAttribute('aria-invalid')==='true')setErr(form,e.target.name,'');});
    form.addEventListener('submit',function(e){
      e.preventDefault(); /* No backend yet: nothing is sent anywhere. */
      var bad=validate(form);
      if(bad.length){var f=form.elements[bad[0]];if(f&&f.focus)f.focus();return;}
      var first=String(form.elements.name.value).trim().split(/\s+/)[0];
      var nm=$('[data-done-name]',done);if(nm)nm.textContent=first?', '+first:'';
      form.hidden=true;done.hidden=false;done.focus({preventScroll:true});
      if(window.ScrollTrigger)ScrollTrigger.refresh();
    });
    var again=$('.qf__again',done);
    if(again)again.addEventListener('click',function(){form.reset();syncTrip(form);done.hidden=true;form.hidden=false;
      $$('[aria-invalid]',form).forEach(function(x){setErr(form,x.name,'');});form.elements.from.focus();
      if(window.ScrollTrigger)ScrollTrigger.refresh();});
  });

  /* modal */
  var modal=$('#quote-modal'),mForm=modal&&$('form[data-qf]',modal),lastFocus=null;
  function focusables(){return $$('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"])',modal).filter(function(el){return el.offsetParent!==null;});}
  function openModal(pref){
    if(!modal)return;
    lastFocus=document.activeElement;
    if(mForm&&mForm.hidden){mForm.reset();mForm.hidden=false;mForm.nextElementSibling.hidden=true;}
    if(pref&&mForm){
      Object.keys(pref).forEach(function(k){
        if(k==='trip'){var r=mForm.querySelector('input[name="trip"][value="'+pref.trip+'"]');if(r)r.checked=true;}
        else if(mForm.elements[k]&&pref[k])mForm.elements[k].value=pref[k];
      });
      syncTrip(mForm);
    }
    modal.hidden=false;html.classList.add('qm-lock');
    if(window.__lenis)window.__lenis.stop();
    requestAnimationFrame(function(){modal.classList.add('is-open');});
    var target=pref&&mForm?(['from','to','date'].filter(function(k){return !mForm.elements[k].value;})[0]||'name'):'from';
    setTimeout(function(){var el=mForm&&mForm.elements[target];if(el)el.focus();},60);
  }
  function closeModal(){
    if(!modal||modal.hidden)return;
    modal.classList.remove('is-open');html.classList.remove('qm-lock');
    if(window.__lenis)window.__lenis.start();
    setTimeout(function(){modal.hidden=true;},RM?0:350);
    if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
  }
  window.openQuote=openModal;
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-quote]');
    if(t){e.preventDefault();openModal();return;}
    if(e.target.closest&&e.target.closest('[data-qm-close]'))closeModal();
  });
  document.addEventListener('keydown',function(e){
    if(!modal||modal.hidden)return;
    if(e.key==='Escape'){e.preventDefault();closeModal();return;}
    if(e.key==='Tab'){var f=focusables();if(!f.length)return;var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}
      else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
  });

  /* route bar on the runway: hand the route to the modal, which collects contact details */
  var rbar=$('form[data-rbar]');
  if(rbar)rbar.addEventListener('submit',function(e){
    e.preventDefault();
    var g=function(n){return String(rbar.elements[n].value||'').trim();};
    openModal({trip:g('trip'),from:g('from'),to:g('to'),date:g('date'),passengers:g('passengers')});
  });

  /* reduced motion / no GSAP: static layout and done */
  if(RM||!window.gsap||!window.ScrollTrigger){
    html.classList.add('rm');
    var flight=$('.flight'),panel=$('.panel');
    var rw=$('.runway'),rc=$('.runway__copy');
    if(flight&&rw&&rc){var sec=document.createElement('section');sec.className='rm-runway';sec.setAttribute('aria-label','Private jet charter from Fort Lauderdale');sec.appendChild(rw);sec.appendChild(rc);flight.before(sec);}
    if(flight&&panel){var s=document.createElement('section');s.className='rm-sky';s.setAttribute('aria-label','About Presidential');s.appendChild(panel);flight.after(s);}
    perks.forEach(function(p,k){$('.perk__head',p).addEventListener('click',function(){activate(k,false);});});
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scroll (desktop only) */
  var lenis=null;
  if(window.Lenis&&!isMobile()&&window.matchMedia('(hover: hover)').matches){
    lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));},smoothWheel:true});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000);});
    gsap.ticker.lagSmoothing(0);
    window.__lenis=lenis;
  }
  function scrollToY(y){if(lenis)lenis.scrollTo(y,{duration:1.6});else window.scrollTo({top:y,behavior:'smooth'});}

  /* ---------- 0 · runway intro + 1+2 · flight ---------- */
  var glassEl=$('.glass'),porth=$$('.porthole'),bezel=$('.porthole--bezel'),panelEl=$('.panel');
  var rwLayer=$('.runway'),rwPhoto=$('.runway__photo'),rwImg=$('.runway__photo img'),rwWall=$('.runway__wall'),rwShade=$('.runway__shade');
  function finalScale(){var r=glassEl.getBoundingClientRect(),s=gsap.getProperty(porth[0],'scale')||1;
    var w=r.width/s,h=r.height/s;return Math.max(window.innerWidth/w,window.innerHeight/h)*1.6;}
  gsap.set(panelEl,{xPercent:-50,yPercent:-50,x:0,y:0,left:'50%',top:'50%'});

  /* Camera: the photo is laid out with object-fit:cover. We push in on one lit cabin window
     (source px in tarmac.webp, 864x1152) until it is the size and position of the porthole glass,
     while the porthole bezel locks onto it and grows with it. */
  var IW=864,IH=1152,WIN={x:546,y:611,h:25};
  var cam={z:0};
  function clamp(x){return Math.max(0,Math.min(1,x));}
  function seg(z,a,b){return clamp((z-a)/(b-a));}
  function sm(t){return t*t*(3-2*t);}
  function renderCam(){
    var vw=window.innerWidth,vh=window.innerHeight,mob=isMobile(),z=cam.z;
    var px=mob?.6:.5,py=mob?.5:.62;
    var b=Math.max(vw/IW,vh/IH),ox=(vw-IW*b)*px,oy=(vh-IH*b)*py;
    var p0x=ox+b*WIN.x,p0y=oy+b*WIN.y,h0=b*WIN.h;
    var bz=porth[0],gw=bz.offsetWidth*.812,gh=bz.offsetHeight*.868;
    var cx=bz.offsetLeft+bz.offsetWidth/2,cy=bz.offsetTop+bz.offsetHeight/2;
    var kF=gh/h0,k=Math.pow(kF,z),m=sm(z);
    var wx=p0x+(cx-p0x)*m,wy=p0y+(cy-p0y)*m;
    rwPhoto.style.transform='translate3d('+(wx-k*p0x).toFixed(2)+'px,'+(wy-k*p0y).toFixed(2)+'px,0) scale('+k.toFixed(4)+')';
    if(!mob)rwImg.style.filter=z>.35?'blur('+(seg(z,.35,.95)*5).toFixed(2)+'px)':'none';
    var sb=k*h0/gh,bo=sm(seg(z,.42,.72));
    gsap.set(porth,{x:wx-cx,y:wy-cy,scale:sb});
    bezel.style.opacity=bo.toFixed(3);
    var wo=sm(seg(z,.5,.88)),rx=(gw*sb/2).toFixed(1),ry=(gh*sb/2).toFixed(1);
    var mask='radial-gradient(ellipse '+rx+'px '+ry+'px at '+wx.toFixed(1)+'px '+wy.toFixed(1)+'px, transparent 97%, #000 100%)';
    rwWall.style.opacity=wo.toFixed(3);rwWall.style.webkitMaskImage=mask;rwWall.style.maskImage=mask;
    rwShade.style.opacity=(1-sm(seg(z,.3,.7))).toFixed(3);
    rwPhoto.style.opacity=(1-sm(seg(z,.62,.92))).toFixed(3);
    rwLayer.style.visibility=z>=.999?'hidden':'visible';
  }
  gsap.set('.hero-foot',{autoAlpha:0});
  renderCam();

  var O=3.2; /* everything from v2 starts after the runway intro */
  var ft=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.flight',start:'top top',end:'bottom bottom',scrub:1,invalidateOnRefresh:true,onRefresh:renderCam}});
  ft.to('.runway__hint',{autoAlpha:0,duration:.3},0)
    .to('.runway__copy',{autoAlpha:0,y:-40,duration:.6,ease:'power1.in'},.15)
    .fromTo(cam,{z:0},{z:1,duration:2.6,ease:'power1.inOut',onUpdate:renderCam},.5)
    .fromTo('.hero-foot',{autoAlpha:0},{autoAlpha:1,duration:.3},O-.3)
    .to('.glass__shade',{yPercent:-42,duration:.9,ease:'power1.inOut'},O)
    .to('.hint',{autoAlpha:0,duration:.4},O+.2)
    .fromTo(porth,{scale:1},{scale:function(){return isMobile()?1.25:1.5;},duration:1.4,ease:'power1.inOut',immediateRender:false},O+.4)
    .to('.sky__tint',{opacity:0,duration:1.2},O+.4)
    .fromTo('.sky__img',{scale:1.25},{scale:1.1,duration:4.6},O+.4)
    .to('.glass__brand',{autoAlpha:0,y:-20,duration:.7},O+.5)
    .to('.glow',{opacity:0,duration:1.4},O+.6)
    .fromTo('.hl .ln>span',{y:0,yPercent:110},{y:0,yPercent:0,duration:1,stagger:.12,ease:'power3.out'},O+1.4)
    .to('.hl__small',{opacity:.85,duration:.8},O+1.9)
    .addLabel('hold',O+2.6)
    .to('.hl--l',{x:function(){return isMobile()?0:-window.innerWidth*.3;},y:function(){return isMobile()?-window.innerHeight*.25:0;},autoAlpha:0,duration:1,ease:'power2.in'},O+4.4)
    .to('.hl--r',{x:function(){return isMobile()?0:window.innerWidth*.3;},y:function(){return isMobile()?window.innerHeight*.25:0;},autoAlpha:0,duration:1,ease:'power2.in'},O+4.4)
    .to(porth,{scale:finalScale,duration:2,ease:'power2.in'},O+4.6)
    .to(bezel,{opacity:0,duration:.4},O+6.2)
    .set(porth,{visibility:'hidden'},O+6.62)
    .addLabel('statement',O+6.8)
    .fromTo(panelEl,{autoAlpha:0,y:function(){return window.innerHeight;}},{autoAlpha:1,y:0,duration:1.3,ease:'power3.out'},O+6.8)
    .to('.statement .w',{color:'#0e1b33',duration:.35,stagger:.06},O+8.2)
    .fromTo('.stat',{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.6,stagger:.18,ease:'power2.out'},'>-0.2')
    .to({},{duration:1});

  /* ---------- 3 · fleet ---------- */
  var jetWrap=$('.fleet__jet'),wire=$('.jet--wire'),photo=$('.jet--photo'),scan=$('.scan');
  gsap.set(jetWrap,{xPercent:-50,yPercent:-50,x:0,y:0});
  var sp={p:0};
  function applyScan(){var p=(sp.p*100).toFixed(2);
    wire.style.clipPath='inset(0% 0% '+(100-sp.p*100).toFixed(2)+'% 0%)';
    photo.style.clipPath='inset('+p+'% 0% 0% 0%)';
    scan.style.top=p+'%';}
  var fl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.fleet',start:'top 60%',end:'bottom bottom',scrub:1,invalidateOnRefresh:true}});
  fl.fromTo('.fw .mask>span',{y:0,yPercent:105},{y:0,yPercent:0,duration:1,stagger:.15,ease:'power3.out'},0)
    .fromTo('.fw small',{autoAlpha:0,y:16},{autoAlpha:.75,y:0,duration:.6},.6)
    .fromTo(jetWrap,{y:function(){return window.innerHeight*1.05;}},{y:0,duration:1.8,ease:'power2.out'},1.4)
    .to('.fleet__words',{autoAlpha:0,scale:.96,duration:.8},3.4)
    .to(scan,{opacity:1,duration:.2},3.9)
    .fromTo(sp,{p:0},{p:1,duration:2.2,ease:'power1.inOut',onUpdate:applyScan},4)
    .to(scan,{opacity:0,duration:.3},6.1)
    .fromTo('.spec--model',{autoAlpha:0,y:40},{autoAlpha:1,y:0,duration:.8,ease:'power2.out'},5.4)
    .fromTo('.spec--grid > div',{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.6,stagger:.1,ease:'power2.out'},5.7)
    .set('.spec--grid',{opacity:1},5.69)
    .fromTo('.spec--side',{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.8,ease:'power2.out'},6)
    .to({},{duration:1.4});
  applyScan();

  /* ---------- 4 · perks ---------- */
  var perkST=null;
  if(!isMobile()){
    perkST=ScrollTrigger.create({trigger:'.perks',start:'top top',end:'bottom bottom',
      onUpdate:function(self){activate(Math.min(perks.length-1,Math.floor(self.progress*perks.length*0.999)),true);}});
  }
  perks.forEach(function(p,k){$('.perk__head',p).addEventListener('click',function(){
    if(perkST&&!isMobile()){scrollToY(perkST.start+(k+.5)/perks.length*(perkST.end-perkST.start));}
  });});
  gsap.from('.perks__title, .perks .eyebrow',{scrollTrigger:{trigger:'.perks',start:'top 75%',end:'top 20%',scrub:1},y:50,autoAlpha:0,stagger:.1});

  /* ---------- 5 · global ---------- */
  gsap.fromTo('.global__word',{xPercent:8},{xPercent:-38,ease:'none',scrollTrigger:{trigger:'.global',start:'top bottom',end:'bottom bottom',scrub:1}});
  var gl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.global',start:'top 70%',end:'bottom bottom',scrub:1}});
  gl.fromTo('.globe',{x:0,y:0,xPercent:-50,yPercent:-10,scale:.8,autoAlpha:0},{x:0,y:0,xPercent:-50,yPercent:-30,scale:1,autoAlpha:1,duration:1.6,ease:'power2.out'},0)
    .fromTo('.global__copy > *',{y:40,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,stagger:.12,ease:'power2.out'},.6)
    .fromTo('.card',{y:0,yPercent:120,autoAlpha:0},{y:0,yPercent:0,autoAlpha:1,duration:1,ease:'power3.out'},1.4)
    .to({},{duration:1.2});

  /* footer reveal */
  gsap.from('.foot__word',{scrollTrigger:{trigger:'.foot',start:'top 80%',end:'bottom bottom',scrub:1},yPercent:40,autoAlpha:0});

  /* ---------- nav theme ---------- */
  var nav=$('.nav');
  $$('[data-theme]').forEach(function(sec){if(sec===nav)return;
    ScrollTrigger.create({trigger:sec,start:'top 40px',end:'bottom 40px',onToggle:function(self){if(self.isActive)nav.setAttribute('data-theme',sec.getAttribute('data-theme'));}});
  });

  /* ---------- anchors ---------- */
  $$('a[href^="#"]').forEach(function(a){if(a.hasAttribute('data-quote'))return;a.addEventListener('click',function(e){
    var id=a.getAttribute('href');if(id.length<2&&id!=='#')return;
    var y=0;
    if(id==='#top')y=0;
    else if(id==='#charter'){var t=ft.scrollTrigger;y=t.start+(ft.labels.statement+2.6)/ft.duration()*(t.end-t.start);}
    else if(id==='#fleet'){var t2=fl.scrollTrigger;y=t2.start+(6.4/fl.duration())*(t2.end-t2.start);}
    else{var el=$(id);if(!el)return;y=el.getBoundingClientRect().top+window.pageYOffset;}
    e.preventDefault();scrollToY(y);
  });});

  /* ---------- cursor ---------- */
  if(html.classList.contains('has-cursor')){
    var cur$=$('.cursor'),dot=$('.cursor__dot'),ring=$('.cursor__ring'),
        tx=innerWidth/2,ty=innerHeight/2,px=tx,py=ty,vx=0,vy=0,K=.16,DAMP=.72;
    addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;dot.style.transform='translate3d('+tx+'px,'+ty+'px,0)';cur$.classList.add('is-live');
      var h=e.target.closest&&e.target.closest('a,button');cur$.classList.toggle('is-hover',!!h);},{passive:true});
    addEventListener('mousedown',function(){cur$.classList.add('is-down');});
    addEventListener('mouseup',function(){cur$.classList.remove('is-down');});
    document.addEventListener('mouseleave',function(){cur$.classList.remove('is-live');});
    (function loop(){vx+=(tx-px)*K;vy+=(ty-py)*K;vx*=DAMP;vy*=DAMP;px+=vx;py+=vy;
      ring.style.transform='translate3d('+px.toFixed(2)+'px,'+py.toFixed(2)+'px,0)';requestAnimationFrame(loop);})();
  }

  /* refresh once fonts/images settle */
  var w0=innerWidth;
  addEventListener('resize',function(){if(Math.abs(innerWidth-w0)>120&&((w0<=768)!==(innerWidth<=768))){location.reload();}w0=innerWidth;});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ScrollTrigger.refresh();});
  addEventListener('load',function(){ScrollTrigger.refresh();});
})();
