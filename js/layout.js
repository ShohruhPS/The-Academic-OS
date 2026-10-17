/* ═══════════ AOS layout v3 — builds the top bar + account menu (moves existing nodes, no logic changes) ═══════════ */
(function(){
  try{
    var sb=document.getElementById('sidebar'), main=document.getElementById('main'), content=document.getElementById('content');
    if(!sb||!main||!content) return;

    /* 1 · wrap nav text so labels can fade in when the rail expands */
    sb.querySelectorAll('.nav-item').forEach(function(it){
      Array.prototype.slice.call(it.childNodes).forEach(function(n){
        if(n.nodeType===3&&n.textContent.trim()){
          var s=document.createElement('span'); s.className='nav-label'; s.textContent=n.textContent.trim();
          it.replaceChild(s,n);
        }
      });
    });

    /* 2 · top bar */
    var ICON_HELP='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.5 2.5 0 115 0c0 1.7-2.5 2-2.5 3.8M12 17h.01"/></svg>';
    var tb=document.createElement('header'); tb.id='topbar';
    tb.innerHTML=
      '<div class="tb-left"><img id="tb-logo" src="logo.svg" alt=""/>'+
        '<div class="tb-crumb"><b>The Academic OS</b><i></i><span id="tb-view">Dashboard</span></div></div>'+
      '<div class="tb-right">'+
        '<button class="tb-btn" id="tb-tips" type="button" aria-label="Show tips for this page" title="Show tips for this page">'+ICON_HELP+'</button>'+
        '<button class="tb-btn tb-avatar" id="tb-acct" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="acct-menu" aria-label="Account menu"><span id="tb-initial">A</span></button>'+
      '</div>';
    main.insertBefore(tb,content);

    /* live clock → chip in the top bar (same element, so tick() keeps updating it) */
    var clock=document.getElementById('live-clock');
    if(clock) tb.querySelector('.tb-right').insertBefore(clock,document.getElementById('tb-tips'));

    /* 3 · account menu — re-homes the old sidebar bottom block (stats, account, export/import, contact) */
    var menu=document.createElement('div'); menu.id='acct-menu'; menu.setAttribute('role','dialog'); menu.setAttribute('aria-label','Account');
    menu.innerHTML=
      '<div class="am-head"><div class="am-av" id="am-initial">A</div><div><div class="am-name" id="am-name">Student</div><div class="am-sub">Academic OS</div></div></div>'+
      '<div class="am-body"></div>'+
      '<div class="am-foot">'+
        '<button class="am-link" id="am-replay" type="button">'+ICON_HELP+'Replay tips for this page</button>'+
        '<button class="am-link" id="am-reset" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/></svg>Reset all tips</button>'+
      '</div>';
    var nb=sb.querySelector('.nav-bottom');
    if(nb) menu.querySelector('.am-body').appendChild(nb);
    tb.appendChild(menu);

    function identity(){
      var user=((document.getElementById('auth-account-username')||{}).textContent||'').replace(/^@/,'').trim();
      var name='';
      try{ name=(typeof studentInfo!=='undefined'&&studentInfo&&studentInfo.name)||''; }catch(e){}
      var label=(name||user||'Student').trim();
      var ch=label.charAt(0).toUpperCase()||'A';
      document.getElementById('tb-initial').textContent=ch;
      document.getElementById('am-initial').textContent=ch;
      document.getElementById('am-name').textContent=label;
    }
    var au=document.getElementById('auth-account-username');
    if(au&&window.MutationObserver) new MutationObserver(identity).observe(au,{childList:true,characterData:true,subtree:true});
    identity(); setTimeout(identity,1500);

    var acct=document.getElementById('tb-acct');
    function setMenu(open){
      menu.classList.toggle('open',open); acct.setAttribute('aria-expanded',open?'true':'false');
      if(open) identity();
    }
    acct.addEventListener('click',function(e){ e.stopPropagation(); setMenu(!menu.classList.contains('open')); });
    document.addEventListener('click',function(e){ if(menu.classList.contains('open')&&!menu.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&menu.classList.contains('open')){ setMenu(false); acct.focus(); } });

    /* tips buttons (tour.js provides window.AOSTour) */
    document.getElementById('tb-tips').addEventListener('click',function(){ if(window.AOSTour) window.AOSTour.replay(); });
    document.getElementById('am-replay').addEventListener('click',function(){ setMenu(false); if(window.AOSTour) window.AOSTour.replay(); });
    document.getElementById('am-reset').addEventListener('click',function(){ setMenu(false); if(window.AOSTour) window.AOSTour.reset(); });

    /* 4 · breadcrumb follows the current view */
    var NAMES={dashboard:'Dashboard',grades:'Grades',gradesheet:'Grade & GPA Engine',loom:'The Loom',vault:'Knowledge Vault',revision:'Revision',timetable:'Timetable',focus:'Focus',manual:'Manual'};
    var crumb=document.getElementById('tb-view');
    function setCrumb(id){ if(crumb) crumb.textContent=NAMES[id]||id; }
    if(typeof switchView==='function'){
      var orig=switchView;
      window.switchView=function(id){
        var r=orig.apply(this,arguments);
        try{ setCrumb(id); }catch(e){}
        return r;
      };
    }
    var act=document.querySelector('.view.active'); if(act) setCrumb(act.id.replace('view-',''));
  }catch(e){ console.warn('AOS layout:',e); }
})();
