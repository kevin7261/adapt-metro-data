---
description: Hill Climbing 多準則佈局最佳化（Stott et al. 2011 演算法本體；≠論文②直角爬山，②見 route-ortho-polish）完整規格（非 skill）——同時是**爬山演算法本體**與**全專案移動節點的唯一關口**，兩個身分要分清。運作概念：以 Gridding「網格地圖」的整數格佈局為輸入，逐頂點掃描半徑 R 內所有格點、取局部適應度最低且通過硬規則者，再做群集移動；加權多準則適應度＝角解析度／邊長／平衡邊長／平直／八方向（權重取論文表 4），四條硬規則＝邊界／象限／遮蔽／邊環繞序，含冷卻（R 從 8 遞減、最多 5 輪）與超長邊群集移動；黑點不是頂點、事後沿新段平均放回。何時呼叫：作為畫廊參考圖時由視圖預算觸發；作為移動關口則是**任何演算法要動節點時都必經**。被誰呼叫：`buildHillClimb` 唯一呼叫端是 `src/stores/viewGeometry.js`；但它 export 的 `makeMover`／`applyTargets`／`scoreAlign`／`iteratePost`／`buildOrthoPolish` 被論文直線鏈①〜⑨（route-paper-align）、LLM 直線化與 movewise 四步鏈共用。在哪執行：`src/stores/hillClimb.js` 的純函式（格座標運算、無亂數、確定性），瀏覽器與 Node CLI 共用。結果：`{cellAfter, stats}`；爬山本體只產生畫廊 `hc-*` 參考圖、**不落檔也沒有下游鏈讀它**（Frame compact key 'hc' 已出清、基底不再存檔），真正餵下游的是各鏈經程式網絡循環後的結果。
layer: algorithm-ortho
---

# Hill Climbing 多準則佈局最佳化（route-hillclimb）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

把 system note `route-skeleton-grid`（示意網格化）產出的**整數格佈局**再用爬山法最佳化。
依據：Stott, Rodgers, Martínez-Ovando & Walker (2011)，*Automatic Metro Map Layout Using
Multicriteria Optimization*, IEEE TVCG 17(1)。完整演算法說明見
`data/thesis/2_hillclimbing_演算法說明.md`（＋同資料夾的 PDF；那個檔名是磁碟上的實體路徑）。
本文件是**實作對照與契約**。

> 純函式、在**格座標（cell space）**運算、確定性（無亂數）。
> 實作：`src/stores/hillClimb.js` 的 `buildHillClimb(skeleton, cellOf, cols, rows, opts)`；
> UI 在 `D3Tab.vue`（`layer.type === 'straighten'`——舊的 `'hillclimb'` type 已由
> `src/stores/layerMigrations.js` 遷移掉），layer group「Hill Climbing」。

**命名要分清**：本文件＝Stott 爬山法**本體**（畫廊的 `hc-*` 參考圖）。論文直線鏈
**②直角爬山**（tab 名；kind `ortho`；`|sin 2θ|` 變體）見 system note `route-ortho-polish`——
它直接吃 **flow base**，**不是**「先 HC 再拋光」的必經管線。
論文①〜⑨的總目錄見 system note `route-paper-align`。

## 資料流

```
Gridding（d3 圖層）的網格地圖 —— 每個城市的 Straighten：目前只有 orig，
規定表城市另有矩形城市檔（`orig-shape-rect`）
  →（可選）矩形（LLM 指定形狀已套用）→ 以矩形座標（含控制點（矩形轉角控制點））取代 cellOf
     ＋矩形護欄（規定 ring ＋控制點（矩形轉角控制點）＋矩形路線 cut）
  → 直線演算法①〜⑨ ＋ LLM 直線化
     （輸入＝flow base＝網格地圖／矩形；它**不吃** HC）
  → movewise（移點／移線／移枝／併格；每步後 compactGridSafe）／程式網絡循環／Frame…
```

有矩形餵入時，直線演算法區會標「←LLM矩形」。在圖層上按「重新計算」會清掉矩形。
詳見 system note `route-shape-rect-align`／[[llm-shape]]。畫廊仍可能另外畫一份 HC 參考圖
（`hc-*`），但沒有任何下游鏈會讀它。

**矩形護欄（矩形圖層吃矩形時）**：ring ＋控制點（矩形轉角控制點）＋矩形路線 cut **只准剛體平移**；
另外會鎖住「至少一端在 members 且目前是 H/V」的段——論文鏈不可以把矩形的邊拉斜。
半平面合併若整塊帶著方形一起走仍可通過；成對縮方見 system note `route-grid-merge`。

### UI 分組（摘要；細節外連）

新圖層由 Layers 面板 Hill Climbing group 的 **+** 建立（`layer.sourceLayerId` ＋
`layer.variant`；變體目前只有 `orig`）。左選單的手風琴分組大致是：

- **原始**（網格地圖／flow base）
- **直線演算法**（①〜⑨＝system note `route-paper-align`；**LLM 直線化**＝[[llm-straighten]]；
  兩者都以 flow base 為輸入。矩形導引掛在直線鏈之前，見 system note `route-shape-rect-align`）
- **movewise 尾巴**（移點 → 移線 → 移枝 → 併格）——**獨立的「縮減網格」tab 已取消**；
  四個階段都走 `movewiseStage`（每一個單一移動後跑一次 `compactGridSafe`）。
  下游真正吃的是各鏈**經程式網絡循環之後**的結果。在統一格網的 Straighten 圖層上，
  這四個階段**也沒有自己的視圖列**：`D3Tab.vue` 的 `clampStraighteningMode` 會把
  `-end`／`-line`／`-gather`／`-anim`／`-step` 這些 mode 夾回 `-loop`。
  見 system note `route-endpoint-move`／system note `route-line-compact`／system note `route-grid-merge`／
  system note `route-movewise-loop`
- **程式網絡循環**（`straighteningCompactLoop`；每一輪讓四個演算法各自跑到自己的不動點
  再換下一個；結果＝Frame／llmGrid 吃的那一份）—— 見 system note `route-movewise-loop`
- **逐步驗證** —— 見 system note `route-step-verify`

跨距上限見 system note `route-span-cap`。

**Frame compact key `'hc'` 已出清**（它原本的意思是「直接對網格地圖跑循環、
不做論文後處理」）：`src/lib/frameCompacts.js` 的 `FRAME_COMPACTS` 與
`vite/compactKinds.js` 的 `COMPACT_KINDS` 都不含 `hc`，`src/stores/mapStore.js` 會濾掉
`compact` 是 `hc`／`align`／`ilp`／`llm-skeleton2grid` 的 frame 圖層，而
`frameCompactLabel` 在沒指定鏈時退回 `'ortho'`。`hc` ＝基底佈局，但它**已不再落檔**——
base 一律照資料流現算。`hc*` 這些識別字只是「Straighten 這一步」的泛稱，
與本文件是兩回事。

## buildStraighteningGraph（HC 圖的建構）

`buildStraighteningGraph(skeleton, cellOf)` 是所有佈局的共同入口（`export`），
回傳 `{ pos, segs, inc }`：

- `pos`（`Map<id,[c,r]>`）＝非黑色骨架節點（彩色、黃色交叉），整數格座標。
  **建構時強制檢查整數**：遇到浮點座標直接 `throw`——浮點會讓 `orient()`／`isHV`
  的精確比較失效，硬規則會靜默失效（H/V 計數歸零、所有鏈看起來都沒改善）。
- `segs`＝切點到切點的子段：`{ a, b, routes, hops, interior:[黑點 id], edge }`。
- `inc`（`Map<id,[segIdx]>`）＝每個頂點的入射段索引。

## 主迴圈（論文 Algorithm 1）

逐頂點掃描以自身為中心、半徑 R 的矩形內所有格點 → 取局部適應度最低且通過硬規則者；
接著做**群集移動**；收斂＝一整輪沒有改善，或一整輪後總適應度不再下降。
**冷卻**：R 從 8 起（論文表 4「最大站移動 8」），每輪 `R = max(1, R − 1)`，最多 5 輪
（表 4「迭代輪數 5」）；可用 `opts.maxMove`／`opts.maxRounds` 覆寫。
**增量計算**：移動 v 只重算 `{v} ∪ N(v)` 的節點項＋其鄰接小段（`costOfSet`）；
先算便宜的適應度，只有更優的候選才去跑昂貴的幾何硬規則。

## 站點準則（式 1–5，權重＝論文表 4，可用 opts.weights 覆寫）

| 準則 | 內容 | 權重 |
|---|---|---|
| c_N1 角解析度 | 相鄰邊夾角 → 2π/度數 | 30000 |
| c_N2 邊長 | 每小段長 → `hops × L`（L＝每站距的理想格數，取初始「長÷hops」的中位數，clamp 1–8，`opts.idealHop`） | 50 |
| c_N3 平衡邊長 | 度 2 頂點的兩個鄰段等長 | 45 |
| c_N4 平直 | 同一條 route 上的相鄰段穿站直行（夾角 → π）；只計算**共享 route 的邊對** | 220 |
| c_N5 八方向 | \|sin(4θ)\| | 9250 |

## 硬規則（違反即否決候選；全部是整數格精確幾何）

`makeMover(pos, segs, inc, cols, rows)` 是**唯一移動關口**——任何演算法要移動節點
都必須經過它。它 export 的 `validMove`（單點移動）與 `validShift`（群集平移）
內含**論文四條硬規則**加上**矩形護欄**（squareGuard，又稱 FROZEN）。

### 單點移動 `validMove(v, P)`

1. **邊界＋一格一頂點**（①）：`0 ≤ c < cols`、`0 ≤ r < rows`，且 `cellOwner` 中
   該格不可被其他頂點佔用。
2. **相對位置（象限）**（②）：對每個鄰居 u，v 相對 u 的座標差的符號不得翻轉
   （正→負 或 負→正 即否決）；原本符號為 0（在象限邊界）→ 兩側皆可。
3. **無遮蔽**（③）——判準是「**不得增加**」，不是「不得存在」（2026-08-06 改）：
   - ③a：候選點 P 落在**非入射段**上的次數（`onSeg`）。
   - ③b：v 的每條改線段 P→u 吞掉其他頂點的次數（`onSeg`；遍歷所有 w ≠ v,u）。
   - ③c：v 的每條改線段與不共端點的非入射段相交的次數（`segsIntersect`；
     以 `s.a === u || s.b === u` 排除在 u 合法相接的段）。

   **三類各自比對「移動前 vs 移動後」，任一類變多即否決**（`occlusionCounts`／
   `baseOcclusion`）。乾淨的佈局（三類皆 0）行為與舊版的「一律禁止」**完全相同**，
   因為 0 不得增加就等於必須是 0；快速路徑會在新狀態三類皆 0 時直接放行，連基準都不算，
   所以成本也一樣。

   **為什麼要改成比較而不是絕對禁止**：上游論文演算法交下來的佈局**本來就可能帶著違規**
   （紐約 `algorithm-ortho`：3 對交叉＋1 個頂點壓線——那些鏈不經 `makeMover`）。
   舊寫法問的是「移動後還有沒有」，既存的那一個又不是這次移動造成的，於是**不論移到哪裡
   都還在 → 八個方向全部否決 → 相關端點被永久凍結**。實測紐約有 6 個頂點因此全滅、
   全圖 158 個頂點裡 14 個完全動不了，而且**它們卡住的是整個壓縮**：解凍之後台北＋地標的
   `algorithm-path` 網格面積從 1116 格掉到 352 格（−68%）。
   拓撲保證不受影響——真正的拓撲守衛是 ②（象限）與 ④（邊環繞序），兩者照舊是絕對禁止；
   這裡放寬的只是「本來就不該存在、而且是要被消掉的畫面重疊」。
   配套的「主動消交叉」在 system note `route-endpoint-move`。
4. **邊環繞順序**（④）：v 及其每個鄰居 u，入射段依角度排出的循環序
   在移動前後必須 `cyclicEqual`。度 ≤ 2 時恆成立，直接跳過（`inc.get(u).length < 3`）。
5. **矩形護欄（squareGuard）**：`squareOk(overrides)` 檢查——若有矩形護欄
   （`SQUARE_GUARD` 非 null），所有 members 只准全體同一位移（剛體），
   且「至少一端在 members、目前為 H/V 的段」覆寫後仍須為 H/V。

**不變式：整條鏈永不新增壓點／交叉／共線重疊**——單點移動（validMove）、
群集平移（validShift，含 ③′）、movewise 三演算法，以及**每步後的縮減網格**
（`compactGridSafe`）全都在把關。輸入（網格化後）既有的重疊只會持平或減少，不會增加。

### 群集平移 `validShift(comp, inC, dc, dr)`

對每個頂點 w ∈ comp 檢查：
- ①② 邊界＋一格一頂點＋象限（只對**靜態**鄰居查象限）。
- ③ 移動段 vs 靜態段：段的至少一端在 comp 時，與純靜態段做交叉＋吞頂點檢查；
  靜態頂點不可落在移動段上、移動頂點不可落在靜態段上。
- **③′ 變形段完整檢查**：兩端同動（相對不變）與兩端全靜態的段保持原幾何不變，
  唯一會**變形**的是**恰有一端在 comp 內**的段。對每條變形段：
  不得吞掉**任何頂點**（含 comp 內的頂點，`at(w)` 取移後座標），
  也不得與**任何不共端點**的非純靜態段相交或共線重疊。
- ④ 邊環繞順序：跨界頂點（comp 內外各一端的邊的兩端）中度 ≥ 3 者，
  移動前後循環序必須 `cyclicEqual`。
- ⑤ 矩形護欄（squareGuard）：若有護欄，overrides 含 comp 內**所有**點。

## 群集移動（§6.1 超長邊群集 ＋ §6.2 折彎群集）

- **§6.1 超長邊群集**：超長邊＝段長 > `hops×L`。以**非超長邊**做連通分量 →
  每個真子集群集（≤200 頂點）整體平移（半徑 R），只檢查跨界的硬規則，
  且只重算邊界頂點±其外鄰的適應度。
- **§6.2 折彎群集**：對於度 2 且兩個鄰段共 route 的頂點 v，
  若 `∠(u→v, u→w) > 22.5°`（`KINK = π/8`）就是 kink，`{v}` 自成一個群集單獨平移。
- **§6.3 二分割**（對偶圖切割）是論文三種群集法之一，本專案省略未實作。

**標籤準則（§7）不在範圍內**——站名標籤是 Style 開關，不是佈局的一級公民。

## 論文直線鏈與共用 export（輸入＝flow base；詳見 system note `route-paper-align`）

H/V 最大化的後處理＝論文①〜⑨＋LLM 直線化，且**全部都以網格化後／矩形的佈局
（flow base）為輸入**；它們不吃本文件 `buildHillClimb` 的結果。各鏈回傳同型的
`{ cellAfter, stats }`，並經 `iteratePost(build, ...)` 迭代到不動點
（上限 `POST_ITER_CAP = 20`）。

本文件 **export** 下列項目供論文鏈／LLM 重用：

- `makeMover`／`applyTargets`（硬規則的多輪套用；論文鏈／LLM 傳入 `scoreAlign`＝
  HV 為主鍵＋HVD 為次鍵；`countHV`／`countHVD` 僅供 stats）
- `scoreAlign`（`countHV * 1_000_000 + countHVD`——一個 HV 永遠贏過任何純 45° 增益）
  ／`countHV`／`countHVD`／`buildStraighteningGraph`／`iteratePost`
- `buildOrthoPolish` ＝論文②（system note `route-ortho-polish`；`opts.ortho`，適應度本體）

①③〜⑨ 實作在 `src/stores/paper/<kind>.js`，並註冊於 `PAPER_KINDS`
（**9 種**；`llm` 不在其中）。注意有一個檔名不照慣例：kind `flex` 放在
`src/stores/paper/flexgrid.js`，不是 `flex.js`。已下架：自創的軸對齊與整數規劃鏈。

## `applyTargets`（逐輪套用目標位置）

`applyTargets(pos, M, targets, segs, maxPasses=6, count=countHV)` ——
依排序後的 id 逐一嘗試移動到目標：先試完整目標 `[tc, tr]`，再依序試
`[tc, 原r]`、`[原c, tr]`（被擋住的對角移動常能只動一軸成功）。
重複最多 `maxPasses`（預設 6）輪直到一整輪都沒有改動。
**淨對齊分數**（`count(pos, segs)`）變差（`< 起始值`）就**整批退回**
（`reverted: true`）。

## `iteratePost`（迭代到不動點）

`iteratePost(build, skeleton, cells, cols, rows, opts)` ——
把 `build` 的輸出再餵回給自己，直到 `stats.moved === 0` 或達到 `POST_ITER_CAP = 20`。
**契約檢查**：`build` 的 stats **必須**有 `moved`／`hvBefore`／`hvAfter`，否則 throw
（缺 `moved` 會讓第一輪就誤判收斂）。彙總 stats 取首輪的 `hvBefore`、末輪的 `hvAfter`。

## `compactGridSafe`（硬規則版縮減網格）

移除空欄／空列＝「右半平面整體左移 1 格」——與群集平移同一件事。
逐空欄／空列走 `validShift` **同一套硬規則**（含 ③′ 變形段檢查）；會出事的空帶**保留**。
**迭代到不動點**，上限 64 輪（矩形擋格挪開後常連續露出多條空帶，
先拿掉別的空帶後原本被擋的可能變合法）。movewise／逐步驗證的每步後壓縮都走這裡。

## 實作契約

- `buildHillClimb(skeleton, cellOf, cols, rows, opts)`：`skeleton` ＝ connect 骨架
  （系統說明 `route-skeleton-connect`／`buildConnectSkeleton`），`cellOf/cols/rows` 來自 `buildSchematicGrid`
  （system note `route-skeleton-grid`）。回傳 `{ cellAfter: Map<id,[col,row]>, stats }`，其中
  `stats = { before, after, rounds, moved, clusterMoves, idealHop, verts, segs,
  hvBefore, hvAfter }`。
- 各後處理鏈的 `cells` 參數＝上游的 `cellAfter`（同型 Map）；輸入的 Map 不會被改動。
- **黑點不是頂點**：呼叫端用 `placeBlacks(skeleton, posMap, snap)` 沿新段平均放回。
- **移動後視圖的畫線走 skeleton 拓撲邊、不走原始 feature 幾何**
  （詳見 `buildDrawData.js`／`edgeLinesFromPos`；改畫線必須 bump `VIEWS_VERSION`）。

## 鏈結果的 cells 檔（已取代 localStorage）

跨 reload 的持久化在磁碟上，不在 localStorage：
`maps/…/3-straightening/{來源}/[{模型}/]{鏈}/{子夾}/`，位址由
`metroChainCellsPath(cityId, variant, chain, shape, stage)` 產生
（矩形城市檔＝另一個 id）。

- **沒有指紋機制**（2026-08-14）：不比對「資料有沒有變」，也沒有「可能過期」的顯示。
  演算法真的換了要標記世代時，bump 的是 `STRAIGHTENING_CELLS_ALGO`
  （`src/lib/straighteningCells.js` 的 `'hccells-v13'`；讀取白名單＝`STRAIGHTENING_CELLS_ALGO_READ`）。
- 衍生 JSON **有檔就開**；重算與否由使用者決定（`bakeStraighteningCells --force`）。
  結果檔仍記 `baseCols`／`baseRows`（起算的格網），讀取一律走 `baseDimsOf()`。
- **已經沒有 use-time 結構驗證**：`src/lib/straighteningCells.js` 只剩 `chainDocUsable`，
  而它現在就只是 `!!doc`（舊的 `cellsDocUsable` 已移除）。
- 「重新計算」：LLM／矩形重跑會**先刪舊結果再寫**；cells 重算靠 bake `--force` 覆寫。

## 修改此轉換時

準則／硬規則／群集規則變動時，**要同步更新本文件與 `src/stores/hillClimb.js`**；
輸入契約變動（cellOf 等）時同步 system note `route-skeleton-grid`。
論文鏈契約變動時同步 system note `route-paper-align`。
