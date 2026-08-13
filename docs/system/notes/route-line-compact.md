---
description: 移線完整規格（非 skill）——movewise 四步鏈的第 2 步（原「直線縮減」），把整條直線當一個剛體搬動來換取更多水平／垂直段。運作概念：同軸共線段先用 union-find 串成一條「直線」，且**跨相交點串接**（轉乘／分歧／黃色交叉被直穿時整條一起動），整條一次平移 1 格、八方向含 45°；採納條件是邊界段 H/V 淨增最多者優先、都沒有才挑邊界段總長縮最多者，全網直線數永不可變少，每一步過 validShift 硬規則與跨距上限。何時呼叫：移點跑到不動點之後、移枝之前，由程式網絡循環每一輪的第二階段自動觸發。被誰呼叫：`movewiseStage('line', …)`，呼叫端是 D3Tab（網頁）與 `straighteningCompactLoop`（循環）。在哪執行：`src/stores/movewise.js` 的純函式 `lineCompactPass`，瀏覽器與 Node CLI 共用。結果：回傳新的整數格佈局，**本身不落檔**（`role:'step'`，現算），收斂後由循環結果統一寫進 `network-loop/`；收斂保證＝每步讓（−H/V 數, 邊界總長）以字典序嚴格下降。
layer: linecompact
---

# 移線（route-line-compact）

本文件是該演算法／規格的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

movewise 四步鏈的**第 2 步**；輸入＝ system note `route-endpoint-move` 之後的佈局。
下一步＝ system note `route-branch-shift`（同一套採納條件 `rigidShiftCandidates`，只差群集怎麼切）。
實作：`src/stores/movewise.js` 的
`lineCompactPass(skeleton, cells, cols, rows, {limit, skip})`（單一掃描 pass）。

## 規則

- **直線**＝同軸共線段經 union-find 串成的連通元件（`lineComponents`），
  且**跨相交點串接**——轉乘、分歧或交叉點若被這條直線直穿，就整條一起動。
  篩選：元件至少 2 個頂點、且不得包含全圖所有頂點
  （`c.length >= 2 && c.length < pos.size`）。
- **八方向各 ±1 格**（`DIRS8`：上下左右＋45° 對角，一次一格）。
- 採納優先序（二擇一，且 H/V 永不可變少）：
  1. **邊界段 H/V 淨增 > 0**（`boundaryHvDelta`）——優先挑淨增最大者。
  2. 若都沒有，但**邊界段總長變短**（`-boundaryLenDelta > 1e-9`）——挑縮最多者。
  另需通過：system note `route-span-cap`（`boundarySpanOk`）＋ validShift 硬規則
  （不壓點／不新增交叉／拓撲不變）。
- **全網直線數永不可變少。** 這是硬規則、不是啟發式——也就是上面「H/V 不可變少」
  那一條在執行的事（`if (hv < 0) continue`）。
- **而且是逐段：本來已經是直線的邊界段，一段都不准被折彎**（`boundaryKeepsHV`，
  `STRICT_NO_BEND`，2026-08-06 使用者裁決）。只比總數不夠——折彎甲段又拉直乙段時
  `boundaryHvDelta` 為 0、檢查會過，但畫面上真的有一條直線被折出彎來。
  只需檢查邊界段：內部段在剛體平移下原封不動。
- **再加頂點層：同 route 原本直穿的站不可以變成轉角**（`boundaryKeepsStraight`）。
  垂直段變水平段兩者都算 H/V，段層一定放行，但那個站已經折了 90°——判準與
  system note `route-endpoint-move` 的 `isStraightThrough` 共用（只認 H/V 直穿，45° 排除）。
  受影響的頂點＝邊界段的兩個端點；其餘頂點的入射方向在剛體平移下完全不變。
- **tie-break**（排序五層）：H/V 淨增 → 縮短量 → **同路線彎折成本下降** → dc 升序 → dr 升序。
  彎折成本的定義與移點共用（見 system note `route-endpoint-move`）；在剛體平移下只有
  **邊界段的兩個端點**角度會變，所以只算那些頂點。**它只排序、不採納**——當採納條件會與
  併格互相拉扯（實測不收斂），位能因此維持 (−H/V, 邊界總長) 不變。

## 收斂

每一步都讓 (−H/V 數, 邊界總長) 以**字典序**嚴格下降 → 有界，因此必然終止。

## 歷史裁決（2026-07）

- 原本可以「跳到最近的已佔用欄／列」（距離不限）＋ ±2；使用者改成一次一格。
- 曾經限制成「水平線只能上下移、垂直線只能左右移」→ 四方向 → 八方向（含 45°）。
- 採納條件改成「直線變多優先，否則路線變最短」（縮小網格不再是主要的採納條件）。
- **「全網直線數永不可變少」是使用者明定的規則**——也就是上面「H/V 不可變少」
  那一條在執行的事。
