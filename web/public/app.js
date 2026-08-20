/* ============================================================
 * MeloVerse — SPA frontend (vanilla JS, no build step)
 * Views: home, search, manga detail, reader, library
 * ============================================================ */
'use strict';

/* ---------------- i18n ---------------- */
const I18N = {
  ar: {
    navHome: 'الرئيسية', navSearch: 'البحث', navLibrary: 'مكتبتي',
    footer: 'MeloVerse © 2026 — المحتوى ملك لأصحابه، والمصدر الأول: MangaDex API الرسمي',
    heroTitle: 'عالمك الكامل للمانجا والمانهوا والمانها',
    heroSub: 'قراءة سريعة بلا حدود: تمرير لا نهائي بين الفصول، دعم كامل للعربية والإنجليزية، ومكتبة تحفظ تقدمك تلقائيًا.',
    heroChip1: '١٠٠٪ مجاني', heroChip2: 'عربي / English', heroChip3: 'تمرير لا نهائي',
    trending: 'الأكثر متابعة هذا الأسبوع', latest: 'آخر التحديثات',
    searchPlaceholder: 'ابحث عن عنوان...', searchBtn: 'بحث', searchTitle: 'البحث',
    noResults: 'لا توجد نتائج مطابقة', tryAgain: 'جرّب كلمات أخرى أو لغة مختلفة',
    noChapters: 'لا توجد فصول متاحة بهذه اللغة حاليًا — جرّب اللغة الأخرى',
    type: 'النوع', chapters: 'فصلًا', chapter: 'فصل', status: 'الحالة',
    follow: '＋ متابعة', unfollow: '✓ تتم متابعته', continueReading: 'أكمل القراءة',
    readFromStart: 'ابدأ القراءة', chaptersList: 'قائمة الفصول', loadMore: 'تحميل المزيد من الفصول',
    reader: 'القارئ', webtoonMode: 'عمودي', pagedMode: 'أفقي', dataSaver: 'توفير البيانات',
    autoNext: 'تمرير تلقائي بين الفصول', nextChapter: 'الفصل التالي', prevChapter: 'الفصل السابق',
    chapterList: 'قائمة الفصول', endOfChapter: 'نهاية الفصل', backToManga: 'العودة لصفحة العمل',
    libraryTitle: 'مكتبتي', libraryEmpty: 'لا توجد متابعات بعد', libraryEmptySub: 'تابع أعمالك المفضلة لتظهر هنا مع تقدم قراءتك.',
    clearAll: 'مسح الكل', continueTag: 'أكمل القراءة', updated: 'آخر تحديث',
    loading: 'جارٍ التحميل...', error: 'حدث خطأ، حاول مجددًا', page: 'صفحة',
    login: 'دخول', register: 'تسجيل', logout: 'خروج', cancel: 'إلغاء',
    username: 'اسم المستخدم', password: 'كلمة المرور', welcome: 'مرحبًا بك في MeloVerse',
    fillAll: 'املأ الحقلين', welcomeBack: 'تم تسجيل الدخول', loginToComment: 'سجّل الدخول للمشاركة',
    adminPanel: 'لوحة الأدمن', comments: 'التعليقات', writeComment: 'اكتب تعليقًا...',
    send: 'إرسال', noComments: 'لا توجد تعليقات بعد — كن أول من يعلق', report: 'إبلاغ',
    delete: 'حذف', reported: 'تم إرسال البلاغ', sent: 'تم نشر التعليق', deletedComment: '(تم حذف هذا التعليق)',
    allTypes: 'الكل', latestChapters: 'أحدث الفصول المضافة',
    filterStatus: 'الحالة', filterType: 'النوع', filterSource: 'المصدر', filterRating: 'أدنى تقييم', filterSort: 'الترتيب',
    stOngoing: 'مستمر', stCompleted: 'منتهي', stHiatus: 'متوقف', stCancelled: 'ملغى',
    srcAll: 'كل المصادر', rtAll: 'أي تقييم', sortRating: 'حسب التقييم', sortTitle: 'حسب الاسم',
    profile: 'حسابي', changeAvatar: 'تغيير الصورة الشخصية', saveProfile: 'حفظ', currentPass: 'كلمة المرور الحالية',
    newPass: 'كلمة المرور الجديدة', themeLabel: 'المظهر العام', themeLight: 'فاتح', themeDark: 'داكن', themeAmoled: 'AMOLED أسود',
    readerFilterLabel: 'فلتر ألوان القارئ', rfOriginal: 'أصلي', rfMono: 'أبيض وأسود', rfSepia: 'ورقي/سيبيا',
    chapterOrderLabel: 'ترتيب الفصول', orderAsc: 'من الأقدم للأحدث', orderDesc: 'من الأحدث للأقدم',
    readNow: '▶ اقرأ الآن', avatarSaved: 'تم تحديث الصورة', profileSaved: 'تم حفظ التغييرات', accountData: 'بيانات الحساب',
    tabLatest: 'آخر التحديثات', tabPopular: 'الأكثر مشاهدة', tabDownloads: 'التحميلات',
    downloadApp: '⬇ تحميل التطبيق (APK) — أحدث نسخة',
    menuHome: 'الصفحة الرئيسية', menuSearch: 'البحث عن مانجا', menuNew: 'أعمال جديدة', menuHistory: 'سجل المشاهدات',
    listFavorites: 'قائمة المفضلة', listReadingNow: 'أقرأها الآن', listReadLater: 'اقرأ لاحقًا',
    listReadWorks: 'الأعمال المقروءة', listNotifications: 'الإشعارات', listDownloads: 'قائمة التحميلات',
    faq: 'الأسئلة الشائعة', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', nightMode: 'الوضع الليلي', settings: 'الإعدادات',
    followUs: 'تابعنا', facebook: 'فيسبوك', telegram: 'تيليجرام', twitter: 'إكس',
    notifications: 'التنبيهات', noNotifications: 'لا تنبيهات جديدة — تابع أعمالك لتصلك الفصول الجديدة',
    readLaterAdd: '⏳ اقرأ لاحقًا', readLaterRemove: '✓ في قائمة القراءة',
    historyTitle: 'سجل المشاهدات', historyEmpty: 'لم تقرأ شيئًا بعد',
    readLaterTitle: 'اقرأ لاحقًا', readLaterEmpty: 'قائمتك فارغة — أضف أعمالًا من صفحاتها',
    downloadsTitle: 'التحميلات والمحفوظات', downloadsNote: 'التحميل دون اتصال متاح في تطبيق أندرويد. هنا تجد آخر ما قرأته وروابط التطبيق.',
    newChapter: 'فصل جديد', menu: 'التنقل', myLists: 'قوائمي', guest: 'زائر',
    allWorks: 'كل الأعمال', myFollows: 'متابعاتي', newWorksTitle: 'أعمال جديدة',
    tabAnime: 'الأنمي', animeTrending: 'الأنمي الرائج', animeAiring: 'يعرض قريبًا',
    animeSearch: 'ابحث عن أنمي...', animeEpisodes: 'حلقة', animeStatus: 'الحالة', airsSoon: 'الحلقة',
    animeDetailNote: 'صفحة معلومات فقط — البث غير متاح هنا. تابع الأخبار والجدول.',
    readIn: 'اقرأ بـ', langNoticeAr: '⚠ العربية غير متاحة لهذا العمل — عرض الإنجليزية تلقائيًا. اختر لغتك من الأعلى.',
    langNoticeEn: '⚠ English is not available for this work — showing Arabic automatically. Pick your language above.',
    libraryAllNote: 'جميع الأعمال متاحة لجميع المستخدمين بفصولها الكاملة',
  },
  en: {
    navHome: 'Home', navSearch: 'Search', navLibrary: 'My Library',
    footer: 'MeloVerse © 2026 — Content belongs to its owners. Primary source: official MangaDex API',
    heroTitle: 'Your all-in-one manga, manhwa & manhua universe',
    heroSub: 'Blazing-fast reading with infinite scroll between chapters, full Arabic & English support, and a library that saves your progress automatically.',
    heroChip1: '100% free', heroChip2: 'عربي / English', heroChip3: 'Infinite scroll',
    trending: 'Most followed this week', latest: 'Latest updates',
    searchPlaceholder: 'Search by title...', searchBtn: 'Search', searchTitle: 'Search',
    noResults: 'No matching results', tryAgain: 'Try other keywords or another language',
    noChapters: 'No chapters available in this language yet — try the other language',
    type: 'Type', chapters: 'chapters', chapter: 'Chapter', status: 'Status',
    follow: '+ Follow', unfollow: 'Following', continueReading: 'Continue reading',
    readFromStart: 'Read from start', chaptersList: 'Chapters',
    loadMore: 'Load more chapters',
    reader: 'Reader', webtoonMode: 'Vertical', pagedMode: 'Horizontal', dataSaver: 'Data saver',
    autoNext: 'Auto-advance chapters', nextChapter: 'Next chapter', prevChapter: 'Prev chapter',
    chapterList: 'Chapters', endOfChapter: 'End of chapter', backToManga: 'Back to manga',
    libraryTitle: 'My Library', libraryEmpty: 'Nothing followed yet',
    libraryEmptySub: 'Follow your favorite series and they will show here with your progress.',
    clearAll: 'Clear all', continueTag: 'Continue', updated: 'Updated',
    loading: 'Loading...', error: 'Something went wrong, please retry', page: 'Page',
    login: 'Login', register: 'Sign up', logout: 'Logout', cancel: 'Cancel',
    username: 'Username', password: 'Password', welcome: 'Welcome to MeloVerse',
    fillAll: 'Fill both fields', welcomeBack: 'Signed in', loginToComment: 'Sign in to join the discussion',
    adminPanel: 'Admin', comments: 'Comments', writeComment: 'Write a comment...',
    send: 'Post', noComments: 'No comments yet — be the first', report: 'Report',
    delete: 'Delete', reported: 'Report sent', sent: 'Comment posted', deletedComment: '(This comment was removed)',
    allTypes: 'All', latestChapters: 'Latest added chapters',
    filterStatus: 'Status', filterType: 'Type', filterSource: 'Source', filterRating: 'Min rating', filterSort: 'Sort',
    stOngoing: 'Ongoing', stCompleted: 'Completed', stHiatus: 'Hiatus', stCancelled: 'Cancelled',
    srcAll: 'All sources', rtAll: 'Any rating', sortRating: 'By rating', sortTitle: 'By title',
    profile: 'My Account', changeAvatar: 'Change avatar', saveProfile: 'Save', currentPass: 'Current password',
    newPass: 'New password', themeLabel: 'Theme', themeLight: 'Light', themeDark: 'Dark', themeAmoled: 'AMOLED Black',
    readerFilterLabel: 'Reader color filter', rfOriginal: 'Original', rfMono: 'B&W', rfSepia: 'Sepia',
    chapterOrderLabel: 'Chapter order', orderAsc: 'Oldest first', orderDesc: 'Newest first',
    readNow: '▶ Read now', avatarSaved: 'Avatar updated', profileSaved: 'Changes saved', accountData: 'Account data',
    tabLatest: 'Latest Releases', tabPopular: 'Most Popular', tabDownloads: 'Downloads',
    downloadApp: '⬇ Download the app (APK) — latest version',
    menuHome: 'Home', menuSearch: 'Search manga', menuNew: 'New works', menuHistory: 'View history',
    listFavorites: 'Favorites', listReadingNow: 'Reading now', listReadLater: 'Read later',
    listReadWorks: 'Read works', listNotifications: 'Notifications', listDownloads: 'Downloads',
    faq: 'FAQ', privacy: 'Privacy policy', terms: 'Terms of use', nightMode: 'Night mode', settings: 'Settings',
    followUs: 'Follow us', facebook: 'Facebook', telegram: 'Telegram', twitter: 'X',
    notifications: 'Notifications', noNotifications: 'No new notifications — follow series to get chapter alerts',
    readLaterAdd: '⏳ Read later', readLaterRemove: '✓ In read list',
    historyTitle: 'View history', historyEmpty: 'Nothing read yet',
    readLaterTitle: 'Read later', readLaterEmpty: 'Empty — add works from their pages',
    downloadsTitle: 'Downloads & saved', downloadsNote: 'Offline download is an Android feature. Here are your recent reads and app links.',
    newChapter: 'New chapter', menu: 'Navigation', myLists: 'My lists', guest: 'Guest',
    allWorks: 'All works', myFollows: 'My follows', newWorksTitle: 'New works',
    tabAnime: 'Anime', animeTrending: 'Trending anime', animeAiring: 'Airing soon',
    animeSearch: 'Search anime...', animeEpisodes: 'ep', animeStatus: 'Status', airsSoon: 'Ep',
    animeDetailNote: 'Info page only — streaming is not available here. Follow news & schedule.',
    readIn: 'Read in', langNoticeAr: '⚠ Arabic is not available for this work — showing English automatically. Pick your language above.',
    langNoticeEn: '⚠ الإنجليزية غير متاحة لهذا العمل — عرض العربية تلقائيًا. اختر لغتك من الأعلى.',
    libraryAllNote: 'All series are available to all users with their full chapters',
  },
};
const t = (k) => (I18N[state.lang] && I18N[state.lang][k]) || I18N.en[k] || k;

/* ---------------- state & storage ---------------- */
const state = {
  lang: localStorage.getItem('mv_lang') || 'ar',
  follows: JSON.parse(localStorage.getItem('mv_follows') || '[]'),
  progress: JSON.parse(localStorage.getItem('mv_progress') || '{}'),
  dataSaver: localStorage.getItem('mv_saver') !== '0',
  autoNext: localStorage.getItem('mv_auto') !== '0',
  theme: localStorage.getItem('mv_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  rFilter: localStorage.getItem('mv_rfilter') || 'original',
  chapterOrder: localStorage.getItem('mv_order') || 'asc',
  proxy: localStorage.getItem('mv_proxy') !== '0',
  readLater: JSON.parse(localStorage.getItem('mv_readlater') || '[]'),
  homeTab: 'latest',
  reader: null, // reader session state
};
const save = () => {
  localStorage.setItem('mv_lang', state.lang);
  localStorage.setItem('mv_follows', JSON.stringify(state.follows));
  localStorage.setItem('mv_progress', JSON.stringify(state.progress));
  localStorage.setItem('mv_saver', state.dataSaver ? '1' : '0');
  localStorage.setItem('mv_auto', state.autoNext ? '1' : '0');
  localStorage.setItem('mv_theme', state.theme);
  localStorage.setItem('mv_rfilter', state.rFilter);
  localStorage.setItem('mv_order', state.chapterOrder);
  localStorage.setItem('mv_proxy', state.proxy ? '1' : '0');
  localStorage.setItem('mv_readlater', JSON.stringify(state.readLater));
};
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}
applyTheme();
// fetch remote defaults (data saver, image proxy) once
fetch('/api/config').then((r) => r.json()).then((cfg) => {
  if (localStorage.getItem('mv_saver') === null && cfg.reader && cfg.reader.dataSaverDefault !== undefined) state.dataSaver = !!cfg.reader.dataSaverDefault;
  if (localStorage.getItem('mv_proxy') === null && cfg.reader && cfg.reader.imageProxyEnabled !== undefined) state.proxy = !!cfg.reader.imageProxyEnabled;
}).catch(() => {});

/* ---------------- helpers ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(msg) {
  const tEl = $('#toast');
  tEl.textContent = msg;
  tEl.classList.remove('hidden');
  clearTimeout(tEl._tm);
  tEl._tm = setTimeout(() => tEl.classList.add('hidden'), 2200);
}
async function api(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
const mangaTitle = (m, lang = state.lang) => m.attributes.title[lang] || m.attributes.title.en || m.attributes.title.ar || Object.values(m.attributes.title)[0] || '—';
const mangaAlt = (m) => m.attributes.title.en && m.attributes.title.ar ? m.attributes.title.en : (m.attributes.altTitles || []).map((a) => Object.values(a)[0]).find(Boolean) || '';
const mangaDesc = (m) => m.attributes.description[state.lang] || m.attributes.description.en || m.attributes.description.ar || '';
const coverUrl = (m, thumb = true) => {
  const rel = (m.relationships || []).find((r) => r.type === 'cover_art');
  if (!rel || !rel.attributes) return '';
  return proxyImg(`https://uploads.mangadex.org/covers/${m.id}/${rel.attributes.fileName}${thumb ? '.256.jpg' : ''}`);
};
// route any remote image through our CDN proxy (bypasses ISP/referer blocks)
function proxyImg(url) {
  if (!url) return '';
  if (state.proxy && /^https?:\/\//.test(url)) return '/img/' + encodeURIComponent(url);
  return url;
}
const typeLabel = (m) => ({ manga: 'مانجا / Manga', manhua: 'مانها / Manhua', manhwa: 'مانهوا / Manhwa' }[m.attributes.publicationDemographic] || m.attributes.tags?.map((tg) => tg.attributes.name.en).find((n) => ['Web Comic', 'Manhwa', 'Manhua', 'Manga'].includes(n)) || m.attributes.originalLanguage);
const statusLabel = (s) => ({ ongoing: 'مستمرة', completed: 'مكتملة', cancelled: 'ملغاة', hiatus: 'متوقفة' }[s] || s || '—');
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString(state.lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');
const pageUrl = (atHome, file, saver) => {
  const full = `${atHome.baseUrl}/${saver ? 'data-saver' : 'data'}/${atHome.chapter.hash}/${file}`;
  return state.proxy ? '/img/' + encodeURIComponent(full) : full;
};
// natural order: 1, 1.5, 2, 2.5, 10 ... (no "10 < 2" bugs)
function naturalCmp(a, b) {
  const pa = String(a).split(/(\d+)/), pb = String(b).split(/(\d+)/);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || '', y = pb[i] || '';
    if (x === y) continue;
    const nx = parseInt(x, 10), ny = parseInt(y, 10);
    if (!isNaN(nx) && !isNaN(ny)) return nx - ny;
    return x.localeCompare(y);
  }
  return 0;
}
function sortChapters(list) {
  return [...list].sort((a, b) => {
    const na = a.attributes.chapter ?? '', nb = b.attributes.chapter ?? '';
    const c = naturalCmp(na, nb);
    if (c !== 0) return c;
    return new Date(a.attributes.publishAt) - new Date(b.attributes.publishAt);
  });
}
// fetch ALL chapters of a work (paginated, cap 1200)
async function fetchAllChapters(id, lang) {
  let all = [], offset = 0, total = null;
  do {
    const res = await api(`/api/manga/${id}/feed?lang=${lang}&offset=${offset}`);
    const batch = res.data || [];
    all = all.concat(batch);
    total = res.total;
    offset += 100;
    if (!batch.length || all.length >= 1200) break;
  } while (all.length < total);
  return sortChapters(all);
}
const spinner = () => '<div class="loader"><div class="spinner"></div><div>' + t('loading') + '</div></div>';

/* ---------------- lang & nav ---------------- */
function applyLang() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  $('#langToggle').textContent = state.lang === 'ar' ? 'EN' : 'ع';
  document.querySelectorAll('[data-nav]').forEach((a) => (a.textContent = t(a.dataset.nav)));
  document.querySelectorAll('[data-i18n]').forEach((e) => (e.textContent = t(e.dataset.i18n)));
}
$('#langToggle').addEventListener('click', () => {
  state.lang = state.lang === 'ar' ? 'en' : 'ar';
  save(); applyLang(); updateUserChip(); route();
});
window.addEventListener('hashchange', route);

/* ---------------- router ---------------- */
async function route() {
  if (window.scrollTo) window.scrollTo(0, 0);
  const hash = location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = hash.split('?');
  const params = new URLSearchParams(queryPart || '');
  const seg = pathPart.split('/').filter(Boolean);
  document.querySelectorAll('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.nav === (seg[0] || 'home')));
  const app = $('#app');
  try {
    if (!seg[0] || seg[0] === 'home') await viewHome(app);
    else if (seg[0] === 'search') viewSearch(app, params.get('q') || '');
    else if (seg[0] === 'manga') await viewManga(app, seg[1]);
    else if (seg[0] === 'reader') await viewReader(app, seg[1], params.get('manga'), params.get('lang'));
    else if (seg[0] === 'library') viewLibrary(app);
    else if (seg[0] === 'new') viewNewWorks(app);
    else if (seg[0] === 'anime' && seg[1]) viewAnimeDetail(app, seg[1]);
    else if (seg[0] === 'anime') viewAnime(app);
    else if (seg[0] === 'profile') viewProfile(app);
    else if (seg[0] === 'history') viewHistory(app);
    else if (seg[0] === 'readlater') viewReadLater(app);
    else if (seg[0] === 'notifications') viewNotifications(app);
    else if (seg[0] === 'faq') viewStatic(app, t('faq'), legalContent('faq'));
    else if (seg[0] === 'privacy') viewStatic(app, t('privacy'), legalContent('privacy'));
    else if (seg[0] === 'terms') viewStatic(app, t('terms'), legalContent('terms'));
    else { app.innerHTML = ''; viewHome(app); }
  } catch (e) {
    console.error(e);
    app.innerHTML = `<div class="empty-state"><div class="big">😵</div><div>${t('error')}</div></div>`;
  }
}

/* ---------------- cards ---------------- */
let ratingsMap = {}; // source_id -> {rating, chapters} for synced catalog works
function isNew(m) {
  try {
    const upd = m.attributes.updatedAt || m.attributes.latestUploadedChapter;
    return upd && Date.now() - new Date(upd).getTime() < 7 * 86400000;
  } catch { return false; }
}
function mangaCard(m) {
  const c = el('a', 'card', '');
  c.href = `#/manga/${m.id}`;
  const info = ratingsMap[m.id] || {};
  const lastCh = m.attributes.lastChapter || info.chapters;
  c.innerHTML = `
    ${isNew(m) ? '<span class="new-badge">NEW</span>' : ''}
    <img loading="lazy" src="${coverUrl(m) || ''}" alt="${esc(mangaTitle(m))}" onerror="this.style.visibility='hidden'">
    <div class="card-body">
      <div class="card-title">${esc(mangaTitle(m))}</div>
      <div class="star-row">
        ${info.rating ? `<span class="star">★</span><span class="val">${info.rating}</span>` : ''}
        ${lastCh ? `<span class="ch">· ${t('chapter')} ${esc(lastCh)}</span>` : ''}
        ${!info.rating && !lastCh ? `<span class="ch">${esc(typeLabel(m) || '')}</span>` : ''}
      </div>
    </div>`;
  return c;
}

/* ---------------- home (Manga Melo style: tabs) ---------------- */
function renderContinueBar() {
  const progEntries = Object.entries(state.progress);
  const bar = $('#continueBar');
  if (!bar) return;
  if (!progEntries.length) {
    bar.innerHTML = `<div style="color:var(--text-soft);font-size:13px">${t('libraryEmpty')}</div>`;
    return;
  }
  const conts = progEntries.map(([mid, p]) => {
    const f = state.follows.find((x) => x.id === mid);
    if (!f) return null;
    return { mid, f, p };
  }).filter(Boolean).slice(0, 6);
  bar.innerHTML = conts.map(({ mid, f, p }) => `
    <a class="continue-card" href="#/manga/${mid}">
      <img loading="lazy" src="${proxyImg(f.cover)}" onerror="this.style.visibility='hidden'">
      <div><div class="cc-t">${esc(f.title)}</div><div class="cc-m">${t('chapter')} ${esc(p.chapterTitle || p.chapterIndex + 1)} · ${Math.min(100, Math.round(((p.pageIndex + 1) / (p.totalPages || 1)) * 100))}٪</div></div>
    </a>`).join('');
}

async function viewHome(app) {
  const tab = state.homeTab;
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));

  if (tab === 'anime') { viewAnime(app); return; }

  if (tab === 'downloads') {
    // downloads / offline queue view
    const progEntries = Object.entries(state.progress);
    app.innerHTML = `
      <h1 class="section-title">${t('downloadsTitle')}</h1>
      <div class="admin-panel" style="margin-bottom:14px">
        <p style="font-size:13.5px;color:var(--text-soft)">${t('downloadsNote')}</p>
        <a class="d-apk" style="margin:10px 0 0" href="/builds/latest.apk">${t('downloadApp')}</a>
      </div>
      <h1 class="section-title">${t('historyTitle')}</h1>
      <div id="dlList"></div>`;
    const box = $('#dlList');
    if (!progEntries.length) {
      box.innerHTML = `<div class="empty-state"><div class="big">📥</div><div>${t('historyEmpty')}</div></div>`;
    } else {
      box.innerHTML = progEntries.map(([mid, p]) => {
        const f = state.follows.find((x) => x.id === mid);
        const ch = p.chapterId;
        return `<a class="ch-feed-item" href="#/reader/${ch}?manga=${mid}">
          <img loading="lazy" src="${proxyImg(f ? f.cover : '')}" onerror="this.style.visibility='hidden'">
          <div style="flex:1;min-width:0">
            <div class="cf-t">${esc(f ? f.title : mid)}</div>
            <div class="cf-m">${t('chapter')} ${esc(p.chapterTitle || p.chapterIndex + 1)} · ${Math.min(100, Math.round(((p.pageIndex + 1) / (p.totalPages || 1)) * 100))}٪</div>
          </div><span class="cf-m">▶</span></a>`;
      }).join('');
    }
    return;
  }

  const isPopular = tab === 'popular';
  app.innerHTML = `
    ${isPopular ? '<div class="slider" id="homeSlider"></div>' : ''}
    <h1 class="section-title">${t('continueReading')}</h1>
    <div id="continueBar" class="continue-bar"></div>
    <div class="type-tabs" id="typeTabs">
      <button class="type-tab active" data-type="">${t('allTypes')}</button>
      <button class="type-tab" data-type="manga">مانجا</button>
      <button class="type-tab" data-type="manhwa">مانهوا</button>
      <button class="type-tab" data-type="manhua">مانها</button>
    </div>
    ${isPopular
      ? `<h1 class="section-title">${t('tabPopular')}</h1><div id="gridTrending" class="grid">${spinner()}</div>`
      : `<h1 class="section-title">${t('latestChapters')}</h1><div id="latestChapters"></div>
         <h1 class="section-title">${t('tabLatest')}</h1><div id="gridLatest" class="grid">${spinner()}</div>`}`;

  renderContinueBar();

  let activeType = '';
  $('#typeTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.type-tab');
    if (!btn) return;
    activeType = btn.dataset.type;
    $('#typeTabs').querySelectorAll('.type-tab').forEach((b) => b.classList.toggle('active', b === btn));
    applyTypeFilter();
  });
  let trendAll = [], latestAll = [];
  function typeOf(m) {
    // reliable: use original language (ja -> manga, ko -> manhwa, zh -> manhua)
    const lang = (m.attributes.originalLanguage || '').toLowerCase();
    if (lang === 'ko') return 'manhwa';
    if (lang === 'zh' || lang === 'zh-hk' || lang === 'zh-hans' || lang === 'zh-hant') return 'manhua';
    if (lang === 'ja') return 'manga';
    // fallback: tags
    const tl = typeLabel(m) || '';
    if (/manhwa/i.test(tl)) return 'manhwa';
    if (/manhua/i.test(tl)) return 'manhua';
    if (/manga/i.test(tl)) return 'manga';
    return '';
  }
  function applyTypeFilter() {
    const f = (list) => (activeType ? list.filter((m) => typeOf(m) === activeType) : list);
    const g1 = $('#gridTrending'), g2 = $('#gridLatest');
    if (g1) { g1.innerHTML = ''; f(trendAll).forEach((m) => g1.append(mangaCard(m))); }
    if (g2) { g2.innerHTML = ''; f(latestAll).forEach((m) => g2.append(mangaCard(m))); }
  }

  try {
    const jobs = [
      api(`/api/trending?lang=${state.lang}`),
      api(`/api/latest?lang=${state.lang}`),
      api(`/api/catalog/latest-chapters?limit=10`),
    ];
    const [tr, lt, lc] = await Promise.all(jobs);
    trendAll = tr.data || [];
    latestAll = lt.data || [];
    // enrich cards with ratings/chapter counts from local catalog
    const ids = [...trendAll, ...latestAll].map((m) => m.id).filter(Boolean).join(',');
    if (ids) {
      try { ratingsMap = (await api(`/api/catalog/by-ids?ids=${encodeURIComponent(ids)}`)).data || {}; } catch {}
    }
    applyTypeFilter();

    if (isPopular) {
      const slides = (tr.data || []).slice(0, 8);
      const slider = $('#homeSlider');
      if (slider) {
        slider.innerHTML = `
          <div class="slider-track" id="sliderTrack">
            ${slides.map((m) => `
              <a class="slide" href="#/manga/${m.id}" style="display:block">
                <img src="${coverUrl(m, false)}" onerror="this.src='${coverUrl(m)}'" alt="">
                <div class="slide-info"><h3>${esc(mangaTitle(m))}</h3><p>${esc(typeLabel(m) || '')}</p></div>
              </a>`).join('')}
          </div>
          <button class="slider-arrow prev" id="slPrev">‹</button>
          <button class="slider-arrow next" id="slNext">›</button>
          <div class="slider-dots" id="slDots">${slides.map((_, i) => `<span data-i="${i}"></span>`).join('')}</div>`;
        if (slides.length > 1) {
          let cur = 0, timer = null;
          const track = $('#sliderTrack');
          const go = (i) => {
            cur = (i + slides.length) % slides.length;
            track.style.transform = `translateX(${cur * 100}%)`;
            $('#slDots').querySelectorAll('span').forEach((d, di) => d.classList.toggle('active', di === cur));
          };
          const start = () => { clearInterval(timer); timer = setInterval(() => go(cur + 1), 5000); };
          $('#slNext').addEventListener('click', () => { go(cur + 1); start(); });
          $('#slPrev').addEventListener('click', () => { go(cur - 1); start(); });
          $('#slDots').querySelectorAll('span').forEach((d) => d.addEventListener('click', () => { go(+d.dataset.i); start(); }));
          go(0); start();
        }
      }
    } else {
      const chBox = $('#latestChapters');
      if (chBox) {
        if (lc.data && lc.data.length) {
          chBox.innerHTML = lc.data.map((c) => `
            <a class="ch-feed-item" href="#/reader/${c.chapterId}?manga=${c.mangaId}">
              <img loading="lazy" src="${proxyImg(c.cover)}" onerror="this.style.visibility='hidden'">
              <div style="flex:1;min-width:0">
                <div class="cf-t">${esc(c.title)}</div>
                <div class="cf-m">${t('chapter')} ${esc(c.chapterNumber)} · ${esc(c.type || '')} · ${fmtDate(c.publishedAt)}</div>
              </div>
              <span class="cf-m">▶</span>
            </a>`).join('');
        } else {
          chBox.innerHTML = `<div style="color:var(--text-soft);font-size:13px">${t('noChapters')}</div>`;
        }
      }
    }
  } catch (e) {
    const g1 = $('#gridTrending'), g2 = $('#gridLatest');
    if (g1) g1.innerHTML = `<div class="empty-state">${t('error')}</div>`;
    if (g2) g2.innerHTML = '';
  }
}

/* ---------------- search ---------------- */
function viewSearch(app, q) {
  const catManga = (m) => ({
    id: m.id, title: m.title, cover: m.cover, meta: `${m.type || ''}${m.rating ? ' · ⭐' + m.rating : ''}`,
  });
  const cardFrom = (m) => {
    const c = el('a', 'card', '');
    c.href = `#/manga/${m.id}`;
    c.innerHTML = `
      <img loading="lazy" src="${proxyImg(m.cover)}" alt="" onerror="this.style.visibility='hidden'">
      <div class="card-body">
        <div class="card-title">${esc(m.title || m.meta || '')}</div>
        <div class="card-meta">${esc(m.meta || '')}</div>
      </div>`;
    return c;
  };
  app.innerHTML = `
    <h1 class="section-title">${t('searchTitle')}</h1>
    <div class="searchbar">
      <input id="searchInput" type="search" value="${esc(q)}" placeholder="${t('searchPlaceholder')}">
      <button id="searchBtn">${t('searchBtn')}</button>
    </div>
    <div class="filter-row" id="filterRow">
      <select id="fStatus"><option value="">${t('filterStatus')}</option><option value="ongoing">${t('stOngoing')}</option><option value="completed">${t('stCompleted')}</option><option value="hiatus">${t('stHiatus')}</option><option value="cancelled">${t('stCancelled')}</option></select>
      <select id="fType"><option value="">${t('filterType')}</option><option value="manga">مانجا</option><option value="manhwa">مانهوا</option><option value="manhua">مانها</option></select>
      <select id="fSource"><option value="">${t('srcAll')}</option><option value="mangadex">MangaDex</option><option value="comick">Comick</option></select>
      <select id="fRating"><option value="0">${t('rtAll')}</option><option value="8">8+</option><option value="7">7+</option><option value="6">6+</option></select>
      <select id="fSort"><option value="rating">${t('sortRating')}</option><option value="title">${t('sortTitle')}</option><option value="date">${t('updated')}</option></select>
    </div>
    <div id="searchResults" class="grid"></div>`;
  $('#searchBtn').addEventListener('click', doSearch);
  $('#searchInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  $('#filterRow').querySelectorAll('select').forEach((s) => s.addEventListener('change', doSearch));
  if (q) doSearch();
  async function doSearch() {
    const v = $('#searchInput').value.trim();
    if (!v) return;
    location.hash = `#/search?q=${encodeURIComponent(v)}`;
    $('#searchResults').innerHTML = `<div class="empty-state">${spinner()}</div>`;
    const fStatus = $('#fStatus').value, fType = $('#fType').value, fSource = $('#fSource').value;
    const fRating = $('#fRating').value, fSort = $('#fSort').value;
    try {
      // advanced: local catalog first (supports filters); fallback to live MangaDex
      const params = new URLSearchParams({ q: v, lang: state.lang });
      if (fStatus) params.set('status', fStatus);
      if (fType) params.set('type', fType);
      if (fSource) params.set('source', fSource);
      if (fRating && +fRating > 0) params.set('minRating', fRating);
      if (fSort) params.set('sort', fSort === 'date' ? 'date' : fSort);
      let cat = null;
      try { cat = await api(`/api/catalog/search?${params}`); } catch {}
      const hasFilters = fStatus || fType || fSource || (fRating && +fRating > 0);
      if (cat && (cat.data.length > 0 || hasFilters)) {
        $('#searchResults').innerHTML = '';
        if (!cat.data.length) {
          $('#searchResults').innerHTML = `<div class="empty-state"><div class="big">🔍</div><div>${t('noResults')}</div></div>`;
          return;
        }
        cat.data.forEach((m) => $('#searchResults').append(cardFrom(catManga(m))));
        return;
      }
      const res = await api(`/api/search?q=${encodeURIComponent(v)}&lang=${state.lang}`);
      $('#searchResults').innerHTML = '';
      if (!res.data || !res.data.length) {
        $('#searchResults').innerHTML = `<div class="empty-state"><div class="big">🔍</div><div>${t('noResults')}</div><div style="font-size:13px;margin-top:6px">${t('tryAgain')}</div></div>`;
        return;
      }
      res.data.forEach((m) => $('#searchResults').append(mangaCard(m)));
    } catch (e) {
      $('#searchResults').innerHTML = `<div class="empty-state">${t('error')}</div>`;
    }
  }
}

/* ---------------- manga detail (dual language with auto-fallback) ---------------- */
async function viewManga(app, id) {
  if (!id) return viewHome(app);
  app.innerHTML = spinner();
  const [m, arList, enList] = await Promise.all([
    api(`/api/manga/${id}`),
    fetchAllChapters(id, 'ar').catch(() => []),
    fetchAllChapters(id, 'en').catch(() => []),
  ]);
  if (m.result !== 'ok') throw new Error('not found');
  const manga = m.data;
  const isFollowed = state.follows.some((f) => f.id === id);
  const prog = state.progress[id];
  const tags = (manga.attributes.tags || []).slice(0, 8);

  // language picker with automatic fallback (Arabic missing -> English and vice versa)
  let lang = state.lang === 'ar' ? 'ar' : 'en';
  let fallback = false;
  if (!arList.length && enList.length) { lang = 'en'; fallback = state.lang === 'ar'; }
  else if (!enList.length && arList.length) { lang = 'ar'; fallback = state.lang === 'en'; }
  const chapters = () => (lang === 'ar' ? arList : enList);

  app.innerHTML = `
    <div class="detail-top">
      <img class="detail-cover" src="${coverUrl(manga, false)}" alt="" onerror="this.src='${coverUrl(manga)}'">
      <div class="detail-info">
        <h1>${esc(mangaTitle(manga))}</h1>
        <div class="detail-alt">${esc(mangaAlt(manga))}</div>
        <div class="tag-row">
          <span class="tag">${esc(typeLabel(manga) || t('type'))}</span>
          <span class="tag">${t('status')}: ${esc(statusLabel(manga.attributes.status))}</span>
          ${tags.map((tg) => `<span class="tag">${esc(tg.attributes.name[state.lang] || tg.attributes.name.en)}</span>`).join('')}
        </div>
        <div class="actions" id="mangaActions"></div>
        ${mangaDesc(manga) ? `<div class="detail-desc">${esc(mangaDesc(manga))}</div>` : ''}
      </div>
    </div>
    <div class="type-tabs" id="langSel" style="margin-top:16px;align-items:center">
      <span class="chip" style="align-self:center">${t('readIn')}:</span>
      <button class="type-tab" data-lang="ar">العربية (${arList.length})</button>
      <button class="type-tab" data-lang="en">English (${enList.length})</button>
    </div>
    <div id="langNotice"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <h1 class="section-title" style="margin:16px 0 8px">${t('chaptersList')} <span id="chCount"></span></h1>
      <button class="icon-btn" id="orderBtn" style="margin-bottom:10px">${state.chapterOrder === 'asc' ? '↑ ' + t('orderAsc') : '↓ ' + t('orderDesc')}</button>
    </div>
    <div id="chaptersBox" class="chapter-list"></div>`;

  const bindFollowLater = () => {
    const fb = $('#followBtn');
    if (fb) fb.addEventListener('click', () => {
      const idx = state.follows.findIndex((f) => f.id === id);
      if (idx >= 0) {
        state.follows.splice(idx, 1);
        $('#followBtn').textContent = t('follow');
        toast(t('follow'));
      } else {
        state.follows.unshift({ id, title: mangaTitle(manga), cover: coverUrl(manga), type: typeLabel(manga) || '' });
        $('#followBtn').textContent = t('unfollow');
        toast(t('unfollow'));
      }
      save();
    });
    const lb = $('#laterBtn');
    if (lb) lb.addEventListener('click', () => {
      const idx = state.readLater.findIndex((x) => x.id === id);
      if (idx >= 0) {
        state.readLater.splice(idx, 1);
        $('#laterBtn').textContent = t('readLaterAdd');
      } else {
        state.readLater.unshift({ id, title: mangaTitle(manga), cover: coverUrl(manga) });
        $('#laterBtn').textContent = t('readLaterRemove');
      }
      save();
    });
  };

  const displayed = () => (state.chapterOrder === 'desc' ? [...chapters()].reverse() : chapters());
  const renderList = () => {
    const box = $('#chaptersBox');
    if (!box) return;
    box.innerHTML = '';
    const chs = chapters();
    if (!chs.length) {
      box.innerHTML = `<div class="empty-state"><div class="big">📭</div><div>${t('noChapters')}</div></div>`;
      return;
    }
    renderChapters(box, displayed(), id, 30, null, lang);
    const loadMoreBtn = el('button', 'btn', t('loadMore'));
    loadMoreBtn.style.marginTop = '8px';
    box.append(loadMoreBtn);
    loadMoreBtn.addEventListener('click', () => renderChapters(box, displayed(), id, 30, loadMoreBtn, lang));
  };

  const render = () => {
    const chs = chapters();
    const continueChapter = prog ? chs.find((c) => c.id === prog.chapterId) || chs[0] : null;
    let readNowChapter = null;
    if (chs.length) {
      if (prog) {
        const savedIdx = chs.findIndex((c) => c.id === prog.chapterId);
        readNowChapter = chs[savedIdx >= 0 && savedIdx + 1 < chs.length ? savedIdx + 1 : savedIdx];
      } else {
        readNowChapter = chs[0];
      }
    }
    const acts = $('#mangaActions');
    if (acts) {
      acts.innerHTML = `
        ${readNowChapter ? `<a class="btn primary" href="#/reader/${readNowChapter.id}?manga=${id}&lang=${lang}">${t('readNow')}</a>` : ''}
        ${continueChapter && continueChapter.id !== readNowChapter?.id ? `<a class="btn" href="#/reader/${continueChapter.id}?manga=${id}&lang=${lang}">▶ ${t('continueReading')}</a>` : ''}
        <button id="followBtn" class="btn">${isFollowed ? t('unfollow') : t('follow')}</button>
        <button id="laterBtn" class="btn">${state.readLater.some((x) => x.id === id) ? t('readLaterRemove') : t('readLaterAdd')}</button>`;
      bindFollowLater();
    }
    const cc = $('#chCount');
    if (cc) cc.textContent = `(${chs.length} ${t('chapters')})`;
    $('#langNotice').innerHTML = fallback ? `<div class="lang-notice">${lang === 'en' ? t('langNoticeAr') : t('langNoticeEn')}</div>` : '';
    document.querySelectorAll('#langSel .type-tab').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    renderList();
  };

  // language switch
  $('#langSel').addEventListener('click', (e) => {
    const btn = e.target.closest('.type-tab');
    if (!btn) return;
    lang = btn.dataset.lang;
    fallback = false;
    render();
  });

  $('#orderBtn').addEventListener('click', () => {
    state.chapterOrder = state.chapterOrder === 'asc' ? 'desc' : 'asc';
    save();
    $('#orderBtn').textContent = state.chapterOrder === 'asc' ? '↑ ' + t('orderAsc') : '↓ ' + t('orderDesc');
    renderList();
  });

  render();

  // community: comments on the work itself
  const commentsBox = el('div', 'comments', '');
  app.append(commentsBox);
  renderComments(commentsBox, 'manga', id);
}

function renderChapters(box, chapters, mangaId, perPage = 30, moreBtn, lang = '') {
  if (moreBtn) moreBtn.remove();
  const current = state.progress[mangaId]?.chapterId;
  chapters.slice(0, perPage).forEach((ch, i) => {
    const item = el('a', 'chapter-item', '');
    item.href = `#/reader/${ch.id}?manga=${mangaId}${lang ? `&lang=${lang}` : ''}`;
    const num = ch.attributes.chapter ? `${t('chapter')} ${ch.attributes.chapter}` : `#${i + 1}`;
    item.innerHTML = `
      <div class="ch-num">${esc(num)}</div>
      <div class="ch-title">${esc(ch.attributes.title || '')}</div>
      <div class="ch-date">${fmtDate(ch.attributes.publishAt)}</div>`;
    if (ch.id === current) item.style.borderColor = 'var(--brand)';
    box.append(item);
  });
}

/* ---------------- library (all catalog works + user follows) ---------------- */
function catalogCard(w) {
  const c = el('a', 'card', '');
  c.href = `#/manga/${w.id}`;
  const typeAr = w.type ? ({ manga: 'مانجا', manhwa: 'مانهوا', manhua: 'مانها' }[w.type.toLowerCase()] || w.type) : '';
  c.innerHTML = `
    <img loading="lazy" src="${proxyImg(w.cover)}" alt="" onerror="this.style.visibility='hidden'">
    <div class="card-body">
      <div class="card-title">${esc(w.title)}</div>
      <div class="star-row">
        ${w.rating ? `<span class="star">★</span><span class="val">${w.rating}</span>` : ''}
        ${w.chapters ? `<span class="ch">· ${t('chapter')} ${w.chapters}</span>` : ''}
        ${typeAr ? `<span class="ch">· ${esc(typeAr)}</span>` : ''}
      </div>
    </div>`;
  return c;
}
function viewLibrary(app) {
  let libTab = 'all';
  const render = async () => {
    if (libTab === 'all') {
      app.innerHTML = `
        <div class="lib-head">
          <h1 class="section-title" style="margin:0">${t('libraryTitle')}</h1>
        </div>
        <div class="type-tabs" id="libTabs">
          <button class="type-tab active" data-tab="all">📚 ${t('allWorks')}</button>
          <button class="type-tab" data-tab="mine">❤️ ${t('myFollows')} (${state.follows.length})</button>
        </div>
        <p style="color:var(--text-soft);font-size:13px;margin:0 0 10px">${t('libraryAllNote')}</p>
        <div id="libGrid" class="grid"></div>`;
      $('#libTabs').addEventListener('click', (e) => {
        const b = e.target.closest('.type-tab');
        if (!b) return;
        libTab = b.dataset.tab;
        render();
      });
      const grid = $('#libGrid');
      let offset = 0, total = 0;
      const loadPage = async (reset) => {
        if (reset) { offset = 0; grid.innerHTML = `<div class="empty-state">${spinner()}</div>`; }
        try {
          const res = await api(`/api/catalog/search?limit=60&offset=${offset}&sort=rating`);
          total = res.total || 0;
          if (reset) grid.innerHTML = '';
          (res.data || []).forEach((w) => grid.append(catalogCard(w)));
          offset += (res.data || []).length;
          const moreBtn = $('#moreBtn');
          if (offset < total && !moreBtn) {
            const btn = el('button', 'btn', `${t('loadMore')} (${total - offset})`);
            btn.id = 'moreBtn';
            btn.style.margin = '12px auto';
            btn.style.display = 'block';
            app.append(btn);
            btn.addEventListener('click', () => { btn.remove(); loadPage(false); });
          } else if (offset >= total && moreBtn) moreBtn.remove();
          if (offset === 0 && !total) {
            grid.innerHTML = `<div class="empty-state"><div class="big">📚</div><div>${t('libraryEmpty')}</div></div>`;
          }
        } catch {
          grid.innerHTML = `<div class="empty-state">${t('error')}</div>`;
        }
      };
      loadPage(true);
      return;
    }
    // my follows
    app.innerHTML = `
      <div class="lib-head">
        <h1 class="section-title" style="margin:0">${t('myFollows')}</h1>
        ${state.follows.length ? `<button id="clearLib" class="btn ghost">${t('clearAll')}</button>` : ''}
      </div>
      <div id="libGrid" class="grid" style="margin-top:16px"></div>`;
    const cl = $('#clearLib');
    if (cl) cl.addEventListener('click', () => {
      if (confirm(t('clearAll') + '?')) { state.follows = []; state.progress = {}; save(); route(); }
    });
    const grid = $('#libGrid');
    if (!state.follows.length) {
      grid.innerHTML = `<div class="empty-state"><div class="big">❤️</div><div>${t('libraryEmpty')}</div><div style="font-size:13px;margin-top:6px">${t('libraryEmptySub')}</div></div>`;
      return;
    }
    state.follows.forEach((f) => {
      const c = el('a', 'card', '');
      c.href = `#/manga/${f.id}`;
      const prog = state.progress[f.id];
      const pct = prog ? Math.min(100, Math.round(((prog.pageIndex + 1) / (prog.totalPages || 1)) * 100)) : 0;
      c.innerHTML = `
        <img loading="lazy" src="${proxyImg(f.cover)}" alt="" onerror="this.style.visibility='hidden'">
        <div class="card-body">
          <div class="card-title">${esc(f.title)}</div>
          <div class="card-meta">${prog ? `${t('continueTag')} · ${pct}٪` : esc(f.type || '')}</div>
        </div>`;
      grid.append(c);
    });
  };
  render();
}

/* ---------------- new works ---------------- */
async function viewNewWorks(app) {
  app.innerHTML = `
    <h1 class="section-title">✨ ${t('newWorksTitle')}</h1>
    <p style="color:var(--text-soft);font-size:13px;margin-bottom:12px">${t('libraryAllNote')}</p>
    <div id="newGrid" class="grid">${spinner()}</div>`;
  const grid = $('#newGrid');
  try {
    const res = await api('/api/catalog/search?sort=date&limit=60');
    grid.innerHTML = '';
    if (!res.data || !res.data.length) {
      grid.innerHTML = `<div class="empty-state"><div class="big">✨</div><div>${t('noChapters')}</div></div>`;
      return;
    }
    res.data.forEach((w) => grid.append(catalogCard(w)));
  } catch {
    grid.innerHTML = `<div class="empty-state">${t('error')}</div>`;
  }
}

/* ---------------- reader ---------------- */
let pageObserver = null, saveTimer = null;

async function viewReader(app, chapterId, mangaId, langParam) {
  if (!chapterId) return viewHome(app);
  const mangaInfo = mangaId && state.follows.find((f) => f.id === mangaId)
    ? state.follows.find((f) => f.id === mangaId) : null;

  app.innerHTML = `
    <div class="reader-toolbar">
      <a class="icon-btn" href="#/home" title="${t('menuHome')}">🏠</a>
      <a class="icon-btn" href="${mangaId ? `#/manga/${mangaId}` : '#/library'}">←</a>
      <div class="rt-title" id="rtTitle"></div>
      <button class="icon-btn" id="cmtBtn">💬</button>
      <button class="icon-btn" id="filterBtn" title="${t('readerFilterLabel')}">◐</button>
      <button class="icon-btn" id="chListBtn">☰ ${t('chapterList')}</button>
      <button class="icon-btn" id="modeBtn"></button>
      <button class="icon-btn" id="saverBtn"></button>
      <button class="icon-btn" id="autoBtn"></button>
    </div>
    <div id="pageContainer">
      <div id="pages" class="pages-scroller filter-${state.rFilter}"></div>
      <div class="page-status" id="pageStatus"></div>
    </div>
    <div id="drawerRoot"></div>`;

  const pagesEl = $('#pages'), statusEl = $('#pageStatus');
  const applyFilter = () => {
    pagesEl.className = `pages-scroller${state.reader.mode === 'paged' ? ' paged' : ''} filter-${state.rFilter}`;
    $('#filterBtn').textContent = state.rFilter === 'original' ? '◐' : state.rFilter === 'mono' ? '⬛' : '🟤';
  };
  $('#filterBtn').addEventListener('click', () => {
    state.rFilter = state.rFilter === 'original' ? 'mono' : state.rFilter === 'mono' ? 'sepia' : 'original';
    save();
    applyFilter();
  });
  const updateBtns = () => {
    $('#modeBtn').textContent = state.reader.mode === 'paged' ? `▤ ${t('pagedMode')}` : `▥ ${t('webtoonMode')}`;
    $('#modeBtn').classList.toggle('active', state.reader.mode === 'paged');
    $('#saverBtn').textContent = `☁ ${t('dataSaver')}`;
    $('#saverBtn').classList.toggle('active', state.dataSaver);
    $('#autoBtn').textContent = `⇄ ${t('autoNext')}`;
    $('#autoBtn').classList.toggle('active', state.autoNext);
  };

  $('#modeBtn').addEventListener('click', () => {
    state.reader.mode = state.reader.mode === 'paged' ? 'webtoon' : 'paged';
    updateBtns(); renderPages();
  });
  $('#saverBtn').addEventListener('click', () => {
    state.dataSaver = !state.dataSaver; save(); updateBtns();
    state.reader.urls = null; loadChapter(state.reader.idx);
  });
  $('#autoBtn').addEventListener('click', () => {
    state.autoNext = !state.autoNext; save(); updateBtns();
  });

  // fetch manga + ALL chapters (paginated) in the requested language
  const readerLang = (langParam || state.lang || 'en') === 'ar' ? 'ar' : 'en';
  const [mangaRes, feedRes] = await Promise.all([
    mangaId ? api(`/api/manga/${mangaId}`).catch(() => null) : Promise.resolve(null),
    mangaId ? fetchAllChapters(mangaId, readerLang).catch(() => []) : Promise.resolve([]),
  ]);
  let chapters = feedRes;
  let idx = chapters.findIndex((c) => c.id === chapterId);
  if (idx < 0 && mangaId) {
    // chapter belongs to the other language — fetch it so navigation stays correct
    const other = readerLang === 'ar' ? 'en' : 'ar';
    const otherChapters = await fetchAllChapters(mangaId, other).catch(() => []);
    const otherIdx = otherChapters.findIndex((c) => c.id === chapterId);
    if (otherIdx >= 0) {
      chapters = otherChapters;
      idx = otherIdx;
    }
  }
  if (idx < 0) idx = 0;
  const manga = mangaRes && mangaRes.data;

  state.reader = {
    mode: 'webtoon', mangaId, chapters, idx, urls: null, loaded: new Map(), appended: [],
    title: manga ? mangaTitle(manga) : (mangaInfo?.title || t('reader')),
  };
  updateBtns();
  $('#cmtBtn').addEventListener('click', () => {
    const root = $('#drawerRoot');
    root.innerHTML = `
      <div class="drawer-backdrop">
        <div class="drawer">
          <h3>💬 ${t('comments')}</h3>
          <div id="cmtList"></div>
        </div>
      </div>`;
    renderComments($('#cmtList'), 'chapter', chapterId);
    $('.drawer-backdrop').addEventListener('click', (e) => { if (e.target.classList.contains('drawer-backdrop')) root.innerHTML = ''; });
  });
  $('#chListBtn').addEventListener('click', openDrawer);

  async function loadChapter(i, append = false) {
    if (i < 0 || i >= state.reader.chapters.length) return;
    state.reader.idx = i;
    const ch = state.reader.chapters[i];
    $('#rtTitle').textContent = `${state.reader.title} — ${ch.attributes.chapter ? t('chapter') + ' ' + ch.attributes.chapter : '#' + (i + 1)}`;
    if (!state.reader.urls || !append) {
      try {
        const atHome = await api(`/api/chapter/${ch.id}`);
        state.reader.urls = (state.dataSaver ? atHome.chapter.dataSaver : atHome.chapter.data).map((f) => pageUrl(atHome, f, state.dataSaver));
        state.reader.totalPages = state.reader.urls.length;
      } catch (e) {
        statusEl.textContent = t('error');
        return;
      }
      if (!append) {
        pagesEl.innerHTML = '';
        state.reader.loaded.clear();
        state.reader.appended = [];
      }
    }
    const urls = state.reader.urls;
    const frag = document.createDocumentFragment();
    if (append) frag.append(el('div', 'chapter-divider', `${t('chapter')} ${ch.attributes.chapter || i + 1}`));
    const wrapCls = state.reader.mode === 'paged' ? 'page-wrap' : '';
    urls.forEach((u, p) => {
      const w = el('div', wrapCls, '');
      const img = el('img', '', '');
      img.loading = 'lazy';
      img.alt = `${t('page')} ${p + 1}`;
      img.dataset.page = p;
      img.dataset.chapter = ch.id;
      img.src = u;
      w.append(img);
      frag.append(w);
    });
    pagesEl.append(frag);
    state.reader.loaded.set(ch.id, true);
    if (append) {
      state.reader.appended.push(ch.id);
      statusEl.textContent = `${t('chapter')} ${ch.attributes.chapter || i + 1} — ${t('endOfChapter')}`;
      observePages();
    } else {
      scrollToProgress(ch.id);
    }
    observePages();
  }

  function renderPages() {
    // re-render current chapter in new mode without refetch
    const urls = state.reader.urls || [];
    pagesEl.innerHTML = '';
    state.reader.appended = [];
    const ch = state.reader.chapters[state.reader.idx];
    const frag = document.createDocumentFragment();
    const wrapCls = state.reader.mode === 'paged' ? 'page-wrap' : '';
    urls.forEach((u, p) => {
      const w = el('div', wrapCls, '');
      const img = el('img', '', '');
      img.loading = 'lazy'; img.alt = `${t('page')} ${p + 1}`; img.dataset.page = p; img.dataset.chapter = ch.id; img.src = u;
      w.append(img); frag.append(w);
    });
    pagesEl.append(frag);
    observePages();
  }

  function observePages() {
    if (pageObserver) pageObserver.disconnect();
    const onVisible = (entries) => {
      let best = null;
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const r = en.intersectionRatio;
        if (!best || r > best.r) best = { r, img: en.target };
      });
      if (best) {
        const page = +best.img.dataset.page;
        const chId = best.img.dataset.chapter;
        saveProgress(chId, page);
        statusEl.textContent = `${t('page')} ${page + 1} / ${state.reader.urls.length}`;
        maybeAutoNext(chId, page);
      }
    };
    pageObserver = new IntersectionObserver(onVisible, { root: null, threshold: [0.2, 0.5, 0.9] });
    pagesEl.querySelectorAll('img').forEach((img) => pageObserver.observe(img));
  }

  function saveProgress(chId, page) {
    if (!state.reader.mangaId) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const idx = state.reader.chapters.findIndex((c) => c.id === chId);
      state.progress[state.reader.mangaId] = {
        chapterId: chId, chapterIndex: idx, pageIndex: page,
        totalPages: state.reader.urls.length || 1,
        chapterTitle: state.reader.chapters[idx]?.attributes.chapter || '',
      };
      save();
    }, 400);
  }

  function maybeAutoNext(chId, page) {
    if (!state.autoNext || state.reader.mode !== 'webtoon') return;
    if (page < state.reader.urls.length - 1) return;
    const nextIdx = state.reader.idx + 1;
    if (nextIdx >= state.reader.chapters.length) return;
    const next = state.reader.chapters[nextIdx];
    if (state.reader.loaded.has(next.id)) return;
    state.reader.urls = null; // force fresh at-home call for the next chapter
    loadChapter(nextIdx, true);
  }

  function scrollToProgress(chId) {
    const prog = state.progress[state.reader.mangaId];
    if (!prog || prog.chapterId !== chId) {
      if (state.reader.mode === 'paged') pagesEl.scrollLeft = 0;
      return;
    }
    requestAnimationFrame(() => {
      if (state.reader.mode === 'paged') {
        const w = pagesEl.querySelectorAll('.page-wrap')[prog.pageIndex];
        if (w) pagesEl.scrollLeft = w.offsetLeft;
      } else {
        const img = pagesEl.querySelector(`img[data-chapter="${chId}"][data-page="${prog.pageIndex}"]`);
        if (img) img.scrollIntoView({ block: 'start' });
      }
    });
  }

  function openDrawer() {
    const root = $('#drawerRoot');
    root.innerHTML = `
      <div class="drawer-backdrop">
        <div class="drawer">
          <h3>${t('chapterList')}</h3>
          <div id="drawerList"></div>
        </div>
      </div>`;
    const list = $('#drawerList');
    const drawerChapters = state.chapterOrder === 'desc' ? [...state.reader.chapters].reverse() : state.reader.chapters;
    drawerChapters.forEach((ch, i) => {
      const item = el('a', 'chapter-item', '');
      if (i === state.reader.idx) item.classList.add('current');
      const num = ch.attributes.chapter ? `${t('chapter')} ${ch.attributes.chapter}` : `#${i + 1}`;
      item.innerHTML = `<div class="ch-num">${esc(num)}</div><div class="ch-title">${esc(ch.attributes.title || '')}</div>`;
      item.addEventListener('click', (e) => {
        e.preventDefault();
        state.reader.urls = null;
        loadChapter(i);
        closeDrawer();
      });
      list.append(item);
    });
    $('.drawer-backdrop').addEventListener('click', (e) => { if (e.target.classList.contains('drawer-backdrop')) closeDrawer(); });
    function closeDrawer() { root.innerHTML = ''; }
  }

  await loadChapter(idx);
}

/* ============================================================
 * MeloVerse — auth & comments (community layer)
 * ============================================================ */
const authState = {
  token: localStorage.getItem('mv_token') || '',
  user: JSON.parse(localStorage.getItem('mv_user') || 'null'),
};
function apiAuth(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (authState.token) headers['Authorization'] = 'Bearer ' + authState.token;
  if (opts.body) headers['Content-Type'] = 'application/json';
  return fetch(path, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
}
function updateUserChip() {
  const area = $('#userArea');
  if (!area) return;
  if (!authState.user) {
    area.innerHTML = `<button class="user-btn" id="loginBtn">${t('login')}</button>`;
    $('#loginBtn').addEventListener('click', openAuthModal);
  } else {
    const adminLink = authState.user.role === 'admin' ? `<a class="user-btn" href="/admin.html">🛡 ${t('adminPanel')}</a>` : '';
    const avatar = authState.user.avatar ? `<img class="avatar" src="${authState.user.avatar}" alt="">` : '';
    area.innerHTML = `<span class="user-chip">${adminLink}<a class="user-btn" href="#/profile">${avatar} ${t('profile')}</a><span class="who">${esc(authState.user.username)}</span><button class="user-btn" id="logoutBtn">${t('logout')}</button></span>`;
    $('#logoutBtn').addEventListener('click', () => {
      authState.token = ''; authState.user = null;
      localStorage.removeItem('mv_token'); localStorage.removeItem('mv_user');
      updateUserChip(); route();
    });
  }
}
function openAuthModal() {
  const root = el('div', 'modal-backdrop', '');
  root.innerHTML = `
    <div class="modal">
      <h3>${t('welcome')}</h3>
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">${t('login')}</button>
        <button class="auth-tab" data-tab="register">${t('register')}</button>
      </div>
      <div class="err" id="authErr"></div>
      <input id="authUser" placeholder="${t('username')}" autocomplete="username">
      <input id="authPass" type="password" placeholder="${t('password')}" autocomplete="current-password">
      <div class="row">
        <button class="btn primary" id="authSubmit">${t('login')}</button>
        <button class="btn" id="authCancel">${t('cancel')}</button>
      </div>
    </div>`;
  document.body.append(root);
  let mode = 'login';
  root.querySelectorAll('.auth-tab').forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.tab;
    root.querySelectorAll('.auth-tab').forEach((x) => x.classList.toggle('active', x === b));
    $('#authSubmit').textContent = t(mode);
  }));
  $('#authCancel').addEventListener('click', () => root.remove());
  root.addEventListener('click', (e) => { if (e.target === root) root.remove(); });
  const submitOnEnter = (e) => { if (e.key === 'Enter') $('#authSubmit').click(); };
  $('#authUser').addEventListener('keydown', submitOnEnter);
  $('#authPass').addEventListener('keydown', submitOnEnter);
  $('#authSubmit').addEventListener('click', async () => {
    const username = $('#authUser').value.trim();
    const password = $('#authPass').value;
    const err = $('#authErr');
    if (!username || !password) { err.textContent = t('fillAll'); return; }
    try {
      const res = await apiAuth(`/api/auth/${mode}`, { method: 'POST', body: { username, password } });
      const data = await res.json();
      if (!res.ok) { err.textContent = data.error || t('error'); return; }
      authState.token = data.token;
      authState.user = data.user;
      localStorage.setItem('mv_token', data.token);
      localStorage.setItem('mv_user', JSON.stringify(data.user));
      root.remove();
      updateUserChip();
      route();
      toast(t('welcomeBack'));
    } catch (e) { err.textContent = t('error'); }
  });
}
function requireLogin() {
  if (authState.user) return true;
  openAuthModal();
  toast(t('loginToComment'));
  return false;
}

/* ---- comments ---- */
function renderComments(box, targetType, targetId) {
  box.innerHTML = `<h3>💬 ${t('comments')}</h3>`;
  const form = el('div', 'comment-form', '');
  form.innerHTML = `<textarea id="commentText" placeholder="${t('writeComment')}"></textarea><button class="btn primary" id="commentSend">${t('send')}</button>`;
  box.append(form);
  $('#commentSend').addEventListener('click', async () => {
    if (!requireLogin()) return;
    const body = $('#commentText').value.trim();
    if (!body) return;
    try {
      const res = await apiAuth('/api/comments', { method: 'POST', body: { targetType, targetId, body } });
      const data = await res.json();
      if (!res.ok) { toast(data.error || t('error')); return; }
      $('#commentText').value = '';
      loadComments(box, targetType, targetId);
      toast(t('sent'));
    } catch (e) { toast(t('error')); }
  });
  loadComments(box, targetType, targetId);
}
async function loadComments(box, targetType, targetId) {
  const listWrap = el('div', '', '');
  box.append(listWrap);
  try {
    const res = await apiAuth(`/api/comments?type=${targetType}&id=${encodeURIComponent(targetId)}`);
    const data = await res.json();
    if (!data.data || !data.data.length) {
      listWrap.innerHTML = `<div style="color:var(--text-soft);font-size:13px;padding:8px 2px">${t('noComments')}</div>`;
      return;
    }
    data.data.forEach((c) => {
      const item = el('div', 'comment' + (c.reported && !c.deleted ? ' reported' : ''), '');
      item.innerHTML = `
        <div class="head">
          <span class="who">${esc(c.username)}</span>
          <span class="when">${fmtDate(c.created_at)}</span>
          ${c.reported && !c.deleted ? '<span class="when">🚩</span>' : ''}
        </div>
        <div class="body${c.deleted ? ' deleted' : ''}">${c.deleted ? t('deletedComment') : esc(c.body)}</div>
        <div class="tools">
          ${!c.deleted && !c.mine ? `<button data-act="report" data-id="${c.id}">🚩 ${t('report')}</button>` : ''}
          ${c.mine || c.canModerate ? `<button data-act="delete" data-id="${c.id}">🗑 ${t('delete')}</button>` : ''}
        </div>`;
      item.querySelectorAll('button[data-act]').forEach((b) => b.addEventListener('click', async () => {
        const id = b.dataset.id;
        if (b.dataset.act === 'report') {
          if (!requireLogin()) return;
          try { await apiAuth(`/api/comments/${id}/report`, { method: 'POST' }); toast(t('reported')); listWrap.innerHTML=''; loadComments(box, targetType, targetId); } catch { toast(t('error')); }
        } else {
          try { await apiAuth(`/api/comments/${id}`, { method: 'DELETE' }); listWrap.innerHTML=''; loadComments(box, targetType, targetId); } catch { toast(t('error')); }
        }
      }));
      listWrap.append(item);
    });
  } catch (e) { listWrap.innerHTML = `<div style="color:var(--text-soft)">${t('error')}</div>`; }
}

// boot: render user chip + initial route after all declarations
updateUserChip();
// topbar events: brand -> home, drawer, bell, tabs
const br = $('.brand');
if (br) br.addEventListener('click', (e) => {
  e.preventDefault();
  state.homeTab = 'latest';
  document.querySelectorAll('.tab-btn').forEach((x) => x.classList.toggle('active', x.dataset.tab === 'latest'));
  if (location.hash !== '#/home') location.hash = '#/home';
  route();
});
const mb = $('#menuBtn');
if (mb) mb.addEventListener('click', openDrawer);
const bb = $('#bellBtn');
if (bb) bb.addEventListener('click', () => { location.hash = '#/notifications'; });
document.querySelectorAll('.tab-btn').forEach((tb) => tb.addEventListener('click', () => {
  state.homeTab = tb.dataset.tab;
  document.querySelectorAll('.tab-btn').forEach((x) => x.classList.toggle('active', x === tb));
  route();
}));
route();

/* ============================================================
 * Profile & customization: avatar, account, theme, reader filters
 * ============================================================ */
function viewProfile(app) {
  if (!authState.user) { openAuthModal(); viewHome(app); return; }
  const picker = (label, id, options, current) => `
    <div style="margin-bottom:6px;font-weight:600;font-size:13.5px">${label}</div>
    <div class="pick-row">${options.map((o) => `<button class="pick-btn ${o.v === current ? 'active' : ''}" data-pick="${id}" data-v="${o.v}">${o.label}</button>`).join('')}</div>`;
  app.innerHTML = `
    <h1 class="section-title">${t('profile')}</h1>
    <div class="admin-panel" style="text-align:center">
      <img class="avatar-lg" id="profAvatar" src="${authState.user.avatar || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23e5e3f0%22/><text x=%2250%22 y=%2262%22 text-anchor=%22middle%22 font-size=%2238%22>👤</text></svg>'}" alt="">
      <div style="margin-top:10px">
        <label class="btn primary" style="cursor:pointer">${t('changeAvatar')}<input type="file" id="avatarFile" accept="image/png,image/jpeg,image/webp" hidden></label>
      </div>
    </div>
    <div class="admin-panel profile-form">
      <h3 style="margin-bottom:10px">${t('accountData')}</h3>
      <input id="profUser" value="${esc(authState.user.username)}" placeholder="${t('username')}">
      <input id="profCurPass" type="password" placeholder="${t('currentPass')}">
      <input id="profNewPass" type="password" placeholder="${t('newPass')}">
      <button class="btn primary" id="profSave">${t('saveProfile')}</button>
    </div>
    <div class="admin-panel">
      <h3 style="margin-bottom:10px">${t('themeLabel')}</h3>
      ${picker('', 'theme', [
        { v: 'light', label: '☀ ' + t('themeLight') },
        { v: 'dark', label: '🌙 ' + t('themeDark') },
        { v: 'amoled', label: '⬛ ' + t('themeAmoled') },
      ], state.theme)}
      <h3 style="margin-bottom:10px">${t('readerFilterLabel')}</h3>
      ${picker('', 'rfilter', [
        { v: 'original', label: t('rfOriginal') },
        { v: 'mono', label: t('rfMono') },
        { v: 'sepia', label: t('rfSepia') },
      ], state.rFilter)}
      <h3 style="margin-bottom:10px">${t('chapterOrderLabel')}</h3>
      ${picker('', 'order', [
        { v: 'asc', label: t('orderAsc') },
        { v: 'desc', label: t('orderDesc') },
      ], state.chapterOrder)}
    </div>`;

  // avatar upload
  $('#avatarFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1048576) { toast(t('error')); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await apiAuth('/api/profile/avatar', { method: 'POST', body: { dataUrl: reader.result } });
        const data = await res.json();
        if (!res.ok) { toast(data.error || t('error')); return; }
        authState.user.avatar = data.avatar;
        localStorage.setItem('mv_user', JSON.stringify(authState.user));
        $('#profAvatar').src = data.avatar;
        updateUserChip();
        toast(t('avatarSaved'));
      } catch { toast(t('error')); }
    };
    reader.readAsDataURL(file);
  });

  // account save
  $('#profSave').addEventListener('click', async () => {
    const body = {};
    const u = $('#profUser').value.trim();
    if (u && u !== authState.user.username) body.username = u;
    if ($('#profCurPass').value || $('#profNewPass').value) {
      body.currentPassword = $('#profCurPass').value;
      body.newPassword = $('#profNewPass').value;
    }
    if (!Object.keys(body).length) return;
    try {
      const res = await apiAuth('/api/profile', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) { toast(data.error || t('error')); return; }
      if (data.username) { authState.user.username = data.username; localStorage.setItem('mv_user', JSON.stringify(authState.user)); updateUserChip(); }
      toast(t('profileSaved'));
      route();
    } catch { toast(t('error')); }
  });

  // pickers
  app.querySelectorAll('.pick-btn').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.pick, v = b.dataset.v;
    if (id === 'theme') { state.theme = v; applyTheme(); }
    if (id === 'rfilter') state.rFilter = v;
    if (id === 'order') state.chapterOrder = v;
    save();
    app.querySelectorAll(`.pick-btn[data-pick="${id}"]`).forEach((x) => x.classList.toggle('active', x === b));
    toast(t('profileSaved'));
  }));
}

/* ============================================================
 * Manga Melo style: navigation drawer + user lists views
 * ============================================================ */
function openDrawer() {
  const root = $('#drawerRoot');
  const isAr = state.lang === 'ar';
  const account = authState.user
    ? `<div class="d-acc">
        ${authState.user.avatar ? `<img class="avatar-lg" src="${authState.user.avatar}">` : '<div class="avatar-lg" style="display:flex;align-items:center;justify-content:center;background:var(--bg-soft)">👤</div>'}
        <div><div class="d-name">${esc(authState.user.username)}</div>
        <a class="d-sub" href="#/profile" style="text-decoration:none">${t('profile')} →</a></div>
      </div>`
    : `<div class="d-acc">
        <div class="avatar-lg" style="display:flex;align-items:center;justify-content:center;background:var(--bg-soft)">👤</div>
        <div><div class="d-name">${t('guest')}</div>
        <button class="user-btn primary" id="dLogin" style="margin-top:4px">${t('login')}</button></div>
      </div>`;
  const item = (ic, label, href, count) => `<a class="d-item" href="${href}"><span class="d-ic">${ic}</span>${label}${count ? `<span class="d-count">${count}</span>` : ''}</a>`;
  root.innerHTML = `
    <div class="drawer-backdrop${isAr ? '' : ' from-start'}" id="dBackdrop">
      <div class="drawer">
        ${account}
        <div class="d-sec">
          <div class="d-sec-title">${t('menu')}</div>
          ${item('🏠', t('menuHome'), '#/home')}
          ${item('🔍', t('menuSearch'), '#/search')}
          ${item('✨', t('menuNew'), '#/new')}
          ${item('📺', t('tabAnime'), '#/anime')}
          ${item('🕘', t('menuHistory'), '#/history')}
        </div>
        <div class="d-sec">
          <div class="d-sec-title">${t('myLists')}</div>
          ${item('❤️', t('listFavorites'), '#/library', state.follows.length)}
          ${item('📖', t('listReadingNow'), '#/history', Object.keys(state.progress).length)}
          ${item('⏳', t('listReadLater'), '#/readlater', state.readLater.length)}
          ${item('✅', t('listReadWorks'), '#/history')}
          ${item('🔔', t('listNotifications'), '#/notifications')}
          ${item('⬇', t('listDownloads'), '#/home')}
        </div>
        <div class="d-sec">
          <div class="d-sec-title">${t('settings')}</div>
          <div class="d-switch">
            <span>🌙 ${t('nightMode')}</span>
            <label class="switch"><input type="checkbox" id="dDark" ${state.theme === 'dark' || state.theme === 'amoled' ? 'checked' : ''}><span class="sl"></span></label>
          </div>
          ${item('⚙️', t('settings'), '#/profile')}
          ${item('❓', t('faq'), '#/faq')}
          ${item('🔒', t('privacy'), '#/privacy')}
          ${item('📜', t('terms'), '#/terms')}
        </div>
        <div class="d-sec">
          <div class="d-sec-title">${t('followUs')}</div>
          <div class="d-socials">
            <a href="#" onclick="return false">${t('facebook')}</a>
            <a href="#" onclick="return false">${t('telegram')}</a>
            <a href="#" onclick="return false">${t('twitter')}</a>
          </div>
        </div>
        <a class="d-apk" href="/builds/latest.apk">${t('downloadApp')}</a>
      </div>
    </div>`;
  const close = (e) => {
    if (e.target === root || e.target.id === 'dBackdrop') root.innerHTML = '';
  };
  root.addEventListener('click', close);
  // close drawer after choosing any item or downloading
  root.querySelectorAll('.d-item, .d-apk').forEach((a) => a.addEventListener('click', () => {
    setTimeout(() => { root.innerHTML = ''; }, 60);
  }));
  const dk = $('#dDark');
  if (dk) dk.addEventListener('change', () => {
    state.theme = dk.checked ? 'dark' : 'light';
    save(); applyTheme();
  });
  const dl = $('#dLogin');
  if (dl) dl.addEventListener('click', () => { root.innerHTML = ''; openAuthModal(); });
}

/* ---- views: history / read later / notifications ---- */
function viewHistory(app) {
  const entries = Object.entries(state.progress);
  app.innerHTML = `<h1 class="section-title">${t('historyTitle')}</h1><div id="histList"></div>`;
  const box = $('#histList');
  if (!entries.length) {
    box.innerHTML = `<div class="empty-state"><div class="big">🕘</div><div>${t('historyEmpty')}</div></div>`;
    return;
  }
  box.innerHTML = entries.map(([mid, p]) => {
    const f = state.follows.find((x) => x.id === mid);
    return `<a class="ch-feed-item" href="#/reader/${p.chapterId}?manga=${mid}">
      <img loading="lazy" src="${proxyImg(f ? f.cover : '')}" onerror="this.style.visibility='hidden'">
      <div style="flex:1;min-width:0">
        <div class="cf-t">${esc(f ? f.title : mid)}</div>
        <div class="cf-m">${t('chapter')} ${esc(p.chapterTitle || p.chapterIndex + 1)} · ${Math.min(100, Math.round(((p.pageIndex + 1) / (p.totalPages || 1)) * 100))}٪</div>
      </div><span class="cf-m">▶</span></a>`;
  }).join('');
}

function viewReadLater(app) {
  app.innerHTML = `<h1 class="section-title">${t('readLaterTitle')}</h1><div id="rlList"></div>`;
  const box = $('#rlList');
  if (!state.readLater.length) {
    box.innerHTML = `<div class="empty-state"><div class="big">⏳</div><div>${t('readLaterEmpty')}</div></div>`;
    return;
  }
  box.innerHTML = `<div class="grid">` + state.readLater.map((m) => `
    <a class="card" href="#/manga/${m.id}">
      <img loading="lazy" src="${proxyImg(m.cover)}" onerror="this.style.visibility='hidden'">
      <div class="card-body"><div class="card-title">${esc(m.title)}</div></div>
    </a>`).join('') + `</div>`;
}

async function viewNotifications(app) {
  app.innerHTML = `<h1 class="section-title">${t('notifications')}</h1><div id="notifList"></div>`;
  const box = $('#notifList');
  try {
    const lc = await api('/api/catalog/latest-chapters?limit=30');
    const followedIds = new Set(state.follows.map((f) => f.id));
    const items = (lc.data || []).filter((c) => followedIds.has(c.mangaId));
    if (!items.length) {
      box.innerHTML = `<div class="empty-state"><div class="big">🔔</div><div>${t('noNotifications')}</div></div>`;
      return;
    }
    box.innerHTML = items.map((c) => `
      <a class="ch-feed-item" href="#/reader/${c.chapterId}?manga=${c.mangaId}">
        <img loading="lazy" src="${proxyImg(c.cover)}" onerror="this.style.visibility='hidden'">
        <div style="flex:1;min-width:0">
          <div class="cf-t">${esc(c.title)}</div>
          <div class="cf-m">${t('newChapter')}: ${t('chapter')} ${esc(c.chapterNumber)} · ${fmtDate(c.publishedAt)}</div>
        </div><span class="cf-m">🆕</span></a>`).join('');
  } catch {
    box.innerHTML = `<div class="empty-state">${t('error')}</div>`;
  }
}

/* ---- static pages ---- */
function viewStatic(app, title, body) {
  app.innerHTML = `<h1 class="section-title">${title}</h1><div class="admin-panel" style="font-size:14px;line-height:1.9">${body}</div>`;
}

/* ============================================================
 * Legal & help content (terms / privacy / faq) — realistic copy
 * ============================================================ */
function legalContent(kind) {
  const AR = {
    terms: `
      <h3>١. القبول بالشروط</h3><p>باستخدامك منصة MeloVerse فأنت توافق على هذه الشروط. إذا لم توافق، يرجى عدم استخدام الخدمة.</p>
      <h3>٢. وصف الخدمة</h3><p>MeloVerse منصة قراءة تجمع الروابط والبيانات (الأعمال، الفصول، الصور) من مصادر عامة وواجهات برمجية (مثل MangaDex API) وتعرضها للاستخدام الشخصي. نحن لا نستضيف الملفات ولا نملك المحتوى.</p>
      <h3>٣. حقوق الملكية الفكرية</h3><p>جميع الأعمال المعروضة (مانجا، مانهوا، مانها، أنمي) ملك لناشريها ومؤلفيها الأصليين. المنصة لا تدّعي أي ملكية عليها. الاستخدام مخصص للقراءة الشخصية غير التجارية. يُمنع إعادة توزيع أو تحميل أو بيع المحتوى.</p>
      <h3>٤. سلوك المستخدم</h3><p>يُمنع: إساءة استخدام الخدمة، محاولة اختراق الخوادم أو الواجهات، الإفراط الآلي في الطلبات، نشر فيروسات أو برامج ضارة، انتحال شخصية الآخرين.</p>
      <h3>٥. التعليقات والمحتوى التفاعلي</h3><p>التعليقات تعبّر عن رأي أصحابها. يحظر التعليقات المسيئة أو المخالفة للقانون. يحق للإدارة حذف أي تعليق، وحظر الحسابات المخالفة، وإبلاغ السلطات عند الاقتضاء.</p>
      <h3>٦. الحسابات والحظر</h3><p>أنت مسؤول عن سرية كلمة مرورك. يحق لنا تعليق أو حظر أي حساب ينتهك الشروط أو يشتبه في إساءة استخدامه، دون إشعار مسبق.</p>
      <h3>٧. حجب المحتوى</h3><p>يحق لنا حجب أي عمل أو فصل غير مناسب أو مخالف دون إشعار، بناءً على تقييمنا أو تقارير المستخدمين أو متطلبات قانونية.</p>
      <h3>٨. الإعلانات</h3><p>قد تعرض الخدمة إعلانات (Banner، Interstitial، Rewarded) لدعم استمراريتها. نحتفظ بحق تغيير نوع وتردد وموضع الإعلانات في أي وقت.</p>
      <h3>٩. إخلاء المسؤولية</h3><p>تُقدَّم الخدمة "كما هي" دون أي ضمانات. لا نضمن استمرارية التوفر أو سلامة البيانات أو عدم انقطاع المصادر الخارجية. لا نتحمل مسؤولية أي أضرار ناتجة عن استخدام الخدمة أو توقفها.</p>
      <h3>١٠. الخصوصية</h3><p>تخضع معالجة بياناتك لسياسة الخصوصية المنشورة في هذه الصفحة.</p>
      <h3>١١. تعديل الشروط</h3><p>نحتفظ بحق تعديل هذه الشروط في أي وقت. استمرار استخدامك بعد التعديل يعني موافقتك على النسخة المحدثة.</p>
      <h3>١٢. التواصل</h3><p>للاستفسارات أو البلاغات القانونية تواصل معنا عبر القائمة الجانبية (صفحات التواصل).</p>`,
    privacy: `
      <h3>البيانات التي نجمعها</h3><p><strong>بيانات الحساب:</strong> اسم المستخدم وكلمة المرور (مشفرة بـ scrypt — لا نستطيع قراءتها). لا نطلب بريدًا إلكترونيًا.</p>
      <p><strong>البيانات المحلية:</strong> تفضيلاتك (المفضلة، تقدم القراءة، المظهر) تُخزن على جهازك (localStorage) وليست إلزامية للقراءة.</p>
      <h3>التخزين والمعالجة</h3><p>تُعالج بيانات الحساب والتعليقات على خوادمنا لتشغيل الخدمة فقط. لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة لأغراض تسويقية.</p>
      <h3>الإعلانات</h3><p>في حال تفعيل الإعلانات، قد يستخدم مزودو الإعلانات تقنيات تتبع قياسية (مثل ملفات تعريف الارتباط) لعرض إعلانات ملائمة.</p>
      <h3>حقوقك</h3><p>يمكنك حذف حسابك وبياناتك في أي وقت عبر التواصل معنا. لديك الحق في تصحيح أو إزالة بياناتك الشخصية.</p>
      <h3>الأمان</h3><p>نستخدم التشفير (TLS) لنقل البيانات وتخزين كلمات المرور مشفرة. لا يوجد نظام آمن 100%، لكننا نطبق أفضل الممارسات المعقولة.</p>`,
    faq: `
      <h3>من أين يأتي المحتوى؟</h3><p>من مصادر عامة وواجهات رسمية، أبرزها MangaDex API. المحتوى ملك لناشريه ونحن وسيط عرض فقط.</p>
      <h3>هل الخدمة مجانية؟</h3><p>نعم، القراءة مجانية بالكامل. قد تُعرض إعلانات خفيفة لدعم التشغيل.</p>
      <h3>لماذا لا يظهر عمل معين؟</h3><p>بعض الأعمال مرخصة رسميًا فتُزال من المصادر العامة، وبعضها قد يكون محجوبًا لعدم ملاءمته أو بطلب قانوني.</p>
      <h3>كيف أحفظ الفصول للقراءة دون اتصال؟</h3><p>التحميل دون اتصال متاح في تطبيق أندرويد (قيد التطوير الكامل). في الويب، تبقى الصفحات المفتوحة مخزنة مؤقتًا لدينا لتسريع العرض.</p>
      <h3>كيف أبلغ عن تعليق مسيء؟</h3><p>اضغط زر 🚩 بجانب التعليق — يصل البلاغ للمشرفين فورًا للمراجعة والحذف.</p>
      <h3>كيف أستعيد تقدم قراءتي؟</h3><p>تقدم القراءة يُحفظ على جهازك تلقائيًا. المزامنة السحابية بين الأجهزة قادمة قريبًا.</p>
      <h3>كيف أحدّث التطبيق؟</h3><p>التطبيق يفحص التحديثات تلقائيًا عند فتحه، أو حمّل أحدث نسخة من زر "تحميل التطبيق" في القائمة الجانبية.</p>`,
  };
  const EN = {
    terms: `
      <h3>1. Acceptance</h3><p>By using MeloVerse you agree to these terms. If you do not agree, please do not use the service.</p>
      <h3>2. Service description</h3><p>MeloVerse is a reading platform that aggregates links and metadata (series, chapters, images) from public sources and official APIs (e.g. MangaDex API) for personal use. We do not host files and do not own the content.</p>
      <h3>3. Intellectual property</h3><p>All displayed works (manga, manhwa, manhua, anime) belong to their original publishers and creators. The platform claims no ownership. Use is limited to personal, non-commercial reading. Redistribution, resale or mass downloading is prohibited.</p>
      <h3>4. User conduct</h3><p>Prohibited: abuse of the service, attempting to hack servers or APIs, excessive automated requests, spreading malware, impersonating others.</p>
      <h3>5. Comments & interactive content</h3><p>Comments express their authors' views. Abusive or unlawful comments are forbidden. We may remove any comment, ban offending accounts, and report to authorities when required.</p>
      <h3>6. Accounts & bans</h3><p>You are responsible for your password's secrecy. We may suspend or ban any account that violates these terms or shows signs of abuse, without prior notice.</p>
      <h3>7. Content removal</h3><p>We may block any work or chapter that is inappropriate or unlawful, without notice, based on our review, user reports, or legal requirements.</p>
      <h3>8. Advertising</h3><p>The service may display ads (Banner, Interstitial, Rewarded) to remain free. We reserve the right to change ad type, frequency, and placement at any time.</p>
      <h3>9. Disclaimer</h3><p>The service is provided "as is" without warranties. We do not guarantee availability, data integrity, or uninterrupted third-party sources. We are not liable for damages arising from use or unavailability.</p>
      <h3>10. Privacy</h3><p>Your data handling is governed by our Privacy Policy published on this page.</p>
      <h3>11. Changes to terms</h3><p>We may update these terms at any time. Continued use after changes constitutes acceptance.</p>
      <h3>12. Contact</h3><p>For inquiries or legal notices, contact us via the social links in the side menu.</p>`,
    privacy: `
      <h3>Data we collect</h3><p><strong>Account data:</strong> username and password (hashed with scrypt — we cannot read it). No email is required.</p>
      <p><strong>Local data:</strong> preferences (favorites, reading progress, theme) are stored on your device (localStorage) and are not required for reading.</p>
      <h3>Storage & processing</h3><p>Account and comment data are processed on our servers solely to operate the service. We do not sell or share your data for marketing.</p>
      <h3>Advertising</h3><p>If ads are enabled, ad providers may use standard tracking technologies (e.g. cookies) to show relevant ads.</p>
      <h3>Your rights</h3><p>You may request account and data deletion at any time by contacting us. You have the right to correct or remove your personal data.</p>
      <h3>Security</h3><p>We use TLS encryption for transport and store passwords hashed. No system is 100% secure, but we apply reasonable best practices.</p>`,
    faq: `
      <h3>Where does the content come from?</h3><p>From public sources and official APIs, primarily the MangaDex API. Content belongs to its publishers; we are only a display intermediary.</p>
      <h3>Is the service free?</h3><p>Yes, reading is completely free. Light ads may appear to support operations.</p>
      <h3>Why is a certain series missing?</h3><p>Some series are officially licensed and removed from public sources; others may be blocked for suitability or legal reasons.</p>
      <h3>How do I save chapters offline?</h3><p>Offline download is available in the Android app (being completed). On the web, opened pages are cached by our proxy for faster display.</p>
      <h3>How do I report an abusive comment?</h3><p>Press the 🚩 button next to the comment — moderators review and remove it immediately.</p>
      <h3>How do I restore my reading progress?</h3><p>Progress is saved automatically on your device. Cross-device cloud sync is coming soon.</p>
      <h3>How do I update the app?</h3><p>The app checks for updates automatically on launch, or download the latest version from the side menu's "Download app" button.</p>`,
  };
  const dict = state.lang === 'ar' ? AR : EN;
  return dict[kind] || '';
}

/* ============================================================
 * Anime section (AniList metadata + airing schedule)
 * ============================================================ */
function animeCard(a, small) {
  const c = el('a', 'card', '');
  c.href = `#/anime/${a.id}`;
  c.innerHTML = `
    <img loading="lazy" src="${proxyImg(a.cover)}" alt="" onerror="this.style.visibility='hidden'">
    <div class="card-body">
      <div class="card-title">${esc(a.title)}</div>
      <div class="star-row">
        ${a.rating ? `<span class="star">★</span><span class="val">${a.rating}</span>` : ''}
        ${a.episodes ? `<span class="ch">· ${t('animeEpisodes')} ${a.episodes}</span>` : ''}
        ${!a.rating && !a.episodes ? `<span class="ch">${esc(a.status || '')}</span>` : ''}
      </div>
    </div>`;
  return c;
}
async function viewAnime(app) {
  app.innerHTML = `
    <h1 class="section-title">📺 ${t('tabAnime')}</h1>
    <div class="searchbar">
      <input id="animeInput" type="search" placeholder="${t('animeSearch')}">
      <button id="animeGo">${t('searchBtn')}</button>
    </div>
    <h1 class="section-title">🔥 ${t('animeTrending')}</h1>
    <div id="animeGrid" class="grid">${spinner()}</div>
    <h1 class="section-title">📅 ${t('animeAiring')}</h1>
    <div id="animeAiring"></div>`;
  const grid = $('#animeGrid');
  const airBox = $('#animeAiring');
  $('#animeGo').addEventListener('click', async () => {
    const q = $('#animeInput').value.trim();
    if (!q) return;
    grid.innerHTML = spinner();
    try {
      const r = await api(`/api/anime/search?q=${encodeURIComponent(q)}`);
      grid.innerHTML = '';
      (r.data || []).forEach((a) => grid.append(animeCard(a)));
    } catch { grid.innerHTML = `<div class="empty-state">${t('error')}</div>`; }
  });
  $('#animeInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#animeGo').click(); });
  try {
    const [tr, air] = await Promise.all([
      api('/api/anime/trending'),
      api('/api/anime/airing'),
    ]);
    grid.innerHTML = '';
    (tr.data || []).forEach((a) => grid.append(animeCard(a)));
    if (!(air.data || []).length) {
      airBox.innerHTML = `<div style="color:var(--text-soft);font-size:13px">${t('noChapters')}</div>`;
    } else {
      airBox.innerHTML = (air.data || []).map((s) => `
        <a class="ch-feed-item" href="#/anime/${s.animeId}">
          <img loading="lazy" src="${proxyImg(s.cover)}" onerror="this.style.visibility='hidden'">
          <div style="flex:1;min-width:0">
            <div class="cf-t">${esc(s.title)}</div>
            <div class="cf-m">${t('airsSoon')} ${s.episode} · ${fmtDate(new Date(s.airingAt * 1000).toISOString())}</div>
          </div>
          ${s.rating ? `<span class="star">★${s.rating}</span>` : ''}
        </a>`).join('');
    }
  } catch {
    grid.innerHTML = `<div class="empty-state">${t('error')}</div>`;
    airBox.innerHTML = '';
  }
}
async function viewAnimeDetail(app, id) {
  app.innerHTML = spinner();
  let anime = null;
  try {
    const r = await api(`/api/anime/${id}`);
    anime = r.data || null;
  } catch {}
  if (!anime) {
    app.innerHTML = `<div class="empty-state"><div class="big">📺</div><div>${t('error')}</div></div>`;
    return;
  }
  const next = anime.nextEpisode;
  app.innerHTML = `
    <div class="detail-top">
      <img class="detail-cover" src="${proxyImg(anime.cover)}" alt="">
      <div class="detail-info">
        <h1>${esc(anime.title)}</h1>
        ${anime.titleEnglish && anime.titleEnglish !== anime.title ? `<div class="detail-alt">${esc(anime.titleEnglish)}</div>` : ''}
        <div class="tag-row">
          ${anime.rating ? `<span class="tag">★ ${anime.rating}</span>` : ''}
          ${anime.episodes ? `<span class="tag">${t('animeEpisodes')}: ${anime.episodes}</span>` : ''}
          <span class="tag">${t('animeStatus')}: ${esc(anime.status)}</span>
          ${(anime.genres || []).slice(0, 4).map((g) => `<span class="tag">${esc(g)}</span>`).join('')}
        </div>
        ${next ? `<div class="lang-notice">📅 ${t('airsSoon')} ${next.episode} — ${fmtDate(new Date(next.airingAt * 1000).toISOString())}</div>` : ''}
        ${anime.description ? `<div class="detail-desc">${esc(anime.description)}</div>` : ''}
        <p style="color:var(--text-soft);font-size:13px;margin-top:12px">${t('animeDetailNote')}</p>
      </div>
    </div>`;
}
