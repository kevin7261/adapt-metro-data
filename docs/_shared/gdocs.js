/* 文件門面（Design chrome）——論文本文／系統架構共用。
 *
 * AdaptMetroGDocs.mount(target, {
 *   title,                 // 標題文字
 *   titleId,               // 可選，標題元素 id（預設 gdTitle）
 *   storageKey,            // localStorage 前綴：adapt-metro:<key>-zoom / -ol-*
 *   zoomTargets,           // CSS 選擇器字串或陣列，套 CSS zoom
 *   toolbarRightHtml,      // 可選，工具列右側 HTML（如顯示／原文 chip）
 *   defaultOutlineWidth,   // 大綱預設寬（預設 272）
 * })
 */
(function () {
  var ZOOM_OPTS = [
    { v: '0.75', t: '75%' },
    { v: '0.9', t: '90%' },
    { v: '1', t: '100%', selected: true },
    { v: '1.25', t: '125%' },
    { v: '1.5', t: '150%' },
  ]

  function zoomOptionsHtml() {
    return ZOOM_OPTS.map(function (o) {
      return '<option value="' + o.v + '"' + (o.selected ? ' selected' : '') + '>' + o.t + '</option>'
    }).join('')
  }

  /**
   * 工具列＝**只有控制項、靠左、沒有標題文字**（2026-08-12 使用者裁決；投影片與文件頁一致）。
   * `titleId` 的空節點仍然留著——論文本文那頁會把目前在看哪一份寫進去（`gdTitle`），
   * 拿掉會讓那段 `textContent = doc.label` 直接爆；隱藏起來就好。
   * 「重新整理」與投影片同一顆（`gdRefresh`＝本頁 `location.reload()`）。
   */
  function chromeHtml(opts) {
    var titleId = opts.titleId || 'gdTitle'
    var right = opts.toolbarRightHtml || ''
    return (
      '<div class="tool-bar doc-chrome">' +
        '<span class="panel-title" id="' + titleId + '" hidden></span>' +
        '<div class="tool-bar-group">' +
          '<button class="btn-icon" id="gdRefresh" type="button" title="重新整理（重抓最新檔）" aria-label="重新整理">' +
            '<span class="material-symbols-outlined m-icon" style="font-size:16px">refresh</span>' +
          '</button>' +
        '</div>' +
        '<span class="tool-bar-sep"></span>' +
        '<div class="tool-bar-group">' +
          '<select class="select" id="zoomSel" title="縮放">' + zoomOptionsHtml() + '</select>' +
        '</div>' +
        (right ? '<span class="tool-bar-sep"></span><div class="tool-bar-group">' + right + '</div>' : '') +
      '</div>'
    )
  }

  function bindOutline(storageKey, defaultW) {
    var gdBody = document.getElementById('gdBody')
    var outline = document.getElementById('outline')
    var olOpen = document.getElementById('olOpen')
    var olClose = document.getElementById('olClose')
    var resizer = document.getElementById('olResizer')
    if (!gdBody || !outline) return

    var colKey = 'adapt-metro:' + storageKey + '-ol-collapsed'
    var wKey = 'adapt-metro:' + storageKey + '-ol-width'

    function setCollapsed(v) {
      gdBody.classList.toggle('ol-collapsed', v)
      try { localStorage.setItem(colKey, v ? '1' : '0') } catch (e) {}
    }
    if (olClose) olClose.addEventListener('click', function () { setCollapsed(true) })
    if (olOpen) olOpen.addEventListener('click', function () { setCollapsed(false) })
    try {
      if (localStorage.getItem(colKey) === '1') setCollapsed(true)
    } catch (e) {}

    function setOutlineWidth(px) {
      outline.style.setProperty('--side-panel-width', px + 'px')
      outline.style.width = px + 'px'
      outline.style.flexBasis = px + 'px'
    }
    try {
      var saved = parseInt(localStorage.getItem(wKey) || '', 10)
      if (saved >= 160 && saved <= 420) setOutlineWidth(saved)
    } catch (e) {}

    if (!resizer) return
    var dragging = false, startX = 0, startW = 0
    resizer.addEventListener('mousedown', function (e) {
      dragging = true
      startX = e.clientX
      startW = outline.getBoundingClientRect().width
      resizer.classList.add('dragging')
      document.body.classList.add('ol-dragging')
      e.preventDefault()
    })
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return
      var w = Math.min(420, Math.max(160, startW + (e.clientX - startX)))
      setOutlineWidth(w)
    })
    window.addEventListener('mouseup', function () {
      if (!dragging) return
      dragging = false
      resizer.classList.remove('dragging')
      document.body.classList.remove('ol-dragging')
      try {
        localStorage.setItem(wKey, String(Math.round(outline.getBoundingClientRect().width)))
      } catch (e) {}
    })
    resizer.addEventListener('dblclick', function () {
      setOutlineWidth(defaultW)
      try { localStorage.setItem(wKey, String(defaultW)) } catch (e) {}
    })
  }

  /**
   * 左側「文件大綱」的操作方式**比照主應用的視圖清單**（`src/lib/listKeyboard.js`
   * ＋`.list-pane`／`.list-row`）：靜態頁載不到那支，所以在這裡實作同一套語意。
   *
   *  - **roving tabindex**：Tab 只進出這一組，不逐列跳（20 幾列逐列 Tab 等於出不去）
   *  - ↑／↓（縱向大綱另收 ←／→）換列、Home／End 跳頭尾、Enter／Space 觸發
   *  - 打字 typeahead：1 秒內連打可組字，跳到下一個開頭符合的列
   *  - **`.active` 跟著畫面走**：捲到哪一節，哪一列亮（同主應用「清單＝現在在看的東西」）
   *  - 標題文字包一層 `.list-row-label`，過長時截字（與主應用同一個類）
   *
   * 大綱列是 `<a href="#id">`（架構頁）或 `<button>`（論文本文），Enter／Space 原生就會
   * 觸發，所以這裡只補「非原生控件」那一種，不重複觸發。
   */
  function bindOutlineNav() {
    var list = document.getElementById('olList')
    if (!list) return
    var typed = '', typedAt = 0

    var rows = function () {
      return Array.prototype.filter.call(
        list.querySelectorAll('.list-row'),
        function (r) { return r.offsetParent !== null || r.getClientRects().length },
      )
    }
    var wrapLabels = function () {
      Array.prototype.forEach.call(list.querySelectorAll('.list-row'), function (r) {
        if (r.querySelector('.list-row-label')) return
        var txt = r.textContent
        if (!txt || !txt.trim()) return
        r.textContent = ''
        var s = document.createElement('span')
        s.className = 'list-row-label'
        s.textContent = txt
        r.appendChild(s)
      })
    }
    var setRoving = function (target) {
      var rs = rows()
      rs.forEach(function (r) { r.tabIndex = (r === target ? 0 : -1) })
      if (!rs.length) return
      if (!target || rs.indexOf(target) < 0) rs[0].tabIndex = 0
    }
    var markActive = function (row) {
      Array.prototype.forEach.call(list.querySelectorAll('.list-row'), function (r) {
        var on = r === row
        r.classList.toggle('active', on)
        if (r.getAttribute('role') === 'tab') r.setAttribute('aria-selected', on ? 'true' : 'false')
      })
      setRoving(row)
    }
    var move = function (from, delta) {
      var rs = rows()
      var i = rs.indexOf(from)
      var next = rs[Math.max(0, Math.min(rs.length - 1, (i < 0 ? 0 : i) + delta))]
      if (next) { next.tabIndex = 0; next.focus() }
    }
    var jump = function (which) {
      var rs = rows()
      var next = which === 'home' ? rs[0] : rs[rs.length - 1]
      if (next) { next.tabIndex = 0; next.focus() }
    }

    wrapLabels()
    setRoving(list.querySelector('.list-row.active'))
    // 論文本文那頁的大綱是載入後才生出來的——補包一次標籤、重設 roving
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function () {
        wrapLabels()
        setRoving(list.querySelector('.list-row.active'))
      }).observe(list, { childList: true })
    }

    list.addEventListener('keydown', function (e) {
      var row = e.target.closest ? e.target.closest('.list-row') : null
      if (!row || e.metaKey || e.ctrlKey || e.altKey) return
      var k = e.key
      if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); move(row, 1) }
      else if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); move(row, -1) }
      else if (k === 'Home') { e.preventDefault(); jump('home') }
      else if (k === 'End') { e.preventDefault(); jump('end') }
      else if ((k === 'Enter' || k === ' ') && row.tagName !== 'A' && row.tagName !== 'BUTTON') {
        e.preventDefault(); row.click()
      } else if (k.length === 1 && /\S/.test(k)) {
        var now = Date.now()
        typed = (now - typedAt < 1000) ? typed + k : k
        typedAt = now
        var rs = rows()
        var start = rs.indexOf(row)
        for (var n = 1; n <= rs.length; n++) {
          var cand = rs[(start + n) % rs.length]
          if ((cand.textContent || '').trim().toLowerCase().indexOf(typed.toLowerCase()) === 0) {
            cand.tabIndex = 0; cand.focus(); break
          }
        }
      }
    })
    list.addEventListener('click', function (e) {
      var row = e.target.closest ? e.target.closest('.list-row') : null
      if (row) markActive(row)
    })

    // 捲到哪一節就亮哪一列（大綱列的 href="#id"／data-target 指向該節）
    var targets = []
    Array.prototype.forEach.call(list.querySelectorAll('.list-row'), function (r) {
      var id = (r.getAttribute('href') || '').replace(/^#/, '') || r.getAttribute('data-target')
      var sec = id ? document.getElementById(id) : null
      if (sec) targets.push({ row: r, sec: sec })
    })
    /**
     * `.active` 要跟著「現在在看的東西」——但兩種文件頁的「現在」不是同一回事：
     *  - **系統架構**＝一次只顯示一節（大綱列本來就是 `role="tab"`，其餘節 height 0）
     *    → 跟著 **hash** 走。
     *  - **論文本文**＝一份長文捲動 → 跟著 **捲動位置** 走。
     * 所以先量一次：有兩節以上真的有高度才當長文，否則當分頁。
     * （寫死其中一種的話，另一種會整頁卡在第一列或最後一列不動。）
     */
    var laidOut = targets.filter(function (t) { return t.sec.getBoundingClientRect().height > 0 }).length
    var syncByHash = function () {
      var id = (location.hash || '').replace(/^#/, '')
      var hit = id && targets.find(function (t) { return t.sec.id === id })
      markActive(hit ? hit.row : targets[0].row)
    }
    if (targets.length && laidOut < 2) {
      window.addEventListener('hashchange', syncByHash)
      syncByHash()
    } else if (targets.length) {
      var LINE = 140
      var scroller = (function (el) {
        for (var n = el; n && n !== document.body; n = n.parentElement) {
          var ov = getComputedStyle(n).overflowY
          if (ov === 'auto' || ov === 'scroll') return n
        }
        return window
      })(targets[0].sec)
      var spy = function () {
        var cur = targets[0]
        for (var i = 0; i < targets.length; i++) {
          if (targets[i].sec.getBoundingClientRect().top <= LINE) cur = targets[i]
        }
        if (cur) markActive(cur.row)
      }
      var ticking = false
      var onScroll = function () {
        if (ticking) return
        ticking = true
        requestAnimationFrame(function () { ticking = false; spy() })
      }
      scroller.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      spy()
    }
  }

  function bindZoom(storageKey, targets) {
    var zoomSel = document.getElementById('zoomSel')
    // 原生 <select> 的系統彈層禁用（/design）——就地升級成 .menu-pop 下拉。
    // 升級後 .value／.options／change 照舊，所以底下的程式不用改。
    if (window.AdaptMetroSelect) window.AdaptMetroSelect.upgrade(zoomSel, { icon: 'zoom_in' })
    if (!zoomSel || !targets || !targets.length) return
    var zKey = 'adapt-metro:' + storageKey + '-zoom'
    var els = targets.map(function (sel) { return document.querySelector(sel) }).filter(Boolean)

    function applyZoom() {
      var z = parseFloat(zoomSel.value) || 1
      els.forEach(function (el) { el.style.zoom = z })
    }
    try {
      var z = localStorage.getItem(zKey)
      if (z && Array.from(zoomSel.options).some(function (o) { return o.value === z })) {
        zoomSel.value = z
      }
    } catch (e) {}
    applyZoom()
    zoomSel.addEventListener('change', function () {
      applyZoom()
      try { localStorage.setItem(zKey, zoomSel.value) } catch (e) {}
    })
  }

  function mount(target, opts) {
    opts = opts || {}
    var el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return
    document.body.classList.add('gdocs-page')
    el.outerHTML = chromeHtml(opts)
    var storageKey = opts.storageKey || 'gdocs'
    var zoomTargets = opts.zoomTargets
    if (typeof zoomTargets === 'string') zoomTargets = [zoomTargets]
    var targets = zoomTargets || ['.gd-pageless']
    var defaultW = opts.defaultOutlineWidth || 200
    /* chrome 插在 body 前段時，後面的 gd-body 可能尚未解析——延後綁定 */
    function bind() {
      var refreshBtn = document.getElementById('gdRefresh')
      if (refreshBtn) refreshBtn.addEventListener('click', function () { location.reload() })
      bindOutline(storageKey, defaultW)
      bindOutlineNav()
      bindZoom(storageKey, targets)
    }
    if (document.getElementById('gdBody')) bind()
    else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bind)
    } else {
      setTimeout(bind, 0)
    }
  }

  window.AdaptMetroGDocs = { mount: mount }
})()
