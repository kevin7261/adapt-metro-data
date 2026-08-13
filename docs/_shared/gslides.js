/* 投影片門面（Design chrome）——系統介紹／論文內容共用。
 *
 * AdaptMetroGSlides.mount(target, { title, storageKey })
 * AdaptMetroGSlides.bindDeck({ storageKey })  // 縮放＋投影播放（需 #zoomSel #stage #deck #gsPresent）
 * 頁碼持久化：adapt-metro:<storageKey>-page（與 hash 並存；重新整理還原）
 */
(function () {
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen().catch(function () {})
  }
  // Design canvas stays 1280×720; on-screen size is scale only.
  // Default = fit (was 100% — too large in a normal browser chrome + filmstrip).
  var ZOOM_OPTS = [
    { v: 'fit', t: '符合視窗', selected: true },
    { v: '0.5', t: '50%' },
    { v: '0.75', t: '75%' },
    { v: '0.9', t: '90%' },
    { v: '1', t: '100%' },
    { v: '1.25', t: '125%' },
    { v: '1.5', t: '150%' },
  ]
  var STAGE_W = 1280
  var STAGE_H = 720
  /** Non-fullscreen fit cap — keeps slides readable without filling the whole deck. */
  var FIT_MAX = 0.82

  function zoomOptionsHtml() {
    return ZOOM_OPTS.map(function (o) {
      return '<option value="' + o.v + '"' + (o.selected ? ' selected' : '') + '>' + o.t + '</option>'
    }).join('')
  }

  /**
   * 工具列＝**只有控制項、靠左、沒有標題文字**（2026-08-12 使用者裁決
   * 「不用有說明文字」「toolbar 要靠左」）：這一頁叫什麼，dock 的分頁列／瀏覽器分頁
   * 都已經寫了，工具列再寫一次是同一句話講三遍。`opts.title` 仍收下（呼叫端不必改），
   * 只是不再畫出來。
   *
   * 「重新整理」搬到這裡（原本在外層 Vue 的分頁列上，2026-08-12 使用者裁決
   * 「重新整理按鈕要在 toolbar」）——按下去就是本頁 `location.reload()`，
   * 內嵌在 /doc 的 iframe 裡也一樣是重抓磁碟上的最新檔。
   *
   * 排法比照主應用的工具列：**重新整理排最前面**，相關的控制項各自成一個
   * `.tool-bar-group`，群組之間用 `.tool-bar-sep`（`|`）隔開。
   */
  function chromeHtml(opts) {
    void opts
    return (
      '<div class="tool-bar doc-chrome">' +
        '<div class="tool-bar-group">' +
          '<button class="btn-icon" id="gsRefresh" type="button" title="重新整理（重抓最新檔）" aria-label="重新整理">' +
            '<span class="material-symbols-outlined m-icon" style="font-size:16px">refresh</span>' +
          '</button>' +
        '</div>' +
        '<span class="tool-bar-sep"></span>' +
        '<div class="tool-bar-group">' +
          '<select class="select" id="zoomSel" title="縮放">' + zoomOptionsHtml() + '</select>' +
          '<button class="btn-icon" id="gsPresent" type="button" title="投影播放・全螢幕 (F)" aria-label="投影播放">' +
            '<span class="material-symbols-outlined m-icon" style="font-size:16px">slideshow</span>' +
          '</button>' +
        '</div>' +
      '</div>'
    )
  }

  var bound = false
  var fitFn = function () {}

  function pageKey(storageKey) {
    return 'adapt-metro:' + (storageKey || 'slides') + '-page'
  }

  /** 讀還原頁碼（1-based）。優先 hash，其次 localStorage。 */
  function readSavedPage(storageKey, total) {
    var n = parseInt((location.hash || '').replace('#', ''), 10)
    if (!isNaN(n) && n >= 1) return n
    try {
      n = parseInt(localStorage.getItem(pageKey(storageKey)) || '', 10)
      if (!isNaN(n) && n >= 1) return n
    } catch (e) {}
    return 1
  }

  function writeSavedPage(storageKey, page1) {
    try { localStorage.setItem(pageKey(storageKey), String(page1)) } catch (e) {}
  }

  function bindDeck(opts) {
    opts = opts || {}
    if (bound) return { fit: fitFn }
    var storageKey = opts.storageKey || 'slides'
    var stage = document.getElementById('stage')
    var deckEl = document.getElementById('deck')
    var zoomSel = document.getElementById('zoomSel')
    // 原生 <select> 的系統彈層禁用（/design）——就地升級成 .menu-pop 下拉。
    // 升級後 .value／.options／change 照舊，所以底下的程式不用改。
    if (window.AdaptMetroSelect) window.AdaptMetroSelect.upgrade(zoomSel, { icon: 'fit_screen' })
    var presentBtn = document.getElementById('gsPresent')
    if (!stage || !deckEl) return { fit: fitFn }

    function fitScale(pad, maxScale) {
      var w = deckEl.clientWidth - pad
      var h = deckEl.clientHeight - pad
      if (w < 32 || h < 32) return null
      var s = Math.min(w / STAGE_W, h / STAGE_H)
      if (maxScale != null) s = Math.min(s, maxScale)
      // 勿強制 0.25——窄窗實際 fit 更小，硬撐會讓 deck 出現橫向捲軸
      return Math.max(0.1, s)
    }
    function fit() {
      var scale
      var z = zoomSel && zoomSel.value
      if (document.fullscreenElement) {
        scale = fitScale(28, null)
      } else if (!z || z === 'fit') {
        scale = fitScale(64, FIT_MAX)
      } else {
        scale = parseFloat(z) || 1
      }
      // flex 尚未量出寬高時不要硬套 0.25——會負 margin 把版面撐亂；等 ResizeObserver
      if (scale == null || !isFinite(scale)) return false
      // transform 不縮 layout box——用負 margin 對齊視覺大小，避免 deck 出現幽靈捲軸
      var mx = (STAGE_W * (scale - 1)) / 2
      var my = (STAGE_H * (scale - 1)) / 2
      stage.style.transform = 'scale(' + scale + ')'
      stage.style.margin = my + 'px ' + mx + 'px'
      stage.classList.add('is-fitted')
      return true
    }
    fitFn = fit
    bound = true

    window.addEventListener('resize', fit)
    document.addEventListener('fullscreenchange', fit)

    // 重新整理後 DOMContentLoaded 時 flex 常仍是 0×0；必須等 deck 有尺寸再 fit
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () { fit() })
      ro.observe(deckEl)
    }
    // 雙 rAF：等一輪 layout／字體後再試（無 RO 的環境也有退路）
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { fit() })
    })

    /**
     * **看門狗：畫布不准無限期隱形。**
     * `.stage` 預設 `visibility:hidden`，只有 `fit()` 成功才會加 `is-fitted` 露出來——
     * 只要量不到 deck 尺寸（字體慢、視窗剛還原、ResizeObserver 沒觸發…），畫面就會停在
     * 「有導覽條與 footer、中間整片空白」，而且**不會有任何錯誤訊息**（2026-08-12 回報）。
     * 所以 1.2 秒後無論如何露出來：能量到就照 fit 的比例，量不到就用「塞得下就好」的保守值。
     */
    var reveal = function () {
      if (stage.classList.contains('is-fitted')) return
      if (fit()) return
      var w = deckEl.clientWidth || window.innerWidth || STAGE_W
      var h = deckEl.clientHeight || window.innerHeight || STAGE_H
      var s = Math.max(0.1, Math.min(FIT_MAX, Math.min(w / STAGE_W, h / STAGE_H) || FIT_MAX))
      stage.style.transform = 'scale(' + s + ')'
      stage.style.margin = ((STAGE_H * (s - 1)) / 2) + 'px ' + ((STAGE_W * (s - 1)) / 2) + 'px'
      stage.classList.add('is-fitted')
    }
    setTimeout(reveal, 1200)
    window.addEventListener('load', function () { setTimeout(reveal, 0) })

    if (zoomSel) {
      // v2: default switched to fit; ignore old 100% prefs stuck in localStorage
      var zKey = 'adapt-metro:' + storageKey + '-zoom-v2'
      try {
        var z = localStorage.getItem(zKey)
        if (z && Array.from(zoomSel.options).some(function (o) { return o.value === z })) {
          zoomSel.value = z
        }
      } catch (e) {}
      zoomSel.addEventListener('change', function () {
        try { localStorage.setItem(zKey, zoomSel.value) } catch (e) {}
        fit()
      })
    }

    if (presentBtn) {
      presentBtn.addEventListener('click', toggleFullscreen)
    }
    var refreshBtn = document.getElementById('gsRefresh')
    if (refreshBtn) refreshBtn.addEventListener('click', function () { location.reload() })

    fit()
    return { fit: fit }
  }

  function mount(target, opts) {
    opts = opts || {}
    var el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return
    document.body.classList.add('gslides-page')
    el.outerHTML = chromeHtml(opts)
    var storageKey = opts.storageKey || 'slides'
    function run() { bindDeck({ storageKey: storageKey }) }
    if (document.getElementById('stage')) run()
    else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run)
    else setTimeout(run, 0)
  }

  window.AdaptMetroGSlides = {
    mount: mount,
    bindDeck: bindDeck,
    fit: function () { fitFn() },
    toggleFullscreen: toggleFullscreen,
    readSavedPage: readSavedPage,
    writeSavedPage: writeSavedPage,
  }
})()
