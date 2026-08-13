---
description: 最小平方（論文直線鏈 lsq，Wang & Chi 2011 Focus+Context）完整規格（非 skill）——每段目標向量＝目前邊向量旋到最近八方向、長度不變（一次吸附），解 min w_o(=10)·Σ|(ṽi−ṽj)−f_ij|²＋w_g(=0.05)·Σ|ṽi−vi|²（Gauss–Seidel 60 輪），snapAligned 量化後 finishPass 單批套用。實作在 `src/stores/paper/lsq.js`（`paperAlign.js` 只 re-export）。
layer: algorithm-lsq
---

# 最小平方（route-lsq-align）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

system note `route-paper-align` 的論文鏈之一（kind `lsq`）。論文：Wang & Chi 2011
_Focus+Context Metro Maps_（`data/thesis/5_…pdf` + `5_wang-chi_演算法說明.md`）。

## 演算法（整數格網適配）

取論文的**第二階段（八方向化）**：

1. 每段的目標向量 `f_ij = f(v_i − v_j)` ＝目前的邊向量旋到
   **八個方向中最近的那一個**，長度不變（只吸附一次，不是每輪重算——
   重算會振盪）。
2. 能量 `Ω = w_o·Σ|(ṽ_i−ṽ_j) − f_ij|² + w_g·Σ|ṽ_i − v_i|²`（式 6 的 Ω_o 八方向項加上
   Ω_g 留在原地的錨定項）。w_o=10 ＝論文的權重；錨定沿用論文**第一階段**的
   w_g=0.05（論文第二階段的式 6 字面上給 Ω_g 的係數是 1，也就是 1:10）——
   這條鏈的錨定刻意較弱，位移改由 WINDOW 夾制與 scoreAlign 把關。
3. 以 **Gauss–Seidel** 解 60 輪（共軛梯度的輕量替代；系統很小且對角占優，
   收斂等效）：每個頂點的座標更新＝鄰居提示位置（提示 o + f）的加權平均
   加上留在原地的錨定。
4. 收尾：`snapAligned` 對齊感知的量化 → `finishPass`（WINDOW 夾制 + 硬規則）。

## 與論文的差異

- **第一階段（平滑變形／焦點放大）不需要**：輸入已經是 flow base 的
  規則版面（網格化後／矩形後），所以這條鏈只取八方向化的核心。
- 邊界／邊距／交叉抑制（式 7–8，位移減半）一律由 `applyTargets` 硬規則統一把關。

## 實作約定

- `buildLsqAlign(skeleton, cells, cols, rows)`——實作在 `src/stores/paper/lsq.js`，
  由 `src/stores/paperAlign.js` re-export → `{ cellAfter, stats }`；`stats` 帶有 `rounds`。
- kind `lsq`，tab 名取自 i18n key `paper.lsq` ＝「⑤最小平方」；由
  `iteratePost` 迭代；採用經過
  `applyTargets(…, scoreAlign)`（`countHVD` 只是統計；見 system note `route-paper-align`）。

## 修改時

權重／輪數的改動，要在本文件與 `paper/lsq.js` 之間保持同步。
視圖同步見 [[route-view-sync]]。
