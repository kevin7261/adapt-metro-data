---
description: 內建旋轉城市——id 尾綴 -l33／-r39 等；原始／工作地圖不轉座標，骨架地圖以後一律在投影角上算完整管線；實作 cityRotation.js／buildRotatedVariants.mjs；不是 skill
layer: skeleton
---

# 內建旋轉城市（route-city-rotation）

**可以旋轉後再算整條管線**——不是互動預覽而已。城市 id 帶角度尾綴時，
骨架化以後的每一階（網格化／直線化／movewise／Frame／LLM 鏈）都在**轉過的投影**上算，
結果落在獨立的城市資料夾，與本體並列對照。

本文件是內建旋轉的**規格權威**（系統說明，**不是** skill）。改行為＝先改碼再改本檔。

> **三種「旋轉」不要混**：
> ① **本機制**＝獨立城市檔（`-l33`／`-r39`…），整條管線旋轉後計算；
> ② 資訊 tab／清單的**建議旋轉**＋骨架／網格「**轉 n 度**」＝互動預覽（見 `route-orientation`）；
> ③ Straightening 變體鍵 `rot`（`STRAIGHTENING_DIRECTIONS`）＝**已自清單移除**，不是本機制。

## 尾綴與角度

| 尾綴 | 意義 | `bakedRotateOf` 回傳 |
|---|---|---|
| `-lN` | 左轉（逆時針）N° | `+N` |
| `-rN` | 右轉（順時針）N° | `-N` |
| （無） | 不轉 | `0` |

- 正規式＝`/-([lr])(\d{1,3})$/`（`src/lib/cityRotation.js` 的 `ROT_SUFFIX_RE`）。
- 角度正負與 d3 `projection.angle()` 一致：**正＝畫面上逆時針（左轉）**。
- `-shape-rect`／消融尾綴先剝再比對，所以 `…-l33-shape-rect` 也認得。
- **群組夾剝尾綴**（`metroNetworkLayout.js` 的 `CITY_GROUP_SUFFIX_RE`）也要收 `[lr]`——只寫 `l` 會讓右轉城市自己開一個群組夾。

## 旋轉發生在哪裡

| 階段 | 座標／投影 |
|---|---|
| 原始地圖／工作地圖／tracks／center | **不轉**（真實地理；鐵律「抓的路線＝實際路線＝路線中線」） |
| 骨架地圖起 → 網格／直線／循環／Frame | `projection.angle(bakedRotateOf(cityId))` |

變體檔由 `scripts/buildRotatedVariants.mjs` **原封複製**四層 geojson（只改 id／
`rotated_from`／`rotate_deg`）。**禁止在複製時改座標**——轉了會與投影角互相抵銷，
骨架看起來跟本體一模一樣。

投影角的**單一真相**＝`bakedRotateOf(cityId)`。凡瀏覽器現算幾何的入口都要傳
`opts.cityId`（少傳＝靜默 0°＝縮圖沒轉、主畫布有轉，違反視圖≡顯示）。
現役入口＝`computeCityViews`／`buildAblationMosaic`／`computeCityStraighteningViews`／
`computeCityFrameViews`／`patchStraighteningGalleryFromCells`／`patchFrameGalleryFromCells`／
`patchAdjustGalleryFromGen`；主畫布那一份是 `D3Tab` 的 `bakedRotate`。
geojson 裡**沒有** `metro_system.id` 這個欄位（別指望那個 fallback）；
純 Node 腳本沒有 id 時退路＝`metro_system.rotate_deg`。

驗法：`geoMercator().angle(+33)` ＝畫面**逆時針**（左轉）33°，所以本體與 `-l33` 的同一對站
在畫面上的夾角差必須是 −33°（右轉的 `-r39` 則是 +39°）。

## 現役變體

表在 `scripts/buildRotatedVariants.mjs` 的 `ROTATED_VARIANTS`（新增一列就多一個）：

| id | 相對本體 |
|---|---|
| `na-usa-new-york-city-l33` | 紐約左轉 33° |
| `na-usa-new-york-city-lm-l33` | 紐約＋地標左轉 33° |
| `eu-esp-barcelona-r39` | 巴塞隆納右轉 39° |
| `as-tur-istanbul-r42` | 伊斯坦堡右轉 42° |

角度通常對齊該城方位分析建議的 \|tilt\|（見 `route-orientation`），但**寫死在變體表**，
不在每次 bake 時重算——同一 id 永遠同一角。

## 與「轉 n 度」的疊加

內建角是**底**；工具列「轉 n 度」疊在上面。對 `-l33` 城市，按下去顯示
`33 + (−33) = 0`＝回到未轉的地理方位（「轉回原狀」），不是再轉一次。

## 怎麼建／怎麼算

```text
node scripts/buildRotatedVariants.mjs          # 複製四層＋寫 index.json
node scripts/buildViews.mjs <rotated-id>       # 骨架＋網格（吃 baked 投影）
node scripts/bakeStraighteningCells.mjs <id>   # 九鏈＋循環（同上）
```

`bakeStraighteningCells` 在建投影時加 `bakedRotateOf(cityId)`；漏掉會讓九條鏈用沒轉的
座標，跟骨架／網格地圖對不上。

## 實作入口

| 用途 | 位置 |
|---|---|
| 角度解析 | `src/lib/cityRotation.js` → `bakedRotateOf` |
| 建變體檔 | `scripts/buildRotatedVariants.mjs` |
| 烘直線化 | `scripts/bakeStraighteningCells.mjs`（`baked + …`） |
| 主畫布投影 | `D3Tab.vue`（底＝baked；「轉 n 度」疊加） |
| 建議角（對照） | `route-orientation`／`orientation.js` |
