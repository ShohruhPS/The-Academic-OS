// ══════════ ACCOUNTS + CLOUD SYNC (MongoDB Atlas via backend) ══════════
// After deploying backend/ (see backend/README.md), put its URL here:
const API_BASE = 'https://academicos-xohl.onrender.com';

function getToken(){ return localStorage.getItem('aos_token'); }
function getAosKeys(){
  const keys=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k && k.indexOf('aos_')===0 && k!=='aos_token' && k!=='aos_username') keys.push(k);
  }
  return keys;
}
function collectLocalData(){
  const data={};
  getAosKeys().forEach(k=>{
    try{ data[k.slice(4)] = JSON.parse(localStorage.getItem(k)); }catch(e){}
  });
  return data;
}
function applyServerData(data){
  getAosKeys().forEach(k=>localStorage.removeItem(k)); // clear stale cache first
  if(data && typeof data==='object'){
    Object.keys(data).forEach(k=>{
      try{ localStorage.setItem('aos_'+k, JSON.stringify(data[k])); }catch(e){}
    });
  }
}

let _syncTimer=null;
function queueServerSync(){
  if(!getToken()) return;
  clearTimeout(_syncTimer);
  _syncTimer=setTimeout(syncToServer,1500);
}
async function syncToServer(){
  const token=getToken();
  if(!token) return;
  try{
    await fetch(API_BASE+'/api/data',{
      method:'PUT',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({data:collectLocalData()})
    });
  }catch(e){ console.warn('Cloud sync failed (will retry on next change):', e); }
}
// Best-effort final sync if the tab is closing with unsaved changes.
window.addEventListener('beforeunload', ()=>{
  if(getToken() && _syncTimer){ navigator.sendBeacon && navigator.sendBeacon(
    API_BASE+'/api/data',
    new Blob([JSON.stringify({data:collectLocalData()})],{type:'application/json'})
  ); }
});

let _pendingAccountUI=null;
function updateAccountUI(loggedIn){
  const row=document.getElementById('auth-account-row');
  if(!row){ _pendingAccountUI=loggedIn; return; } // sidebar not parsed yet — retry once DOM is ready
  row.style.display = loggedIn ? 'flex' : 'none';
  if(loggedIn){
    const unameEl=document.getElementById('auth-account-username');
    if(unameEl) unameEl.textContent = localStorage.getItem('aos_username') ? '@'+localStorage.getItem('aos_username') : '';
  }
}
document.addEventListener('DOMContentLoaded', function(){
  if(_pendingAccountUI!==null) updateAccountUI(_pendingAccountUI);
});

function authShowGate(){ document.getElementById('auth-gate').style.display='flex'; updateAccountUI(false); }
function authHideGate(){
  document.getElementById('auth-gate').style.display='none';
  updateAccountUI(true);
}

async function authPromptEmail(){
  const email = prompt('Set or update your recovery email (used only for "forgot password" links):');
  if(email===null) return; // cancelled
  const token=getToken();
  if(!token) return;
  try{
    const res = await fetch(API_BASE+'/api/account',{
      method:'PUT',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({email: email.trim()})
    });
    const json = await res.json();
    if(!res.ok){ alert(json.error||'Could not update email.'); return; }
    alert(email.trim() ? 'Recovery email saved.' : 'Recovery email removed.');
  }catch(err){
    alert('Could not reach the server. Try again in a moment.');
  }
}
function authShowForm(msg){
  document.getElementById('auth-loading').style.display='none';
  document.getElementById('auth-form-wrap').style.display='block';
  if(msg) authShowError(msg);
}
function authShowError(msg){
  const el=document.getElementById('auth-error');
  el.textContent=msg; el.style.display='block';
}
function authClearError(){ document.getElementById('auth-error').style.display='none'; }

let _authMode='login';
function setAuthMode(mode){
  _authMode=mode;
  document.getElementById('tab-login').classList.toggle('active',mode==='login');
  document.getElementById('tab-register').classList.toggle('active',mode==='register');
  document.getElementById('auth-name-group').style.display = mode==='register' ? 'block':'none';
  document.getElementById('auth-email-group').style.display = mode==='register' ? 'block':'none';
  document.getElementById('auth-forgot-link').style.display = mode==='register' ? 'none':'block';
  document.getElementById('auth-submit-btn').textContent = mode==='register' ? 'Create Account' : 'Log In';
  authClearError();
}

function showLoginForm(){
  document.getElementById('auth-forgot-wrap').style.display='none';
  document.getElementById('auth-reset-wrap').style.display='none';
  document.getElementById('auth-form-wrap').style.display='block';
  setAuthMode('login');
}
function showForgotForm(){
  document.getElementById('auth-form-wrap').style.display='none';
  document.getElementById('auth-forgot-wrap').style.display='block';
  document.getElementById('auth-forgot-success').style.display='none';
  document.getElementById('auth-forgot-error').style.display='none';
  emailLimitActive();
}

async function handleAuthSubmit(e){
  e.preventDefault();
  authClearError();
  const username=document.getElementById('auth-username').value.trim();
  const password=document.getElementById('auth-password').value;
  const name=document.getElementById('auth-name').value.trim();
  const email=document.getElementById('auth-email').value.trim();
  const btn=document.getElementById('auth-submit-btn');
  btn.disabled=true; const oldText=btn.textContent; btn.textContent='Please wait…';
  const wakeupTimer=setTimeout(()=>{ btn.textContent='Waking up server…'; }, 4000);
  try{
    const path = _authMode==='register' ? '/api/auth/register' : '/api/auth/login';
    const body = _authMode==='register'
      ? {username,password,name,email,data:collectLocalData()} // preserve any local-only progress
      : {username,password};
    const res = await fetch(API_BASE+path,{
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
    });
    clearTimeout(wakeupTimer);
    const json = await res.json();
    if(!res.ok){ authShowError(json.error||'Something went wrong. Please try again.'); btn.disabled=false; btn.textContent=oldText; return; }
    localStorage.setItem('aos_token', json.token);
    localStorage.setItem('aos_username', json.user.username);
    applyServerData(json.data);
    sessionStorage.setItem('aos_session_synced','1');
    location.reload();
  }catch(err){
    clearTimeout(wakeupTimer);
    authShowError('Could not reach the server. Check your connection and try again.');
    btn.disabled=false; btn.textContent=oldText;
  }
}


// ---- Email-limit handling (key has no "aos_" prefix on purpose, so it never syncs to the cloud) ----
let _emailLimitTimer=null;
function fmtWait(s){
  if(s<90) return 'about a minute';
  const m=Math.ceil(s/60); if(m<60) return m+' minutes';
  const h=Math.floor(m/60), r=m%60;
  if(h<48) return h+' hour'+(h>1?'s':'')+(r?' '+r+' min':'');
  return Math.ceil(h/24)+' days';
}
function emailLimitActive(){
  const until=+localStorage.getItem('email_block_until')||0, left=Math.ceil((until-Date.now())/1000);
  const errEl=document.getElementById('auth-forgot-error'), btn=document.getElementById('forgot-submit-btn');
  clearTimeout(_emailLimitTimer);
  if(left<=0){ localStorage.removeItem('email_block_until'); btn.disabled=false; return false; }
  errEl.textContent='Email limit reached. Please try again in '+fmtWait(left)+'.';
  errEl.style.display='block'; btn.disabled=true;
  _emailLimitTimer=setTimeout(()=>{ errEl.style.display='none'; emailLimitActive(); }, Math.min(left*1000, 60000));
  return true;
}
async function handleForgotSubmit(e){
  e.preventDefault();
  if(emailLimitActive()) return;
  const email=document.getElementById('forgot-email').value.trim();
  const btn=document.getElementById('forgot-submit-btn');
  const errEl=document.getElementById('auth-forgot-error');
  errEl.style.display='none';
  btn.disabled=true; const oldText=btn.textContent; btn.textContent='Sending…';
  try{
    const res = await fetch(API_BASE+'/api/auth/forgot-password',{
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email})
    });
    const json = await res.json();
    if(res.status===429 && json.code==='EMAIL_LIMIT'){
      localStorage.setItem('email_block_until', String(Date.now()+(json.retryAfterSeconds||3600)*1000));
      btn.textContent=oldText; emailLimitActive(); return;
    }
    if(!res.ok){ errEl.textContent=json.error||'Something went wrong.'; errEl.style.display='block'; btn.disabled=false; btn.textContent=oldText; return; }
    document.getElementById('auth-forgot-success').style.display='block';
    document.getElementById('auth-forgot-form').style.display='none';
  }catch(err){
    errEl.textContent='Could not reach the server. Check your connection and try again.';
    errEl.style.display='block';
    btn.disabled=false; btn.textContent=oldText;
  }
}

async function handleResetSubmit(e){
  e.preventDefault();
  const password=document.getElementById('reset-password').value;
  const params=new URLSearchParams(location.search);
  const token=params.get('reset');
  const btn=document.getElementById('reset-submit-btn');
  const errEl=document.getElementById('auth-reset-error');
  errEl.style.display='none';
  btn.disabled=true; const oldText=btn.textContent; btn.textContent='Saving…';
  try{
    const res = await fetch(API_BASE+'/api/auth/reset-password',{
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token,password})
    });
    const json = await res.json();
    if(!res.ok){ errEl.textContent=json.error||'Something went wrong.'; errEl.style.display='block'; btn.disabled=false; btn.textContent=oldText; return; }
    // Clear the reset token from the URL and send them to log in with the new password.
    history.replaceState(null,'',location.pathname);
    document.getElementById('auth-reset-wrap').style.display='none';
    authShowForm('Password updated — log in with your new password.');
  }catch(err){
    errEl.textContent='Could not reach the server. Check your connection and try again.';
    errEl.style.display='block';
    btn.disabled=false; btn.textContent=oldText;
  }
}

function authLogout(){
  if(!confirm('Log out? Your data stays saved in the cloud.')) return;
  localStorage.removeItem('aos_token');
  localStorage.removeItem('aos_username');
  getAosKeys().forEach(k=>localStorage.removeItem(k));
  sessionStorage.removeItem('aos_session_synced');
  location.reload();
}

(async function initAuth(){
  // If this page load came from a password-reset email link, show that form
  // immediately, regardless of login state.
  const resetToken = new URLSearchParams(location.search).get('reset');
  if(resetToken){
    authShowGate();
    document.getElementById('auth-loading').style.display='none';
    document.getElementById('auth-reset-wrap').style.display='block';
    return;
  }

  const token=getToken();
  if(!token){ authShowGate(); authShowForm(); if(location.hash==='#signup') setAuthMode('register'); return; }

  if(sessionStorage.getItem('aos_session_synced')==='1'){
    // Already pulled fresh data once this browser session — boot straight in.
    authHideGate();
    return;
  }

  authShowGate();
  document.getElementById('auth-loading-msg').textContent='Loading your data…';
  const wakeupTimer = setTimeout(()=>{
    document.getElementById('auth-loading-msg').textContent='Waking up the server — this can take up to a minute the first time…';
  }, 4000);
  try{
    const res = await fetch(API_BASE+'/api/data', { headers:{'Authorization':'Bearer '+token} });
    clearTimeout(wakeupTimer);
    if(res.status===401){
      localStorage.removeItem('aos_token'); localStorage.removeItem('aos_username');
      authShowForm('Your session expired — please log in again.');
      return;
    }
    if(!res.ok) throw new Error('bad response');
    const json = await res.json();
    applyServerData(json.data);
    sessionStorage.setItem('aos_session_synced','1');
    location.reload();
  }catch(err){
    clearTimeout(wakeupTimer);
    // Offline or backend unreachable — fall back to local cache so the app still works.
    console.warn('Could not reach cloud backend, using local cache:', err);
    sessionStorage.setItem('aos_session_synced','1');
    authHideGate();
  }
})();
