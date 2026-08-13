---
description: 逐步驗證（原 Step by Step）完整規格（非 skill）——讓人一步一步看程式網絡循環怎麼把佈局推到收斂，用來核對演算法行為而不是產生新結果。運作概念：**沒有自己的視圖，逐步檢視分頁掛在「程式網絡循環」視圖上**，因為它跑的就是那條循環；進來預設是「最後」（＝已收斂的循環結果），按「最前」才建 state 回第 0 步（第 0 步的起點＝循環的輸入）。「下一步」＝目前演算法跑到不動點再換下一個，「下一小步」＝單一移動並用橘圈做前後比對，另有上一步／上一小步復原堆疊（最多保留約 400 筆）、自動執行（每步秒數可調、預設 0.2 秒）與五個 chips（移點／移線／移枝／併格＋收斂後的「優化」，後者不參加輪替、用虛線框標示）。何時呼叫：使用者在循環視圖按步進按鈕時才啟動，資料流不會自動跑它。被誰呼叫：`stepChainInit`／`stepChainNext`，由 `src/composables/useStepper.js` 管理，唯一呼叫端是底部面板的「逐步檢視」分頁（`AttributeTable` ＋ `src/components/style/StyleStepTab.vue`）。在哪執行：`src/stores/movewise.js` 的純資料 state＋`src/composables/useStepper.js` 的 UI 驅動，**只在瀏覽器**（Node CLI 不跑逐步）。結果：不另外落檔，跑到底的結果寫回循環槽（`sess.cachedLoop[kind]`）並 `persistStraighteningCells`；硬保證是「小步連跑到 done＝大步＝循環」——三者共用同一套 `movewiseStage` 與收斂後的 `loopPostConverge`，**最終座標一模一樣**。
layer: network-loop
---

# 逐步驗證（route-step-verify）

本文件是該演算法／規格的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

實作分兩層：
- **純資料 state**：`src/stores/movewise.js` 的 `stepChainInit`／`stepChainNext`
  （每步後 `compactGridSafe`；**done 時套用與循環相同的 `loopPostConverge`**）。
- **UI 驅動**：`src/composables/useStepper.js`（狀態住在 `sess.stepState`／
  `sess.stepHistory`／`sess.stepInitBasis`／`sess.stepNavLimit`／`sess.stepProgressCache`；
  每次推進前重裝矩形護欄 `setSquareGuard(sess.activeFrozen)`）
  ＋**底部面板的「逐步檢視」分頁**（`AttributeTable.vue` 的 `panelTab === 'step'`；
  上排播放列＝`src/components/style/StyleStepTab.vue`，下方的步驟表與物件列表共用同一張
  scoped `table`，所以寫在 `AttributeTable` 而不是子元件裡）。
UI 名稱＝ i18n key `d3.stepVerify`（「逐步驗證」）／分頁名 `style.step`。

## 沒有自己的視圖（2026-08-03 使用者裁決）

逐步跑的就是程式網絡循環那條鏈（i18n key `d3.loopResult`），所以它**不再另開一列視圖**——
左側視圖清單只留循環那一列，「逐步檢視」分頁掛在該視圖上——分頁鈕的顯示條件是
`AttributeTable` 的 `stepView` prop，值來自 D3Tab 的 `stepViewOn`：

```
const stepViewOn = computed(() =>
  !!(isStraightening.value && loopKindOf(mode.value) && !isGenMosaicView.value))
```

`isStraightening` 是 D3Tab 對 `layer.type === 'straightening'` 的 computed
（舊的 `'hillclimb'`／`'straighten'` 圖層 type 已由 `src/stores/layerMigrations.js` 兩代接力遷移掉）。

**mode 文法並沒有被移除，只是被夾住。** Straighten 的 mode 是
`st-<kind>[-<model>][-<step>]`，其中 `step ∈ end|line|gather|loop|step|anim|llm-network-loop`
（`src/lib/straighteningMode.js` 的 `STRAIGHTENING_MODE_RE`），而 `stepKindOf` 仍然有 export、
D3Tab 也仍在呼叫它。真正讓 `st-<kind>-step` 退役的是 `D3Tab.vue` 的 `clampStraighteningMode`，
而且**只在它的 `isUnifiedGridStraightening` 分支裡**——該分支把 `end`／`line`／`gather`／
`anim`／`step` 全部夾回 `loop`。LLM 消融的分支夾法不同：已移除的 `end`／`line`／`gather`
mode（`RE_STRAIGHTENING_LLM_GONE`，視圖於 2026-08-01 撤掉）會被改寫成 `-loop`，
而 `-step` 仍被 `RE_STRAIGHTENING_LLM_STEP` 接受。所以「一律夾住」是錯的說法——
要講「在統一格網圖層上才夾」。

- **預設就是「最後」**（`d3.stepLast`）：循環視圖顯示的是收斂結果＝逐步鏈的終點。
  沒有 `stepState` 時，`stepInfo` 回 `{ done: true, steps: null, hist: 0 }`——
  下一步／最後／自動執行反灰，**只有「最前」**（`d3.stepFirst`）**可按**；
  步數框顯示破折號（真的跑過才知道幾步，所以不編數字）。
- **「最前」＝建 state、回到第 0 步**（不是「回到結果」）。第 0 步是循環的**輸入**
  （該鏈自己的 post 結果／flow base），由 render 在跑循環之前存進 `sess.stepInitBasis`。
  **檔案模式也要寫**（2026-08-11）：畫布自 2026-08-10 起直接讀 footer 那一份 json
  （`loadChainDocAt`），命中時 `resolveChainStages` **整段不跑**——沒有補寫的話
  `stepInitBasis` 永遠是空的，步驟表恆顯示「沒有步驟（已經是收斂結果）」。
  補法在 `D3Tab.computeStraighteningLayout`：讀上一張圖自己的 json
  （`upstreamChainDoc()`＝該鏈的 `{鏈}/{鏈}/`，LLM 直線化的座標在 `align`，
  一律經 `alignOf` 拆封）當第 0 步，不重跑管線；同一支檔在一次播放內只抓一次
  （`sess.upstreamDocMemo`）。LLM 那條另外補 `llmApplied = true`，否則
  `resolveStepOverride` 的「沒有對齊佈局不准逐步」會把畫布打成空白。
  **第 0 步是未壓縮的鏈結果**（2026-08-03 使用者裁決）：`stepEnsure()` 會先建一個
  `stepPreState`（`pre: true`），此時**還不會**呼叫 `stepChainInit`——因為
  `stepChainInit` 起手就是 `compactGridSafe`，那會讓「最前」跳離上一列所顯示的畫面。
  這個壓縮改成**第一個「下一步」**（`stepAdvanceFromPre` → `setSquareGuard(activeFrozen)`
  再 `stepChainInit`，標示用 i18n key `d3.stepCompact`）。矩形護欄必須在它之前裝好，
  因為那次壓縮算是一次移動。收斂結果不受影響：壓縮仍然發生在每個 movewise 階段之前，
  與循環完全一致。
- **逐步表會落檔**（2026-08-11 使用者裁決「寫進 json（新增 steps[]）」）：循環結果檔
  （`{鏈}/network-loop/…json`）多一個 `steps` 欄位＝`[{ n, stage, text }]`，就是那次循環的
  **小步**表（大步表不落檔，照舊現算）。產生器只有一份＝`src/lib/stepRows.js` 的
  `buildStepRows()`，落檔端（`bakeStraighteningCells`／`warmChains`／`chainStages` 三個算循環的
  地方）與現算端（`useStepper.buildStepPlan`）**共用它**，所以存下來的步驟必然等於那次循環走過的路。
  讀取優先序＝檔裡的 `steps` → 沒有才重播（缺欄位的舊檔完全相容，重播是決定性的）。
  **`text` 裡的階段名是 token `{stage:endp}`**，顯示時才由 `movewise.renderStepText()` 換成當下
  語系的字——句子會被別的語系讀到，不可以把語言寫死；第 1 列（縮減網格）的字存空字串，
  同樣由顯示端翻（`d3.stepCompact`）。
- 逐步進行中 `straighteningAnimLerp = null`：morph 內插排在 `cells` 之後，不清掉會蓋掉
  逐步的座標（症狀是按了步進只有橘圈在跳、站點不動）。同時 `gridAnimView` 會在**逐步進行中**
  收起動畫控制列，才不會留一排按了沒反應的按鈕；逐步停掉後播放列照樣回來。

## 操作（以及它保證的一致性）

按鈕順序＝**播放器排法**（2026-08-07 搬進面板時改成與動畫分頁同構，播放鍵置中）：

```
最前 ≪ ＜ ▶/⏸ ＞ ≫ 最後
first_page │ keyboard_double_arrow_left │ chevron_left │
play_arrow/pause │ chevron_right │ keyboard_double_arrow_right │ last_page
```

七顆都是 `btn-icon`，包在 `.step-player-transport`（`role="group"`）裡；
文字只寫進 `title`／`aria-label`。下方另有**唯讀**進度條
（`.step-player-seek`，`role="progressbar"`——逐步只能一步一步走，不可任意 seek）
與「每步秒數」輸入（`d3.stepSec`）。

- **「下一步」**（`d3.nextStep`）＝目前演算法**跑到不動點**（`movewiseStage`），
  再換下一個演算法（掃不動也換，同一次按鍵內會自動跳過空階段）。
  與循環同一語意：算到不能動才換。
- **「下一小步」**（`d3.nextMicro`）＝**下一個單一移動**，語意與 `movewiseStage` 相同
  （移點與移線每次都取目前第一個可動者，且**不**使用 visited 集合——避免與循環分叉）；
  併格用 `mergeCursor` 逐邊界推進；矩形在單軸掃完後還會嘗試 `squarePairShrinkOnce`，
  走到盡頭時再跑一次完整的 `movewiseStage('gather')` 收尾（成對縮方等）。
  訊息會附上座標。
- **「上一小步」／「上一步」**（`d3.prevMicro`／`d3.prevStep`）＝復原堆疊
  （`sess.stepHistory[kind]`，超過 400 筆時 shift 掉最舊的）。
  上一小步＝pop 一筆（`stepPrev(true)`）；
  上一步＝不斷 pop 直到遇到 `kind !== 'sub'` 的大步（`stepPrev(false)`）。
- **「最前」**（`d3.stepFirst`）＝回到鏈的起點（原名「重設」）——現在同時也是
  **開始逐步的入口**（預設態是「最後」，見上一節）。
- **「最後」**（`d3.stepLast`）＝大步連跑到收斂（判準與循環相同、收尾也是同一套
  postConverge；上限 10000 步護欄；原名「執行到底」）；結果寫入循環槽
  （`sess.cachedLoop[kind]`）並呼叫 `persistStraighteningCells`。
- **「自動執行」**（`d3.autoRun`；執行中顯示 `d3.stopAuto`）＝每隔 `stepAutoSec` 秒走一次
  下一小步（面板可改，預設 **0.2**、夾在 0.1–10，非法值回 1 秒；按鈕 active 樣式切換；
  done 時自動停止）。**用 `setTimeout` 自我排程、不是 `setInterval`**——這樣面板上改秒數
  下一拍就生效，不必停掉再開。預設值只有一份：`D3Tab` 的 `stepAutoSec` 與
  `useStepper` 的 fallback 同為 0.2。
- 一輪＝四個演算法各自跑到自己的不動點；**一輪完全沒有改動＝收斂完成**
  （由 `movewise.js` 發出的「收斂完成」資訊訊息），此時套用 `loopPostConverge`。

**硬保證**（由上面各條推導而來；不可讓它們彼此分叉）：

- 循環＝四個 `movewiseStage` 階段輪替＋`loopPostConverge`。
- 逐步大步／「最後」＝同一套 `movewiseStage`＋done 時同一套 `loopPostConverge`。
- 小步連跑到 done＝同一不動點語意＋同一套 postConverge →
  **最終座標與循環一模一樣**。
- 起點雙方都先跑 `compactGridSafe`（逐步這條路徑的該次壓縮就是第一個大步，
  見上面的 `stepAdvanceFromPre`）。
- **位移上限的錨點雙方也要一致**：`stepChainInit` 在起點壓縮之後就建 `anchor`
  （`makeAnchor(comp.cellAfter, comp.cols, comp.rows)`），時機與 `straighteningCompactLoop`
  完全相同；`stepChainNext` 每個回傳的新 state 都必須把它**原封帶回**，`loopPostConverge`
  也要收（裡面的拉直 pass 同樣吃 `DRIFT_CAP`）。
  ⚠ **這一條不是理論上的**：少了 anchor，`driftOk` 恆真＝逐步沒有位移上限，可行域變成
  循環的**超集**，兩邊從第一個被上限擋掉的移動起就分叉（實測高雄 9 條鏈全數不同、
  台北差 32～59 點；把 `DRIFT_CAP` 調大到形同關閉後兩者才逐點相同）。舊 state 沒有這個
  欄位時取 `null`＝退回無上限的舊行為，不會炸——所以**壞掉是安靜的**。
  `gather` 傳不傳都一樣（半平面合併只縮不增，`gridMergeStage` 根本不看 anchor）。

## 顯示

- 位置＝**底部面板的「逐步檢視」分頁**（2026-08-07 由地圖上方工具列的第二排搬進來）。
  禁止在畫布上放浮動面板。
  **播放列樣式尚未統一**：`StyleStepTab` 用的是自己那份較早的 `.step-player*`，
  動畫／權重分頁已共用 `style-panel.css` 的 `.anim-player`——要再加第三個播放列時
  先把 `.step-player*` 併過去，別照抄第三份。
- **說明與進度字串一律寫進 footer**（`stepFooterText`／`d3.stepHint`；起始狀態用
  `STEP_INFO_START` token 再翻語系）——播放列不掛長文；步數進度標在播放列標題右側
  （`.step-player-count`；`d3.stepCount`＝cur／total；total＝已按次數＋從現況乾跑到 done 的剩餘次數；
  大步與小步分開計數，切換導覽模式會重算分母）。
  **分母沿著鏈是不變量，只算一次**（2026-08-06）：`remaining(S) = 1 + remaining(next(S))`，
  所以 `cur + remaining` 恆定；推進只要 `cur+1`。舊寫法把步數包進快取 key，等於每按一次
  都把剩餘整條鏈重跑一遍——紐約一次 3.4 秒（佔點擊成本 **99.6%**）、跑完全程約 457 秒，
  改成沿用後降到 15 毫秒／7.3 秒。只有三種情況重算：切換大步／小步、按「最前」、換資料
  （`session.js` 的 `steps` 作廢要**連 `stepProgressCache` 一起清**）。
  另：`cur` 一律取 `max(histLen, st.steps)`——復原堆疊上限 400 筆，超過就 shift，
  拿堆疊長度當步數會讓 773 步的鏈卡在 400。
- **有逐步的圖層就沒有動畫**：程式網絡循環是唯一有逐步的視圖，工具列只出現 `skip_next`
  那顆，不掛動畫控制列（`gridAnimView` 排除 `stepViewOn`）。要看連續變化的是別的視圖
  （網格地圖／消融／①〜⑨ 結果／LLM 直線化／LLM 指定形狀／LLM 網絡循環）。
- 五個 chips（`d3.endpointMove`／`d3.lineCompact`／`d3.branchShift`／`d3.gridMerge`，
  再加不參加輪替的 `d3.hvOptimize`（虛線框，整條鏈 done 時才亮）——
  與 `movewise.js` 的 `STAGE_LABEL_KEY` 同序，移枝為 2026-08-07 新增；
  `lastStage` 相符的亮起 active 樣式）。
- 小步的前後比對橘圈（在壓縮後的格座標；`moves` 陣列的 `from` 以軸映射 `axisMap`
  內插到壓縮後空間，可為半格）。
- state = { cells, cols, rows, **anchor**, stage, round, steps, roundMoves, done, lastStage,
  movedIds, moves, sweepVisited, mergeCursor, info }。
  `anchor` ＝位移上限的錨點（2026-08-08 補上，見上方硬保證最後一條）；其餘欄位意義見本節。
