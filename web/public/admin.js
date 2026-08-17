/* MeloVerse — Admin moderation & control panel */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let token = localStorage.getItem('mv_token') || '';
let user = JSON.parse(localStorage.getItem('mv_user') || 'null');
let taskTimer = null;

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (opts.body) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  if (res.status === 401) { logout(); throw new Error('unauthorized'); }
  return res.json();
}

function logout() {
  token = ''; user = null;
  localStorage.removeItem('mv_token'); localStorage.removeItem('mv_user');
  location.reload();
}

function fmt(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
}

async function init() {
  $('#logoutBtn').addEventListener('click', logout);
  $('#loginBtn').addEventListener('click', doLogin);
  $('#loginPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  if (user && user.role === 'admin') { showPanel(); return; }
  try {
    const me = await api('/api/auth/me');
    if (me.user && me.user.role === 'admin') { user = me.user; localStorage.setItem('mv_user', JSON.stringify(user)); showPanel(); return; }
  } catch {}
  $('#loginBox').classList.remove('hidden');
}

async function doLogin() {
  const res = await fetch('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: $('#loginUser').value.trim(), password: $('#loginPass').value }),
  });
  const data = await res.json();
  if (!res.ok) { $('#loginErr').textContent = data.error || 'خطأ'; return; }
  if (data.user.role !== 'admin') { $('#loginErr').textContent = 'هذا الحساب ليس مشرفًا'; return; }
  token = data.token; user = data.user;
  localStorage.setItem('mv_token', token);
  localStorage.setItem('mv_user', JSON.stringify(user));
  showPanel();
}

function showPanel() {
  $('#loginBox').classList.add('hidden');
  $('#logoutBtn').classList.remove('hidden');
  $('#panel').classList.remove('hidden');
  document.querySelectorAll('.admin-tab').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((x) => x.classList.toggle('active', x === b));
      const tabs = ['stats', 'sync', 'sources', 'ads', 'builds', 'comments', 'users', 'content', 'jobs', 'catalog'];
      tabs.forEach((t) => $('#tab' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('hidden', t !== b.dataset.tab));
      load(b.dataset.tab);
    })
  );
  load('stats');
}

async function load(tab) {
  try {
    if (tab === 'stats') await loadStats();
    if (tab === 'sync') await loadSync();
    if (tab === 'sources') await loadSources();
    if (tab === 'ads') await loadAds();
    if (tab === 'builds') await loadBuilds();
    if (tab === 'comments') await loadComments();
    if (tab === 'users') await loadUsers();
    if (tab === 'content') await loadContent();
    if (tab === 'jobs') await loadJobs();
    if (tab === 'catalog') await loadCatalog();
  } catch (e) { console.error(e); }
}

/* ---------- stats ---------- */
async function loadStats() {
  const s = (await api('/api/admin/stats')).data;
  $('#tabStats').innerHTML = `<div class="stat-grid">
    <div class="stat-card"><div class="n">${s.users}</div><div class="l">مستخدمون</div></div>
    <div class="stat-card"><div class="n">${s.comments}</div><div class="l">تعليقات</div></div>
    <div class="stat-card"><div class="n">${s.reportedComments}</div><div class="l">بلاغات معلقة</div></div>
    <div class="stat-card"><div class="n">${s.works}</div><div class="l">أعمال في الفهرس</div></div>
    <div class="stat-card"><div class="n">${s.chapters}</div><div class="l">فصول مفهرسة</div></div>
    <div class="stat-card"><div class="n">${s.blocked}</div><div class="l">محتوًى محجوب</div></div>
  </div>`;
}

/* ---------- content sync ---------- */
async function loadSync() {
  const tasks = (await api('/api/admin/tasks')).data;
  $('#tabSync').innerHTML = `
    <h3 style="margin-bottom:12px">مزامنة المحتوى</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      <button class="btn primary" onclick="runSync('1000',1000)">📚 سحب مكتبة شاملة (1000 عمل)</button>
      <button class="btn" onclick="runSync('daily',100)">📅 السحب اليومي (100 جديد)</button>
      <button class="btn" onclick="runSync('ongoing')">🔄 متابعة الأعمال المستمرة</button>
      <button class="btn" onclick="runSync('popular')">🔥 مزامنة الأكثر شهرة</button>
      <button class="btn" onclick="runSync('full',200)">🌐 السحب الشامل من كل المصادر</button>
    </div>
    <h4 style="margin-bottom:8px">طابور المهام (${tasks.filter((t) => t.status === 'queued' || t.status === 'running').length} نشطة)</h4>
    <table class="table"><thead><tr><th>المهمة</th><th>الحالة</th><th>التقدم</th><th>النتيجة/الخطأ</th><th>التاريخ</th><th></th></tr></thead><tbody>${
      tasks.map((t) => `<tr>
        <td>${esc(t.name)}</td>
        <td><span style="color:${t.status === 'done' ? '#2e9e5b' : t.status === 'failed' ? '#e04f5f' : t.status === 'running' ? '#c68e31' : 'inherit'}">${t.status}</span></td>
        <td>${t.progress || 0}% ${t.message ? '<br><small>' + esc(t.message) + '</small>' : ''}</td>
        <td style="font-size:12px">${esc(t.result || t.error || '—').slice(0, 120)}</td>
        <td>${fmt(t.created_at)}</td>
        <td>${t.status === 'queued' ? `<button class="mini-btn danger" onclick="cancelTask('${t.id}')">إلغاء</button>` : ''}</td>
      </tr>`).join('') || '<tr><td colspan="6" style="color:var(--text-soft)">لا مهام بعد</td></tr>'
    }</tbody></table>`;
}
async function runSync(type, quota) {
  const body = quota ? { type, quota } : { type };
  const r = await api('/api/admin/sync/run', { method: 'POST', body });
  if (r.taskId) { toastMsg('بدأت المهمة في الخلفية'); loadSync(); }
}
async function cancelTask(id) {
  await api('/api/admin/tasks/' + id + '/cancel', { method: 'POST' });
  loadSync();
}

/* ---------- sources ---------- */
async function loadSources() {
  const data = (await api('/api/admin/sources')).data;
  const statusColor = { healthy: '#2e9e5b', degraded: '#c68e31', down: '#e04f5f', unknown: '#888' };
  const name = { mangadex: 'MangaDex (رئيسي)', anilist: 'AniList (إثراء)', comick: 'Comick (بديل)', mangaupdates: 'MangaUpdates', consumet: 'Consumet', batoto: 'Bato.to (مرآة)', mangabuddy: 'MangaBuddy (مرآة)', mangapill: 'MangaPill (مرآة)' };
  $('#tabSources').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">
      <h3 style="margin:0">المصادر والأولوية</h3>
      <button class="btn" onclick="testSources()">🩺 فحص الصحة الآن</button>
    </div>
    <table class="table"><thead><tr><th>المصدر</th><th>الأولوية</th><th>الحالة</th><th>زمن الاستجابة</th><th>آخر فحص</th><th></th></tr></thead><tbody>${
      data.map((s) => `<tr>
        <td><strong>${esc(name[s.id] || s.name)}</strong></td>
        <td><input type="number" min="1" max="99" value="${s.priority}" style="width:60px" id="prio-${s.id}" onchange="setPriority('${s.id}')"></td>
        <td><span style="color:${statusColor[s.status] || '#888'}">● ${s.status}</span></td>
        <td>${s.latency != null ? s.latency + ' ms' : '—'}</td>
        <td>${s.lastCheck ? fmt(s.lastCheck) : '—'}</td>
        <td><button class="mini-btn ${s.enabled ? 'ok' : ''}" onclick="toggleSource('${s.id}', ${!s.enabled})">${s.enabled ? 'مفعّل ✓' : 'معطّل'}</button></td>
      </tr>`).join('')
    }</tbody></table>
    <p style="color:var(--text-soft);font-size:13px;margin-top:10px">الفيلوفر التلقائي: أي مصدر حالته <b>down</b> أو معطّل يُتخطى تلقائيًا في سلسلة الصور (المصدر الرئيسي ← المرايا).</p>`;
}
async function toggleSource(id, enabled) {
  await api('/api/admin/sources/' + id + '/config', { method: 'POST', body: { enabled } });
  loadSources();
}
async function setPriority(id) {
  const priority = parseInt($('#prio-' + id).value, 10) || 1;
  await api('/api/admin/sources/' + id + '/config', { method: 'POST', body: { priority } });
  loadSources();
}
async function testSources() {
  toastMsg('جارٍ فحص المصادر...');
  await api('/api/admin/sources/check', { method: 'POST' });
  loadSources();
  toastMsg('اكتمل الفحص');
}

/* ---------- ads & access ---------- */
async function loadAds() {
  const cfg = (await api('/api/admin/config')).data;
  const a = cfg.ads, ac = cfg.access, r = cfg.reader;
  $('#tabAds').innerHTML = `
    <h3 style="margin-bottom:12px">الإعلانات (تُطبَّق فورًا بدون تحديث التطبيق)</h3>
    <div class="admin-panel" style="margin-bottom:12px">
      <label><input type="checkbox" id="adBanner" ${a.banner.enabled ? 'checked' : ''}> Banner في أسفل القارئ</label><br>
      <label><input type="checkbox" id="adInter" ${a.interstitial.enabled ? 'checked' : ''}> Interstitial بين الفصول (كل <input type="number" id="adInterFreq" value="${a.interstitial.frequencyPerChapters}" style="width:60px"> فصول)</label><br>
      <label><input type="checkbox" id="adReward" ${a.rewarded.enabled ? 'checked' : ''}> Rewarded Video لفتح فصول VIP</label><br>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <input id="adCodeBanner" placeholder="كود شبكة Banner (مثال: ca-app-pub-xxx)" value="${esc(a.banner.networkCode)}" style="flex:1;min-width:200px">
        <input id="adCodeInter" placeholder="كود شبكة Interstitial" value="${esc(a.interstitial.networkCode)}" style="flex:1;min-width:200px">
        <input id="adCodeReward" placeholder="كود شبكة Rewarded" value="${esc(a.rewarded.networkCode)}" style="flex:1;min-width:200px">
      </div>
    </div>
    <h3 style="margin-bottom:12px">الصلاحيات والحدود</h3>
    <div class="admin-panel" style="margin-bottom:12px">
      <label>حد التحميل اليومي للمستخدم المجاني: <input type="number" id="accFree" value="${ac.freeDailyDownloads}" style="width:80px"> فصلًا</label><br>
      <label>حد قراءة يومي للمجاني: <input type="number" id="accChapters" value="${ac.freeDailyChapters}" style="width:80px"> فصلًا</label><br>
      <label><input type="checkbox" id="accVip" ${ac.vipsUnlimitedDownloads ? 'checked' : ''}> تحميل غير محدود للـ VIP</label>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn primary" onclick="saveAds()">💾 حفظ الإعدادات (إصدار ${cfg.version})</button>
      <button class="btn" onclick="resetAds()">استعادة الافتراضي</button>
    </div>`;
}
async function saveAds() {
  const body = {
    ads: {
      banner: { enabled: $('#adBanner').checked, networkCode: $('#adCodeBanner').value.trim() },
      interstitial: { enabled: $('#adInter').checked, frequencyPerChapters: parseInt($('#adInterFreq').value, 10) || 3, networkCode: $('#adCodeInter').value.trim() },
      rewarded: { enabled: $('#adReward').checked, networkCode: $('#adCodeReward').value.trim() },
    },
    access: {
      freeDailyDownloads: parseInt($('#accFree').value, 10) || 20,
      freeDailyChapters: parseInt($('#accChapters').value, 10) || 100,
      vipsUnlimitedDownloads: $('#accVip').checked,
    },
  };
  await api('/api/admin/config', { method: 'POST', body });
  toastMsg('تم الحفظ — التطبيق سيطبّقه فورًا');
  loadAds();
}
async function resetAds() {
  await api('/api/admin/config', { method: 'POST', body: { ads: { banner: { enabled: false, networkCode: '' }, interstitial: { enabled: false, frequencyPerChapters: 3, networkCode: '' }, rewarded: { enabled: false, networkCode: '' } }, access: { freeDailyDownloads: 20, freeDailyChapters: 100, vipsUnlimitedDownloads: true } } });
  loadAds();
}

/* ---------- builds ---------- */
async function loadBuilds() {
  const d = (await api('/api/admin/builds'));
  const active = d.tasks.filter((t) => t.status === 'running' || t.status === 'queued').length;
  $('#tabBuilds').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">
      <h3 style="margin:0">محرك بناء APK (من داخل اللوحة)</h3>
      <button class="btn primary" onclick="startBuild()" ${active ? 'disabled' : ''}>🔨 بناء APK الآن</button>
    </div>
    ${active ? '<p style="color:#c68e31">⚠ يوجد بناء نشط — انتظر اكتماله</p>' : ''}
    <h4 style="margin:10px 0 8px">المبينات السابقة (APK جاهز للتحميل)</h4>
    <table class="table"><thead><tr><th>الملف</th><th>الحجم</th><th></th></tr></thead><tbody>${
      d.artifacts.map((a) => `<tr><td style="direction:ltr">${esc(a.name)}</td><td>${a.size}</td><td><a class="mini-btn ok" href="${a.url}" download>⬇ تحميل</a></td></tr>`).join('') || '<tr><td colspan="3" style="color:var(--text-soft)">لا توجد ملفات بعد</td></tr>'
    }</tbody></table>
    <h4 style="margin:14px 0 8px">سجل المهام</h4>
    <table class="table"><thead><tr><th>الحالة</th><th>التقدم</th><th>النتيجة/الخطأ</th><th>التاريخ</th></tr></thead><tbody>${
      d.tasks.map((t) => `<tr>
        <td><span style="color:${t.status === 'done' ? '#2e9e5b' : t.status === 'failed' ? '#e04f5f' : '#c68e31'}">${t.status}</span></td>
        <td>${t.progress || 0}% ${t.message ? '<small>· ' + esc(t.message) + '</small>' : ''}</td>
        <td style="font-size:12px">${esc((t.result || t.error || '—')).slice(0, 150)}</td>
        <td>${fmt(t.created_at)}</td>
      </tr>`).join('') || '<tr><td colspan="4" style="color:var(--text-soft)">لا مهام بعد</td></tr>'
    }</tbody></table>`;
}
async function startBuild() {
  const r = await api('/api/admin/build', { method: 'POST' });
  toastMsg('بدأ البناء — استغرق 1-3 دقائق');
  setTimeout(loadBuilds, 3000);
}

/* ---------- moderation ---------- */
async function loadComments() {
  const data = (await api('/api/admin/comments?filter=reported')).data;
  const all = (await api('/api/admin/comments')).data;
  const row = (c) => `<tr>
    <td>${esc(c.username)}</td><td>${c.targetType} · <span style="direction:ltr">${esc(String(c.targetId).slice(0, 12))}</span></td>
    <td>${esc(c.body)}</td><td>${fmt(c.created_at)}</td>
    <td>${c.reported ? '🚩' : ''}${c.status === 'deleted' ? '🗑' : ''}</td>
    <td>${c.status !== 'deleted' ? `<button class="mini-btn danger" onclick="delComment('${c.id}')">حذف</button>` : ''}</td>
  </tr>`;
  $('#tabComments').innerHTML = `
    <h3 style="margin-bottom:10px">بلاغات معلقة (${data.length})</h3>
    <table class="table"><thead><tr><th>المستخدم</th><th>الهدف</th><th>النص</th><th>التاريخ</th><th>حالة</th><th></th></tr></thead>
    <tbody>${data.map(row).join('') || '<tr><td colspan="6" style="color:var(--text-soft)">لا بلاغات معلقة</td></tr>'}</tbody></table>
    <h3 style="margin:18px 0 10px">كل التعليقات (${all.length})</h3>
    <table class="table"><thead><tr><th>المستخدم</th><th>الهدف</th><th>النص</th><th>التاريخ</th><th>حالة</th><th></th></tr></thead>
    <tbody>${all.map(row).join('') || '<tr><td colspan="6" style="color:var(--text-soft)">لا تعليقات</td></tr>'}</tbody></table>`;
}
async function delComment(id) {
  await api('/api/admin/comments/' + id + '/delete', { method: 'POST' });
  loadComments();
}

async function loadUsers() {
  const data = (await api('/api/admin/users')).data;
  $('#tabUsers').innerHTML = `<table class="table"><thead><tr><th>المستخدم</th><th>الدور</th><th>التسجيل</th><th>الحالة</th><th></th></tr></thead><tbody>${
    data.map((u) => `<tr><td>${esc(u.username)}</td><td>${u.role}</td><td>${fmt(u.created_at)}</td>
    <td>${u.banned ? '<span style="color:#e04f5f">محظور</span>' : '<span style="color:#2e9e5b">نشط</span>'}</td>
    <td>${u.role !== 'admin' ? `<button class="mini-btn ${u.banned ? 'ok' : 'danger'}" onclick="banUser('${u.id}', ${!u.banned})">${u.banned ? 'إلغاء الحظر' : 'حظر'}</button>` : '—'}</td></tr>`).join('')
  }</tbody></table>`;
}
async function banUser(id, banned) {
  await api('/api/admin/users/' + id + '/ban', { method: 'POST', body: { banned } });
  loadUsers();
}

async function loadContent() {
  const data = (await api('/api/admin/content/blocked')).data;
  $('#tabContent').innerHTML = `
    <h3 style="margin-bottom:10px">حجب محتوى (مانجا / فصل / أنمي)</h3>
    <div class="comment-form">
      <input id="blkType" list="blkTypes" placeholder="النوع: manga / chapter / anime" style="flex:0 0 180px">
      <datalist id="blkTypes"><option>manga</option><option>chapter</option><option>anime</option></datalist>
      <input id="blkId" placeholder="المعرف (id)">
      <button class="btn primary" id="blkBtn">حجب</button>
    </div>
    <table class="table"><thead><tr><th>النوع</th><th>المعرف</th><th>السبب</th><th>التاريخ</th><th></th></tr></thead><tbody>${
      data.map((b) => `<tr><td>${b.targetType}</td><td style="direction:ltr">${esc(b.targetId)}</td><td>${esc(b.reason)}</td><td>${fmt(b.created_at)}</td>
      <td><button class="mini-btn ok" onclick="unblock('${b.targetType}','${esc(b.targetId)}')">إلغاء الحجب</button></td></tr>`).join('') || '<tr><td colspan="5" style="color:var(--text-soft)">لا يوجد محتوى محجوب</td></tr>'
    }</tbody></table>`;
  $('#blkBtn').addEventListener('click', async () => {
    const targetType = $('#blkType').value.trim();
    const targetId = $('#blkId').value.trim();
    if (!targetType || !targetId) return;
    await api('/api/admin/content/block', { method: 'POST', body: { targetType, targetId, reason: 'حجب من اللوحة' } });
    $('#blkId').value = '';
    loadContent();
  });
}
async function unblock(targetType, targetId) {
  await api('/api/admin/content/unblock', { method: 'POST', body: { targetType, targetId } });
  loadContent();
}

/* ---------- scheduled jobs ---------- */
async function loadJobs() {
  const jobs = (await api('/api/admin/jobs')).data;
  const names = { daily_bulk: 'السحب اليومي (أعمال جديدة)', ongoing: 'تتبع الفصول المستمر (كل 30 دقيقة)', popular: 'مزامنة الأكثر شهرة', full: 'السحب الشامل (قاعدة كاملة)' };
  $('#tabJobs').innerHTML = jobs.map((j) => `
    <div class="job-card">
      <div class="jhead">
        <span class="jname">${names[j.id] || j.id}</span>
        <span>
          <button class="mini-btn ${j.enabled ? 'ok' : ''}" onclick="toggleJob('${j.id}', ${!j.enabled})">${j.enabled ? 'مفعّل ✓' : 'معطّل'}</button>
          <button class="mini-btn" onclick="runJob('${j.id}')">تشغيل الآن</button>
        </span>
      </div>
      <div class="jmeta">كل ${j.intervalMinutes} دقيقة · آخر تشغيل: ${j.lastRun ? fmt(j.lastRun) : 'لم يُشغَّل'} ${j.quota ? '· كوتا: ' + j.quota : ''}</div>
      ${j.lastResult ? `<div class="jmeta">النتيجة: ${esc(j.lastResult)}</div>` : ''}
      ${j.lastError ? `<div class="jerr">خطأ: ${esc(j.lastError)}</div>` : ''}
    </div>`).join('');
}
async function toggleJob(id, enabled) {
  await api('/api/admin/jobs/' + id + '/config', { method: 'POST', body: { enabled } });
  loadJobs();
}
async function runJob(id) {
  await api('/api/admin/jobs/' + id + '/run', { method: 'POST' });
  toastMsg('بدأت المهمة في الخلفية');
}

/* ---------- catalog ---------- */
async function loadCatalog() {
  const data = (await api('/api/admin/catalog')).data;
  $('#tabCatalog').innerHTML = `<h3 style="margin-bottom:10px">أحدث الأعمال المزامنة (${data.length})</h3>
  <table class="table"><thead><tr><th>العنوان</th><th>المصدر</th><th>التقييم</th><th>آخر مزامنة</th></tr></thead><tbody>${
    data.map((w) => `<tr><td>${esc(w.title)}</td><td>${w.source}</td><td>${w.rating ?? '—'}</td><td>${fmt(w.last_synced)}</td></tr>`).join('')
  }</tbody></table>`;
}

/* ---------- misc ---------- */
let toastTimer = null;
function toastMsg(msg) {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast hidden';
    document.body.append(el);
  }
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2500);
}

// refresh active tabs periodically
setInterval(() => {
  const active = document.querySelector('.admin-tab.active');
  if (active && (active.dataset.tab === 'sync' || active.dataset.tab === 'builds')) load(active.dataset.tab);
}, 5000);

init();
