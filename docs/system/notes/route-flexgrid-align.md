---
description: 彈性格網（論文直線鏈 flex，Bast et al. 2021 Flexible Base Grids）完整規格（非 skill）——⑥ 的延伸：路由核心（ldeg 排序、成本模型、貪婪定案）沿用 octi，候選改為八向 Hanan 格網節點（過所有非中途站初始位置的 H/V/45°/135° 線兩兩相交的格點，OHG-1，≥2 條線交叉）、視窗內無合規候選時退回全視窗空格（候選集短路保證合規優先，W_RELAX＝1e6 僅為論文 w∞ 的標記）、稀疏邊照付每跳成本（路徑成本保持）。實作在 `src/stores/paper/flexgrid.js`（kind `flex`）。
layer: algorithm-flex
---

# 彈性格網（route-flexgrid-align）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

system note `route-paper-align` 的論文鏈之一（kind `flex`）。論文：Bast, Brosi, Storandt
2021 _Metro Maps on Flexible Base Grids_（SSTD '21；`data/thesis/9_…pdf` +
`9_flexible-grid_演算法說明.md`）。它是 **⑥
（system note `route-octi-align`）的直接延伸**——ldeg 排序、成本參數、站上的線彎與
定案即關格的規則全部沿用，所以本文件只記差異。

## 與 ⑥ 的三個差異（＝論文的三個新機制）

1. **稀疏候選＝八向 Hanan 格網（§4.3，OHG-1）**：線集合是由非中途站的**初始**位置
   建出來的（每個點各貢獻自己的欄、自己的列、自己的 `c−r` 對角線與
   `c+r` 反對角線，各一條）；一個格子是候選 ⇔ 它落在
   **至少兩條**那樣的線上（`hananLines(c, r) >= 2`；Hanan 節點＝線與線的兩兩交點）。
   尚未定案的端點只從視窗內的空 Hanan 格中挑——候選集合大幅縮小，品質幾乎不掉
   （論文的 OHG-1：邊少 69%、誤差 +1.6%）。
2. **限制鬆弛（§3）**：當視窗內一個空的 Hanan 格都沒有時，該段不像 ⑥ 那樣被跳過——
   而是退回「視窗內所有空格」當候選。優先採用合規候選是由
   **候選集合裡的短路**保證的（`candsOf` 有 Hanan 候選就只回 Hanan，否則回全部空格）；
   `W_RELAX = 1e6` 只是對應論文 w∞ 的**標記**（加在候選的第三分量上，
   在單一頂點的候選集合裡它是常數，不參與 argmin 仲裁）。就算真的沒有合規解，該頂點仍然會定案，
   所以貪婪程序永遠不會死鎖。
3. **路徑成本保持的權重（§4.4）**：一條稀疏邊模擬完整格網上的 n 跳，被收縮掉的節點
   都以 180° 直通（`c_180 = 0`）→ `w = (n−1)·c_180 + Σ HOP`
   ＝每一跳都照收——與 ⑥ 同一個公式，所以稀疏候選下的成本仍與完整格網可比較。

## 與論文的差異

- 與 ⑥ 相同：下游模型是「非中途站之間單一條直線段」，所以多彎 Dijkstra 路徑是
  Frame 畫線器的工作（system note `route-frame-draw`）；被取用的是候選集合 + 成本模型 +
  貪婪定案順序，用於節點指派。
- **節點拆分（§2）不需要**：節點指派模型沒有 port 度數上限
  （八方向 8、六角 6、正交輻射 4 是基底格網的限制，不是這個模型的限制）。
- 替代版面（三角格網 → 六角、環-輻射 → 正交輻射，§5）不做適配——
  在本系統裡方向限制是由 Frame 畫線器的 4/8/16 方向選項承擔。
- Hanan 線集合只由初始位置建**一次**（論文同樣是由輸入圖建一次）；
  不做 Hanan 迭代（OHG-2 已經等同於完整格網——論文自己的結論：沒有意義）。

## 實作約定

- `buildFlexGridAlign(skeleton, cells, cols, rows)`（`src/stores/paper/flexgrid.js`，
  透過 `paperAlign.js` 匯出）→ `{ cellAfter, stats }`；`stats` 帶有 `settled`。
- kind `flex`，tab 名取自 i18n key `paper.flex` ＝「⑨彈性格網」；由
  `iteratePost` 迭代；採用經過
  `applyTargets(…, scoreAlign)`（`countHVD` 只是統計；見 system note `route-paper-align`）；套用
  經過 `finishBatches` strict（硬規則由 `makeMover` 把關——鬆弛只放寬**候選來源**，
  **不**放寬拓撲鐵律）。

## 修改時

Hanan 線集合的定義／`W_RELAX`／成本參數的改動，要在本文件與
`paper/flexgrid.js` 之間保持同步。視圖同步見 [[route-view-sync]]。
新增一條鏈時要更新的清單放在 system note `route-paper-align` 的
「要新增一條鏈」（To add a chain）一節——那裡是單一真相（它列舉了 build 檔、
`PAPER_KINDS`、`paper.<kind>` 與 `paper.busy.<kind>` 兩列 i18n、`frameCompacts.js`、
`vite/compactKinds.js` 與 `layerRegistry.js`）；不要在這裡重複那些識別字與版本
常數（會飄掉）。
