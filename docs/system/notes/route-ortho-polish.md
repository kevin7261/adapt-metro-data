---
description: ②直角爬山完整規格（非 skill）——Stott et al. 2011 爬山法的直角變體（tab 名「②直角爬山」）；以 flow base 為輸入，方向準則 |sin 2θ|＋octi 權重 ×3（27750），iteratePost 到不動點。≠基本爬山（系統說明 route-hillclimb）。實作 buildOrthoPolish（hillClimb.js）
layer: algorithm-ortho
---

# 直角爬山（route-ortho-polish）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

直線演算法論文鏈②（kind `ortho`，i18n tab 名 key `paper.ortho`
＝「②直角爬山」，掛在 `paperAlign.js` 的 `PAPER_KINDS` 上；build 住在
`hillClimb.js` 的 `buildOrthoPolish`；總目錄是 system note `route-paper-align`）。
論文：Stott, Rodgers, Martínez-Ovando, Walker 2011 _Automatic Metro Map Layout Using
Multicriteria Optimization_（`data/thesis/2_…pdf` ＋ `2_hillclimbing_演算法說明.md`）。
輸入＝**flow base**（Gridding 網格化後 ／ 有矩形時是矩形後的 `cellOf`／`cellAfter`；
它**不吃基本 HC**），目標＝把彩色頂點做短距離移動，使**水平／垂直的段數最大化**
（一段是 H/V ⇔ 它的兩端恰好有一個座標相同）。

與 system note `route-hillclimb` 的關係：基本爬山是畫廊的參考圖 ／ 同一套準則與硬規則的本體；
這條鏈是它的 **|sin 2θ| 直角變體**，直接吃 flow base，而且**不需要先跑 HC**。

## 演算法

它就是跑一次 `buildHillClimb`，只差三件事：

1. **方向準則 c_N5 換成 |sin 2θ|**（`opts.ortho: true` → `dirLobes = 2`）——只有 0°／90° 不用成本，
   45° 變成最貴的方向，段會被拉到水平／垂直上。
2. **octi 權重 ×3**（`DEFAULT_W.octi * 3 = 9250 × 3 = 27750`；補償 4 方向的理想比八方向更嚴格）。
3. **冷卻／輪數與論文本體相同**（`maxMove = 8`／`maxRounds = 5`：半徑 R 從 `maxMove`
   起算，每輪 `R = max(1, R − 1)` 冷卻，所以 5 輪只會讓 R 從 8 降到 4；
   `opts.maxMove`／`opts.maxRounds` 可以覆寫）。

其他四個準則、4 條硬規則＋矩形護欄與群集移動全部繼承自 system note `route-hillclimb`。
單趟之所以停下來，是因為**輪數預算（5）用完了**——不是因為半徑觸底、也不是因為找不到改善——
所以外面再用 `iteratePost` 把它自己的輸出餵回去，**迭代到不動點**
（上限 `POST_ITER_CAP = 20`；適應度單調遞減保證終止）。
採納走爬山本體自己的適應度（不是 `scoreAlign` 的逐批套用；其他鏈①③〜⑨見 system note `route-paper-align`）。

## 特性（全量 599 城）

- 迭代後全網 H/V **+42.9%**（論文後處理鏈裡第二強）；最多 12 次迭代。
- 它是唯一「從迭代得益最多」的一條——與上述一致：限制單趟的是輪數預算，不是區域最佳解。
- 它本質上是另一次爬山，可以自己在 flow base 上跑；適應度與「先跑基本 HC 再打磨」不同，
  但管線**不把先跑 HC 當成前提**。

## 實作契約

- `buildOrthoPolish(skeleton, cells, cols, rows, opts)`（`src/stores/hillClimb.js`）
  ＝ `buildHillClimb(..., { ortho: true, weights: { octi: 27750 }, ...opts })`。
- UI 透過 `iteratePost(buildOrthoPolish, ...)` 呼叫它；tab 徽章顯示
  `n/20`（D3Tab 的 `iterBadge`＝已用迭代數／`POST_ITER_CAP`）；`stats`
  含 `hvBefore/hvAfter/iters/converged` 以及適應度。
- 下游與其他論文鏈相同：結果 → movewise（移點／移線／移枝／併格，壓縮已內嵌）→ 循環結果見
  system note `route-movewise-loop`（獨立的壓縮格 tab 已移除）。

## 修改這裡時

準則／權重／半徑的變更，要讓本文件與 `hillClimb.js` 保持同步；共用機構
（makeMover／applyTargets／iteratePost）記在 system note `route-hillclimb`；論文鏈的契約記在
system note `route-paper-align`。
