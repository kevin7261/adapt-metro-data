---
description: 權重驅動的 Frame 版面簡化（論文 §九，開關在 StyleBar 工具列、播放控制在底部面板的「權重」分頁）完整規格（非 skill）——link weight → 非均勻欄寬列高（`weightedAxes`／`intervalAxes`，取 max 不取 sum）→ 在新像素座標重跑 buildFrameMap；含每 5 秒自動重抽、`animateToWeights` 動畫過渡（FRAME_ANIM_MS=700，內插的是格線比例不是折線頂點、fast 幀、最後一幀完整品質）、rAF 迴圈自我配速（`await render()` 之後才排下一幀）與中途站縮減（UI 標籤；隱藏中途站——`opts.hideStops`／`minStopPx` 預設 5、全域 cutoff T、回傳 `hidden`／`hiddenMaxT`）。
layer: frame
---

# 權重驅動的 Frame 版面簡化（route-frame-weight）

本文件是該演算法／規格的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

版面簡化（論文 §九，v1 已實作）**不改拓撲**：weight（流量／重要性）→ 非均勻欄寬列高 →
在**新像素座標重跑 buildFrameMap**（八方向約束以版面 pixel 為準）。實作：
`src/stores/frameWeight.js`（純函式）。

**UI 在工具列＋底部面板的「權重」分頁，不在 StylePanel 的分頁**——`StylePanel.vue` 的
`TABS` 裡**沒有**權重這一頁（`viewKind==='frame'` 時只多加 `grid`／`eval`／`compare` 三頁）。
分工（2026-08-08 使用者裁決「把隨機權重的功能移到下面 bottom view 中的一個 tab 叫權重 tab，
可以設多久隨機一次和 play stop，請參考動畫的設定」）：

- **底部面板的「權重」分頁**（`StyleWeightTab.vue`，掛在 `AttributeTable.vue` 的
  `panelTab === 'weight'`）＝**權重的全部設定**：`▶／⏸`（開始／暫停自動重抽）、`⏹`
  （停止並回到均勻＝清權重表，同播放器的 stop 語意）、間隔秒數（`frameAutoSec`，
  預設 5、範圍 0.5–600）、「隨機一次」，以及**權重網格／顯示權重數字／中途站縮減／
  最小站距**四個開關。工具列另有一顆 `equalizer` 開關鈕（`LayerChromeActions` 的
  `showWeight`）直接開到這個分頁，同動畫／逐步的作法。
  版面是**一整排**（使用者：「請放同一排就好，不夠再自動換行」）——`.anim-player--wrap`
  只在寬度不夠時折行，不預先排成兩排、也不用橫向捲軸。
- **工具列**（`src/components/StyleBar.vue`）只剩**與權重無關**的那些：方向數、版面、
  網格模式。**魚眼改成 icon，接在「注意路段」後面**（③ 顯示開關那一組的最後）——
  它不進 `displayToggles`，因為那一組切的是圖層屬性（`tool.toggle`），魚眼是畫布效果（emit）。
- **播放列的版面是共用的**：`.anim-player*` 已由 `StyleAnimTab.vue` 的 scoped 提升到
  `src/components/style/style-panel.css`，動畫與權重兩個分頁吃同一份——**不要再照抄第三套**
  （`StyleStepTab` 的 `.step-player*` 是更早的一份，尚未併過來）。

兩邊都驅動 D3Tab 的 `frameWeightMode`／`regenFrameWeights`／`setFrameAutoShuffle`。

折線畫線規則本身（候選族、衝突消解、黑點放回、`buildFrameMap` 的回傳契約）是
system note `route-frame-draw` 的權威範圍；本檔只管 weight → axes → 重跑這一段。

## weight 來源與顯示

- **weight 粒度＝相鄰兩站（link），不是 cut-to-cut 段的兩端點**（使用者規則：weight
  是 2 個站點就要有）。一個 cut-to-cut 段展開成站鏈 `[a, ...interior 黑點, b]`，鏈上
  每一對相鄰站是一個無向 link（`segLinks`／`linkKey = pairKey`）。
- **weight 產生**：`randomWeights(segs)`——每個 **link** 抽一次 1–9，**反等比**
  （機率 ∝ 1/2ᵏ，小數字常見；`sampleWeight` 裡 `p[k] = 1/2^k`，累加後 uniform 抽樣）→ 少數主走廊、多數次要邊。權重分頁的**「隨機一次」**
  （`style.randomOnce`；`全部隨機（1–9）` 只是它的 `title`＝`style.randomWeightsTitle`）
  整表重抽。
- **數字顯示**：只要有 weight 就一定顯示（不限 weight 模式），標在每個 link 兩站連線
  中點（interior 黑點位置：Frame 用 `posAfter`、縮減網格用 `placeBlacks`）。
  要不要標由**權重分頁**的「顯示權重數字」開關控制（2026-08-08 由工具列搬進來）——
  旗標＝D3Tab 的 `frameShowWeights`（預設 true，`setFrameShowWeights` 切換），
  經 `weight-show-nums` 傳進 `AttributeTable` 再給 `StyleWeightTab` 的 `show-nums`。
  **那顆開關本身的顯示條件**＝`weight-has`（`frameWeights.size > 0`）——先有權重表才有數字可標。
- **自動重抽**（`setFrameAutoShuffle`）：按下權重分頁的 `▶` 之後 `setInterval` 每
  **`frameAutoSec` 秒**（預設 5，可調 0.5–600）`regenFrameWeights` 整表重抽 → 動畫過渡到
  新版面（離開 tab／unmount 清 timer；改秒數會重掛計時器並立刻抽一次）。
  `⏸` 只停計時器、畫面留在目前這組；`⏹`（`stopFrameShuffle`）停計時器**並清掉權重表**，
  版面回均勻——這是播放器 stop「回到起點」的語意，不是暫停。
  舊的工具列按鈕（`style.autoRandom`⇄`style.stopRandom`）已於 2026-08-08 移除。
- **鐵律：路網不可以消失**（2026-08-03）：權重動畫／自動重抽**與**魚眼拖曳／淡入淡出
  期間，Frame 路網都必須留在畫面上。中間幀與收尾（完整品質）bake 一律走
  `frameFastRepaint`（在既有 DOM 上冪等 `drawScene`——進場不做 `selectAll('*').remove()`）。
  快速幀跑不動時（含魚眼淡入時 `s` 還沒過 `fisheyeActive` 門檻），**保留前一幀**，
  不得退回會清空畫面的完整 `render()`。魚眼淡出／關閉同樣以
  `frameFastRepaint({ settle:true })` 收尾。必須跑的完整 `render()` 若已存在
  `lines-layer`，清空要延到 `drawScene` 前一行。

## 非均勻欄列

- **非均勻欄列**（`weightedAxes(pos, segs, weights, cols, rows, area, minFrac=0.25)`）：欄寬列高由 link weight **取 max 不取 sum**（這一欄
  多重要看最忙那條）；方向相容——算 X 欄看 H/45° link（`dc >= dr`）、Y 列看 V/45° link（`dr >= dc`）。interior 黑點
  無格座標 → 依鏈上索引在 a→b 之間**線性內插**（`t0 = l.i / l.n`）取該 link 所跨的欄／列。權重 0 的欄／列
  不消失（保留 `minFrac`≈0.25× 均勻寬，其餘依正權重分配）；外框固定。
  正規化由共用的 `axisEdges(wArr, n, total, o, minFrac)` 實作：每個區間 = `minU + rest*(w/sumW)`。
- **網格模式與權重是兩個正交的設定**（2026-08-08 使用者裁決，原本權重是第三種網格模式）：
  - **模式 `frameWeightMode`**＝`'uniform'`（版面網格，預設＝隨面板長寬比拉伸填滿）／
    `'square'`（方形網格，正方格 letterbox）。二選一在工具列的「網格」下拉
    （`style.weightMode`，選項 `style.gridUniform`／`style.gridSquare`）。
  - **權重網格 `frameWeightOn`**＝true／false，**預設 true**，工具列 chip `style.gridWeight`
    （排在「隨機權重」前面）。它問的是「**在當下的版面／網格下**，欄寬列高要不要照
    weight 變形」，所以與模式無關：選方形網格又開權重，變形就發生在**那個正方
    letterbox 框之內**（總範圍不變，只是欄寬列高重新分配）。實作＝`frameAxes.js` 的
    `areaW`（`squareOn ? [sqx0, sqy0, sqx0+nC*u, sqy0+nR*u] : area`），`weightedAxes`／
    `lerpAxes` 起點的 `uniformAxes`／`intervalAxes` 一律吃它。
  - 沒有權重表（`frameWeights` 空）時開著也不變形——要先按「隨機權重」／「每5秒隨機權重」
    生出來。
  - **關掉＝版面固定**（2026-08-08 使用者裁決「不是要固定了嗎？」）：關著時按「隨機權重」
    或開「每5秒隨機權重」只重抽**數字**（顯示用、中途站縮減的門檻用），欄寬列高一格都不動，
    而且**不可以自動把開關打開**（`animateToWeights` 的前段守衛）。改動理由：它還是第三種
    網格模式時，「隨機權重」本來就會自動切過去；沿用到獨立開關上就變成「明明關了、
    一按隨機權重畫面又開始變」。
  - 切換模式、開關權重、重抽都重跑 buildFrameMap；快取鍵含 `squareOn`＋模式標記
    ＋重抽序號（`sess.frameWeightSeq`）——**`squareOn` 不可漏**，有軸時 `squareMode` 恆為
    false，只看它的話「在方形框內分配」與「在整塊面板分配」會共用同一個 key。
- **`uniformAxes(cols, rows, area)`**：等寬等高的 axes（動畫起點用），列方向反轉
  （row 0＝南＝畫面底；`cellPx` 中 `rows - 1 - r`）。
- **`lerpAxes(a, b, t)`**：內插兩組 axes 的欄／列格線位置；格中心由 `[arr[i]+arr[i+1]]/2`
  取（超界 clamp 至邊界格——`centerAt`）。
- **`intervalAxes(colW, rowW, area, minFrac=0.25)`**：LLM 互動（[[route-llm-grid]]）給的
  每欄／每列區間權重，正規化進固定外框——與 `weightedAxes` 的末端變形完全相同，
  差別在權重來源（模型推理 vs 流量彙總）。`rowW[0]`＝最南列；堆疊時反轉。

## 動畫過渡

- **動畫過渡（§8.3，`animateToWeights`／`runRwdAnim`）**：weight 改變不瞬跳，而是 `requestAnimationFrame`
  **`FRAME_ANIM_MS = 700`** ms 內**內插起點 axes → 目標 axes 的格線位置**（`lerpAxes`），每幀用
  內插後的 cellPx 重算 pxPos 並經 `frameFastRepaint` 跑 `buildFrameMap(..., {fast:true})`。
  **內插的是欄／列格線比例，不是折線頂點**——否則中間幀違反八方向。`opts.fast`
  （frameMap.js）中間幀只跑一次 `routeAll`（含 4 輪衝突消掃），略過 6 輪重排／rip-up／
  窄縫救援／pass 2 軟調整，換每幀夠快；**最後一幀走
  `frameFastRepaint({ settle:true })`**（完整品質 `buildFrameMap`，一樣不清 DOM）。
  動畫幀不進 Frame 快取（sizeKey 含 `a${sess.frameAnimT.toFixed(3)}`）。權重改變重繪（含動畫幀與收尾完整 bake、
  以及權重網格模式下重建）**不蓋**「Frame 路網畫線中」overlay——版面／方形首次完整
  bake 才用 busy 提示。
- **起點幾何**：目前顯示的若已是 weight 版面（`frameWeightOn` 且 `frameWeights.size > 0`），
  從現有 weights 出發；否則從均勻網格（`null`，`lerpAxes` 起點取 `uniformAxes`）。
  權重網格由關轉開（`setFrameWeightGrid(true)`）也走同一條動畫；轉關則是瞬時重畫。
- **`frameAnimGen`** 計數器：每次啟動新動畫 `++gen`；被取代的舊 rAF 迴圈在 `gen !== sess.frameAnimGen`
  自我了斷，不留殭屍幀。

## rAF 迴圈自我配速

- **權重動畫／魚眼的迴圈要自我配速**（2026-08-03）：`fisheyeTick`／`runRwdAnim` 是 rAF、
  每 16ms 發一次 `render()`，但一次 render 約 100ms（畫線只佔 ~37ms，其餘是圖層解析與重畫
  400 多個 DOM 節點）。不等它就會每幀互相 `++renderSeq` 蓋掉、全部在 seq 檢查那裡 return＝
  **從來沒畫完**（實測魚眼 10 秒只畫完 2 次、96% 時間空白）。
  現行寫法＝**`await render()` 之後才排下一幀**（比照本檔早就這樣寫的 `gridAnimTick`；
  `fisheyeBusy` 擋重入、`frameAnimGen` 讓被取代的舊迴圈自我了斷）。
  改善後：隨機權重空白 2.35 秒→最長 0.75 秒、每 5 秒重抽 79%→13%、
  魚眼 96%→54%、重畫次數 ~2 次/10 秒→**~368 次/10 秒**。
  **`render()` 本身一字未動**——當年圖小、一次 render 在 16ms 內做得完，每幀直接發是對的；
  是負載長大超過了那個假設。
  **三個死路勿重蹈**：① 只加 await 卻不看清空時機；② 進場建隱藏暫存 `<g>` 收尾交換
  （實測堆到 465 個 `<g>`，變頓且網格錯位）；③ `clearOnce()`＋拆 `render()` 成兩個函式
  （數字好看但把流程弄複雜，已裁決不要）。**驗收要同時看空白率、重畫次數、DOM 堆積數。**

## 中途站縮減

- **中途站縮減**（UI key `style.hideStops`；§6，隱藏的是**中途站**——`opts.hideStops`／`opts.minStopPx` 預設 **5**（`frameMinStopPx = ref(5)`），使用者裁決＝站距決定
  全域 cutoff、全圖一致）：實作在 `frameMap.js` 的 `placeWhiteStops`，兩階段——① **逐段**算「讓該段均分後站距 ≥ minStopPx 所需的
  最小 weight 差門檻」（`total/(ids.length+1) ≥ minStopPx` 的寬鬆段需求 = −1），**全域 cutoff T ＝
  各段需求取 max**；② **全圖**任何中途站只要左右 link 的 weight 差 `|wOf(chain[j],chain[j+1]) - wOf(chain[j+1],chain[j+2])| ≤ T` 就隱藏。這樣
  「刪到 ≤ T」與畫面**完全一致**——寬鬆段的低差中途站也一起消失（曾試過純逐段：寬鬆段殘留
  低差中途站、與讀數矛盾，使用者否決）。**錨點（轉乘／末端／交叉）絕不隱藏**；保留的中途站
  沿弧長**重新均分**；被藏的也放回原弧長位置（`posAfter` 含所有中途站、hidden 的也有座標）。回傳 `hidden: Set`＋`hiddenMaxT = T`（沒有隱藏任何站時為 `null`）。D3Tab 不畫
  這些中途站、weight 數字合併跨過的可見路段標所跨原始 link 的 **max**。動畫每幀也套。
- **`wOf` 來源**：`opts.linkWeight` callback（D3Tab 傳 `(u, v) => linkWeight(frameWeights.value, u, v)`）。
  `linkWeight` 查不到回 1。
- **UI 的三個實際名稱**（別再寫成舊名）：
  - 開關＝工具列的 **「中途站縮減」**（`style.hideStops`；隱藏中途站）——是 `.btn-chip` 的 toggle
    （`:class="{ active: hideStops }"`），**不是** checkbox，也不叫「自動隱藏中途站」。
  - 門檻＝同組的 **「最小站距」**（`style.minStopDist`）數字輸入；**`pt` 是輸入框後面
    獨立的 `.field-unit`**，不是 label 的一部分（label 沒有「pt」）。這個欄位只在
    中途站縮減開著時才顯示。`setFrameMinStopPx` 會 clamp 到 `Math.max(1, Math.round(px || 5))`。
  - 讀數在 **D3Tab 底部狀態列**（`.ma-statusbar` 裡的 `.ma-diag`）：「最小站距 高 x
    寬 y pt」「畫布 w × h px」「已隱藏 N 站」。
  - **被隱藏站名清單在右側「資訊」tab**（`StyleInfoTab.vue` 的 `style.layoutWeights`
    InfoFold →「被隱藏的站（N）」`stopStat.hiddenNames`，可捲動），連同版面簡化／
    隨機權重／中途站縮減三段說明也都在那裡。

## D3Tab 的 Frame 快取鍵

`frameCacheKey` 組合：`FRAME_ROUTER_REV`＋`frameCompactKey`＋`activeCellModelKey()`＋
`{w}x{h}`＋`d{frameDirs}`＋`squareOn`→`s`＋模式標記（gridOn→`g{gridSeq}`／animing→`a{t}`／
weighted→`w{weightSeq}`／squareMode→`sq`／else→`u`）＋可選 fisheye warp＋可選 frozenIds。
同一鍵命中就直接用 `sess.cachedFrame`，不重跑 `buildFrameMap`。

## 與 LLM 比例來源共用

「LLM 互動」tab（`style.interactive`）是第二種「權重＝大小」比例來源（第一種是上面的流量
weight），其執行流程、權重規則、觸發端點是 [[route-llm-grid]] 的權威範圍。**末端變形與
流量權重完全同一套**：區間權重 → `intervalAxes`（frameWeight.js，與 weightedAxes 共用
`axisEdges` 正規化：外框固定、minFrac 保底）→ 新像素座標重跑 buildFrameMap（非均勻 →
不傳 lattice）→ 新結果到達時動畫過渡（內插格線、fast 幀，同 §8.3，最後一幀完整品質）。

## 尚未做（後續）

- **CSV 真實流量**（站名對照）與「顯示黑點比例」比例來源。
- **非均勻格的 A\* lattice**：`routeLattice` 目前吃均勻 `{sx,sy}`；權重／LLM 互動
  模式暫**不傳 lattice**（衝突走候選＋兜底，無 A* 救援）。之後要讓 `routeLattice`
  吃非均勻座標陣列（欄列格線＋格心），這兩種模式才有完整絕不交叉消解。

## 修改此轉換時

weight → axes → 重跑這條管線變動，**同步更新本文件與 `src/stores/frameWeight.js`**；
折線候選／衝突／黑點屬 system note `route-frame-draw` 與 `src/stores/frameMap.js`（及 `frame/` 子模組）。
動到 `buildFrameMap` 行為一律要跑 `node scripts/checkFrameParity.mjs`。
