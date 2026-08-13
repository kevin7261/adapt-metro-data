---
description: MILP規劃（論文直線鏈 milp，Nöllenburg & Wolff 2011）完整規格（非 skill）——每段 3 個八方向候選（最近扇區 ±1）、成本＝λ1(=3)·同路線相鄰段彎折＋λ2(=2)·偏離原方向、同頂點同向硬 veto；配對圖分元件用生成樹 DP＋feedback 段枚舉精確求解方向指派（3^|fb| 上限 2187 試驗或 2e6 節點·試驗），再鬆弛重建座標（40 輪）＋snapAligned 量化＋finishPass 套用。
layer: algorithm-milp
---

# MILP規劃（route-milp-align）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

system note `route-paper-align` 的論文鏈之一（kind `milp`）。論文：Nöllenburg & Wolff 2011
_Drawing and Labeling High-Quality Metro Maps by Mixed-Integer Programming_
（`data/thesis/3_…pdf` ＋ `3_milp_演算法說明.md`）。

## 演算法（適配到整數格網）

1. **方向指派模型 `dirModel`**（與 system note `route-sat-align` **完全同一個模型**；只有求解器不同）：
   - 每段 3 個候選方向＝目前幾何最接近的八方向扇區，±1（論文的扇區限制）。
   - 成本＝`λ1(=3)`·Σ 同一條路線相鄰兩段之間的彎折 bd（S1，線彎折，
     bd = 4 − 循環差）＋ `λ2(=2)`·Σ 不是原方向的候選（S2，
     相對位置）；S3（總長度最小化）留給下游的格網縮減——
     那一步正是這張圖的全域壓縮。
   - 硬性限制：離開同一個頂點的兩段不得有相同的出向（H2 邊環繞序中可線性化的部分）。
2. **精確求解**：段當節點、共用同一頂點的段對當邊 → 拆成連通元件 → 生成樹 ＋ 回邊 →
   枚舉 feedback 段集合（`3^|fb|`，上限 2187 次試驗或 2e6 節點·試驗；超過上限的元件退回保留原方向）
   ＋ 樹 DP（沿用已退役的整數規劃鏈的生成樹 DP ＋ feedback 枚舉機構，
   變數換成各段的八方向）。
3. **座標重建 `coordsFromDirs`**：逐段把兩端拉向理想的相對位置「沿選定的方向、長度＝目前的投影長度
   （下界＝H3 最小邊長 `hops`，也就是被吞掉的中途站數 + 1）」，鬆弛 40 輪；
   `snapAligned` 做對齊感知的量化 → `finishPass` 夾進 WINDOW ＋ 硬規則。

## 與論文的差異

- H4 邊間距／平面性不進模型——改由 `applyTargets` 的硬規則把關
  （等同論文的 lazy constraint：違規的移動就是不套用）。
- deg-2 頂點在骨架階段就已經收縮掉（黑點），所以論文的鏈收縮前處理不需要。
- 全域 MILP 換成逐元件的精確 DP——變數定義域仍是完整枚舉，只是拆開來解。
- S1 對多條線共用的同一個彎折只計一次（論文式 (8) 是逐線加總，所以 k 條線共用的彎折會被計 k 次）。
- 同一條路線在某個頂點分歧時，分歧臂之間的彎折也會計入（論文假設路線是路徑，那裡不會出現這種情況）。
- **`L_min` 刻意偏離**：對於一串收縮成單一段的 deg-2 頂點鏈，③ §5.1（同
  ⑧ §2.3.2）把最小邊長設為 `L_min ← n+1`（n＝被收縮路徑上的頂點數）；
  `paper/_dirModel.js` 刻意取**幾何上必要**的值 `n−1` = `hops` = 被吞掉的中途站數 + 1，
  也就是把 k 個中途站等距重新插回去所需的下界。論文的值比較寬鬆；在這裡採用它會把段推得比重新插回
  所需的還開，在整數格網上白白賠掉 H/V 對齊。**system note `route-sat-align` 有相同的偏離、
  相同的敘述**——兩條鏈共用 `dirModel`／`coordsFromDirs`，所以只能兩邊一起改。

## 實作約定

- `buildMilpAlign(skeleton, cells, cols, rows)`（src/stores/paper/milp.js；paperAlign.js 只做 re-export）
  → `{ cellAfter, stats }`；stats 帶有 `comps`（元件數）／`fallback`（超過上限而退回的數量）。
- kind `milp`，tab 名取自 i18n key `paper.milp` ＝「③MILP規劃」；由 `iteratePost` 迭代；採納走
  `applyTargets(…, scoreAlign)`（`countHVD` 只進 stats；見 system note `route-paper-align`）。

## 修改時

候選數／權重／枚舉上限的改動，必須在本文件與 `paper/milp.js` 之間保持同步；
`dirModel`／`coordsFromDirs` **與 SAT規劃共用**，位於
`paper/_dirModel.js`（記在 system note `route-paper-align`）——那裡的改動也必須同步到
system note `route-sat-align`。視圖同步見 [[route-view-sync]]。
