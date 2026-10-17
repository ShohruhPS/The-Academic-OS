function scoreToGPA(s){return s>=90?4.0:s>=80?3.7:s>=70?3.3:s>=60?3.0:s>=50?2.0:0.0;}
function scoreToLetter(s){return s>=90?'A*':s>=80?'A':s>=70?'B':s>=60?'C':s>=50?'D':'U/F';}
function scoreToCat(s){return s>=90?'Excellent':s>=80?'Very Good':s>=70?'Good':s>=60?'Satisfactory':s>=50?'Pass':'Fail';}
function gpaColor(g){return g>=4.0?'var(--emerald)':g>=3.7?'#34d399':g>=3.3?'var(--blue)':g>=3.0?'var(--amber)':g>=2.0?'var(--ruby)':'var(--text3)';}
function sColor(s){return s>=90?'var(--emerald)':s>=80?'#34d399':s>=70?'var(--blue)':s>=60?'var(--amber)':s>=50?'var(--ruby)':'var(--text3)';}
function calcGPA(list){
if(!list.length)return 0;
let pts=0,wt=0;
list.forEach(g=>{pts+=scoreToGPA(g.score)*g.lessonsPerWeek;wt+=g.lessonsPerWeek;});
return wt?pts/wt:0;
}
let SUBJECTS=load('custom_subjects',[
{id:'s1',name:'Mathematics',type:'STEM',level:'A-Level',color:'#3b82f6',dim:'rgba(59,130,246,0.15)'},
{id:'s2',name:'Physics',type:'STEM',level:'IGCSE',color:'#60a5fa',dim:'rgba(96,165,250,0.13)'},
{id:'s3',name:'Chemistry',type:'STEM',level:'IGCSE',color:'#38bdf8',dim:'rgba(56,189,248,0.13)'},
{id:'s4',name:'Biology',type:'STEM',level:'IGCSE',color:'#34d399',dim:'rgba(52,211,153,0.12)'},
{id:'s5',name:'Computer Science',type:'STEM',level:'A-Level',color:'#a78bfa',dim:'rgba(167,139,250,0.13)'},
{id:'s6',name:'English Literature',type:'Humanities',level:'A-Level',color:'#e11d48',dim:'rgba(225,29,72,0.15)'},
{id:'s7',name:'History',type:'Humanities',level:'IGCSE',color:'#f43f5e',dim:'rgba(244,63,94,0.13)'},
{id:'s8',name:'Economics',type:'Humanities',level:'A-Level',color:'#fb923c',dim:'rgba(251,146,60,0.13)'},
{id:'s9',name:'Russian',type:'Languages',level:'IGCSE',color:'#10b981',dim:'rgba(16,185,129,0.15)'},
{id:'s10',name:'Uzbek',type:'Languages',level:'IGCSE',color:'#34d399',dim:'rgba(52,211,153,0.13)'},
]);
function saveSubjects(){save('custom_subjects',SUBJECTS);}
const DEFAULT_TIMETABLE=[
{id:'t01',type:'lesson',subjectId:'s1',day:1,start:'08:30',end:'09:15',room:'A101',label:''},
{id:'t02',type:'lesson',subjectId:'s2',day:1,start:'09:20',end:'10:05',room:'B203',label:''},
{id:'t03',type:'lesson',subjectId:'s3',day:1,start:'10:10',end:'10:55',room:'Lab1',label:''},
{id:'t04',type:'break',subjectId:'',day:1,start:'10:55',end:'11:25',room:'',label:'Break 1'},
{id:'t05',type:'lesson',subjectId:'s6',day:1,start:'11:25',end:'12:10',room:'C105',label:''},
{id:'t06',type:'lesson',subjectId:'s9',day:1,start:'12:15',end:'13:00',room:'D102',label:''},
{id:'t07',type:'break',subjectId:'',day:1,start:'13:00',end:'14:00',room:'',label:'Break 2'},
{id:'t08',type:'lesson',subjectId:'s5',day:1,start:'14:00',end:'14:45',room:'Lab2',label:''},
{id:'t09',type:'lesson',subjectId:'s8',day:1,start:'14:50',end:'15:35',room:'A103',label:''},
{id:'t10',type:'break',subjectId:'',day:1,start:'15:35',end:'15:50',room:'',label:'Break 3'},
{id:'t11',type:'lesson',subjectId:'s4',day:1,start:'15:50',end:'16:35',room:'B204',label:''},
{id:'t12',type:'lesson',subjectId:'s4',day:2,start:'08:30',end:'09:15',room:'B204',label:''},
{id:'t13',type:'lesson',subjectId:'s7',day:2,start:'09:20',end:'10:05',room:'C106',label:''},
{id:'t14',type:'lesson',subjectId:'s10',day:2,start:'10:10',end:'10:55',room:'D103',label:''},
{id:'t15',type:'break',subjectId:'',day:2,start:'10:55',end:'11:25',room:'',label:'Break 1'},
{id:'t16',type:'lesson',subjectId:'s1',day:2,start:'11:25',end:'12:10',room:'A101',label:''},
{id:'t17',type:'lesson',subjectId:'s2',day:2,start:'12:15',end:'13:00',room:'Lab1',label:''},
{id:'t18',type:'break',subjectId:'',day:2,start:'13:00',end:'14:00',room:'',label:'Break 2'},
{id:'t19',type:'lesson',subjectId:'s6',day:2,start:'14:00',end:'14:45',room:'C105',label:''},
{id:'t20',type:'lesson',subjectId:'s3',day:2,start:'14:50',end:'15:35',room:'Lab1',label:''},
{id:'t21',type:'lesson',subjectId:'s1',day:3,start:'08:30',end:'09:15',room:'A101',label:''},
{id:'t22',type:'lesson',subjectId:'s5',day:3,start:'09:20',end:'10:05',room:'Lab2',label:''},
{id:'t23',type:'lesson',subjectId:'s8',day:3,start:'10:10',end:'10:55',room:'A103',label:''},
{id:'t24',type:'break',subjectId:'',day:3,start:'10:55',end:'11:25',room:'',label:'Break 1'},
{id:'t25',type:'lesson',subjectId:'s4',day:3,start:'11:25',end:'12:10',room:'B204',label:''},
{id:'t26',type:'lesson',subjectId:'s9',day:3,start:'12:15',end:'13:00',room:'D102',label:''},
{id:'t27',type:'break',subjectId:'',day:3,start:'13:00',end:'14:00',room:'',label:'Break 2'},
{id:'t28',type:'lesson',subjectId:'s7',day:3,start:'14:00',end:'14:45',room:'C106',label:''},
{id:'t29',type:'lesson',subjectId:'s2',day:3,start:'14:50',end:'15:35',room:'Lab1',label:''},
{id:'t30',type:'lesson',subjectId:'s3',day:4,start:'08:30',end:'09:15',room:'Lab1',label:''},
{id:'t31',type:'lesson',subjectId:'s6',day:4,start:'09:20',end:'10:05',room:'C105',label:''},
{id:'t32',type:'lesson',subjectId:'s10',day:4,start:'10:10',end:'10:55',room:'D103',label:''},
{id:'t33',type:'break',subjectId:'',day:4,start:'10:55',end:'11:25',room:'',label:'Break 1'},
{id:'t34',type:'lesson',subjectId:'s1',day:4,start:'11:25',end:'12:10',room:'A101',label:''},
{id:'t35',type:'lesson',subjectId:'s5',day:4,start:'12:15',end:'13:00',room:'Lab2',label:''},
{id:'t36',type:'break',subjectId:'',day:4,start:'13:00',end:'14:00',room:'',label:'Break 2'},
{id:'t37',type:'lesson',subjectId:'s8',day:4,start:'14:00',end:'14:45',room:'A103',label:''},
{id:'t38',type:'lesson',subjectId:'s4',day:4,start:'14:50',end:'15:35',room:'B204',label:''},
{id:'t39',type:'lesson',subjectId:'s9',day:5,start:'08:30',end:'09:15',room:'D102',label:''},
{id:'t40',type:'lesson',subjectId:'s2',day:5,start:'09:20',end:'10:05',room:'B203',label:''},
{id:'t41',type:'lesson',subjectId:'s7',day:5,start:'10:10',end:'10:55',room:'C106',label:''},
{id:'t42',type:'break',subjectId:'',day:5,start:'10:55',end:'11:25',room:'',label:'Break 1'},
{id:'t43',type:'lesson',subjectId:'s1',day:5,start:'11:25',end:'12:10',room:'A101',label:''},
{id:'t44',type:'lesson',subjectId:'s3',day:5,start:'12:15',end:'13:00',room:'Lab1',label:''},
{id:'t45',type:'break',subjectId:'',day:5,start:'13:00',end:'14:00',room:'',label:'Break 2'},
{id:'t46',type:'lesson',subjectId:'s6',day:5,start:'14:00',end:'14:45',room:'C105',label:''},
{id:'t47',type:'lesson',subjectId:'s10',day:5,start:'14:50',end:'15:35',room:'D103',label:''},
];
function esc(str){return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');}
let _toastTimer=null;
function showStorageWarning(msg){
const el=document.getElementById('storage-toast');
if(!el)return;
el.textContent=msg||'⚠️ Storage is almost full. Export a backup to avoid losing data.';
el.classList.add('show');
clearTimeout(_toastTimer);
_toastTimer=setTimeout(()=>el.classList.remove('show'),5000);
}
function save(key,val){
try{localStorage.setItem('aos_'+key,JSON.stringify(val));}
catch(e){
if(e.name==='QuotaExceededError'||e.code===22||e.code===1014){
showStorageWarning('⚠️ Storage full — data not saved. Go to Settings → Export Backup to free space.');
} else {
console.warn('Storage save failed for key',key,e);
}
}
queueServerSync();
}
function load(key,def){try{const v=localStorage.getItem('aos_'+key);return v?JSON.parse(v):def;}catch(e){return def;}}
const _isFirstVisit = !localStorage.getItem('gradesheet') && !load('academicOS_onboarded', null);
const _demoGrades = _isFirstVisit ? [
{id:'g1',subjectId:'s1',score:90,lessonsPerWeek:4,label:'Unit Test 1',date:'2025-01-15'},
{id:'g2',subjectId:'s1',score:92,lessonsPerWeek:4,label:'Unit Test 2',date:'2025-02-20'},
{id:'g3',subjectId:'s2',score:85,lessonsPerWeek:3,label:'Lab Report',date:'2025-01-18'},
{id:'g4',subjectId:'s3',score:91,lessonsPerWeek:3,label:'Practical',date:'2025-01-22'},
{id:'g5',subjectId:'s6',score:76,lessonsPerWeek:3,label:'Essay 1',date:'2025-02-05'},
{id:'g6',subjectId:'s9',score:95,lessonsPerWeek:2,label:'Speaking Test',date:'2025-02-15'},
{id:'g7',subjectId:'s5',score:89,lessonsPerWeek:3,label:'Project',date:'2025-02-08'},
] : [];
const _demoTasks = _isFirstVisit ? [
{id:'tk1',subjectId:'s1',title:'Complete integration exercises',dueDate:'2025-03-15',energy:'High',done:false,desc:'Chapter 5, problems 1–20'},
{id:'tk2',subjectId:'s2',title:'Read electromagnetic induction notes',dueDate:'2025-03-12',energy:'Medium',done:false,desc:''},
{id:'tk3',subjectId:'s6',title:'Write Hamlet essay',dueDate:'2025-03-20',energy:'High',done:false,desc:'2000 words minimum'},
{id:'tk4',subjectId:'s9',title:'Russian vocabulary flashcards',dueDate:'2025-03-11',energy:'Low',done:false,desc:'50 new words'},
] : [];
const _demoNotes = _isFirstVisit ? [
{id:'n1',subjectId:'s2',title:"Faraday's Law",content:"# Faraday's Law\n\n## Core Concept\n**English:** EMF is induced when magnetic flux changes.\n\n### 🇷🇺 Русский\nЗакон Фарадея: ЭМД = скорость изменения потока.\n\n### 🇺🇿 O'zbek\nFaradey qonuni.\n\n## Formula\n$\\varepsilon = -d\\Phi/dt$",date:'2025-02-10',tags:['Physics','EMF'],files:[]},
{id:'n2',subjectId:'s1',title:'Integration by Parts',content:"# Integration by Parts\n\n## Core Concept\n**English:** Integrates products of functions.\n\n### 🇷🇺 Русский\nИнтегрирование по частям.\n\n### 🇺🇿 O'zbek\nBo'laklar bo'yicha integrallash.\n\n## Formula\n$$\\int u\\,dv = uv - \\int v\\,du$$",date:'2025-02-12',tags:['Math','Integration'],files:[]},
] : [];
const _demoGradeSheet = []; 
let timetable=load('timetable',DEFAULT_TIMETABLE);
let grades=load('grades',_demoGrades);
let tasks=load('tasks',_demoTasks);
let notes=load('notes',_demoNotes);
let gradeSheet=load('gradesheet',_demoGradeSheet);
let studentInfo=load('studentInfo',{name:'',gradeLevel:''});
function saveStudent(){save('studentInfo',studentInfo);}
let confidence=load('confidence',{
s1:{score:3,lastReview:'2025-02-20',reviewCount:5},s2:{score:2,lastReview:'2025-02-18',reviewCount:3},
s3:{score:4,lastReview:'2025-02-22',reviewCount:7},s4:{score:3,lastReview:'2025-02-15',reviewCount:4},
s5:{score:5,lastReview:'2025-02-24',reviewCount:6},s6:{score:2,lastReview:'2025-02-14',reviewCount:2},
s7:{score:3,lastReview:'2025-02-19',reviewCount:4},s8:{score:2,lastReview:'2025-02-16',reviewCount:3},
s9:{score:4,lastReview:'2025-02-23',reviewCount:8},s10:{score:3,lastReview:'2025-02-21',reviewCount:5},
});
function saveTT(){save('timetable',timetable);}
function saveGrades(){save('grades',grades);}
function saveTasks(){save('tasks',tasks);if(typeof buildDailyQueue==='function')buildDailyQueue();}
function saveNotes(){save('notes',notes);if(typeof buildDailyQueue==='function')buildDailyQueue();}
function saveGS(){save('gradesheet',gradeSheet);if(typeof buildDailyQueue==='function')buildDailyQueue();}
function saveConf(){save('confidence',confidence);}
function resetDefaultTT(){if(confirm('Reset to default timetable?')){timetable=JSON.parse(JSON.stringify(DEFAULT_TIMETABLE));saveTT();renderTimetable();}}
function getAllSubjects(){return SUBJECTS;}
function getSubj(id){return SUBJECTS.find(s=>s.id===id)||{name:id||'Unknown',color:'#888',dim:'rgba(128,128,128,.12)',type:'STEM',level:''};} 
function refreshAllSubjectSelects(){
const opts = SUBJECTS.map(s=>`<option value="${s.id}">${s.name}${s.level?' ('+s.level+')':''}</option>`).join('');
const optsPlain = SUBJECTS.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
['gm-subject'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=opts;});
['ne-subject','rs-subject'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=optsPlain;});
const vf=document.getElementById('vault-filter-subj');
if(vf){vf.innerHTML='<option value="all">All Subjects</option>'+optsPlain;}
const tf=document.getElementById('task-filter-subj');
if(tf){tf.innerHTML='<option value="all">All Subjects</option>'+optsPlain;}
}
const SUBJECT_COLORS=['#3b82f6','#60a5fa','#38bdf8','#34d399','#a78bfa','#e11d48','#f43f5e','#fb923c','#10b981','#f59e0b','#8b5cf6','#ec4899'];
function openManageSubjectsModal(){
renderManageSubjectsList();
document.getElementById('manage-subjects-modal').style.display='flex';
}
function closeManageSubjectsModal(){
document.getElementById('manage-subjects-modal').style.display='none';
}
function renderManageSubjectsList(){
const list=document.getElementById('ms-list');
if(!SUBJECTS.length){list.innerHTML='<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">No subjects yet.</div>';return;}
list.innerHTML=SUBJECTS.map(s=>{
const gradeCount=grades.filter(g=>g.subjectId===s.id).length;
return`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:9px;margin-bottom:6px">
<div style="width:12px;height:12px;border-radius:50%;background:${s.color};flex-shrink:0"></div>
<div style="flex:1;min-width:0">
<div style="font-size:13px;font-weight:600;color:var(--text)">${s.name}</div>
<div style="font-size:11px;color:var(--text3)">${s.level||s.type||''} · ${gradeCount} grade${gradeCount!==1?'s':''}</div>
</div>
<button data-remove-subject="${s.id}" style="background:var(--ruby-d);border:1px solid var(--ruby);color:var(--ruby);border-radius:7px;padding:4px 10px;cursor:pointer;font-size:12px;font-family:Geist,sans-serif;flex-shrink:0">✕ Remove</button>
</div>`;
}).join('');
list.onclick=function(e){
const btn=e.target.closest('[data-remove-subject]');
if(btn)removeSubject(btn.getAttribute('data-remove-subject'));
};
}
function removeSubject(id){
const s=SUBJECTS.find(x=>x.id===id);if(!s)return;
const gradeCount=grades.filter(g=>g.subjectId===id).length;
const noteCount=notes.filter(n=>n.subjectId===id).length;
const gsCount=gradeSheet.filter(r=>r.name===s.name).length;
let warnParts=[];
if(gradeCount>0) warnParts.push(`${gradeCount} grade record${gradeCount!==1?'s':''}`);
if(noteCount>0)  warnParts.push(`${noteCount} Knowledge Vault note${noteCount!==1?'s':''}`);
if(gsCount>0)    warnParts.push(`${gsCount} Grade Sheet row${gsCount!==1?'s':''}`);
const warn=warnParts.length?`\n\nThis will also permanently delete:\n• `+warnParts.join('\n• '):'';
if(!confirm(`Remove "${s.name}"?${warn}`))return;
SUBJECTS=SUBJECTS.filter(x=>x.id!==id);
grades=grades.filter(g=>g.subjectId!==id);
notes=notes.filter(n=>n.subjectId!==id);
gradeSheet=gradeSheet.filter(r=>r.name!==s.name);
saveSubjects();save('grades',grades);saveNotes();saveGS();
refreshAllSubjectSelects();
renderManageSubjectsList();
renderGrades();
renderNotes();
if(typeof renderGradeSheet==='function') renderGradeSheet();
}
function addNewSubject(){
const nameEl=document.getElementById('ms-new-name');
const levelEl=document.getElementById('ms-new-level');
const name=nameEl.value.trim();
if(!name){nameEl.style.borderColor='var(--ruby)';setTimeout(()=>nameEl.style.borderColor='',1500);return;}
const color=SUBJECT_COLORS[SUBJECTS.length%SUBJECT_COLORS.length];
const hex=color.replace('#','');
const r=parseInt(hex.slice(0,2),16),g2=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
SUBJECTS.push({id:'s'+uid(),name,type:'Custom',level:levelEl.value.trim()||'Custom',color,dim:`rgba(${r},${g2},${b},0.13)`});
saveSubjects();
nameEl.value='';levelEl.value='';
refreshAllSubjectSelects();
renderManageSubjectsList();
renderGrades();
renderNotes();
}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function fmtT(t){const[h,m]=t.split(':').map(Number);return`${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;}
function dayN(d){return{0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat',7:'Sun'}[d]||'';}
function toMin(t){const[h,m]=t.split(':').map(Number);return h*60+m;}
function srInt(s){return{1:1,2:2,3:4,4:7,5:14}[s]||7;}
function daysToExam(sid){
const stored=JSON.parse(localStorage.getItem('academicOS_examDates')||'{}');
if(stored[sid]) return Math.ceil((new Date(stored[sid])-new Date())/864e5);
const offsets={s1:42,s2:35,s3:28,s4:56,s5:21,s6:49,s7:63,s8:70,s9:14,s10:18};
if(!(sid in offsets)) return null;
const d=new Date();d.setDate(d.getDate()+offsets[sid]);
return offsets[sid];
}
function isPrio(sid){const d=daysToExam(sid);return d!==null&&d>0&&d<=30;}
function getCurrentScheduleInfo(){
const now=new Date();
const jsDow=now.getDay(); 
const ttDay=jsDow===0||jsDow===6?null:jsDow;
const curMin=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
if(ttDay!==null){
const todayBlocks=timetable.filter(t=>t.day===ttDay).sort((a,b)=>toMin(a.start)-toMin(b.start));
const active=todayBlocks.find(t=>curMin>=toMin(t.start)&&curMin<toMin(t.end));
if(active){
const remaining=toMin(active.end)-curMin;
return{state:'active',block:active,remainingMin:remaining};
}
const next=todayBlocks.find(t=>toMin(t.start)>curMin);
if(next){
const until=toMin(next.start)-curMin;
return{state:'next',block:next,remainingMin:until};
}
}
for(let i=1;i<=7;i++){
const nd=(jsDow+i)%7;
const ttNd=nd===0||nd===6?null:nd;
if(ttNd===null) continue;
const ls=timetable.filter(t=>t.day===ttNd).sort((a,b)=>toMin(a.start)-toMin(b.start));
if(ls.length) return{state:'future',block:ls[0],dayName:dayN(ttNd),remainingMin:null};
}
return null;
}
function formatCountdown(totalMin){
const h=Math.floor(totalMin/60);
const m=Math.floor(totalMin%60);
const s=Math.round((totalMin%1)*60);
if(h>0) return`${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
if(m>0) return`${m}m ${String(s).padStart(2,'0')}s`;
return`${s}s`;
}
function renderLiveBanner(containerId){
const el=document.getElementById(containerId);if(!el)return;
const info=getCurrentScheduleInfo();
if(!info){el.innerHTML='<div style="color:var(--text3);font-size:13px">No lessons scheduled.</div>';return;}
const{state,block,remainingMin,dayName}=info;
const isLesson=block.type!=='break';
const s=isLesson&&block.subjectId?getSubj(block.subjectId):{name:block.label||'Break',color:'#5a6078',dim:'rgba(90,96,120,.15)'};
const icon=!isLesson?'☕':s.type==='STEM'?'⚛':s.type==='Languages'?'🌐':'📚';
let statusTag='',countdown='';
if(state==='active'){
statusTag=`<span class="flex" style="gap:5px;font-size:11px;color:var(--emerald)"><span class="live-dot"></span>NOW</span>`;
countdown=`<div style="font-family:'Geist Mono',monospace;font-size:28px;font-weight:700;color:var(--emerald);letter-spacing:.02em" id="${containerId}-cd">${formatCountdown(remainingMin)}</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin-top:2px">Time remaining</div>`;
} else if(state==='next'){
statusTag=`<span class="tag" style="background:var(--blue-d);color:var(--blue);font-size:10px">NEXT UP</span>`;
countdown=`<div style="font-family:'Geist Mono',monospace;font-size:28px;font-weight:700;color:var(--blue);letter-spacing:.02em" id="${containerId}-cd">${formatCountdown(remainingMin)}</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin-top:2px">Starts in</div>`;
} else {
statusTag=`<span class="tag" style="background:var(--surface2);color:var(--text3);font-size:10px">${dayName}</span>`;
countdown=`<div style="font-size:14px;color:var(--text2);margin-top:4px">First block: ${fmtT(block.start)}</div>`;
}
el.innerHTML=`<div style="position:relative;overflow:hidden"><div style="position:absolute;inset:0;background:radial-gradient(circle at 90% 50%,${s.dim},transparent 60%);pointer-events:none"></div>
<div style="display:flex;align-items:flex-start;gap:16px">
<div style="width:44px;height:44px;border-radius:12px;background:${s.dim};border:1px solid ${s.color}44;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${icon}</div>
<div style="flex:1">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">${statusTag}<span style="font-size:14px;font-weight:600">${s.name}</span></div>
<div style="font-size:12px;color:var(--text2)">${fmtT(block.start)}–${fmtT(block.end)}${block.room?' · '+block.room:''}</div>
</div>
<div style="text-align:right;flex-shrink:0">${countdown}</div>
</div>
</div>`;
}
let countdownTimer=null;
function startCountdown(){
clearInterval(countdownTimer);
countdownTimer=null;
function tick(){
const now=new Date();
const cl=document.getElementById('live-clock');
const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const dayLabel=dayNames[now.getDay()];
const timeStr=now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
if(cl) cl.innerHTML=`<div style="font-size:10px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:1px">${dayLabel} · ${now.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div><div>${timeStr}</div>`;
['tt-live-banner','whats-next-dash','whats-next-loom'].forEach(id=>{
const el=document.getElementById(id);
if(el&&el.getBoundingClientRect().width>0) renderLiveBanner(id);
});
}
tick();
countdownTimer=setInterval(tick,1000);
if(!startCountdown._visRegistered){
startCountdown._visRegistered=true;
document.addEventListener('visibilitychange',function(){
if(document.hidden){clearInterval(countdownTimer);countdownTimer=null;}
else if(!countdownTimer){tick();countdownTimer=setInterval(tick,1000);}
});
}
}
let currentView='dashboard',gradeFilterSubj='all',editingNoteId=null;
let confModalSubjId=null,confSelected=3;
let editingTTId=null,editingTTDay=null;
let currentNoteFiles=[];
