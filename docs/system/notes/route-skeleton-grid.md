---
description: 示意網格化完整規格——把 connect 骨架吸附到整數格：非中途站（轉乘／末端／交叉／控制／切斷／轉折／分隔；`stationClass ≠ 'black'`）定排名、藍線分隔（每對相異座標之間一條 denseCuts）、EPS=1e-6 判同位、撞格 nearestFree（Chebyshev 展開）、純環線中途站不佔位（不進 taken）、repairOcclusions（壓點/交叉/共線重疊修復）、compactEmptyAxes（壓掉空欄／空列）、placeBlacks 線性內插。Export measureCells/relativePosStats/edgeOrderViolations 供消融基線量測。實作 buildSchematicGrid（src/stores/schematicGrid.js）；不是 skill
layer: grid
---

# 示意網格化（route-skeleton-grid）

把 connect 骨架（系統說明 `route-skeleton-connect`）吸附到**整數格**。
非中途站（`stationClass ≠ 'black'`）依排名分配欄／列，藍色分隔線在每對相異座標之間（densest grid），
保證**一格至多一個非中途站**。本文件是網格化的**規格權威**（系統說明，**不是** skill）。
實作必須與它相符；改碼直接讀／改 `src/stores/schematicGrid.js` 的
`buildSchematicGrid`。

> 純函式：`posById` 是投影後的螢幕座標（SVG，y↓＝南），輸出整數格
> 是左下原點（col 0＝西、col↑＝東；row 0＝南、row↑＝北）。
> 像素格心：`y = y0 + (rows-1-r+0.5)·cellH`。

## 輸入

- `skeleton`：`buildConnectSkeleton` 的回傳值（`stationClass`、`edges`、…）。
- `posById`：Map<id, [x, y]>——投影後的螢幕座標。
- `extent`：`[x0, y0, x1, y1]`——畫布範圍。

## 演算法步驟

```
① 收集非中途站（stationClass ≠ 'black' 且有 posById 座標者）
② denseCuts：每軸相鄰相異值之間放分隔線 → cutsX, cutsY
③ 排名：rankOf(x, cutsX) → 欄；rankRow(y) = cutsY.length - rankOf(y, cutsY) → 列（SVG y 翻轉）
④ 撞格處理：ranked 排序 → 逐一 taken.add；撞格 → nearestFree（Chebyshev 環展開）
⑤ 純環線中途站補格（不進 taken）
⑥ repairOcclusions：消除排名吸附造成的壓點/交叉/共線重疊
⑥b compactEmptyAxes：去掉修復後沒點的欄／列（保留相對順序）
⑦ 版面網格：cols, rows, cellW, cellH, cx(c), cy(r)
⑧ posAfter：cellOf → 像素格心
⑨ placeBlacks：非中途站切點之間的中途站線性內插
```

### ① 收集非中途站

```js
const colored = [...cls]
  .filter(([id, c]) => c !== 'black' && posById.has(id))
  .map(([id]) => id)
```

`stationClass` 的值域＝`'red'|'blue'|'black'|'purple'|'pink'|'gray'|'yellow'`
（分別對應轉乘站／末端站／中途站／切斷站／轉彎站／分隔站／交叉點）。
**所有非 `'black'` 的值**都參與格線定義與格位分配。
**中途控制點（綠）不在其中**——自 2026-08-09 起它在 `stationClass` 裡就是 `'black'`
（使用者裁決：不參與節點計算，當中途站由 `placeBlacks` 平均放回；見系統說明
`route-skeleton-connect` ④），綠色只是顯示層補的。

### ② denseCuts

每軸收集非中途站的座標值，排序後在**每對相鄰相異值之間**取中點當分隔線。
間距 ≤ `EPS = 1e-6` 的相鄰值視為同位（不分隔）。

這保證：每個相異座標值 → 自己的一個排名 → 自己的一欄或一列。
**最密格網**（densest）→ 排名天生保序。

### ③ 排名

- `rankOf(v, cuts)` ＝ cuts 中小於 v 的分隔線數量 ∈ [0, cuts.length]。
- 列：地理南（高 SVG y → `rankOf` 最大）→ row 0（底）。
  `rankRow(y) = cutsY.length - rankOf(y, cutsY)`（**注意用 `cutsY.length`，
  不是 `length - 1`**）。

### ④ 撞格處理

`ranked` 排序（先欄再列再 id 字串序）→ 逐一放入 `taken` Set。
同一格已被佔 → `nearestFree(c, r, taken)`：
Chebyshev 環半徑 1→4000，同環內取歐氏距離最小的空格
（`nc ≥ 0`、`nr ≥ 0`；加上 `!taken.has`）。**一格至多一個非中途站**是硬規則。

### ⑤ 純環線中途站補格

純環線釘住的首站在 `stationClass` 仍是 `'black'`（中途站），但因是邊端點（`path[0]`
或 `path[path.length-1]`）、`placeBlacks` 與下游的段圖需要它有格，所以在此
補 `cellOf.set(id, [rankOf(x, cutsX), rankRow(y)])`。

**不查也不寫 `taken`**——中途站不佔位（一格一站的硬規則只約束非中途站；
中途站最後才在非中途站切點之間平均放置）。

### ⑥ repairOcclusions

排名吸附是逐軸獨立的排名變換，會扭曲相對幾何：不共線的三點可能吸附後共線、
不相交的兩段可能相交。修復迴圈在整數格空間偵測三類違規：

| 違規類型 | 定義 |
|---|---|
| VTX-ON（壓點） | 一個非中途站落在某條非鄰接段上（`onSeg`） |
| CROSS（交叉） | 兩條非共端段相交（`segsIntersect`） |
| OVERLAP（共線重疊） | 含共端點延伸重疊（「較短段遠端壓在較長段上」以 VTX-ON 呈現） |

**段**＝`cutSegs(skeleton, cellOf)`：骨架每條邊在非中途站切點處切開的小段，
只收兩端都有 `cellOf` 的段（與 `placeBlacks`／`buildStraighteningGraph` 同一套切法）。

**修復邏輯**（`repairOcclusions`，確定性無亂數）：
1. 每輪取第一個違規、依序試每個肇事點的 Chebyshev 環外移（半徑 1–6）。
2. 接受第一個讓**局部違規數嚴格下降**且不撞格的移動。
   - 局部數 `countLocal(v, …)` 只數涉及 v 的違規 → O(E) 而非 O(E²)。
3. 一輪所有肇事點都動不了 → 停（回報殘留數，不劣化）。
4. 迴圈上限 200 輪。

幾何謂詞（`orient`、`onSeg`、`segsIntersect`）來自 `src/lib/cellGeometry.js`
（整數格精確、`=== 0` 判共線；三處原各寫一份、窮舉＋隨機 200k 組對拍零差異後
合併為單一真相）。

### ⑦ 版面網格

```js
const cols = maxC + 1, rows = maxR + 1
const cellW = (x1 - x0) / cols
const cellH = (y1 - y0) / rows
const cx = (c) => x0 + (c + 0.5) * cellW
const cy = (r) => y0 + (rows - 1 - r + 0.5) * cellH
```

方形網格由顯示端 letterbox（D3 `frameWeightMode==='square'`／
`cellMapperFor({square:true})`），不在此強制。

### ⑧ posAfter

`cellOf` 的每個 `[c, r]` → `[cx(c), cy(r)]` 寫入 `posAfter` Map。

### ⑨ placeBlacks

`placeBlacks(skeleton, posAfter, snap)`（`schematicGrid.js` 的 export，
同時被 `buildHillClimb` 使用）：

骨架每條邊的 path 上找切點（端點 ＋ 所有非中途站：轉乘／末端／交叉／控制／切斷／轉折／分隔），
相鄰切點之間的中途站（`'black'`）**等分線性內插**：
```js
const t = j / (k + 1)
posMap.set(path[a + j], [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t])
```

切點若不在 `posMap` 中且提供 `snap` 回呼 → 以 rankOf 算格子後回推像素。
骨架網格化呼叫時的 `snap` 會為缺格的切點補 `cellOf`（純環線的釘住首站等）。

## 消融基線 export

`schematicGrid.js` export 三個量測函式，供消融基線（系統說明 `llm-skeleton2grid`
skill、`llm-working2grid` skill）使用。它們**只量不修**——基線就是要讓違規
顯示出來，修好了就沒有對照價值。

### measureCells(cellOf, segs)

對任意一組整數格指派 + 任意一組段，算出與 `repairOcclusions` 同定義的指標：

| 指標 | 定義 |
|---|---|
| `hv` | 嚴格水平或垂直的段數（`(dc===0) !== (dr===0)`） |
| `hvd` | 嚴格水平、垂直或 45° 對角的段數 |
| `cross` | 非共端段相交數（`segsIntersect`） |
| `vtxOn` | 點壓在非鄰接段上的次數（`onSeg`） |
| `collide` | 同格衝突數（一格至多一個非中途站，基線可能違反） |
| `segsTotal` | 段總數 |

### relativePosStats(posRef, posNew)

全域相對位置比對——地理 vs 格網指派：

- `orderFlip`：兩點在地理上有明確東西/南北方向，格網指派後翻號的對數
  （x、y 分開計；同軸幾乎重合 |Δ| ≤ span 的 0.1% 或格上同欄/同列不計）。
- `meanDrift`：兩邊各正規化 [0,1]（北↑）後，各點 Chebyshev 位移的平均 ×1000。

約定：`posRef` 的 y↑＝南（SVG），`posNew` 的 row↑＝北（整數格）。
內部把地理 y 取負對齊北向。

### edgeOrderViolations(segs, posRef, posNew)

邊環繞序檢查——與 `hillClimb.js` 硬規則④同定義（`orderKey` + `cyclicEqual`）：
每個 degree ≥ 3 的頂點，入射邊依 `atan2` 排成的環狀序不可改變。

- **與爬山的差別**：爬山比「移動前 vs 移動後」；消融基線拿**地理佈局**當參考
  （沒有「移動前」——從零指派；拿排名吸附結果當參考等於強迫模型抄排法）。
- 地理 y 取負（SVG y↑南 → 翻成 x 東 y 北），cell 空間 y 已是北↑。

回傳：環繞序改變的頂點 id 陣列。

## 交叉修復：升格中途站（2026-08-07 使用者裁決）

> 「整個過程和結果都不可以有路線是交叉的」

**交叉只從這一步進來。** 實測（三個網格化零交叉的城市 × 9 條鏈 × 循環）下游全程 0，
而 movewise 另有硬規則保證「重疊不得增加」（system note `route-hillclimb` ③）——
所以只要守住這個關口，整條管線就是零交叉。

**成因**＝排名壓縮：欄／列各自獨立取排名，保證每一軸的順序，但**不保證平面性**。
一條橫跨十幾欄的長弦（兩個非中途站之間全是中途站）會掃過別的段。
東京實例：南北線 白金高輪–麻布十番 × 淺草線 三田–戸越，**地理座標上兩者並不交叉**。

**修法＝把肇事長弦上的一個中途站升格成節點**（`stationClass` 標 `'gray'`，就是骨架化
本來就有的分隔站機制）。折線因此改為貼著真實路線走，而真實路線本來就不交叉。
**不新增節點、不動任何座標**，只改一個既有站的角色。東京實測：三個候選任選一個，
交叉都歸零，代價是網格 86×85 → 87×87。

實作在 `buildSchematicGrid`（`buildSchematicGridCore` 是不含修復的核心）；
上限 `CROSS_REPAIR_ROUNDS = 24`，終止性由「每站只能升格一次」保證，
結果記在 `grid.crossRepair = { promoted, remaining }`。

**修法有四段，由輕到重**（每一段都必須讓交叉總數**嚴格變少**才採納，否則還原）：

1. **升格肇事段內部的中途站**——先試內部站較多的那條弦，候選依「離弦中點最近」排序。
2. **兩條肇事段各升格一個**——有些交叉要兩邊同時讓開才解得掉。
3. **鄰近掃描**：肇事段自己沒有站可升格時，改試交叉點附近的中途站（上限
   `NEAR_SCAN_CAP = 120`）。**距離一定要用地理座標**——中途站沒有自己的格子
   （`cellOf` 只給非中途站），拿 `cellOf` 排序會全部是 Infinity＝等於亂挑。
4. **合成折點**（`tryBendPoint`）：兩端之間**一站都沒有**時（哈勒那條橫跨 34 欄卻無站的
   段），插一個新節點讓弦折一下。沿弦 5 個位置 × 9 個法向偏移，由形變最小的開始試。
   - **座標直接寫進傳進來的 `posById`，不進 `skeleton.crossings`**：那份清單的 `coord`
     是**地理經緯度**（呼叫點一律 `projection(c.coord)`），塞投影座標進去會被再投影一次。
     也不需要——修復跑在 `buildSchematicGrid` 裡，每個呼叫點都走同一套決定性流程。
   - **id 必須由內容決定**（`bend:<a>:<b>:<t>:<k>`），**不可以用全域計數器**：不同行程
     處理城市的順序不同就會給出不同 id，落檔與重算立刻對不起來（違反「視圖≡顯示」）。
   - 顯示類型由 `stationClass`（`'gray'` 分隔站）決定；`nodeTypes.nodeClassOf` 另對
     `bend:` 前綴補了同樣的判斷，沒帶 hint 的呼叫端也一致。

**全球實測（599 城）**：交叉修復後零交叉達 **99.5%+**；全球保留衍生資料的 frameParity **980 組全部零交叉**。
逐段效果：只做①②＝25 城／45 個；加③＝24 城；加④＝**3 城／7 個**。

**剩下 3 城**（哈勒 5、卡托維治 1、根特 1）：肇事段既沒有可升格的站，插折點也無法讓
總數變少（折點自己會多出一欄一列，可能在別處生出新的交叉）。這三城仍有骨架／網格／直線化衍生資料，只是交叉修不到 0。

**兩條試過但撤回的路**（別再走一次）：
- 放寬採納條件成「這一組解掉且總數不增加」：全球只從 25 城降到 24 城、總數一樣是 45，
  卻讓紐約＋地標的旋轉變體由 0 變成 3——那等於允許「換一個交叉的位置」，迴圈會在等值解之間游走。
- 「第一個交叉修不掉就停手」：一個死結會擋住後面全部可修的（33 城 vs 25 城）。

**下游修不了，別往那邊找**：實測在收斂後移動既有點 0 解，連在網格化階段做半徑 6 格
搜尋、甚至放寬象限與邊環繞序也是 0 解——交叉是排名指派的產物，不是某個點放錯位置。

## 回傳值

`buildSchematicGrid(skeleton, posById, extent, opts)` 回傳（`opts.repairCrossings === false`
可關掉上述修復；預設開）：

```
{ posAfter: Map<id, [px, py]>,
  blueBefore: { xs, ys, cx, cy },  // 真實分隔線位置 + 邊界；cx/cy＝刻度（節點實際座標）
  blueAfter:  { xs, ys, cx, cy },  // 均勻格邊界；cx/cy＝格心
  cellOf: Map<id, [col, row]>,     // 整數格位（含修復後位置）
  cols, rows }
```

- `blueBefore`：分隔線在原始座標上的位置（`[x0, ...cutsX, x1]`、`[y0, ...cutsY, y1]`），
  永遠在點之間、不穿過點。
- `blueAfter`：均勻格邊界。
- **`cx`／`cy`＝藍格線實際畫的位置（刻度）**，長度＝欄／列數，順序同 `xs`／`ys`
  （`cy` 由畫面上而下）。`blueBefore` 取**該帶彩色點的實際座標**（`bandTicks`，帶內
  多點取平均），`blueAfter` 取格心。
  為什麼不由 `xs`／`ys` 取中點：帶中點＝`(xᵢ₋₁+2xᵢ+xᵢ₊₁)/4`，是鄰距的平滑值——
  兩側間距不對稱（小城市、旋轉後、最外側那帶貼到 extent 邊）格線就會離開節點，
  違反「格線在刻度上、節點落在交叉線上」。`drawScene`／`gridLinesFromSep`／
  網格化動畫一律優先吃 `cx`／`cy`，缺才退回中點。
- `cellOf`：**整數格 per 非中途站切點**——下游爬山鏈在這個 cell space 運作，
  經同一套 `cx(c), cy(r)` 映射回畫面。

## 實作契約

- **純函式**：不修改 `posById`；`cellOf` 就地修改（`repairOcclusions`）後回傳。
- `EPS = 1e-6`：低於此間距的相鄰座標視為同位（不分隔）。
- 一格一站只約束**非中途站**（非 black）；純環線的中途站端不進 `taken`。
- `placeBlacks` 是 export（同時被 `hillClimb.js` 呼叫）。
- `measureCells`、`relativePosStats`、`edgeOrderViolations` 是 export——
  供消融基線量測用，網格化本身不呼叫它們。
