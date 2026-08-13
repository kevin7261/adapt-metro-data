---
description: 路徑簡化（論文直線鏈 path，Merrick & Gudmundsson 2007）完整規格（非 skill）——每條路線的頂點鏈當折線，C=8 方向、ε-圓刺穿求最少 link 的 C-directed 簡化（reach＋BFS 分層，最大彎角 90°＋最小 link 長 1 段），頂點垂直投影到刺穿它的 link；路線依轉乘站數排序漸進、先處理的定案（makeApplier）。實作在 `src/stores/paper/path.js`。
layer: algorithm-path
---

# 路徑簡化（route-path-align）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

system note `route-paper-align` 的論文鏈之一（kind `path`）。論文：Merrick & Gudmundsson
2007 _Path Simplification for Metro Map Layout_（`data/thesis/7_…pdf` +
`7_merrick-path-simplification_演算法說明.md`）。

## 演算法（整數格網適配）

1. **逐線分解**：每條線的段集合分解成極大開鏈
   （從 deg-1 端點起算；剩下的環從任一起點開始都可以）。線的順序照
   **重要性＝轉乘頂點的數量**（§3 (1)），已處理過的線的頂點標為 `fixed`——
   後面的線只能移動它獨佔的頂點（不動點機制的簡化版）。
2. **C-directed 最少 link（Definition 1）**：C ＝ 8 方向，每個點上有一個 ε-圓
   （ε ＝各段長度的中位數夾進 [1, WINDOW]——論文建議從
   「相鄰車站平均距離的 1〜2 倍」開始；固定點的 ε 收縮成
   1e-6 ＝「恰好通過這個點」）。
   `reach(i, c)` ＝從點 i 出發、方向為 c 的單一條 link 能**依序刺穿**到的最遠索引：
   把可行的偏移區間收縮後取其中點，再沿 link 參數單調驗證（貪婪）。把 link 的
   邊界包絡塌縮成單一條中點線是**本專案的適配**——論文 §2.2 的直觀版本是
   「每次重算刺穿區間」（包絡仍然在）；這裡不保留 Theorem 3 的最少 link 保證，
   改由 `applyTargets` 硬規則加上 `scoreAlign` 的採用把關。
3. **BFS 分層求最少 link 數**：狀態＝（點索引，這條 link 的方向）——記下方向正是
   §3 那兩個品質延伸得以成立的原因：**最大彎角 α = 90°**
   （相鄰兩條 link 的循環方向差 > 2 就是內角小於 90° 的銳彎，直接跳過；
   差為 0 是同方向、不算新的 link）與**最小 link 長度**（每條 link 都必須往前
   至少吃掉一個輸入點 `j > i`，所以不會出現零長度的 link）。若 ε 與彎角限制無法涵蓋（罕見），
   該鏈就放棄。
4. **投影**：沿 link 回走；每條 link 的偏移取其兩端的中點（有固定端時以固定端為準），
   中間的頂點則**垂直投影**到該 link 上。每條鏈都**就地套用**（`makeApplier`），
   所以後面的線看到的是已經定案的版面（漸進）。

## 與論文的差異

- 論文的多路徑同時衝突消解不做——改由逐線漸進處理加上 `applyTargets` 硬規則
  （不壓點／不產生新交叉）等效把關。
- 位移夾進 WINDOW（±2 格）：這是短距離的後處理，不是整張圖重新佈局。
- 接合頂點（同時屬於前一條與後一條 link）會**被後一條 link 的垂直投影覆寫**——
  論文的 ComputePath 取的是兩條線的交點；前一條 link 的尾端因此可能歪掉，
  由 `scoreAlign` 的淨改善採用做後盾。
- **每一條** link 的偏移最後都取其兩端的中點（有固定端時以固定端為準），
  而且**不會夾回** reach 累積出來的可行帶 [lo,hi]——因此輸出不再保證刺穿每一個 ε-圓；
  只剩 `applyTargets` 硬規則加上 `scoreAlign` 的淨改善決定結果留不留。

## 實作約定

- `buildPathAlign(skeleton, cells, cols, rows)`（`src/stores/paper/path.js`；由
  `src/stores/paperAlign.js` 註冊）→ `{ cellAfter, stats }`；`stats` 帶有 `chains`（處理過的
  鏈數）與 `links`（link 總數）。
- kind `path`，tab 名取自 i18n key `paper.path` ＝「⑦路徑簡化」；由
  `iteratePost` 迭代；採用經過
  `applyTargets(…, scoreAlign)`（`countHVD` 只是統計；見 system note `route-paper-align`）。

## 修改時

ε／方向集合／最大彎角／排序的改動，要在本文件與
`src/stores/paper/path.js` 之間保持同步。視圖同步見 [[route-view-sync]]。
