/* Presidential Aviation · v4 lean pitch build. Vanilla JS, no libraries. */
(function(){
  'use strict';
  var d=document,root=d.documentElement,RM=root.classList.contains('rm');
  function $(s,c){return (c||d).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s));}

  /* ---------- intro: remove overlay once it has faded ---------- */
  var intro=$('.intro');
  if(intro){
    if(RM){intro.remove();}
    else{
      var kill=function(){if(intro.parentNode)intro.remove();};
      intro.addEventListener('animationend',function(e){if(e.target===intro)kill();});
      setTimeout(kill,2600);
    }
  }

  /* ---------- reveals ---------- */
  var fleet=$('.fleet');
  if('IntersectionObserver' in window && !RM){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    $$('.rv').forEach(function(el){io.observe(el);});
    var fio=new IntersectionObserver(function(es){if(es[0].isIntersecting){fleet.classList.add('play');fio.disconnect();}},{threshold:.3});
    fio.observe(fleet);
  } else {
    $$('.rv').forEach(function(el){el.classList.add('in');});
    fleet.classList.add('play');
  }

  /* ---------- validation helpers ---------- */
  function setErr(input,msg){
    var box=input.closest('.bf,.fld'),err=d.getElementById(input.id+'-err');
    if(box)box.classList.toggle('is-bad',!!msg);
    input.setAttribute('aria-invalid',msg?'true':'false');
    if(err)err.textContent=msg||'';
    return !msg;
  }
  function validPhone(v){return v.replace(/\D/g,'').length>=7;}
  function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);}
  function today(){var t=new Date();t.setMinutes(t.getMinutes()-t.getTimezoneOffset());return t.toISOString().slice(0,10);}
  function fmtDate(v){if(!v)return '';var p=v.split('-');var dt=new Date(+p[0],+p[1]-1,+p[2]);return dt.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});}
  function esc(s){return s.replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  /* ---------- booking bar (step 1) ---------- */
  var book=$('#book'),from=$('#book-from'),to=$('#book-to'),date=$('#book-date'),ret=$('#book-return'),pax=$('#book-pax'),retBox=$('.bf--ret');
  date.min=today();ret.min=today();
  function trip(){return ($('input[name="trip"]:checked',book)||{}).value||'one-way';}
  $$('input[name="trip"]',book).forEach(function(r){r.addEventListener('change',function(){
    var rt=trip()==='round-trip';retBox.hidden=!rt;if(!rt)setErr(ret,'');
  });});
  $('.book__swap').addEventListener('click',function(){var a=from.value;from.value=to.value;to.value=a;});
  $$('[data-pax]',book).forEach(function(b){b.addEventListener('click',function(){
    var n=Math.max(1,Math.min(19,(parseInt(pax.value,10)||1)+parseInt(b.getAttribute('data-pax'),10)));pax.value=n;
  });});
  date.addEventListener('change',function(){if(date.value){ret.min=date.value;if(ret.value&&ret.value<date.value)ret.value='';}});
  [from,to,date,ret].forEach(function(i){i.addEventListener('input',function(){if(i.getAttribute('aria-invalid')==='true')checkStep1(true);});});

  function checkStep1(quiet){
    var ok=true,first=null;
    function f(input,msg){if(!setErr(input,msg)){ok=false;first=first||input;}}
    f(from,from.value.trim()?'':'Where from?');
    f(to,!to.value.trim()?'Where to?':(to.value.trim().toLowerCase()===from.value.trim().toLowerCase()?'Pick a different destination':''));
    f(date,!date.value?'Pick a date':(date.value<today()?'Date is in the past':''));
    if(trip()==='round-trip')f(ret,!ret.value?'Pick a return':(ret.value<date.value?'Return is before departure':''));
    book.classList.toggle('has-err',!ok);
    return quiet?ok:{ok:ok,first:first};
  }
  function emptyFirst(){var list=[from,to,date];if(trip()==='round-trip')list.push(ret);for(var i=0;i<list.length;i++)if(!list[i].value.trim())return list[i];return null;}

  book.addEventListener('submit',function(e){
    e.preventDefault(); /* no backend yet */
    var r=checkStep1();
    if(!r.ok){r.first.focus();return;}
    openSheet(book.querySelector('.book__go'));
  });

  /* header / sticky / section buttons: open the same flow */
  $$('[data-book]').forEach(function(b){b.addEventListener('click',function(){
    if(checkStep1(true)){openSheet(b);return;}
    book.classList.remove('has-err');[from,to,date,ret].forEach(function(i){setErr(i,'');});
    var target=emptyFirst()||from;
    var r=book.getBoundingClientRect(),inView=r.top>=0&&r.bottom<=innerHeight;
    if(!inView)window.scrollTo({top:0,behavior:RM?'auto':'smooth'});
    setTimeout(function(){target.focus({preventScroll:true});book.classList.remove('is-nudge');void book.offsetWidth;book.classList.add('is-nudge');},inView?0:RM?0:450);
  });});

  /* ---------- step 2 sheet ---------- */
  var sheet=$('#book-modal'),panel=$('.sheet__panel',sheet),f2=$('#book2'),done2=$('.done',sheet),sum=$('[data-summary]',sheet),legs=$('.fld--legs',sheet),lastFocus=null;
  function summary(){
    var t=trip(),n=parseInt(pax.value,10)||1;
    var when=fmtDate(date.value)+(t==='round-trip'&&ret.value?' – '+fmtDate(ret.value):'');
    var label={'one-way':'One-way','round-trip':'Round-trip','multi-leg':'Multi-leg'}[t];
    sum.innerHTML='<span class="r">'+esc(from.value.trim())+' → '+esc(to.value.trim())+'<small>'+label+' · '+when+' · '+n+' passenger'+(n>1?'s':'')+'</small></span><button type="button" data-edit>Edit</button>';
    $('[data-edit]',sum).addEventListener('click',function(){closeSheet();from.focus();});
    legs.hidden=t!=='multi-leg';
  }
  function openSheet(opener){
    lastFocus=opener||d.activeElement;summary();
    f2.hidden=false;done2.hidden=true;
    sheet.hidden=false;d.body.classList.add('lock');
    setTimeout(function(){($('#s-name')).focus();},40);
    d.addEventListener('keydown',onKey);
  }
  function closeSheet(){
    sheet.hidden=true;d.body.classList.remove('lock');d.removeEventListener('keydown',onKey);
    if(!done2.hidden){f2.hidden=false;done2.hidden=true;}
    if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
  }
  function onKey(e){
    if(e.key==='Escape'){closeSheet();return;}
    if(e.key!=='Tab')return;
    var f=$$('button,input,textarea,a[href]',panel).filter(function(x){return x.offsetParent!==null&&!x.disabled;});
    if(!f.length)return;var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus();}
    else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus();}
  }
  $$('[data-close]',sheet).forEach(function(b){b.addEventListener('click',closeSheet);});

  function contactCheck(form,map){
    var ok=true,first=null;
    map.forEach(function(m){var i=$(m[0],form);var msg=m[1](i.value.trim());if(!setErr(i,msg)){ok=false;first=first||i;}});
    if(first)first.focus();
    return ok;
  }
  var NAME=function(v){return v.length>=2?'':'Please enter your name';},
      PHONE=function(v){return validPhone(v)?'':'Please enter a phone number';},
      EMAIL=function(v){return validEmail(v)?'':'Please enter a valid email';},
      MSG=function(v){return v.length>=2?'':'Please add a short message';};

  f2.addEventListener('submit',function(e){
    e.preventDefault(); /* TODO: connect form endpoint (FormSubmit/CRM) after client approval */
    if(!contactCheck(f2,[['#s-name',NAME],['#s-phone',PHONE],['#s-email',EMAIL]]))return;
    var first=$('#s-name').value.trim().split(/\s+/)[0];
    $('[data-name]',done2).textContent=first?', '+first:'';
    f2.hidden=true;done2.hidden=false;done2.focus();
    f2.reset();book.reset();retBox.hidden=true;pax.value=2;
  });
  $$('input,textarea',f2).forEach(function(i){i.addEventListener('input',function(){if(i.getAttribute('aria-invalid')==='true')setErr(i,'');});});

  /* ---------- bottom contact form ---------- */
  var cf=$('#cform'),cdone=$('.contact__card .done');
  cf.addEventListener('submit',function(e){
    e.preventDefault(); /* TODO: connect form endpoint (FormSubmit/CRM) after client approval */
    if(!contactCheck(cf,[['#c-name',NAME],['#c-phone',PHONE],['#c-email',EMAIL],['#c-msg',MSG]]))return;
    var first=$('#c-name').value.trim().split(/\s+/)[0];
    $('[data-name]',cdone).textContent=first?', '+first:'';
    cf.hidden=true;cdone.hidden=false;cdone.focus();cf.reset();
  });
  $$('input,textarea',cf).forEach(function(i){i.addEventListener('input',function(){if(i.getAttribute('aria-invalid')==='true')setErr(i,'');});});

  /* ---------- light globe (lazy) ---------- */
  var canvas=$('.globe');
  var CITIES=[[25.05,-77.35],[40.71,-74.0],[39.19,-106.82],[34.05,-118.24],[22.89,-109.91],[17.90,-62.85]],FXE=[26.197,-80.171],D2R=Math.PI/180;
  var G={rot:86,tilt:24*D2R,t:0,pts:null};
  function proj(lat,lon){var la=lat*D2R,lo=(lon+G.rot)*D2R,x=Math.cos(la)*Math.sin(lo),y=Math.sin(la),z=Math.cos(la)*Math.cos(lo),ct=Math.cos(G.tilt),st=Math.sin(G.tilt);return [x,y*ct-z*st,y*st+z*ct];}
  function toV(p){var la=p[0]*D2R,lo=p[1]*D2R;return [Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)];}
  function toLL(v){return [Math.asin(Math.max(-1,Math.min(1,v[2])))/D2R,Math.atan2(v[1],v[0])/D2R];}
  function slerp(a,b,om,t){var s=Math.sin(om)||1e-6,k1=Math.sin((1-t)*om)/s,k2=Math.sin(t*om)/s;return [a[0]*k1+b[0]*k2,a[1]*k1+b[1]*k2,a[2]*k1+b[2]*k2];}
  function draw(){
    if(!canvas||!G.pts)return;
    var r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    var g=canvas.getContext('2d'),cx=w/2,cy=h/2,R=Math.min(w,h)*.44;
    g.clearRect(0,0,w,h);
    var sp=g.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);sp.addColorStop(0,'#ffffff');sp.addColorStop(1,'#e3e9f2');
    g.fillStyle=sp;g.beginPath();g.arc(cx,cy,R,0,7);g.fill();
    g.strokeStyle='rgba(14,27,51,.08)';g.lineWidth=dpr;g.stroke();
    var pts=G.pts,s=Math.max(2.2*dpr,R/105);
    for(var k=0;k<pts.length;k+=2){var p=proj(pts[k],pts[k+1]);if(p[2]<=.03)continue;g.fillStyle='rgba(14,27,51,'+(.16+.6*p[2]).toFixed(2)+')';g.beginPath();g.arc(cx+p[0]*R,cy-p[1]*R,s/2,0,7);g.fill();}
    var a1=toV(FXE),e=1-Math.pow(1-G.t,3);
    g.lineWidth=1.6*dpr;g.strokeStyle='#b8924d';g.fillStyle='#0e1b33';
    CITIES.forEach(function(c,ci){
      var a2=toV(c),om=Math.acos(Math.max(-1,Math.min(1,a1[0]*a2[0]+a1[1]*a2[1]+a1[2]*a2[2]))),N=48,te=Math.max(0,Math.min(1,e*1.3-ci*.06));
      g.beginPath();var last=null;
      for(var i=0;i<=Math.round(N*te);i++){var t=i/N,ll=toLL(slerp(a1,a2,om,t)),q=proj(ll[0],ll[1]),lift=1+Math.sin(Math.PI*t)*Math.min(.12,om*.25),X=cx+q[0]*R*lift,Y=cy-q[1]*R*lift;i?g.lineTo(X,Y):g.moveTo(X,Y);last=[X,Y];}
      g.stroke();
      if(te>=1&&last){g.beginPath();g.arc(last[0],last[1],3.2*dpr,0,7);g.fill();}
    });
    var f=proj(FXE[0],FXE[1]),fx=cx+f[0]*R,fy=cy-f[1]*R;
    g.fillStyle='rgba(199,164,99,.25)';g.beginPath();g.arc(fx,fy,10*dpr,0,7);g.fill();
    g.fillStyle='#c7a463';g.beginPath();g.arc(fx,fy,4.5*dpr,0,7);g.fill();
  }
  function animate(){
    if(RM){G.t=1;draw();return;}
    var t0=performance.now();
    (function step(now){G.t=Math.min(1,(now-t0)/1600);draw();if(G.t<1)requestAnimationFrame(step);})(t0);
  }
  if(canvas){
    var started=false,loadLand=function(){
      if(started)return;started=true;
      var s=d.createElement('script');s.src='js/land.js';s.async=true;
      s.onload=function(){G.pts=window.LAND_DOTS||[];var gio=new IntersectionObserver(function(es){if(es[0].isIntersecting){gio.disconnect();animate();}},{threshold:.25});gio.observe(canvas);};
      d.body.appendChild(s);
    };
    if('IntersectionObserver' in window){var lio=new IntersectionObserver(function(es){if(es[0].isIntersecting){lio.disconnect();loadLand();}},{rootMargin:'600px 0px'});lio.observe(canvas);}
    else loadLand();
    var rz;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(draw,150);});
  }
})();
