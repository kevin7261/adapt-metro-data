# 全量路網圖＋路線色核對（2026-07-26）

政策：**官方營運商圖優先**；找不到才 urbanrail。

## 路網圖盤點（作用中 545 城市群組）

| 來源 | 數量 | 說明 |
|---|---|---|
| Official operator | **160** | 含本輪新寫入 11 城＋Gold Coast metadata 修正 |
| map_overrides（Commons 釘選等） | 26 | 德國本城等 |
| urbanrail 後備 | **357** | 並非都「真的找不到官方」——見下方待補 |
| 留白 | 2 | NYC（版權刻意）；Naumburg（無 UR 圖） |

機器盤點：`map_source_audit.json`、`urbanrail_official_candidates.json`。

### 本輪已升級為官方（11）

北京、重慶、布魯塞爾、蘇黎世、巴塞爾、日內瓦、伯恩、曼徹斯特 Metrolink、Portland、Dallas、克拉科夫。
Staging：`maps/_staging_2026-07-26-official/`。

### 已找到官方、尚未寫入（優先下一輪）

廣州（gzmtr 逾時）、上海／成都／杭州／天津（官網有圖、CDN 未釘）、
墨西哥城 STC、斯德哥爾摩 SL、里昂 TCL、聖地牙哥 MTS、莫斯科…（詳見 agent 清單）。

### 維持 urbanrail／留白

- Brisbane：官方圖黑底 → 政策判退
- NYC：版權刻意留白
- Naumburg：無 urbanrail 路網圖

### Official 真偽抽檢

已標 Official 的 149→160 城中，機器紅旗僅 **Gold Coast**（檔是官方、`source` 誤標 urbanrail）→ 已修。
抽檢北京／重慶／曼徹斯特新圖＝營運商示意圖，通過。

---

## 路線顏色盤點（561 系統／3345 線）

| 異常類 | 線數／城數 | 說明 |
|---|---|---|
| null（無 colour） | 720 線／148 城 | **幾乎全是東歐／俄電車** OSM 未標色 |
| default red 嫌疑 | 98 線／71 城 | 多數是**真的紅線**（假陽） |
| placeholder 黑／白／灰 | 34 線 | 倫敦 Northern 黑、馬德里 Ramal 白等＝官方色 |

### 已確認錯色並寫入 `route_tag_patches.json`

| 城 | 線 | 原色 | 改正 |
|---|---|---|---|
| Tashkent | Circle / Halqa | `#9933ff` | `#d5a72b` |
| Bilbao | L1 | red→`#e6194b` | `#f1592a` |
| Turin | M1 | red→`#e6194b` | `#fff200` |

需 `npm run metro:build`（或對應 rebuild）才進 geojson。

### 電車大量無色（下一輪系統補 palette）

Magnitogorsk 36、Wrocław 25、Cracow 24、Katowice 23、Bydgoszcz 23、Zagreb 19…
應依官方路網圖做全城 palette，不適合逐條瞎猜。
