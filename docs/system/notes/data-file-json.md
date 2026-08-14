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
| 4 FRAME MAPS | `4-frame-maps/llm-{eval,grid,compare}/` | 評價／權重／比較報告（Frame 路網本身不落檔，現畫） |

`3-straightening` 的 `cellAfter` **只有整數格座標**——沒有站名、沒有拓撲、沒有顏色。
LLM 直線化的結果另放在鏈檔的 `align` 子物件（讀取一律 `alignOf(doc)`）。

## 鐵律：每一份 json 都自足

**每一份 json 都要能單獨匯出、單獨匯入，而顯示完全不變，且不受任何其他檔變化的影響。**

所以每一份落檔的 json 都在 `source` 欄位裡**原樣**帶著它畫圖要用的工作地圖 geojson：

```jsonc
{
  "id": "as-twn-taipei", "chain": "algorithm-lsq", "stage": "loop",
  "cellAfter": [["n1", 3, 7], ["n2", 3, 9], …],   // 這張圖的座標
  "stats": { … }, "cols": 12, "rows": 12,
  "generatedAt": 1786498238191,
  "source": {                                      // ← 畫得出來所需的全部來源
    "type": "FeatureCollection",
    "metro_system": { … },
    "features": [ …站點 Point ＋ 路線 LineString… ]
  },
  "sourceHash": "1k2j9f.3m1"                       // 去重與稽核用
}
```

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
├── index.json                              ← 版本清單
├── 260814082034/
│   └── as-twn-taipei-1-skeleton.json       ← 檔名固定，不帶時間
└── 260814090512/
    └── as-twn-taipei-1-skeleton.json
```

**時間在資料夾名、不在檔名**——同一份圖的檔名到哪一版都一樣，路徑函式給的名字就是
磁碟上的名字，匯出下載也不必再解析尾綴。**「歷史」就是那些時間戳資料夾。**

- `index.json` 的 `latest` 與 `versions[].dir` 記的都是**版本夾名**。
- 舊格式（同層帶戳檔 `…-YYMMDDHHMMSS.json`）**讀取端仍認得**；寫入時遇到無戳舊檔會依它
  自述的 `generatedAt` 收進對應日期的版本夾（取不到才退回檔案 mtime）。
- **`generatedAt` ＝這一份版本檔自己的產生時間**，不可沿用舊檔的值。
- 內容與最新那一版完全相同就不寫（`unchanged`）——`source` 也算進比較，所以
  **來源換了就是新的一版**，這是對的：那張圖的來源真的變了。
- 重跑不刪檔：`reset` 只把 `index.latest` 設成 `null`，歷史一份都不刪。

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
