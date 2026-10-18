function renderLoom(){
const sel=document.getElementById('task-filter-subj');
if(sel){const cur=sel.value;sel.innerHTML='<option value="all">All Subjects</option>'+SUBJECTS.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');if(cur)sel.value=cur;}
renderLiveBanner('whats-next-loom');
document.getElementById('weekly-load').innerHTML=[1,2,3,4,5].map(d=>{
const n=timetable.filter(t=>t.day===d&&t.type==='lesson').length;
return`<div class="flex" style="margin-bottom:7px"><span style="font-size:12px;color:var(--text3);width:30px">${dayN(d)}</span><div class="pbar" style="flex:1"><div class="pfill" style="width:${Math.min(100,n/8*100)}%;background:var(--blue)"></div></div><span style="font-size:12px;color:var(--text2);width:22px;text-align:right">${n}</span></div>`;
}).join('');
renderTasks();
}
function renderTasks(){
const fS=document.getElementById('task-filter-subj').value,fE=document.getElementById('task-filter-energy').value,sort=document.getElementById('task-sort').value;
const eO={High:0,Medium:1,Low:2};
let list=[...tasks];
if(fS!=='all') list=list.filter(t=>t.subjectId===fS);
if(fE!=='all') list=list.filter(t=>t.energy===fE);
if(sort==='due') list.sort((a,b)=>new Date(a.dueDate||'9999')-new Date(b.dueDate||'9999'));
else list.sort((a,b)=>eO[a.energy]-eO[b.energy]);
document.getElementById('task-count-label').textContent=`${list.filter(t=>!t.done).length} pending · ${list.filter(t=>t.done).length} done`;
const eC={High:'var(--ruby)',Medium:'var(--amber)',Low:'var(--emerald)'},eBg={High:'var(--ruby-d)',Medium:'var(--am-d)',Low:'var(--em-d)'},eI={High:'🔥',Medium:'⚡',Low:'🌿'};
document.getElementById('tasks-list').innerHTML=list.length?list.map((task,i)=>{
const s=getSubj(task.subjectId),ov=task.dueDate&&daysUntil(task.dueDate)<0&&!task.done,pr=isPrio(task.subjectId)&&!task.done;
return`<div class="glass anim-slide" style="padding:13px 16px;display:flex;align-items:center;gap:12px;animation-delay:${i*0.04}s;opacity:${task.done?.45:1};border-left:3px solid ${pr?'var(--ruby)':s.color}44">
<button onclick="toggleTask('${task.id}')" style="width:20px;height:20px;border-radius:6px;border:2px solid ${task.done?'var(--emerald)':'rgba(255,255,255,.2)'};background:${task.done?'var(--em-d)':'transparent'};display:flex;align-items:center;justify-content:center;color:var(--emerald);font-size:11px;cursor:pointer;flex-shrink:0;transition:all .18s">${task.done?'✓':''}</button>
<div style="flex:1;min-width:0">
<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
<span style="font-size:13px;font-weight:500;text-decoration:${task.done?'line-through':'none'}">${esc(task.title)}</span>
${pr?`<span class="priority-badge">🔥 Priority</span>`:''}
${ov?`<span class="tag" style="background:var(--ruby-d);color:var(--ruby);font-size:10px">⚠️ Overdue</span>`:''}
</div>
<div style="display:flex;gap:10px;flex-wrap:wrap"><div class="dot" style="background:${s.color};width:6px;height:6px"></div><span style="font-size:11px;color:var(--text3)">${esc(s.name)}</span>${task.dueDate?`<span style="font-size:11px;color:${ov?'var(--ruby)':'var(--text3)'}">Due ${esc(task.dueDate)}</span>`:''}</div>
</div>
<span class="tag" style="background:${eBg[task.energy]};color:${eC[task.energy]};flex-shrink:0">${eI[task.energy]} ${task.energy}</span>
<button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')" style="flex-shrink:0">×</button>
</div>`;
}).join(''):`<div style="text-align:center;color:var(--text3);padding:40px">No tasks match filters.</div>`;
}
function toggleTask(id){tasks=tasks.map(t=>t.id===id?{...t,done:!t.done}:t);saveTasks();renderTasks();}
function deleteTask(id){tasks=tasks.filter(t=>t.id!==id);saveTasks();renderTasks();}
function openTaskModal(){
document.getElementById('tm-subject').innerHTML=SUBJECTS.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
['tm-title','tm-desc'].forEach(id=>document.getElementById(id).value='');
document.getElementById('tm-due').value='';document.getElementById('tm-energy').value='Medium';
document.getElementById('task-modal').style.display='flex';
}
function closeTaskModal(){document.getElementById('task-modal').style.display='none';}
function submitTask(){
const title=document.getElementById('tm-title').value.trim();if(!title){alert('Enter a title.');return;}
tasks.push({id:uid(),subjectId:document.getElementById('tm-subject').value,title,dueDate:document.getElementById('tm-due').value,energy:document.getElementById('tm-energy').value,done:false,desc:document.getElementById('tm-desc').value.trim()});
saveTasks();closeTaskModal();renderTasks();
}
function populateVaultFilter(){
const sel=document.getElementById('vault-filter-subj');
if(!sel)return;
const cur=sel.value;
sel.innerHTML='<option value="all">All Subjects</option>'+SUBJECTS.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');
if(cur)sel.value=cur;
}
function renderNotes(){
populateVaultFilter();
const search=document.getElementById('vault-search').value.toLowerCase(),fS=document.getElementById('vault-filter-subj').value;
let list=[...notes];
if(fS!=='all') list=list.filter(n=>n.subjectId===fS);
if(search) list=list.filter(n=>(n.title||'').toLowerCase().includes(search)||(n.content||'').toLowerCase().includes(search));
const grid=document.getElementById('notes-grid');
grid.innerHTML=list.length?list.map((note,i)=>{
const s=getSubj(note.subjectId),preview=esc((note.content||'').replace(/[#*`$\[\]\\]/g,'').slice(0,100)),tri=(note.content||'').includes('🇷🇺')||(note.content||'').includes('🇺🇿');
const tags=(note.tags||[]).map(t=>`<span class="tag" style="background:var(--surface2);color:var(--text3);font-size:10px">${esc(t)}</span>`).join('');
const fCount=(note.files||[]).length;
const fileIcons=(note.files||[]).slice(0,3).map(f=>{const ic=f.type.includes('pdf')?'📄':f.type.includes('word')||f.type.includes('document')?'📝':f.type.includes('image')?'🖼':'📎';return`<span style="font-size:13px" title="${esc(f.name)}">${ic}</span>`;}).join('');
return`<div class="glass" style="padding:18px;cursor:pointer;animation:fadeUp .4s ease ${i*0.05}s both;transition:border-color .18s" onclick="openNoteEditor('${note.id}')" onmouseenter="this.style.borderColor='rgba(255,255,255,.18)'" onmouseleave="this.style.borderColor='var(--border)'">
<div class="flex" style="justify-content:space-between;margin-bottom:10px">
<div class="flex"><div class="dot" style="background:${s.color}"></div><span style="font-size:11px;color:var(--text3)">${esc(s.name)}</span></div>
<div style="display:flex;gap:5px;align-items:center">
${tri?`<span class="tag" style="background:var(--pu-d);color:var(--purple);font-size:10px">🌐 3-Lang</span>`:''}
${fCount?`<span class="tag" style="background:var(--am-d);color:var(--amber);font-size:10px">📎 ${fCount}</span>`:''}
<button style="background:none;border:none;color:var(--text3);font-size:14px;cursor:pointer;padding:0 2px" onclick="event.stopPropagation();deleteNote('${note.id}')">×</button>
</div>
</div>
<div style="font-size:14px;font-weight:600;margin-bottom:8px;line-height:1.35">${esc(note.title)}</div>
<div style="font-size:12px;color:var(--text3);line-height:1.6;margin-bottom:8px">${preview}…</div>
<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${tags}</div>
${fCount?`<div style="display:flex;gap:4px;margin-bottom:6px;align-items:center"><span style="font-size:11px;color:var(--text3)">Files:</span>${fileIcons}${fCount>3?`<span style="font-size:11px;color:var(--text3)">+${fCount-3}</span>`:''}</div>`:''}
<div style="font-size:11px;color:var(--text3)">${note.date}</div>
</div>`;
}).join(''):`<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text3)"><div style="font-size:40px;margin-bottom:12px">📓</div>No notes found.</div>`;
}
function deleteNote(id){notes=notes.filter(n=>n.id!==id);saveNotes();renderNotes();}
function attachFile(ev){
const file=ev.target.files[0];if(!file)return;
if(file.size>50*1024*1024){alert('File is very large (>50MB). It will load but may slow the app. Consider compressing.');} 
const reader=new FileReader();
reader.onload=e=>{currentNoteFiles.push({name:file.name,type:file.type,size:file.size,dataUrl:e.target.result});renderNoteFilesBar();};
reader.readAsDataURL(file);ev.target.value='';
}
function renderNoteFilesBar(){
const bar=document.getElementById('ne-files-bar');
if(!currentNoteFiles.length){bar.innerHTML='';return;}
bar.innerHTML=currentNoteFiles.map((f,i)=>{
const ic=f.type.includes('pdf')?'📄':f.type.includes('word')||f.type.includes('document')?'📝':f.type.includes('image')?'🖼':'📎';
const sz=(f.size/1024).toFixed(0)+'KB';
return`<div class="file-chip" onclick="openAttach(${i})">
<span style="font-size:15px">${ic}</span>
<span class="file-chip-name" style="max-width:140px">${f.name}</span>
<span style="font-size:10px;color:var(--text3)">${sz}</span>
<span onclick="event.stopPropagation();removeFile(${i})" style="color:var(--text3);cursor:pointer;margin-left:4px;font-size:12px">×</span>
</div>`;
}).join('');
}
function openAttach(i){
const f=currentNoteFiles[i];if(!f)return;
function getViewerModal(){
let modal=document.getElementById('file-viewer-modal');
if(!modal){
modal=document.createElement('div');
modal.id='file-viewer-modal';
modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);z-index:2000;display:none;flex-direction:column;padding:16px;gap:10px';
modal.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:10px"><span id="fv-title" style="font-size:15px;color:#e8eaf2;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span><div style="display:flex;gap:8px;flex-shrink:0"><button id="fv-open-tab" style="background:rgba(59,130,246,.2);border:1px solid rgba(59,130,246,.4);color:#3b82f6;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:12px;font-family:Geist,sans-serif">↗ Open in Tab</button><button onclick="document.getElementById(\'file-viewer-modal\').style.display=\'none\'" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#e8eaf2;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-family:Geist,sans-serif">✕ Close</button></div></div><div id="fv-body" style="flex:1;min-height:0;border-radius:10px;overflow:hidden;background:#fff"></div>';
document.body.appendChild(modal);
modal.addEventListener('click',function(e){if(e.target===modal)modal.style.display='none';});
}
return modal;
}
function dataUrlToBlob(dataUrl,mime){
const b64=dataUrl.split(',')[1];
const bytes=atob(b64);
const arr=new Uint8Array(bytes.length);
for(let j=0;j<bytes.length;j++)arr[j]=bytes.charCodeAt(j);
return new Blob([arr],{type:mime});
}
if(f.type.includes('image')){
const modal=getViewerModal();
document.getElementById('fv-title').textContent=f.name;
const body=document.getElementById('fv-body');
body.style.background='#0d0f14';
body.style.display='flex';
body.style.alignItems='center';
body.style.justifyContent='center';
body.innerHTML='<img src="'+f.dataUrl+'" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:6px"/>';
const blobUrl=URL.createObjectURL(dataUrlToBlob(f.dataUrl,f.type));
document.getElementById('fv-open-tab').onclick=()=>window.open(blobUrl,'_blank');
modal.style.display='flex';
return;
}
if(f.type.includes('pdf')){
const modal=getViewerModal();
document.getElementById('fv-title').textContent=f.name;
const blob=dataUrlToBlob(f.dataUrl,'application/pdf');
const blobUrl=URL.createObjectURL(blob);
const body=document.getElementById('fv-body');
body.style.background='#525659';
body.style.display='block';
body.innerHTML='<embed src="'+blobUrl+'" type="application/pdf" width="100%" height="100%" style="border:none;display:block;height:100%;min-height:70vh"/>';
document.getElementById('fv-open-tab').onclick=()=>window.open(blobUrl,'_blank');
modal.style.display='flex';
return;
}
if(f.type.includes('text')||f.name.endsWith('.txt')||f.name.endsWith('.md')){
const modal=getViewerModal();
document.getElementById('fv-title').textContent=f.name;
const raw=decodeURIComponent(escape(atob(f.dataUrl.split(',')[1])));
const body=document.getElementById('fv-body');
body.style.background='#1a1e27';
body.style.display='block';
body.style.overflowY='auto';
body.style.padding='24px';
body.innerHTML='<pre style="white-space:pre-wrap;word-break:break-word;font-family:\'Geist Mono\',monospace;font-size:13px;line-height:1.8;color:#e8eaf2;margin:0">'+raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre>';
const blobUrl=URL.createObjectURL(dataUrlToBlob(f.dataUrl,f.type||'text/plain'));
document.getElementById('fv-open-tab').onclick=()=>window.open(blobUrl,'_blank');
modal.style.display='flex';
return;
}
if(f.name.endsWith('.docx')||f.name.endsWith('.doc')){
alert('Word documents cannot be previewed in the browser.\nTip: export as PDF before attaching for in-app reading.');
return;
}
try{
const blob=dataUrlToBlob(f.dataUrl,f.type);
window.open(URL.createObjectURL(blob),'_blank');
}catch(e){alert('Cannot preview this file type.');}
}
function removeFile(i){currentNoteFiles.splice(i,1);renderNoteFilesBar();}
let previewMode=false;
function newNote(){
editingNoteId=null;currentNoteFiles=[];
refreshAllSubjectSelects();
const neSubjEl=document.getElementById('ne-subject');
if(neSubjEl&&!neSubjEl.options.length){
neSubjEl.innerHTML='<option value="">— No subjects yet —</option>';
}
document.getElementById('ne-title').value='Untitled Note';
document.getElementById('ne-content').value="# Note Title\n\n## Core Concept\n**English:** Write here\n\n### 🇷🇺 Русский\nRussian notes.\n\n### 🇺🇿 O'zbek\nUzbek notes.\n\n## Formula\n$F = ma$\n\n## Key Points\n- Point one\n- Point two";
document.getElementById('ne-tags').value='';
renderNoteFilesBar();showTextArea();document.getElementById('note-editor').classList.add('open');
}
function openNoteEditor(id){
const note=notes.find(n=>n.id===id);if(!note)return;
editingNoteId=id;currentNoteFiles=[...(note.files||[])];
refreshAllSubjectSelects();
const neSubj=document.getElementById('ne-subject');
if(neSubj&&note.subjectId){neSubj.value=note.subjectId;}
document.getElementById('ne-title').value=note.title;
document.getElementById('ne-content').value=note.content;
document.getElementById('ne-tags').value=(note.tags||[]).join(', ');
renderNoteFilesBar();showTextArea();document.getElementById('note-editor').classList.add('open');
}
function closeNoteEditor(){document.getElementById('note-editor').classList.remove('open');editingNoteId=null;currentNoteFiles=[];renderNotes();}
function showTextArea(){previewMode=false;document.getElementById('ne-content').classList.remove('hide');document.getElementById('ne-preview').classList.remove('show');document.getElementById('ne-preview-btn').textContent='👁 Preview';}
function toggleNotePreview(){
previewMode=!previewMode;
const ta=document.getElementById('ne-content'),pv=document.getElementById('ne-preview'),btn=document.getElementById('ne-preview-btn');
if(previewMode){
let rawText=ta.value;
let htmlContent;
if(window.marked){
try{marked.use({breaks:true,gfm:true});}catch(e){try{marked.setOptions({breaks:true,gfm:true});}catch(e2){}}
htmlContent=marked.parse(rawText);
} else {
htmlContent=rawText
.replace(/\$\$([^$]+)\$\$/gs,(m,p)=>`<span class="nlatexb">${p.trim()}</span>`)
.replace(/\$([^$\n]+)\$/g,(m,p)=>`<span class="nlatexinl">${p}</span>`)
.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>')
.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>')
.replace(/^- (.+)$/gm,'<li>$1</li>').replace(/\n\n/g,'<br><br>');
}
pv.innerHTML=htmlContent;
if(window.renderMathInElement){
try{
renderMathInElement(pv,{
delimiters:[
{left:'$$',right:'$$',display:true},
{left:'$',right:'$',display:false},
{left:'\\(',right:'\\)',display:false},
{left:'\\[',right:'\\]',display:true}
],
throwOnError:false,
output:'html'
});
}catch(e){console.warn('KaTeX render error:',e);}
}
ta.classList.add('hide');pv.classList.add('show');btn.textContent='✏️ Edit';
} else showTextArea();
}
function saveNote(){
const title=document.getElementById('ne-title').value.trim()||'Untitled',
content=document.getElementById('ne-content').value,
subjectId=document.getElementById('ne-subject').value,
tags=document.getElementById('ne-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
files=[...currentNoteFiles];
if(editingNoteId) notes=notes.map(n=>n.id===editingNoteId?{...n,title,content,subjectId,tags,files,date:localDateStr(new Date())}:n);
else notes.push({id:uid(),title,content,subjectId,tags,files,date:localDateStr(new Date())});
const totalFileSize=files.reduce((a,f)=>a+(f.dataUrl?f.dataUrl.length:0),0);
if(totalFileSize>2*1024*1024){
const proceed=confirm('Attached files are large (~'+(totalFileSize/1024/1024).toFixed(1)+'MB as base64). This may exceed browser storage limits and could cause data loss.\n\nTip: Use the Export Backup feature regularly to save your data.\n\nSave anyway?');
if(!proceed)return;
}
try{saveNotes();}catch(e){showStorageWarning('⚠️ Note saved in memory only — storage is full. Export a backup to preserve your data.');}
closeNoteEditor();
}
async function translateNote(){
const ta=document.getElementById('ne-content');
const btn=document.getElementById('ne-translate-btn');
const text=ta.value.trim();
if(!text){alert('Write something in the note first.');return;}
btn.classList.add('loading');
btn.textContent='🌐 Translating…';
try{
const lines=text.split('\n');
const ruIdx=lines.findIndex(l=>l.includes('🇷🇺')||l.includes('Русский'));
const uzIdx=lines.findIndex(l=>l.includes('🇺🇿')||l.includes("O'zbek")||l.includes('Uzbek'));
let sourceText='';
if(ruIdx>0){
sourceText=lines.slice(0,ruIdx).join('\n').trim();
} else {
sourceText=text.slice(0,500);
}
const cleanSource=sourceText.replace(/^#{1,3}\s+/gm,'').replace(/\*\*/g,'').trim();
const toRU=await fetchTranslation(cleanSource,'en','ru');
const toUZ=await fetchTranslation(cleanSource,'en','uz');
let newContent=text;
if(ruIdx>=0){
let ruEnd=uzIdx>ruIdx?uzIdx:lines.length;
const before=lines.slice(0,ruIdx+1).join('\n');
const after=lines.slice(ruEnd).join('\n');
newContent=before+'\n'+toRU+'\n\n'+after;
} else {
newContent+='\n\n### 🇷🇺 Русский\n'+toRU;
}
const lines2=newContent.split('\n');
const ruIdx2=lines2.findIndex(l=>l.includes('🇷🇺')||l.includes('Русский'));
const uzIdx2=lines2.findIndex(l=>l.includes('🇺🇿')||l.includes("O'zbek")||l.includes('Uzbek'));
if(uzIdx2>=0){
const before2=lines2.slice(0,uzIdx2+1).join('\n');
const after2=lines2.slice(uzIdx2+1).join('\n');
const nextSec=after2.split('\n').findIndex(l=>/^##\s/.test(l));
if(nextSec>=0){
const afterLines=after2.split('\n');
const uzEnd=afterLines.slice(0,nextSec).join('\n');
const remainder=afterLines.slice(nextSec).join('\n');
newContent=before2+'\n'+toUZ+'\n\n'+remainder;
} else {
newContent=before2+'\n'+toUZ;
}
} else {
newContent+='\n\n### 🇺🇿 O\'zbek\n'+toUZ;
}
ta.value=newContent;
btn.textContent='✅ Translated!';
setTimeout(()=>{btn.textContent='🌐 Translate';btn.classList.remove('loading');},2500);
}catch(err){
console.error('Translation error:',err);
btn.textContent='❌ Failed';
setTimeout(()=>{btn.textContent='🌐 Translate';btn.classList.remove('loading');},2500);
alert('Translation failed. Check your internet connection.\nError: '+err.message);
}
}
async function fetchTranslation(text,fromLang,toLang){
if(!text.trim()) return '';
const MAX=450;
const truncated=text.slice(0,MAX);
const wasTruncated=text.length>MAX;
const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncated)}&langpair=${fromLang}|${toLang}`;
const resp=await fetch(url);
if(!resp.ok){
if(resp.status===429||resp.status===403){
throw new Error('Translation limit reached (MyMemory free tier). Try again tomorrow or shorten the note.');
}
throw new Error('Translation API error: '+resp.status);
}
const data=await resp.json();
if(data.responseStatus===200&&data.responseData&&data.responseData.translatedText){
const result=data.responseData.translatedText;
return wasTruncated?result+'\n\n*(Translation truncated — only first 450 characters were sent to the API.)*':result;
}
if(data.responseStatus===429){
throw new Error('Daily translation quota exceeded. MyMemory allows ~5,000 words/day per IP. Try again tomorrow.');
}
throw new Error(data.responseDetails||'Translation returned empty result');
}
function setExamDate(sid,val){
const d={...getExamDates()};
if(val) d[sid]=val; else delete d[sid];
save('examDates',d);
renderRevision();
if(typeof renderDashboard==='function') renderDashboard();
}
function renderRevision(){
const totalMins = revisionSessions.reduce((a,s)=>a+s.duration,0);
const sumEl = document.getElementById('rev-session-summary');
if(sumEl) sumEl.textContent = `${revisionSessions.length} sessions · ${totalMins} min total`;
document.getElementById('heatmap-rev').innerHTML=revisionHeatmapHTML();
renderRevSessionsList();
const cC={1:'var(--ruby)',2:'#f97316',3:'var(--amber)',4:'var(--blue)',5:'var(--emerald)'},cL={1:'Very Low',2:'Low',3:'Medium',4:'High',5:'Mastered'};
document.getElementById('revision-list').innerHTML=SUBJECTS.map(s=>{
const c=confidence[s.id]||{score:3,lastReview:'2025-01-01',reviewCount:0};
const dl=daysToExam(s.id),nd=parseDay(c.lastReview);nd.setDate(nd.getDate()+srInt(c.score));
const ov=localDateStr(nd)<localDateStr(new Date()),urg=(6-c.score)+(dl&&dl<=30?3:0)+(ov?2:0);
const sg=grades.filter(g=>g.subjectId===s.id),avg=sg.length?sg.reduce((a,g)=>a+g.score,0)/sg.length:null;
return{...s,c,dl,nd,ov,urg,avg,ed:(getExamDates()[s.id]||'')};
}).sort((a,b)=>b.urg-a.urg).map((s,i)=>{
const c=s.c,bars=[1,2,3,4,5].map(n=>`<div class="conf-bar" style="background:${n<=c.score?cC[c.score]:'rgba(255,255,255,.08)'}"></div>`).join('');
return`<div class="glass anim-slide" style="padding:16px;animation-delay:${i*0.05}s;border-left:3px solid ${isPrio(s.id)?'var(--ruby)':s.color}44">
<div class="flex" style="gap:12px">
<div style="width:36px;height:36px;border-radius:10px;background:${s.dim};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:${s.color};flex-shrink:0">${i+1}</div>
<div style="flex:1;min-width:0">
<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px">
<span style="font-size:14px;font-weight:600">${s.name}</span>
<span class="tag" style="background:${s.dim};color:${s.color};font-size:10px">${s.level}</span>
${isPrio(s.id)?`<span class="priority-badge">🔥 ${s.dl}d to exam</span>`:''}
${s.ov?`<span class="tag" style="background:var(--am-d);color:var(--amber);font-size:10px">⚠️ Review overdue</span>`:''}
</div>
<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
<div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Confidence</div><div style="display:flex;gap:3px">${bars}</div><div style="font-size:10px;color:${cC[c.score]};margin-top:2px">${cL[c.score]}</div></div>
<div><div style="font-size:10px;color:var(--text3)">Next Review</div><div style="font-size:12px;color:${s.ov?'var(--ruby)':'var(--text2)'};margin-top:2px">${localDateStr(s.nd)}</div></div>
<div><div style="font-size:10px;color:var(--text3)">Exam date</div><input type="date" class="inp" value="${esc(s.ed)}" onchange="setExamDate('${s.id}',this.value)" style="width:auto;padding:3px 8px;font-size:11px;margin-top:2px" aria-label="Exam date for ${esc(s.name)}"/></div>
<div><div style="font-size:10px;color:var(--text3)">Sessions</div><div style="font-size:12px;color:var(--text2);margin-top:2px">${c.reviewCount}</div></div>
${s.avg!==null?`<div><div style="font-size:10px;color:var(--text3)">Avg Score</div><div style="font-size:12px;color:var(--text2);margin-top:2px">${s.avg.toFixed(0)}%</div></div>`:''}
</div>
</div>
<button class="btn btn-primary btn-sm" style="flex-shrink:0" onclick="openConfModal('${s.id}')">✓ Log Session</button>
</div>
</div>`;
}).join('');
}
function openConfModal(sid){confModalSubjId=sid;confSelected=confidence[sid]?.score||3;document.getElementById('conf-modal-subj').textContent=getSubj(sid).name;renderConfBtns();document.getElementById('conf-modal').style.display='flex';}
function closeConfModal(){document.getElementById('conf-modal').style.display='none';confModalSubjId=null;}
function renderConfBtns(){
const cC={1:'var(--ruby)',2:'#f97316',3:'var(--amber)',4:'var(--blue)',5:'var(--emerald)'},cBg={1:'var(--ruby-d)',2:'rgba(249,115,22,.15)',3:'var(--am-d)',4:'var(--blue-d)',5:'var(--em-d)'};
document.getElementById('conf-btns').innerHTML=[1,2,3,4,5].map(n=>`<button class="conf-btn" style="color:${n===confSelected?cC[n]:'var(--text3)'};border-color:${n===confSelected?cC[n]:'var(--border)'};background:${n===confSelected?cBg[n]:'transparent'}" onclick="selectConf(${n})">${n}</button>`).join('');
document.getElementById('conf-next-label').innerHTML=`Next review in <strong style="color:${{1:'var(--ruby)',2:'#f97316',3:'var(--amber)',4:'var(--blue)',5:'var(--emerald)'}[confSelected]}">${srInt(confSelected)} day${srInt(confSelected)!==1?'s':''}</strong>`;
}
function selectConf(n){confSelected=n;renderConfBtns();}
function submitConf(){
if(!confModalSubjId)return;
confidence[confModalSubjId]={score:confSelected,lastReview:localDateStr(new Date()),reviewCount:(confidence[confModalSubjId]?.reviewCount||0)+1};
saveConf();closeConfModal();renderRevision();
}
function renderTimetable(){
const now=new Date(),todayDay=now.getDay(),curMin=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
const lessonCount=timetable.filter(t=>t.type==='lesson').length;
document.getElementById('tt-sub').textContent=`${lessonCount} lessons this week · Click a block to edit · Click + to add new`;
renderLiveBanner('tt-live-banner');
const DAYS=[1,2,3,4,5,6,0]; 
let html=`<div style="display:flex;gap:12px;min-width:${DAYS.length*185}px">`;
DAYS.forEach(d=>{
const daySlots=timetable.filter(t=>t.day===d).sort((a,b)=>toMin(a.start)-toMin(b.start));
html+=`<div class="tt-day-col" style="flex:1">
<div style="text-align:center;padding:8px 0 12px;font-size:12px;font-weight:600;color:${d===todayDay?'var(--blue)':'var(--text2)'};letter-spacing:.06em">${dayN(d)}${d===todayDay?' <span class="live-dot" style="display:inline-block;width:6px;height:6px;margin-left:4px;vertical-align:middle"></span>':''}</div>`;
daySlots.forEach(slot=>{
const isBreak=slot.type==='break';
const s=isBreak?null:(slot.subjectId?getSubj(slot.subjectId):null);
const active=d===todayDay&&curMin>=toMin(slot.start)&&curMin<toMin(slot.end);
const nextUp=d===todayDay&&toMin(slot.start)>curMin&&!timetable.filter(t=>t.day===d&&toMin(t.start)>curMin).sort((a,b)=>toMin(a.start)-toMin(b.start)).find(t=>toMin(t.start)<toMin(slot.start));
const borderCol=isBreak?'var(--text3)':s?s.color:'var(--border2)';
const bgStyle=isBreak?'rgba(255,255,255,.02)':(s?s.dim:'rgba(255,255,255,.04)');
html+=`<div class="tt-slot ${isBreak?'is-break':'is-lesson'} ${active?'now-active':''}" style="background:${bgStyle};border-left:3px solid ${active?'var(--emerald)':borderCol}44" onclick="openTTModal('${slot.id}',${d})">
<div style="display:flex;justify-content:space-between;align-items:flex-start">
<div style="font-size:11px;font-weight:600;color:${active?'var(--emerald)':isBreak?'var(--text3)':(s?s.color:'var(--text)')}; overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:110px">${isBreak?(slot.label||'Break'):(s?s.name:'?')}</div>
${active?'<span class="live-dot"></span>':''}
</div>
<div style="font-size:10px;color:var(--text3);margin-top:2px">${fmtT(slot.start)}–${fmtT(slot.end)}${slot.room?' · '+slot.room:''}</div>
</div>`;
});
html+=`<div class="tt-add-row" onclick="openTTModal(null,${d})">+ Add Block</div>`;
html+=`</div>`;
});
html+='</div>';
document.getElementById('tt-container').innerHTML=html;
document.getElementById('tt-legend').innerHTML=SUBJECTS.map(s=>`<div class="flex" style="gap:5px;padding:4px 10px;border-radius:100px;background:${s.dim};border:1px solid ${s.color}33"><div class="dot" style="background:${s.color};width:6px;height:6px"></div><span style="font-size:11px;color:${s.color}">${esc(s.name)}</span></div>`).join('');
}
function ttTypeChange(){
const isLesson=document.getElementById('tt-type').value==='lesson';
document.getElementById('tt-subj-row').style.display=isLesson?'block':'none';
}
function openTTModal(existingId,day){
editingTTId=existingId;editingTTDay=day;
document.getElementById('tt-subj-sel').innerHTML=`<option value="">— Select Subject —</option>`+SUBJECTS.map(s=>`<option value="${s.id}">${s.name} (${s.level})</option>`).join('');
document.getElementById('tt-modal-title').textContent=existingId?`Edit Block — ${dayN(day)}`:`Add Block — ${dayN(day)}`;
if(existingId){
const slot=timetable.find(t=>t.id===existingId);
if(slot){
document.getElementById('tt-type').value=slot.type||'lesson';
document.getElementById('tt-subj-sel').value=slot.subjectId||'';
document.getElementById('tt-label').value=slot.label||'';
document.getElementById('tt-start').value=slot.start;
document.getElementById('tt-end').value=slot.end;
document.getElementById('tt-room').value=slot.room||'';
}
document.getElementById('tt-delete-btn').style.display='inline-flex';
} else {
document.getElementById('tt-type').value='lesson';
document.getElementById('tt-subj-sel').value='';
document.getElementById('tt-label').value='';
document.getElementById('tt-start').value='08:30';
document.getElementById('tt-end').value='09:15';
document.getElementById('tt-room').value='';
document.getElementById('tt-delete-btn').style.display='none';
}
ttTypeChange();
document.getElementById('tt-modal').style.display='flex';
}
function closeTTModal(){document.getElementById('tt-modal').style.display='none';editingTTId=null;}
function saveTTSlot(){
const type=document.getElementById('tt-type').value;
const subjId=type==='lesson'?document.getElementById('tt-subj-sel').value:'';
const label=document.getElementById('tt-label').value.trim();
const start=document.getElementById('tt-start').value||'08:30';
const end=document.getElementById('tt-end').value||'09:15';
const room=document.getElementById('tt-room').value.trim();
if(type==='lesson'&&!subjId){alert('Please select a subject.');return;}
if(editingTTId){
timetable=timetable.map(t=>t.id===editingTTId?{...t,type,subjectId:subjId,label,start,end,room}:t);
} else {
timetable.push({id:uid(),type,subjectId:subjId,day:editingTTDay,label,start,end,room});
}
saveTT();closeTTModal();renderTimetable();
}
function deleteTTSlot(){if(editingTTId)timetable=timetable.filter(t=>t.id!==editingTTId);saveTT();closeTTModal();renderTimetable();}
