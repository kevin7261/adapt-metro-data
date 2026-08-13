/**
 * 表格欄寬拖拉（`/doc` 靜態頁版）——`src/lib/tableColResize.js` 的鏡像。
 *
 * 靜態頁不吃 Vue、也不吃 `style.css`（見 [[ui-responsive]]「不要只改一邊」），所以行為
 * 要在這裡再寫一份；**兩邊改動必須同步**：把手類名 `.th-resize`、`.tbl-resizable`、
 * localStorage 鍵 `adapt-metro:prefs:v1` 的 `tableCols` 欄位、⌥←／⌥→ 鍵位都一致，
 * 拖過的欄寬在主站與文件頁之間共用。
 *
 * 差別只有兩個：① 這裡沒有 i18n 物件，字串直接讀 `prefs.locale`；
 * ② 靜態頁的表格是一開始就在 DOM 裡的，所以只在 `DOMContentLoaded` 掃一次
 * （沒有 v-html／分頁切換那種後來才長出來的表格）。
 *
 * 掛法：頁面底部 `<script src="…/_shared/table-col-resize.js"></script>` 即可，
 * 不必呼叫任何東西——它自己會找 `table[data-col-resize]`、`[data-col-resize-scope] table`，
 * 以及**文件頁預設全收**（全部 table 扣掉 header／nav／.app-toolbar 那種鉻層），
 * 因為那些頁的表格都是內容表——這些頁沒有 <main>，內容在 section.card／section.slide 底下。
 */
(function () {
  'use strict'
  var KEY = 'adapt-metro:prefs:v1'
  var MIN_W = 40
  var STEP = 16
  var STEP_FINE = 4
  var widths = {}
  var locale = 'en'

  function readPrefs() {
    try {
      var p = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (p && typeof p === 'object') {
        if (p.locale === 'zh' || p.locale === 'en') locale = p.locale
        if (p.tableCols && typeof p.tableCols === 'object') widths = p.tableCols
      }
    } catch (e) { /* private / corrupt */ }
  }

  var saveTimer = null
  function scheduleSave() {
    if (saveTimer) return
    saveTimer = setTimeout(function () {
      saveTimer = null
      try {
        var p = JSON.parse(localStorage.getItem(KEY) || '{}')
        if (!p || typeof p !== 'object') p = {}
        p.tableCols = widths
        localStorage.setItem(KEY, JSON.stringify(p))
      } catch (e) { /* private */ }
    }, 400)
  }

  function label(name) {
    return locale === 'zh'
      ? '調整「' + name + '」欄寬（拖拉，或 ⌥←／⌥→）'
      : 'Resize column ' + name + ' (drag, or ⌥← / ⌥→)'
  }

  function tableIdOf(table) {
    if (table.dataset.colResize) return table.dataset.colResize
    var scope = table.closest('[data-col-resize-scope]')
    if (scope) {
      var all = scope.querySelectorAll('table')
      return scope.dataset.colResizeScope + '#' + Array.prototype.indexOf.call(all, table)
    }
    // 文件頁預設：內容區的表格全收，以頁面路徑＋序號當 id，重開同一頁才對得回去。
    // 用「全部 table 扣掉鉻層」而不是 `main table`——這些頁沒有 <main>，
    // 內容掛在 section.card（架構圖）或 section.slide（投影片）底下。
    var i = Array.prototype.indexOf.call(contentTables(), table)
    if (i < 0) return null
    return 'doc:' + location.pathname + '#' + i
  }

  /** 內容表＝文件裡的表格，扣掉頂欄／導覽那種鉻層用的表。 */
  function contentTables() {
    return Array.prototype.filter.call(document.querySelectorAll('table'), function (t) {
      return !t.closest('header, nav, .app-toolbar')
    })
  }

  function headerCellsOf(table) {
    var rows = table.tHead && table.tHead.rows
    var row = rows && rows.length ? rows[rows.length - 1] : table.rows[0]
    return row ? Array.prototype.slice.call(row.cells) : []
  }

  function ensureCols(table, n) {
    var cg = table.querySelector(':scope > colgroup')
    if (!cg) {
      cg = document.createElement('colgroup')
      table.insertBefore(cg, table.firstChild)
    }
    while (cg.children.length < n) cg.appendChild(document.createElement('col'))
    return Array.prototype.slice.call(cg.children)
  }

  function varNamesOf(table) {
    var raw = table.dataset.colResizeVars
    return raw ? raw.split(',').map(function (x) { return x.trim() }).filter(Boolean) : []
  }

  function applyWidth(table, idx, px) {
    var vars = varNamesOf(table)
    if (idx < vars.length) { table.style.setProperty(vars[idx], px + 'px'); return }
    var cols = ensureCols(table, idx + 1)
    if (cols[idx]) cols[idx].style.width = px + 'px'
  }

  function currentWidth(table, idx, cells) {
    var id = tableIdOf(table)
    var saved = id && widths[id] ? widths[id][idx] : null
    if (typeof saved === 'number') return saved
    return cells[idx] ? Math.round(cells[idx].getBoundingClientRect().width) : 100
  }

  function setWidth(id, idx, px) {
    if (!widths[id]) widths[id] = {}
    widths[id][idx] = px
    scheduleSave()
  }

  function enhance(table) {
    if (table.__tcr) return
    var id = tableIdOf(table)
    if (!id) return
    var cells = headerCellsOf(table)
    if (cells.length < 2) return
    table.__tcr = true
    table.classList.add('tbl-resizable')

    var saved = widths[id] || {}
    Object.keys(saved).forEach(function (k) { applyWidth(table, Number(k), saved[k]) })

    cells.forEach(function (cell, idx) {
      if (idx >= cells.length - 1) return
      if (cell.querySelector(':scope > .th-resize')) return
      var h = document.createElement('span')
      h.className = 'th-resize'
      h.dataset.tcrCol = String(idx)
      h.setAttribute('role', 'separator')
      h.setAttribute('aria-orientation', 'vertical')
      h.setAttribute('tabindex', '0')
      var name = (cell.textContent || '').trim().slice(0, 40)
      h.setAttribute('aria-label', label(name))
      h.setAttribute('title', h.getAttribute('aria-label'))
      if (getComputedStyle(cell).position === 'static') cell.style.position = 'relative'
      cell.appendChild(h)
    })
  }

  function scanAll() {
    var seen = []
    function add(list) {
      Array.prototype.forEach.call(list, function (el) {
        if (seen.indexOf(el) < 0) seen.push(el)
      })
    }
    add(document.querySelectorAll('table[data-col-resize]'))
    Array.prototype.forEach.call(document.querySelectorAll('[data-col-resize-scope]'), function (sc) {
      add(sc.querySelectorAll('table'))
    })
    add(contentTables())
    seen.forEach(enhance)
  }

  document.addEventListener('pointerdown', function (e) {
    var h = e.target.closest && e.target.closest('.th-resize')
    if (!h || e.button !== 0) return
    var table = h.closest('table')
    var id = table && tableIdOf(table)
    if (!id) return
    e.preventDefault()
    e.stopPropagation()
    var idx = Number(h.dataset.tcrCol)
    var startX = e.clientX
    var startW = currentWidth(table, idx, headerCellsOf(table))
    h.classList.add('dragging')
    function move(ev) {
      var w = Math.max(MIN_W, Math.round(startW + (ev.clientX - startX)))
      applyWidth(table, idx, w)
      setWidth(id, idx, w)
    }
    function up() {
      h.classList.remove('dragging')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }, true)

  document.addEventListener('keydown', function (e) {
    if (!e.altKey) return
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    var h = e.target && e.target.closest && e.target.closest('.th-resize')
    if (!h) return
    var table = h.closest('table')
    var id = table && tableIdOf(table)
    if (!id) return
    e.preventDefault()
    var idx = Number(h.dataset.tcrCol)
    var d = (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? STEP_FINE : STEP)
    var w = Math.max(MIN_W, currentWidth(table, idx, headerCellsOf(table)) + d)
    applyWidth(table, idx, w)
    setWidth(id, idx, w)
  })

  readPrefs()
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAll)
  } else {
    scanAll()
  }
})()
