---
description: 筆畫法（論文直線鏈 stroke，Li & Dong 2010）完整規格（非 skill）——把段串成筆畫（同路線＝具名優先、不設偏角門檻；剩餘段跨路線 every-best-fit、偏角<45°）、依最大方向扭曲 >45° 遞迴切子筆畫、各子筆畫先試 H/V 被擋才退用 ±45°，成員頂點垂直投影到過錨點的定向直線（錨點＝已定案且排序鍵最高的交點 → 皆未定案取 deg 最高的交點 → 無交點取首尾中點），逐子筆畫當場套用（makeApplier）。
layer: algorithm-stroke
---

# 筆畫法（route-stroke-align）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

system note `route-paper-align` 的論文直線鏈之一（kind `stroke`）。論文：Li & Dong 2010
_A stroke-based method for automated generation of schematic network maps_
（`data/thesis/1_…pdf` ＋ `1_stroke-based_演算法說明.md`）。
輸入＝**flow base**（Gridding 網格化後的 `cellOf`／`cellAfter`，或有矩形時＝矩形後；
**它不吃 HC**）；目標＝把彩色頂點做短距離移動，使 H/V/45° 的段數最大化。

## 演算法（調整為整數格）

1. **FormStrokes（§3.1 → §3.2）**：在每個頂點做兩輪配對——先是「具名」那輪（對地鐵而言，
   route *就是*名字）：**共享同一條 route** 的段對串起來，偏折（π − 兩者夾角）小者優先，
   **不設門檻**（路線該轉彎就轉彎；過度彎折的筆畫交給 §4.2 的切分處理）；接著是「未具名」那輪：
   剩下沒配到的段跨 route 做 every-best-fit，只有偏折 < 45° 才配。之後沿著配對關係走出筆畫
   （頂點串）。
2. **排序（式 3）**：類型（**該筆畫自己的段**所屬的 route 數——與之交叉的筆畫的 route 不算）
   > 總長度 > 交會點數（deg ≥ 3 的頂點數）；大筆畫先處理。
3. **遞迴切分（§4.2，方法一）**：以子筆畫兩端的連線為基準；每個內部點有**兩個**方向扭曲
   （論文圖 5a：一個從端點 a 相對 a→m 量、一個從端點 m 相對 m→a 量，取較大者）。
   若最大扭曲 > 45°，就在最差的那個點把子筆畫切成兩段。
4. **吸附 ＋ 投影（§4.3／§5.1／§D）**：4 主方向模式——**先試**最近的水平／垂直，
   只有在硬規則擋住、或淨對齊變差時，才**退用**最近的 ±45°（論文的「對角線是備案」）。
   成員頂點被**垂直投影**到過錨點的定向直線上。錨點＝在交會點（deg ≥ 3）之中，
   已定案且其所屬筆畫排序鍵最高的那一個（`fixOrder` 最小者）→
   若有交會點但都還沒定案，取 deg 最高的交會點 →
   若完全沒有交會點，取兩端的中點。
5. **漸進（§6.3）**：每個子筆畫都**當場套用**（`makeApplier`，兩個方向候選依序試，
   壞的各自回退），它涵蓋的頂點成為 `fixed`——後面的筆畫看得到已定案的佈局。

## 與論文的差異

- 拓撲一致性不用論文那套點在多邊形內的修復——目標一律走 `applyTargets` 的硬規則
  （§5 的四條硬規則；淨 `scoreAlign` 變差的一批整批回退），這等價於「動不了就留在原地」。
- 輸入本來就是 flow base（網格化後／矩形後），所以只取方向吸附 ＋ 投影的核心，
  位移夾到 `WINDOW`（±2 格）。
- 切分的折點不固定：左子筆畫投影完之後，右子筆畫可能把共用的折點再投影一次到自己的方向線上
  （論文裡折點＝兩條方向線的交點，所以折線保持連續）；這裡改由淨 scoreAlign 的守門攔下來
  （淨值變差的一批整批回退）。
- 「共用頂點」是用 deg ≥ 3 判定的——兩個筆畫**端對端**相接的 deg-2 頂點會被漏掉。
  這只影響第三個排序鍵（以及錨點候選），不影響幾何。

## 實作契約

- `buildStrokeAlign(skeleton, cells, cols, rows)`（src/stores/paper/stroke.js；paperAlign.js
  只做 re-export／註冊）
  → `{ cellAfter, stats }`；stats 帶 `hvBefore/hvAfter/hvdBefore/hvdAfter/moved/
  proposed/revertedN/strokes/substrokes/batches`。
- 註冊在 `PAPER_KINDS`（kind `stroke`，tab 名來自 i18n key `paper.stroke`＝「①筆畫法」）；
  UI 透過 `iteratePost(buildStrokeAlign, …)` 把它迭代到不動點（上限 20）；採納走
  `applyTargets(…, scoreAlign)`（HV 為主鍵 ＋ HVD 為次鍵；`countHVD` 只進 stats，
  見 system note `route-paper-align`）。
- 下游鏈（移點／移線／移枝／併格／循環／Frame／畫廊）與其他鏈完全同構。

## 修改這裡時

配對門檻／切分準則／方向偏好的變更，要讓本文件與 `paper/stroke.js` 保持同步；
共用機構（makeApplier／clampTargets／snapAligned）的變更記在 system note `route-paper-align`。
**任何變更都要更新視圖**——見 [[route-view-sync]]。
