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

台北的工作地圖＝**176 個 `Point`（站）＋17 個 `MultiLineString`（路段）**，130,544 bytes。
以下欄位名與值全部取自磁碟上那份檔（`as-twn-taipei-1-raw-maps-working.geojson`），
只把長陣列截短成 `…`——**沒有任何示意值**。

#### ① 頂層與 `metro_system`

```jsonc
{
  "type": "FeatureCollection",
  "metro_system": {
    "continent": "asia", "country": "Taiwan", "city": "Taipei",
    "official_website": "http://www.trtc.com.tw/",
    "official_map": "https://en.wikipedia.org/wiki/Taipei_Metro",
    "wikipedia": "en:Taipei Metro", "wiki": true, "wikipedia_zh": "zh:臺北捷運",
    "line_count": 15,        // 幾條路線（去重後）
    "segment_count": 17,     // 幾個路段 feature
    "station_count": 176,    // 幾個站 feature（＝Point 數）
    "modes": ["metro", "tram"],
    "audit": {
      "strategies_tried": [],
      "covers": ["New Taipei Metro", "Taoyuan Metro"],   // 併進這一檔的鄰近系統
      "passed": true,
      "checks": [                                        // 13 項
        { "id": "system_exists", "ok": true, "level": "error",
          "detail": "matched OSM system metro-maps/asia/taiwan/as-twn-taipei/as-twn-taipei.geojson" },
        { "id": "has_lines", "ok": true, "level": "error", "detail": "17 lines" },
        { "id": "has_stations", "ok": true, "level": "error", "detail": "197 stations" },
        { "id": "station_count_info", "ok": true, "level": "warn",
          "detail": "OSM 197 站（wiki List 記 119，計法含轉乘重複，僅參考）" },
        …
      ],
      "reasons": [ … ], "warnings": [ … ], "audited_at": …
    }
    // 指定形狀城市另有 "prescribed_shape": [ { shape, route, stations… } ]；台北沒有
  },
  "features": [ … ]          // 見下面②③
}
```

`checks[].detail` 裡的 197 是**合併前**的 OSM 站數，`station_count` 的 176 是共站合併後的
feature 數——兩個數字不同是正常的（見 `merged_from`）。

#### ② 車站（`Point`）：三種典型

欄位集全球一致（缺值一律 `null`／`false`），所以物件分頁的表格列不會因城市而異。

```jsonc
// 轉乘站：三線交會、由 7 個 OSM 節點併成一站
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [121.51517871428571, 25.048191457142853] },
  "properties": {
    "station_id": "n3933501987",         // OSM 節點 id 前面加 n／w／r
    "station_name": "台北 / 臺北車站",   // 顯示名（日本城市＝name:ja）
    "station_name_local": "台北 / 臺北車站",
    "station_name_en": "Taipei",
    "city": "Taipei", "country": "Taiwan",
    "lines": ["BL", "R", "TY-A"],        // 經過這站的 route_ref
    "wikipedia": "zh:臺北車站",
    "merged_from": 7,                    // 共站合併：由 7 個 OSM 節點併來
    "merged_names": [                    // 併進來的那幾個各自叫什麼
      { "station_id": "n3933501987", "station_name": "台北",
        "station_name_local": "台北", "lines": ["BL", "R"] }, …
    ],
    "is_terminus": false,
    "codes": ["A1", "BL12", "R10"],      // 站號（每條線各一個）
    "routes": [                          // 停靠路線的個別色（前端色點直接讀它，不必回查路段）
      { "ref": "BL", "name": "板南線", "route_color": "#007ec7" },
      { "ref": "R", "name": "淡水信義線", "route_color": "#ff0000" },
      { "ref": "TY-A", "name": "桃園國際機場捷運", "route_color": "#8246af" }
      // 行經不停靠的另有 "pass": true
    ],
    "pass_count": 3,                     // 幾何上被經過幾次（環線來回算兩次）
    "station_degree": 5,                 // 相鄰站數（＝骨架的 degree）
    "is_interchange": true,
    "station_role": "interchange"        // interchange／terminus／normal
  }
}

// 一般中途站：單線、degree 2
{
  "geometry": { "type": "Point", "coordinates": [121.60724744999999, 25.0526803] },
  "properties": {
    "station_id": "n4275358087",
    "station_name": "南港", "station_name_local": "南港", "station_name_en": "Nangang",
    "city": "Taipei", "country": "Taiwan",
    "lines": ["BL"], "wikipedia": "zh:南港車站",
    "merged_from": 2, "merged_names": null,     // 併過但沒有異名 → null（不是空陣列）
    "is_terminus": false, "codes": ["BL22"],
    "routes": [{ "ref": "BL", "name": "板南線", "route_color": "#007ec7" }],
    "pass_count": 1, "station_degree": 2,
    "is_interchange": false, "station_role": "normal"
  }
}

// 末端站：兩條同 ref 的路線（淡海輕軌綠山線／藍海線）都到這裡收尾
{
  "geometry": { "type": "Point", "coordinates": [121.43462090000001, 25.200949733333335] },
  "properties": {
    "station_id": "n6522757003",
    "station_name": "崁頂", "station_name_local": "崁頂", "station_name_en": "Kanding",
    "city": "Taipei", "country": "Taiwan",
    "lines": ["V", "V"],                        // 同 ref 兩條 → 重複是實情，不是 bug
    "wikipedia": "zh:崁頂站 (新北市)",
    "merged_from": 3, "merged_names": null,
    "is_terminus": true, "codes": ["V11"],
    "routes": [
      { "ref": "V", "name": "淡海輕軌綠山線", "route_color": "#febeb5" },
      { "ref": "V", "name": "淡海輕軌藍海線", "route_color": "#febeb5" }
    ],
    "pass_count": 2, "station_degree": 1,
    "is_interchange": false, "station_role": "terminus"
  }
}
```

#### ③ 路段（`MultiLineString`）：單線與共線

台北 17 段的 `seg_id`／`route_count`／`route_refs` 一覽（`taipei-16` 不存在——
`seg_id` 是產生時的流水號，中間可以有洞）：

```
seg_id     route_count  route_refs   routes[].route_id（stations 數）
taipei-0   1  BL     rm9437778 (23)      taipei-9   1  O   rm4250359 (21)
taipei-1   1  BR     rm4264893 (24)      taipei-10  1  O   r4250352 (17)
taipei-2   1  G      rm4250358 (19)      taipei-11  2  V+V rm5576487 (12) ＋ r9154523 (11)
taipei-3   1  G      r4250380 (2)        taipei-12  1  V   rm5576487 (12)
taipei-4   1  TY-A   rm6937084 (22)      taipei-13  1  V   r9154523 (11)
taipei-5   1  R      rm9437207 (28)      taipei-14  1  K   rm15443527 (9)
taipei-6   1  R      r2665129 (2)        taipei-15  1  LB  rm21066082 (11)
taipei-7   1  Y      rm10658528 (14)     taipei-17  1  LG  manual-taipei-lg-phase1 (9)
taipei-8   2  O+O    rm4250359 (21) ＋ r4250352 (17)
```

同一條 route 可以出現在多個路段（`rm4250359` 在 `taipei-8`／`taipei-9` 各一次），
所以 `line_count`（15）比路段數（17）少；`taipei-17` 的 `manual-…` 是手工線
（`buildManualLines.mjs`，`osm_route_ids` 為空）。

```jsonc
// 單線路段
{
  "type": "Feature",
  "geometry": {
    "type": "MultiLineString",
    "coordinates": [[[121.41939568, 24.95966538], [121.43626983, 24.96687367], …]]
  },
  "properties": {
    "seg_id": "taipei-0",
    "route_count": 1,                    // 這段有幾條路線走（>1 才是共線）
    "route_refs": ["BL"],
    "route_colors": ["#007ec7"],         // 畫線用（多色＝交錯虛線，見 strokesOf()）
    "routes": [
      {
        "route_id": "rm9437778",         // `r<最小 relation id>`＝單一 relation；
                                         // `rm…`＝多個 relation 併成一條（實際 id 見 osm_route_ids）
        "route_name": "板南線", "route_name_local": "板南線", "route_name_en": "Bannan line",
        "route_ref": "BL", "route_color": "#007ec7",
        "wikipedia": "zh:板南線",
        "osm_route_ids": [199038, 9437776],
        "status": null,                  // 非營運中（建設中／已廢）才有值
        "order_suspect": 0, "span_suspect": 0,   // audit 用的疑點計數（站序亂／跨距異常）
        "stations": [                            // **站序**（整條線由頭到尾，23 個）
          { "station_id": "n12183049886", "station_name": "頂埔", "code": "BL01" },
          { "station_id": "n373399546",   "station_name": "永寧", "code": "BL02" },
          …
          // 行經不停靠的站另有 "pass": true
        ]
      }
    ],
    "city": "Taipei", "country": "Taiwan"
  }
}

// 共線路段：同一段線被兩條 route 走（中和新蘆線的兩個分支）
{
  "properties": {
    "seg_id": "taipei-8",
    "route_count": 2,
    "route_refs": ["O", "O"],
    "route_colors": ["#f58231", "#f58231"],   // 兩色相同 → 畫成單色實線，不交錯
    "routes": [
      { "route_id": "rm4250359", "route_name": "中和新蘆線", "route_ref": "O",
        "osm_route_ids": [4250353, 4250354, 4250355],
        "stations": [ …21 個，南勢角 O01 起… ] },
      { "route_id": "r4250352",  "route_name": "中和新蘆線", "route_ref": "O",
        "osm_route_ids": [4250352],
        "stations": [ …17 個，同樣由南勢角 O01 起… ] }
    ],
    "city": "Taipei", "country": "Taiwan"
  }
}
```

台北剛好用不到的三種旗標，別的城市會出現：`pass: true`（行經不停靠，在
`routes[].stations[]` 與站點的 `routes[]` 上）、`is_control`（中途控制點，目前只有
`as-twn-taipei-rail`）、`river`／`area`（地標折點，`-lm` 系統；`area:` 另有 `Polygon` feature）。

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

所以**只有 geojson 有「檔案修改時間」**——它是唯一會被就地改寫的檔（手改 OSM Map、重抓、重 build）。
時間不記在內容裡，由檔案 mtime 決定：對這份檔發 HEAD 讀 `Last-Modified`
（單一規則＝`src/composables/useGeojsonModifiedAt.js`，D3Tab 與 LayerTab 共用）。
概要因此比別的圖層**多一列「檔案修改時間」**；結果 json 反過來，寫出去就是定稿，
只有「檔案生成時間」（開始算）與「檔案完成時間」（算完落檔），沒有修改時間（見 [[data-file-json]]）。

⚠ **重建會洗掉不是從 OSM 算出來的欄位**——`prescribed_shape` 就是這種。所以凡是覆寫城市
geojson 的 builder，寫檔前一律呼叫 `keepPrescribedShape(doc, absPath)`（`scripts/_prescribedShape.mjs`）
把既有欄位原樣帶回。洗掉不會有任何錯誤訊息，只是那座城從此變成「不需計算」。
安全網＝`node scripts/checkShapeSystems.mjs` 的 B／C 兩段。

## 它會被內嵌進每一份結果 json

結果 json 在 `source` 欄位裡**原樣**帶著這份 working geojson，好讓每一份 json 都能單獨
匯出／匯入而顯示不變。所以**改動 working geojson 不會回頭改變既有結果的畫面**——那些檔
帶的是當時那一份。理由與機制見 `data-file-json`。
