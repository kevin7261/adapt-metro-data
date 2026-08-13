/* 靜態頁主題：讀 prefs（優先）再退 session，渲染前套 .dark / data-theme / lang。
 * 與 public/theme-boot.js、主站 persist.savePrefs 同一鍵。
 *
 * 文件（data/docs／）只准 localhost 看——正式站直連導回網站根。 */
(function () {
  var h = location.hostname
  if (h !== 'localhost' && h !== '127.0.0.1' && h !== '[::1]') {
    var p = location.pathname
    var i = p.indexOf('/data/docs/')
    location.replace(i >= 0 ? p.slice(0, i + 1) : '/')
    return
  }

  var dark = true, accent = 'blue', locale = 'en'
  try {
    var prefs = JSON.parse(localStorage.getItem('adapt-metro:prefs:v1') || 'null')
    var s = JSON.parse(localStorage.getItem('adapt-metro:session:v1') || '{}') || {}
    var src = prefs && typeof prefs === 'object' ? prefs : s
    if (typeof src.dark === 'boolean') dark = src.dark
    else if (typeof s.dark === 'boolean') dark = s.dark
    if (typeof src.accent === 'string' && src.accent) accent = src.accent
    else if (typeof s.accent === 'string' && s.accent) accent = s.accent
    if (src.locale === 'zh' || src.locale === 'en') locale = src.locale
    else if (s.locale === 'zh' || s.locale === 'en') locale = s.locale
  } catch (e) { /* 用預設 */ }
  var root = document.documentElement
  root.classList.toggle('dark', dark)
  if (accent && accent !== 'blue') root.dataset.theme = accent
  else delete root.dataset.theme
  root.lang = locale === 'zh' ? 'zh-Hant' : 'en'
})()
