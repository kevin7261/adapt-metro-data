---
description: geojson 檔存什麼——「這座城市是什麼」（站點、路線、顏色、站名、經緯度、`metro_system` 與指定形狀規定）；四個槽 working／source／tracks／center 的分工與三層一致鐵律；更新方式是**覆蓋**（不版本化），而且它會被**原樣內嵌**進每一份結果 json 的 `source`（見 `data-file-json`）。
layer: working
---

# geojson 存什麼（data-file-geojson）

本文件是 **geojson 檔內容**的規格權威（系統說明，**不是** skill）。實作必須與它相符。

姊妹篇＝[`data-file-json`]（結果 json 存什麼、為何每一份都要自足）。

## 一句話

**geojson ＝「這座城市是什麼」**——站點、路線、顏色、站名、經緯度。
它是整條管線**唯一的原始資料源**，也是每一份結果 json 內嵌的那一份來源。

| | `.geojson`（本篇） | `.json`（見 `data-file-json`） |
|---|---|---|
| 存什麼 | **這座城市是什麼**——站點、路線、顏色、站名、經緯度 | **這一張圖長什麼樣**——格座標／繪圖幾何 |
| 誰產生 | OSM 抓取與 build（`buildGeojson` 等） | 演算法管線（骨架化／網格化／直線化／各 LLM 鏈） |
| 更新方式 | **覆蓋**（重抓就換掉） | **版本化，永不刪**（每次寫新的 `-YYMMDDHHMMSS.json`） |
| 位置 | `1-raw-maps/{working,source,tracks,center}/` | `1-raw-maps/skeleton/`、`2-gridding/`、`3-straightening/`、`4-frame-maps/` |

## 檔案內容

`maps/{group}/{city}/1-raw-maps/working/{city}-1-working.geojson`：

| 欄位 | 內容 |
|---|---|
| `features` 的 `Point` | 車站——`station_id`、站名、`pass`（行經不停靠）、`is_control`（中途控制點）、地標折點旗標 |
| `features` 的 `LineString`／`MultiLineString` | 路線幾何——`route_colors`、`routes[]`、`route_ref` |
| `features` 的 `Polygon` | 地標面域（皇居／中央公園）——地理視圖的填色原圖 |
| `metro_system` | 系統層中介資料——`city`／`country`／`line_count`／`station_count`／`modes`／`audit`／`wiki`／`official_website`／`wikipedia`，以及 `prescribed_shape`（指定形狀規定的**權威**） |

**`metro_system` 是面板顯示的唯一來源**：城市標題的線站數、概要的官網與 Wikipedia、
資料驗證記號，全部讀這裡（不可以回頭查 `index.json`／`official_sites.json`，見
`data-file-json` 的「面板只讀這一層自己的檔」）。

## 四個槽

同一座城的 `1-raw-maps/` 底下有四份 geojson，各有各的職責：

| 槽 | 是什麼 | 誰讀它 |
|---|---|---|
| `working/` | **工作地圖**＝管線的輸入，也是被內嵌進結果 json 的那一份 | 整條管線、所有結果 json 的 `source` |
| `source/` | **原始地圖**＝唯讀備份，與 working 必須一模一樣 | 工具列「回復」用它覆寫 working |
| `tracks/` | **實際路線**（真實軌道線形） | 地理視圖的疊圖 |
| `center/` | **路線中線** | 地理視圖的疊圖 |

**三層搭配鐵律**：`working`／`tracks`／`center` 三者的 `route_ref` 集合必須完全相等。
改過線集合就要跑 `metro:synctracks`、用 `metro:verifytracks` 驗——詳見 [[metro-tracks-sync]]。

## 更新方式＝覆蓋

geojson **不版本化**：重抓 OSM、重跑 build 就直接覆蓋。歷史留在 git，不留在檔名。

⚠ **重建會洗掉不是從 OSM 算出來的欄位**——`prescribed_shape` 就是這種。所以凡是覆寫城市
geojson 的 builder，寫檔前一律呼叫 `keepPrescribedShape(doc, absPath)`（`scripts/_prescribedShape.mjs`）
把既有欄位原樣帶回。洗掉不會有任何錯誤訊息，只是那座城從此變成「不需計算」。
安全網＝`node scripts/checkShapeSystems.mjs` 的 B／C 兩段。

## 它會被內嵌進每一份結果 json

結果 json 在 `source` 欄位裡**原樣**帶著這份 working geojson，好讓每一份 json 都能單獨
匯出／匯入而顯示不變。所以**改動 working geojson 不會回頭改變既有結果的畫面**——那些檔
帶的是當時那一份。理由與機制見 `data-file-json`。
