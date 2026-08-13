---
description: 路網方位分析——Boeing φ／玫瑰圖、建議旋轉角＝最大化 H/V 長度佔比（非主峰格）、建議門檻 |tilt|≥30°＋hvGain≥0.08；實作 orientation.js；不是 skill
layer: working
---

# 路網方位（route-orientation）

對**工作地圖**地鐵路網（不含地標線）做長度加權方位分析：資訊 tab「方位」玫瑰圖、
建議旋轉角、城市清單「旋轉角度」紅字，以及骨架／網格地圖的「逆時針／順時針轉 n 度」共用同一支
`computeOrientation`（`src/stores/orientation.js`）。

本文件是方位／建議旋轉的**規格權威**（系統說明，**不是** skill）。改行為＝先改碼再改本檔。

## 輸入

- GeoJSON 線要素（`LineString`／`MultiLineString`）。
- **排除**地標：`river`／`area`／`landmark_id`（地理事實，不是路網格向）。
- 共用主幹只算一條長度，**不**乘 `route_count`。

## 玫瑰圖（Boeing 2019）

1. 每段取羅盤方位角（0°＝北、順時針）＋反向（+180°）。
2. 依大圓長度加權，分進 **36 × 10°** 格（−5° 偏移，讓 0°／90° 落在格心）。
3. 正規化後每格佔比之和 ≈ 1；wedge 半徑 ∝ √佔比（等面積）。
4. **紅色高亮**＝最長那一格（及其反向）——只供對照，**不是**建議旋轉角的來源。

衍生顯示量（不進建議門檻）：

| 欄位 | 定義 |
|---|---|
| `phi`（φ） | Boeing 方向秩序：φ = 1 − ((H − H_grid)/(H_max − H_grid))²；0＝均勻、1＝完美方格 |
| `strength` | 方位摺成 90° 後四折 resultant 的 \|R\|／總長 |
| `peakRatio` | 最高格 ÷ (1/36) |
| `peakWedge` | 最高格 ±1 與三個反向格（≈ 主軸雙向 ±15°）的長度佔比 |

## 建議旋轉角 `tilt`（現行）

**舊算法（已廢）**：只取玫瑰圖最長 10° 格內線段的長度加權平均角 → 最近 cardinal。
一條長斜線可以當主峰，其餘其實已接近正南北仍會被拉去轉（漢堡／福州類）。

**現行算法**：在 θ ∈ [−45, 45]（1°）找使「旋轉後落在 H/V 附近的長度佔比」最大的角：

- 摺到 [0, 90)：離 0°（水平／垂直）≤ `ORIENT_HV_BAND_DEG`（**10**）算 H/V。
- `tilt`＝argmax；平手保留較小 \|θ\|（從 0 起、只在嚴格變大時更新）。
- **號＝方向**：正＝逆時針、負＝順時針（顯示一律 `orientationTurnDir()`）。
- `hvGain`＝`hvShare(tilt) − hvShare(0)`。

常數（程式字面值；改門檻只改這裡）：

| 常數 | 值 | 用途 |
|---|---|---|
| `ORIENT_HV_BAND_DEG` | `10` | H/V 容許帶 |
| `ORIENT_BIAS_TILT_DEG` | `30` | 角度門檻（比對用**四捨五入**後的 \|tilt\|） |
| `ORIENT_BIAS_HV_GAIN` | `0.08` | 相對不轉，H/V 佔比至少再多 8% |

## 是否建議旋轉

```text
obviousBias ⇔ orientationRecommendsRotate(tilt, hvGain)
           ⇔ round(|tilt|) ≥ 30  且  hvGain ≥ 0.08
```

| UI | 達標 | 未達 |
|---|---|---|
| 資訊 tab 折疊標題 | 「方位（建議旋轉n度逆時針｜順時針）」 | 「方位（不建議旋轉）」 |
| 資訊 tab「建議旋轉」 | 顯示「n° 逆／順時針」 | **不建議旋轉** |
| 工具列「轉 n 度」 | 「逆時針轉 n 度」／「順時針轉 n 度」 | 已對齊則停用 |
| 玫瑰圖外側弧 | 畫角度＋逆／順時針（紅） | 仍畫角度＋方向（muted）；0° 不畫 |
| 城市清單角度欄 | **紅字**＋逆時針／順時針 | 普通字色＋方向詞 |
| `view_status` | `tilt`＋`orientRecommend: true` | `orientRecommend: false` |

錨點（實測）：紐約／巴塞隆納 → 建議；巴黎／漢堡／福州 → 不建議。

## 與旋轉變體／內建旋轉城市的關係

`STRAIGHTENING_DIRECTIONS` 目前只有 `['orig']`（2026-07 旋轉移除）。
方位模組**仍在使用**：互動「逆時針／順時針轉 n 度」、資訊／清單建議，不是休眠公式。
若把 `'rot'` 放回清單重烘，旋轉變體仍吃同一支 `tilt`。

**另有「內建旋轉城市」**（`-l33`／`-r39`…）：獨立系統 id，骨架地圖以後整條管線
在投影角上算——那才是「旋轉後計算」的落檔路徑。規格＝`route-city-rotation`。
建議角常作選城依據，但寫進變體表後不再每次重算。

## 實作入口

| 用途 | 位置 |
|---|---|
| 計算 | `src/stores/orientation.js` → `computeOrientation` |
| 資訊 tab／? 說明 | `StyleInfoTab.vue`＋`ui-locale.md`（`style.orient*`） |
| 玫瑰圖 | `OrientationRose.vue`（`recommend`＝`obviousBias`） |
| 清單紅字 | `CityStatusList.vue` ← `view_status.orientRecommend` |
| 狀態產生 | `vite/viewStatusCompute.js`（快取 tag `orient-v3`） |
| 套用旋轉 | 骨架／網格「轉 n 度」（投影角＋網格化重算） |
