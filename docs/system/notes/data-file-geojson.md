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
| 更新方式 | **覆蓋**（重抓就換掉） | **版本化，永不刪**（每次寫進新的 `{YYMMDDHHMMSS}/` 資料夾） |
| 位置 | `1-raw-maps/{working,source,tracks,center}/` | `1-raw-maps/skeleton/`、`2-gridding/`、`3-straightening/`、`4-frame-maps/` |

## 檔案內容

`maps/{group}/{city}/1-raw-maps/working/{city}-1-working.geojson`：

| 欄位 | 內容 |
|---|---|
| `features` 的 `Point` | 車站——`station_id`、站名、停靠路線與角色旗標，另有 `is_control`（中途控制點）／地標折點旗標 |
| `features` 的 `MultiLineString` | 路段幾何——`route_colors`、`routes[]`（含**站序** `stations[]`，行經不停靠的站標 `pass: true`） |
| `features` 的 `Polygon` | 地標面域（皇居／中央公園）——地理視圖的填色原圖 |
| `metro_system` | 系統層中介資料——`city`／`country`／`line_count`／`station_count`／`modes`／`audit`／`wiki`／`official_website`／`wikipedia`，以及 `prescribed_shape`（指定形狀規定的**權威**） |

### 內容範例（as-twn-taipei）

台北的工作地圖＝**176 個 `Point`（站）＋17 個 `MultiLineString`（路段）**。
以下欄位名與值都取自磁碟上那份檔，只把長陣列截短（`…`）：

```jsonc
{
  "type": "FeatureCollection",
  "metro_system": {
    "continent": "asia", "country": "Taiwan", "city": "Taipei",
    "official_website": "http://www.trtc.com.tw/",
    "official_map": "https://en.wikipedia.org/wiki/Taipei_Metro",
    "wikipedia": "en:Taipei Metro", "wiki": true, "wikipedia_zh": "zh:臺北捷運",
    "line_count": 15, "segment_count": 17, "station_count": 176,
    "modes": ["metro", "tram"],
    "audit": {
      "passed": true,
      "covers": ["New Taipei Metro", "Taoyuan Metro"],   // 併進這一檔的鄰近系統
      "strategies_tried": [],
      "checks": [ { "id": "has_lines", "ok": true, "detail": "17 lines", "level": "error" }, … ]
    }
    // 指定形狀城市另有 "prescribed_shape": [ { shape, route, stations… } ]；台北沒有
  },
  "features": [
    {                                        // ← 車站（176 個 Point 之一：台北車站）
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [121.51517871428571, 25.048191457142853] },
      "properties": {
        "station_id": "n3933501987",
        "station_name": "台北 / 臺北車站",   // 顯示名（日本城市＝name:ja）
        "station_name_local": "台北 / 臺北車站",
        "station_name_en": "Taipei",
        "city": "Taipei", "country": "Taiwan",
        "lines": ["BL", "R", "TY-A"],        // 經過這站的 route_ref
        "wikipedia": "zh:臺北車站",
        "merged_from": 7,                    // 共站合併：由 7 個 OSM 節點併來
        "merged_names": [
          { "station_id": "n3933501987", "station_name": "台北",
            "station_name_local": "台北", "lines": ["BL", "R"] }, …
        ],
        "is_terminus": false,
        "codes": ["A1", "BL12", "R10"],      // 站號（每條線各一個）
        "routes": [                          // 停靠路線的個別色（前端色點直接讀它）
          { "ref": "BL", "name": "板南線", "route_color": "#007ec7" },
          { "ref": "R", "name": "淡水信義線", "route_color": "#ff0000" },
          { "ref": "TY-A", "name": "桃園國際機場捷運", "route_color": "#8246af" }
          // 行經不停靠的另有 "pass": true
        ],
        "pass_count": 3,                     // 幾何上被經過幾次（環線來回算兩次）
        "station_degree": 5,                 // 相鄰站數（＝骨架的 degree）
        "is_interchange": true, "station_role": "interchange"
      }
    },
    {                                        // ← 路段（17 個 MultiLineString 之一）
      "type": "Feature",
      "geometry": { "type": "MultiLineString", "coordinates": [[[121.41939568, 24.95966538], …]] },
      "properties": {
        "seg_id": "taipei-0",
        "route_count": 1,                    // 共線：這段有幾條路線走（>1 才是共線）
        "route_refs": ["BL"],
        "route_colors": ["#007ec7"],         // 畫線用（多色＝交錯虛線）
        "routes": [
          {
            "route_id": "rm9437778",
            "route_name": "板南線", "route_name_local": "板南線", "route_name_en": "Bannan line",
            "route_ref": "BL", "route_color": "#007ec7",
            "wikipedia": "zh:板南線",
            "osm_route_ids": [199038, 9437776],
            "status": null,
            "order_suspect": 0, "span_suspect": 0,   // audit 用的疑點計數
            "stations": [                            // **站序**（整條線由頭到尾）
              { "station_id": "n12183049886", "station_name": "頂埔", "code": "BL01" },
              { "station_id": "n373399546", "station_name": "永寧", "code": "BL02" },
              …
              // 行經不停靠的站另有 "pass": true
            ]
          }
        ],
        "city": "Taipei", "country": "Taiwan"
      }
    }
  ]
}
```

**每個 `Point` 的欄位集全球一致**（缺值一律 `null`／`false`），所以物件分頁的表格
不會因城市而異。台北剛好用不到的三種旗標，別的城市會出現：`pass: true`（行經不停靠，
在 `routes[].stations[]` 與站點的 `routes[]` 上）、`is_control`（中途控制點，目前只有
`as-twn-taipei-rail`）、`river`／`area`（地標折點，`-lm` 系統）。

**磁碟上的檔名**是 `as-twn-taipei-1-raw-maps-working.geojson`（舊式、step 寫全名）——
現行命名規則是 step 只寫數字（`as-twn-taipei-1-working.geojson`），路徑函式給的也是後者，
兩代由 `stepBasenameAliases()` 一起認（`src/lib/stepFileName.js`）。`index.json` 的
`systems[].file` 記的是磁碟上那個名字。

**站序在 `routes[].stations`，不在幾何裡**——線的 `coordinates` 是真實線形（會轉彎、
會繞路），站序是拓撲。骨架化讀的是站序，畫地理視圖讀的是 coordinates。

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
