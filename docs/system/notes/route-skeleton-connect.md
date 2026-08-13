---
description: 骨架化（connect 骨架）完整規格——共線併邊、交叉點、中途控制點／路線控制點／形狀控制點、十種節點類型（轉乘／末端／中途／切斷／轉彎／分隔…）、hover＝色點＋類型名；實作 buildConnectSkeleton（src/stores/skeleton.js）；不是 skill
layer: skeleton
---

# 骨架化：connect 骨架（route-skeleton-connect）

把**工作地圖**（`1-raw-maps/working`）的地理網絡收縮成示意圖佈局用的
**connect 骨架**：共線併成一條邊、真交叉補**交叉點**、**轉乘／末端**錨點保留、
中段改為**中途站**、手動**中途控制點**／矩形**形狀控制點**覆寫；並在骨架邊上標出**轉彎站**與
**分隔站**（在圖面上過長的中途站連續段——量長度比例，不是數個數）。
本文件是骨架化轉換的**規格權威**（系統說明，**不是** skill）。
實作必須與它相符；改碼直接讀／改 `src/stores/skeleton.js` 的 `buildConnectSkeleton`。

> **節點記類型名、不記顏色**：語意身份＝下表「類型」欄；`stationClass` 的
> `'red'|'blue'|…` 與 `NODE_COLOR` 只是實作／預設繪色（顏色可變）。hover／圖例／文件
> 一律用類型名（見 `src/lib/nodeTypes.js`）。
>
> **Hover 契約**（`src/stores/popupHtml.js` 的 `stationPopupHtml`，地圖＋D3 同一份）：
> 類型名**前面**＝類型色點（與 Style 圖例 `.sk-dot` 同形；一律實心，中途站＝白），
> 同一行接類型名（`style.leg.node*Desc`）。改類型或色盤時三處一起改：
> `nodeTypes.js`／`NODE_COLOR`／本表＋圖例 i18n。

| 類型 | `stationClass` key（實作） | 預設繪色（`NODE_COLOR`） |
|---|---|---|
| 轉乘站 | `red` | 紅 `#e11d48` |
| 末端站 | `blue` | 藍 `#2563eb` |
| 交叉點 | `yellow` | 黃 `#eab308` |
| 切斷站 | `purple` | 紫 `#a855f7` |
| 轉彎站 | `pink` | 粉紅 `#ec4899` |
| 中途控制點 | `green`（**只在顯示層**，見 ④） | 綠 `#22c55e` |
| 路線控制點 | `routeControl` | 深綠 `#15803d` |
| 形狀控制點 | `shapeControl` | 藍綠 `#81D8D0` |
| 分隔站 | `gray` | 灰 `#9ca3af` |
| 中途站 | `black` | 白 `#ffffff` |

> 圖例「節點」列與「注意路段」同構：鍵＝色點＋顏色中文、值＝類型名；
> 順序＝轉乘→末端→交叉→切斷→轉彎→**分隔（灰）**→形狀控制→中途控制→**中途（白，置底）**。
> 紅＋藍疊色示意＝切斷站同紫（`EDGE_OVERLAP_MIX`）。Hover／物件 tab 仍顯示**類型名**。

> **不拉直**：地理折線形狀保留，只做**拓撲收縮與標記**。純幾何／圖論轉換，
> **零網絡、零 token**：只讀已載入的 GeoJSON（系統說明 `route-skeleton-river` 的
> 河流已在資料層轉成一般路線 feature），不修改來源資料，輸出節點分類／邊分類／標記
> 點供繪製。實作：`src/stores/skeleton.js` 的 `buildConnectSkeleton(geojson, opts?)`；
> UI 是 `D3Tab.vue` 骨架地圖的**骨架化**按鈕（`d3.skeletonize`）。

## 資料前提

線幾何＝「共站合併後，依停靠順序相連」（`metro-osm-fetch`）。圖論：
「節點＝車站」、「邊＝某路線停靠順序上相鄰的兩站」；共線（重疊路段）在資料層
已去重成 `route_count≥2` 的路段。

> **頂點不一定是車站**：跳站快車沿真實走廊彎曲而不停中間各站，所以 feature 幾何
> 含有**非車站頂點**（如雪梨 Strathfield→Redfern 段有 11 頂點，只有首尾兩個是停靠
> 站）。**建圖與分類用 `routes[].stations` 的完整行經順序（stop ＋ pass）；畫線一律
> 用 feature 的原始幾何 `path(f)`**——否則跳站段會被拉成橫越空白區的長直線。

## 演算法步驟

```
① 讀站、讀路線（含 pass，相鄰重複去重）
② detectCrossings：幾何交叉 → 交叉點（splice 進 routes/coord）
③ 建圖（adjacency + edgeRoutes）、分類節點（轉乘／末端／中途）
④ 覆寫：交叉 id 強制 'yellow'；is_control / station_role='control' / ctrl- 前綴 → 'green'
⑤ 收縮 degree-2 中途站鏈成骨架邊（walk）；純環線釘首站
⑥ 攤平真實 feature 幾何 → edge.geom
⑦ 邊分類（共線/環線/頭尾共點/一般）
⑧ 轉彎站（sinuosity + 相對 DP）
⑨ 切斷站（**缺幾個補幾個**：parallel 需 1、loop 需 2 個內部有色點，轉彎站算數）與分隔站（地標線＝段長 > 全圖對角線 10% 就遞迴切；地鐵＝每 5 個）
```

**關鍵順序**：② `detectCrossings` 在**建圖之前**——交叉點 splice 進各路線的
`stations` 後，③ 才建鄰接表與 `edgeRoutes`，所以交叉點一開始就是圖的一部分、
天生 degree ≥ 3，收縮會在交叉點處切邊。

### ① 讀站、讀路線

- 站座標：遍歷 GeoJSON，Point feature → `coord.set(station_id, coordinates)`。
- 路線：非 Point feature 的 `properties.routes` → 每條 route 取完整行經序
  `stations[].station_id`（含 pass），濾掉無座標者、相鄰重複去重。
  - **railColors**：單路線的段若帶 ≥2 種 `route_colors`（鐵路交錯線如 JR 山手線：
    官方色＋白）→ 存 `railColors` 供渲染用；**分類**仍只用單一 `route_color`
    （否則單線因帶 2 色被誤判成共線）。

### ② 幾何交叉 → 交叉點（`detectCrossings`）

獨立函式，在 `buildConnectSkeleton` 主體**建圖之前**呼叫。就地改動 `coord`（加
交叉點座標）與各 route 的 `stations`（splice 進交叉 id）。

- 對每一對路線（含同一路線的自交 `b = a`）掃瞄線段交叉：
  - 參數 t、u 嚴格在 `(EPS, 1-EPS)` 內（`EPS = 1e-6`），排除共用端點。
  - 同路線自交：`j` 從 `i+2` 起，跳過自己與共頂點的鄰段。
  - 快速 bbox 排除加速。
- **弦交叉 → 驗真實軌道**：停靠站之間的直弦只是候選過濾；每個弦交點要拿兩條
  路線在那一對停靠站之間的**真實 feature 折線**（`realLeg`）驗算——弦能交但
  真實軌道不交的（如跳站快車弦 shortcut 了彎道），`realHit` 回 null → 丟棄。
  真實軌道確實交叉時，取**精確交點座標**（死在兩條線上）。
- **落在畫出的線上**：交點還須同時在兩條路線的 feature 幾何上（`onRouteGeom`，
  約 30 m 容差），否則丟棄（實現「同軌服務不互相穿越」：紐約快慢車共軌的弦交
  浮在軌道外）。
- 倖存交叉 → 合成 id `x0, x1, …`；座標寫入 `coord`；id splice 進兩條路線的
  `stations`（按段內參數 t 排序，降序 splice 以保持先前索引不動）。
- 回傳 `{ crossings, crossIds }`；`crossIds` 後續強制覆寫成 `'yellow'`（交叉點）。

### ③ 建圖、分類節點

adjacency graph：`nbr`（id → Set(鄰站)）、`edgeRoutes`（`pairKey(a,b)` → Set(routeId)）。
節點分類由 `classifyStationRoles`（`src/lib/stationRole.js`）——與 Metro Maps
`is_interchange`／`is_terminus` 完全相同：

| 類型 | 條件 |
|---|---|
| 轉乘站 | `degree ≥ 3`，或 `degree = 2` 但兩側的 **route_color 集合**不同 |
| 末端站 | `degree ≤ 1`（畫出來那條線的末端；共線多線走廊末端仍為末端站） |
| 中途站 | `degree = 2` 且兩側 route_color 集合相同 |

### ④ 覆寫交叉點（中途控制點**不**覆寫）

- **交叉點**：`crossIds` 裡的每個 id → `cls.set(id, 'yellow')`（不套用 degree 規則）。
- **中途控制點**（`p.is_control`／`p.station_role === 'control'`／`ctrl-` 前綴，判準單一真相＝
  `nodeTypes.isControlNode`）：**不覆寫分類**——使用者裁決 2026-08-09「把中途控制點（綠）不要
  變成節點計算的一部分，把他也當中途站（白）一樣，平均放在線上就好」。它是使用者在
  OSM Map 上拉線形用的錨點，不是拓撲節點，所以照 degree 規則落在**中途站**（`'black'`）、
  被收縮進邊裡，網格化的 `placeBlacks` 事後沿弧長平均放回。`addControlPoint` 一律插在
  既有兩站之間（`station_degree: 2`），所以正常資料下必為中途站。
  ⚠ 這裡曾經 `cls.set(id, 'green')` 把中途控制點變成骨架切點——那會讓它佔掉一整欄／一整列
  格線、進直線化與硬規則檢查，等於使用者手動加一個點就改掉演算法結果。不要加回來。
- **畫面上仍標綠**（同日裁決）：顯示類型走 `nodeTypes.skeletonDisplayClass(props, cls)`
  ——只有計算分類是中途站時才覆寫成 `'green'`，真的落在轉乘／末端就照實顯示。
  消費端＝`buildDrawData`（D3 主視圖）與 `viewGeometry` 的三個縮圖點迴圈；
  Frame 自動隱藏白點時中途控制點**不跟著消失**（`buildDrawData` 的 `hiddenWhite` 濾網放行）。

**`isNode` 判定**：`cls.get(id) !== 'black'`——轉乘、末端、交叉皆為骨架切點，
收縮不穿過它們；**中途控制點不是**。

### ⑤ 收縮成邊

從每個 `isNode` 的節點出發，`walk` 穿過 degree-2 中途站鏈直到下一個節點，產生
`edges[]`。簽名去重（`sig`＝正規化的 path 字串）。
**純環線**（整條路線無轉乘／末端節點的 component）→ 釘首站為節點，自環邊 `a === b`。

### ⑥ 真實幾何 `edge.geom`

以路線的**停靠站**（含 splice 進的交叉點）切割 feature 折線，產生每條邊
的真實折線座標串 `[[lng,lat], ...]`。交叉點是 feature 線段的**內部插值
點**（不是頂點），用 `paramOnSeg` 在線段上定位後切割（`cuts` 含真正頂點停靠站
＋交叉點的分數索引 `pos`）。
沒有 feature 幾何的段退化成兩端直線。

### ⑦ 邊分類

| 類別 | 條件 | 墊底色（`EDGE_HL`） |
|---|---|---|
| 共線 `coline` | 該邊 routes 有 ≥2 種**相異 `route_color`** | `#e11d48` |
| 環線 `loop` | `e.a === e.b`（自環；優先於 parallel） | `#22c55e` |
| 頭尾共點 `parallel` | 同一節點對 A–B 有 ≥2 條幾何不同的邊 | `#2563eb` |
| 一般 `plain` | 其餘 | 無墊底 |

- **`routeColors`**：行經該邊的各路線顏色 → 用於分類。
- **`renderColors`**：單路線的鐵路交錯段 → `railColors`（官方色＋白），其餘同
  `routeColors`。用於網格化後／Frame 視圖繪製交錯多色虛線。

### ⑧ 切斷站——缺幾個補幾個，**算在轉彎站之後**

切斷站保證的是「這條邊要有足夠的**內部有色點**」：`parallel`（同一對節點之間有兩條邊）
缺了它，兩條邊在格網上會落到同一組格子、完全重疊；`loop`（自環）需要 2 個，否則環會
塌成一條來回線。**轉彎站同樣是內部有色點**，所以先算轉彎站，不夠才補切斷站
（使用者 2026-08-08：「已經有轉彎站了，那切斷站不就不會有了……路線也是，不只地標」）。

| 邊類型 | 需要的內部有色點 | 補的位置（只補缺的那幾個） |
|---|---|---|
| 共線 coline | 0 | 不切 |
| 頭尾共點 parallel | 1 | 弧長 **1/2** 處最近的**中途站** |
| 環線 loop | 2 | 弧長 **1/3**、**2/3** 處最近的**中途站** |

有多個候選位置而只缺一個時，挑**離既有有色點最遠**的那個（補在轉彎站旁邊等於白補）。
候選一律只看還是中途站的點，不會把轉彎站改寫成切斷站。

**兩點邊補不了**：`path.length === 2` 的邊沒有內部可放，新舊實作都放不了切斷站
（全球 457 條 loop／parallel 邊裡有 85 條是這種）——這是資料的真實上限，不是失敗。

改動實測：全球 599 城裡 **120 城**的骨架有變（多半是小型電車城的 parallel 邊），
共減少數百個多餘的切斷站；**回歸 0 條**（沒有任何一條邊因此掉到門檻以下）。
地標的代表案例＝東京皇居環：305 個折點、8 個轉彎站 → 2 個切斷站全免。

### ⑨ 轉彎站與分隔站

> **分隔站還有第二個來源**（2026-08-07）：網格化的交叉修復會**回頭把中途站標成 `gray`**，
> 讓肇事長弦折一下繞開交叉；修不掉時另插合成折點 `bend:*`（同樣標 `gray`）。
> 也就是說骨架化跑完之後 `stationClass` 仍可能被 `buildSchematicGrid` 改動——
> 規格見系統說明 `route-skeleton-grid`「交叉修復」。

最終 `stationClass` 從 `cls` 複製後，逐邊標記：

**轉彎站**（代表性轉折）——兩道關卡：

1. **sinuosity 關卡**：`PINK_SINUOSITY = 1.25`。弧長 ÷ 兩端弦長 ≤ 1.25 → 該邊
   不標轉彎站。環線弦長 ≈ 0 → 視為極度彎曲。
2. **相對 Douglas–Peucker**：`PINK_DP_TOL = 0.25`。遞迴地在子段兩端的連線
   基準上，最遠中間頂點的 **perpDist ÷ 子段弦長 > 0.25** 才保留。
3. 被保留的中間頂點須仍是**中途站**才標轉彎站。
4. `pinkInfo` 記錄每個轉彎站的 sinuosity、DP 子段基準線（`baseA, baseB`）、垂足、
   ratio，供 hover 參考線用。

**分隔站**——**地鐵邊與地標邊（河流／面域環線）準則不同**（門檻與實測見系統說明
`route-skeleton-river`）。兩者的「一段」定義相同：任兩相鄰邊界點（端點 ＋ 轉折／切斷／
交叉／控制）之間的連續中途站；分隔站本身也成為邊界。

- **地鐵**：連續中途站數 N → `G = ⌊N / METRO_GRAY_EVERY⌋`（現行 5）個，平均分布偏中間。
- **地標線**（`route_id` 以 `river:`／`area:` 開頭，2026-08-08 起）：若**弧長 ÷ 全圖對角線
  > `GRAY_MAX_SPAN_RATIO`**（現行 `0.10`），就把最接近該段弧長中點的中途站升成分隔站，
  再對兩半遞迴，直到每段都低於門檻。段中間沒有可升格的中途站就切不動——真實上限、不是失敗。
  比例是尺度不變的，bake（1200×800）與畫廊縮圖（200×200）因此得到同一份骨架；度量前先做
  局部等角化（`figXY`），否則 Mercator 的緯度拉伸會讓東西向的段被低估。

地標線歷來三代（都已作廢，別再照舊文改）：① 遞迴彎曲度細分 `RIVER_GRAY_SINUOSITY`；
② 完全不放分隔站；③ 每 20 個中途站切 1 個。**地鐵那條從頭到尾沒變過。**

## 線是怎麼畫的（骨架 vs 網格化後）

**核心原則**：每個視圖的「線」都畫同一組 feature、同一組顏色（單色實線／共線的
交錯多色虛線）；**唯一差別是頂點座標**。骨架標記另外疊上去。

- **地理座標視圖**（純骨架 `skeleton`、網格化前 `grid-*-pre`）：用 feature 幾何
  `path(f)` 畫線 ＋ 節點類型色 ＋ 邊分類墊底（沿 `e.geom`，寬 `strokeWidth+11`、
  半透明 0.55）。
- **網格化後 / HC / Frame**：用骨架拓撲邊（`edgeD`／`edgeLinesFromPos`），
  不把 feature 幾何逐頂點吸附——pass 車站會被吸到其他格，拉壞線。無邊分類墊底。
- **兩支繪製程式**：主視圖 `buildDrawData.js`、畫廊縮圖 `viewGeometry.js`。
  繪製規則的變更**兩邊都要改**（見系統說明 `route-view-sync`）。

## 骨架視圖上的點與邊

| 類型 | 說明 | `NODE_COLOR`（預設） |
|---|---|---|
| 轉乘站 | 樞紐／轉乘／分歧 | `#e11d48` |
| 末端站 | 真端點 | `#2563eb` |
| 交叉點 | 幾何交叉合成 | `#eab308` |
| 中途控制點 | OSM Map 手動（`is_control`／`ctrl-`） | `#22c55e` |
| 路線控制點 | 電車／輕軌**不同路線交會**處的真實軌道分叉（`junc:`／`is_junction`）——**不是車站**，不計入站數；依 **tracks 圖層**插入（≥2 條 route_ref；單線分叉不插；路口 60 m 內無站才補；兩站則補 A–J–B；**一交會一點**；**有 J 則三角閉合＝星形 -|，不留 △**），**參與節點計算**（與中途控制點相反）。產生＝`scripts/_routeJunctions.mjs`，只對 tram／light_rail | `#15803d`（深綠） |
| 形狀控制點 | 矩形導引角折（`shape-g`／`stationClass=shapeControl`） | `#81D8D0`（藍綠） |
| 切斷站 | 頭尾共點／環線切點 | `#a855f7` |
| 中途站 | 中段直通（`stationClass='black'`，預設畫白） | `#ffffff` |
| 轉彎站 | 彎曲邊的代表性轉折 | `#ec4899` |
| 分隔站 | 過長連續段的分隔 | `#9ca3af` |
| 共線邊墊底 | `EDGE_HL.coline` | `#e11d48` |
| 環線邊墊底 | `EDGE_HL.loop` | `#22c55e` |
| 頭尾共點邊墊底 | `EDGE_HL.parallel` | `#2563eb` |

## 實作契約

- `buildConnectSkeleton(geojson, opts?)` 是**純函式**：不修改輸入。回傳：
  ```
  { stationClass: Map<id, 'red'|'blue'|'black'|'purple'|'pink'|'gray'|'yellow'|'shapeControl'>,
    edges: [{ path, geom, cls, color, routeColors, renderColors, routes }],
    pinkInfo: Map<id, {chordA,chordB,baseA,baseB,pt,foot,sinuosity,ratio}>,
    crossings: [{ id, coord }],
    routes: Map<routeId, { id, name, color, railColors, stations }> }
  ```
- `stationClass` 值包含 **`'routeControl'`**（路線控制點，由 `buildGeojson` 插進工作地圖、
  骨架依 `isJunctionNode` 覆寫；**列在形狀控制點之前**）與 **`'shapeControl'`**（形狀控制點，由 `applyShapeControls` 事後寫進骨架），
  與轉乘／末端／交叉一樣是骨架切點。**不含 `'green'`**（中途控制點）——中途控制點自 2026-08-09 起
  不參與節點計算，在這張表裡是 `'black'`，綠色只在顯示層由 `skeletonDisplayClass` 補（見 ④）。
- **只有轉彎站有 `*Info`**。分隔站**沒有** `grayInfo`（從未實作）——它的 hover 說明由
  `popupHtml.grayWhyText` 依門檻現算，見系統說明 `route-skeleton-river`。
- `opts.grayMaxSpanRatio` 可覆寫地標線的分隔門檻，**只給實測掃描用、不是 UI 設定**
  （工具列的「河流分隔曲折度」早已整組移除，不要再加回可調參數）。
- 常數：`PINK_SINUOSITY = 1.25`、`PINK_DP_TOL = 0.25`、
  `GRAY_MAX_SPAN_RATIO = 0.10`（地標線分隔門檻）、`METRO_GRAY_EVERY = 5`（地鐵每 N 個），
  三個 gray 相關常數都由 `skeleton.js` 匯出。
- `edge.cls` ∈ `{ 'coline', 'loop', 'parallel', 'plain' }`。
- `edge.geom` ＝真實折線座標串（以停靠站切割 feature 折線，含交叉點定位）。
- `routes` 是有序車站 id 序列，供矩形導引（系統說明 `route-shape-rect-align`）挑路線／配形；
  其他呼叫端可忽略。

## 修改這個轉換時

節點類型／邊分類、切斷站或轉折／分隔規則有變時，**本文件與 `src/stores/skeleton.js` 要一起改**，
並同步 `src/lib/nodeTypes.js` 與圖例 i18n（`style.leg.node*Desc`）。河流專屬的微調見系統說明 `route-skeleton-river`。
