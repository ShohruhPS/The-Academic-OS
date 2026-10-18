const SOUND_OPTIONS=[
{id:'white',name:'White Noise',emoji:'〰️',color:'var(--text2)',desc:'A sharp, steady hiss like static or a fan. Masks distractions with high frequencies — ideal for deep concentration.',gen:'white'},
{id:'pink', name:'Pink Noise', emoji:'🌸',color:'#f472b6',desc:'A balanced, softer sound like steady rain or wind. More natural and less harsh than white noise — great for sustained focus.',gen:'pink'},
{id:'brown',name:'Brown Noise',emoji:'🌩️',color:'#92400e',desc:'A deep, bass-heavy rumble like thunder or a jet engine. Ideal for calming a racing mind and deep relaxation.',gen:'brown'},
{id:'green',name:'Green Noise',emoji:'🌿',color:'var(--emerald)',desc:'A mid-range nature sound like rustling leaves or flowing water. Creates a soothing, organic atmosphere.',gen:'green'},
{id:'none', name:'No Sound',   emoji:'🔇',color:'var(--text3)',desc:'Timer only — no ambient audio. Pure silent focus.',gen:null},
];
let focusState={
running:false,
phase:'focus',
remaining:25*60,
sessions:0,
selectedSound:'white',
volume:0.7,
interval:null,  
focusMinutes:25,
breakMinutes:5,
};
// ── Generative noise engine (no audio file downloads) ──────────────────────
let audioCtx = null;
let gainNode = null;
let activeSource = null;
let activeNoiseNodes = [];
function getAudioContext() {
if (!audioCtx) {
audioCtx = new (window.AudioContext || window.webkitAudioContext)();
gainNode = audioCtx.createGain();
gainNode.gain.value = focusState.volume;
gainNode.connect(audioCtx.destination);
}
return audioCtx;
}
function generateNoiseBuffer(type) {
const ctx = getAudioContext();
const rate = ctx.sampleRate;
const len = rate * 20; // 20-second looping tile
const buf = ctx.createBuffer(1, len, rate);
const d = buf.getChannelData(0);
if (type === 'white') {
// Smooth white: raw random + 4 passes of 7-sample average → very soft, airy, non-hissing
for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
for (let pass = 0; pass < 4; pass++) {
for (let i = 3; i < len - 3; i++)
d[i] = (d[i-3]+d[i-2]+d[i-1]+d[i]+d[i+1]+d[i+2]+d[i+3]) / 7;
}
} else if (type === 'brown') {
let last = 0;
for (let i = 0; i < len; i++) {
last = (last + 0.008 * (Math.random() * 2 - 1)) / 1.008;
d[i] = last * 6.0;
}
for (let i = 1; i < len - 1; i++) d[i] = d[i-1]*0.4 + d[i]*0.4 + d[i+1]*0.2;
} else if (type === 'pink') {
let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
for (let i = 0; i < len; i++) {
const w = Math.random() * 2 - 1;
b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.09; b6=w*0.115926;
}
} else if (type === 'green') {
let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
for (let i = 0; i < len; i++) {
const w = Math.random() * 2 - 1;
b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.09; b6=w*0.115926;
}
}
return buf;
}
function buildNoiseChain(type, src) {
const ctx = getAudioContext();
let nodes = [src];
if (type === 'white') {
// Two cascaded lowpass stages for steeper rolloff — kills the hiss
const lp1 = ctx.createBiquadFilter();
lp1.type = 'lowpass'; lp1.frequency.value = 3200; lp1.Q.value = 0.5;
const lp2 = ctx.createBiquadFilter();
lp2.type = 'lowpass'; lp2.frequency.value = 2200; lp2.Q.value = 0.4;
src.connect(lp1); lp1.connect(lp2); lp2.connect(gainNode); nodes.push(lp1, lp2);
} else if (type === 'brown') {
const lp = ctx.createBiquadFilter();
lp.type = 'lowpass'; lp.frequency.value = 280; lp.Q.value = 0.1;
src.connect(lp); lp.connect(gainNode); nodes.push(lp);
} else if (type === 'pink') {
// Aggressive high cut: lowpass at 4kHz + high-shelf -18dB — much softer, rain-like
const lp = ctx.createBiquadFilter();
lp.type = 'lowpass'; lp.frequency.value = 4000; lp.Q.value = 0.5;
const hs = ctx.createBiquadFilter();
hs.type = 'highshelf'; hs.frequency.value = 3500; hs.gain.value = -18;
src.connect(lp); lp.connect(hs); hs.connect(gainNode); nodes.push(lp, hs);
} else if (type === 'green') {
// Narrower bandpass + steeper high cut → leafy/wind, no hiss
const bp = ctx.createBiquadFilter();
bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.6;
const hs = ctx.createBiquadFilter();
hs.type = 'highshelf'; hs.frequency.value = 3500; hs.gain.value = -20;
const ls = ctx.createBiquadFilter();
ls.type = 'lowshelf'; ls.frequency.value = 250; ls.gain.value = 5;
src.connect(bp); bp.connect(hs); hs.connect(ls); ls.connect(gainNode);
nodes.push(bp, hs, ls);
} else {
src.connect(gainNode);
}
return nodes;
}
async function startNoise(type) {
stopNoise();
if (!type || type === 'none') return;
const soundDef = SOUND_OPTIONS.find(s => s.id === type || s.gen === type);
const genKey = soundDef ? soundDef.gen : type;
if (!genKey || genKey === 'none') return;
try {
const ctx = getAudioContext();
if (ctx.state === 'suspended') await ctx.resume();
const buf = generateNoiseBuffer(genKey);
const src = ctx.createBufferSource();
src.buffer = buf;
src.loop = true;
activeNoiseNodes = buildNoiseChain(genKey, src);
src.start(0);
activeSource = src;
} catch(e) {
console.warn('Noise gen failed:', e);
}
}
function stopNoise() {
activeNoiseNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch(e){} });
activeNoiseNodes = [];
if (activeSource) { try { activeSource.stop(); } catch(e){} activeSource = null; }
}
function setFocusVolume(v) {
focusState.volume = v / 100;
document.getElementById('focus-vol-label').textContent = Math.round(v) + '%';
if (gainNode) gainNode.gain.value = focusState.volume;
}
function preloadAudio() { /* no-op: noise is generated on demand, nothing to preload */ }
(function setupEarlyPreload(){
['click','keydown','touchstart','pointerdown'].forEach(function(ev){
document.addEventListener(ev, function handler(){
preloadAudio();
document.removeEventListener(ev, handler);
}, {once:true, passive:true, capture:true});
});
})();
function adjustDuration(phase, delta) {
if (focusState.running) return; 
if (phase === 'focus') {
focusState.focusMinutes = Math.max(1, Math.min(120, focusState.focusMinutes + delta));
document.getElementById('focus-duration-display').textContent = focusState.focusMinutes;
} else {
focusState.breakMinutes = Math.max(1, Math.min(60, focusState.breakMinutes + delta));
document.getElementById('break-duration-display').textContent = focusState.breakMinutes;
}
if (!focusState.running) {
if (phase === 'focus' && focusState.phase === 'focus') {
focusState.remaining = focusState.focusMinutes * 60;
} else if (phase === 'break' && focusState.phase === 'break') {
focusState.remaining = focusState.breakMinutes * 60;
}
}
save('focus_state', focusState);
updateFocusDisplay();
}
function renderFocus(){
preloadAudio();
const fdEl=document.getElementById('focus-duration-display');
const bdEl=document.getElementById('break-duration-display');
if(fdEl) fdEl.textContent=focusState.focusMinutes;
if(bdEl) bdEl.textContent=focusState.breakMinutes;
const audioAvailable = true;
const container=document.getElementById('focus-sound-options');
const existingNotice=document.getElementById('focus-audio-missing');
if(existingNotice) existingNotice.remove();
container.innerHTML=SOUND_OPTIONS.map(s=>{
const isSelected=focusState.selectedSound===s.id;
const isPlaying=isSelected&&focusState.running&&focusState.phase==='focus'&&s.gen&&audioAvailable;
const unavailable=false;
return`<div class="sound-option ${isSelected?'selected':''} ${isPlaying?'playing':''}" onclick="${unavailable?'':`selectSound('${s.id}')`}" style="${unavailable?'opacity:0.45;cursor:default':''}">
<div style="font-size:22px;width:32px;text-align:center;flex-shrink:0">${s.emoji}</div>
<div style="flex:1">
<div data-name style="font-size:13px;font-weight:600;color:${isSelected?s.color:'var(--text)'}">${s.name}</div>
<div style="font-size:11px;color:var(--text3);margin-top:2px">${unavailable?'Unavailable — audio file missing':s.gen?'Generated · seamless loop':'Silent mode'}</div>
</div>
${isPlaying?`<div class="sound-wave">${[1,2,3,4,5].map(()=>`<div class="sound-bar" style="background:${s.color}"></div>`).join('')}</div>`:''}
${isSelected&&!isPlaying?`<div class="sel-dot" style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0"></div>`:''}
</div>`;
}).join('');
updateFocusDisplay();
renderSessionDots();
updateSoundInfo();
}
function selectSound(id){
if(focusState.selectedSound===id) return; 
focusState.selectedSound=id;
save('focus_state',focusState);
document.querySelectorAll('#focus-sound-options .sound-option').forEach((el,i)=>{
const sid=SOUND_OPTIONS[i]?.id;
el.classList.toggle('selected', sid===id);
el.classList.remove('playing');
});
if(focusState.running&&focusState.phase==='focus'){
startNoise(id);
updateSoundWave();
}
updateSoundInfo();
}
function updateSoundWave(){
const audioAvailable = true;
document.querySelectorAll('#focus-sound-options .sound-option').forEach((el,i)=>{
const s=SOUND_OPTIONS[i];
if(!s) return;
const isSelected=focusState.selectedSound===s.id;
const isPlaying=isSelected&&focusState.running&&focusState.phase==='focus'&&s.gen&&audioAvailable;
el.classList.toggle('playing', isPlaying);
el.classList.toggle('selected', isSelected);
let wave=el.querySelector('.sound-wave');
let dot=el.querySelector('.sel-dot');
if(isPlaying){
if(!wave){
wave=document.createElement('div');
wave.className='sound-wave';
wave.innerHTML=[1,2,3,4,5].map(()=>`<div class="sound-bar" style="background:${s.color}"></div>`).join('');
el.appendChild(wave);
}
if(dot) dot.remove();
} else {
if(wave) wave.remove();
if(isSelected&&!dot){
dot=document.createElement('div');
dot.className='sel-dot';
dot.style.cssText=`width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0`;
el.appendChild(dot);
} else if(!isSelected&&dot){
dot.remove();
}
}
const nameEl=el.querySelector('div[data-name]');
if(nameEl) nameEl.style.color=isSelected?s.color:'var(--text)';
});
}
function updateSoundInfo(){
const s=SOUND_OPTIONS.find(x=>x.id===focusState.selectedSound);
if(!s) return;
document.getElementById('focus-sound-name').textContent=s.name;
document.getElementById('focus-sound-name').style.color=s.color;
document.getElementById('focus-sound-desc').textContent=s.desc;
}
function updateFocusDisplay(){
const rem=focusState.remaining;
const min=Math.floor(rem/60),sec=rem%60;
const timeStr=`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
document.getElementById('focus-time-display').textContent=timeStr;
const isFocus=focusState.phase==='focus';
const total=isFocus?focusState.focusMinutes*60:focusState.breakMinutes*60;
const fraction=rem/total;
const circumference=2*Math.PI*88; 
const offset=circumference*(1-fraction);
const ring=document.getElementById('focus-ring');
if(ring){
ring.style.strokeDashoffset=offset;
ring.style.stroke=isFocus?'var(--blue)':'var(--emerald)';
}
const badge=document.getElementById('focus-session-badge');
const dot=document.getElementById('focus-live-dot');
const label=document.getElementById('focus-session-label');
const sub=document.getElementById('focus-phase-sub');
const glowBg=document.getElementById('focus-glow-bg');
if(isFocus){
badge.style.background='var(--blue-d)';badge.style.borderColor='rgba(59,130,246,.3)';badge.style.color='var(--blue)';
label.textContent='FOCUS';sub.textContent=focusState.running?'Stay on task':'Ready';
if(glowBg) glowBg.style.setProperty('--focus-glow','rgba(59,130,246,0.1)');
} else {
badge.style.background='var(--em-d)';badge.style.borderColor='rgba(16,185,129,.3)';badge.style.color='var(--emerald)';
label.textContent='BREAK';sub.textContent=focusState.running?'Take a rest':'Paused';
if(glowBg) glowBg.style.setProperty('--focus-glow','rgba(16,185,129,0.1)');
}
if(dot) dot.style.display=focusState.running?'inline-block':'none';
const btn=document.getElementById('focus-start-btn');
if(btn) btn.textContent=focusState.running?'⏸ Pause':'▶ Start';
document.getElementById('focus-session-count').textContent=focusState.sessions;
}
function renderSessionDots(){
const el=document.getElementById('focus-session-dots');
if(!el) return;
const n=Math.min(focusState.sessions,8);
el.innerHTML=Array.from({length:n},(_,i)=>`<div style="width:8px;height:8px;border-radius:50%;background:var(--blue);opacity:${1-i*0.1}"></div>`).join('');
}
function focusToggle(){
if(focusState.running){
focusState.running=false;
clearInterval(focusState.interval);
focusState.interval=null;
stopNoise();
} else {
if(focusState.interval){clearInterval(focusState.interval);focusState.interval=null;}
_focusTickLast = Date.now();
focusState.running=true;
if(focusState.phase==='focus'){
(async()=>{
const ctx=getAudioContext();
if(ctx.state==='suspended') await ctx.resume();
preloadAudio();
await startNoise(focusState.selectedSound);
})();
}
focusState.interval=setInterval(focusTick,1000);
}
save('focus_state',focusState);
updateFocusDisplay();
updateSoundWave();
}
let _focusTickLast = null;
function focusTick(){
const now = Date.now();
const elapsed = _focusTickLast ? Math.round((now - _focusTickLast) / 1000) : 1;
_focusTickLast = _focusTickLast ? _focusTickLast + elapsed * 1000 : now;   // keep the fractional second so the timer doesn't drift
focusState.remaining = Math.max(0, focusState.remaining - elapsed);
if(focusState.remaining<=0){
if(focusState.phase==='focus'){
focusState.sessions++;
focusState.phase='break';
focusState.remaining=focusState.breakMinutes*60;
stopNoise();
if(typeof Notification!=='undefined'&&Notification.permission==='granted') new Notification('Break time! 🎉',{body:`${focusState.focusMinutes} minutes done. Take a ${focusState.breakMinutes}-minute break.`,icon:''});
} else {
focusState.phase='focus';
focusState.remaining=focusState.focusMinutes*60;
startNoise(focusState.selectedSound);
if(typeof Notification!=='undefined'&&Notification.permission==='granted') new Notification('Focus time! 🎯',{body:'Break over. Back to work!',icon:''});
}
updateSoundWave();
}
save('focus_state',focusState);
updateFocusDisplay();
const scEl=document.getElementById('focus-session-count');
if(scEl&&focusState.sessions!==parseInt(scEl.textContent)) renderSessionDots();
}
function focusReset(){
clearInterval(focusState.interval);
stopNoise();
focusState.running=false;
focusState.phase='focus';
focusState.remaining=focusState.focusMinutes*60;
save('focus_state',focusState);
if(document.getElementById('view-focus').classList.contains('active')) renderFocus();
}
function requestNotifPermission(){
if(typeof Notification!=='undefined'&&Notification.permission==='default'){
Notification.requestPermission();
}
}
