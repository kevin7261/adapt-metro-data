/* 文件頁 footer 右下：`專案相對路徑 · 日期 時間 更新`（與主站 StatusFileMeta 同構）。
 *
 * AdaptMetroDocFooter.bind(elOrSelector, { path, url?, updated? })
 *   path     — 專案相對路徑，**完整顯示**（主站 footer 也是印整條路徑；
 *              只印檔名的話滿站都是 `index.html`，看不出這一頁是哪一支檔）
 *   url      — HEAD 取 Last-Modified 的 URL（預設 path）
 *   updated  — 後備字串（HEAD 失敗時用，例 260804 140500；沒資料＝000000 000000）
 */
(function () {
  var TAIPEI_PARTS = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Taipei',
    year: '2-digit', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })

  var CLOCK_EMPTY = '000000 000000'

  function fmtMs(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return CLOCK_EMPTY
    var parts = TAIPEI_PARTS.formatToParts(new Date(ms))
    var g = function (t) {
      var hit = parts.find(function (p) { return p.type === t })
      return String(hit && hit.value ? hit.value : '').padStart(2, '0')
    }
    return g('year') + g('month') + g('day') + ' ' + g('hour') + g('minute') + g('second')
  }

  function ensureMeta(footer) {
    var meta = footer.querySelector('.status-meta')
    if (meta) return meta
    meta = document.createElement('span')
    meta.className = 'status-meta'
    footer.appendChild(meta)
    return meta
  }

  function paint(meta, name, time, tip) {
    if (!name && !time) {
      meta.textContent = ''
      meta.removeAttribute('title')
      return
    }
    meta.textContent = time
      ? (name ? name + ' · ' + time + ' 更新' : '更新 ' + time)
      : name
    if (tip) meta.title = tip
    else meta.removeAttribute('title')
  }

  function render(footer, opts) {
    opts = opts || {}
    var path = opts.path || footer.getAttribute('data-doc-path') || ''
    var updated = opts.updated || footer.getAttribute('data-updated') || CLOCK_EMPTY
    var meta = ensureMeta(footer)
    // 完整路徑就是要顯示的東西（不是只有檔名）；title 一樣掛整條，滑過去可複製
    var name = String(path || '').replace(/\\/g, '/')
    paint(meta, name, updated || CLOCK_EMPTY, path)

    var url = opts.url || footer.getAttribute('data-doc-url') || path
    if (!url) return
    fetch(url, { method: 'HEAD', cache: 'no-store' })
      .then(function (res) {
        var lm = res.headers.get('Last-Modified')
        if (!lm) return
        var label = fmtMs(Date.parse(lm))
        paint(meta, name, label || CLOCK_EMPTY, path)
      })
      .catch(function () { /* keep fallback */ })
  }

  function bind(target, opts) {
    var el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return
    render(el, opts || {})
    return {
      set: function (next) { render(el, next || {}) },
    }
  }

  window.AdaptMetroDocFooter = { bind: bind }
})()
