/* Presidential Aviation · v4 pitch build (multi-page). Vanilla JS, no libraries. */
(function(){
  'use strict';
  var d=document,root=d.documentElement,RM=root.classList.contains('rm');
  function $(s,c){return (c||d).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s));}

  /* ---------- intro (home only): remove overlay once it has faded ---------- */
  var intro=$('.intro'),introDone=!intro,introCbs=[];
  var afterIntro=function(fn){if(introDone)fn();else introCbs.push(fn);};
  if(intro){
    if(RM){intro.remove();introDone=true;}
    else{
      var kill=function(){if(intro.parentNode)intro.remove();if(!introDone){introDone=true;introCbs.forEach(function(f){f();});}};
      intro.addEventListener('animationend',function(e){if(e.target===intro)kill();});
      setTimeout(kill,2600);
    }
  }

  /* ---------- reveals ---------- */
  var fleet=$('.fleet');
  if('IntersectionObserver' in window && !RM){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    $$('.rv').forEach(function(el){io.observe(el);});
    if(fleet){var fio=new IntersectionObserver(function(es){if(es[0].isIntersecting){fleet.classList.add('play');fio.disconnect();}},{threshold:.3});fio.observe(fleet);}
  } else {
    $$('.rv').forEach(function(el){el.classList.add('in');});
    if(fleet)fleet.classList.add('play');
  }

  /* ---------- header: services dropdown + mobile menu ---------- */
  var dd=$('.dd'),ddBtn=$('.dd__btn');
  if(dd&&ddBtn){
    /* .shut overrides :hover/:focus-within after Esc or a toggle-close, until the pointer/focus leaves */
    var setDD=function(open){dd.classList.toggle('open',open);dd.classList.toggle('shut',!open);ddBtn.setAttribute('aria-expanded',open?'true':'false');};
    ddBtn.addEventListener('click',function(e){e.stopPropagation();setDD(!dd.classList.contains('open'));});
    d.addEventListener('click',function(e){if(!dd.contains(e.target)){dd.classList.remove('open');ddBtn.setAttribute('aria-expanded','false');}});
    dd.addEventListener('keydown',function(e){if(e.key==='Escape'){setDD(false);ddBtn.focus();}});
    dd.addEventListener('mouseleave',function(){dd.classList.remove('open');ddBtn.setAttribute('aria-expanded','false');});
    dd.addEventListener('mouseenter',function(){dd.classList.remove('shut');});
    dd.addEventListener('focusout',function(e){if(!dd.contains(e.relatedTarget)){dd.classList.remove('open','shut');ddBtn.setAttribute('aria-expanded','false');}});
  }
  var burger=$('.burger'),mnav=$('#mnav');
  function setMenu(open){
    if(!burger||!mnav)return;
    mnav.hidden=!open;burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    d.body.classList.toggle('lock',open);
    if(open){var a=$('a',mnav);if(a)a.focus({preventScroll:true});}
  }
  if(burger&&mnav){
    burger.addEventListener('click',function(){setMenu(mnav.hidden);});
    $$('a',mnav).forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!mnav.hidden){setMenu(false);burger.focus();}});
    window.addEventListener('resize',function(){if(innerWidth>1180&&!mnav.hidden)setMenu(false);});
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
  function labelOf(i){var l=d.querySelector('label[for="'+i.id+'"]');return l?l.childNodes[0].textContent.trim().toLowerCase():'this field';}
  function fieldMsg(i){
    var v=(i.value||'').trim(),t=i.type,req=i.required;
    if(!v)return req?(i.tagName==='SELECT'?'Please choose an option':(i.name==='name'?'Please enter your name':(t==='date'?'Pick a date':'Please enter '+labelOf(i)))):'';
    if(t==='email'&&!validEmail(v))return 'Please enter a valid email';
    if(t==='tel'&&!validPhone(v))return 'Please enter a phone number';
    if(i.name==='name'&&v.length<2)return 'Please enter your name';
    if(t==='date'&&i.hasAttribute('data-future')&&v<today())return 'Date is in the past';
    if(t==='number'){var n=+v,mn=i.min?+i.min:-Infinity,mx=i.max?+i.max:Infinity;if(isNaN(n)||n<mn||n>mx)return 'Enter a number from '+i.min+' to '+i.max;}
    return '';
  }
  $$('input[type=date]').forEach(function(i){i.min=today();});
  function clearOnInput(form){$$('input,textarea,select',form).forEach(function(i){i.addEventListener(i.tagName==='SELECT'?'change':'input',function(){if(i.getAttribute('aria-invalid')==='true')setErr(i,'');});});}
  function showDone(form,done){
    var n=$('input[name="name"]',form),first=n?n.value.trim().split(/\s+/)[0]:'';
    var slot=$('[data-name]',done);if(slot)slot.textContent=first?', '+first:'';
    form.hidden=true;done.hidden=false;done.focus();form.reset();
  }

  /* ---------- generic lead forms (subpages + subpage sheet) ---------- */
  $$('form[data-lead]').forEach(function(form){
    var done=form.parentNode.querySelector('.done');
    clearOnInput(form);
    form.addEventListener('submit',function(e){
      e.preventDefault(); /* TODO: connect form endpoint (FormSubmit/CRM) after client approval */
      var first=null;
      $$('input,select,textarea',form).forEach(function(i){if(!i.id)return;var m=fieldMsg(i);if(!setErr(i,m)&&!first)first=i;});
      if(first){first.focus();return;}
      if(done)showDone(form,done);
    });
  });

  /* ---------- sheet (shared) ---------- */
  var sheet=$('#book-modal'),panel=sheet&&$('.sheet__panel',sheet),lastFocus=null;
  var sForm=sheet&&$('form',sheet),sDone=sheet&&$('.done',sheet);
  function openSheet(opener){
    if(!sheet)return;
    lastFocus=opener||d.activeElement;if(onOpen)onOpen();
    sForm.hidden=false;sDone.hidden=true;
    if(burger&&mnav&&!mnav.hidden)setMenu(false);
    sheet.hidden=false;d.body.classList.add('lock');
    setTimeout(function(){var f=$('input:not([type=hidden]),select,textarea',sForm);if(f)f.focus();},40);
    d.addEventListener('keydown',onKey);
  }
  function closeSheet(){
    sheet.hidden=true;d.body.classList.remove('lock');d.removeEventListener('keydown',onKey);
    if(!sDone.hidden){sForm.hidden=false;sDone.hidden=true;}
    if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
  }
  function onKey(e){
    if(e.key==='Escape'){closeSheet();return;}
    if(e.key!=='Tab')return;
    var f=$$('button,input,select,textarea,a[href]',panel).filter(function(x){return x.offsetParent!==null&&!x.disabled;});
    if(!f.length)return;var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus();}
    else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus();}
  }
  if(sheet)$$('[data-close]',sheet).forEach(function(b){b.addEventListener('click',closeSheet);});
  var onOpen=null;

  /* ---------- home: booking bar (step 1) + step 2 ---------- */
  var book=$('#book');
  if(book){
    var from=$('#book-from'),to=$('#book-to'),date=$('#book-date'),ret=$('#book-return'),pax=$('#book-pax'),retBox=$('.bf--ret');
    var trip=function(){return ($('input[name="trip"]:checked',book)||{}).value||'one-way';};
    $$('input[name="trip"]',book).forEach(function(r){r.addEventListener('change',function(){var rt=trip()==='round-trip';retBox.hidden=!rt;if(!rt)setErr(ret,'');});});
    $('.book__swap').addEventListener('click',function(){var a=from.value;from.value=to.value;to.value=a;});
    $$('[data-pax]',book).forEach(function(b){b.addEventListener('click',function(){var n=Math.max(1,Math.min(19,(parseInt(pax.value,10)||1)+parseInt(b.getAttribute('data-pax'),10)));pax.value=n;});});
    date.addEventListener('change',function(){if(date.value){ret.min=date.value;if(ret.value&&ret.value<date.value)ret.value='';}});
    var checkStep1=function(quiet){
      var ok=true,first=null;
      function f(input,msg){if(!setErr(input,msg)){ok=false;first=first||input;}}
      f(from,from.value.trim()?'':'Where from?');
      f(to,!to.value.trim()?'Where to?':(to.value.trim().toLowerCase()===from.value.trim().toLowerCase()?'Pick a different destination':''));
      f(date,!date.value?'Pick a date':(date.value<today()?'Date is in the past':''));
      if(trip()==='round-trip')f(ret,!ret.value?'Pick a return':(ret.value<date.value?'Return is before departure':''));
      book.classList.toggle('has-err',!ok);
      return quiet?ok:{ok:ok,first:first};
    };
    [from,to,date,ret].forEach(function(i){i.addEventListener('input',function(){if(i.getAttribute('aria-invalid')==='true')checkStep1(true);});});
    var emptyFirst=function(){var list=[from,to,date];if(trip()==='round-trip')list.push(ret);for(var i=0;i<list.length;i++)if(!list[i].value.trim())return list[i];return null;};
    book.addEventListener('submit',function(e){e.preventDefault();var r=checkStep1();if(!r.ok){r.first.focus();return;}openSheet(book.querySelector('.book__go'));});
    $$('[data-book]').forEach(function(b){b.addEventListener('click',function(){
      if(checkStep1(true)){openSheet(b);return;}
      book.classList.remove('has-err');[from,to,date,ret].forEach(function(i){setErr(i,'');});
      if(burger&&mnav&&!mnav.hidden)setMenu(false);
      var target=emptyFirst()||from,r=book.getBoundingClientRect(),inView=r.top>=0&&r.bottom<=innerHeight;
      if(!inView)window.scrollTo({top:0,behavior:RM?'auto':'smooth'});
      setTimeout(function(){target.focus({preventScroll:true});book.classList.remove('is-nudge');void book.offsetWidth;book.classList.add('is-nudge');},inView?0:RM?0:450);
    });});
    var sum=$('[data-summary]',sheet),legs=$('.fld--legs',sheet);
    onOpen=function(){
      var t=trip(),n=parseInt(pax.value,10)||1,when=fmtDate(date.value)+(t==='round-trip'&&ret.value?' – '+fmtDate(ret.value):'');
      var label={'one-way':'One-way','round-trip':'Round-trip','multi-leg':'Multi-leg'}[t];
      sum.innerHTML='<span class="r">'+esc(from.value.trim())+' → '+esc(to.value.trim())+'<small>'+label+' · '+when+' · '+n+' passenger'+(n>1?'s':'')+'</small></span><button type="button" data-edit>Edit</button>';
      $('[data-edit]',sum).addEventListener('click',function(){closeSheet();from.focus();});
      legs.hidden=t!=='multi-leg';
    };
    var NAME=function(v){return v.length>=2?'':'Please enter your name';},PHONE=function(v){return validPhone(v)?'':'Please enter a phone number';},
        EMAIL=function(v){return validEmail(v)?'':'Please enter a valid email';},MSG=function(v){return v.length>=2?'':'Please add a short message';};
    var check=function(form,map){var first=null;map.forEach(function(m){var i=$(m[0],form);if(!setErr(i,m[1](i.value.trim()))&&!first)first=i;});if(first)first.focus();return !first;};
    var f2=$('#book2');clearOnInput(f2);
    f2.addEventListener('submit',function(e){
      e.preventDefault(); /* TODO: connect form endpoint (FormSubmit/CRM) after client approval */
      if(!check(f2,[['#s-name',NAME],['#s-phone',PHONE],['#s-email',EMAIL]]))return;
      showDone(f2,sDone);book.reset();retBox.hidden=true;pax.value=2;
    });
    var cf=$('#cform');
    if(cf){clearOnInput(cf);var cdone=cf.parentNode.querySelector('.done');
      cf.addEventListener('submit',function(e){
        e.preventDefault(); /* TODO: connect form endpoint (FormSubmit/CRM) after client approval */
        if(!check(cf,[['#c-name',NAME],['#c-phone',PHONE],['#c-email',EMAIL],['#c-msg',MSG]]))return;
        showDone(cf,cdone);
      });}
  } else {
    /* subpages: Schedule buttons open the trip sheet */
    $$('[data-book]').forEach(function(b){b.addEventListener('click',function(){openSheet(b);});});
  }

  /* ---------- home hero video: poster is the LCP; sources injected after window load ---------- */
  var hero=$('.hero'),hv=hero&&$('.hero__vid',hero);
  if(hv){
    var HERO_MQ='(max-width: 768px), (orientation: portrait)'; /* keep in sync with <picture> + preload in index.html */
    var conn=navigator.connection||{},skip=RM||conn.saveData===true||matchMedia('(prefers-reduced-data: reduce)').matches;
    var heroIn=true,variant=null,failed=false;
    var srcs=function(m){var b='video/fxe_hero_'+(m?'mobile_720x1280':'desktop_1280x720');return [[b+'.webm','video/webm'],[b+'.mp4','video/mp4']];};
    var fail=function(){failed=true;hero.classList.remove('is-video');hv.removeAttribute('src');while(hv.firstChild)hv.removeChild(hv.firstChild);hv.hidden=true;}; /* poster + Ken Burns remain */
    var tryPlay=function(){if(failed||!variant||!heroIn||d.hidden)return;var pr=hv.play();if(pr&&pr.catch)pr.catch(function(){/* autoplay refused: keep poster */});};
    var load=function(){
      var m=matchMedia(HERO_MQ).matches,v=m?'m':'d';if(v===variant||failed)return;variant=v;
      while(hv.firstChild)hv.removeChild(hv.firstChild);
      srcs(m).forEach(function(x,ix){var so=d.createElement('source');so.src=x[0];so.type=x[1];if(ix===1)so.addEventListener('error',fail);hv.appendChild(so);});
      hv.muted=true;hv.preload='auto';hv.load();afterIntro(tryPlay);
    };
    hv.addEventListener('playing',function(){hero.classList.add('is-video');});
    hv.addEventListener('error',fail);
    if(!skip){
      var go=function(){setTimeout(load,0);};
      if(d.readyState==='complete')go();else window.addEventListener('load',go,{once:true});
      var mq=matchMedia(HERO_MQ);var onMq=function(){if(variant){hero.classList.remove('is-video');load();}};
      if(mq.addEventListener)mq.addEventListener('change',onMq);else if(mq.addListener)mq.addListener(onMq);
      if('IntersectionObserver' in window){new IntersectionObserver(function(es){heroIn=es[0].isIntersecting;if(heroIn)tryPlay();else if(!hv.paused)hv.pause();},{threshold:0}).observe(hero);}
      d.addEventListener('visibilitychange',function(){if(d.hidden){if(!hv.paused)hv.pause();}else tryPlay();});
    } else hv.hidden=true;
    window.__heroVideo={skip:skip,state:function(){return {variant:variant,failed:failed,paused:hv.paused,t:hv.currentTime,src:hv.currentSrc,isVideo:hero.classList.contains('is-video')};}};
  }

  /* ---------- globe: slow continuous spin, cycling routes from FXE ---------- */
  var canvas=$('.globe');
  if(canvas){
    var D2R=Math.PI/180,FXE=[26.197,-80.171];
    /* name, lat, lon (order matches .cities list) */
    var DEST=[['Teterboro · NYC',40.85,-74.06],['Aspen',39.22,-106.87],['Las Vegas',36.08,-115.15],['Van Nuys · LA',34.21,-118.49],
      ['Nassau',25.04,-77.47],['Turks & Caicos',21.77,-72.27],['St. Barts',17.90,-62.84],['Cabo San Lucas',23.15,-109.72],
      ['Mexico City',19.44,-99.07],['Bogotá',4.70,-74.15],['London',51.47,-0.45],['Paris Le Bourget',48.97,2.44],['Nice',43.66,7.21]];
    var chips=$$('.cities li');
    var G={lon:-86,lat:24,pts:null,i:0,t0:0,running:false,visible:false};
    var PERIOD=4200,DRAW=1300,FADE=600;
    var toV=function(lat,lon){var la=lat*D2R,lo=lon*D2R;return [Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)];};
    var toLL=function(v){return [Math.asin(Math.max(-1,Math.min(1,v[2])))/D2R,Math.atan2(v[1],v[0])/D2R];};
    var slerp=function(a,b,om,t){var s=Math.sin(om)||1e-6,k1=Math.sin((1-t)*om)/s,k2=Math.sin(t*om)/s;return [a[0]*k1+b[0]*k2,a[1]*k1+b[1]*k2,a[2]*k1+b[2]*k2];};
    var A=toV(FXE[0],FXE[1]);
    var ROUTES=DEST.map(function(c){
      var B=toV(c[1],c[2]),om=Math.acos(Math.max(-1,Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2]))),N=56,pts=[];
      for(var k=0;k<=N;k++){var t=k/N;pts.push(toLL(slerp(A,B,om,t)).concat([1+Math.sin(Math.PI*t)*Math.min(.14,om*.28)]));}
      var mid=toLL(slerp(A,B,om,.5));
      return {name:c[0],ll:[c[1],c[2]],pts:pts,lat:Math.max(5,Math.min(42,mid[0])),lon:mid[1]};
    });
    var ct,st,cl,sl;
    var setCam=function(){var tl=G.lat*D2R;ct=Math.cos(tl);st=Math.sin(tl);};
    var proj=function(lat,lon){var la=lat*D2R,lo=(lon-G.lon)*D2R,cla=Math.cos(la),x=cla*Math.sin(lo),y=Math.sin(la),z=cla*Math.cos(lo);return [x,y*ct-z*st,y*st+z*ct];};
    var wrap=function(a){while(a>180)a-=360;while(a<-180)a+=360;return a;};
    var font='600 '+'{s}px Manrope, system-ui, sans-serif';
    var draw=function(now){
      if(!G.pts)return;
      var r=canvas.getBoundingClientRect();if(!r.width)return;
      var dpr=Math.min(window.devicePixelRatio||1,2),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      setCam();
      var g=canvas.getContext('2d'),cx=w/2,cy=h/2,R=Math.min(w,h)*.42;
      g.clearRect(0,0,w,h);
      var sp=g.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);sp.addColorStop(0,'#ffffff');sp.addColorStop(1,'#e3e9f2');
      g.fillStyle=sp;g.beginPath();g.arc(cx,cy,R,0,7);g.fill();
      g.strokeStyle='rgba(14,27,51,.08)';g.lineWidth=dpr;g.stroke();
      /* land dots, batched into 5 alpha buckets */
      var pts=G.pts,s=Math.max(2*dpr,R/110),hs=s/2,B=[[],[],[],[],[]];
      for(var k=0;k<pts.length;k+=2){var p=proj(pts[k],pts[k+1]);if(p[2]<=.03)continue;var b=Math.min(4,(p[2]*5)|0);B[b].push(cx+p[0]*R-hs,cy-p[1]*R-hs);}
      for(var bi=0;bi<5;bi++){var L=B[bi];if(!L.length)continue;g.fillStyle='rgba(14,27,51,'+(.16+.6*(bi+.5)/5).toFixed(2)+')';g.beginPath();for(var j=0;j<L.length;j+=2)g.rect(L[j],L[j+1],s,s);g.fill();}
      /* routes */
      var e=RM?PERIOD-FADE-1:(now-G.t0),act=G.i;
      var arc=function(rt,upto,col,lw){
        var n=Math.round((rt.pts.length-1)*upto),last=null,started=false;g.strokeStyle=col;g.lineWidth=lw;g.beginPath();
        for(var q=0;q<=n;q++){var pp=rt.pts[q],v=proj(pp[0],pp[1]);if(v[2]<-.05){started=false;continue;}var X=cx+v[0]*R*pp[2],Y=cy-v[1]*R*pp[2];if(started)g.lineTo(X,Y);else{g.moveTo(X,Y);started=true;}last=[X,Y,v[2]];}
        g.stroke();return last;
      };
      ROUTES.forEach(function(rt,ri){if(RM||ri!==act){var e2=proj(rt.ll[0],rt.ll[1]);if(e2[2]<0)return;arc(rt,1,RM?'rgba(184,146,77,.75)':'rgba(184,146,77,.22)',(RM?1.4:1)*dpr);g.fillStyle=RM?'#0e1b33':'rgba(14,27,51,.35)';g.beginPath();g.arc(cx+e2[0]*R,cy-e2[1]*R,(RM?3:2.2)*dpr,0,7);g.fill();}});
      if(!RM){
        var rt=ROUTES[act],prog=Math.min(1,e/DRAW),ease=1-Math.pow(1-prog,3),alpha=e>PERIOD-FADE?Math.max(0,(PERIOD-e)/FADE):1;
        g.globalAlpha=alpha;
        var tip=arc(rt,ease,'#b8924d',2*dpr);
        if(tip&&prog<1){g.fillStyle='#b8924d';g.beginPath();g.arc(tip[0],tip[1],3*dpr,0,7);g.fill();}
        if(prog>=1){
          var dp=proj(rt.ll[0],rt.ll[1]),X=cx+dp[0]*R,Y=cy-dp[1]*R;
          g.fillStyle='rgba(199,164,99,.28)';g.beginPath();g.arc(X,Y,9*dpr,0,7);g.fill();
          g.fillStyle='#0e1b33';g.beginPath();g.arc(X,Y,3.6*dpr,0,7);g.fill();
          /* label pill */
          var la=Math.min(1,(e-DRAW)/300),fs=Math.round(12.5*dpr),txt='FXE → '+rt.name;
          g.font=font.replace('{s}',fs);var tw=g.measureText(txt).width,ph=fs*2.1,pw=tw+fs*1.8;
          var px=Math.max(4*dpr,Math.min(w-pw-4*dpr,X-pw/2)),py=Y-ph-12*dpr;if(py<4*dpr)py=Y+12*dpr;
          g.globalAlpha=alpha*la;g.shadowColor='rgba(14,27,51,.18)';g.shadowBlur=14*dpr;g.shadowOffsetY=4*dpr;
          g.fillStyle='#0e1b33';g.beginPath();if(g.roundRect)g.roundRect(px,py,pw,ph,ph/2);else g.rect(px,py,pw,ph);g.fill();
          g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
          g.fillStyle='#fff';g.textBaseline='middle';g.fillText(txt,px+fs*.9,py+ph/2+.5);
        }
        g.globalAlpha=1;
      }
      /* FXE */
      var f=proj(FXE[0],FXE[1]),fx=cx+f[0]*R,fy=cy-f[1]*R;
      g.fillStyle='rgba(199,164,99,.25)';g.beginPath();g.arc(fx,fy,10*dpr,0,7);g.fill();
      g.fillStyle='#c7a463';g.beginPath();g.arc(fx,fy,4.5*dpr,0,7);g.fill();
    };
    var setChip=function(){chips.forEach(function(c,ci){c.classList.toggle('is-on',ci===G.i);});};
    var last=0,raf=0;
    var frame=function(now){
      raf=0;if(!G.running)return;
      var dt=Math.min(.05,(now-(last||now))/1000);last=now;
      if(now-G.t0>=PERIOD){G.i=(G.i+1)%ROUTES.length;G.t0=now;setChip();}
      /* camera: ease toward the active route's midpoint while drifting slowly east→west */
      var rt=ROUTES[G.i],ph=(now-G.t0)/PERIOD,tLon=rt.lon-6+12*ph,tLat=rt.lat,k=Math.min(1,dt*1.6);
      G.lon=wrap(G.lon+wrap(tLon-G.lon)*k);G.lat+= (tLat-G.lat)*k;
      draw(now);raf=requestAnimationFrame(frame);
    };
    var start=function(){if(G.running||RM||!G.pts)return;G.running=true;last=0;var n=performance.now();if(!G.t0)G.t0=n;else G.t0=n-G.pausedAt;raf=requestAnimationFrame(frame);};
    var stop=function(){if(!G.running)return;G.running=false;G.pausedAt=performance.now()-G.t0;if(raf)cancelAnimationFrame(raf);raf=0;};
    var ready=function(){
      G.pts=window.LAND_DOTS||[];
      if(RM){G.lon=-62;G.lat=30;draw(0);return;}
      G.lon=ROUTES[0].lon-6;G.lat=ROUTES[0].lat;setChip();
      if('IntersectionObserver' in window){new IntersectionObserver(function(es){G.visible=es[0].isIntersecting;G.visible&&!d.hidden?start():stop();},{threshold:.05}).observe(canvas);}
      else{G.visible=true;start();}
    };
    d.addEventListener('visibilitychange',function(){if(d.hidden)stop();else if(G.visible)start();});
    var started=false,loadLand=function(){
      if(started)return;started=true;
      var sc=d.createElement('script');sc.src='js/land.js';sc.async=true;sc.onload=ready;d.body.appendChild(sc);
    };
    if('IntersectionObserver' in window){var lio=new IntersectionObserver(function(es){if(es[0].isIntersecting){lio.disconnect();loadLand();}},{rootMargin:'600px 0px'});lio.observe(canvas);}
    else loadLand();
    var rz;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){if(!G.running)draw(performance.now());},150);});
  }
})();

/* Count-up for #by-the-numbers (respects prefers-reduced-motion) */
(function(){var els=document.querySelectorAll('.nums .cnt');if(!els.length||!('IntersectionObserver' in window))return;
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
function f(v,d){return d?v.toFixed(d):Math.round(v).toLocaleString('en-US')}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);var el=e.target,t=parseFloat(el.dataset.to),d=(el.dataset.to.split('.')[1]||'').length,s=null;
function step(ts){if(!s)s=ts;var p=Math.min((ts-s)/1600,1),k=1-Math.pow(1-p,3);el.textContent=f(t*k,d);if(p<1)requestAnimationFrame(step);else el.textContent=f(t,d)}
el.textContent=f(0,d);requestAnimationFrame(step)})},{threshold:.4});
els.forEach(function(el){io.observe(el)})})();

/* WhatsApp float (placeholder number: confirm with client) */
(function(){if(document.querySelector('.wa-fab'))return;var a=document.createElement('a');a.className='wa-fab';a.href='https://wa.me/19547728622?text='+encodeURIComponent("Hi, I'd like a charter quote. From: ___ To: ___ Date: ___");a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Chat with us on WhatsApp');a.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8.9 3.8.8a3.3 3.3 0 0 0 2.2-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.7-.4z"/></svg><span>WhatsApp</span>';document.body.appendChild(a);})();
