---
description: 指定形狀導引（LLM 指定形狀）的支援機構——規定選路（權威＝城市 geojson 的 `metro_system.prescribed_shape`，`shapePresets` 只剩查表邏輯，一城多段）、**形狀碼分派**（`SHAPE_SQUARE=0` 四邊直線正方／`SHAPE_DIAG=1` 一條 45° 直線；判準一律走 `isShapeSatisfied`，直接呼叫 `isFourLineSquare` 會讓 45° 城市永遠判 false 且不報錯）、品質門檻（`MIN_CUTS=6`、`QUALITY_AR=1.001`）、`applyShapeLlmTargets` 雙策略（原子整批／逐點貪心）＋ settle 回歸＋論文 D1 三重鐵律（`edgeCrossKeySet`／`hasPointOverlap`／`edgeOrdersMatch`）、形狀護欄（`setSquareGuard`：ring＋控制點只准剛體平移、邊鎖定依形狀鎖 H/V 或鎖對角，`makeMover` 建構當下擷取）與 `squarePairShrinkOnce`（45° 整段跳過）。結果檔達成旗標＝`shapeOk`，讀取一律 `shapeOkOf(doc)`。
layer: llm-shape
---

# 指定形狀導引——LLM 指定形狀的支援機構（route-shape-rect-align）

本文件是該演算法／規格的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

指定形狀導引（精神源自 Batik et al. 2022）**已經是純 LLM 入口**——程式端的演算法本體
`buildShapeAlign`（格網→貼形）於 2026-07 移除（使用者裁決）。

**檔名保留 `route-shape-rect-align`**（2026-08-08 使用者裁決：鏈與程式識別字改叫 `shape`，
但這篇規格講的就是矩形導引那套機構，說明 id 不動）。此檔現只保留 LLM 指定形狀需要的：
規定路段選路（`pickOneRing`／`pickAllRings`）、矩形判準與品質（`squareQuality`／
`wSquareBox`／`fourSideTargets`）、控制點（矩形轉角控制點）套用（`applyShapeControls`）、LLM 脈絡與套用
（`shapeLlmContext`／`applyShapeLlmTargets`）＋共用拓撲／幾何工具。

實作＝`src/stores/paper/shape.js`（主體）＋`shapeCheck.js`（判準模組）＋`shapePresets.js`
（形狀碼與查表邏輯；**規定本身在地圖 json 裡**，見下節）。LLM 鏈的**觸發與提示詞**屬 skill [[llm-shape]]（求解戰術也在同一份
`SKILL.md` 裡）；本文件只管程式端支援機構。

## 規定表——**權威在地圖 json，不在程式**

使用者裁決「不可以有其他檔存地圖資訊」：規定哪一城、哪一條路線、收成什麼形狀，
全都是**地圖資訊**，所以只能記在地圖檔自己身上。

### 權威與導出

| 層 | 位置 | 角色 |
|---|---|---|
| **權威** | `maps/{group}/{city}/1-raw-maps/working/{city}-1-raw-maps-working.geojson` 的 `metro_system.prescribed_shape`（`…/source/…` 同步一份） | 唯一可編輯的來源 |
| 導出 | `data/metro/index.json` 的 `systems[].prescribed_shape` | 供瀏覽器與 Node 同步查詢 |
| 導出 | LLM 指定形狀結果檔的 `shape`／`shape_name`／`rings[]` | 讓結果檔自我描述 |

`src/stores/paper/shapePresets.js` **只剩邏輯**（形狀碼、查表規則、json ⇄ 執行期轉換），
一筆地圖資訊都沒有；硬寫的 `RECT_PRESETS` 字面表已於 2026-08-09 移除。

### json 記錄的欄位（`prescribed_shape[]`，一城一到多段；莫斯科 2 環、其餘各 1）

`label`／**`shape`（形狀碼，見下節）＋`shape_name`（給人讀的鏡像）**／`route_id`＋
`name_re`＋`name_re_flags`／`segment`（`'full'`｜`'first-cycle'`｜`'open'`）／
`stations`（手工骨架站序快照，含 `x*` 交叉點）。
執行期由 `fromPrescribed()` 轉成 `ShapePreset`（`routeId`／`nameRe` 是 RegExp），
反向是 `toPrescribed()`。

### 註冊表怎麼灌

- **瀏覽器**＝`metroCatalog.loadMetroCatalog()` 拿到 index.json 時呼叫 `hydrateShapePresets()`。
- **Node**＝`scripts/_prescribedShape.mjs`（side-effect import，載入即灌）；任何會呼叫
  `getShapePresets`／`cityShapeCode` 的腳本都要 import 它。
- 兩邊共用 `src/lib/shapePresetIndex.js` 的 `shapePresetTableOf()` 做 systems[] → 表的轉換。
- **沒灌就是查不到**——不會有第二份硬寫表在背後補位。這正是要的效果。

### 現況 13 個城市

12 個方形：`as-jpn-tokyo-jr`（山手）、`as-sgp-singapore`（環狀線）、
`as-sgp-singapore-lrt`（同環狀線規定）、`as-jpn-tokyo`（大江戶線首環段）、
`as-twn-kaohsiung`（輕軌）、`as-jpn-osaka-jr`（環状線）、
`as-kor-seoul`（2 號線）、`as-chn-shanghai`（4 號線）、`as-chn-beijing`（2 號線）、
`eu-ger-berlin`（Ringbahn）、`eu-rus-moscow`（Koltsevaya＋BKL 兩環）、
`as-jpn-nagoya`（名城線，`rm8031607`）；
1 個 45°：`eu-aut-vienna-lm`（多瑙河 `river:cl-Donau-0`）。

### 形狀碼——規定的不一定是矩形

**單一真相＝`src/stores/paper/shapeKinds.js` 的 `SHAPE_KINDS` 註冊表**，一種形狀一筆；
`shapePresets.js` 只是把它轉成 `SHAPE_CITY_SUFFIX`／`SHAPE_I18N`／`SHAPE_NAME` 幾張查表常數。
碼就是 `prescribed_shape[].shape` 與 `ShapePreset.shape` 的值：

| 碼 | 常數 | 幾何 | `segment` | 判準 | 邊鎖 | 成對縮方 |
|---|---|---|---|---|---|---|
| `0` | `SHAPE_SQUARE` | 閉合環 → 四邊直線的正方 | `'full'`／`'first-cycle'` | `isFourLineSquare` | H/V | ✓ |
| `1` | `SHAPE_DIAG` | 開放折線 → 一條 45° 直線 | `'open'` | `isStraightLine(…,'diag')` | 對角 | ✗ |
| `2` | `SHAPE_HLINE` | 開放折線 → 一條水平線 | `'open'` | `isStraightLine(…,'h')` | H | ✗ |
| `3` | `SHAPE_VLINE` | 開放折線 → 一條垂直線 | `'open'` | `isStraightLine(…,'v')` | V | ✗ |
| `4` | `SHAPE_TEMPLATE` | **任意形狀** → 地圖 json 給的單位座標模板 | 依該段 | `matchesTemplate` | 不鎖 | ✗ |

**前四筆是「嚴格特例」，`template` 是開放的逃生口**——地圖資料要什麼形狀都能描述，不必
改程式。留著具名形狀不是為了限制清單，是因為它們的判準是**整數格上的精確條件**
（`maxX-minX === maxY-minY`、全段同一 `row`），而 `template` 是**容差式**的（每點 ≤
`tolerance` 格）。把方形收進 template，「方形」就變成「容差內的近似方形」，而下游護欄
（邊鎖 H/V、成對縮方）正是靠那份精確性成立的。

**認不得的形狀碼會出聲**（`shapeKindOf` 的 `console.warn`）再退回方形——不靜默改判。
靜默退回會讓「地圖資料寫了新形狀、程式還沒加那一筆」的城市永遠判不達成又毫無線索。

- **新增形狀＝在 `SHAPE_KINDS` 加一筆**，不必再去改任何分派。這正是要的效果：在此之前
  「是不是 45°」是散在六處的布林（判準分派、`makeMover` 邊鎖、`movewise` 成對縮方、
  `shape.js` 引導方、顯示名後綴、城市檔後綴），加第三種形狀時每一處都會**靜默走錯分支**
  ——判準不報錯，只是永遠回 false。
- **三條直線（45°／水平／垂直）共用 `isStraightLine(cutIds, pos, axis, segs?)`**：它們本來就是
  同一條紀律（相鄰位移同號，同號同時保證共線與單調、不會折返成 V 字），只是比對的軸不同。
  `isStraightDiagonal`／`isHorizontalLine`／`isVerticalLine` 是它的三個具名包裝。
- **控制點（轉角控制點）對每一種形狀都合法，而且每一種形狀的判準都要認它**。控制點會被
  `applyShapeControls` 插進 `e.path`，**線真的從它那裡轉彎**；判準若只看規定站的格子，
  就會「資料是對的、線是歪的」——在規定成水平的線上放一個偏離的控制點，畫面是折的、
  判準照樣回 true 且不報錯（與「cells 是方的、線不是方的」同一類）。
  所以 `isStraightLine`／`matchesTemplate` 拿到 `segs` 時會先用 `expandThroughControls`
  把站序展開成**畫面上真正畫出來的那條路徑**再驗（方形本來就用 `connectedHV` 走轉角控制點 L 形，
  行為不變）。不傳 `segs` 時退回展開前的行為。
- **`SHAPE_TEMPLATE` 驗兩件事，缺一不可**：① 每個規定站到模板折線的距離 ≤ `tolerance` 格
  （預設 1）；② 各站沿模板的**弧長位置單調前進**（閉合模板允許回捲一次）。只驗位置的話，
  站可以在模板上亂序排——圖是散的，判準卻會過。套用時**只平移＋等比縮放、不旋轉**：
  允許旋轉的話，規定要往某個方向走的模板轉 90° 也算吻合，規定的意圖就沒了。
  模板與容差記在 `prescribed_shape[].template`／`tolerance`，由 `fromPrescribed` 帶進執行期。
- `RECT_SQUARE` 是 `SHAPE_SQUARE` 的舊名（形狀只有方形的年代），仍有引用。
- **45° 判在格座標**，不是畫面 45°：`|Δc| === |Δr| ≠ 0` 且整段同號，等價於全部折點落在
  同一條 `c + r = K` 上且 c 嚴格遞增。畫面角度由 Frame 的欄寬列高決定，在這一關解它
  就是循環依賴。
- **一城多段必須同形狀**：`cityShapeCode(cityId)` 混形狀時出聲並退回方形。
- **城市檔後綴依形狀**：`SHAPE_CITY_SUFFIX` ＝ `{0: '-shape-rect', 1: '-shape-diag'}`
  （單一真相；`metroDataPaths` 也要用它，所以放在 `shapePresets` 而不是會拉進 vue 的 `shapeEntries`）。
- **顯示名**：`SHAPE_I18N` ＝ `{0: 'style.shapeSquare', 1: 'style.shapeDiag'}`。

### stations 欄位的實際效果

⚠ **`stations` 目前對每一個城市都不生效**（2026-08-02 查明、2026-08-03 覆核；
維也納與名古屋那兩筆本來就是空陣列 `stations: []`，其餘 10 個方形城市的清單則是列了但用不到）。
`pickOneRing` 只在「規定站序完整存在」（每一站都在 `pos` Map 中）時才用手工清單，
但清單列的是環上**所有車站**——其中沿線白／黑直通站不是 `buildStraighteningGraph` 的彩色頂點，
條件永遠不成立。**每一城實際上都走 `extractRouteStations` 自動解**（範例：山手線列 37 站，
執行期環用 23 站）。所以改清單**不會改變任何矩形結果**。

唯一的例外意義：**莫斯科 Koltsevaya 是規定表裡唯一真正依賴手寫站序設計意圖的城市**
（12 站 + 1 個 x0 交叉點的小環；首次抓時自動解幾乎必定正確——但它是「人工確認過」的唯一一條）。
然而就程式行為而言，它走的路徑同樣是 `extractRouteStations`。

### 查詢 API

- `shapePresetKey(cityId)`：剝 `-shape-rect`／`-shape-diag` 尾綴後查註冊表，
  **對不到才再剝 `-lm` 查一次**；特例 `as-sgp-singapore-lrt`→母城。回 `null`＝不需跑指定形狀。
  ⚠ **順序不可倒過來**：多瑙河只存在於地標合併檔 `eu-aut-vienna-lm`，先剝 `-lm` 會對到
  根本沒有那條路線的本體維也納。
- `getShapePresets(cityId)`：回 `ShapePreset[]`（多環）或 `null`。
- `getShapePreset(cityId)`：只取第一環（向後相容）。
- `cityShapeCode(cityId)`：這座城市的形狀碼；無規定回 `SHAPE_SQUARE`，混形狀出聲後退回方形。

## 形狀判準（shapeCheck.js）

### `isShapeSatisfied(shape, cutIds, posMap, segs?)` ← **唯一入口**

依形狀碼查 `SHAPE_KINDS` 那一筆的 `satisfied`。第四個參數**兩種都吃**：傳陣列＝舊簽章的
`segs`（方形走轉角控制點 L 形要用），傳物件＝完整脈絡 `{ segs, template, tolerance, closed }`
（`SHAPE_TEMPLATE` 要用）。保留舊簽章是因為既有呼叫端都直接遞 `segs`。

> ⚠ **凡是要問「這段規定達成了沒」一律走這支。直接呼叫 `isFourLineSquare` 會讓 45° 的
> 城市永遠判 `false`，而且不會有任何錯誤訊息**——這是本家族最容易犯的錯。
> 現有呼叫端 `rect.js`／`hillClimb.js`／`llmWorking2Straight.mjs` 都已改成分派；
> `movewise.js` 的 `squarePairShrinkOnce` 是**刻意**仍直接用 `isFourLineSquare`，
> 因為它在函式開頭就把 `SHAPE_DIAG` 整段擋掉了（見下方該節）。

此模組**不 import `shapePresets`**（避免循環依賴），所以碼是寫死的 `1` 而不是 `SHAPE_DIAG`。

### `shapeOkOf(doc)` — 讀結果檔的「達成了沒」

權威欄位是 **`shapeOk`**；`square` 是 2026-08-08 之前的舊名鏡像（寫入端兩個都寫，
所以舊結果檔照樣讀得到）。**新增讀取點一律用這支**，免得哪天停寫舊鏡像時漏改一處而靜默失效。
export 另給每段 `shape` 與整體 `allShapeOk`。

### `isShapeControlId(id)`

`String(id).startsWith('shape-g')`——辨識控制點（矩形轉角控制點）（`shape-g` 前綴）。

### `isFourLineSquare(cutIds, posMap, segs?)`

判定規定 ring 是否仍為**四邊直線正方**——邊長相等的軸對齊框，每站都在四邊之上（`onBound`），
相鄰站之間連通 H/V（直連或只經控制點（矩形轉角控制點）走 L 形 BFS）。

- **邊長相等**：`maxX - minX === maxY - minY && maxX > minX`（整數格：正方＝邊長相等）。
- **onBound**：`x === minX || x === maxX || y === minY || y === maxY`——不在四邊上即 `false`。
- **connectedHV**：直連 `hopHV(a, b)`（同列或同行）即通；否則 BFS 只走 `isShapeControlId` 且
  在邊界上（`onBound`）且 hop 為 H/V 的中間站——允許經角上控制點（矩形轉角控制點）走 L 形。
- 每一對相鄰 ring 站（含首尾迴圈）都要通 `connectedHV`。

### `isStraightDiagonal(cutIds, posMap)`（`SHAPE_DIAG`）

判定規定路段是否為**一條 45° 直線**。輸入是**開放折線**（不閉合），先去掉相鄰重複 id，
少於 2 點即 `false`。

- 相鄰兩點 `dc !== 0 && |dc| === |dr|`——45°（`dc === 0` 一併擋掉垂直與原地）。
- 整段**方向一致**：`sign(dc)`／`sign(dr)` 與第一段相同；同號同時保證共線與單調，
  不會折返成 V 字。
- 沒有 `segs` 參數——45° 不需要 L 形繞路，控制點在這個形狀下沒有角色。

此模組獨立（避免 `hillClimb ↔ shape` 循環依賴），同時被 `hillClimb.js` 的矩形護欄
（`makeMover.squareOk`）與 `movewise.js` 的成對縮方（`squarePairShrinkOnce`）共用。

## 品質門檻（rect.js 常數）

| 常數 | 值 | 用途 |
|---|---|---|
| `MIN_CUTS` | **6** | 最少彩色頂點數：環點 < 6 直接 `ok: false` |
| `QUALITY_AR` | **1.001** | 長寬比門檻：`ar ≤ 1.001` 才算 ok（整數格下只有嚴格正方＝1） |
| `ALREADY_AR` | 1.001 | 同值——`already`（已是方不用重跑）另加 onEdge／sides |
| `QUALITY_ON_EDGE` | 0.4 | 至少 40% 頂點落在 bbox 四邊 |
| `QUALITY_SIDES` | 4 | 四邊都要至少有一個頂點命中 |

`squareQuality(cutIds, posMap)` 回傳 `{ ok, already, ar, onEdge, sides, w, h }`。
**`ok` 三條件缺一不可**：`ar ≤ QUALITY_AR && onEdge ≥ 0.4 && sides ≥ 4`。

## 選路與幾何——pickOneRing / pickAllRings

1. **匹配路線**：先比 `routeId`，再比 `nameRe` 且該路線是閉合或 first-cycle、最後
   只比 `nameRe`（三級 fallback）。
2. **站序**：規定 stations 完整存在 → 直接用；否則從匹配路線依 `segment` 解析
   （`extractRouteStations`→`firstCycle` 或全 filter）。
3. **引導方**：`alignShape(SHAPE_UNIT, pathPts)`——單位正方 `[-1,-1]…[1,1]` 平移＋等比縮放
   對齊 path bbox（D5：不旋轉；邊長取長寬平均）。

`pickAllRings(skeleton, pos, cityId)` 回 `[{ aligned, cutIds, routeId, routeName, shape, score }, …]`。

## 目標方框——wSquareBox / fourSideTargets

- **`wSquareBox(posMap, cutIds, cols, rows)`**：算規定環的 bbox → 縮成正方（取短邊，避免
  擴張鋪滿畫布）→ 中心對齊 → clamp 到格界。回 `{ minX, minY, maxX, maxY, side }` 或 `null`（< 4 點）。
- **`fourSideTargets(cutIds, box, asInt=true)`**：ring 均分四邊——依 `n / 4` 分四段、
  餘數前段各多 1；各段依 `corners` 間等 t 線性內插（`asInt`→取 round）。回
  `{ targets: Map<id,[c,r]>, ring, sizes, cornerIdx, corners }` 或 `null`。

## 控制點（矩形轉角控制點）（applyShapeControls / splitSegAt）

- **角上控制點（矩形轉角控制點）**：LLM 提 `controlSpecs = [{ a, b, c, r }, …]`，每個在 `a—b` 段中間插入
  `shape-gN` 控制點（`splitSegAt`：段拆兩半、`pos.set(gid, [c, r])`、inc 重建）。
  框的四角放控制點（矩形轉角控制點），環站只需滑到邊上（小移動），不被拉到角（大移動），network 改變最小。
- **`applyShapeControls(skeleton, controlPoints)`**：把形狀控制點寫進骨架 edges.path＋`stationClass.set(id,'shapeControl')`
  （`placeBlacks` 會把它當切點轉折）。**是 `shapeControl` 不是 `green`**——`green`（OSM Map 手動
  中途控制點）自 2026-08-09 起完全不進 `stationClass`，見系統說明 `route-skeleton-connect` ④。
- **控制點（矩形轉角控制點）凍結**：在 `applyShapeLlmTargets` 裡，`isShapeControlId(id)` 的站不接受外部移動
  （角格固定）；`settleTowardOriginal` 亦跳過。

## 論文 D1 三重鐵律

`applyShapeLlmTargets` 裡的 **gate** 函式同時擋三條，缺一不可：

1. **無撞格／無點壓線**（`hasPointOverlap(layout, segs)`）：同格兩站 → true；站落在
   非入射邊上（`onCellSeg`）→ true。
2. **不新增任何兩條線的互穿**（`edgeCrossKeySet`）：回傳 `Set<'kA#kB'>` 比原始邊
   層級——擋「站的相對內外側翻面」（例：棕線本在黃線外、移動後跑進黃線內）；
   同母邊碎段（控制點切開）互穿不算。**比只數交叉「數量」（`improperCrossCount`）更嚴格**
   ——使用量＝`improperCrossCount` 只記錄前後交叉差（stats），gate 用 `edgeCrossKeySet`。
3. **360° 環繞序不變**（`edgeOrdersMatch(geo, layout, segs, inc, isShapeControlId)`）：
   每個 degree ≥ 3 頂點的入射邊按角度排列的 id 序（cyclic）要在移動前後一致；
   控制點以 `farNbr` 穿透到真鄰居。

## applyShapeLlmTargets 雙策略

```text
輸入：targetEntries [[id,[c,r]], …]  +  controlSpecs [{ a, b, c, r }, …]
輸出：{ cellAfter, controlPoints, stats }
```

### 策略 A：原子整批（`via='batch'`）

- 目標格**無重複**才試（`tcells` 檢查）。
- 全部 targets 一次打入 `trial`，`resolveCellClashes(trial, frozen, cols, rows)` 把
  被壓到的**非凍結**站推到最近空格（由近到遠 Chebyshev 搜尋，rad ≤ 10；40 輪迭代）。
- 整批通過 `gate` → 採用（`chosen = trial`）。

### 策略 B：逐點貪心（`via='greedy'`，A 不通過時退回）

- `topoSafeTowardTargets(geo, targets, segs, inc, cols, rows, pathSet)`：逐站朝目標
  搜最近可行格——先走直接目標格，再走方向向量、再 Chebyshev 擴大（rad ≤ 5）；
  `M.validMove(id, [c,r])`（`makeMover` 四條鐵律＋FROZEN）逐步把關（80 passes）。
- 環站優先、其餘站在後（`ids` 排列）。

### 保險＋收方後回歸

- 雙策略後再跑一次完整 `gate`；不過→`reverted`（連控制點退回，用未插控制點的 `geo0`）。
- 通過後呼叫 `settleTowardOriginal`：其餘被推開的站**逐步拉回原相對位置**（max 40 passes），
  每一步只收「更靠近原位且 gate＋每一段 `allShapesOk` 仍成立」的候選
  （`allShapesOk` ＝逐段呼叫 `isShapeSatisfied`，一次驗全部）。
  控制點（矩形轉角控制點）凍結不動、環站可調但額外守矩形。

### stats 回傳

`stats` 含 `route`／`rings`（per-ring `{route, square}`）／`segs`／`verts`／`moved`／`via`／
`cross0`／`cross1`／`crosses`（`cross0→cross1`）／`squareBefore`／`square`（**所有段都達成指定形狀**
——欄位名沿用舊名，45° 城市讀起來要當成「達成了沒」而不是「方不方」）／`quality`
（最差環；45° 段沒有 quality，回 `null`）／`reverted`／`proposed`／`rejected`
（目標未到位的清單）／`controlCount`／`settled`（settle 階段被拉回的站數）。

落檔時的達成旗標是 **`shapeOk`**（`square` 為舊名鏡像），讀取一律 `shapeOkOf(doc)`。

## 矩形護欄（setSquareGuard）

矩形成方後，下游（論文鏈／movewise／Frame）不得把方啃掉：

- **`setSquareGuard({ ringIds, members, shape })`**（`hillClimb.js`）：設定**模組全域** `SQUARE_GUARD`。
  `shape` 缺省視為方形（`0`），舊呼叫端不必改；傳 `Set` 的更舊寫法也還收（當 `members`，
  ring 取非 `shape-g` 的點）。
  `makeMover` 在**建構當下**擷取護欄（`const squareGuard = SQUARE_GUARD`），所以
  護欄一定要在 `buildStraighteningGraph`／`makeMover` **之前**設好（「先建圖、後 setSquareGuard」
  靜默忽略——已知坑）。
- **`withSquareGuard(guard, fn)`**：巢狀護欄安全版——結束後**還原**（不是清空）。
  解決「外層先設護欄再呼叫內層」時內層 `clearSquareGuard()` 誤刪外層護欄的 bug。
- **護欄內容來源**（`src/components/d3/shapeFeed.js`）：
  - `ringIds`＝`shapeRingCutIds`（**實際矩形的環站序**，不可用 `preset.stations`）。
  - `members`＝`expandShapeMembers`（逐環把 ring＋控制點（矩形轉角控制點）＋環路線邊上所有 cut 累積聯集）。
  - `frozenIds = members`（Frame 的 `shapeLock`／LLM 釘回）。

### makeMover.squareOk（hillClimb.js）

兩條硬規則：

1. **剛體平移**：`members` 中被移的頂點必須**全體同一 (dc, dr)**——禁止單點／單邊變形。
   半平面合併若整塊帶著方形走仍可過（併格不致被誤殺）；`overrides` 必須含 comp 內
   **所有**點（含非 members），否則半平面裡一起動的非 member 被當成沒動 → 誤判「矩形邊被拉斜」。
2. **邊鎖定，依形狀分派**（讀 `squareGuard.shape`）：段至少一端在 `members` 且目前已對齊時，
   覆寫後仍須對齊——**方形鎖 H/V、45° 鎖對角**。

### squarePairShrinkOnce（movewise.js）

矩形時單軸掃空列／空行不動（方的對邊在同一列／行，單軸壓會把方壓扁）→
改試「成對縮方」：找方框最外空列對＋最外空行對（min/max 各一列），一起壓 1 格（方不變、
環站同步內縮）；`isFourLineSquare` 仍成立才接受。movewise 的 `gridMergeSweep` 在掃完空行
空列後自動呼叫它。

**45° 整段跳過**：函式開頭 `if (guard.shape === 1) return null`。成對縮格的整套前提是
「同時縮一欄一列、正方仍是正方」，而 45° 直線沒有寬高相等這回事——一欄一列各縮 1 反而
會打斷等斜率（斜線上相鄰兩點的 Δc 與 Δr 不會同步減少）。所以非方形一律不做，交給一般的
單軸壓縮。這也是本檔唯一一處**刻意**直接用 `isFourLineSquare` 而不走分派的地方。

## LLM 脈絡 export（shapeLlmContext）

`shapeLlmContext(skeleton, cells, cols, rows, cityId)` 回傳：
- `rings[]`：每段 `{ routeName, routeId, shape, cutIds, box, targets, square, quality }`。
  **45° 段**（`shape === 1`）的 `box`／`quality` 是 `null`（沒有方框可言），
  `targets` 改由 `diagTargets` 沿目前走向鋪一條單位對角線、錨在路徑中點。
- `edges`：全段的 `[a, b]` 鄰接表——讓 LLM 能把「整條線」當一組搬。
- `cross0`：輸入交叉數。
- `allSquare`：所有段是否都已達成各自的指定形狀（欄位名沿用舊名）。

## Frame 端的 shapeLock

system note `route-frame-draw` 描述的 `buildFrameMap` 有一個 `opts.frozenIds` 選項
（`frozenIds = squareGuard.members`）——矩形 ring 的灰白邊不參與重排路由：**凍結邊不生成
候選、不被 rip-up、pass 不嘗試更動**。詳見 系統說明 `route-frame-draw`。

## 一城多環

莫斯科是目前唯一兩環城市（5 號環線＋11 號大環線）。`pickAllRings` 逐環 pick，
`applyShapeLlmTargets` 裡 `cutIdsList` 是陣列的陣列；`gate` 和 `settleTowardOriginal`
對**每一段**都經 `allShapesOk` → `isShapeSatisfied`——任一段被啃掉就 reject。
stats 的 `square` 是全部段都達成。**一城多段必須同形狀**（`cityShapeCode` 混形狀時
出聲並退回方形），因為護欄的邊鎖定是全域一條規則，沒有「這條邊屬於哪一段」的資訊。

## 城市檔後綴與 label

- **後綴依形狀**＝`-shape-rect`（方）／`-shape-diag`（45°），一律經 `shapeEntries.shapeCityId(id)`
  產生；後綴表的單一真相＝`shapePresets.SHAPE_CITY_SUFFIX`（放在 shapePresets 是因為
  `metroDataPaths` 也要用它，而 shapeEntries 會拉進 vue）。
- **`metroFileKey` 在 id 沒帶後綴時要依形狀補**——寫死 `-shape-rect` 會讓 45° 城市的結果檔落進
  一個平行的矩形資料夾，而畫面讀的是 `-shape-diag`，症狀是「跑完了卻永遠尚未產生」。
  同理 `withRectSuffix`（畫廊顯示名）也依形狀給「（矩形）／（45°）」。
- **規定表鍵先比完整 id 再剝 `-lm`**——只在地標合併檔裡的路線（維也納的多瑙河）先剝就會對到
  沒有那條路線的本體。
- **`label` ＝路線自己的名字，照 OSM `route_name` 原文**：label 組成 `{形狀名}:{label}` 直接顯示在
  圖層概要，也寫進匯出脈絡與結果檔的 `route`。簡體與俄文是刻意的——它們是 OSM 的資料值，
  不是介面用語，翻了就對不上路線。既有結果檔的 `route` 是產生當下的紀錄，不重跑不會變；
  畫面顯示讀的是規定（`getShapePresets`）。

## 修改此機構時

- 規定增城：**編該城 geojson 的 `metro_system.prescribed_shape`**（working＋source 兩份），
  再跑 `node scripts/buildShapeSystems.mjs`（它會把規定同步進 index.json 並建出形狀城市檔），
  最後用 `node scripts/checkShapePresets.mjs` 驗環解得出來。
- 品質門檻：改 `QUALITY_AR`／`QUALITY_ON_EDGE`／`QUALITY_SIDES`，全部矩形城市重驗。
- 護欄邏輯：改 `squareOk` 或 `withSquareGuard`，必跑 `node scripts/checkFrameParity.mjs`。
- 判準模組（`shapeCheck.js`）被 3 支以上檔案 import，改動要同步驗 movewise 與 Frame。
- LLM 鏈求解戰術見 skill [[llm-shape]] 的「實際上要怎麼達成」一節。
