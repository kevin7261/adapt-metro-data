# data/metro — 地鐵資料字典

本資料夾是全系統的**資料權威**：**599 個地鐵／輕軌系統**（依 `index.json`，規模數字以該檔為準）。
**整棵 `data/` 不進版控、也不進 Dropbox**（`.gitignore` 與
`scripts/dropboxIgnoreNodeModules.mjs` 兩邊都是整棵排除，沒有例外）——
所以本資料夾**只剩本機這一份**，備份責任在你。
`_cache/` 是刻意保存的可重現輸入快照（OSM 天天在變，重抓就對不回論文數字），
`_overrides/` 與 `maps/**/1-raw-maps/` 的 `prescribed_shape` 是純人工資產，不可再生。

> 2026-07-31 改版重點：①根夾 `networks/` 改名 **`maps/`**、與官方圖索引合併為單一城市樹；
> ②命名鐵律「**代碼＝tag＝資料夾＝檔名**」全面落地（唯一對照表
> `src/lib/layerRegistry.js`）；③step 資料夾帶序號（`1-raw-maps`〜`4-frame-maps`）；
> ④「OSM 地圖」改稱「**原始地圖／Source Map**」（layer 代碼 `source`）；
> ⑤`operator` 與 `wikidata` 欄位全面移除。
> `data/railway`／`data/highway` **尚未跟進**，仍沿用舊 schema 與舊目錄結構。

---

## 目錄

1. [頂層目錄總覽](#頂層目錄總覽)
2. [城市資料樹與檔名文法](#城市資料樹與檔名文法)
3. [step × layer 完整對照](#step--layer-完整對照)
4. [產生腳本對照](#產生腳本對照)
5. [每城 GeoJSON schema](#每城-geojson-schema)
6. [index.json](#indexjson)
7. [佈局結果檔（3-straighteninging）](#佈局結果檔3-straighteninging)
8. [LLM 結果檔](#llm-結果檔)
9. [status.json 視圖公開代碼](#statusjson-視圖公開代碼)
10. [對映模組（三支）](#對映模組三支)
11. [其餘頂層檔案](#其餘頂層檔案)

---

## 頂層目錄總覽

```
data/metro/
├── index.json            # 599 系統清單＋統計＋audit 摘要（規模數字的單一來源）
├── city_coords.json      # 城市座標（世界地圖記號用）
├── official_sites.json   # 官方網站索引（metro:sites 產出）
├── maps/                 # ★ 城市資料樹（原 networks/；2026-07-31 改名）
│   ├── maps_index.json   #   官方／UrbanRail 路網圖授權索引
│   └── {groupId}/        #   一群組一夾（約 563 夾）
│       └── {cityId}/     #   群組內含本體＋變體城市夾（各自完整四 step）
├── metro-landmarks/      # 地標原料（scripts/fetchLandmarks.mjs 產出；非 step、無序號）
├── _overrides/           # 人工裁決（分桶／剔站／補名…；重抓自動套用）
└── _cache/               # OSM Overpass／Wikipedia 快照＋工作記錄（不進版控，只在本機）
```

- **舊扁平夾已全部併入 `maps/` 城市樹**：`metro-maps/`、`metro-maps-original/`、
  `metro-tracks/`、`metro-tracks-center/`、`map-adjust/`、`map-adjust-llm-skeleton-grid|llm-working2grid/`、
  `straighten-cells/`、`straighten/`、`straighten-llm-straighten-align|loop|rect/`、`frame-maps/`、
  `frame-llm-eval|grid|compare/` 都不再存在。舊路徑（含 networks v1 的
  `raw`／`adjust`／`frame`）由 `src/lib/metroDataPaths.js` 的 `rewriteLegacyMetroPath`
  與 `src/lib/metroNetworkLayout.js` 的 `projectPathToNetwork`／`legacyNetworksRelToCurrent`
  改寫；遷移腳本＝`scripts/migrateNetworksV2.mjs`、改名腳本＝`scripts/renameMetroDirs.mjs`。
- `status.json` **不落地在此夾**——dev 由 `vite/metroStatus.js` 動態計算並以
  `/data/metro/status.json` 服務；`build:pages` 時寫進 `dist/data/metro/status.json`。

---

## 城市資料樹與檔名文法

### 路徑文法

```
data/metro/maps/{groupId}/{cityId}/{step}/{layer}/[{sublayer}/]{cityId}-{step}-{layer}[-{sublayer}][-{extras…}].{ext}
```

實例：

```
data/metro/maps/as-twn-taipei/as-twn-taipei/1-raw-maps/working/as-twn-taipei-1-raw-maps-working.geojson
data/metro/maps/as-twn-taipei/as-twn-taipei/1-raw-maps/skeleton/as-twn-taipei-1-raw-maps-skeleton.json
data/metro/maps/as-twn-taipei/as-twn-taipei/2-gridding/grid/as-twn-taipei-2-gridding-grid.json
data/metro/maps/as-twn-taipei/as-twn-taipei/2-gridding/llm-skeleton2grid/haiku45/as-twn-taipei-2-gridding-llm-skeleton2grid-haiku45.json
data/metro/maps/as-twn-taipei/as-twn-taipei/3-straightening/grid/algorithm-stroke/algorithm-stroke/as-twn-taipei-3-straightening-grid-algorithm-stroke-algorithm-stroke.json
data/metro/maps/as-twn-taipei/as-twn-taipei/3-straightening/grid/algorithm-stroke/network-loop/as-twn-taipei-3-straightening-grid-algorithm-stroke-network-loop.json
```

> **全 599 個城市均有衍生資料**（骨架／網格／直線化全量保留，2026-08-07 起全球保留）。
> 本文件其他地方出現 `as-jpn-tokyo/…/4-frame-maps/…` 這類路徑，是在講**路徑文法**。
> 詳見 [`../../CLAUDE.md`](../../CLAUDE.md)。

`3-straightening` 是**三層容器**（`{來源}/[{模型}/]{鏈}/{子夾}/`），所以檔名會出現鏈名重複兩次
——前一個是鏈容器、後一個是「該鏈自己的結果」子夾；另兩個子夾是 `network-loop/`
與 `llm-network-loop/`。`llm-shape`（鏈的**輸入**）與 `llm-working2straight` 不是容器，維持單層。

規則（實作＝`metroNetworkLayout.js` 的 `networkLayerFileName`／`metroNetworkPath`）：

- **檔名前綴一定是 `{cityId}-{step}-{layer}`**——與所在資料夾逐字相同（命名鐵律）。
- `sublayer`：目前只有兩用途——LLM 模型子夾（`opus5`／`fable5`／`sonnet5`／`haiku45`（claude CLI）＋`gpt56sol`／`codex53`／`gemini31`／`grok45`／`composer25`／`kimik3`／`glm52`（cursor-agent CLI）＋`deepseekv4pro`／`deepseekv4flash`（dsc），共 **13 個**；單一真相＝`src/lib/llmModels.js` 的 `LLM_MODEL_REGISTRY`，兩張消融表 `llmSkeleton2GridModels.js`／`llmWorking2GridModels.js` 由它推導）
  與非 `orig` 變體（旋轉移除後暫無）。
- `extras`：附加 token，例：消融鏈名（`…-llm-skeleton2grid-haiku45-llm-straighten-align.json`）、
  Frame LLM 的 `{variant}-{chain}`（`…-llm-eval-orig-stroke.json`）、指定對齊的 `prompt`。
- 副檔名：geojson（路網）／json（佈局、結果）／png（官方、UrbanRail 圖）。
- **每個 layer 資料夾只放該圖層會顯示的檔**；資料夾在首次寫檔時才建立
  （所以尚未跑過的鏈／畫廊夾可能不存在）。

### 城市 id 與群組

- `cityId`＝`<洲2碼>-<國3碼>-<城>`（例 `as-twn-taipei`、`eu-ger-berlin`、
  `na-usa-new-york-city`；美洲拆 `na`／`sa`）。
- **群組夾 `{groupId}`**＝去掉變體後綴的本體 id。同群組內的變體各是**獨立城市夾**，
  各自擁有完整四 step。例 `as-twn-taipei/` 群組：

  | 城市夾 | 內容 |
  |---|---|
  | `as-twn-taipei/` | 台北本體 |
  | `as-twn-taipei-ty/` | ＋桃園變體 |
  | `as-twn-taipei-lm/`、`-ty-lm/` | ＋地標變體（地標併入工作地圖） |
  | `as-twn-taipei-rail/` | ＋鐵路 combined 變體 |

- **矩形變體＝獨立城市夾 `<cityId>-shape-rect`**（規定表 10 城才有，例
  `as-twn-kaohsiung-shape-rect/`、`as-jpn-tokyo-shape-rect/`），矩形結果在其 `3-straightening/{來源}/llm-shape/`。
  規定表 10 城都不是台北，所以**磁碟上目前沒有任何 `-shape-rect` 城市夾的衍生資料**（只剩 `1-raw-maps/`）；
  要看矩形結果得先重跑該城的管線。**而且矩形城市沒有「非 LLM 的 3-straightening」**——
  `bakeStraighteningCells --shape` 只收 `shapeOk === true`（舊名鏡像 `square === true`）的 LLM 指定形狀結果檔，缺它就是 0 件，
  九條演算法鏈一條都排不進來（2026-08-03 拿 `as-twn-kaohsiung-shape-rect` 實測確認）。
- **消融（LLM 骨架地圖網格化／工作地圖網格化）不另開城市夾**——掛在本體城市夾的
  `2-gridding/llm-skeleton2grid|llm-working2grid/<model>/` 與 `3-straightening/llm-skeleton2grid|llm-working2grid/<model>/`
  （檔名以 extras 帶鏈名）。
- 後綴解析（`-shape-rect`／`-cell-<model>`／`-map-<model>`／群組變體）＝
  `metroNetworkLayout.js` 的 `resolveNetworkCity`／`networkCityGroupId`，**不要手拼**。

---

## step × layer 完整對照

step 代碼＝資料夾名（帶序號）；layer 代碼＝資料夾＝檔名 token。
唯一對照表＝`src/lib/layerRegistry.js`（`STEP_CODES`／`LAYER_CODES`／`LAYER_SKILLS`），
UI 顯示在「資料流」分頁右欄「Layers / Skills」。

### `1-raw-maps`（顯示名 **1 RAW MAPS**）

| layer | 顯示名 | 內容 | ext |
|---|---|---|---|
| `working` | 工作地圖 | 可編輯工作檔（geojson；`index.json` 的 `file` 指這份） | geojson |
| `source` | 原始地圖／Source Map | 唯讀備份（原稱 OSM 地圖）；抓取／build 時必須與 `working` **寫成一模一樣**；工具列「回復」＝ source→working 覆寫；不掛 skill | geojson |
| `tracks` | 實際路線 | OSM 軌道幾何 | geojson |
| `center` | 路線中線 | 由 tracks 聚合的中線 | geojson |
| `official-route` | 官方路線圖 | 營運商官方發行的示意圖全圖（png；授權見 `maps/maps_index.json`，釘選見 `_overrides` 的 map_overrides） | png |
| `urbanrail` | UrbanRail 地圖 | **只准** urbanrail.net 該城頁圖（鐵律；禁 Commons／營運商圖充數） | png |
| `skeleton` | 骨架地圖 | 骨架化預算檔（`views.skeleton`）。**2026-08-04 由 `2-gridding` 移入**——骨架化只做拓撲收縮，不動格網、不換座標系，與工作地圖同一階 | json |

> 鐵律：同一系統 `working`／`tracks`／`center` 的 `route_ref` 集合必須一致
> （改線集合後 `metro:synctracks`＋`metro:verifytracks`）。
> 實際路線／中線是本 step 的 layer——舊獨立 step `metro-tracks` 已併入。

### `2-gridding`（顯示名 **2 GRIDDING**）

| layer | 顯示名 | 內容 |
|---|---|---|
| `grid` | 網格地圖 | 網格化預算檔（`views['grid-orig-pre'|'grid-orig-post']`＝網格化前／後）；輸入＝`1-raw-maps/skeleton` |
| `llm-skeleton2grid/<model>/` | LLM 骨架地圖網格化 | 公開代碼 `llm-skeleton2grid`；模型子夾 13 個（`opus5`…`deepseekv4flash`）；介面為統一一層、層內切模型 |
| `llm-working2grid/<model>/` | LLM 工作地圖網格化 | 公開代碼 `llm-working2grid`；同上 13 個模型子夾 |

skeleton（在 `1-raw-maps`）／grid 檔另含畫廊中繼（`id`／`city`／`cityZh`／`line_count`／`station_count`／
`tilt`／`W`／`H`／`_fp` 增量指紋／`stage`）——兩者同由 `buildViews.mjs` 產生。

### `3-straightening`（顯示名 **3 STRAIGHTENING**）

| layer | 顯示名 | 內容 |
|---|---|---|
| `algorithm-stroke` | ①筆畫法 | 鏈容器；該鏈自己的結果在 `algorithm-stroke/algorithm-stroke/` |
| `algorithm-ortho` | ②直角爬山 | 〃 |
| `algorithm-milp` | ③MILP規劃 | 〃 |
| `algorithm-force` | ④力導向 | 〃 |
| `algorithm-lsq` | ⑤最小平方 | 〃 |
| `algorithm-octi` | ⑥八向格網 | 〃 |
| `algorithm-path` | ⑦路徑簡化 | 〃 |
| `algorithm-sat` | ⑧SAT規劃 | 〃 |
| `algorithm-flex` | ⑨彈性格網 | 〃 |
| `llm-straighten` | LLM 直線化 | 鏈容器；自動／指定對齊結果放在 `llm-straighten/llm-straighten/` 該檔的 **`align` 子物件**（讀取一律 `alignOf()`） |
| `{鏈}/network-loop` | 程式網絡循環 | 每條鏈容器底下一個（移點-移線-移枝-併格的收斂結果） |
| `{鏈}/llm-network-loop` | LLM 網絡循環 | 每條鏈容器底下一個（有跑才有檔；另餵 Frame `llm-network-loop`） |
| `llm-working2straight` | LLM 工作地圖直線化 | **自己的來源層**（子夾＝模型），不與 `llm-network-loop` 共用；Frame `llm-working2straight` |
| `{來源}/llm-shape` | LLM 指定形狀 | 只在 `<cityId>-shape-rect`／`-shape-diag` 等形狀城市夾；是鏈的**輸入**不是鏈結果，所以不是容器 |
| ~~`hc`／`llm`／`llm-straighten-align`／`gallery`~~ | — | **已退役**：`hc` 基底快照磁碟 0 個（base 照資料流現算）；`llm`／`llm-straighten-align` 改名 `llm-straighten`；`gallery` sidecar 寫入已停，縮圖 `liveGalleryDocs` 現畫 |
| `llm-skeleton2grid/<model>/`、`llm-working2grid/<model>/` | 消融泳道 | 該來源整條鏈檔（`…-llm-skeleton2grid-<model>-hc.json`／`-llm.json`／`-llm-straighten-align.json`…） |

movewise 步驟（`endpoint`／`linecompact`／`gridmerge`／`loop`）是**節點代碼**（role: step），
不各自成資料夾——循環結果存於各鏈檔的 `loop` 欄。

### `4-frame-maps`（顯示名 **4 FRAME MAPS**）

| layer | 顯示名 | 內容 |
|---|---|---|
| `gallery` | 畫廊縮圖 | （退役）sidecar；縮圖現畫 |
| `llm-eval` | LLM 評價 | 評價＋建議 moves（檔名帶 `{variant}-{chain}`） |
| `llm-grid` | LLM 互動 | 欄列顯示權重 |
| `llm-compare` | LLM 比較 | 全結果唯讀比較 |
| `llm-skeleton2grid/<model>/`、`llm-working2grid/<model>/` | 消融泳道 | 消融來源的 Frame 結果 |

### 非 step 資料

| 位置 | 內容 |
|---|---|
| `data/metro/metro-landmarks/<id>.geojson` | 地標原料（河流骨架線、皇居／中央公園面域）；與路網完全分離，`-lm` 變體 build 時併入該變體城市夾 |

---

## 產生腳本對照

| 產物 | 腳本（`scripts/`） | npm script |
|---|---|---|
| Wikipedia 系統清單 | `fetchWikiList.mjs`（`_cache/`） | `metro:wiki` |
| OSM 原始資料 | `fetchMetro.mjs`＋例外腳本（`fetchUcExceptions.mjs`、`fetchSbahnDe.mjs`…；Overpass → `_cache/`） | `metro:fetch` |
| 洲／國／城反查 | `geocodeSystems.mjs`（Nominatim） | `metro:geocode` |
| `1-raw-maps/working`＋`index.json`＋變體 | **`buildGeojson.mjs`**＋變體腳本（`buildSingaporeVariants.mjs`／`buildSanFranciscoVariants.mjs`／`buildTaipeiVariants.mjs`／`buildJrCombined.mjs`／`buildLandmarkCombined.mjs`／`buildCombinedSystems.mjs`／`buildShapeSystems.mjs`） | `metro:build`／`metro:buildonly` |
| `1-raw-maps/source`（雙檔備份） | `initMetroOriginals.mjs --force`（`metro:build` 內） | — |
| `1-raw-maps/{tracks,center}` | `fetchMetroTracks.mjs` → `buildMetroTrackGeojson.mjs` → `buildMetroTrackCenterline.mjs` | `metro:synctracks`（`metro:build` 已串）；驗證＝`verifyMetroTracks.mjs`（`metro:verifytracks`） |
| `1-raw-maps/skeleton`＋`2-gridding/grid`（畫廊預算） | **`buildViews.mjs`**（`_fp` 增量；改演算法須 bump `VIEWS_VERSION`） | `metro:views` |
| `3-straightening/` 逐鏈結果檔 | **`bakeStraighteningCells.mjs`**（`--shape`＝含指定形狀；缺結果時 `vite/metroRecompute.js` 的 `runLlmShapeFor` 可代跑 LLM 指定形狀） | `metro:straighteningcells`／`metro:straighteningcells:shape` |
| `gallery/` sidecar | `scripts/archive/_gallerySidecar.mjs`（**寫入已停**；縮圖＝`liveGalleryDocs`） | — |
| LLM 各鏈結果 | `llmStraighten.mjs`／`llmShape.mjs`／`llmSkeleton2Grid.mjs`／`llmWorking2Grid.mjs`／`llmGrid.mjs`／`llmEval.mjs`／`llmCompare.mjs`／`llmNetworkLoop.mjs`／`llmWorking2Straight.mjs`；**CLI 批次一律走 `llmChainBatch.mjs`**（`LLM_ENFORCED_MODEL` 保證模型標註，見 `_llmProvenance.mjs`）；網頁面板走 `vite/claudeSkillTrigger.js` | `metro:llmstraightenalign` 等 |
| audit（寫回 `metro_system.audit`） | `auditLoop.mjs`（逐城 audit⇄修補）／`verifyMetro.mjs`（Wikipedia／urbanrail 全量報告）／`wikiLineCheck.mjs` | `metro:audit`／`metro:verify` |
| `official_sites.json` | `fetchOfficialSites.mjs` | `metro:sites` |
| 官方／UrbanRail 圖＋`maps_index.json` | `downloadMaps.mjs`（需先有 `index.json`；不在 `metro:all` 內） | — |
| `metro-landmarks/` | `fetchLandmarks.mjs`／`buildLandmarkCombined.mjs` | `metro:landmarks` |

`metro:all`＝wiki → fetch → 例外腳本 → geocode → build（含 source 雙檔＋tracks＋views）→ audit。
重抓＝先刪 `_cache/` 對應快取；快取在就跳過抓取，可安全中斷續跑。

---

## 每城 GeoJSON schema

`working`／`source` 皆為 `FeatureCollection`＋頂層 **`metro_system`**；
features 只有兩種：**Point（車站）**與 **MultiLineString（路段）**。

### 幾何三鐵律

1. 線永遠壓在站點上；
2. 重疊路段只畫一條、且每段必連續；
3. 快車不另成線——跳站以站內 `pass` 標記。

**共站＝可轉乘**：OSM `stop_area` ∪ 同名 ≤800 m ∪ `_overrides`（非「同名就共站」；
紐約等城另有 STRICT 例外，見 `metro-city-newyork`）。

### `metro_system`（頂層系統中繼）

| 欄位 | 型別 | 說明 |
|---|---|---|
| `continent` | string | 洲（`asia`…） |
| `country` | string | 國名（英文） |
| `city` | string | 城市名（英文） |
| `osm_networks` | string[] | 收進來的 OSM `network` 名集合 |
| `official_website` | string\|null | 官方網站 |
| `official_map` | string\|null | 官方路線圖來源頁 |
| `wikipedia` | string\|null | `lang:條目` 形式 |
| `line_count` | number | 線數 |
| `segment_count` | number | 路段 feature 數 |
| `station_count` | number | 站數 |
| `modes` | string[] | `metro`／`tram`／`light_rail`… |
| `audit` | object\|null | `metro:audit` 寫回的檢查結果（`passed`／`checks[]`／`strategies_tried`） |

> **`operator` 與 `wikidata` 已於 2026-07-31 全面移除**——車站／路段 feature properties、
> `metro_system`、`index.json` entries 一律不再有這兩欄；
> `wikipedia`、`official_website`、`official_map` 保留。

### 路段 feature（MultiLineString）properties

| 欄位 | 說明 |
|---|---|
| `seg_id` | 路段 id（`taipei-0`…） |
| `routes[]` | 行經此路段的路線陣列，每條： |
| ・`route_id` | 內部路線 id（`rm…`） |
| ・`route_name`／`route_name_local`／`route_name_en` | 路線名（顯示／在地／英文） |
| ・`route_ref` | 路線代碼（`BL`…；與 tracks／center 搭配的鍵） |
| ・`route_color` | 官方線色 `#rrggbb` |
| ・`network`／`network_local` | 所屬系統名 |
| ・`wikipedia` | 路線條目 |
| ・`osm_route_ids` | 來源 OSM relation id |
| ・`status` | 營運狀態（null＝營運中） |
| ・`order_suspect`／`span_suspect` | audit 疑點旗標 |
| ・`stations[]` | 有序停站 `{station_id, station_name, code}`（快車跳站在站側標 `pass`） |

### 車站 feature（Point）properties

| 欄位 | 說明 |
|---|---|
| `station_id` | 站 id（`n<osm節點>` 或合成 `m…`） |
| `station_name`／`station_name_local`／`station_name_en` | 站名（顯示／在地／英文；日本城市顯示 `name:ja`） |
| `network`／`network_local` | 所屬系統 |
| `city`／`country` | 城／國 |
| `lines` | 行經路線 `route_ref` 陣列 |
| `routes[]` | `{ref, name, route_color}` |
| `wikipedia` | 站條目（可 null） |
| `codes` | 站碼（可 null） |
| `is_terminus`／`is_interchange` | 端點／轉乘 |
| `station_role` | `normal`／`terminus`／… |
| `station_degree` | 拓撲 degree |
| `pass_count` | 被行經次數（快車 pass 計入） |
| `merged_from`／`merged_names` | 共站合併來源（可 null） |

---

## index.json

全站系統清單與規模數字的單一來源（`buildGeojson.mjs` 產出）。頂層：

| 欄位 | 說明 |
|---|---|
| `generated_from` | 產生來源說明 |
| `baseline` | 站數基準（Wikipedia: List of metro systems） |
| `system_count` | **600**（含 13 指定形狀系統） |
| `wikipedia_system_count` | Wikipedia 清單對照數 |
| `line_total`／`station_total` | 5,898／37,313 |
| `systems[]` | 逐系統 entry |
| `wikipedia_cities_without_match` | 清單上未匹配的城市 |

`systems[]` entry＝`file`（**相對 data/metro 的城市樹路徑**，例
`maps/as-twn-taipei/as-twn-taipei/1-raw-maps/working/as-twn-taipei-1-raw-maps-working.geojson`）
＋`continent`／`country`／`city`／`osm_networks`／`official_website`／`official_map`／
`wikipedia`／`line_count`／`segment_count`／`station_count`／`modes`／`audit`
（同 `metro_system`，無 `operator`／`wikidata`）。

---

## 佈局結果檔（3-straighteninging）

**佈局權威**（不是 localStorage）。一圖層一檔，由 `bakeStraighteningCells.mjs` 烘出、
UI「計算接續地圖／重新計算」觸發重算。頂層欄位（`src/lib/straighteningCells.js`，
目前 `algo: "hccells-v13"`）：

| 欄位 | 說明 |
|---|---|
| `algo` | 結果檔版本（`hccells-v13`；不合白名單即重烘） |
| `fingerprint` | 對應輸入指紋（**只作資訊顯示，不拒載**——見下） |
| `cityId`／`variant`／`chain` | 城市／變體（目前只 `orig`）／鏈 key |
| `rectlike` | 矩形泳道旗標 |
| `post` | 直線化後佈局（cells） |
| `endp`／`line`／`branch`／`gather` | 移點／移線／移枝／併格各階段 |
| `loop` | 循環收斂結果（✓ 記號與 Frame 底圖以此判定） |
| `generatedAt`／`modifiedAt` | 產生／修改時間（資訊 tab 以台北時間 `YYMMDD HHMMSS` 顯示；缺值 `000000 000000`） |

**有檔就開；重跑先刪再寫（2026-08-01）**：`3-straightening/`／`llm-straighten-align`／`llm-shape`／
Frame LLM 等衍生 JSON 不再用 fingerprint 拒載（資訊 tab 顯示「與目前資料相符／可能過期」）。
新一次 LLM 求解＝`reset`／`resetOut` **直接刪檔**（已廢 `{_fresh}` stub）；UI 刪檔入口已移除（端點仍 no-op）。

變體模型：`variant = <dir> + <source 後綴> + 可選 -shape-rect`。**UI 變體**＝`orig`／`orig-llm-skeleton2grid`／`orig-llm-working2grid`（＋各自 `-shape-rect`）共 6 個；
**檔案變體**永遠帶模型（`orig-llm-skeleton2grid-opus5`／`orig-llm-working2grid-glm52`／`orig-llm-skeleton2grid-haiku45-shape-rect`…；現役 **27** 來源 ×±shape ≈ **54** 變體）。旋轉（`rot`）已自 `STRAIGHTENING_DIRECTIONS` 移除。
消融來源（`llm-skeleton2grid`／`llm-working2grid`）只烘 LLM 直線化（①〜⑨ 不跑）；`llm-working2grid` 另有 `llm-working2straight`。

---

## LLM 結果檔

共通欄位：`fingerprint`／`model`／`modelId`／`provider`（`claude`｜`cursor`｜`deepseek`）／**`executor`**（`enforced`＝由 `LLM_ENFORCED_MODEL`
機制保證模型 id；`declared`＝僅自我宣告——**論文模型對照只能用 enforced**；batch-hvd 是**純程式啟發式**，不是模型結果，不可計入任何 LLM 成績）／
`rounds`／`prompt`／`transcript`／`startedAt`／`endedAt`／`elapsedMs`／`usage`（不可空；缺用量記 `null` 不是 0）／`generatedAt`／`finalOutput`。

| 位置 | 專屬欄位／說明 |
|---|---|
| `3-straightening/{來源}/[{模型}/]{鏈}/{鏈}/`（grid 來源的 `{鏈}`＝`opus5`；消融＝`llm-straighten`） | 結果在該檔的 **`align` 子物件**（`hvBefore`／`hvAfter`／`segs`／`moved`／`cellAfter`／`cellOrigin`；讀取一律 `alignOf()`，直接取 `doc.cellAfter` 恆為 undefined）。**直線化與指令調整寫同一份結果檔**（無 `-prompt.json` 分檔；後跑者算數）。有結果即套用。**HTTP 端點仍叫 `/llm-straighten-align`**，別跟資料夾混淆 |
| `3-straightening/{來源}/llm-shape/` | 達成指定形狀後的格＋規定邊；`shapeOk===true`（舊名鏡像 `square`）即餵下游（唯一暫停旗標＝`shapeFeedCleared`）；輸入一律＝Gridding flow base，新一次執行不吃前次指定形狀結果；唯一可在資料流**代跑**的 LLM 鏈 |
| `3-straightening/{來源}/[{模型}/]{鏈}/llm-network-loop/` | LLM 網絡循環（起點＝LLM 直線化結果；餵 Frame compact=`llm-network-loop`，不覆寫程式 `network-loop`）。**只由使用者啟動**（面板／`--chain=loop`）；直線化跑完**不會**自動接本鏈——那條接的是程式 movewise |
| `3-straightening/llm-working2straight/{模型}/` | LLM 工作地圖直線化（一次 LLM 從工作地圖做到可用直線圖；compact=`llm-working2straight`）——**自己的資料夾**，不與 `llm-network-loop` 共用 |
| `2-gridding/llm-skeleton2grid/<model>/` | `baseline`／`stats`／`baseGrid`／`llmGrid`／`segsTotal`／`cellAfter`；唯一硬規則＝邊環繞序（違反整批退回），其餘違規只量不修 |
| `2-gridding/llm-working2grid/<model>/` | 同上（跳過排名吸附、直接指派整數格；白點不指派） |
| `4-frame-maps/llm-grid/` | 欄列顯示權重；寫檔後按「執行調整」才套用 |
| `4-frame-maps/llm-eval/` | 評價文字＋建議 moves；「執行調整」toggle 前後比較 |
| `4-frame-maps/llm-compare/` | 唯讀評審，不動座標 |

**絕不手改結果檔**——一律經各鏈 `apply` 驗證寫入。2026-07-29 以前的檔沒有 `executor` 欄＝declared。

---

## status.json 視圖公開代碼

`/data/metro/status.json`（`vite/metroStatus.js`＝全站狀態**單一來源**；
產生端 `vite/viewStatusCompute.js`）回傳
`{ [cityId]: { views: string[], tilt, orientRecommend, llmMs } }`。
`tilt`＝建議旋轉角（度；H/V 佔比最大化）；`orientRecommend`＝是否達建議門檻
（`round(|tilt|) ≥ 30` 且 `hvGain ≥ 0.08`；清單角度欄紅字）。規格＝系統說明 `route-orientation`。
`views` 用**公開代碼**（✓＝點開一定有圖；世界地圖兩個記號由 `src/lib/cityStatusRule.js`
從同一份導出）：

| 公開代碼 | 條件 |
|---|---|
| `working` | 工作地圖 geojson 存在 |
| `source` | 原始地圖備份存在 |
| `skeleton` | 骨架地圖預算檔有 `skeleton` 視圖 |
| `grid-orig-pre`／`grid-orig-post` | 網格地圖「網格化前＋後」都在才算算完 |
| `llm-skeleton2grid-<model>`／`llm-working2grid-<model>` | LLM 骨架地圖／工作地圖網格化結果可用（站集守門）；model ∈ 13 個模型 key |
| `loop-<code>-<variant>` | 該鏈結果檔有 `loop`；`<code>` ∈ `hc`／`algorithm-<chain>`（①〜⑨）／`llm` |
| `frame-<code>-<variant>` | 與 `loop-…` 成對發出 |
| `llmshape-<variant>` | 指定形狀城市檔達成＋有 cells（舊公開碼 `llmrect` 已遷） |
| `…-shape-rect` 結尾 | 指定形狀泳道的 loop／frame 視圖（例 `loop-algorithm-stroke-orig-shape-rect`） |

`<variant>` 目前只有 `orig`（＋來源後綴，例 `orig-llm-skeleton2grid-opus5`）。
公開代碼 ↔ 內部 id（`thumb`／`osm-original`／`grid-orig-*`／D3 mode）的轉換
＝`src/lib/viewCodes.js` 的 `publicViewId()`／`internalViewId()`
（①〜⑨在 `loop-`／`frame-`／`compact-` 代碼中加 `algorithm-` 前綴；
`hc`／`llm`／`llm-network-loop`／`llmshape`／`llm-skeleton2grid`／`llm-working2grid` 不加）。

---

## 對映模組（三支）

| 模組 | 職責 |
|---|---|
| `src/lib/layerRegistry.js` | **命名唯一真相**：`STEP_CODES`（step 代碼＝資料夾名）、`LAYER_CODES`（圖層公開代碼）、`LAYER_SKILLS`／`FLOW_CHAIN_SKILLS`（圖層→skill）、`layerRegistryTable`（資料流分頁右欄「Layers / Skills」的表）。flowGraph 節點 tag、圖層面板 chip、磁碟夾名三者都從這抓，不一致就是 bug。**Skills 主畫面的右側清單也從這裡導**（`skillCatalog.js` 跑 `layerRegistryTable(loc)`，子標＝會用到該 skill 的圖層名），自檢＝`node scripts/checkSkillCatalog.mjs` |
| `src/lib/viewCodes.js` | **公開視圖代碼 ↔ 內部 id**：status.json／畫廊清單輸出公開代碼；點擊／檔案路徑／縮圖一律 `internalViewId()` 轉回內部 id。內部 id、資料檔鍵、持久化欄位不改名 |
| `src/lib/metroNetworkLayout.js` | **磁碟對映**：`NETWORK_STEPS`／layer 夾名表、`networkLayerFileName`（檔名文法）、`metroNetworkPath` 與各 `network*Path` helper、`resolveNetworkCity`（後綴解析）、舊路徑改寫（`legacyNetworksRelToCurrent`／`flatRelToNetworkRel`／`projectPathToNetwork`） |

另：`src/lib/metroDataPaths.js` 的 `METRO_DIRS` 保留**邏輯 key**（`systems`／`views`／
`straighteningCells`／`llmStraightenAlign`…）供程式引用，實際路徑一律經 `metroNetworkLayout.js` 改寫進城市樹。

---

## 其餘頂層檔案

| 檔案 | 說明 |
|---|---|
| `maps/maps_index.json` | 官方／UrbanRail 圖授權索引（約 572 entry）。key 仍是舊制「洲/國/群組id」（例 `north-america/united-states/na-usa-new-york-city`），但 `map_file` 已指向城市樹新位（`maps/{g}/{c}/1-raw-maps/official-route/….png`）。引用圖片須依索引署名 |
| `city_coords.json` | 城市座標（世界地圖記號） |
| `official_sites.json` | `metro:sites` 產出的官方網站索引 |
| `_overrides/` | 人工裁決 JSON（分桶釘選、剔站、補名、map_overrides…）；重抓自動套用 |
| `_cache/` | Overpass／Wikipedia 快照與工作記錄＝論文可重現輸入；**不進版控、只在本機**（重抓的結果會隨 OSM 變動）。重抓某城＝先刪對應快取 |

### 尚未跟進 2026-07-31 改版的部分

- `data/railway/`、`data/highway/`：沿用舊 schema／舊目錄（railway_system／highway_system
  仍含改版前欄位配置）。
- `maps_index.json` 的 key 仍是「洲/國/群組id」舊制（值內路徑已更新）。
