var OB_SUBJECTS = {
'IGCSE': [
'Mathematics','Additional Mathematics','English Language','English Literature',
'Biology','Chemistry','Physics','Combined Science',
'History','Geography','Economics','Business Studies',
'Computer Science','ICT','Accounting',
'Art & Design','Music','Drama',
'French','Spanish','German','Chinese','Arabic','Russian',
'Physical Education','Environmental Management','Sociology','Psychology'
],
'AS/A Levels': [
'Mathematics','Further Mathematics','English Language','English Literature',
'Biology','Chemistry','Physics',
'History','Geography','Economics','Business','Law',
'Computer Science','Accounting',
'Art & Design','Music','Drama & Theatre',
'French','Spanish','German','Chinese','Arabic','Russian',
'Physical Education','Psychology','Sociology','Philosophy',
'Media Studies','Film Studies'
],
'IB': [
'Mathematics: Analysis and Approaches (HL)','Mathematics: Analysis and Approaches (SL)',
'Mathematics: Applications and Interpretation (HL)','Mathematics: Applications and Interpretation (SL)',
'English A: Literature','English A: Language and Literature','English B',
'Biology (HL)','Biology (SL)','Chemistry (HL)','Chemistry (SL)',
'Physics (HL)','Physics (SL)','Environmental Systems and Societies',
'History (HL)','History (SL)','Geography (HL)','Geography (SL)',
'Economics (HL)','Economics (SL)','Business Management (HL)','Business Management (SL)',
'Computer Science (HL)','Computer Science (SL)',
'Visual Arts (HL)','Visual Arts (SL)','Music (HL)','Music (SL)',
'Theatre (HL)','Theatre (SL)',
'French B (HL)','French B (SL)','Spanish B (HL)','Spanish B (SL)',
'German B (HL)','German B (SL)','Mandarin B (HL)','Mandarin B (SL)',
'Psychology (HL)','Psychology (SL)','Philosophy (HL)','Philosophy (SL)',
'Theory of Knowledge','Extended Essay','CAS'
],
'AP': [
'AP Calculus AB','AP Calculus BC','AP Statistics','AP Precalculus',
'AP English Language and Composition','AP English Literature and Composition',
'AP Biology','AP Chemistry','AP Physics 1','AP Physics 2',
'AP Physics C: Mechanics','AP Physics C: E&M','AP Environmental Science',
'AP US History','AP World History','AP European History',
'AP US Government and Politics','AP Comparative Government and Politics',
'AP Macroeconomics','AP Microeconomics','AP Human Geography',
'AP Computer Science A','AP Computer Science Principles',
'AP Art History','AP Music Theory','AP Studio Art',
'AP French Language','AP Spanish Language','AP German Language',
'AP Chinese Language','AP Japanese Language','AP Latin',
'AP Psychology','AP Research','AP Seminar'
]
};
var OB_COLOR_CLASS = {
'IGCSE':'igcse','AS/A Levels':'alevel','IB':'ib','AP':'ap','National Curriculum':'other'
};
var _obNationalSubjects = [];
(function initOnboarding(){
if(load('academicOS_onboarded', null)) return;
setTimeout(function(){
var overlay = document.getElementById('onboarding-overlay');
if(overlay) overlay.style.display = 'flex';
}, 600);
})();
function toggleObCurriculumChip(el){
el.classList.toggle('selected');
}
function getSelectedCurricula(){
return Array.from(document.querySelectorAll('#ob-step1 .ob-chip.selected'))
.map(function(c){ return c.getAttribute('data-curriculum'); });
}
function obGoStep2(){
var errEl = document.getElementById('ob-error');
errEl.style.display = 'none';
var name  = (document.getElementById('ob-name').value||'').trim();
var grade = (document.getElementById('ob-grade').value||'').trim();
var curricula = getSelectedCurricula();
if(!name){
errEl.textContent = 'Please enter your name.';
errEl.style.display = 'block';
document.getElementById('ob-name').focus();
return;
}
if(!grade){
errEl.textContent = 'Please enter your grade or year level.';
errEl.style.display = 'block';
document.getElementById('ob-grade').focus();
return;
}
if(!curricula.length){
errEl.textContent = 'Please select at least one curriculum.';
errEl.style.display = 'block';
return;
}
var structuredCurricula = curricula.filter(function(c){ return c !== 'National Curriculum'; });
var hasNational         = curricula.indexOf('National Curriculum') !== -1;
var hasStructured       = structuredCurricula.length > 0;
var titleEl = document.getElementById('ob-step2-title');
var subEl   = document.getElementById('ob-step2-sub');
var eyebrowEl = document.getElementById('ob-step2-eyebrow');
titleEl.textContent = curricula.join(' + ') + ' — Select Your Subjects';
subEl.textContent   = 'Tick every subject you study. Each one gets its own row in your Grade Sheet.';
eyebrowEl.textContent = 'Step 2 of 2 · Subjects';
var chipsWrap = document.getElementById('ob-subjects-wrap');
var chipsEl   = document.getElementById('ob-subject-chips');
if(hasStructured){
chipsWrap.style.display = 'block';
var html = '';
structuredCurricula.forEach(function(curr){
var subjects = OB_SUBJECTS[curr] || [];
var cc = OB_COLOR_CLASS[curr] || '';
if(structuredCurricula.length > 1){
html += '<div style="width:100%;font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin:10px 0 6px;padding-bottom:4px;border-bottom:1px solid var(--border)">'
+ curr + '</div>';
}
html += subjects.map(function(s){
return '<div class="ob-chip '+cc+'" data-subject="'+s+'" data-curriculum="'+curr+'" onclick="this.classList.toggle(\'selected\')">'+s+'</div>';
}).join('');
});
chipsEl.innerHTML = html;
} else {
chipsWrap.style.display = 'none';
}
var natWrap    = document.getElementById('ob-national-wrap');
var natDivider = document.getElementById('ob-nat-divider');
var natSolo    = document.getElementById('ob-nat-solo-label');
if(hasNational){
natWrap.style.display = 'block';
if(hasStructured){
natDivider.style.display = 'block';
natSolo.style.display    = 'none';
} else {
natDivider.style.display = 'none';
natSolo.style.display    = 'block';
}
_obNationalSubjects = [];
document.getElementById('ob-nat-chips').innerHTML = '';
document.getElementById('ob-nat-input').value = '';
} else {
natWrap.style.display = 'none';
}
document.getElementById('ob-step1').style.display = 'none';
document.getElementById('ob-step2').style.display = 'block';
}
function obGoBack(){
document.getElementById('ob-step2').style.display = 'none';
document.getElementById('ob-step1').style.display = 'block';
document.getElementById('ob-error2').style.display = 'none';
}
function addNatSubject(){
var inp = document.getElementById('ob-nat-input');
var val = (inp.value||'').trim();
if(!val) return;
var parts = val.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
parts.forEach(function(subj){
if(_obNationalSubjects.indexOf(subj) === -1) _obNationalSubjects.push(subj);
});
inp.value = '';
renderNatChips();
}
function removeNatSubject(idx){
_obNationalSubjects.splice(idx, 1);
renderNatChips();
}
function renderNatChips(){
var container = document.getElementById('ob-nat-chips');
if(!_obNationalSubjects.length){
container.innerHTML = '<span style="font-size:12px;color:var(--text3)">No subjects added yet.</span>';
return;
}
container.innerHTML = _obNationalSubjects.map(function(s, i){
return '<div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:100px;'
+'background:var(--surface2);border:1px solid var(--border2);font-size:12px;font-weight:500;color:var(--text)">'
+ s
+ '<button onclick="removeNatSubject('+i+')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;line-height:1;padding:0 0 0 2px" title="Remove">×</button>'
+ '</div>';
}).join('');
}
function dismissOnboarding(){
var overlay = document.getElementById('onboarding-overlay');
if(overlay){
overlay.style.opacity = '0';
overlay.style.transition = 'opacity .22s';
setTimeout(function(){ overlay.style.display = 'none'; overlay.style.opacity = ''; }, 230);
}
save('academicOS_onboarded','dismissed');
}
function submitOnboarding(){
var errEl = document.getElementById('ob-error2');
errEl.style.display = 'none';
var name  = (document.getElementById('ob-name').value||'').trim();
var grade = (document.getElementById('ob-grade').value||'').trim();
var curricula = getSelectedCurricula();
var structured = [];
document.querySelectorAll('#ob-subject-chips .ob-chip.selected').forEach(function(c){
structured.push({ subject: c.getAttribute('data-subject'), curriculum: c.getAttribute('data-curriculum') });
});
var national = _obNationalSubjects.map(function(s){
return { subject: s, curriculum: 'National Curriculum' };
});
var allEntries = structured.concat(national);
if(!allEntries.length){
var hasNational = curricula.indexOf('National Curriculum') !== -1;
var hasStructured = curricula.filter(function(c){ return c !== 'National Curriculum'; }).length > 0;
if(hasStructured && !hasNational){
errEl.textContent = 'Please select at least one subject.';
} else if(hasNational && !hasStructured){
errEl.textContent = 'Please add at least one subject.';
} else {
errEl.textContent = 'Please select or add at least one subject.';
}
errEl.style.display = 'block';
return;
}
studentInfo.name       = name;
studentInfo.gradeLevel = grade;
studentInfo.year       = new Date().getFullYear() + '–' + (new Date().getFullYear()+1);
saveStudent();
var prevOb = load('ob_subject_ids', []);
SUBJECTS = SUBJECTS.filter(function(s){
var isDefault = /^s\d+$/.test(s.id);
var isPrevOb  = prevOb.indexOf(s.id) !== -1;
var isObProfile = s._obProfile === true;
return !isDefault && !(isPrevOb && isObProfile);
});
var now = Date.now();
var newSubjIds = [];
var currTypeMap = {
'IGCSE':'IGCSE','AS/A Levels':'A-Level','IB':'IB','AP':'AP','National Curriculum':'National'
};
allEntries.forEach(function(entry, idx){
var existing = SUBJECTS.find(function(s){ return s.name === entry.subject; });
if(existing){ newSubjIds.push(existing.id); return; }
var color = SUBJECT_COLORS[(SUBJECTS.length) % SUBJECT_COLORS.length];
var hex = color.replace('#','');
var r2 = parseInt(hex.slice(0,2),16), g2 = parseInt(hex.slice(2,4),16), b2 = parseInt(hex.slice(4,6),16);
var newId = 'ob_s_' + now + '_' + idx;
SUBJECTS.push({
id: newId, name: entry.subject,
type: currTypeMap[entry.curriculum] || entry.curriculum,
level: entry.curriculum,
color: color, dim: 'rgba('+r2+','+g2+','+b2+',0.13)',
_obProfile: true
});
newSubjIds.push(newId);
});
saveSubjects();
save('ob_subject_ids', newSubjIds);
refreshAllSubjectSelects();
gradeSheet = gradeSheet.filter(function(r){ return !r._obProfile; });
allEntries.forEach(function(entry, idx){
gradeSheet.push({
id:         'ob_gs_' + now + '_' + idx,
name:       entry.subject,
curriculum: entry.curriculum,
numTests:   1,
saWeight:   60,
examWeight: 40,
tests:      [null,null,null,null,null,null,null,null],
examScore:  null,
_obProfile: true
});
});
saveGS();
save('academicOS_onboarded', {
name: name, grade: grade,
curricula: curricula,
subjects: allEntries,
ts: now
});
if(typeof renderGradeSheet === 'function') renderGradeSheet();
if(typeof renderDashboard  === 'function') renderDashboard();
var subjectNames = allEntries.map(function(e){ return e.subject; });
var box = document.getElementById('onboarding-box');
if(box){
var byCurr = {};
allEntries.forEach(function(e){
if(!byCurr[e.curriculum]) byCurr[e.curriculum] = [];
byCurr[e.curriculum].push(e.subject);
});
var currColors = { 'IGCSE':'var(--emerald)','AS/A Levels':'var(--purple)','IB':'var(--amber)',
'AP':'var(--ruby)','National Curriculum':'var(--text2)' };
var currBg    = { 'IGCSE':'var(--em-d)','AS/A Levels':'var(--pu-d)','IB':'var(--am-d)',
'AP':'var(--ruby-d)','National Curriculum':'var(--surface2)' };
var groupsHTML = Object.keys(byCurr).map(function(curr){
var col = currColors[curr]||'var(--blue)';
var bg  = currBg[curr]||'var(--blue-d)';
var chips = byCurr[curr].map(function(s){
return '<span style="padding:3px 10px;border-radius:100px;background:'+bg+';color:'+col+';border:1px solid '+col+'44;font-size:11px;font-weight:500">'+esc(s)+'</span>';
}).join('');
return '<div style="margin-bottom:10px"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">'+esc(curr)+'</div>'
+'<div style="display:flex;flex-wrap:wrap;gap:5px">'+chips+'</div></div>';
}).join('');
box.innerHTML =
'<div style="text-align:center;padding:20px 0 14px">' +
'<div style="font-size:42px;margin-bottom:12px">🎉</div>' +
'<div style="font-family:\'DM Serif Display\',serif;font-size:22px;margin-bottom:8px">You\'re all set, '+esc(name)+'!</div>' +
'<div style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:16px">'+
subjectNames.length+' subject'+(subjectNames.length!==1?'s':'')+' added to your Grade Sheet.' +
'</div>' +
'</div>' +
'<div style="text-align:left;margin-bottom:20px;max-height:200px;overflow-y:auto">'+groupsHTML+'</div>' +
'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
'<button class="btn btn-primary" onclick="dismissOnboarding();switchView(\'gradesheet\',document.querySelector(\'[onclick*=gradesheet]\'))" style="padding:9px 20px">Open Grade Sheet →</button>' +
'<button class="btn" onclick="dismissOnboarding()">Explore Dashboard</button>' +
'</div>';
}
setTimeout(dismissOnboarding, 6000);
}
