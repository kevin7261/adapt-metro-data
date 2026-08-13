---
description: 檔案內容怎麼存——geojson 存「這座城市是什麼」（站、線、顏色、經緯度，可覆蓋），json 存「這一張圖長什麼樣」（格座標／繪圖幾何，版本化永不刪）；核心鐵律是**每一份 json 都自足**：檔內原樣內嵌來源 geojson（`source` 欄位），匯出後單獨匯入顯示不變、不受其他檔變化影響，讀取端缺它一律報錯而非回頭抓城市檔。
layer: working
---

# 檔案內容存放方式（data-file-layout）

本文件是**檔案內容配置**的規格權威（系統說明，**不是** skill）。實作必須與它相符。

實作＝`src/lib/embeddedSource.js`（自足封包純函式）＋`scripts/_embedSource.mjs`（Node 端掛載）
＋`scripts/_jsonVersions.mjs`（版本化寫檔＋自足關口）＋`src/lib/metroNetworkLayout.js`（路徑）。
安全網＝`node scripts/checkSelfContained.mjs`（已進 `npm run check`）。

## 兩類檔案，兩種語意

| | `.geojson` | `.json` |
|---|---|---|
| 存什麼 | **這座城市是什麼**——站點、路線、顏色、站名、經緯度 | **這一張圖長什麼樣**——格座標／繪圖幾何 |
| 誰產生 | OSM 抓取與 build（`buildGeojson` 等） | 演算法管線（骨架化／網格化／直線化／各 LLM 鏈） |
| 更新方式 | **覆蓋**（重抓就換掉） | **版本化，永不刪**（每次寫新的 `-YYMMDDHHMMSS.json`） |
| 位置 | `1-raw-maps/{working,source,tracks,center}/` | `1-raw-maps/skeleton/`、`2-gridding/`、`3-straightening/`、`4-frame-maps/` |

## geojson 存什麼

`maps/{group}/{city}/1-raw-maps/working/{city}-1-working.geojson` 是**唯一的原始資料源**：

- `features` 的 `Point`＝車站（`station_id`、站名、`pass`、`is_control`、地標折點旗標…）
- `features` 的 `LineString`／`MultiLineString`＝路線幾何（`route_colors`、`routes[]`、`route_ref`）
- `features` 的 `Polygon`＝地標面域（皇居／中央公園；地理視圖的填色原圖）
- `metro_system`＝系統層中介資料，含 `prescribed_shape`（指定形狀規定的**權威**）

同層另有三份：`source/`＝唯讀備份（與 working 必須一模一樣）、`tracks/`＝實際路線、
`center/`＝路線中線。三者的 `route_ref` 集合必須一致（鐵律，見 [[metro-tracks-sync]]）。

## json 存什麼

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
原樣帶著就永遠不會漏。實測代價：工作地圖平均 107 KB，全庫 2,562 份結果檔約增加 0.3 GB。

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

## 讀寫的唯一入口

| 方向 | 入口 | 說明 |
|---|---|---|
| 寫（Node） | `writeVersionedJson(abs, doc)` | 內有 `assertSelfContained` 關口：`doc` 沒有 `source` 就拒寫 |
| 掛來源（Node） | `attachSourceFor(cityId, doc)`／`sourceAttacherFor(cityId)` | 解析工作地圖檔（含舊檔名退路）並原樣掛上 |
| 掛來源（純函式） | `attachSource(doc, geojson)` | 瀏覽器與 Node 共用 |
| 讀來源 | `sourceOf(doc, ctx)` | 缺就丟例外；依 `sourceHash` 做記憶體去重 |
| 讀最新版 | `readVersionedJson`／`assetUrlLatest` | 三段退路：index → 掃資料夾 → 舊的無戳檔 |

記憶體去重是有意義的：同一座城的幾十份結果檔帶的是同一份 geojson，`sourceOf()` 依
`sourceHash` 把它們收斂成**同一個物件實例**，下游（`prepCity`／`buildConnectSkeleton`）
才能用 WeakMap 快取——同城多檔只算一次骨架，而骨架是畫縮圖最貴的一步。

## 版本化

- 每次生成寫一份**新檔**，檔名尾綴 `-YYMMDDHHMMSS`；同夾一份 `index.json` 當清單。
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
