function switchView(id,el){
document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
document.getElementById('view-'+id).classList.add('active');
document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
el.classList.add('active');
currentView=id;
if(id==='dashboard')renderDashboard();
else if(id==='grades')renderGradeSheet();
else if(id==='gradesheet')renderGradeSheet();
else if(id==='loom')renderLoom();
else if(id==='vault')renderNotes();
else if(id==='revision')renderRevision();
else if(id==='timetable')renderTimetable();
else if(id==='focus')renderFocus();
else if(id==='manual'){/* static content, nothing to render */}
}
function heatmapHTML(){
const today=new Date(),W=16;let h='<div class="hmap">';
for(let w=0;w<W;w++){h+='<div class="hmap-col">';
for(let d=0;d<7;d++){
const dt=new Date(today);dt.setDate(today.getDate()-(W-1-w)*7-(today.getDay()||7)+d+1);
const ds=localDateStr(dt);let i=0;
Object.entries(confidence).forEach(([sid,c])=>{const n=parseDay(c.lastReview);n.setDate(n.getDate()+srInt(c.score));if(localDateStr(n)===ds)i=Math.max(i,6-c.score);});
const bg=i===0?'rgba(255,255,255,.05)':i===1?'rgba(16,185,129,.25)':i===2?'rgba(245,158,11,.4)':i===3?'rgba(225,29,72,.5)':'rgba(225,29,72,.85)';
const isTd=ds===localDateStr(today);
h+=`<div class="hmap-cell" style="background:${bg};${isTd?'outline:2px solid var(--blue);outline-offset:1px':''}" title="${ds}"></div>`;
}h+='</div>';}return h+'</div>';
}
function animateNum(id,target,dec=2){
const el=document.getElementById(id);if(!el)return;
const s=performance.now(),dur=900;
function f(ts){const p=Math.min((ts-s)/dur,1),e=1-Math.pow(1-p,3);el.textContent=(target*e).toFixed(dec);if(p<1)requestAnimationFrame(f);else el.textContent=target.toFixed(dec);}
requestAnimationFrame(f);
}
function renderDashboard(){
document.getElementById('dash-date').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
const uwGPA=gsUnweightedGPA();
const wGPA=gsWeightedGPA();
animateNum('gpa-uw-num',uwGPA);
animateNum('gpa-w-num',wGPA);
document.getElementById('gpa-uw-num').style.color=gpaColor(uwGPA);
document.getElementById('gpa-w-num').style.color=gpaColor(wGPA);
document.getElementById('gpa-uw-bar').style.width=uwGPA/4*100+'%';
document.getElementById('gpa-uw-bar').style.background=gpaColor(uwGPA);
document.getElementById('gpa-w-bar').style.width=wGPA/4*100+'%';
document.getElementById('gpa-w-bar').style.background=gpaColor(wGPA);
const pending=tasks.filter(t=>!t.done).length,prio=SUBJECTS.filter(s=>isPrio(s.id)).length;
document.getElementById('dash-stats').innerHTML=[
{icon:'📊',val:grades.length,label:'Grades Recorded',c:'var(--blue)'},
{icon:'✏️',val:pending,label:'Pending Tasks',c:'var(--amber)'},
{icon:'🔥',val:prio,label:'Priority Mode Active',c:'var(--ruby)'},
].map((s,i)=>`<div class="stat-card" style="animation-delay:${i*0.07}s"><div style="font-size:18px;margin-bottom:8px">${s.icon}</div><div class="stat-num" style="color:${s.c}">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');
const gsRows=gradeSheet.map(r=>({...r,...gsCalc(r)})).filter(r=>r.rawPct!=null);
const colors=['#3b82f6','#60a5fa','#38bdf8','#34d399','#a78bfa','#e11d48','#f43f5e','#fb923c','#10b981','#f59e0b','#8b5cf6'];
document.getElementById('subject-cards').innerHTML=gsRows.length?gsRows.map((r,i)=>{
const col=gpaColor(r.uwGPA||0);
const bg=colors[i%colors.length];
const dim=bg.startsWith('#')?bg+'22':bg;
const finalDisplay=r.finalRounded!=null?r.finalRounded:(r.saAvg!=null?r.saAvg:'—');
return`<div class="glass" style="padding:16px;animation:fadeUp .5s ease ${i*0.05}s both;position:relative;overflow:hidden;border-left:3px solid ${bg}55">
<div style="position:absolute;inset:0;background:radial-gradient(circle at 100% 0%,${bg}18,transparent 55%);pointer-events:none"></div>
<div class="flex" style="margin-bottom:10px"><div class="dot" style="background:${bg}"></div><span style="font-size:12px;font-weight:500;flex:1">${r.name}</span></div>
<div style="font-size:34px;font-weight:700;font-family:'Instrument Serif',serif;color:${col};line-height:1;margin-bottom:4px">${r.uwGPA!=null?r.uwGPA.toFixed(2):'—'}</div>
<div style="font-size:11px;color:var(--text3);margin-bottom:8px">${r.numTests} SA${r.numTests!==1?'s':''} · Score: ${finalDisplay}</div>
<div class="pbar"><div class="pfill" style="width:${r.uwGPA!=null?r.uwGPA/4*100:0}%;background:${col}"></div></div>
</div>`;
}).join(''):'<div style="color:var(--text3);font-size:13px;grid-column:1/-1">Enter marks in <strong>The Grade &amp; GPA Engine</strong> to see subject cards.</div>';
renderLiveBanner('whats-next-dash');
document.getElementById('heatmap-dash').innerHTML=typeof revisionHeatmapHTML==='function'?revisionHeatmapHTML():heatmapHTML();
document.getElementById('sidebar-stats').textContent=`${gradeSheet.length} subjects · ${pending} tasks`;
if(typeof buildDailyQueue==='function') buildDailyQueue();
}
function renderGrades(){
const gpa=calcGPA(grades);
document.getElementById('calc-gpa').textContent=gpa.toFixed(2);
document.getElementById('calc-gpa').style.color=gpaColor(gpa);
document.getElementById('calc-lessons').textContent=grades.reduce((a,g)=>a+g.lessonsPerWeek,0);
document.getElementById('calc-subjects').textContent=new Set(grades.map(g=>g.subjectId)).size;
document.getElementById('calc-count').textContent=grades.length;
const allBtn=`<button class="btn btn-sm" style="background:${gradeFilterSubj==='all'?'var(--blue-d)':'var(--surface)'};border-color:${gradeFilterSubj==='all'?'var(--blue)':'var(--border2)'};color:${gradeFilterSubj==='all'?'var(--blue)':'var(--text2)'}" onclick="setGF('all')">All</button>`;
document.getElementById('grade-filters').innerHTML=allBtn+getAllSubjects().map(s=>`<button class="btn btn-sm" style="background:${gradeFilterSubj===s.id?s.dim:'var(--surface)'};border-color:${gradeFilterSubj===s.id?s.color:'var(--border2)'};color:${gradeFilterSubj===s.id?s.color:'var(--text2)'}" onclick="setGF('${s.id}')"><span class="dot" style="background:${s.color};width:6px;height:6px"></span>${s.name}</button>`).join('');
const list=(gradeFilterSubj==='all'?grades:grades.filter(g=>g.subjectId===gradeFilterSubj)).sort((a,b)=>new Date(b.date)-new Date(a.date));
document.getElementById('grades-tbody').innerHTML=list.length?list.map(g=>{
const s=getSubj(g.subjectId),gp=scoreToGPA(g.score),let_=scoreToLetter(g.score),sc=sColor(g.score);
return`<tr><td><div class="flex"><div class="dot" style="background:${s.color}"></div><div><div style="font-weight:500">${esc(s.name)}</div><div style="font-size:11px;color:var(--text3)">${esc(s.level)}</div></div></div></td>
<td style="color:var(--text2)">${esc(g.label)}</td>
<td><span style="font-size:16px;font-weight:700;color:${sc};font-family:'Geist Mono',monospace">${g.score}%</span></td>
<td><span class="tag" style="background:${sc}22;color:${sc}">${let_}</span></td>
<td style="font-family:'Geist Mono',monospace;color:${gpaColor(gp)};font-weight:700">${gp.toFixed(1)}</td>
<td style="color:var(--text3)">${g.lessonsPerWeek}×/wk</td>
<td style="font-size:12px;color:var(--text3)">${g.date}</td>
<td><button class="btn btn-danger btn-sm" onclick="deleteGrade('${g.id}')">×</button></td>
</tr>`;
}).join(''):`<tr><td colspan="8" style="padding:36px;text-align:center;color:var(--text3)">No grades yet. Click "+ Add Grade".</td></tr>`;
}
function setGF(v){gradeFilterSubj=v;renderGrades();}
function deleteGrade(id){grades=grades.filter(g=>g.id!==id);saveGrades();renderGrades();}
function openGradeModal(){
refreshAllSubjectSelects();
document.getElementById('gm-score').value='';document.getElementById('gm-weight').value='3';
document.getElementById('gm-label').value='';document.getElementById('gm-date').value=localDateStr(new Date());
document.getElementById('gm-preview').style.display='none';
document.getElementById('grade-modal').style.display='flex';
}
function closeGradeModal(){document.getElementById('grade-modal').style.display='none';}
function updateGradePreview(){
const sc=+document.getElementById('gm-score').value;
if(isNaN(sc)||sc<0||sc>100){document.getElementById('gm-preview').style.display='none';return;}
document.getElementById('gm-prev-letter').textContent=scoreToLetter(sc);
document.getElementById('gm-prev-gpa').textContent=scoreToGPA(sc).toFixed(1);
document.getElementById('gm-prev-gpa').style.color=gpaColor(scoreToGPA(sc));
document.getElementById('gm-prev-cat').textContent=scoreToCat(sc);
document.getElementById('gm-preview').style.display='block';
}
function submitGrade(){
const sc=+document.getElementById('gm-score').value;
if(isNaN(sc)||sc<0||sc>100){alert('Enter 0–100.');return;}
grades.push({id:uid(),subjectId:document.getElementById('gm-subject').value,score:sc,lessonsPerWeek:+document.getElementById('gm-weight').value||3,label:document.getElementById('gm-label').value.trim()||'Assessment',date:document.getElementById('gm-date').value||localDateStr(new Date())});
saveGrades();closeGradeModal();renderGrades();
}
function gsCalc(row){
const rawTests=Array.isArray(row.tests)?row.tests:[];
const tests=rawTests.filter(t=>t!==null&&t!==undefined&&t!=='').map(Number);
const saWeight=row.saWeight!=null?row.saWeight:60;
const examWeight=row.examWeight!=null?row.examWeight:40;
const hasExam=examWeight>0;
const saAvgExact=tests.length?tests.reduce((a,b)=>a+b,0)/tests.length:null;
const saAvg=saAvgExact!==null?Math.round(saAvgExact):null; 
const saWeighted=saAvg!==null?+((saAvg*saWeight)/100).toFixed(2):null;
const examEntered=row.examScore!==null&&row.examScore!==''&&row.examScore!==undefined;
const examVal=examEntered?Number(row.examScore):null;
const examWeighted=hasExam&&examEntered?+((examVal*examWeight)/100).toFixed(2):null;
let finalRounded=null;
if(saAvg!==null){
if(!hasExam){
finalRounded=saAvg; 
} else if(examEntered){
finalRounded=Math.round(saWeighted+examWeighted);
}
}
const gradeBase=finalRounded!==null?finalRounded:saAvg;   // grade & GPA follow the final once the exam is in
const uwGPA=gradeBase!==null?scoreToGPA(gradeBase):null;
const lpw=row.lessonsPerWeek||3;
const grade=gradeBase!==null?scoreToLetter(gradeBase):'—';
return{saAvgExact,saAvg,saWeighted,examEntered,examVal,examWeighted,
finalRounded,grade,uwGPA,lpw,
rawPct:gradeBase, saWeight,examWeight,hasExam};
}
function gsUnweightedGPA(){
const rows=gradeSheet.map(r=>gsCalc(r)).filter(r=>r.rawPct!==null);
if(!rows.length) return 0;
return rows.reduce((a,r)=>a+r.uwGPA,0)/rows.length;
}
function gsWeightedGPA(){
const rows=gradeSheet
.map(r=>{const c=gsCalc(r);return{gpa:c.uwGPA,lpw:r.lessonsPerWeek||3,has:c.rawPct!==null};})
.filter(r=>r.has);
if(!rows.length) return 0;
const sumWeighted=rows.reduce((a,r)=>a+r.gpa*r.lpw,0);
const sumLpw=rows.reduce((a,r)=>a+r.lpw,0);
return sumLpw?sumWeighted/sumLpw:0;
}
