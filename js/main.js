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

  /* reduced motion / no GSAP: static layout and done */
  if(RM||!window.gsap||!window.ScrollTrigger){
    html.classList.add('rm');
    var flight=$('.flight'),panel=$('.panel');
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
  }
  function scrollToY(y){if(lenis)lenis.scrollTo(y,{duration:1.6});else window.scrollTo({top:y,behavior:'smooth'});}

  /* ---------- 1+2 · flight ---------- */
  var glassEl=$('.glass'),porth=$$('.porthole'),bezel=$('.porthole--bezel'),panelEl=$('.panel');
  function finalScale(){var r=glassEl.getBoundingClientRect(),s=gsap.getProperty(porth[0],'scale')||1;
    var w=r.width/s,h=r.height/s;return Math.max(window.innerWidth/w,window.innerHeight/h)*1.6;}
  gsap.set(panelEl,{xPercent:-50,yPercent:-50,x:0,y:0,left:'50%',top:'50%'});
  var ft=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.flight',start:'top top',end:'bottom bottom',scrub:1,invalidateOnRefresh:true}});
  ft.to('.glass__shade',{yPercent:-42,duration:.9,ease:'power1.inOut'},0)
    .to('.hint',{autoAlpha:0,duration:.4},0)
    .to(porth,{scale:function(){return isMobile()?1.25:1.5;},duration:1.4,ease:'power1.inOut'},.4)
    .to('.sky__tint',{opacity:0,duration:1.2},.4)
    .fromTo('.sky__img',{scale:1.25},{scale:1.1,duration:4.6},.4)
    .to('.glass__brand',{autoAlpha:0,y:-20,duration:.7},.5)
    .to('.glow',{opacity:0,duration:1.4},.6)
    .fromTo('.hl .ln>span',{y:0,yPercent:110},{y:0,yPercent:0,duration:1,stagger:.12,ease:'power3.out'},1.4)
    .to('.hl__small',{opacity:.85,duration:.8},1.9)
    .addLabel('hold',2.6)
    .to('.hl--l',{x:function(){return isMobile()?0:-window.innerWidth*.3;},y:function(){return isMobile()?-window.innerHeight*.25:0;},autoAlpha:0,duration:1,ease:'power2.in'},4.4)
    .to('.hl--r',{x:function(){return isMobile()?0:window.innerWidth*.3;},y:function(){return isMobile()?window.innerHeight*.25:0;},autoAlpha:0,duration:1,ease:'power2.in'},4.4)
    .to(porth,{scale:finalScale,duration:2,ease:'power2.in'},4.6)
    .to(bezel,{opacity:0,duration:.4},6.2)
    .set(porth,{visibility:'hidden'},6.62)
    .addLabel('statement',6.8)
    .fromTo(panelEl,{autoAlpha:0,y:function(){return window.innerHeight;}},{autoAlpha:1,y:0,duration:1.3,ease:'power3.out'},6.8)
    .to('.statement .w',{color:'#0e1b33',duration:.35,stagger:.06},8.2)
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
  $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){
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
