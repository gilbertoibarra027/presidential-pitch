/* Fleet cards + accessible aircraft detail dialog (fleet.html + homepage "Our Fleet") */
(function(){
  var d=document,data=window.PA_FLEET||[],m=d.getElementById('ac-modal');
  if(!m||!data.length)return;
  var panel=m.querySelector('.acm__panel'),opener=null,byId={};
  data.forEach(function(a){byId[a.id]=a;});
  function q(s){return m.querySelector(s);}
  function txt(el,t){el.textContent=t;}
  function fill(a){
    txt(q('[data-acm="cat"]'),a.cat);txt(q('[data-acm="name"]'),a.name);
    var dl=q('[data-acm="stats"]');dl.innerHTML='';
    a.stats.forEach(function(s){var w=d.createElement('div'),dt=d.createElement('dt'),dd=d.createElement('dd');dt.textContent=s[0];dd.textContent=s[1];w.appendChild(dt);w.appendChild(dd);dl.appendChild(w);});
    var ul=q('[data-acm="am"]');ul.innerHTML='';
    a.am.forEach(function(x){var li=d.createElement('li');li.textContent=x;ul.appendChild(li);});
    q('.acm__am').hidden=!a.am.length;
    var big=q('.acm__img img');big.src='img/fleet/'+a.id+'-ext.webp';big.alt=a.name+' exterior';
    var ins=q('.acm__int img');ins.src='img/fleet/'+a.id+'-int-sm.webp';ins.alt=a.name+' cabin interior';
  }
  function focusables(){return Array.prototype.filter.call(panel.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'),function(x){return x.offsetParent!==null&&!x.disabled;});}
  function onKey(e){
    if(e.key==='Escape'){e.preventDefault();close(true);return;}
    if(e.key!=='Tab')return;
    var f=focusables();if(!f.length)return;var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&(d.activeElement===a||!panel.contains(d.activeElement))){e.preventDefault();z.focus();}
    else if(!e.shiftKey&&(d.activeElement===z||!panel.contains(d.activeElement))){e.preventDefault();a.focus();}
  }
  function open(id,btn){
    var a=byId[id];if(!a)return;opener=btn||null;fill(a);
    m.hidden=false;d.body.classList.add('lock');panel.scrollTop=0;
    requestAnimationFrame(function(){m.classList.add('on');q('.acm__x').focus({preventScroll:true});});
    d.addEventListener('keydown',onKey);
  }
  function close(restore){
    m.classList.remove('on');m.hidden=true;d.body.classList.remove('lock');d.removeEventListener('keydown',onKey);
    if(restore&&opener)opener.focus({preventScroll:true});
  }
  Array.prototype.forEach.call(d.querySelectorAll('[data-ac]'),function(b){b.addEventListener('click',function(){open(b.getAttribute('data-ac'),b);});});
  Array.prototype.forEach.call(m.querySelectorAll('[data-acm-close]'),function(b){b.addEventListener('click',function(){close(true);});});
  /* Schedule CTA inside the dialog: close this dialog first (capture runs before main.js handlers), then main.js opens the trip sheet / booking bar */
  m.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-book]');if(t)close(false);},true);
  /* deep link: fleet.html#falcon-7x opens that aircraft */
  var h=location.hash.slice(1);if(h&&byId[h]){var b=d.querySelector('[data-ac="'+h+'"]');open(h,b);}
  /* homepage scroller arrows */
  Array.prototype.forEach.call(d.querySelectorAll('[data-scroll]'),function(b){
    var track=d.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click',function(){var c=track.querySelector('.ac');var w=c?c.getBoundingClientRect().width+20:300;track.scrollBy({left:(b.getAttribute('data-scroll')==='next'?1:-1)*w,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
  });
})();
