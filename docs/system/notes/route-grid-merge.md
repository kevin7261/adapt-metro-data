---
description: 併格完整規格（非 skill）——movewise 四步鏈的第 4 步（原「網格合併／中位集中」），把網格尺寸壓小。運作概念：相鄰 row 兩兩合併、col 兩兩合併，合併 r|r+1 等於「row > r 的點整體 row−1」的半平面剛體平移，所以**自帶壓縮**、不留空列（慣例 row 0＝南、row↑＝北，dr=−1 是往南）；合法性走 validShift 同一套硬規則（不壓點／不新增交叉／拓撲不變），不計算中位點。矩形層另有成對縮方（同時併一欄＋一列並驗 `isFourLineSquare`），並靠 `shiftAfterClearing` 先挪開擋格。何時呼叫：移枝跑到不動點之後，由程式網絡循環每一輪的第四階段自動觸發。被誰呼叫：`movewiseStage('gather', …)` 與 `gridMergeStage`／`gridMergeSweep`，呼叫端是 D3Tab（網頁；逐步小步直接呼叫 `gridMergeSweep({limit:1,cursor})`）與 `straighteningCompactLoop`。在哪執行：`src/stores/movewise.js` 的純函式，瀏覽器與 Node CLI 共用。結果：回傳尺寸更小的整數格佈局，**本身不落檔**（`role:'step'`，現算），收斂後由循環結果寫進 `network-loop/`；收斂保證＝每次合併讓 rows+cols 嚴格 −1。
layer: gridmerge
---

# 併格（route-grid-merge）

本文件是該演算法／規格的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

movewise 四步鏈的**第 4 步**；輸入＝ system note `route-branch-shift` 之後的佈局。
實作全部在 `src/stores/movewise.js`：

- `gridMergeSweep(skeleton, cells, cols, rows, {limit, cursor})` —— 一遍掃描。
- `gridMergeStage(skeleton, cells, cols, rows, {single})` —— stage 驅動：交替執行
  一般合併與成對縮方，直到沒有任何可合併為止（tab／循環／「下一步」都走它）。
  它的 `single: true`（只掃一遍）只有經由已退役的 `movewiseSweep` 才到得了，
  所以實務上這個 stage 一律跑到不動點。
- 逐步的「下一小步」**不走** `gridMergeStage`：`stepChainNext` 直接呼叫
  `gridMergeSweep(skeleton, cells, cols, rows, { limit: 1, cursor: mergeCursor ?? undefined })`，
  所以一個小步＝合併一個邊界。

`gridMergeSweep` 與 `gridMergeStage` 都**沒有**被 `hillClimb.js` 再 export
（它只 re-export `setSpanCap`、`movewiseStage`、`stepChainInit`、`stepChainNext`、
`stepChainRemaining`、`STEP_INFO_START`、`straighteningCompactLoop`）。

## 規則

- **合併 r|r+1** ＝「row > r 的所有點整體 row−1」（半平面剛體平移）——
  row r+1 的點落進 row r、更高的列跟著降一列，所以**自帶壓縮**、不留空列；
  col 同理往左移。慣例 row 0＝南、row↑＝北，因此 dr=−1 是往南（畫面上往下），
  **不是**「螢幕上移」。不計算中位點；原本的「中位集中」連同它的繪製已全部移除。
- 合法性走 validShift **同一套硬規則**（判準與 system note `route-endpoint-move`／
  system note `route-line-compact` 相同）：不壓點（點重疊）、不新增交叉、不產生路線重疊、
  象限與邊環繞序不變＝**拓撲不變**。
- **成對縮方**（矩形圖層）：單軸切開方形會破方、被護欄擋下；改成同時併一欄＋一列
  並驗證 `isFourLineSquare`，方形仍是方形又能繼續壓縮（`squarePairShrinkOnce`）。
  成對縮方嘗試兩種順序——先欄後列、再列先欄後（雙迴圈；有時某序的擋格清完後另一序才過）。
  **S2 真修 A（2026-08-04）**：試算與清擋一律用新尺寸 `cols-1`×`rows-1`（`fitsNewDims`
  檢查），縮完仍越界則放棄該刀——會改矩形輸出。
  掃到不動點的上限是 `MERGE_ITER_CAP = 5000`，**不可**共用論文鏈的
  `POST_ITER_CAP`（=20）——否則成對縮方會半途截斷（東京 rot-shape-rect 曾停在 62×64，
  跑滿可以到 ~21×20）。
- **擋格先挪**：成對縮方的落地點常被非凍結點占住；`shiftAfterClearing` 會先把
  擋路的格子 `M.validMove` 到鄰格（八方向 `NUDGE_DIRS` 嘗試，上限 64 輪），
  凍結成員不挪——否則會出現「明明有空列，合併卻不動」。
- **一般合併也走擋格先挪**（`mergeWithClearing`，2026-08-06）：在此之前這條路徑
  **只有矩形的成對縮方在用**，一般城市的 `gridMergeSweep` 只要 `validShift` 失敗就
  放棄整個邊界——於是「幾乎空的一列」常常只因為卡住一兩個點就永遠刪不掉。現在
  `validShift` 被擋下時會再試一次清擋道，三道守門：
  ① **只在占用型否決時才試**——先用 `M.cellOwner` 數落地格上的非成員擋格
    （`blockerCount`，O(comp)）；數量 0（＝否決理由是拓撲，清擋也救不了）或
    超過 `MAX_CLEAR_BLOCKERS = 4`（＝真的擠不下）都直接放棄。
  ② **在副本上試算**——`mergeWithClearing` 另建一份圖與 mover，成功才 `adopt`
    （重建 `pos`／mover），失敗時原圖一格未動。
  ③ **本來是直線的一段都不准變彎，直穿的站也不准變成轉角**——挪擋格走的是 `validMove`，
    它不查 H/V，清完可能把直線折彎。兩層都要比，而且都是**逐項**比不是比總數：
    段層 `wasHV`（只比 `countHV` 的話，甲處折彎、合併在乙處補回一條就會過關）＋
    頂點層 `wasStraight`（垂直段變水平段兩者都算 H/V、段層必放行，但那個站已經折了 90°
    ——2026-08-06 使用者兩次回報的正是這兩種）。判準與 system note `route-endpoint-move`
    的 `isStraightThrough` 共用。半平面剛體平移本身恒保 H/V 與 H/V 直穿
    （只改單軸座標、同軸三點同進同退），所以會壞的一定是清擋道那幾步。
  被挪開的點會以 `movedIds` 回傳（逐步驗證的橘圈），`desc` 記成
  `row 7｜8（挪開 2 點）`，`gridMergeStage` 另在 stats 累計 `clearedPts`。
  **與 S5-B「空列只准刪不准填」不衝突**——這是把擋在落地點上的點挪開（清道），
  不是把點搬進空列（填洞）；同 system note `route-span-cap` 對 `shiftAfterClearing` 的但書。
  實測（台北／台北＋地標／高雄／東京＋地標／紐約／紐約＋地標，55 組；含上述兩層守門
  與移點／移線的 `STRICT_NO_BEND`）：網格面積 −4,404 格、H/V 段 +9、總線長 −780、
  跨距超標段 −69、轉彎數 −87；時間 +18%（紐約 96.1s → 113.2s）。
  矩形城市座標零變化、十條鏈全部仍成方。
  逐步驗證實跑約 15,600 個小步（台北／台北＋地標／高雄／東京＋地標／紐約／紐約＋地標），
  **零次**「本來是直線變成不是直線」。
- **合併與成對交替**：`gridMergeStage` 讓兩個階段輪流跑到不動點
  （成對縮完常會露出新的單軸空帶，需要再合併一次）；不要跑完「先合併、後成對」
  各一輪就停。
- **矩形收尾微調**（`gridMergeStage` 尾段）：併格已收斂但仍有空帶時
  （`!density.dense && getSquareGuard()`），再嘗試 endp/line 微調挪開擋格＋成對縮方，
  上限 `densifyGuard < 8` 輪；不再搬點填空帶（S5-B）。
- **緻密 audit**：`auditGridDensity`——整列或整欄都不應該沒有任何非中途站；
  循環的 stats 會帶 `dense`／`emptyRows`／`emptyCols`。
- **填滿空帶已停用**（`fillEmptyBandsOnce`，S5-B 2026-08-04）：空列／空欄只准刪
  （併格／成對縮），不准搬點填；函式恒 null。刪不掉可留空（`dense=false`）。
- 附帶性質（自動成立、不必另外檢查）：H/V 段只增不減（水平／垂直段不受影響；
  dy=1 的斜段合併後變水平；dy=1 的垂直段因為兩端會撞進同一格而被 validShift 擋下）。
- **跨距但書**：兩兩合併本身是半平面剛體平移，邊界段的跨距只會變小，
  所以自動滿足 system note `route-span-cap`。同一步的 `shiftAfterClearing` 仍直接呼叫
  `M.validMove`／`M.applyMove`，可能拉長跨距（清擋道，不是填空）。
- 掃描順序：rows 由低列到高列（南→北）、cols 由左而右，且**每個邊界本遍只試一次**
  （兩兩配對；合併成功就前進、不重吃同一個邊界）；`cursor`
  （`{phase:'row'|'col'|'done', idx}`）讓 system note `route-step-verify` 的小步能跨點擊
  延續同一遍（一個小步＝合併一個邊界）。
- stats：mergedRows／mergedCols（moved＝總合併次數）。

## 收斂

每次合併都讓 rows+cols 嚴格 −1（有下界）→ 保證終止。

## 歷史裁決（2026-07）

- 這一步的前身（中位集中）：點沿線滑向中位點、線垂直移向中位點（一次一格、
  不越過中位點、末端站不拉長線）。使用者把這一步重新定義為 row／col 兩兩合併之後，
  中位點的計算與繪製全部移除。
- 舊註記說用 `hccells-v6` 烘出來的矩形檔常留下空列，必須以 `hccells-v7` 重 bake。
  **這只是歷史**——目前的演算法版本是 `STRAIGHTENING_CELLS_ALGO = 'hccells-v13'`
  （`src/lib/straighteningCells.js`），任何重 bake 都以現行版本為準。
