function renderGradeSheet(){
const siBanner=document.getElementById('gs-student-banner');
if(siBanner){
siBanner.innerHTML=studentInfo.name||studentInfo.gradeLevel
?`<div class="flex" style="gap:16px;flex-wrap:wrap">
<div style="font-size:13px;font-weight:600">${esc(studentInfo.name)||'—'}</div>
${studentInfo.gradeLevel?`<span class="tag" style="background:var(--blue-d);color:var(--blue)">Grade ${esc(studentInfo.gradeLevel)}</span>`:''}
<button class="btn btn-sm" style="margin-left:auto" onclick="openStudentModal()">✏️ Edit Info</button>
</div>`
:`<div class="flex" style="gap:10px"><span style="font-size:12px;color:var(--text3)">No student info set.</span><button class="btn btn-sm btn-primary" onclick="openStudentModal()">+ Add Info</button></div>`;
}
const rows=gradeSheet.map(r=>({...r,...gsCalc(r)}));
const withG=rows.filter(r=>r.rawPct!==null);
const stars=withG.filter(r=>r.rawPct>=90).length;
const as_=withG.filter(r=>r.rawPct>=80&&r.rawPct<90).length;
const uwGPA=gsUnweightedGPA();
const wGPA=gsWeightedGPA();
document.getElementById('gs-summary').innerHTML=[
{icon:'⭐',val:stars+'× A* · '+as_+'× A',label:'Top Grades',c:'var(--emerald)'},
{icon:'🎓',val:uwGPA.toFixed(2),label:'Unweighted GPA',c:'var(--blue)'},
{icon:'⚖️',val:wGPA.toFixed(2),label:'Weighted GPA',c:'var(--purple)'},
].map((s,i)=>`<div class="stat-card" style="animation-delay:${i*0.07}s"><div style="font-size:18px;margin-bottom:8px">${s.icon}</div><div class="stat-num" style="color:${s.c};font-size:26px">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');
const maxT=gradeSheet.length?Math.max(...gradeSheet.map(r=>r.numTests)):1;
const tHdrs=Array.from({length:maxT},(_,i)=>`<th style="min-width:58px">SA ${i+1}<br><span style="font-size:9px;color:var(--text3)">/100</span></th>`).join('');
document.getElementById('gs-thead').innerHTML=`<tr>
<th style="text-align:left;min-width:140px;position:sticky;left:0;background:#13161d">Subject</th>
${tHdrs}
<th>SA Avg<br><span style="font-size:9px;color:var(--text3)">(rounded)</span></th>
<th>SA Wt%</th>
<th>Exam<br><span style="font-size:9px">/100</span></th>
<th>Ex Wt%</th>
<th>Final</th>
<th style="min-width:60px">Grade</th>
<th>UW GPA</th>
<th></th>
</tr>`;
document.getElementById('gs-tbody').innerHTML=rows.map((row)=>{
const col=row.rawPct!=null?sColor(row.rawPct):'var(--text3)';
const tCells=Array.from({length:maxT},(_,i)=>{
const v=(row.tests&&row.tests[i]!=null)?row.tests[i]:'';
const bc=v!==''?(Number(v)>=90?'rgba(16,185,129,.5)':Number(v)>=70?'rgba(59,130,246,.4)':Number(v)>=50?'rgba(245,158,11,.4)':'rgba(225,29,72,.4)'):'var(--border)';
return`<td><input class="score-inp" type="number" min="0" max="100" value="${v}" placeholder="—" oninput="clampScoreInput(this)" onchange="updateGSTest('${row.id}',${i},this.value)" style="border-color:${bc}"/></td>`;
}).join('');
const saAvgDisplay=row.saAvg!=null?String(row.saAvg):'—';
const saAvgColor=row.saAvg!=null?sColor(row.saAvg):'var(--text3)';
const examVal=row.examEntered?String(row.examVal):'';
const examBc=examVal!==''?(Number(examVal)>=90?'rgba(16,185,129,.5)':Number(examVal)>=70?'rgba(59,130,246,.4)':Number(examVal)>=50?'rgba(245,158,11,.4)':'rgba(225,29,72,.4)'):'var(--border)';
const examDisabled=row.examWeight===0;
const examCell=`<td><input class="score-inp" type="number" min="0" max="100" value="${examVal}" placeholder="${examDisabled?'N/A':'—'}" ${examDisabled?'disabled':''} oninput="clampScoreInput(this)" onchange="updateGSExam('${row.id}',this.value)" style="border-color:${examBc};opacity:${examDisabled?0.35:1}"/></td>`;
const sw=row.saWeight!=null?row.saWeight:60;
const ew=row.examWeight!=null?row.examWeight:40;
const swBc=sw+ew===100?'var(--border)':'var(--ruby)';
const finalDisplay=row.finalRounded!=null?String(row.finalRounded):(row.hasExam&&!row.examEntered&&row.saAvg!=null?row.saAvg+'*':'—');
const finalColor=row.finalRounded!=null?sColor(row.finalRounded):(row.saAvg!=null?'var(--text3)':'var(--text3)');
const lpw=row.lessonsPerWeek||3;
return`<tr>
<td style="font-weight:600;color:var(--text);position:sticky;left:0;background:#13161d;z-index:1">
${esc(row.name)}
<div style="font-size:10px;color:var(--text3);font-weight:400;margin-top:1px">${lpw}×/wk</div>
</td>
${tCells}
<td style="font-family:'Geist Mono',monospace;color:${saAvgColor};font-weight:700;font-size:14px">${saAvgDisplay}</td>
<td><input class="score-inp" type="number" min="0" max="100" value="${sw}" onchange="updateGSWeights('${row.id}','sa',this.value)" style="border-color:${swBc};width:46px" title="SA weight %"/></td>
${examCell}
<td><input class="score-inp" type="number" min="0" max="100" value="${ew}" onchange="updateGSWeights('${row.id}','exam',this.value)" style="border-color:${swBc};width:46px;opacity:${examDisabled?0.5:1}" title="Exam weight %"/></td>
<td style="font-family:'Geist Mono',monospace;color:${finalColor};font-weight:700">${finalDisplay}</td>
<td><span class="tag" style="background:${col}22;color:${col};font-size:12px">${row.grade}</span></td>
<td style="font-family:'Geist Mono',monospace;font-weight:700;color:${row.uwGPA!=null?gpaColor(row.uwGPA):'var(--text3)'}">${row.uwGPA!=null?row.uwGPA.toFixed(1):'—'}</td>
<td style="white-space:nowrap">
<button class="btn btn-sm" onclick="addGSTest('${row.id}')" style="padding:3px 7px;font-size:11px;margin-right:3px" title="Add SA column">+SA</button>
<button class="btn btn-sm" onclick="openGSEditModal('${row.id}')" style="padding:3px 7px;font-size:11px;margin-right:3px" title="Edit subject">✏️</button>
</td>
</tr>`;
}).join('');
const avgTestCells=Array.from({length:maxT},(_,i)=>{
const v=gradeSheet.map(r=>r.tests&&r.tests[i]!=null?Number(r.tests[i]):null).filter(x=>x!==null);
const a=v.length?Math.round(v.reduce((s,x)=>s+x,0)/v.length):null;
return`<td style="font-family:'Geist Mono',monospace;color:var(--text2);font-weight:600">${a!=null?a:'—'}</td>`;
}).join('');
document.getElementById('gs-tfoot').innerHTML=`<tr style="border-top:2px solid var(--border2);background:rgba(255,255,255,.03)">
<td style="font-weight:700;color:var(--text);position:sticky;left:0;background:#13161d">AVERAGE</td>
${avgTestCells}
<td style="font-family:'Geist Mono',monospace;color:var(--text2);font-weight:700">${withG.length?Math.round(withG.reduce((a,r)=>a+r.rawPct,0)/withG.length):'—'}</td>
<td></td><td></td><td></td>
<td style="font-family:'Geist Mono',monospace;color:${gpaColor(uwGPA)};font-weight:700">${withG.length?withG.reduce((a,r)=>a+(r.finalRounded||r.saAvg||0),0)/withG.length|0:'—'}</td>
<td></td>
<td style="font-family:'Geist Mono',monospace;color:${gpaColor(uwGPA)};font-weight:700">${uwGPA.toFixed(2)}</td>
<td></td>
</tr>`;
const gpaPanelEl=document.getElementById('gs-gpa-panel');
if(gpaPanelEl) renderGSGPAPanel(uwGPA,wGPA,withG.length);
}
let gsTargetGPA = (function(){
const v = parseFloat(localStorage.getItem('academicOS_targetGPA'));
return (isNaN(v)||v<0||v>4)?3.5:v;
})();
function saveTargetGPA(v){
gsTargetGPA=v;
localStorage.setItem('academicOS_targetGPA',String(v));
}
function gsProjectRow(row, targetPct){
const saW  = (row.saWeight  != null && row.saWeight  > 0) ? row.saWeight  : null;
const exW  = (row.examWeight!= null && row.examWeight > 0) ? row.examWeight : null;
const nT   = Math.max(1, row.numTests || 1);
const hasExamSlot = (row.examWeight || 0) > 0;
const slots = [];
if(saW !== null && exW !== null){
const perSA = saW / nT;
for(let i=0;i<nT;i++){
const s = (Array.isArray(row.tests) && row.tests[i] != null) ? Number(row.tests[i]) : null;
slots.push({w: perSA, score: s});
}
if(hasExamSlot){
const es = (row.examScore != null && row.examScore !== '') ? Number(row.examScore) : null;
slots.push({w: exW, score: es});
}
} else {
const totalSlots = nT + (hasExamSlot ? 1 : 0);
const perSlot = 100 / totalSlots;
for(let i=0;i<nT;i++){
const s = (Array.isArray(row.tests) && row.tests[i] != null) ? Number(row.tests[i]) : null;
slots.push({w: perSlot, score: s});
}
if(hasExamSlot){
const es = (row.examScore != null && row.examScore !== '') ? Number(row.examScore) : null;
slots.push({w: perSlot, score: es});
}
}
let gradedWeight = 0, remainingWeight = 0, currentContribution = 0;
for(const slot of slots){
if(slot.score !== null){
gradedWeight += slot.w;
currentContribution += slot.score * (slot.w / 100);
} else {
remainingWeight += slot.w;
}
}
let requiredScore = null;
if(remainingWeight <= 0){
requiredScore = null; 
} else {
requiredScore = (targetPct - currentContribution) / (remainingWeight / 100);
}
return { gradedWeight, remainingWeight, currentContribution, requiredScore, slots };
}
function calculateProjectedRequirements(){
const targetGPA = gsTargetGPA;
const targetPct = gpaToMinPct(targetGPA);
const rows = gradeSheet.map(r => ({...r, ...gsCalc(r)}));
let totalGradedW = 0, totalRemainingW = 0;
let totalCurrentContrib = 0;
const rowProjections = [];
for(const row of rows){
const proj = gsProjectRow(row, targetPct);
totalGradedW      += proj.gradedWeight;
totalRemainingW   += proj.remainingWeight;
totalCurrentContrib += proj.currentContribution;
rowProjections.push({row, proj});
}
let globalRequired = null;
if(totalRemainingW > 0){
globalRequired = (targetPct * (totalGradedW + totalRemainingW)/100 - totalCurrentContrib)
/ (totalRemainingW / 100);
}
return { targetGPA, targetPct, totalGradedW, totalRemainingW,
totalCurrentContrib, globalRequired, rowProjections };
}
function gpaToMinPct(gpa){
if(gpa >= 4.0)  return 90;
if(gpa >= 3.7)  return 80;
if(gpa >= 3.3)  return 70;
if(gpa >= 3.0)  return 60;
if(gpa >= 2.0)  return 50;
return 0;
}
function gpaToLabel(gpa){
if(gpa >= 4.0)  return 'A* (4.0)';
if(gpa >= 3.7)  return 'A (3.7)';
if(gpa >= 3.3)  return 'B (3.3)';
if(gpa >= 3.0)  return 'C (3.0)';
if(gpa >= 2.0)  return 'D (2.0)';
return 'U/F (0.0)';
}
function renderGSGPAPanel(uwGPA, wGPA, subjectCount){
const el=document.getElementById('gs-gpa-panel');
if(!el) return;
const proj = calculateProjectedRequirements();
const {targetGPA, targetPct, totalGradedW, totalRemainingW,
globalRequired, rowProjections} = proj;
let status, statusLabel, hintText, hintBorderColor, hintBg;
const currentPct = totalGradedW > 0
? (proj.totalCurrentContrib / (totalGradedW/100))
: null;
if(totalRemainingW <= 0){
const achieved = currentPct != null ? currentPct : 0;
if(achieved >= targetPct){
status='done-pass'; statusLabel='✓ Target Achieved';
hintBorderColor='var(--emerald)'; hintBg='var(--em-d)';
hintText=`You've completed all graded work and reached your target GPA of ${targetGPA.toFixed(2)}. Final average: <strong>${achieved.toFixed(1)}%</strong>.`;
} else {
status='done-fail'; statusLabel='✕ Target Missed';
hintBorderColor='var(--ruby)'; hintBg='var(--ruby-d)';
hintText=`All assignments are graded. Final average is <strong>${achieved.toFixed(1)}%</strong>, which falls short of the ${targetPct}% needed for your ${targetGPA.toFixed(2)} target.`;
}
} else if(globalRequired === null){
status='pending'; statusLabel='⋯ Enter marks to begin';
hintBorderColor='var(--border2)'; hintBg='rgba(255,255,255,.03)';
hintText='Enter scores in the table above to activate the projection engine.';
} else if(globalRequired > 100){
status='red'; statusLabel='✕ Mathematically Unreachable';
hintBorderColor='var(--ruby)'; hintBg='var(--ruby-d)';
const needed = Math.min(globalRequired,999).toFixed(1);
hintText=`Target GPA <strong>${targetGPA.toFixed(2)}</strong> is <strong>mathematically unreachable</strong> with remaining assignments — it would require an average of ${needed}% (above 100%). Consider adjusting your target.`;
} else if(globalRequired > 85){
status='amber'; statusLabel='⚠ Achievable — High Effort Required';
hintBorderColor='var(--amber)'; hintBg='var(--am-d)';
hintText=`You need an average of <strong>${globalRequired.toFixed(1)}%</strong> on all remaining assignments to reach your target GPA of <strong>${targetGPA.toFixed(2)}</strong>. That's demanding — stay consistent.`;
} else {
status='green'; statusLabel='✓ On Track';
hintBorderColor='var(--emerald)'; hintBg='var(--em-d)';
hintText=`You need an average of <strong>${globalRequired.toFixed(1)}%</strong> on remaining assignments to reach your target GPA of <strong>${targetGPA.toFixed(2)}</strong>. You're on track — keep it up!`;
}
const statusColors = {
'green'    : {c:'var(--emerald)',bg:'var(--em-d)' ,border:'rgba(16,185,129,.35)'},
'amber'    : {c:'var(--amber)',  bg:'var(--am-d)' ,border:'rgba(245,158,11,.35)'},
'red'      : {c:'var(--ruby)',   bg:'var(--ruby-d)',border:'rgba(225,29,72,.35)'},
'done-pass': {c:'var(--emerald)',bg:'var(--em-d)' ,border:'rgba(16,185,129,.35)'},
'done-fail': {c:'var(--ruby)',   bg:'var(--ruby-d)',border:'rgba(225,29,72,.35)'},
'pending'  : {c:'var(--text3)',  bg:'rgba(255,255,255,.04)',border:'var(--border)'},
};
const sc = statusColors[status] || statusColors['pending'];
const totalW = totalGradedW + totalRemainingW;
const completionPct = totalW > 0 ? Math.min(100, (totalGradedW/totalW)*100) : 0;
const scoreProgress = (targetPct > 0 && currentPct != null)
? Math.min(100, (currentPct / targetPct) * 100) : 0;
const projRows = rowProjections.map(({row, proj:rp})=>{
if(rp.remainingWeight <= 0){
const avg = rp.gradedWeight > 0 ? (rp.currentContribution/(rp.gradedWeight/100)) : null;
const hit = avg != null && avg >= targetPct;
return `<div class="proj-row-hint" style="color:${hit?'var(--emerald)':'var(--ruby)'}">
${row.name}: ${avg!=null?avg.toFixed(1)+'%':'—'} final ${hit?'✓':'✕ below target'}
</div>`;
}
if(rp.requiredScore === null) return '';
const req = rp.requiredScore;
if(req > 100){
return `<div class="proj-row-hint" style="color:var(--ruby)">${row.name}: unreachable (needs ${Math.min(req,999).toFixed(1)}%)</div>`;
}
const c = req > 85 ? 'var(--amber)' : 'var(--emerald)';
return `<div class="proj-row-hint" style="color:${c}">${row.name}: needs <strong>${req.toFixed(1)}%</strong> avg on remaining</div>`;
}).join('');
const sliderFillPct = ((targetGPA/4)*100).toFixed(1);
el.innerHTML=`
<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 25% 50%,rgba(59,130,246,.07),transparent 50%),radial-gradient(ellipse at 75% 50%,rgba(139,92,246,.07),transparent 50%);pointer-events:none"></div>
<div class="section-label" style="margin-bottom:16px">📐 GPA Summary — ${subjectCount} subject${subjectCount!==1?'s':''} tracked</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">
<div class="glass2" style="padding:20px;text-align:center">
<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px">Unweighted GPA</div>
<div style="font-size:48px;font-weight:700;font-family:'Instrument Serif',serif;color:${gpaColor(uwGPA)};line-height:1">${uwGPA.toFixed(2)}</div>
<div style="font-size:12px;color:var(--text3);margin-top:5px">/ 4.00 · Based on SA Average</div>
<div style="margin-top:12px;height:4px;border-radius:4px;background:var(--border);overflow:hidden">
<div style="height:100%;border-radius:4px;background:${gpaColor(uwGPA)};width:${(uwGPA/4*100).toFixed(1)}%;transition:width .6s ease"></div>
</div>
</div>
<div class="glass2" style="padding:20px;text-align:center">
<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.12em;margin-bottom:8px">Weighted GPA</div>
<div style="font-size:48px;font-weight:700;font-family:'Instrument Serif',serif;color:${gpaColor(wGPA)};line-height:1">${wGPA.toFixed(2)}</div>
<div style="font-size:12px;color:var(--text3);margin-top:5px">/ 4.00 · Weighted by lessons/week</div>
<div style="margin-top:12px;height:4px;border-radius:4px;background:var(--border);overflow:hidden">
<div style="height:100%;border-radius:4px;background:${gpaColor(wGPA)};width:${(wGPA/4*100).toFixed(1)}%;transition:width .6s ease"></div>
</div>
</div>
</div>
<!-- ── TARGET GPA TRACKING CARD ── -->
<div class="target-gpa-card" id="proj-target-card">
<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px">
<div>
<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px">🎯 Target GPA / Grade Profile</div>
<div style="display:flex;align-items:baseline;gap:6px">
<span style="font-size:32px;font-weight:700;font-family:'Instrument Serif',serif;color:var(--purple)" id="proj-target-display">${targetGPA.toFixed(2)}</span>
<span style="font-size:13px;color:var(--text3)">/ 4.0 &nbsp;·&nbsp; ${gpaToLabel(targetGPA)}</span>
</div>
</div>
<div style="display:flex;align-items:center;gap:10px">
<span class="proj-status-pill" id="proj-status-pill"
style="color:${sc.c};background:${sc.bg};border-color:${sc.border}">${statusLabel}</span>
<input type="number" min="0" max="4" step="0.01"
value="${targetGPA.toFixed(2)}"
id="proj-target-num-inp"
class="score-inp" style="width:70px;font-size:14px;font-weight:700;text-align:center"
oninput="onProjTargetNumInput(this.value)"
title="Type target GPA (0–4.00)"/>
</div>
</div>
<!-- Slider -->
<input type="range" min="0" max="4" step="0.01"
value="${targetGPA.toFixed(2)}"
id="proj-target-slider"
class="target-slider"
style="--pct:${sliderFillPct}%"
oninput="onProjTargetSlider(this.value)"
title="Drag to set target GPA"/>
<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-top:2px">
<span>0.0 U/F</span><span>2.0 D</span><span>3.0 C</span><span>3.3 B</span><span>3.7 A</span><span>4.0 A*</span>
</div>
<!-- Progress / Metric Bar -->
<div style="margin-top:16px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
<span style="font-size:11px;color:var(--text3)">Progress toward target</span>
<span style="font-size:11px;font-family:'Geist Mono',monospace;color:var(--text2)" id="proj-pct-label">
${currentPct!=null?currentPct.toFixed(1)+'%':uwGPA.toFixed(2)+' GPA'} / ${targetPct}% needed
</span>
</div>
<div class="proj-metric-bar">
<!-- Target marker -->
<div style="position:absolute;left:${Math.min(99,scoreProgress).toFixed(1)}%;top:0;bottom:0;width:2px;background:rgba(255,255,255,.3);z-index:2;border-radius:2px"></div>
<div class="proj-metric-fill" id="proj-metric-fill"
style="width:${scoreProgress.toFixed(1)}%;background:${sc.c}"></div>
</div>
<!-- Assignment completion sub-bar -->
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;margin-bottom:3px">
<span style="font-size:10px;color:var(--text3)">Assignments graded</span>
<span style="font-size:10px;font-family:'Geist Mono',monospace;color:var(--text3)">
${completionPct.toFixed(0)}% of syllabus weight
</span>
</div>
<div style="height:4px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden">
<div style="height:100%;border-radius:4px;background:var(--blue);opacity:.55;width:${completionPct.toFixed(1)}%;transition:width .55s ease"></div>
</div>
</div>
<!-- Hint / projection text -->
<div class="proj-hint" id="proj-hint"
style="background:${hintBg};border-left-color:${hintBorderColor};color:var(--text2)">${hintText}</div>
<!-- Per-subject breakdown (collapsible) -->
${rowProjections.length?`
<details style="margin-top:10px">
<summary style="font-size:11px;color:var(--text3);cursor:pointer;user-select:none;list-style:none;display:flex;align-items:center;gap:5px">
<span id="proj-details-icon">▶</span> Per-subject requirement breakdown
</summary>
<div style="margin-top:8px;padding:10px 12px;background:rgba(255,255,255,.025);border-radius:8px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:2px 14px">
${projRows}
</div>
</details>`:''}
</div>
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:center;margin-top:16px">
<span style="font-size:11px;color:var(--text3)">Scale:</span>
<span class="tag" style="background:var(--em-d);color:var(--emerald)">90–100% = A* = 4.0</span>
<span class="tag" style="background:var(--blue-d);color:var(--blue)">80–89% = A = 3.7</span>
<span class="tag" style="background:var(--am-d);color:var(--amber)">70–79% = B = 3.3</span>
<span class="tag" style="background:rgba(251,146,60,.15);color:#fb923c">60–69% = C = 3.0</span>
<span class="tag" style="background:var(--ruby-d);color:var(--ruby)">50–59% = D = 2.0</span>
<span class="tag" style="background:rgba(255,255,255,.06);color:var(--text3)">Below 50% = U/F = 0.0</span>
</div>`;
}
function onProjTargetSlider(val){
const v = Math.max(0, Math.min(4, parseFloat(val)||0));
const snapped = Math.round(v*100)/100;
saveTargetGPA(snapped);
const ni = document.getElementById('proj-target-num-inp');
if(ni) ni.value = snapped.toFixed(2);
const sl = document.getElementById('proj-target-slider');
if(sl) sl.style.setProperty('--pct', ((snapped/4)*100).toFixed(2)+'%');
const uwGPA = gsUnweightedGPA();
const wGPA  = gsWeightedGPA();
const withG = gradeSheet.map(r=>gsCalc(r)).filter(r=>r.rawPct!==null);
renderGSGPAPanel(uwGPA, wGPA, withG.length);
}
function onProjTargetNumInput(val){
const v = parseFloat(val);
if(isNaN(v)||v<0||v>4) return;
const snapped = Math.round(v*100)/100;
saveTargetGPA(snapped);
const sl = document.getElementById('proj-target-slider');
if(sl){ sl.value = snapped.toFixed(2); sl.style.setProperty('--pct',((snapped/4)*100).toFixed(2)+'%'); }
const uwGPA = gsUnweightedGPA();
const wGPA  = gsWeightedGPA();
const withG = gradeSheet.map(r=>gsCalc(r)).filter(r=>r.rawPct!==null);
renderGSGPAPanel(uwGPA, wGPA, withG.length);
}
let _gsTimer;
function updateGSTest(id,idx,val){
const row=gradeSheet.find(r=>r.id===id);if(!row)return;
if(!Array.isArray(row.tests)) row.tests=[];
while(row.tests.length<=idx) row.tests.push(null);
if(val===''||val===null||val===undefined){
row.tests[idx]=null;
} else {
const n=Math.max(0,Math.min(100,Number(val)));
row.tests[idx]=isNaN(n)?null:n;
}
saveGS();renderGradeSheet();
}
function updateGSExam(id,val){
const row=gradeSheet.find(r=>r.id===id);if(!row)return;
if(val===''||val===null||val===undefined){
row.examScore=null;
} else {
const n=Math.max(0,Math.min(100,Number(val)));
row.examScore=isNaN(n)?null:n;
}
saveGS();renderGradeSheet();
}
function clampScoreInput(inp){
var v=parseFloat(inp.value);
if(isNaN(v)) return;
if(v<0){inp.value=0;}
else if(v>100){inp.value=100;}
}
function updateGSWeights(id,field,val){
const row=gradeSheet.find(r=>r.id===id);if(!row)return;
const v=Math.max(0,Math.min(100,Number(val)||0));
if(field==='sa'){row.saWeight=v;row.examWeight=100-v;}
else{row.examWeight=v;row.saWeight=100-v;}
saveGS();renderGradeSheet();
}
function addGSTest(id){
const row=gradeSheet.find(r=>r.id===id);if(!row)return;
row.numTests=(row.numTests||1)+1;
if(!Array.isArray(row.tests)) row.tests=[];
while(row.tests.length<row.numTests) row.tests.push(null);
saveGS();renderGradeSheet();
}
function deleteGSRow(id){gradeSheet=gradeSheet.filter(r=>r.id!==id);saveGS();renderGradeSheet();}
const GS_SUBJECTS={
igcse:['Accounting','Arabic','Art & Design','Biology','Business Studies','Chemistry','Computer Science',
'Design & Technology','Drama','Economics','English Language','English Literature','Environmental Management',
'Food & Nutrition','French','Geography','German','Global Perspectives','History','ICT','Information & Communication Technology',
'Mathematics','Music','Physical Education','Physics','Religious Studies','Russian','Sociology','Spanish','Turkish','Uzbek'],
alevel:['Accounting','Biology','Business','Chemistry','Computer Science','Drama & Theatre',
'Economics','English Language','English Literature','Further Mathematics','Geography','History',
'Law','Mathematics','Media Studies','Music','Physical Education','Physics','Politics',
'Psychology','Religious Studies','Russian','Sociology','Spanish'],
ap:['AP Biology','AP Calculus AB','AP Calculus BC','AP Chemistry','AP Chinese Language','AP Computer Science A',
'AP Computer Science Principles','AP English Language','AP English Literature','AP Environmental Science',
'AP European History','AP French Language','AP Human Geography','AP Latin','AP Macroeconomics',
'AP Microeconomics','AP Music Theory','AP Physics 1','AP Physics 2','AP Physics C','AP Psychology',
'AP Research','AP Seminar','AP Spanish Language','AP Statistics','AP Studio Art','AP US Government',
'AP US History','AP World History']
};
let _gsTabMode='std'; 
let _gsLocLevel='igcse'; 
function gsTabSwitch(mode){
_gsTabMode=mode;
document.getElementById('gs-std-panel').style.display=mode==='std'?'block':'none';
document.getElementById('gs-loc-panel').style.display=mode==='loc'?'block':'none';
document.getElementById('gs-tab-std').className='btn btn-sm'+(mode==='std'?' btn-primary':'');
document.getElementById('gs-tab-loc').className='btn btn-sm'+(mode==='loc'?' btn-primary':'');
}
function gsLocLevel(level){
_gsLocLevel=level;
['igcse','as','a','ap','national'].forEach(l=>{
const btn=document.getElementById('gs-loc-btn-'+l);
if(btn) btn.className='btn btn-sm'+(l===level?' btn-primary':'');
});
const note=document.getElementById('gs-loc-level-note');
if(note){
const desc={
igcse:'Subject will be labelled as IGCSE.',
as:'Subject will be labelled as AS Level.',
a:'Subject will be labelled as A Level.',
ap:'Subject will be labelled as AP.',
national:'No international framework — subject name used as-is, no label appended.'
};
note.textContent=desc[level]||'';
}
}
function gsPopulateStdList(){
const curr=document.getElementById('gs-curriculum').value;
const sel=document.getElementById('gs-std-subject');
sel.innerHTML=GS_SUBJECTS[curr].map(s=>`<option value="${s}">${s}</option>`).join('');
}
function addGSSubject(){
_gsTabMode='std';
_gsLocLevel='igcse';
document.getElementById('gs-tests').value='3';
document.getElementById('gs-sawt').value='60';
document.getElementById('gs-exwt').value='40';
document.getElementById('gs-lpw').value='3';
document.getElementById('gs-curriculum').value='igcse';
gsPopulateStdList();
gsTabSwitch('std');
gsLocLevel('igcse');
gsWeightSync('sa');
document.getElementById('gs-loc-name').value='';
document.getElementById('gs-modal').style.display='flex';
}
function gsWeightSync(changed){
const sa=+document.getElementById('gs-sawt').value||0;
const ex=+document.getElementById('gs-exwt').value||0;
const total=sa+ex;
const errEl=document.getElementById('gs-wt-err');
if(errEl) errEl.textContent=total===100?'✓ Weights sum to 100%':`⚠ Weights sum to ${total}% — must equal 100%`;
if(errEl) errEl.style.color=total===100?'var(--emerald)':'var(--ruby)';
if(changed==='sa') document.getElementById('gs-exwt').value=100-sa;
else document.getElementById('gs-sawt').value=100-ex;
}
function closeGSModal(){document.getElementById('gs-modal').style.display='none';}
function submitGSSubject(){
const numTests=Math.max(1,+document.getElementById('gs-tests').value||3);
const saWeight=+document.getElementById('gs-sawt').value||60;
const examWeight=+document.getElementById('gs-exwt').value||40;
if(saWeight+examWeight!==100){alert('SA weight + Exam weight must equal 100%.');return;}
const lpw=Math.max(1,+document.getElementById('gs-lpw').value||3);
let name='';
if(_gsTabMode==='std'){
name=document.getElementById('gs-std-subject').value;
if(!name){alert('Select a subject.');return;}
} else {
const rawName=document.getElementById('gs-loc-name').value.trim();
if(!rawName){alert('Enter a subject name.');return;}
const suffix={igcse:' (IGCSE)',as:' (AS)',a:' (A Level)',ap:' (AP)',national:''}[_gsLocLevel]||'';
name=rawName+suffix;
}
if(gradeSheet.find(r=>r.name.toLowerCase()===name.toLowerCase())){
if(!confirm(`"${name}" is already in your grade sheet. Add it again?`)) return;
}
gradeSheet.push({id:uid(),name,numTests,saWeight,examWeight,
lessonsPerWeek:lpw,tests:Array(Math.max(numTests,8)).fill(null),examScore:null});
saveGS();closeGSModal();renderGradeSheet();
}
let _gsEditId=null;
function openGSEditModal(id){
const row=gradeSheet.find(r=>r.id===id);if(!row)return;
_gsEditId=id;
document.getElementById('gs-edit-name').value=row.name;
document.getElementById('gs-edit-lpw').value=row.lessonsPerWeek||3;
document.getElementById('gs-edit-modal').style.display='flex';
}
function closeGSEditModal(){document.getElementById('gs-edit-modal').style.display='none';_gsEditId=null;}
function submitGSEdit(){
const row=gradeSheet.find(r=>r.id===_gsEditId);if(!row)return;
const name=document.getElementById('gs-edit-name').value.trim();
if(!name){alert('Subject name cannot be empty.');return;}
const lpw=Math.max(1,+document.getElementById('gs-edit-lpw').value||3);
row.name=name;row.lessonsPerWeek=lpw;
saveGS();closeGSEditModal();renderGradeSheet();
}
function deleteGSRowFromEdit(){
if(!_gsEditId)return;
if(!confirm('Delete this subject and all its marks?'))return;
gradeSheet=gradeSheet.filter(r=>r.id!==_gsEditId);
saveGS();closeGSEditModal();renderGradeSheet();
}
function exportGSPDF(){
const{jsPDF}=window.jspdf;
const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
const W=297,H=210;
doc.setFillColor(13,15,20);doc.rect(0,0,W,H,'F');
doc.setFillColor(18,22,32);doc.rect(0,0,W,30,'F');
doc.setTextColor(232,234,242);doc.setFontSize(17);doc.setFont('helvetica','bold');
const pdfTitle=studentInfo.name?studentInfo.name+' — Grade Report':'Grade Report';
doc.text(pdfTitle,14,13);
doc.setFontSize(8.5);doc.setFont('helvetica','normal');doc.setTextColor(154,160,184);
const si=[];
if(studentInfo.name) si.push('Student: '+studentInfo.name);
if(studentInfo.gradeLevel) si.push('Grade: '+studentInfo.gradeLevel);
if(studentInfo.year) si.push(studentInfo.year);
si.push('Generated: '+new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}));
doc.text(si.join('   ·   '),14,22);
const rows=gradeSheet.map(r=>({...r,...gsCalc(r)}));
const maxT=gradeSheet.length?Math.max(...gradeSheet.map(r=>r.numTests)):1;
const uwGPA=gsUnweightedGPA();
const wGPA=gsWeightedGPA();
const saHdrs=Array.from({length:maxT},(_,i)=>`SA ${i+1}`);
const headers=[['Subject',...saHdrs,'SA Avg','Exam Mark','Final Mark','Grade','UW GPA']];
const body=rows.map(r=>{
const tVals=Array.from({length:maxT},(_,i)=>{
const v=r.tests&&r.tests[i]!=null?r.tests[i]:null;
return v!=null?String(v):'—';
});
const saAvgStr=r.saAvg!=null?String(r.saAvg):'—';
const examStr=r.examEntered?String(r.examVal):(r.examWeight===0?'N/A':'—');
const finalStr=r.finalRounded!=null?String(r.finalRounded):(r.hasExam&&!r.examEntered&&r.saAvg!=null?r.saAvg+'*':'—');
const gpaStr=r.uwGPA!=null?r.uwGPA.toFixed(1):'—';
return[r.name,...tVals,saAvgStr,examStr,finalStr,r.grade,gpaStr];
});
const withG=rows.filter(r=>r.rawPct!=null);
const avgSA=withG.length?Math.round(withG.reduce((a,r)=>a+r.rawPct,0)/withG.length):null;
body.push(['AVERAGE',...Array(maxT).fill(''),avgSA!=null?String(avgSA):'—','','','',uwGPA.toFixed(2)]);
const gradeCol=headers[0].length-2;
const gpaCol=headers[0].length-1;
doc.autoTable({
startY:34,
head:headers,
body,
theme:'grid',
tableWidth:'auto',
styles:{
fillColor:[22,26,38],textColor:[232,234,242],
fontSize:9,cellPadding:{top:3.5,bottom:3.5,left:5,right:5},
lineColor:[50,56,76],lineWidth:0.25,overflow:'linebreak'
},
headStyles:{fillColor:[14,17,28],textColor:[154,160,184],fontStyle:'bold',fontSize:8,halign:'center'},
columnStyles:{0:{halign:'left',fontStyle:'bold',cellWidth:30}},
alternateRowStyles:{fillColor:[17,21,32]},
didParseCell:(data)=>{
if(data.section!=='body') return;
const v=data.cell.raw;
if(data.column.index===gradeCol){
if(v==='A*'||v==='A') data.cell.styles.textColor=[16,185,129];
else if(v==='B') data.cell.styles.textColor=[59,130,246];
else if(v==='C') data.cell.styles.textColor=[245,158,11];
else if(v==='D') data.cell.styles.textColor=[225,29,72];
else if(v==='U/F') data.cell.styles.textColor=[90,96,120];
data.cell.styles.fontStyle='bold';
}
if(data.column.index===gpaCol){
const gv=parseFloat(v);
if(!isNaN(gv)){
if(gv>=4.0) data.cell.styles.textColor=[16,185,129];
else if(gv>=3.7) data.cell.styles.textColor=[52,211,153];
else if(gv>=3.3) data.cell.styles.textColor=[59,130,246];
else if(gv>=3.0) data.cell.styles.textColor=[245,158,11];
else if(gv>=2.0) data.cell.styles.textColor=[225,29,72];
}
}
if(data.column.index===maxT+1){
const sv=parseFloat(v);
if(!isNaN(sv)){
if(sv>=90) data.cell.styles.textColor=[16,185,129];
else if(sv>=80) data.cell.styles.textColor=[52,211,153];
else if(sv>=70) data.cell.styles.textColor=[59,130,246];
else if(sv>=60) data.cell.styles.textColor=[245,158,11];
else if(sv>=50) data.cell.styles.textColor=[225,29,72];
data.cell.styles.fontStyle='bold';
}
}
if(data.row.index===body.length-1){
data.cell.styles.fontStyle='bold';
data.cell.styles.fillColor=[22,26,42];
}
}
});
const finalY=Math.min(doc.lastAutoTable.finalY+10, H-28);
const boxes=[
{label:'Student',val:studentInfo.name||'—',x:14,w:58,color:[59,130,246]},
{label:'Grade Level',val:studentInfo.gradeLevel||'—',x:76,w:46,color:[139,92,246]},
{label:'Unweighted GPA',val:uwGPA.toFixed(2)+' / 4.00',x:126,w:60,color:[59,130,246]},
{label:'Weighted GPA',val:wGPA.toFixed(2)+' / 4.00',x:190,w:60,color:[139,92,246]},
{label:'Subjects',val:String(gradeSheet.length),x:254,w:30,color:[16,185,129]},
];
boxes.forEach(b=>{
doc.setFillColor(18,22,32);doc.setDrawColor(...b.color);
doc.roundedRect(b.x,finalY,b.w,17,2,2,'FD');
doc.setTextColor(120,126,148);doc.setFontSize(6.5);doc.setFont('helvetica','normal');
doc.text(b.label,b.x+3,finalY+5.5);
doc.setTextColor(...b.color);doc.setFontSize(10.5);doc.setFont('helvetica','bold');
doc.text(String(b.val),b.x+3,finalY+13);
});
const fname='grade_sheet'+(studentInfo.name?'_'+studentInfo.name.replace(/[^a-zA-Z0-9_\-]/g,'_').replace(/_+/g,'_'):'')+'_'+new Date().toISOString().slice(0,10)+'.pdf';
doc.save(fname);
}
function exportGSCSV(){
const rows=gradeSheet.map(r=>({...r,...gsCalc(r)}));
const maxT=gradeSheet.length?Math.max(...gradeSheet.map(r=>r.numTests)):1;
const uwGPA=gsUnweightedGPA();
const saHdrs=Array.from({length:maxT},(_,i)=>`SA ${i+1}`).join(',');
let csv=`Student,${studentInfo.name||''},Grade Level,${studentInfo.gradeLevel||''}\n`;
csv+=`Subject,${saHdrs},SA Avg (exact),SA Avg (rounded),SA Weight%,Exam Score,Exam Weight%,Final,Letter Grade,UW GPA,Lessons/Wk\n`;
rows.forEach(r=>{
const tVals=Array.from({length:maxT},(_,i)=>r.tests&&r.tests[i]!=null?r.tests[i]:'').join(',');
const sw=r.saWeight!=null?r.saWeight:60;
const ew=r.examWeight!=null?r.examWeight:40;
csv+=`"${r.name}",${tVals},${r.saAvgExact!=null?r.saAvgExact.toFixed(1):''},${r.saAvg!=null?r.saAvg:''},${sw}%,${ew>0&&r.examScore!=null?r.examScore:'N/A'},${ew}%,${r.finalRounded!=null?r.finalRounded:''},${r.grade||'—'},${r.uwGPA!=null?r.uwGPA.toFixed(1):''},${r.lpw||3}\n`;
});
const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='grade_sheet_'+(studentInfo.name||'export')+'.csv';a.click();
}
