/* 靜態頁共用 header——鏡像文件頁 TopToolbar.vue（系統／論文／設計；無匯入地圖）。
 *
 * 首頁與 /doc 是兩頁兩欄：首頁有匯入地圖；data/docs 靜態頁跟文件頁同一列。
 * 例外：不含「目前計算」（主應用才有 API）。
 * 下拉列＝.menu-item > .menu-item-hit（同 DocMenuPop）；樣式吃 design-shell.css。
 * 改一邊必同步另一邊——見 .claude/skills/ui-responsive/SKILL.md。
 *
 * AdaptMetroToolbar.mount(el|selector, { base, active })
 *   base   = 從本頁到網站根目錄的相對路徑
 *   active = 'brief' | 'intro' | 'architecture' | 'thesis' | 'paper' | 'improve' | 'reading' | 'design' | ''
 * AdaptMetroToolbar.setActive(id)
 */
(function () {
  var SESSION_KEY = 'adapt-metro:session:v1'
  var PREFS_KEY = 'adapt-metro:prefs:v1'
  var OPEN_TAB_KEY = 'adapt-metro:openTab'

  function isLocalHost() {
    var h = location.hostname
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
  }

  // 與 src/lib/relatedLinks.js 同步（靜態文件頁無法 import src/）
  var RELATED = [
    {
      label: 'Metro systems (Wikipedia)',
      href: 'https://en.wikipedia.org/wiki/List_of_metro_systems',
      blurb: {
        en: 'A worldwide list of metro systems: cities, lines, and basic stats.',
        zh: '全球地鐵系統一覽：城市、路線與基本規模。',
      },
      detail: {
        en: 'Useful when checking which cities have a metro, how large a system is, or finding the English name of a network. Entries usually include opening year, length, and station counts. This project’s city catalog often cross-checks against public lists like this when deciding coverage or naming.',
        zh: '查「哪裡有地鐵、規模大概多大、英文系統名怎麼寫」時很好用。條目常附通車年、里程與站數。本專案整理城市清單、核對涵蓋範圍或命名時，也常對照這類公開名錄。',
      },
    },
    {
      label: 'UrbanRail.net',
      href: 'https://www.urbanrail.net/',
      blurb: {
        en: 'City-by-city metro and urban rail maps and notes by Robert Schwandl.',
        zh: 'Schwandl 的都會軌道圖站：一城一頁，有圖也有說明。',
      },
      detail: {
        en: 'A long-running reference for schematic and geographic urban-rail maps, with a page per city and short notes on lines. This project’s UrbanRail image slot must come from here—Commons or operator artwork must not fill that slot. If a city has no UrbanRail map, the slot stays empty (drawn as X), rather than borrowing another source.',
        zh: '長年收錄各國都會軌道的示意／地理圖，一城一頁並附簡短路線說明。本專案「UrbanRail 圖」槽位規定要來自此站，不能用 Commons 或營運商圖充數；該城若無圖就留空（畫 X），不要拿別的來源湊數。',
      },
    },
    {
      label: 'octi',
      href: 'https://octi.cs.uni-freiburg.de/',
      blurb: {
        en: 'Freiburg’s live demo for octilinear metro maps on grid graphs (Bast et al.).',
        zh: '弗萊堡大學的八向示意圖線上示範（Bast 等人）。',
      },
      detail: {
        en: 'Pick a dataset and optimization settings, then see stations snapped onto an octilinear grid (edges limited to horizontal, vertical, and 45° diagonals). Papers: Metro Maps on Octilinear Grid Graphs (2020) and Flexible Base Grids (2021). In this project that line of work maps to straightening algorithms ⑥ octilinear grid and ⑨ flexible grid—useful as a live reference when reading those paper-aligned chains.',
        zh: '可選資料集與優化方式，看車站怎麼被排到八向格網上（邊只准水平、垂直與 45° 對角）。論文：Metro Maps on Octilinear Grid Graphs（2020）與 Flexible Base Grids（2021）。本專案對應直線演算法⑥八向格網、⑨彈性格網；讀這兩條論文鏈時，可把這個線上示範當即時對照。',
      },
    },
    {
      label: 'LOOM',
      href: 'https://loom.cs.uni-freiburg.de/',
      blurb: {
        en: 'Freiburg’s Line Ordering Optimized Maps demo—how parallel lines are ordered.',
        zh: '弗萊堡大學的線路排序示範——共線時各線誰上誰下。',
      },
      detail: {
        en: 'Compare ILP, greedy, hill-climbing and other methods for ordering lines in shared corridors, with toggles for stations, edges, and labels. The focus is which line sits above which when several routes share a segment—not where stations sit on a grid. Complementary to layout tools like octi: octi answers “where do stations go,” LOOM answers “how do parallel lines stack.”',
        zh: '可切換 ILP、貪婪、爬山等方法，調整站、邊、標籤顯示，比較共線走廊裡「哪一條線畫在上面」好不好讀。重點不是站落在哪個格子，而是多線共段時的疊線順序。和 octi 互補：octi 偏「站怎麼排格」，LOOM 偏「線怎麼疊、怎麼排」。',
      },
    },
    {
      label: 'MetroMan',
      href: 'https://www.metroman.cn/zh-hant/maps',
      blurb: {
        en: 'MetroMan’s gallery of city metro maps (Greater China and nearby).',
        zh: '地鐵通 MetroMan 的城市地鐵圖一覽（兩岸與周邊城市）。',
      },
      detail: {
        en: 'Browse schematic metro maps city by city—Beijing, Shanghai, Taipei, Hong Kong, and many others—with thumbnails that open each network. Handy as a public reference when comparing how operators and apps draw the same city, or when checking coverage for Chinese-language metro map designs alongside UrbanRail and Wikipedia lists.',
        zh: '一城一圖瀏覽示意地圖（北京、上海、台北、香港等），縮圖點進去看整張路網。對照營運商／App 怎麼畫同一座城、或核對華語圈地鐵圖涵蓋時，可與 UrbanRail、Wikipedia 名錄並列參考。',
      },
    },
  ]

  var DESIGN_SECTIONS = [
    { id: 'color', icon: 'palette', labelEn: 'Color', labelZh: '色彩' },
    { id: 'type', icon: 'text_fields', labelEn: 'Typography', labelZh: '字型' },
    { id: 'space', icon: 'space_bar', labelEn: 'Space', labelZh: '間距' },
    { id: 'lists', icon: 'list', labelEn: 'Lists', labelZh: '清單' },
    { id: 'controls', icon: 'smart_button', labelEn: 'Controls', labelZh: '控件' },
    { id: 'chrome', icon: 'dashboard', labelEn: 'Chrome', labelZh: '外殼' },
    { id: 'icons', icon: 'category', labelEn: 'Icons', labelZh: '圖示' },
  ]

  var L = {
    en: {
      system: 'System',
      flowSkills: 'Data flow & Skills',
      thesis: 'Thesis',
      design: 'Design',
      links: 'Related links',
      more: 'More',
      themeLight: 'Light',
      themeDark: 'Dark',
      sysBrief: 'System brief',
      sysIntro: 'System overview',
      sysArch: 'System architecture',
      sysNotes: 'System notes',
      dataflow: 'Data flow',
      skillCall: 'Skill call graph',
      skills: 'Skills',
      reports: 'System reports',
      thesisSlides: 'Thesis slides',
      thesisPaper: 'Thesis paper',
      thesisImprove: 'Improvement notes',
      thesisReading: 'Reading list',
      skipToContent: 'Skip to main content',
    },
    zh: {
      system: '系統內容',
      flowSkills: '資料流／Skills',
      thesis: '論文內容',
      design: '設計',
      links: '相關連結',
      more: '更多',
      skipToContent: '跳到主內容',
      themeLight: '日間',
      themeDark: '夜間',
      sysBrief: '系統簡介',
      sysIntro: '系統介紹',
      sysArch: '系統架構',
      sysNotes: '系統說明',
      dataflow: '資料流',
      skillCall: 'Skill 呼叫圖',
      skills: 'Skills',
      reports: '系統報告',
      thesisSlides: '論文投影片',
      thesisPaper: '論文本文',
      thesisImprove: '改善建議',
      thesisReading: '閱讀清單',
    },
  }

  var rootEl = null
  var currentActive = ''
  var currentBase = ''
  var docBound = false

  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}') || {} } catch (e) { return {} }
  }
  function readPrefs() {
    try {
      var p = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null')
      return p && typeof p === 'object' ? p : {}
    } catch (e) { return {} }
  }
  function writePrefs(patch) {
    var p = readPrefs()
    for (var k in patch) p[k] = patch[k]
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)) } catch (e) { /* private */ }
    var s = readSession()
    for (var k2 in patch) s[k2] = patch[k2]
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch (e2) { /* private */ }
  }
  function locale() {
    var p = readPrefs()
    if (p.locale === 'zh' || p.locale === 'en') return p.locale
    return readSession().locale === 'zh' ? 'zh' : 'en'
  }
  function isDark() {
    var p = readPrefs()
    if (typeof p.dark === 'boolean') return p.dark
    var s = readSession()
    if (typeof s.dark === 'boolean') return s.dark
    return document.documentElement.classList.contains('dark')
  }
  function t(key) {
    return (L[locale()] || L.en)[key] || key
  }

  function join(base, path) {
    if (!path) return base || './'
    if (/^https?:/i.test(path)) return path
    var b = base || ''
    if (b && !b.endsWith('/')) b += '/'
    return b + path
  }

  function icon(name, size) {
    return '<span class="material-symbols-outlined m-icon" style="font-size:' + size + 'px">' + name + '</span>'
  }

  function relatedItemsHtml() {
    var loc = locale()
    return RELATED.map(function (r) {
      var blurb = (r.blurb && (r.blurb[loc] || r.blurb.zh)) || ''
      var detail = (r.detail && (r.detail[loc] || r.detail.zh)) || ''
      return '<div class="menu-item related-link" role="none">' +
        '<a class="menu-item-hit related-link-hit" href="' + r.href + '" target="_blank" rel="noopener noreferrer" role="menuitem">' +
          '<span class="related-link-title">' + icon('open_in_new', 14) + '<span>' + r.label + '</span></span>' +
          (blurb ? '<span class="related-link-blurb">' + blurb + '</span>' : '') +
          (detail ? '<span class="related-link-detail">' + detail + '</span>' : '') +
        '</a></div>'
    }).join('')
  }

  function goDocTab(tabId) {
    try { sessionStorage.setItem(OPEN_TAB_KEY, tabId) } catch (e) { /* private */ }
    location.href = join(currentBase, 'doc/')
  }

  function menuRow(item, active) {
    if (item.sep) return '<div class="menu-sep" role="separator"></div>'
    var on = active === item.id || active === item.activeAlias
    var label = icon(item.icon, 15) + '<span>' + item.label + '</span>'
    // data/docs 靜態頁：有 href 的文件項留在 docs 樹；其餘（資料流／設計…）才進 /doc tab
    // 列結構＝DocMenuPop：.menu-item 包 .menu-item-hit（禁裸 button.menu-item）
    var hit = item.href
      ? '<a class="menu-item-hit" href="' + item.href + '" role="menuitem">' + label + '</a>'
      : '<button type="button" class="menu-item-hit" role="menuitem" data-doc-tab="' + item.id + '">' +
          label + '</button>'
    return '<div class="menu-item' + (on ? ' active' : '') + '" role="none">' + hit + '</div>'
  }

  function sysItemsHtml(active) {
    var items = [
      { id: 'brief', icon: 'overview', label: t('sysBrief'), href: join(currentBase, 'data/docs/system/brief/') },
      { id: 'intro', icon: 'slideshow', label: t('sysIntro'), href: join(currentBase, 'data/docs/system/intro/') },
      { id: 'architecture', icon: 'schema', label: t('sysArch'), href: join(currentBase, 'data/docs/system/architecture/') },
      { id: 'sysnotes', icon: 'info', label: t('sysNotes') },
    ]
    return items.map(function (item) { return menuRow(item, active) }).join('')
  }

  function flowItemsHtml(active) {
    var items = [
      { id: 'dataflow', icon: 'account_tree', label: t('dataflow') },
      { id: 'skillcall', icon: 'hub', label: t('skillCall') },
      { sep: true },
      { id: 'skills', icon: 'menu_book', label: t('skills') },
      { id: 'reports', icon: 'description', label: t('reports') },
    ]
    return items.map(function (item) { return menuRow(item, active) }).join('')
  }

  function thesisItemsHtml(active) {
    var items = [
      { id: 'thesis', icon: 'slideshow', label: t('thesisSlides'), href: join(currentBase, 'data/docs/thesis/') },
      { id: 'paper', icon: 'article', label: t('thesisPaper'), href: join(currentBase, 'data/docs/thesis/paper/') },
      { id: 'improve', icon: 'lightbulb', label: t('thesisImprove'), href: join(currentBase, 'data/docs/thesis/paper/?doc=improve') },
      { id: 'reading', icon: 'menu_book', label: t('thesisReading'), href: join(currentBase, 'data/docs/thesis/paper/?doc=reading') },
    ]
    return items.map(function (item) { return menuRow(item, active) }).join('')
  }

  function designItemsHtml() {
    // 設計＝單一 tab；靜態文件頁只給一顆進 /doc 的按鈕（區塊在分頁左欄切）
    return menuRow({
      id: 'design',
      icon: 'palette',
      label: t('design'),
    }, 'design')
  }

  function isSysActive(active) {
    return active === 'brief' || active === 'intro' || active === 'slides' || active === 'architecture'
      || active === 'docs' || active === 'sysnotes'
  }
  function isFlowActive(active) {
    return active === 'dataflow' || active === 'skillcall' || active === 'skills' || active === 'reports'
  }
  function isThesisActive(active) {
    return active === 'thesis' || active === 'paper' || active === 'improve' || active === 'reading'
  }
  function isDesignActive(active) {
    return active === 'design' || DESIGN_SECTIONS.some(function (s) { return s.id === active })
  }

  function render(el, base, active) {
    currentActive = active || ''
    currentBase = base || ''
    var dark = isDark()
    document.documentElement.classList.toggle('dark', dark)

    var sysOn = isSysActive(currentActive)
    var flowOn = isFlowActive(currentActive)
    var thesisOn = isThesisActive(currentActive)
    var designOn = isDesignActive(currentActive)

    el.innerHTML =
      '<a class="brand" href="' + join(base, '') + '" title="Adapt-Metro">' +
        icon('subway', 16) +
        '<span class="brand-name">Adapt-Metro</span>' +
      '</a>' +
      '<div class="toolbar-end">' +
        '<div class="nav-wide">' +
          '<div class="skills-wrap docs-wrap">' +
            '<button type="button" class="btn-ghost' + (sysOn ? ' active' : '') + '" id="sysBtn">' +
              '<span class="material-symbols-outlined m-icon skills-ico" style="font-size:16px">dashboard</span>' +
              '<span class="lbl">' + t('system') + '</span>' +
              icon('expand_more', 14) +
            '</button>' +
            '<div class="menu-pop docs-menu" id="sysMenu" hidden>' + sysItemsHtml(currentActive) + '</div>' +
          '</div>' +
          (isLocalHost()
            ? ('<div class="skills-wrap docs-wrap">' +
                '<button type="button" class="btn-ghost' + (flowOn ? ' active' : '') + '" id="flowBtn">' +
                  '<span class="material-symbols-outlined m-icon skills-ico" style="font-size:16px">account_tree</span>' +
                  '<span class="lbl">' + t('flowSkills') + '</span>' +
                  icon('expand_more', 14) +
                '</button>' +
                '<div class="menu-pop docs-menu" id="flowMenu" hidden>' + flowItemsHtml(currentActive) + '</div>' +
              '</div>')
            : '') +
          '<div class="skills-wrap docs-wrap">' +
            '<button type="button" class="btn-ghost' + (thesisOn ? ' active' : '') + '" id="thesisBtn">' +
              '<span class="material-symbols-outlined m-icon skills-ico" style="font-size:16px">school</span>' +
              '<span class="lbl">' + t('thesis') + '</span>' +
              icon('expand_more', 14) +
            '</button>' +
            '<div class="menu-pop docs-menu" id="thesisMenu" hidden>' + thesisItemsHtml(currentActive) + '</div>' +
          '</div>' +
          (isLocalHost()
            ? ('<div class="nav-tab-hit">' +
                '<button type="button" class="btn-ghost skills-link' + (designOn ? ' active' : '') + '" id="designBtn" data-doc-tab="design">' +
                  '<span class="material-symbols-outlined m-icon skills-ico" style="font-size:16px">palette</span>' +
                  '<span class="lbl">' + t('design') + '</span>' +
                '</button>' +
              '</div>')
            : '') +
          '<div class="info-wrap">' +
            '<button class="btn-ghost" id="relBtn" type="button">' +
              '<span class="material-symbols-outlined m-icon skills-ico" style="font-size:16px">link</span>' +
              '<span class="lbl">' + t('links') + '</span>' +
              icon('expand_more', 14) +
            '</button>' +
            '<div class="menu-pop links-menu" id="relMenu" hidden>' +
              relatedItemsHtml() +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="more-wrap nav-narrow">' +
          '<button class="btn-ghost more-btn" id="moreBtn" type="button" title="' + t('more') + '" aria-label="' + t('more') + '">' +
            icon('menu', 18) + '<span class="lbl">' + t('more') + '</span>' +
            icon('expand_more', 14) +
          '</button>' +
          '<div class="menu-pop" id="moreMenu" hidden>' +
            '<div class="menu-label">' + t('system') + '</div>' +
            sysItemsHtml(currentActive) +
            (isLocalHost()
              ? ('<div class="menu-sep"></div><div class="menu-label">' + t('flowSkills') + '</div>' +
                  flowItemsHtml(currentActive))
              : '') +
            '<div class="menu-sep"></div>' +
            '<div class="menu-label">' + t('thesis') + '</div>' +
            thesisItemsHtml(currentActive) +
            (isLocalHost()
              ? ('<div class="menu-sep"></div><div class="menu-label">' + t('design') + '</div>' +
                  designItemsHtml())
              : '') +
            '<div class="menu-sep"></div>' +
            '<div class="menu-label">' + t('links') + '</div>' +
            relatedItemsHtml() +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn-icon theme-toggle" id="themeBtn" title="' +
          (dark ? t('themeLight') : t('themeDark')) + '" aria-label="' +
          (dark ? t('themeLight') : t('themeDark')) + '">' +
          icon(dark ? 'light_mode' : 'dark_mode', 16) +
        '</button>' +
        '<button type="button" class="btn-ghost lang-toggle" id="langBtn" title="Language">' +
          '<span class="lang-opt' + (locale() === 'en' ? ' on' : '') + '">EN</span>' +
          '<span class="lang-sep">/</span>' +
          '<span class="lang-opt' + (locale() === 'zh' ? ' on' : '') + '">中</span>' +
        '</button>' +
      '</div>'
  }

  function bindMenus(el) {
    function closeAll() {
      el.querySelectorAll('.menu-pop').forEach(function (m) { m.hidden = true })
      el.querySelectorAll('#relBtn, #sysBtn, #flowBtn, #thesisBtn, .more-btn').forEach(function (b) {
        if (b) b.classList.remove('active')
      })
    }
    function wire(btnId, menuId) {
      var btn = el.querySelector('#' + btnId)
      var menu = el.querySelector('#' + menuId)
      if (!btn || !menu) return
      btn.addEventListener('click', function (e) {
        e.stopPropagation()
        var open = menu.hidden
        closeAll()
        if (open) {
          menu.hidden = false
          btn.classList.add('active')
        }
      })
    }
    wire('sysBtn', 'sysMenu')
    wire('flowBtn', 'flowMenu')
    wire('thesisBtn', 'thesisMenu')
    wire('relBtn', 'relMenu')
    wire('moreBtn', 'moreMenu')

    el.querySelectorAll('[data-doc-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goDocTab(btn.getAttribute('data-doc-tab'))
      })
    })

    var themeBtn = el.querySelector('#themeBtn')
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var next = !isDark()
        writePrefs({ dark: next })
        document.documentElement.classList.toggle('dark', next)
        remount()
      })
    }
    var langBtn = el.querySelector('#langBtn')
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        writePrefs({ locale: locale() === 'en' ? 'zh' : 'en' })
        document.documentElement.lang = locale() === 'zh' ? 'zh-Hant' : 'en'
        remount()
      })
    }

    if (!docBound) {
      docBound = true
      document.addEventListener('mousedown', function (e) {
        if (!rootEl || !rootEl.contains(e.target)) {
          if (!rootEl) return
          rootEl.querySelectorAll('.menu-pop').forEach(function (m) { m.hidden = true })
        }
      })
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && rootEl) {
          rootEl.querySelectorAll('.menu-pop').forEach(function (m) { m.hidden = true })
        }
      })
    }
  }

  function remount() {
    if (!rootEl) return
    render(rootEl, currentBase, currentActive)
    bindMenus(rootEl)
  }

  function setActive(id) {
    currentActive = id || ''
    remount()
  }

  function isEmbed() {
    try {
      if (new URLSearchParams(location.search).get('embed') === '1') return true
      if (window.self !== window.top) return true
    } catch (e) { return true }
    return false
  }

  /**
   * 跳到主內容——鍵盤進站的第一個停留點（主應用在 App.vue／DocApp，
   * 靜態文件頁在這裡補）。這幾頁沒有統一的 <main>，所以拿 header 後面第一個元素當目標，
   * 補上 id 與 tabindex="-1"（不然按了連結焦點不會真的移過去）。
   */
  function ensureSkipLink(el) {
    if (document.querySelector('.skip-link')) return
    // 連結先插進去（要當 body 的第一個元素，Tab 才會先停在它）
    var a = document.createElement('a')
    a.className = 'skip-link'
    a.href = '#main-content'
    a.textContent = t('skipToContent')
    if (!el.parentNode) return
    el.parentNode.insertBefore(a, el)
    // **目標要等 body 解析完才找得到**：這支 script 掛在 <header> 後面、邊解析邊執行，
    // 執行的當下 header 之後除了 <script> 什麼都還沒進 DOM——直接找會找到 null 然後放棄
    // （2026-08-07 實測就是這樣靜靜沒生效，畫面完全看不出來）。
    var wire = function () {
      var target = document.getElementById('main-content')
      if (!target) {
        var n = el.nextElementSibling
        while (n && /^(SCRIPT|LINK|STYLE|TEMPLATE)$/.test(n.tagName)) n = n.nextElementSibling
        if (!n) { a.remove(); return }   // 真的沒有主內容就別留一個死連結
        if (!n.id) n.id = 'main-content'
        target = n
      }
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      a.href = '#' + target.id
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wire, { once: true })
    } else {
      wire()
    }
    // 把「Tab 從哪裡開始」拉回文件開頭。投影片頁載入時會 `scrollIntoView` 縮圖，
    // 那會把瀏覽器的 sequential focus navigation starting point 移到頁面中段——
    // 於是第一次按 Tab 直接跳到投影片裡的連結，**跳過**排在最前面的這個 skip link
    // （2026-08-07 實測：第一個 Tab 落在「回到系統」）。只在沒有任何東西持有焦點時
    // 才動，不會搶走使用者的焦點。
    var resetTabStart = function () {
      if (document.activeElement && document.activeElement !== document.body) return
      document.body.tabIndex = -1
      try { document.body.focus({ preventScroll: true }) } catch (e) { document.body.focus() }
    }
    if (document.readyState === 'complete') resetTabStart()
    else window.addEventListener('load', function () { setTimeout(resetTabStart, 0) }, { once: true })
  }

  function mount(target, opts) {
    // /doc iframe 內嵌：不掛第二層 header（外層 TopToolbar 已有）
    if (isEmbed()) {
      document.documentElement.classList.add('embed')
      document.body.classList.add('embed')
      var hide = typeof target === 'string' ? document.querySelector(target) : target
      if (hide) hide.hidden = true
      return
    }
    opts = opts || {}
    var el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return
    rootEl = el
    el.classList.add('app-toolbar')
    ensureSkipLink(el)
    currentBase = opts.base || ''
    currentActive = opts.active || ''
    remount()
  }

  window.AdaptMetroToolbar = { mount: mount, setActive: setActive }
})()
