/* ═══════════ AOS UI v2 — visual enhancements only (no app-logic changes) ═══════════ */
(function(){
  try{
    var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine=matchMedia('(pointer:fine)').matches;

    /* cursor-following glow */
    if(fine&&!RM){
      var app=document.getElementById('app');
      if(app){
        var g=document.createElement('div'); g.id='aos-glow'; app.appendChild(g);
        var gx=innerWidth/2, gy=innerHeight/3, tx=gx, ty=gy;
        addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY},{passive:true});
        (function loop(){
          gx+=(tx-gx)*.08; gy+=(ty-gy)*.08;
          g.style.transform='translate('+gx.toFixed(1)+'px,'+gy.toFixed(1)+'px)';
          requestAnimationFrame(loop);
        })();
      }
    }

    /* card spotlight: feeds --mx/--my to the hovered surface */
    var raf=0, last=null;
    document.addEventListener('pointermove',function(e){
      last=e; if(raf) return;
      raf=requestAnimationFrame(function(){
        raf=0;
        var t=last.target&&last.target.closest&&last.target.closest('.glass,.glass2,.stat-card');
        if(!t) return;
        var r=t.getBoundingClientRect();
        t.style.setProperty('--mx',(last.clientX-r.left)+'px');
        t.style.setProperty('--my',(last.clientY-r.top)+'px');
      });
    },{passive:true});

    /* count-up helper */
    function countUp(el){
      var to=parseFloat(el.textContent);
      if(isNaN(to)||RM) return;
      var t0=performance.now(), dur=900;
      (function f(t){
        var p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3);
        el.textContent=Math.round(to*e);
        if(p<1) requestAnimationFrame(f); else el.textContent=to;
      })(t0);
    }

    /* time-aware greeting on the dashboard */
    function greet(){
      var t=document.querySelector('#view-dashboard .page-title');
      if(!t) return;
      var h=new Date().getHours();
      var part=h<5?'Still up':h<12?'Good morning':h<18?'Good afternoon':'Good evening';
      var n='';
      try{ n=((typeof studentInfo!=='undefined'&&studentInfo&&studentInfo.name)||'').trim().split(/\s+/)[0]; }catch(e){}
      t.textContent=part+(n?', ':'.');
      if(n){ var em=document.createElement('em'); em.textContent=n; t.appendChild(em); }
    }

    /* wrap renderDashboard so the greeting + stat counters refresh with it */
    if(typeof renderDashboard==='function'){
      var orig=renderDashboard;
      window.renderDashboard=function(){
        var r=orig.apply(this,arguments);
        try{
          greet();
          document.querySelectorAll('#dash-stats .stat-num').forEach(countUp);
        }catch(e){}
        return r;
      };
    }
    greet();
  }catch(e){ console.warn('AOS UI layer:',e); }
})();
