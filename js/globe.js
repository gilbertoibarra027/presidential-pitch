/* Dark dotted globe: canvas 2D orthographic projection */
(function(){
  'use strict';
  var D2R=Math.PI/180, FXE=[26.197,-80.171];
  function Globe(canvas,opts){
    this.c=canvas;this.ctx=canvas.getContext('2d');
    this.pts=window.LAND_DOTS||[];
    this.base=opts&&opts.lon!=null?opts.lon:90;this.amp=40;this.rot=this.base; // view centre longitude (negated); sways around the Americas
    this.tilt=22*D2R;this.speed=(opts&&opts.speed)||4; // deg per second
    this.target=null;this.arcT=0;this.running=false;this.last=0;this.static=!!(opts&&opts.static);
    this.resize=this.resize.bind(this);this.frame=this.frame.bind(this);
    window.addEventListener('resize',this.resize);this.resize();
  }
  Globe.prototype.resize=function(){
    var r=this.c.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    this.w=Math.max(1,Math.round(r.width*dpr));this.h=Math.max(1,Math.round(r.height*dpr));
    this.c.width=this.w;this.c.height=this.h;this.dpr=dpr;this.draw();
  };
  Globe.prototype.setTarget=function(lat,lon){this.target=[lat,lon];this.arcT=0;if(this.static){this.arcT=1;this.draw();}};
  // project lat/lon -> [x,y,z] in unit sphere (z>0 = facing viewer)
  Globe.prototype.proj=function(lat,lon){
    var la=lat*D2R,lo=(lon+this.rot)*D2R;
    var x=Math.cos(la)*Math.sin(lo),y=Math.sin(la),z=Math.cos(la)*Math.cos(lo);
    var ct=Math.cos(this.tilt),st=Math.sin(this.tilt);
    var y2=y*ct-z*st,z2=y*st+z*ct;
    return [x,y2,z2];
  };
  Globe.prototype.draw=function(){
    var g=this.ctx,w=this.w,h=this.h,cx=w/2,cy=h/2,R=Math.min(w,h)*0.46,dpr=this.dpr;
    g.clearRect(0,0,w,h);
    // atmosphere
    var at=g.createRadialGradient(cx,cy,R*.96,cx,cy,R*1.14);
    at.addColorStop(0,'rgba(199,164,99,.16)');at.addColorStop(1,'rgba(199,164,99,0)');
    g.fillStyle=at;g.beginPath();g.arc(cx,cy,R*1.14,0,Math.PI*2);g.fill();
    // sphere
    var sp=g.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);
    sp.addColorStop(0,'#232838');sp.addColorStop(.65,'#12141c');sp.addColorStop(1,'#07080b');
    g.fillStyle=sp;g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.fill();
    // graticule
    g.lineWidth=.6*dpr;g.strokeStyle='rgba(255,255,255,.05)';
    var self=this;
    function line(fn,steps){g.beginPath();var pen=false;for(var i=0;i<=steps;i++){var p=fn(i/steps);if(p[2]>0){var X=cx+p[0]*R,Y=cy-p[1]*R;if(pen)g.lineTo(X,Y);else g.moveTo(X,Y);pen=true;}else pen=false;}g.stroke();}
    for(var la=-60;la<=60;la+=30)line(function(t){return self.proj(la,-180+360*t);},90);
    for(var lo=-180;lo<180;lo+=30)line(function(t){return self.proj(-90+180*t,lo);},60);
    // land dots
    var pts=this.pts,s=Math.max(1.6*dpr,R/220);
    for(var k=0;k<pts.length;k+=2){
      var p=this.proj(pts[k],pts[k+1]);if(p[2]<=0.02)continue;
      var a=0.1+0.85*Math.pow(p[2],.8);
      g.fillStyle='rgba(232,226,214,'+a.toFixed(3)+')';
      g.fillRect(cx+p[0]*R-s/2,cy-p[1]*R-s/2,s,s);
    }
    // rim light
    var rim=g.createRadialGradient(cx,cy,R*.82,cx,cy,R);
    rim.addColorStop(0,'rgba(255,255,255,0)');rim.addColorStop(1,'rgba(226,200,143,.22)');
    g.fillStyle=rim;g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.fill();
    // arc FXE -> target (great circle)
    if(this.target){
      var a1=toV(FXE),a2=toV(this.target),om=Math.acos(Math.max(-1,Math.min(1,dot(a1,a2)))),N=64,tEnd=easeOut(this.arcT);
      g.beginPath();var pen=false,lastP=null;
      for(var i=0;i<=N*tEnd;i++){
        var t=i/N,v=slerp(a1,a2,om,t),lift=1+Math.sin(Math.PI*t)*Math.min(.18,om*.12);
        var ll=toLL(v),q=this.proj(ll[0],ll[1]);
        if(q[2]>-.05){var X=cx+q[0]*R*lift,Y=cy-q[1]*R*lift;if(pen)g.lineTo(X,Y);else g.moveTo(X,Y);pen=true;lastP=[X,Y,q[2]];}else pen=false;
      }
      g.strokeStyle='rgba(226,200,143,.95)';g.lineWidth=1.6*dpr;g.shadowColor='rgba(226,200,143,.8)';g.shadowBlur=8*dpr;g.stroke();g.shadowBlur=0;
      var tp=this.proj(this.target[0],this.target[1]);
      if(tEnd>.98&&tp[2]>0)this.pin(cx+tp[0]*R,cy-tp[1]*R,'#fff',3);
      else if(lastP)this.pin(lastP[0],lastP[1],'#fff',2);
    }
    var f=this.proj(FXE[0],FXE[1]);
    if(f[2]>0)this.pin(cx+f[0]*R,cy-f[1]*R,'#c7a463',4,true);
  };
  Globe.prototype.pin=function(x,y,col,r,halo){
    var g=this.ctx,d=this.dpr;
    if(halo){var pulse=(performance.now()%2400)/2400;g.beginPath();g.arc(x,y,(r+pulse*14)*d,0,Math.PI*2);g.strokeStyle='rgba(199,164,99,'+(0.7*(1-pulse)).toFixed(3)+')';g.lineWidth=1*d;g.stroke();}
    g.beginPath();g.arc(x,y,r*d,0,Math.PI*2);g.fillStyle=col;g.fill();
  };
  Globe.prototype.frame=function(now){
    if(!this.running)return;
    var dt=Math.min(.05,(now-(this.last||now))/1000);this.last=now;
    this.phase=(this.phase||0)+dt*.16;this.rot=this.base+this.amp*Math.sin(this.phase);
    if(this.target&&this.arcT<1)this.arcT=Math.min(1,this.arcT+dt/1.4);
    this.draw();requestAnimationFrame(this.frame);
  };
  Globe.prototype.start=function(){if(this.running||this.static)return;this.running=true;this.last=0;requestAnimationFrame(this.frame);};
  Globe.prototype.stop=function(){this.running=false;};
  function toV(ll){var la=ll[0]*D2R,lo=ll[1]*D2R;return [Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)];}
  function toLL(v){return [Math.asin(v[2])/D2R,Math.atan2(v[1],v[0])/D2R];}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function slerp(a,b,om,t){if(om<1e-6)return a;var s=Math.sin(om),k1=Math.sin((1-t)*om)/s,k2=Math.sin(t*om)/s;return [a[0]*k1+b[0]*k2,a[1]*k1+b[1]*k2,a[2]*k1+b[2]*k2];}
  function easeOut(t){return 1-Math.pow(1-t,3);}
  window.Globe=Globe;
})();
