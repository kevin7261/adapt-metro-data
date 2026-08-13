/**
 * 靜態文件頁的 Design 下拉（取代原生 <select> 的系統彈層）。
 *
 * 為什麼要有這支：`/design` 的規定是「禁裸 <select>」——原生彈層是作業系統畫的，
 * 主題化不了，macOS 上選中項還會自己長一個 ✓，跟全站 .menu-pop＋.menu-item--pick
 * 的勾完全兩種樣子。主應用早就用 AppSelect.vue 解決了，但**靜態頁不吃 style.css、
 * 也沒有 Vue**，所以另外用這支原生 JS 做同一件事（類名與 design-shell.css 共用）。
 *
 * 做法＝**就地升級**，不是取代：原生 <select> 留在 DOM 裡當狀態來源（只是視覺隱藏），
 * 所以 `sel.value`／`sel.options`／`addEventListener('change')` 全部照舊可用——
 * gslides.js／gdocs.js 一行都不必改。可見的部分改成 .select 觸發鈕＋.menu-pop 面板。
 *
 * 用法：AdaptMetroSelect.upgrade(document.getElementById('zoomSel'))
 *      AdaptMetroSelect.upgrade(sel, { icon: 'fit_screen' })   // 觸發鈕改成 icon button
 * 重複呼叫同一個 <select> 是安全的（已升級過就直接回傳）。
 *
 * `opts.icon`＝觸發鈕只畫圖示（`.btn-icon`，同工具列其他按鈕），目前選到哪一項改用
 * title／aria-label 說（2026-08-12 使用者裁決「都是 iconbutton」）。下拉面板不變，
 * 仍是 `.menu-pop`＋`.menu-item--pick`，與主應用的工具列下拉同一款。
 */
(function () {
  var openPop = null // 同時只開一個（點別的地方、Escape 都要關得掉）

  function closeOpen() {
    if (!openPop) return
    openPop.pop.remove()
    openPop.trigger.setAttribute('aria-expanded', 'false')
    openPop = null
  }

  document.addEventListener('click', function (e) {
    if (openPop && !openPop.wrap.contains(e.target)) closeOpen()
  })
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openPop) {
      var t = openPop.trigger
      closeOpen()
      t.focus()
    }
  })

  function labelOf(sel) {
    var o = sel.options[sel.selectedIndex]
    return o ? o.textContent : ''
  }

  function upgrade(sel, opts) {
    opts = opts || {}
    if (!sel || sel.dataset.dsUpgraded === '1') return sel
    sel.dataset.dsUpgraded = '1'

    var wrap = document.createElement('span')
    wrap.className = 'ds-select'
    sel.parentNode.insertBefore(wrap, sel)
    wrap.appendChild(sel)
    // 原生控件留著當狀態來源；只拿掉視覺與 Tab 停留點（焦點改在觸發鈕上）
    sel.classList.remove('select')
    sel.classList.add('ds-select-native')
    sel.setAttribute('tabindex', '-1')
    sel.setAttribute('aria-hidden', 'true')

    var trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.className = opts.icon ? 'btn-icon' : 'select'
    trigger.setAttribute('aria-haspopup', 'listbox')
    trigger.setAttribute('aria-expanded', 'false')
    if (opts.icon) {
      var ico = document.createElement('span')
      ico.className = 'material-symbols-outlined m-icon'
      ico.style.fontSize = '16px'
      ico.textContent = opts.icon
      trigger.appendChild(ico)
    } else {
      trigger.textContent = labelOf(sel)
    }
    wrap.appendChild(trigger)

    function sync() {
      var base = sel.title || 'select'
      if (opts.icon) {
        // icon button 上沒有文字，目前選到哪一項只能靠 title／aria-label
        trigger.title = base + '：' + labelOf(sel)
        trigger.setAttribute('aria-label', trigger.title)
        return
      }
      trigger.textContent = labelOf(sel)
      if (sel.title) trigger.title = base
      trigger.setAttribute('aria-label', base)
    }
    sync()
    // 別人用程式改 value（例如還原上次縮放）時，觸發鈕也要跟著更新
    sel.addEventListener('change', sync)

    function open() {
      closeOpen()
      var pop = document.createElement('div')
      pop.className = 'menu-pop ds-select-pop'
      pop.setAttribute('role', 'listbox')
      Array.prototype.forEach.call(sel.options, function (o, i) {
        var b = document.createElement('button')
        b.type = 'button'
        b.className = 'menu-item menu-item--pick' + (i === sel.selectedIndex ? ' active' : '')
        b.setAttribute('role', 'option')
        b.setAttribute('aria-selected', i === sel.selectedIndex ? 'true' : 'false')
        var check = document.createElement('span')
        check.className = 'menu-item-check'
        // 勾位一律存在（未選中時是空的）——否則選中／未選中的標籤會左右跳動
        if (i === sel.selectedIndex) {
          check.className += ' material-symbols-outlined m-icon'
          check.textContent = 'check'
        }
        var label = document.createElement('span')
        label.className = 'menu-item-label'
        label.textContent = o.textContent
        b.appendChild(check)
        b.appendChild(label)
        b.addEventListener('click', function () {
          sel.value = o.value
          sel.dispatchEvent(new Event('change', { bubbles: true }))
          sync()
          closeOpen()
          trigger.focus()
        })
        pop.appendChild(b)
      })
      wrap.appendChild(pop)
      trigger.setAttribute('aria-expanded', 'true')
      openPop = { wrap: wrap, pop: pop, trigger: trigger }
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation()
      if (openPop && openPop.trigger === trigger) closeOpen()
      else open()
    })

    return sel
  }

  window.AdaptMetroSelect = { upgrade: upgrade }
}())
