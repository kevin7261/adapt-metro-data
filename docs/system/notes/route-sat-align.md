---
description: SAT規劃（論文直線鏈 sat，Fuchs 2022）完整規格（非 skill）——與 MILP規劃完全同模型（每段 3 個八方向候選、一熱、同頂點同向硬子句、S1(λ1=3)/S2(λ2=2) 軟子句），求解器換成 DPLL 分支定界（most-constrained 優先、同頂點 veto 即時過濾、目前最佳成本剪枝、節點上限 60000 超限元件退回原方向），座標重建＋snapAligned＋finishPass 與③相同。
layer: algorithm-sat
---

# SAT規劃（route-sat-align）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

system note `route-paper-align` 的論文鏈之一（kind `sat`）。論文：Fuchs 2022
_SAT-based Optimization of Octolinear Metro Map Layouts_（`data/thesis/8_…pdf` ＋
`8_sat_演算法說明.md`）。論文自我定位是「與 Nöllenburg 同一個模型，把求解技術換成 SAT」——
這條鏈忠實對應了這一點：模型（`dirModel`）與座標重建（`coordsFromDirs` ＋ `snapAligned`）
與 system note `route-milp-align` **完全共用**（兩者都放在 `paper/_dirModel.js`）；只有求解器不同。

## 演算法（適配到整數格網）

1. 模型與 ③ 相同：每段 3 個候選方向（一熱）；離開同一頂點的兩段同向＝硬子句 veto；
   S1 彎折 ＋ S2 相對位置＝軟子句（MaxSAT 語意）。模型本身——最接近的八方向扇區 ±1
   共 3 個候選、成本 `λ1(=3)`·彎折 ＋ `λ2(=2)`·非原方向——記在 system note `route-milp-align`。
2. **DPLL 分支定界**：
   - 分支順序＝配對數最多的段優先（most-constrained 啟發式）；
   - 走訪布林指派樹，累積成本 ≥ 目前最佳時立刻剪枝；
   - 同頂點同向的 veto 在展開時即時過濾（同頂點已指派的鄰居方向為 Infinity → 跳過）；
   - 60000 的節點預算保證會終止；超過的元件**退回原方向**
     （對應論文在大實例上的 timeout；在 stats 記為 `fallback`）。
3. 座標重建與收尾與 MILP 相同：`coordsFromDirs` 鬆弛 40 輪 →
   `snapAligned` → `finishPass`（夾進 WINDOW ＋ 硬規則）。

## 與 MILP 鏈的關係

在同一個模型下，兩條鏈常常產出完全相同的結果；差異來自求解器在超過上限的元件上的行為
（MILP＝feedback 枚舉上限 2187 試驗或 2e6 節點·試驗，SAT＝60000 節點預算）。這正是論文所要展示的「求解技術可互換」。

## 與論文的差異

- **`L_min` 刻意偏離**：對於一串收縮成單一段的 deg-2 頂點鏈，⑧ §2.3.2（同
  ③ §5.1）把最小邊長設為 `L_min ← n+1`（n＝被收縮路徑上的頂點數）；
  `paper/_dirModel.js` 刻意取**幾何上必要**的值 `n−1` = `hops` = 被吞掉的中途站數 + 1，
  也就是把 k 個中途站等距重新插回去所需的下界。論文的值比較寬鬆；在這裡採用它會把段推得比重新插回
  所需的還開，在整數格網上白白賠掉 H/V 對齊。**system note `route-milp-align` 有相同的偏離、
  相同的敘述**——兩條鏈共用 `dirModel`／`coordsFromDirs`，所以只能兩邊一起改。
- **其餘所有模型層級的與論文差異都和 ③ 完全一樣**，只記一次，在
  system note `route-milp-align` 的「與論文的差異」（H4 邊間距／平面性不進模型、改由
  `applyTargets` 硬規則把關；deg-2 鏈收縮在骨架階段就做完了；全域求解拆成逐連通元件；
  S1 對共用彎折只計一次而非逐線計；同一條路線分歧臂之間的彎折也計入）。這裡不要重述——
  這條鏈與 ③ **只差在求解器**。
- 求解器側：論文用外部 SAT 求解器的 MaxSAT 編碼，換成行程內的 DPLL 分支定界，
  跑在相同的一熱變數與相同的軟子句成本上；論文在大實例上的 timeout 變成
  60000 節點預算加上退回原方向。

## 實作約定

- `buildSatAlign(skeleton, cells, cols, rows)`（src/stores/paper/sat.js；paperAlign.js 只做 re-export）
  → `{ cellAfter, stats }`；stats 帶有 `comps`／`fallback`。
- kind `sat`，tab 名取自 i18n key `paper.sat` ＝「⑧SAT規劃」；由 `iteratePost` 迭代；採用經過
  `applyTargets(…, scoreAlign)`（`countHVD` 只是統計；見 system note `route-paper-align`）。

## 修改時

分支順序／預算的改動，必須在本文件與 `paper/sat.js` 之間保持同步；模型的改動必須同步到
system note `route-milp-align`（共用的 `dirModel`，在 `paper/_dirModel.js`）。
視圖同步見 [[route-view-sync]]。
