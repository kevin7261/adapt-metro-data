---
description: 結果 json 存什麼——「這一張圖長什麼樣」（格座標／繪圖幾何，版本化永不刪）；核心鐵律是**每一份 json 都自足**：檔內原樣內嵌來源 geojson（`source` 欄位），匯出後單獨匯入顯示不變、不受其他檔變化影響，讀取端缺它一律報錯而非回頭抓城市檔；另含「沒算過就沒有那張圖」「面板只讀本層的檔」「匯出＝原檔原文」與三支安全網。
layer: working
---

# 結果 json 存什麼（data-file-json）

本文件是**結果 json 內容**的規格權威（系統說明，**不是** skill）。實作必須與它相符。

姊妹篇＝[`data-file-geojson`]（來源 geojson 存什麼）。

實作＝`src/lib/embeddedSource.js`（自足封包純函式）＋`scripts/_embedSource.mjs`（Node 端掛載）
＋`scripts/_jsonVersions.mjs`（版本化寫檔＋自足關口）＋`src/lib/metroNetworkLayout.js`（路徑）。

## 一句話

**json ＝「這一張圖長什麼樣」**——格座標與繪圖幾何。
**一個 json 只存一個圖**：會顯示出來的才落檔，中間計算過程不存（要用時現算）。

| 階段 | 檔案 | 圖的內容 |
|---|---|---|
| 1 RAW MAPS | `1-raw-maps/skeleton/` | `views.skeleton`＝繪圖幾何（`lines:[{d,color}]`／`dots:[{x,y,fill}]`） |
| 2 GRIDDING | `2-gridding/grid/` | `views['grid-orig-pre'\|'grid-orig-post']`＝同上 |
| 2 GRIDDING | `2-gridding/llm-{skeleton2grid,working2grid}/<model>/` | `cells`／`cellAfter`＋`llmGrid`（欄列數） |
| 3 STRAIGHTENING | `3-straightening/{來源}/[{模型}/]{鏈}/{子夾}/` | `cellAfter`＝`[[id,c,r],…]`＋`stats`／`cols`／`rows` |
| 4 FRAME MAPS | `4-frame-maps/{來源}/{鏈}/llm-{eval,grid}/`、`…/{來源}/llm-compare/` | 評價／權重／比較報告（Frame 路網本身不落檔，現畫） |

`3-straightening` 的 `cellAfter` **只有整數格座標**——沒有站名、沒有拓撲、沒有顏色。
LLM 直線化的結果另放在鏈檔的 `align` 子物件（讀取一律 `alignOf(doc)`）。

## 鐵律：每一份 json 都自足

**每一份 json 都要能單獨匯出、單獨匯入，而顯示完全不變，且不受任何其他檔變化的影響。**

所以每一份落檔的 json 都在 `source` 欄位裡**原樣**帶著它畫圖要用的工作地圖 geojson。

### 內容範例①：骨架地圖（as-twn-taipei）

`1-raw-maps/skeleton/{戳}/as-twn-taipei-1-skeleton.json`——由 `buildViews.mjs` 寫，
幾何來自 `computeCityViews()`。

**下面的值都是拿同一支程式對台北現算出來的**（`computeCityViews(台北 working geojson,
{ cityId: 'as-twn-taipei' })`），只把長陣列截短成 `…`。時間戳沒有固定值所以寫成 `…`；
其餘每一個數字都可以重跑對得回來（重抓 OSM 之後會變，那是應該的）。

```jsonc
{
  // ── 這一層是誰 ────────────────────────────────────────────────────
  "id": "as-twn-taipei",
  "file": "maps/as-twn-taipei/as-twn-taipei/1-raw-maps/working/as-twn-taipei-1-raw-maps-working.geojson",
  "city": "Taipei", "cityZh": "台北",
  "country": "Taiwan", "countryZh": "台灣",
  "continent": "asia",
  "line_count": 15, "station_count": 176,
  "stage": "skeleton",                  // 這一份是哪一階（skeleton／grid）
  "tilt": 6, "canRotate": true,         // 建議旋轉角（見 route-orientation）
  // 指定形狀城市另有 "prescribed_shape": [ { shape, route, stations… } ]；台北沒有

  // ── 這一張圖 ──────────────────────────────────────────────────────
  "W": 200, "H": 200,                   // 這份幾何的畫布（縮圖直接照畫）
  "views": {
    "skeleton": {
      "lines": [                        // 路線：已排版好的 SVG path（共線多色＝各一筆＋dash）
        { "d": "M103.721,150.218L110.726,146.917L114.098,144.028…", "color": "#007ec7" },
        …                               // 台北 17 筆
      ],
      "hl": [],                         // 邊分類襯底（切斷／共線…）；台北是空的
      "dots": [                         // 節點：位置＋類型色（177 個＝176 站＋交叉點）
        { "x": 143.5, "y": 109.7, "fill": "#e11d48" },   // 轉乘站
        { "x": 181.7, "y": 107.6, "fill": "#ffffff" },   // 中途站
        …
      ]
      // 有面域地標的城市（-lm）另有 "areas": [ … ]（填色面 path）
      // **骨架的視圖不寫 `grid`**：它畫的是網格化前的地理位置，沒有格線
    }
  },

  // 這一層的 n × n ＝網格化**前**的排名格線數（`grid-*-pre` 的格線數，與網格化後可能差一點）。
  // 骨架自己沒有格線，但底標仍要寫 n × n，所以同一次 build 就把數字寫進它自己這份檔
  // ——面板只讀本層的檔，不會去問網格地圖那一份。
  "cols": 59, "rows": 59,

  // ── 這一版的兩個時間（只有兩個，沒有修改時間）──────────────────────
  "startedAt": …,                       // 開始算的時間（epoch ms）；沒量到就整個不寫
  "generatedAt": …,                     // 算完落檔的時間＝**這一版自己**的（不可沿用舊值）

  // ── 畫得出來所需的全部來源（自足的關鍵）────────────────────────────
  "source": {
    "type": "FeatureCollection",
    "metro_system": { "city": "Taipei", "line_count": 15, … },
    "features": [ …176 個站點 Point ＋ 17 個路段 MultiLineString… ]   // 見 data-file-geojson
  },
  "sourceHash": "ufdwiw.2sq8"           // djb2 雜湊 + '.' + 長度（36 進位）；去重與稽核用
  // `sourceFile`（來源的原檔名）只有走 attachSourceFor() 的寫入端會記——buildViews 沒記，
  // 所以版本資料夾裡那份來源副本叫 source.geojson（見下方「版本化」）
}
```

#### 每一次計算都是獨立事件

**指紋機制整組移除**（不只是 `_fp`）：結果檔不再寫 `fingerprint`／`srcFingerprint`，
bake 與各 LLM 鏈也不再拿它做 fresh-skip，資訊分頁的「與目前資料相符／可能過期」那一列
一併拿掉。唯一留下的是那個物件裡**真正在用**的資料——起算的格網——改以一般欄位
`baseCols`／`baseRows` 續寫，讀取一律走 `baseDimsOf()`（舊檔的 `fingerprint.cols/rows`
仍讀得到）。要重算就重算：`bakeStraighteningCells --force`（「重新計算」按鈕本來就帶）。

**沒有指紋、沒有增量沿用**：`buildViews.mjs` 跑到哪一城就
重算哪一城，不比對「資料有沒有變」。理由是「重新計算」按下去就該真的算——資料沒變時
什麼都不做，使用者看不出到底算了沒；而版本化之後，這一次算的結果本來就該留下自己的那一版。

先前的 `_fp`（＝`VIEWS_VERSION:來源 geojson 雜湊`）已移除，`VIEWS_VERSION` 也不必再
因為改了畫線程式而遞增。

**算出一模一樣的東西也照樣留一版**——「這一次算過」本身就是要記錄的事，內容比對
（`sameContent`）也一併移除了。

⚠ 連帶要求：**呼叫端得自己確保一次執行只寫一次**。`bakeStraighteningCells` 的
`writePartial` 每算完一條鏈就掃過所有已完成的鏈，不擋的話第一條鏈會被寫 9 次＝9 個
一樣的版本；那邊用一個 `written` 集合擋住（續跑帶進來的舊結果也算已寫）。


### 內容範例②：直線化的鏈檔（as-twn-taipei）

`3-straightening/grid/algorithm-stroke/network-loop/{戳}/as-twn-taipei-3-grid-algorithm-stroke-network-loop.json`
——由 `bakeStraighteningCells.mjs` 寫（①筆畫法的 post 之後再跑 movewise 循環）。
這一階**不寫 `views`**，只寫整數格座標。數值同樣是拿同一批函式對台北現算的：

```jsonc
{
  // ── 這一份是誰算的 ────────────────────────────────────────────────
  "algo": "hccells-v13",                  // STRAIGHTENING_CELLS_ALGO（改了＝全球結果檔失效）
  "cityId": "as-twn-taipei", "variant": "orig", "isShapeCityFile": false,
  "chain": "stroke", "stage": "loop",     // 哪一條鏈、哪一個子夾（post／loop）

  // ── 這一張圖 ──────────────────────────────────────────────────────
  "cellAfter": [                          // [站 id, 欄, 列]；59 筆
    ["n12183049886", 2, 3],               // 頂埔（BL 末端）
    ["n3639530951", 2, 4],
    ["n3933530681", 2, 6],
    ["n4990733842", 2, 2],
    …
  ],
  "cols": 12, "rows": 13,                 // 循環把 59 × 59 收成 12 × 13
  "stats": {
    "hvBefore": 39, "hvAfter": 67,        // H/V 段數（74 段裡有 67 段是水平或垂直）
    "segs": 74, "verts": 59,              // **只算非中途站**：176 站→59 個彩色點
    "moved": 65,                          // 移點 pass 一共移了幾次
    "lineMoved": 28, "branchMoved": 10, "gatherMoved": 5,   // 移線／移枝／併格
    "rounds": 3, "roundCap": 200, "converged": true,        // 三輪就沒有可改的了
    "fromCols": 59, "fromRows": 59, "cols": 12, "rows": 13,
    "emptyCols": [], "emptyRows": [], "dense": true,        // 收完沒有空欄空列
    "base": "grid"                        // 這份 cells 的直接輸入（grid／llm-skeleton2grid／
                                          // llm-working2grid／llmshape）
  },

  // ── 逐步表（只有循環結果有；與循環同起點、同產生器 buildStepRows）──
  "steps": [                              // 110 筆
    { "n": 1, "stage": null, "text": "" },
    { "n": 2, "stage": "endp",
      "text": "第 1 輪 · {stage:endp}（小步）：移動 1 點｜(12,9) → (13,10)｜縮減網格 35×34 → 34×33" },
    { "n": 3, "stage": "endp", "text": "第 1 輪 · {stage:endp}（小步）：移動 1 點｜(12,9) → (13,10)" },
    …
  ],

  "startedAt": …, "generatedAt": …,
  "source": { … }, "sourceHash": "ufdwiw.2sq8"   // 一樣自足，與骨架那份同一個雜湊
}
```

同一條鏈的另一個檔（`algorithm-stroke/algorithm-stroke/…json`，`stage: "post"`）＝循環**之前**
的那張圖，欄位一樣但沒有 `steps`，`stats` 是筆畫法自己的（`hvBefore` 0 → `hvAfter` 39、
`strokes` 20、`iters` 10…）。**兩個檔都要**：資料流上是兩個節點、兩張看得到的圖。

**LLM 直線化寫的是同一個檔的 `align` 子物件**（`3-straightening/grid/opus5/opus5/…json`，
讀取一律 `alignOf(doc)`）：

```jsonc
"align": {
  "baseCols": …, "baseRows": …,           // 這一輪起算的格網
  "model": "opus", "executor": "enforced",
  "skill": "llm-straighten",              // 或 llm-straighten-prompt（兩支寫同一份檔）
  "prompt": null, "rounds": 3,
  "startedAt": …, "endedAt": …, "endedAtSource": "last-apply", "elapsedMs": …,
  "usage": { … },                         // in/out/cacheRead/cacheWrite（見 llm-usage-accounting）
  "transcript": [ { "round": 1, "note": "…", "noteZh": "…", "proposed": …, "hv": "39 → 52",
                    "rejected": …, "raw": { … }, "startedAt": …, "elapsedMs": …, "usage": { … } }, … ],
  "hvBefore": …, "hvAfter": …, "segs": …, "moved": …,
  "cellAfter": [ ["n3933501987", 3, 7], … ],
  "generatedAt": …
}
```

整份重寫這個檔時**必須把 `align` 原封帶回**（`bakeStraighteningCells` 的 `writePartial` 有做）。

### 為什麼要原樣、不裁剪

裁剪成「只留畫圖用得到的欄位」看起來省空間，但那份欄位清單一定會過期——程式加了新屬性、
新的顯示需求要用到某個沒帶的欄位，而**漏帶的那一刻不會有任何錯誤訊息**，只是畫面悄悄少了東西。
原樣帶著就永遠不會漏。實測代價：工作地圖平均 107 KB，每份結果檔就多這麼多。

### 為什麼不共用一份城市 geojson

以前畫廊抓一份城市工作地圖餵給所有縮圖，等於拿「這座城**現在**的樣子」去畫「**當時**算出來的
座標」。城市檔重抓過（站序變了、線改了）之後，舊結果就被畫成**座標對、線接錯**——而且完全
看不出來。內嵌之後，每一張圖都用它自己那份檔裡的來源畫。

### 沒有退路

讀取端缺 `source` 一律丟例外（`sourceOf(doc, ctx)`），**不回頭去抓城市 geojson**。
留退路的話「自足」就只是盡量而已：漏帶的檔會靜默退回舊行為，看不出來。

「檔還沒產生」是另一回事——那時根本沒有「那份 json」可談自足，呼叫端照舊走來源圖層。

### 兩個豁免

- **失敗結果**（`failed: true`）：記的是「這一輪沒跑出來」，本來就不畫圖。
- **`index.json`**（版本清單）：它描述的是同夾其他檔，自己不是圖。

## 沒算過就是沒有那張圖

**缺結果檔＝那個圖層沒有圖**，畫面顯示「沒有資料」＋該檔應該落在哪個路徑。
**不可以拿工作地圖現場算一張出來補位。**

骨架特別容易犯這條：它只要工作地圖就算得出來（`buildConnectSkeleton`），所以三個地方
本來都有「沒檔就現算」的退路——`D3Tab` 主視圖、`RawMapsMosaic` 的骨架縮圖、
`mosaicBuilders` 的網格九宮格。結果是**骨架檔被刪光之後畫面照樣有圖**，看起來像算過了。
現在三處都只讀權威檔。

有檔時從檔內 `source` 重建拓撲來畫，那是**渲染**，不是「現算補位」——差別在於
「這份檔存不存在」決定了有沒有圖，而不是「能不能算得出來」。

## 面板只讀這一層自己的檔

面板顯示的每一格——城市標題的線站數、概要（官網／Wikipedia／UrbanRail）、路線清單、方位、
站點類型、指定形狀規定、物件分頁的站序——一律取自**這一層自己的**那份來源：
階段圖層＝結果檔內嵌的 `source`，地圖圖層＝它自己的 geojson。

**唯二例外＝資料流與系統說明**（含 Skills 清單）：那是程式結構，不是地圖資料。
狀態記號（✓／⚠／✗）同理走全站彙總（`status.json`），所以**資訊面板不畫它**。

單一取值口：`StyleInfoTab`／`StyleObjectTab` 的 `ownGeo`、`StylePanel` 的 `ownSys`，
三者都由 `D3Tab` 的 `ownSourceData` 餵。**D3 分頁只認它**，沒有就整段不顯示；
Metro Maps 分頁的圖層本身就是那份 geojson，才准退回 `layerData[layer.id]`。

### 這條被違反時看不出來

畫面照樣是滿的，只是內容來自別處。實際犯過三種：

| 錯法 | 拿到的其實是 |
|---|---|
| `layerData[layer.sourceLayerId]` | 沿來源鏈退回的**上游圖層**（多半是工作地圖） |
| `loadMetroCatalog()` | `index.json` 的 `modes`／`audit`／`wiki`／線站數 |
| `loadSitesIndex()` | `official_sites.json` 的官網 |

第一種最隱蔽：面板拿到的 `layer` 是 panelLayer，本來就會沿來源鏈退回工作地圖，
所以「骨架圖層還沒算過、概要卻是滿的」看起來像正常運作。

**安全網＝`node scripts/checkPanelOwnData.mjs`**（已進 `npm run check`）：面板殼與各分頁
（`StylePanel.vue` ＋ `src/components/style/*.vue`）出現上表三種樣式就擋。

## 匯出＝那份檔本身

圖層匯出（`exportLayerFile`）下載的是**磁碟上那個檔的原文**，檔名也是**原檔名**
（版本化之後檔名本來就固定不帶戳，取的是 `latest` 那一版）。所以下載下來的檔可以直接放回資料庫，
也可以單獨交給別人重現同一張圖。

以前是包一層 `adapt-metro-layer` 信封、裡面塞畫面用的 geojson——那份東西既不是磁碟上
的那個檔，放回原位還會壞掉。geojson 圖層仍匯出畫面內容（使用者可能編輯過）。

反方向＝圖層面板工具列的**匯入檔案**鈕（`FileViewModal`）：選一個 geojson／json
**只打開來看**（左原文、右樹狀，頂端標出「內嵌來源 ✓／✗」與頂層欄位數），
不匯入成圖層、不寫任何檔——拿來逐檔比對格式一致性。

## 讀寫的唯一入口

| 方向 | 入口 | 說明 |
|---|---|---|
| 寫（Node） | `writeVersionedJson(abs, doc)` | 內有 `assertSelfContained` 關口：`doc` 沒有 `source` 就拒寫 |
| 掛來源（Node） | `attachSourceFor(cityId, doc)`／`sourceAttacherFor(cityId)` | 解析工作地圖檔（含舊檔名退路）並原樣掛上 |
| 掛來源（純函式） | `attachSource(doc, geojson)` | 瀏覽器與 Node 共用 |
| 讀來源 | `sourceOf(doc, ctx)` | 缺就丟例外；依 `sourceHash` 做記憶體去重 |
| 讀最新版 | `readVersionedJson`／`assetUrlLatest` | 三段退路：index → 掃版本夾 → 舊的無戳檔 |

記憶體去重是有意義的：同一座城的幾十份結果檔帶的是同一份 geojson，`sourceOf()` 依
`sourceHash` 把它們收斂成**同一個物件實例**，下游（`prepCity`／`buildConnectSkeleton`）
才能用 WeakMap 快取——同城多檔只算一次骨架，而骨架是畫縮圖最貴的一步。

## 版本化

每次生成寫一份**新檔**，放進一個**以生成時間命名的資料夾**：

```
1-raw-maps/skeleton/
├── 260814082034/
│   ├── as-twn-taipei-1-skeleton.json           ← 結果（檔名固定，不帶時間）
│   └── as-twn-taipei-1-raw-maps-working.geojson ← **資料流前一個圖**（骨架的上游＝工作地圖）
└── 260814103458/
    ├── as-twn-taipei-1-skeleton.json
    └── as-twn-taipei-1-raw-maps-working.geojson
```

**清單＝磁碟現況，不另存 index.json**：資訊只准記在它自己生成的那個資料夾裡，外面那份
清單一定會跟磁碟不同步（實例：清單被 Dropbox 收成僅線上檔，版本夾還在，畫面就整個空了）。
瀏覽器端問 dev server 的 `?versions=1`（`vite/serveDataDir.js`），每項回
`{ dir, stamp, files, modifiedAt, size }`——`files` 就是那一夾實際有的檔。
舊的 `index.json`（`{ base, latest, versions[] }`）**讀取端仍認得**，當作靜態站台的退路；
解析時一定要比對 `base`，否則同夾第二支會解析到別人的最新版。

**時間在資料夾名、不在檔名**——同一份圖的檔名到哪一版都一樣，路徑函式給的名字就是
磁碟上的名字，匯出下載也不必再解析尾綴。**「歷史」就是那些時間戳資料夾。**

### LLM 的每一輪＝同一夾裡的 `…-n.json`

九支 LLM 腳本的每一輪都各自呼叫一次 `apply`，所以每一輪都會落一次檔。**一次執行只算一個
版本**：資料夾用**這一次執行的開始時間**命名（`LLM_STARTED_AT`／檔裡自述的 `startedAt`），
夾裡放目前狀態（無尾綴）＋每輪快照 `…-n.json`（n 從 1 起）：

```
3-straightening/grid/opus5/opus5/
└── 260814144600/                                   ← 這一次執行
    ├── as-twn-taipei-3-grid-opus5-opus5.json       ← 目前狀態（讀取端只讀這一支）
    ├── as-twn-taipei-3-grid-opus5-opus5-1.json     ← 第 1 輪
    ├── as-twn-taipei-3-grid-opus5-opus5-2.json     ← 第 2 輪
    ├── as-twn-taipei-3-grid-opus5-opus5-run.json   ← 整趟紀錄（逐輪＋總合）
    └── as-twn-taipei-2-grid.json                   ← 資料流前一個圖
```

**每一輪的快照也要有自己的開始／完成時間**：頂層的 `startedAt`／`generatedAt` 仍是整趟的
（它們要對得上資料夾名，`checkJsonVersions` A 段查的就是「夾名落在 startedAt〜generatedAt
之間」），那一輪自己的記在 `round`／`roundStartedAt`／`roundEndedAt`／`roundElapsedMs`／
`roundTotalTokens`。

**整趟紀錄 `…-run.json`**＝那一夾的執行帳：逐輪一列＋總合一列，欄位就是 LLM 分頁那張表的
六欄——`model`／`totalTokens`／`round`(`rounds`)／`elapsedMs`／`startedAt`／`endedAt`；
另有 `layer`（`dir`／`file`／`version`／`cityId`／`chain`／`model`）說明**這是哪一個圖層、
哪一個資料夾**的紀錄，整份拿出去也認得出出身。**它不是一張圖**，所以不帶 `source`
（`checkSelfContained` 認 `kind: 'llm-run'` 豁免）。逐輪數字取自 `transcript[]`，
**總合不由逐輪相加**（重跑時舊輪次還在檔裡，整趟用量由旁路 journal 重算）；
拿不到一律 `null`，絕不寫 0。顯示＝LLM 分頁的「執行紀錄（逐輪）」。

一輪一個資料夾的話，跑一次三輪在歷史清單上會看成跑了三次。
實作＝`writeVersionedJson(abs, doc, { runStamp, round })`，參數由 `scripts/_llmVersionWrite.mjs`
的 `llmVersionOpts(doc, RUN_STARTED_AT)` 從那份 doc 自己讀出來（純命名規則＝`src/lib/jsonVersions.js`
的 `roundFileName`／`roundOfFileName`）。**凡是「挑出這一夾的上游副本」的地方都要跳過本層自己的附屬檔**（每輪快照＋整趟紀錄，
判準＝`isSidecarName`；歷史清單的 `sourceFileOf`、九宮格的上游磚），
不然會挑到 `-1.json`——它排序還比主檔前面。

**版本資料夾裡另存一份當下的來源地圖**（`sourceFile` 記的原檔名；沒記到就叫
`source.geojson`）。結果 json 本身已經內嵌 `source`、單檔就自足——這份獨立檔是給**人**
用的：一個版本資料夾＝一份完整快照，可以整夾拿走、也可以用「匯入檔案」逐檔打開比對，
不必先把來源從結果檔裡挖出來。

### 哪些圖層有歷史

**有自己的結果檔才有歷史分頁**（`historyRel`；`D3ViewNav` 收到 null 就不畫那個分頁）：

| 圖層 | 有歷史？ | 為什麼 |
|---|---|---|
| 工作地圖／原始地圖 | ✗ | geojson **不版本化**（覆蓋更新，歷史在 git） |
| 骨架地圖／網格化／直線化各鏈 | ✓ | 各自有版本化的結果檔 |
| **4 版面地圖的 Frame 路網** | ✗ | 接 3 STRAIGHTENING 的結果**現畫**，本來就不落檔 |
| 4 版面地圖的 LLM 評價／互動／比較 | ✓ | 那三支會落檔 |

⚠ Frame 那一條容易做錯：`filePath` 為了 footer 與匯出會指到**該鏈的循環結果檔**，
拿它當歷史就變成顯示上游那一層的版本。

### 歷史分頁長什麼樣

D3 左欄的「歷史」＝**一版一個可收合群組**，群組名是生成時間，裡面就是那個資料夾
**實際有的兩個檔**，名稱一律用**圖層名**（與左側視圖列同一套）：

```
▼ 260814 103458  [目前]
     工作地圖              ← 來源地圖：點了用「匯入檔案」那個檢視 modal 純看
     骨架地圖              ← 這一版算出的圖：點了唯讀預覽
▶ 260814 082034
     工作地圖
     骨架地圖
```

（有格網的那幾層底標一律帶 `n × n`，例如台北的網格地圖是 `59 × 59`；骨架地圖寫的是
網格化**前**的排名格線數，與網格化後可能差一點——見 [[route-view-sync]]。）

預覽期間 `persistStraighteningCells` 直接 return——**唯讀，不寫回任何檔**。

- 舊格式（同層帶戳檔 `…-YYMMDDHHMMSS.json`）**讀取端仍認得**；寫入時遇到無戳舊檔會依它
  自述的 `generatedAt` 收進對應日期的版本夾（取不到才退回檔案 mtime）。
- **`generatedAt` ＝這一份版本檔自己的產生時間**，不可沿用舊檔的值。
- **一份 json 只有兩個時間**：`startedAt`（開始算）與 `generatedAt`（算完落檔）。
  **沒有 `modifiedAt`**——json 寫出去就是定稿，再算一次是**另一個版本資料夾**，不是改這一份。
  唯一的關口＝`writeVersionedJson` 的 `finalizeTimes()`：它會把 `modifiedAt`（含 `align` 裡的）
  一律拿掉，並在只記了 `elapsedMs` 時回推 `startedAt`。讀取端遇到舊檔還帶著 `modifiedAt`
  時只把它當完成時間的退路。會被修改的是工作地圖那份 geojson（見 [[data-file-geojson]]），
  它的更新時間走檔案 mtime，不記在內容裡。
  資訊 tab 的概要照這個分法列：json ＝「檔案生成時間」（`startedAt`）＋「檔案完成時間」
  （`generatedAt`），**工作地圖多一列「檔案修改時間」**。
- **計算永遠不刪檔**：`reset`（`clearVersionPointer`）只回報現況，歷史一份都不刪。
- **唯一的刪除是使用者手動按**：歷史分頁每個時間群組右邊有刪除鈕（與收合箭頭同尺寸的裸 icon）、
  清單上方有「全部展開／全部收合／全部刪除」。刪的是整個**版本資料夾**（連夾裡的上游副本），
  按下去要先過確認框（`askConfirm`，danger）。端點＝`POST /delete-version`
  （`vite/deleteVersionDir.js`，**只在 vite dev**；只收 12 位數字的夾名、路徑必須落在
  adapt-metro-data/ 底下、刪的是版本夾而不是圖層夾）。

## 安全網

`node scripts/checkSelfContained.mjs`（已進 `npm run check`）兩段：

- **A 磁碟**：階段夾底下每一份結果 json 都要帶 `source`（或為失敗結果）。
- **B 寫入端**：凡把結果 json 落到磁碟的地方都要經 `writeVersionedJson`。直接
  `writeFileSync(abs, …)` 卻沒有 `writeVersionedJson` 的檔會被報出來——要嘛改走關口，
  要嘛列進該支的 `ALLOW` 並寫明理由（現有一條＝`_llmFailResult.mjs` 的失敗 stub）。

⚠ **通過不等於對齊**：A 段只驗「有沒有 `source`」，不驗那份來源**對不對**（是不是這座城的、
是不是算這張圖時用的那一份）。那要靠寫入端一律經 `attachSourceFor(cityId, …)` 來保證。

另外兩支相關的：`checkDataRoot.mjs`（Node 端落磁碟一律 `dataAbs()`，別落回 repo 內的
`data/`）與 `checkPanelOwnData.mjs`（面板只讀本層的檔），都已進 `npm run check`。
