/* The Academic OS — free GPA calculator (runs fully in the browser; nothing is sent anywhere) */
(function(){
  'use strict';
  var LANG=(document.documentElement.lang||'en').slice(0,2);
  var T={
    en:{course:'Course',pct:'Percentage',w:'Credits / lessons per week',pts:'Points',ph:'Course',phPct:'0–100',phW:'Credits',rm:'Remove course',
        uw:'Unweighted GPA',wt:'Weighted GPA',avg:'Average %',empty:'Enter at least one percentage to see your GPA.',n:function(n){return n+' course'+(n===1?'':'s')+' counted';}},
    ru:{course:'Предмет',pct:'Процент',w:'Кредиты / уроков в неделю',pts:'Баллы',ph:'Предмет',phPct:'0–100',phW:'Кредиты',rm:'Удалить предмет',
        uw:'Обычный GPA',wt:'Взвешенный GPA',avg:'Средний %',empty:'Введите хотя бы один процент, чтобы увидеть GPA.',n:function(n){return 'Учтено предметов: '+n;}},
    uz:{course:'Fan',pct:'Foiz',w:'Kredit / haftalik darslar',pts:'Ball',ph:'Fan',phPct:'0–100',phW:'Kredit',rm:'Fanni olib tashlash',
        uw:'Oddiy GPA',wt:'Vaznli GPA',avg:"O'rtacha %",empty:"GPA ni ko'rish uchun kamida bitta foiz kiriting.",n:function(n){return 'Hisobga olingan fanlar: '+n;}}
  };
  var L=T[LANG]||T.en;
  var SCALES={
    aos:[[90,4.0,'A*'],[80,3.7,'A'],[70,3.3,'B'],[60,3.0,'C'],[50,2.0,'D'],[0,0.0,'U/F']],
    us:[[93,4.0,'A'],[90,3.7,'A-'],[87,3.3,'B+'],[83,3.0,'B'],[80,2.7,'B-'],[77,2.3,'C+'],[73,2.0,'C'],[70,1.7,'C-'],[67,1.3,'D+'],[63,1.0,'D'],[60,0.7,'D-'],[0,0.0,'F']]
  };
  var KEY='calc_gpa_v1';                      // deliberately NOT prefixed "aos_" so it never mixes with synced app data
  var $=function(id){return document.getElementById(id);};
  var rowsEl=$('rows'); if(!rowsEl) return;
  var state={scale:'aos',rows:[]};

  function blank(){return {name:'',pct:'',w:''};}
  function load(){
    try{var s=JSON.parse(localStorage.getItem(KEY)||'null');
      if(s&&Array.isArray(s.rows)&&s.rows.length){state.rows=s.rows.slice(0,40).map(function(r){return {name:String(r.name||'').slice(0,60),pct:String(r.pct||'').slice(0,6),w:String(r.w||'').slice(0,6)};});
        if(SCALES[s.scale]) state.scale=s.scale;}}catch(e){}
    if(!state.rows.length) for(var i=0;i<4;i++) state.rows.push(blank());
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
  function num(v){var n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:null;}
  function point(p){var sc=SCALES[state.scale];for(var i=0;i<sc.length;i++) if(p>=sc[i][0]) return sc[i];return sc[sc.length-1];}
  function fmt(n,d){var t=n.toFixed(d);return LANG==='en'?t:t.replace('.',',');}   // same separator as the page text in every browser

  function build(){
    rowsEl.innerHTML='';
    state.rows.forEach(function(r,i){
      var row=document.createElement('div'); row.className='row';
      row.innerHTML='<input class="c-name" type="text" maxlength="60" autocomplete="off"/>'+
        '<input class="c-pct" type="text" inputmode="decimal" autocomplete="off"/>'+
        '<input class="c-w" type="text" inputmode="decimal" autocomplete="off"/>'+
        '<div class="pts" aria-hidden="true">–</div><button class="rm" type="button">×</button>';
      var n=row.querySelector('.c-name'),p=row.querySelector('.c-pct'),w=row.querySelector('.c-w'),rm=row.querySelector('.rm');
      n.placeholder=L.ph+' '+(i+1); n.value=r.name; n.setAttribute('aria-label',L.course+' '+(i+1));
      p.placeholder=L.phPct; p.value=r.pct; p.setAttribute('aria-label',L.pct+' '+(i+1));
      w.placeholder=L.phW; w.value=r.w; w.setAttribute('aria-label',L.w+' '+(i+1));
      rm.setAttribute('aria-label',L.rm+' '+(i+1)); rm.title=L.rm;
      n.addEventListener('input',function(){r.name=n.value;save();});
      p.addEventListener('input',function(){r.pct=p.value;save();calc();});
      w.addEventListener('input',function(){r.w=w.value;save();calc();});
      rm.addEventListener('click',function(){if(state.rows.length>1){state.rows.splice(i,1);}else{state.rows[0]=blank();}save();build();calc();});
      rowsEl.appendChild(row);
    });
  }

  function calc(){
    var items=[],cells=rowsEl.children;
    state.rows.forEach(function(r,i){
      var pts=cells[i]&&cells[i].querySelector('.pts'), pct=num(r.pct);
      if(pct===null||pct<0||pct>100){ if(pts) pts.textContent='–'; return; }
      var s=point(pct), w=num(r.w); if(w===null||w<=0) w=1;
      if(pts) pts.innerHTML='<b>'+fmt(s[1],1)+'</b> · '+s[2];
      items.push({pct:pct,pts:s[1],w:w});
    });
    var uw=$('r-uw'),wt=$('r-wt'),av=$('r-avg'),note=$('r-note');
    if(!items.length){uw.textContent=wt.textContent=av.textContent='–';note.textContent=L.empty;return;}
    var sum=0,sw=0,sp=0,sa=0;
    items.forEach(function(x){sum+=x.pts;sp+=x.pts*x.w;sw+=x.w;sa+=x.pct;});
    uw.textContent=fmt(sum/items.length,2); wt.textContent=fmt(sp/sw,2); av.textContent=fmt(sa/items.length,1)+'%';
    note.textContent=L.n(items.length);
  }

  load();
  var sel=$('scale'); if(sel){sel.value=state.scale; sel.addEventListener('change',function(){state.scale=sel.value;save();calc();});}
  $('add').addEventListener('click',function(){if(state.rows.length<40){state.rows.push(blank());save();build();calc();var i=rowsEl.querySelectorAll('.c-name');if(i.length)i[i.length-1].focus();}});
  $('reset').addEventListener('click',function(){state.rows=[blank(),blank(),blank(),blank()];save();build();calc();});
  build(); calc();
  window.__gpaCalc={state:state,point:point,calc:calc};     // exposed for automated tests
})();
