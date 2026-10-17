/* ═══════════ AOS guided tips — first-time spotlight tours, Adobe-style ═══════════
   Dims the page, spotlights the real control, draws an arrow to it and explains it in a small box.
   Each page's tour auto-plays once (the first time you open it). Replay any time from the "?" button.
   Nothing here touches app data; it only stores which tips were seen in localStorage.            */
(function(){
  'use strict';
  var KEY='aos_tips_seen_v1', OFF='aos_tips_off';
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
  function seen(){ try{ return JSON.parse(lsGet(KEY)||'{}')||{}; }catch(e){ return {}; } }
  function mark(ids){ var s=seen(); ids.forEach(function(i){ s[i]=1; }); lsSet(KEY,JSON.stringify(s)); }
  function isOff(){ return lsGet(OFF)==='1'; }
  function q(sel){ return document.querySelector(sel); }
  function parentOf(sel){ var e=q(sel); return e&&e.parentElement; }
  function closestOf(sel,anc){ var e=q(sel); return e&&e.closest(anc); }

  /* ---------- the tours ---------- */
  var TOURS={
    welcome:[
      {sel:'#sidebar',pad:4,place:'right',title:'Your toolbox',
       body:'Every tool lives in this bar. Tap an icon to jump in. On a computer, hover over the bar to see the names.'},
      {sel:'#tb-acct',place:'bottom',title:'Account & backups',
       body:'Open this menu to export a backup, set a recovery email or log out. Your data syncs to the cloud automatically.'},
      {sel:'#tb-tips',place:'bottom',title:'Tips are always here',
       body:'Stuck on a page? Press this button to replay its short tour any time.'}
    ],
    dashboard:[
      {sel:'#daily-queue-card',place:'bottom',title:'Today\u2019s priority queue',
       body:'The app ranks what needs you first, from overdue tasks to topics due for review. Press \u201cGo\u201d on a row to jump straight to it.'},
      {sel:function(){ return closestOf('#gpa-uw-num','.glass2'); },place:'top',title:'Your GPA, live',
       body:'Unweighted and weighted GPA update the moment you change a mark. Add your subjects in the Grade & GPA Engine.'},
      {sel:'#subject-cards',place:'top',title:'Subject snapshot',
       body:'One card per subject with your current percentage and grade, so weak spots stand out at a glance.'},
      {sel:'#heatmap-dash',place:'top',title:'Study streak',
       body:'Every day you log revision lights up a square. Keep the chain going.'}
    ],
    gradesheet:[
      {sel:'[onclick*="addGSSubject"]',place:'bottom',title:'Start here: add a subject',
       body:'Pick a subject, choose how many tests it has and how much tests count against the final exam.'},
      {sel:'#gs-tbody tr',place:'bottom',title:'Type marks, see results',
       body:'Enter scores straight into the table. Averages, final grade and GPA points recalculate instantly.'},
      {sel:'#gs-summary',place:'bottom',title:'Your summary',
       body:'Top grades, unweighted GPA and weighted GPA, always in sync with the table below.'},
      {sel:'[onclick*="openGPASettingsModal"]',place:'bottom',title:'Match your school\u2019s scale',
       body:'Change how percentages convert to GPA points if your school uses a different scale.'},
      {sel:'#gs-gpa-panel',place:'top',title:'Target planner',
       body:'Set the GPA you want and the planner shows what you need on your remaining tests to get there.'},
      {sel:'[onclick*="exportGSPDF"]',place:'bottom',title:'Take it with you',
       body:'Export your results as a PDF to print or share.'}
    ],
    loom:[
      {sel:'[onclick*="openTaskModal"]',place:'bottom',title:'Add a task',
       body:'Give it a subject, a due date and an energy level. The Loom uses these to decide what to suggest next.'},
      {sel:function(){ return parentOf('#task-filter-subj'); },place:'bottom',title:'Filter and sort',
       body:'Narrow the list by subject or energy level, or sort by what is due soonest.'},
      {sel:'#weekly-load',place:'bottom',title:'Weekly load',
       body:'See how heavy each day is so you can spread work out before a deadline sneaks up.'},
      {sel:'#tasks-list',place:'top',title:'Your tasks',
       body:'Tick a task off when it is done. Overdue ones are flagged so they never get buried.'}
    ],
    vault:[
      {sel:'[onclick*="newNote"]',place:'bottom',title:'Write a note',
       body:'Notes support Markdown, LaTeX formulas like $E=mc^2$, file attachments and one-click EN\u2194RU\u2194UZ translation.'},
      {sel:function(){ return parentOf('#vault-search'); },place:'bottom',title:'Find anything fast',
       body:'Search by title, text or tag, or filter by subject.'},
      {sel:'#notes-grid',place:'top',title:'Your notes',
       body:'Click a note to open it. Everything is saved to your account and synced across devices.'}
    ],
    revision:[
      {sel:'[onclick*="openRevSessionModal"]',place:'bottom',title:'Log a session',
       body:'Record what you revised and for how long. It builds your streak and feeds your priority queue.'},
      {sel:'#heatmap-rev',place:'bottom',title:'Revision heatmap',
       body:'A year of study at a glance. Darker squares mean longer sessions.'},
      {sel:'#revision-list',place:'top',title:'Confidence ratings',
       body:'Rate how confident you feel in each subject. Lower confidence brings it back into your queue sooner.'}
    ],
    timetable:[
      {sel:'#tt-live-banner',place:'bottom',title:'Live: now & next',
       body:'Shows the lesson happening right now and a countdown to the next one.'},
      {sel:'#tt-container',place:'top',title:'Your week',
       body:'Click any lesson to edit it, or use the \u201c+\u201d row in a day to add a new slot.'}
    ],
    focus:[
      {sel:'#focus-timer-card',place:'right',title:'Pomodoro timer',
       body:'Work in focused blocks with short breaks. Finished sessions are counted for you.'},
      {sel:'#focus-start-btn',place:'top',title:'Press start',
       body:'Begin a session. The ring fills as time passes, and you get a notification when it ends.'},
      {sel:function(){ return closestOf('[onclick*="adjustDuration"]','.glass,.glass2,div'); },place:'top',title:'Set your own lengths',
       body:'Change the focus and break durations. New values apply after you reset the timer.'},
      {sel:function(){ return parentOf('.sound-option'); },place:'left',title:'Ambient sound',
       body:'Generated white, pink, brown or green noise to mask distractions. No downloads needed.'}
    ]
  };

  /* ---------- state + DOM ---------- */
  var root,spot,card,svg,line,head,elCount,elTitle,elBody,elDots,btnBack,btnNext,btnOff,btnX;
  var steps=[],ids=[],idx=0,active=false,target=null,lastRect='',lastArrow='',redraw=false,track=null,prevFocus=null,pending=0;

  function build(){
    root=document.createElement('div'); root.id='aos-tour'; root.setAttribute('role','dialog'); root.setAttribute('aria-modal','true'); root.setAttribute('aria-labelledby','tr-title');
    root.innerHTML=
      '<div class="tr-spot"></div>'+
      '<svg class="tr-arrow" aria-hidden="true"><path class="tr-line"/><path class="tr-head"/></svg>'+
      '<div class="tr-card">'+
        '<div class="tr-top"><span class="tr-count"></span><button class="tr-x" type="button" aria-label="Close tips">\u00d7</button></div>'+
        '<h3 class="tr-title" id="tr-title"></h3><p class="tr-body"></p>'+
        '<div class="tr-foot"><div class="tr-dots"></div><div class="tr-btns"><button class="tr-back" type="button">Back</button><button class="tr-next" type="button">Next</button></div></div>'+
        '<button class="tr-off" type="button">Don\u2019t show tips again</button>'+
      '</div>';
    document.body.appendChild(root);
    spot=root.querySelector('.tr-spot'); card=root.querySelector('.tr-card'); svg=root.querySelector('.tr-arrow');
    line=root.querySelector('.tr-line'); head=root.querySelector('.tr-head');
    elCount=root.querySelector('.tr-count'); elTitle=root.querySelector('.tr-title'); elBody=root.querySelector('.tr-body'); elDots=root.querySelector('.tr-dots');
    btnBack=root.querySelector('.tr-back'); btnNext=root.querySelector('.tr-next'); btnOff=root.querySelector('.tr-off'); btnX=root.querySelector('.tr-x');
    btnNext.addEventListener('click',function(){ idx>=steps.length-1?finish():show(idx+1); });
    btnBack.addEventListener('click',function(){ if(idx>0) show(idx-1); });
    btnX.addEventListener('click',function(){ finish(); });
    btnOff.addEventListener('click',function(){ lsSet(OFF,'1'); finish(); });
    root.addEventListener('mousedown',function(e){ if(!card.contains(e.target)){ card.classList.remove('nudge'); void card.offsetWidth; card.classList.add('nudge'); } });
    var stop=function(e){ if(!card.contains(e.target)) e.preventDefault(); };
    root.addEventListener('wheel',stop,{passive:false});
    root.addEventListener('touchmove',stop,{passive:false});
  }

  function resolve(sel){
    var el=null;
    try{ el=typeof sel==='function'?sel():q(sel); }catch(e){}
    if(!el) return null;
    var r=el.getBoundingClientRect();
    return (r.width>2&&r.height>2)?el:null;
  }

  /* ---------- geometry ---------- */
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

  function layout(first){
    if(!active||!target) return;
    var st=steps[idx], vw=innerWidth, vh=innerHeight;
    var r=target.getBoundingClientRect(), pad=st.pad!=null?st.pad:8;
    var sx=r.left-pad, sy=r.top-pad, sw=r.width+pad*2, sh=r.height+pad*2;
    if(sy<6){ sh+=sy-6; sy=6; }
    if(sy+sh>vh-6) sh=vh-6-sy;
    var rad=(parseFloat(getComputedStyle(target).borderTopLeftRadius)||8)+pad*.7;
    if(first){ spot.style.transition='none'; }
    spot.style.left=sx+'px'; spot.style.top=sy+'px'; spot.style.width=sw+'px'; spot.style.height=sh+'px'; spot.style.borderRadius=rad+'px';
    if(first){ void spot.offsetWidth; spot.style.transition=''; }

    var cw=card.offsetWidth, ch=card.offsetHeight, gap=vw<600?44:62, m=12;
    var fits={
      bottom:vh-(sy+sh)-gap-m>=ch, top:sy-gap-m>=ch,
      right:vw-(sx+sw)-gap-m>=cw,  left:sx-gap-m>=cw
    };
    var opp={bottom:'top',top:'bottom',left:'right',right:'left'};
    var order=[st.place||'bottom',opp[st.place||'bottom'],'bottom','top','right','left'], place=null;
    for(var i=0;i<order.length;i++){ if(fits[order[i]]){ place=order[i]; break; } }
    var cx,cy;
    if(!place){                                  /* target too big: dock the card at the bottom, no arrow */
      cx=clamp(vw/2-cw/2,m,vw-cw-m); cy=vh-ch-16; line.setAttribute('d',''); head.setAttribute('d',''); lastArrow='';
    }else{
      if(place==='bottom'){ cx=clamp(sx+sw/2-cw/2,m,vw-cw-m); cy=sy+sh+gap; }
      else if(place==='top'){ cx=clamp(sx+sw/2-cw/2,m,vw-cw-m); cy=sy-gap-ch; }
      else if(place==='right'){ cx=sx+sw+gap; cy=clamp(sy+sh/2-ch/2,m,vh-ch-m); }
      else { cx=sx-gap-cw; cy=clamp(sy+sh/2-ch/2,m,vh-ch-m); }
    }
    if(first){ card.style.transition='none'; }
    card.style.left=cx+'px'; card.style.top=cy+'px';
    if(first){ void card.offsetWidth; card.style.transition=''; }
    if(place) arrow(place,sx,sy,sw,sh,cx,cy,cw,ch);
  }

  function arrow(place,sx,sy,sw,sh,cx,cy,cw,ch){
    var s,e,c;
    if(place==='bottom'||place==='top'){
      var ex=clamp(sx+sw/2,sx+14,sx+sw-14), sx2=clamp(ex,cx+30,cx+cw-30);
      e={x:ex,y:place==='bottom'?sy+sh+6:sy-6}; s={x:sx2,y:place==='bottom'?cy-4:cy+ch+4};
      c={x:(s.x+e.x)/2+(e.x>=s.x?-34:34),y:(s.y+e.y)/2};
    }else{
      var ey=clamp(sy+sh/2,sy+14,sy+sh-14), sy2=clamp(ey,cy+30,cy+ch-30);
      e={x:place==='right'?sx+sw+6:sx-6,y:ey}; s={x:place==='right'?cx-4:cx+cw+4,y:sy2};
      c={x:(s.x+e.x)/2,y:(s.y+e.y)/2+(e.y>=s.y?-34:34)};
    }
    var d='M'+Math.round(s.x)+' '+Math.round(s.y)+' Q'+Math.round(c.x)+' '+Math.round(c.y)+' '+Math.round(e.x)+' '+Math.round(e.y);
    if(d===lastArrow) return;                     /* same arrow: don't restart its draw animation */
    lastArrow=d;
    line.setAttribute('d',d);
    var a=Math.atan2(e.y-c.y,e.x-c.x), L=12, w=.5;
    var p1={x:e.x-L*Math.cos(a-w),y:e.y-L*Math.sin(a-w)}, p2={x:e.x-L*Math.cos(a+w),y:e.y-L*Math.sin(a+w)};
    head.setAttribute('d','M'+p1.x.toFixed(1)+' '+p1.y.toFixed(1)+' L'+e.x.toFixed(1)+' '+e.y.toFixed(1)+' L'+p2.x.toFixed(1)+' '+p2.y.toFixed(1));
    var len=0; try{ len=line.getTotalLength(); }catch(x){}
    line.style.setProperty('--len',len); line.style.strokeDasharray=len||'';
    if(redraw||!svg.classList.contains('draw')){   /* animate only on a new step; later re-measures just move the arrow */
      redraw=false; svg.classList.remove('draw'); void svg.getBoundingClientRect(); svg.classList.add('draw');
    }
  }

  /* ---------- flow ---------- */
  function show(i,first){
    var st=steps[i];
    var el=resolve(st.sel);
    if(!el){                                         /* target vanished: skip forward (or finish) */
      var dir=i>=idx?1:-1, ni=i+dir;
      if(ni<0||ni>=steps.length){ finish(); return; }
      show(ni,first); return;
    }
    idx=i; target=el; lastArrow=''; redraw=true;
    try{ el.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'}); }catch(e){}
    elCount.textContent=(i+1)+' of '+steps.length;
    elTitle.textContent=st.title; elBody.textContent=st.body;
    elDots.innerHTML=''; steps.forEach(function(_,k){ var d=document.createElement('i'); if(k===i) d.className='on'; elDots.appendChild(d); });
    btnBack.style.visibility=i>0?'visible':'hidden';
    btnNext.textContent=i>=steps.length-1?'Got it':'Next';
    card.classList.remove('swap','nudge'); void card.offsetWidth; card.classList.add('swap');
    requestAnimationFrame(function(){ layout(!!first); setTimeout(function(){ layout(false); },420); });
    btnNext.focus({preventScroll:true});
  }

  function start(run,opts){
    if(active) return false;
    var built=[];
    run.forEach(function(id){ (TOURS[id]||[]).forEach(function(s){ if(resolve(s.sel)) built.push(s); }); });
    if(!built.length){ if(!(opts&&opts.manual)) mark(run); return false; }
    if(!root) build();
    steps=built; ids=run.slice(); active=true; prevFocus=document.activeElement;
    root.classList.add('on'); document.body.classList.add('aos-touring');
    show(0,true);
    track=setInterval(function(){
      if(!target||!document.body.contains(target)){ var el=resolve(steps[idx].sel); if(el) target=el; else return; }
      var r=target.getBoundingClientRect(), k=[r.left,r.top,r.width,r.height].map(Math.round).join();
      if(k!==lastRect){ lastRect=k; layout(false); }
    },300);
    return true;
  }

  function finish(){
    if(!active) return;
    active=false; clearInterval(track); mark(ids);
    root.classList.remove('on'); document.body.classList.remove('aos-touring');
    line.setAttribute('d',''); head.setAttribute('d',''); lastArrow='';
    if(prevFocus&&prevFocus.focus){ try{ prevFocus.focus({preventScroll:true}); }catch(e){} }
    target=null;
  }

  document.addEventListener('keydown',function(e){
    if(!active) return;
    if(e.key==='Escape'){ e.preventDefault(); finish(); }
    else if(e.key==='ArrowRight'){ e.preventDefault(); idx>=steps.length-1?finish():show(idx+1); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); if(idx>0) show(idx-1); }
    else if(e.key==='Tab'){
      var f=[btnX,btnBack,btnNext,btnOff].filter(function(b){ return b.style.visibility!=='hidden'; });
      var i=f.indexOf(document.activeElement);
      e.preventDefault(); f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();
    }
  });
  addEventListener('resize',function(){ if(active) layout(false); });

  /* ---------- auto-play (first visit to each page) ---------- */
  function blocked(){
    var gate=document.getElementById('auth-gate');
    if(gate&&getComputedStyle(gate).display!=='none') return true;
    var ob=document.getElementById('onboarding-overlay');
    if(ob&&getComputedStyle(ob).display!=='none') return true;
    var ms=document.querySelectorAll('.modal-overlay');
    for(var i=0;i<ms.length;i++) if(getComputedStyle(ms[i]).display!=='none') return true;
    var ne=document.getElementById('note-editor'); if(ne&&ne.classList.contains('open')) return true;
    return false;
  }
  function curView(){ var a=document.querySelector('.view.active'); return a?a.id.replace('view-',''):'dashboard'; }
  function runFor(id){
    var s=seen(), run=[];
    if(id==='dashboard'&&!s.welcome) run.push('welcome');
    if(TOURS[id]&&!s[id]) run.push(id);
    return run;
  }
  function wait(id,token){
    if(token!==pending||isOff()) return;
    if(curView()!==id) return;
    var run=runFor(id); if(!run.length) return;
    if(active||blocked()){ setTimeout(function(){ wait(id,token); },1500); return; }
    if(!start(run)) return;
  }
  function schedule(id,delay){ var t=++pending; setTimeout(function(){ wait(id,t); },delay); }

  if(typeof switchView==='function'){
    var orig=switchView;
    window.switchView=function(id){
      var r=orig.apply(this,arguments);
      if(active) finish();
      try{ schedule(id,1150); }catch(e){}
      return r;
    };
  }

  /* ---------- public API ---------- */
  window.AOSTour={
    replay:function(){
      if(active){ finish(); return; }
      var id=curView(), run=(id==='dashboard'?['welcome','dashboard']:TOURS[id]?[id]:['welcome']);
      pending++; start(run,{manual:true});
    },
    reset:function(){ lsDel(KEY); lsDel(OFF); this.replay(); }
  };

  /* first load: the dashboard is already showing, so no switchView call will happen */
  schedule(curView(),2600);
})();
