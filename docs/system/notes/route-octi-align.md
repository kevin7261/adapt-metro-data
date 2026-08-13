---
description: 八向格網（論文直線鏈 octi，Bast et al. 2020）完整規格（非 skill）——邊依 ldeg（線度數＝鄰接段路線數含重複加總）排序逐邊定案：未定案端點在半徑 WINDOW 內的空格候選中選一對，成本＝位移懲罰 1.5·d＋格網跳數成本（H/V 0、對角 0.5 每跳；非八方向弦＋2＝2×BEND[3]）＋站上已定案同路線段的線彎；定案格關閉（一格一站），逐頂點批＋嚴格改善套用（finishBatches strict）。
layer: algorithm-octi
---

# 八向格網（route-octi-align）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

system note `route-paper-align` 的論文鏈之一（kind `octi`）。論文：Bast, Brosi, Storandt
2020 _Metro Maps on Octilinear Grid Graphs_（`data/thesis/6_…pdf` +
`6_bast-grid_演算法說明.md`）。

## 演算法（整數格網適配）

1. **ldeg 與邊的排序（§4.1 / STEP 3）**：`ldeg(v)` ＝相鄰各段上的線數的**非唯一**
   加總（Σ_e |L(e)|，§4.1 的 "non-unique"——同一條線若通過相鄰的兩段會被算兩次）；
   邊的順序照論文的 UNPROCESSED → DANGLING → PROCESSED 排程：從 ldeg 最高的車站起算，
   接著反覆取 ldeg 最高的 DANGLING 車站，逐一（按 ldeg 遞減）把它尚未處理的
   鄰居定案——複雜的轉乘樞紐先搶到自己的格子，版面由內而外長出來。
2. **逐邊定案**：每條邊尚未定案的端點，取其原位置 Chebyshev 半徑 `R=WINDOW` 內的
   **空格**當候選（已經定案的端點就只剩它定案的那一格）；對每一組 (A,B) 計算成本：
   - **位移懲罰（STEP 4）**：與原位置的歐氏距離 ×
     `(c_h + c_m) = 1.5`；
   - **格網移動成本**：跳數 × HOP（H/V = 0、對角 = 0.5；
     `HOP = [C_H − A_OFF, C_H − A_OFF + 0.5] = [0, 0.5]`，
     成本偏移量 `A_OFF = c_45 − c_135 = 1`，即論文 STEP 2 的輕微 H/V 偏好）；
     若弦不是恰好八個方向之一，再加 `+2`（`2 * BEND[3]`，
     **兩個** 135° 彎，去一次回一次）。
     註：本實作省略了論文在每個走過的節點上的 `+a`（為直行通過收費），
     所以 H/V 弦的長度不被收費（在 WINDOW ±2 之下影響有限）；
   - **站上的線彎（§4.4）**：對該頂點上同一條線已定案的段所產生的彎折 `BEND[Δ]`，
     其中 Δ ＝兩個出向的循環差：
     `Δ=4` 直通 `c_180=0`、`Δ=3` → `c_135=1`、`Δ=2` → `c_90=1.5`、`Δ=1` → `c_45=2`、
     `Δ=0`（兩段同向重疊）→ Infinity（不允許）。
3. **定案＝關閉資源**：一旦選定，兩端就地定案，該格從空格集合中移除
   （一格一站——對應論文的「資源競爭就是拓撲保證」）。
4. 收尾：**逐頂點批次 + 嚴格**，照定案順序（`finishBatches` strict）——貪婪定案程序的
   個別提案品質不一，整批在淨損時全部退回會把好的跟壞的一起丟掉。

## 與論文的差異

- 下游模型是「非中途站之間單一條直線段」，無法表達 Bast 的多彎 Dijkstra 路徑——
  被適配過來的是**候選集合 + 成本模型 + 貪婪定案順序**，用於節點指派
  （單連結繞線）；多彎繞線是 Frame 畫線器的工作（system note `route-frame-draw` 本來就是
  同一個精神的 H/V/45 重畫）。
- 論文的區域搜尋交替不做（`iteratePost` 的不動點迭代扮演同樣的角色）。
- 論文在失敗時隨機重排重試也不做——沒有合法候選對的邊就直接跳過
  （該頂點留在原地，`finishBatches` 不套用它）；區域 Voronoi（S∩T 分區）
  換成拒絕 A==B 的候選對。

## 實作約定

- `buildOctiAlign(skeleton, cells, cols, rows)`（`src/stores/paper/octi.js`，由
  `paperAlign.js` re-export）→ `{ cellAfter, stats }`；`stats` 帶有 `settled`（已定案的
  頂點數）。
- kind `octi`，tab 名取自 i18n key `paper.octi` ＝「⑥八向格網」；由
  `iteratePost` 迭代；採用經過
  `applyTargets(…, scoreAlign)`（`countHVD` 只是統計；見 system note `route-paper-align`）。

## 修改時

成本參數（c_45 / c_90 / c_135 / c_h / c_m / a）、半徑與排序的改動，要在本文件與
`paper/octi.js` 之間保持同步。視圖同步見
[[route-view-sync]]。
