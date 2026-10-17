function openStudentModal(){
document.getElementById('si-name').value=studentInfo.name||'';
document.getElementById('si-grade').value=studentInfo.gradeLevel||'';
document.getElementById('si-year').value=studentInfo.year||'';
document.getElementById('student-modal').style.display='flex';
}
function closeStudentModal(){document.getElementById('student-modal').style.display='none';}
function saveStudentInfo(){
studentInfo.name=document.getElementById('si-name').value.trim();
studentInfo.gradeLevel=document.getElementById('si-grade').value;
studentInfo.year=document.getElementById('si-year').value.trim();
saveStudent();closeStudentModal();renderGradeSheet();
}
let _ttAutoRefreshInterval=null;
function startTimetableAutoRefresh(){
if(_ttAutoRefreshInterval) clearInterval(_ttAutoRefreshInterval);
_ttAutoRefreshInterval=setInterval(()=>{
const ttView=document.getElementById('view-timetable');
if(ttView&&ttView.classList.contains('active')){
renderTimetable();
}
['tt-live-banner','whats-next-dash','whats-next-loom'].forEach(id=>{
const el=document.getElementById(id);
if(el&&el.getBoundingClientRect().width>0) renderLiveBanner(id);
});
},60000); 
}
function exportBackup(){
const backup={
version:'1.0',
exportedAt:new Date().toISOString(),
data:{
grades:grades,
tasks:tasks,
notes:notes,
gradeSheet:gradeSheet,
timetable:timetable,
studentInfo:studentInfo,
confidence:confidence,
revisionSessions:revisionSessions,
customGPAScale:customGPAScale,
custom_subjects:SUBJECTS,
focus_state:focusState
}
};
const json=JSON.stringify(backup,null,2);
const blob=new Blob([json],{type:'application/json'});
const url=URL.createObjectURL(blob);
const a=document.createElement('a');
a.href=url;
const date=new Date().toISOString().slice(0,10);
const name=(studentInfo&&studentInfo.name?studentInfo.name.replace(/[^a-zA-Z0-9_\-]/g,'_').replace(/_+/g,'_')+'_':'')+'academic_os_backup_'+date+'.json';
a.download=name;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
const btns=document.querySelectorAll('.btn-export');
btns.forEach(b=>{const orig=b.innerHTML;b.innerHTML='✅ Saved!';setTimeout(()=>b.innerHTML=orig,2000);});
}
function importBackup(event){
const file=event.target.files[0];
if(!file){return;}
const reader=new FileReader();
reader.onload=function(e){
try{
const raw=e.target.result;
const backup=JSON.parse(raw);
if(!backup||typeof backup!=='object'){throw new Error('Invalid backup format');}
const d=backup.data||backup; 
if(!confirm('This will replace all current data with the backup.\n\nExported: '+(backup.exportedAt||'unknown')+'\n\nContinue?')){
event.target.value='';return;
}
const keyMap={
grades:'grades',tasks:'tasks',notes:'notes',gradeSheet:'gradesheet',
timetable:'timetable',studentInfo:'studentInfo',confidence:'confidence',
revisionSessions:'revisionSessions',customGPAScale:'customGPAScale',
custom_subjects:'custom_subjects',focus_state:'focus_state'
};
Object.entries(keyMap).forEach(([backupKey,storageKey])=>{
if(d[backupKey]!==undefined){
save(storageKey,d[backupKey]);
}
});
alert('Backup imported successfully! The page will reload to apply your data.');
window.location.reload();
}catch(err){
alert('Import failed: '+err.message+'\n\nMake sure you are using a valid Academic OS backup file.');
}
event.target.value='';
};
reader.onerror=()=>{alert('Could not read file. Please try again.');event.target.value='';};
reader.readAsText(file);
}
function buildDailyQueue(){
const container = document.getElementById('daily-queue-body');
if(!container) return;
const today = new Date().toISOString().slice(0,10);
const now   = new Date();
function taskScore(t){
if(t.done) return -1; 
let score = 0;
if(t.dueDate){
const due = new Date(t.dueDate);
const diffDays = Math.round((due - now) / 86400000);
if(diffDays < 0)      score += 1000 + Math.abs(diffDays) * 10; 
else if(diffDays === 0) score += 500;  
else if(diffDays <= 3)  score += 300;  
else if(diffDays <= 7)  score += 150;  
else if(diffDays <= 14) score += 60;   
} else {
score += 20; 
}
if(t.energy === 'High')        score += 40;
else if(t.energy === 'Medium') score += 20;
if(isPrio(t.subjectId)) score += 80; 
return score;
}
const pendingTasks = tasks
.filter(t => !t.done)
.map(t => ({...t, _score: taskScore(t)}))
.sort((a, b) => b._score - a._score);
const slots = [];
for(const t of pendingTasks){
if(slots.length >= 3) break;
const subj   = getSubj(t.subjectId);
const subjColor = subj.color || '#3b82f6';
let badge, badgeClass, slotColor, label;
if(t.dueDate){
const due = new Date(t.dueDate);
const diffDays = Math.round((due - now) / 86400000);
if(diffDays < 0){
badge = '🚨 Overdue';  badgeClass = 'urgent';
slotColor = 'rgba(225,29,72,0.6)';
label = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays)!==1?'s':''}`;
} else if(diffDays === 0){
badge = '⚡ Due Today'; badgeClass = 'review';
slotColor = 'rgba(245,158,11,0.6)';
label = 'Due today';
} else if(diffDays <= 3){
badge = '📅 Soon';     badgeClass = 'review';
slotColor = 'rgba(245,158,11,0.45)';
label = `Due in ${diffDays} day${diffDays!==1?'s':''}`;
} else {
badge = '✏️ Task';     badgeClass = 'catchup';
slotColor = 'rgba(139,92,246,0.5)';
label = `Due ${t.dueDate}`;
}
} else {
badge = '✏️ Task'; badgeClass = 'catchup';
slotColor = 'rgba(139,92,246,0.5)';
label = 'No due date';
}
const energyIcon = t.energy==='High'?'🔥':t.energy==='Medium'?'⚡':'🌿';
slots.push({
badge, badgeClass, slotColor,
text: `<strong>${esc(t.title)}</strong> <span style="color:var(--text3);font-size:11px">· ${esc(subj.name)} · ${label} · ${energyIcon} ${t.energy}</span>`,
nav: 'loom'
});
}
if(slots.length < 3){
const targetGPA = (typeof gsTargetGPA !== 'undefined' ? gsTargetGPA : null) || 3.5;
const targetPct = (typeof gpaToMinPct === 'function') ? gpaToMinPct(targetGPA) : 70;
const gradeDrops = [];
gradeSheet.forEach(row=>{
const calc = gsCalc(row);
if(calc.rawPct === null) return;
const margin = calc.rawPct - targetPct;
if(margin < -5) gradeDrops.push({name: row.name, current: calc.rawPct, margin});
});
gradeDrops.sort((a,b)=>a.margin - b.margin);
if(gradeDrops.length){
const worst = gradeDrops[0];
slots.push({
badge:'🚨 Grade Alert', badgeClass:'urgent',
slotColor:'rgba(225,29,72,0.6)',
text:`<strong>${esc(worst.name)}</strong> is ${Math.abs(Math.round(worst.margin))}% below your target — current average ${Math.round(worst.current)}%.`,
nav:'gradesheet'
});
}
}
if(slots.length < 3){
const subjectsWithNotes = new Set(notes.map(n=>n.subjectId));
let blindspot = null;
for(const row of gradeSheet){
const subjObj = SUBJECTS.find(s=>s.name===row.name);
if(subjObj && !subjectsWithNotes.has(subjObj.id)){
blindspot = {name: row.name}; break;
}
}
if(!blindspot){
for(const subj of SUBJECTS){
if(!subjectsWithNotes.has(subj.id)){ blindspot = {name: subj.name}; break; }
}
}
if(blindspot){
slots.push({
badge:'🔍 Catch-up', badgeClass:'catchup',
slotColor:'rgba(139,92,246,0.6)',
text:`No notes yet for <strong>${esc(blindspot.name)}</strong> — create your first concept card to fill this knowledge gap.`,
nav:'vault'
});
}
}
const hasAnyGrades = gradeSheet.some(r=>{const c=gsCalc(r);return c.rawPct!==null;});
const isNewUser = !hasAnyGrades && notes.length===0 && tasks.filter(t=>!t.done).length===0;
if(isNewUser && slots.length === 0){
slots.push(
{badge:'📘 Start', badgeClass:'onboard', slotColor:'rgba(59,130,246,0.5)',
text:'Add your first task in <strong>The Loom</strong> — it will appear here sorted by priority.',
nav:'loom'},
{badge:'📘 Start', badgeClass:'onboard', slotColor:'rgba(59,130,246,0.5)',
text:'Set up your <strong>Target GPA</strong> in the Grade Engine to unlock grade-drop alerts.',
nav:'gradesheet'},
{badge:'📘 Start', badgeClass:'onboard', slotColor:'rgba(59,130,246,0.5)',
text:'Fill your <strong>Timetable</strong> to enable the live class schedule and priority scoring.',
nav:'timetable'}
);
}
if(slots.length === 0){
container.innerHTML = `
<div class="dq-clear">
<div style="font-size:32px">🎉</div>
<div style="font-size:14px;font-weight:700;color:var(--emerald);margin-top:2px">All Tasks Complete!</div>
<div style="font-size:12px;color:var(--text3);margin-top:4px">No pending tasks. Add new ones in The Loom to see them here.</div>
</div>`;
return;
}
const navLabels = {
'gradesheet':'Grade Sheet','grades':'Grades','loom':'The Loom','vault':'Vault',
'revision':'Revision','timetable':'Timetable','dashboard':'Dashboard','focus':'Focus'
};
container.innerHTML = slots.slice(0,3).map((item,i)=>{
const delay = i*0.07;
return `<div class="dq-item" style="animation-delay:${delay}s">
<div class="dq-slot-num" style="background:${item.slotColor}22;color:${item.slotColor};border:1px solid ${item.slotColor}55">${i+1}</div>
<span class="dq-badge ${item.badgeClass}">${item.badge}</span>
<div class="dq-text">${item.text}</div>
<button class="dq-go-btn" data-dq-nav="${item.nav}" title="Go to ${navLabels[item.nav]||item.nav}">Go →</button>
</div>`;
}).join('');
container.querySelectorAll('.dq-go-btn[data-dq-nav]').forEach(btn=>{
btn.addEventListener('click',function(){
const viewId = this.getAttribute('data-dq-nav');
const navEl = document.querySelector('.nav-item[onclick*="\''+viewId+'\'"]');
if(navEl) switchView(viewId, navEl);
});
});
}
document.addEventListener('DOMContentLoaded', function(){
refreshAllSubjectSelects();
document.getElementById('gm-date').value=new Date().toISOString().slice(0,10);
if(document.getElementById('gs-std-subject')) gsPopulateStdList();
const savedStudent=load('studentInfo',null);
if(savedStudent) Object.assign(studentInfo,savedStudent);
revisionSessions=load('revisionSessions',[]);
const savedScale=load('customGPAScale',null);
if(savedScale) customGPAScale=savedScale;
const savedFocus=load('focus_state',null);
if(savedFocus){focusState.selectedSound=savedFocus.selectedSound||'white';focusState.volume=savedFocus.volume||0.7;focusState.sessions=savedFocus.sessions||0;focusState.focusMinutes=savedFocus.focusMinutes||25;focusState.breakMinutes=savedFocus.breakMinutes||5;focusState.remaining=focusState.focusMinutes*60;document.getElementById('focus-volume').value=Math.round((savedFocus.volume||0.7)*100);document.getElementById('focus-vol-label').textContent=Math.round((savedFocus.volume||0.7)*100)+'%';}
requestNotifPermission();
startCountdown();
startTimetableAutoRefresh();
refreshAllSubjectSelects();
renderDashboard();
buildDailyQueue();
});
let revisionSessions = load('revisionSessions', []);
function saveRevSessions(){save('revisionSessions', revisionSessions);}
function buildRevHeatmapData(){
const map = {};
revisionSessions.forEach(s=>{
if(!s.date) return;
map[s.date] = (map[s.date]||0) + (s.duration||0);
});
return map;
}
function revisionHeatmapHTML(){
const today = new Date(), W = 16;
const heatData = buildRevHeatmapData();
let h = '<div class="hmap">';
for(let w = 0; w < W; w++){
h += '<div class="hmap-col">';
for(let d = 0; d < 7; d++){
const dt = new Date(today);
dt.setDate(today.getDate() - (W-1-w)*7 - (today.getDay()||7) + d + 1);
const ds = dt.toISOString().slice(0,10);
const mins = heatData[ds]||0;
let bg;
if(mins === 0)       bg = 'rgba(255,255,255,.07)';
else if(mins <= 60)  bg = 'rgba(59,130,246,.45)';
else if(mins <= 120) bg = 'rgba(16,185,129,.55)';
else if(mins <= 180) bg = 'rgba(245,158,11,.6)';
else                 bg = 'rgba(225,29,72,.8)';
const isTd = ds === today.toISOString().slice(0,10);
const tooltip = mins > 0 ? `${ds} — ${mins} min studied` : ds;
h += `<div class="hmap-cell" style="background:${bg};${isTd?'outline:2px solid var(--blue);outline-offset:1px':''}" title="${tooltip}"></div>`;
}
h += '</div>';
}
return h + '</div>';
}
let _editingRevSessionId = null;
function openRevSessionModal(id){
_editingRevSessionId = id || null;
refreshAllSubjectSelects();
if(id){
const sess = revisionSessions.find(s=>s.id===id);
if(sess){
document.getElementById('rs-subject').value = sess.subjectId||'';
document.getElementById('rs-date').value = sess.date||'';
document.getElementById('rs-duration').value = sess.duration||'';
document.getElementById('rs-topic').value = sess.topic||'';
}
document.getElementById('rev-session-modal-title').textContent = 'Edit Study Session';
} else {
document.getElementById('rs-date').value = new Date().toISOString().slice(0,10);
document.getElementById('rs-duration').value = '';
document.getElementById('rs-topic').value = '';
document.getElementById('rev-session-modal-title').textContent = 'Add Study Session';
}
document.getElementById('rev-session-modal').style.display='flex';
}
function closeRevSessionModal(){document.getElementById('rev-session-modal').style.display='none'; _editingRevSessionId=null;}
function submitRevSession(){
const subjectId = document.getElementById('rs-subject').value;
const date = document.getElementById('rs-date').value;
const duration = parseInt(document.getElementById('rs-duration').value)||0;
const topic = document.getElementById('rs-topic').value.trim();
if(!date){alert('Please pick a date.');return;}
if(duration<=0){alert('Enter a duration in minutes.');return;}
if(_editingRevSessionId){
revisionSessions = revisionSessions.map(s=>s.id===_editingRevSessionId?{...s,subjectId,date,duration,topic}:s);
} else {
revisionSessions.push({id:uid(),subjectId,date,duration,topic});
}
saveRevSessions();
closeRevSessionModal();
renderRevision();
}
function deleteRevSession(id){
if(!confirm('Delete this session?')) return;
revisionSessions = revisionSessions.filter(s=>s.id!==id);
saveRevSessions();
renderRevision();
}
function renderRevSessionsList(){
const el = document.getElementById('rev-sessions-list');
if(!el) return;
const recent = [...revisionSessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
if(!recent.length){
el.innerHTML='<div style="color:var(--text3);font-size:13px;padding:12px 0">No sessions logged yet. Click "+ Log Study Session" to start tracking.</div>';
return;
}
el.innerHTML = recent.map((s,i)=>{
const subj = getSubj(s.subjectId);
return `<div class="glass anim-slide" style="padding:13px 16px;display:flex;align-items:center;gap:12px;animation-delay:${i*0.04}s">
<div style="width:36px;height:36px;border-radius:10px;background:${subj.dim};border:1px solid ${subj.color}44;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">📖</div>
<div style="flex:1;min-width:0">
<div style="font-size:13px;font-weight:600;margin-bottom:3px">${subj.name}</div>
<div style="font-size:12px;color:var(--text3)">${s.date} · ${s.duration} min${s.topic?` · ${s.topic}`:''}</div>
</div>
<span class="tag" style="background:var(--blue-d);color:var(--blue);flex-shrink:0">${s.duration}m</span>
<button class="btn btn-sm" onclick="openRevSessionModal('${s.id}')" style="flex-shrink:0">✏️</button>
<button class="btn btn-danger btn-sm" onclick="deleteRevSession('${s.id}')" style="flex-shrink:0">×</button>
</div>`;
}).join('');
}
const DEFAULT_GPA_SCALE = [
{grade:'A*', range:'90–100%', minScore:90, points:4.0, color:'var(--emerald)'},
{grade:'A',  range:'80–89%',  minScore:80, points:3.7, color:'var(--blue)'},
{grade:'B',  range:'70–79%',  minScore:70, points:3.3, color:'var(--amber)'},
{grade:'C',  range:'60–69%',  minScore:60, points:3.0, color:'#fb923c'},
{grade:'D',  range:'50–59%',  minScore:50, points:2.0, color:'var(--ruby)'},
{grade:'U/F',range:'Below 50%',minScore:0, points:0.0, color:'var(--text3)'},
];
let customGPAScale = load('customGPAScale', DEFAULT_GPA_SCALE.map(g=>({...g})));
function saveGPAScale(){save('customGPAScale',customGPAScale);}
function scoreToGPA(s){
const sorted = [...customGPAScale].sort((a,b)=>b.minScore-a.minScore);
for(const entry of sorted){
if(s >= entry.minScore) return entry.points;
}
return 0.0;
}
function openGPASettingsModal(){
renderGPAScaleRows();
document.getElementById('gpa-settings-modal').style.display='flex';
}
function closeGPASettingsModal(){document.getElementById('gpa-settings-modal').style.display='none';}
function renderGPAScaleRows(){
const container = document.getElementById('gpa-scale-rows');
container.innerHTML = customGPAScale.map((entry,i)=>`
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:8px;align-items:center">
<div style="font-size:13px;font-weight:600;color:${entry.color}">${entry.grade}</div>
<div style="font-size:12px;color:var(--text3)">${entry.range}</div>
<input class="inp score-inp" style="width:80px;text-align:center" type="number" min="0" max="4" step="0.1"
value="${entry.points}" id="gpa-pts-${i}" placeholder="pts"/>
</div>
`).join('');
}
function saveGPASettings(){
customGPAScale.forEach((entry,i)=>{
const inp = document.getElementById('gpa-pts-'+i);
if(inp){
const v = parseFloat(inp.value);
if(!isNaN(v) && v>=0) entry.points = v;
}
});
saveGPAScale();
closeGPASettingsModal();
if(document.getElementById('view-gradesheet').classList.contains('active')) renderGradeSheet();
if(document.getElementById('view-dashboard').classList.contains('active')) renderDashboard();
}
function resetGPAScale(){
customGPAScale = DEFAULT_GPA_SCALE.map(g=>({...g}));
saveGPAScale();
renderGPAScaleRows();
}
function openFeedbackModal(){
document.getElementById('feedback-form-body').style.display='block';
document.getElementById('feedback-thankyou').style.display='none';
document.getElementById('fb-name').value='';
document.getElementById('fb-message').value='';
const btn=document.getElementById('fb-send-btn');
btn.textContent='✉ Send';btn.disabled=false;
document.getElementById('feedback-modal').style.display='flex';
}
function closeFeedbackModal(){
document.getElementById('feedback-modal').style.display='none';
}
async function submitFeedback(){
const name=document.getElementById('fb-name').value.trim();
const message=document.getElementById('fb-message').value.trim();
if(!message){
document.getElementById('fb-message').focus();
document.getElementById('fb-message').style.borderColor='var(--ruby)';
setTimeout(()=>{document.getElementById('fb-message').style.borderColor='';},1800);
return;
}
const btn=document.getElementById('fb-send-btn');
btn.textContent='Sending…';btn.disabled=true;
try{
const res=await fetch('https://formspree.io/f/mykljyyn',{
method:'POST',
headers:{'Content-Type':'application/json','Accept':'application/json'},
body:JSON.stringify({name:name||'Anonymous',message})
});
if(res.ok){
document.getElementById('feedback-form-body').style.display='none';
document.getElementById('feedback-thankyou').style.display='block';
setTimeout(closeFeedbackModal,2800);
} else {
btn.textContent='✉ Send';btn.disabled=false;
alert('Hmm, something went wrong. Please try again.');
}
} catch(e){
btn.textContent='✉ Send';btn.disabled=false;
alert('Network error. Please check your connection and try again.');
}
}
