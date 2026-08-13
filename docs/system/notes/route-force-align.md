---
description: 力導向（論文直線鏈 force，Hong et al. 2006 磁力彈簧）完整規格（非 skill）——引力 d/δ＋頂點對斥力 δ²/d²＋頂點×不相鄰邊斥力 (γ−d)²/d＋八方向磁場力（力偶垂直於邊）逐頂點在格空間跑 40 輪，位移先過 GEM 溫度（＝一個理想邊長 δ(1)＝ℓ）再過 PrEd 8 區域上限，snapAligned 量化後逐頂點批＋嚴格改善套用（finishBatches strict）。實作在 `src/stores/paper/force.js`（`paperAlign.js` re-export）。
layer: algorithm-force
---

# 力導向（route-force-align）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

system note `route-paper-align` 的論文鏈之一（kind `force`）。論文：Hong, Merrick,
do Nascimento 2006 _Automatic visualisation of metro maps_（Method 5，磁力彈簧模型；
`data/thesis/4_…pdf` + `4_force-directed_演算法說明.md`）。

## 演算法（整數格版的調整）

STEP 3（改良版 PrEd）固定跑 40 輪，逐頂點計算合力並**當場移動它**
（頂點順序固定＝確定性）：

1. **引力（相鄰邊）**：`ratio = d/δ` 乘上朝向鄰居的向量；理想距離是
   `δ = ℓ·sqrt(min(26, hops))`（hops = 內含的路徑位置數＝被吞掉的中途站數 + 1，
   ℓ＝每一 hop 的長度中位數，clamp ≥ 1）。**刻意的偏離**：論文原式是
   `δ = L·min(W, weight)²`（平方律，W=25，平方套在 min 之上）；本專案在格空間改用
   sqrt 壓縮（平方律下 δ 可達 625L 而爆掉），並用 hops（= weight+1 ≥ 1）避開 w=0 的奇異點。
   `min(Wcap+1, hops) = min(26, hops)` 對應論文的 `min(W, weight)` 帽值。
2. **頂點對斥力（所有頂點對）**：`ratio = δ²/d²`，往反方向推開。δ 是**逐對**取的，
   不是全域一個：若 u 是 v 的鄰居，該對就用那條邊自己的 `deltaOf(s.hops)`，否則退回
   `deltaOf(1)`（一 hop 的理想距離）——這樣吞掉很多站的長邊會保有相對應的較大平衡距離，
   而無關的頂點彼此只推開一 hop。
3. **頂點 × 不相鄰邊斥力（式 2）**：只有在垂直投影落在段內、且距離 < γ=3ℓ 時才作用，
   係數為 `(γ−d)²/d`（論文的 γ=100 是它自己那套輸入座標的尺度）。
4. **磁場力（式 4）**：每條相鄰邊取八個方向裡最近的一個；力偶垂直於邊、兩端方向相反，
   `F_m = c_m·b·len^α·|Δθ|^β`，並採用**論文原值** c_m=0.1、b=30、α=1、β=0.5。
5. **位移上限**：先過 GEM 溫度（STEP 2 的 `step_size ← min(T, |F|)`，T = `deltaOf(1)` = ℓ——
   沒有它的話，格空間裡近距離的 δ²/d² 會把座標推到溢位），再過 **PrEd 8 的移動上限**
   （§5.1：沿合力方向移動時，頂點不得越過任何不相鄰的邊）。

收尾：`snapAligned` 量化 → **逐頂點批 ＋ 嚴格**（`finishBatches` strict）——
力平衡只能讓結果「接近」八方向而非嚴格對齊（論文自己也承認這個弱點），
所以整批套用往往是淨損失而被整批回退；改成用力場當提案者，
以硬規則加上 `scoreAlign` 的嚴格改善當接受者。

## 與論文的差異

- **δ 的尺度律刻意偏離**：論文是 `δ = L·min(W, weight)²`（平方律——吞掉的站愈多、
  成長愈快）；本專案用壓縮過的 `ℓ·sqrt(min(26, hops))`（在整數格上，平方律會讓 δ 達到
  625L，力平衡直接爆掉）。
- **式 (3)／(5) 的第四項被省略**（當 v 的相鄰邊去斥開其他頂點時，v 所受到的反作用力
  `−Σ F_e(u,(v,w))`）——只計算「v 被不相鄰邊斥開」那一項。
- 不需要 STEP 2 的 GEM 初始佈局——輸入本來就是 flow base（網格化後／矩形後；論文允許從
  地理佈局或既有佈局起算）；這讓這條鏈是**確定性**的（頂點順序固定、無亂數），
  而畫廊的預先 bake 依賴這一點。
- STEP 1 的 deg-2 收縮骨架已經做過了（中途站＝被吞掉的站）；STEP 4 的等距重新插入由下游的
  `placeBlacks` 負責。
- PrEd 8 的移動上限是**單方向射線近似**，並不提供 PrEd 被引用時那個保證嵌入的性質；
  拓撲不變式由 `makeMover` 的硬規則兜底。
- 連續解最後仍必須經 `snapAligned` 量化，並通過 `applyTargets` 的硬規則
  （位移會被夾到 WINDOW）。

## 實作契約

- `buildForceAlign(skeleton, cells, cols, rows)`（實作在 `src/stores/paper/force.js`，
  由 `src/stores/paperAlign.js` re-export）→ `{ cellAfter, stats }`；`stats` 帶 `rounds`。
- kind `force`，tab 名來自 i18n key `paper.force`＝「④力導向」；由 `iteratePost` 迭代；
  採納走 `applyTargets(…, scoreAlign)`（`countHVD` 只進 stats；見 system note `route-paper-align`）。

## 修改時

力參數／輪數／溫度／γ 的變更，要讓本文件與 `paper/force.js` 保持同步。嚴格逐批的機構記在
system note `route-paper-align`（`paper/_shared.js`）。視圖同步見 [[route-view-sync]]。
