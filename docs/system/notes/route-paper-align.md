---
description: 論文直線鏈（直線演算法①〜⑨）的總目錄與共用機構完整規格（非 skill）——PAPER_KINDS＝9 種（stroke／ortho／milp／force／lsq／octi／path／sat／flex）；實作在 src/stores/paper/<kind>.js，共用在 paper/_shared.js（dirModel 與 coordsFromDirs 在 paper/_dirModel.js），paperAlign.js 只註冊／re-export。LLM 直線化不在 PAPER_KINDS（見 llm-straighten；FRAME_COMPACTS 另列 llm-straighten／llm-network-loop／llm-working2straight）。輸入＝flow base（網格化後／矩形後），採納＝applyTargets(scoreAlign)。改共用機構／加新論文鏈時用。各鏈見 route-stroke-align 等；基本爬山見 system note `route-hillclimb`（≠②）。
layer: algorithm-stroke
---

# 論文直線鏈的總目錄與共用機構（route-paper-align）

本文件是該演算法的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

直線演算法的命名對應——論文①〜⑨加上 LLM 來源的鏈——在 CLAUDE.md 已經寫過一次；
這裡不重述。

**這個**檔案管的是 `paperAlign.js` 裡的 `PAPER_KINDS`＝**①〜⑨，9 種**（網格化來源的泳道）。
**`llm-straighten` 不在 `PAPER_KINDS`**——見 [[llm-straighten]]；它與那九條並列在
`src/lib/frameCompacts.js` 的 `FRAME_COMPACTS`（該表另外還帶 `llm-network-loop`／`llm-working2straight`）。
LLM 骨架地圖／工作地圖網格化：見 [[llm-skeleton2grid]]／[[llm-working2grid]]。
早期自創的軸向對齊／整數規劃鏈已經退役。
**矩形導引（Batik et al. 2022）不在這張表裡**——它掛在 Straighten 的矩形圖層，
見 system note `route-shape-rect-align`。

每條鏈的**契約完全相同**：輸入＝**flow base** 的 `cellOf`／`cellAfter`
（Gridding 網格化後，或有矩形時＝矩形後）；
它把彩色頂點做短距離移動並回傳 `{ cellAfter, stats }`；`iteratePost` 把它迭代到
不動點（上限 20）；下游的一切（移點／移線／移枝／併格／循環／逐步驗證／
Frame／畫廊／LLM 評價·互動·比較）在各鏈之間都是同構的。
**它不吃 HC**（基本爬山只是畫廊的參考圖，見 system note `route-hillclimb`）。
**消融來源的泳道（`llm-skeleton2grid`／`llm-working2grid`）只接 `llm-straighten`；
①〜⑨ 不在那裡跑。**

| kind | tab 名 i18n key | 論文 | 實作 | 套用方式 | skill |
|---|---|---|---|---|---|
| `stroke` | `paper.stroke`（①筆畫法） | ① Li & Dong 2010 | `paper/stroke.js` | makeApplier（漸進） | route-stroke-align |
| `ortho` | `paper.ortho`（②直角爬山） | ② Stott et al. 2011（\|sin 2θ\| 直角變體） | `hillClimb.js`（`buildOrthoPolish`） | 爬山本體適應度 | route-ortho-polish |
| `milp` | `paper.milp`（③MILP規劃） | ③ Nöllenburg & Wolff 2011 | `paper/milp.js` | finishPass（單批） | route-milp-align |
| `force` | `paper.force`（④力導向） | ④ Hong et al. 2006 | `paper/force.js` | finishBatches strict（逐頂點） | route-force-align |
| `lsq` | `paper.lsq`（⑤最小平方） | ⑤ Wang & Chi 2011 | `paper/lsq.js` | finishPass（單批） | route-lsq-align |
| `octi` | `paper.octi`（⑥八向格網） | ⑥ Bast et al. 2020 | `paper/octi.js` | finishBatches strict（逐頂點） | route-octi-align |
| `path` | `paper.path`（⑦路徑簡化） | ⑦ Merrick & Gudmundsson 2007 | `paper/path.js` | makeApplier（漸進） | route-path-align |
| `sat` | `paper.sat`（⑧SAT規劃） | ⑧ Fuchs 2022 | `paper/sat.js` | finishPass（單批） | route-sat-align |
| `flex` | `paper.flex`（⑨彈性格網） | ⑨ Bast et al. 2021 | `paper/flexgrid.js` | finishBatches strict（逐頂點） | route-flexgrid-align |

（實際畫出來的標籤來自 `PAPER_KINDS` 的 `zh`／`en`，經 `paperKindLabel` 取得；
`src/i18n/ui-locale.md` 的 `paper.<kind>` 那一列是同一個標籤的語系副本。
兩者都絕對不要用手抄進元件裡。）

（② 是 Stott 爬山法的**直角後處理變體**：它的 build 住在 `hillClimb.js`，並以 kind `ortho`
註冊進 `PAPER_KINDS`；**基本爬山**是另一條參考鏈，見 system note `route-hillclimb`，**不是**論文鏈的
前置步驟。）
論文與逐篇的說明文件都在 `data/thesis/`。

## 共用機構（`src/stores/paper/_shared.js`）

`paperAlign.js` 只做 `PAPER_KINDS` 註冊與 re-export。WINDOW／套用／量化住在
`paper/_shared.js`；**`dirModel` 與 `coordsFromDirs` 住在 `paper/_dirModel.js`**（不在 `_shared.js`）。

- **WINDOW = 2**：目標點相對於目前位置的 Chebyshev 上限（短距離後處理）。
- **clampTargets**：把連續目標四捨五入、夾到 WINDOW 與盤面內，並只保留真的必須移動的格。
- **finishPass**：單批收尾——clamp → `applyTargets(…, scoreAlign)` → stats。
  ③⑤⑧ 用這個：先算好全部目標再一次套用。
- **makeApplier / finishBatches**：逐批漸進套用（每個子筆畫／每條 route／每個頂點）；
  每一批各自走一次 `applyTargets`，壞的一批各自回退；一批可以提出**多個候選**
  （`Map[]`，依序試到第一個被接受為止——即 ① 的「先試 H/V，被擋才退用 ±45°」）；
  設 `strict: true` 時，一批只有在 scoreAlign **嚴格**改善時才保留（用於單頂點批——
  中性移動會讓 `iteratePost` 一直漂移而永不收斂；嚴格遞增會終止，因為段數是上界）。
  ①⑦ 直接用 `makeApplier`，邊算邊套（後面的筆畫／route 看得到已定案的佈局）；
  ④⑥⑨ 的提案不依賴佈局，所以先全部算完，再用 `finishBatches` 一批一批套。
- **snapAligned**：連續解的「對齊感知」量化——頂點依 id 順序逐一吸附到周圍的四個整數格
  （`[floor(x), floor(y)]` 的四角），
  取入射段對齊分數最高者（HV=2、45°=1），同分以距離近者勝——所以只要 H/V 可及，
  就不會停在 45°。
- **dirModel ＋ coordsFromDirs**（③⑧ 共用）：每段 3 個候選方向（最近的扇區 ±1）；
  成本＝`λ1(=3)`·同一條 route 上的折彎 bd ＋ `λ2(=2)`·非原始方向；硬性否決同一頂點有兩段以同一方向離開。
  方向選定後，座標以 shape-matching 式的鬆弛法重建（40 輪；段長下界＝H3 的最小邊長 `hops`）。
- **採納準則永遠是 `applyTargets(…, scoreAlign)`**（HV 為主鍵 ＋ HVD 為次鍵＝
  **能 H/V 就 H/V，其次 45°**）。`countHV`／`countHVD` 只寫進 stats 與工具列，
  **不是**採納準則。鏈 ②（`ortho`）是例外——它用爬山核心自己的適應度（`opts.ortho`），
  不走 scoreAlign 的逐批套用。
- 硬規則照 system note `route-hillclimb` 的 `makeMover`／`applyTargets`（不得有重疊頂點、不得新增交叉、
  象限與頂點的邊環繞序不變）。全是純函式、確定性（畫廊 bake 依賴這一點）。

## 註冊與下游

- `PAPER_KINDS`（kind/zh/en/build；標籤帶論文的圈號①〜⑨）＝唯一的清單；
  `PAPER_BUILD`／`PAPER_ZH`／`PAPER_EN` 由它導出。載入期斷言與
  `lib/viewCodes.ALGORITHM_CHAINS` 逐字一致。
- Frame／Straighten 的 compact 清單在 `src/lib/frameCompacts.js`（`FRAME_COMPACTS`＝①〜⑨ ＋
  `llm-straighten` ＋ `llm-network-loop` ＋ `llm-working2straight`）；Vite 的白名單在 `vite/compactKinds.js`
  （①〜⑨ ＋ `llm-straighten`／`llm-network-loop`／`llm-working2straight` ＋ 兩個 Gridding 的替代產物
  `llm-skeleton2grid`／`llm-working2grid`；它**不**含 `hc`）。
  `viewGeometry.js` 裡的 `CHAIN_KINDS`＝**只有①〜⑨**——它字面上就是
  `PAPER_KINDS.map((p) => p.kind)`。它**不**含 `hc`：基底快照泳道已於
  2026-08-02 移除，把它放回這裡只會製造出 `loop-hc-*`／`compact-hc-*`／`frame-hc-*` 這些
  永遠對不到資料的幽靈 view id（常數上方的註解就是這麼寫的）。
- **要新增一條鏈**——這張清單是**單一真相**；各鏈自己的 skill 都指回這裡，不重複一份：
  1. 在 `src/stores/paper/<kind>.js` 實作 build；
  2. 在 `src/stores/paperAlign.js` 的 `PAPER_KINDS` 加一列（kind/zh/en/build）——所有導出的東西
     （`PAPER_BUILD`／`PAPER_ZH`／`PAPER_EN`／`CHAIN_KINDS`）都會自動跟上；
  3. 在 `src/i18n/ui-locale.md` 加 `paper.<kind>` **以及** `paper.busy.<kind>`——`D3Tab` 是用
     字串內插呼叫 `t('paper.busy.' + kind)`，少了 busy 那一列，進度 toast 就會顯示原始 key；
  4. 更新 `src/lib/frameCompacts.js` 與 `vite/compactKinds.js`；
  5. 把 skill id 加進 `src/lib/layerRegistry.js`，資料流節點才連得過去；
  6. 視圖同步——見 [[route-view-sync]]。

  UI 名稱一律由 `PAPER_KINDS` 導出，絕不手抄進元件。

## 結果視圖的動畫（輸入 → 結果）

①〜⑨ 的結果視圖有動畫，兩端＝**這一層的輸入 → 該演算法的結果**：輸入就是這條 flow 的
base（網格地圖／消融來源的網格；規定形狀的城市＝LLM 指定形狀的結果，`straighteningInCells`
已經挑好），終點是該鏈自己那份 json。

**它不是「重播演算法的移動順序」**：與其他 morph 動畫走同一支程式（`morphCellsLayout`
換算像素、`buildMorphLayout` 內插），每個點從輸入格連續移到結果格；格線維持均勻、
軸號照順序，過程中只有格數多寡在變。演算法真正的逐步移動只有**程式網絡循環**
有（`buildStepRows`）——那個視圖只有逐步、沒有動畫。

## 修改這裡時

共用機構的變更（WINDOW/makeApplier/finishBatches/snapAligned/dirModel）記在本檔案，
外加 `paper/_shared.js`／`paper/_dirModel.js`；各鏈私有的邏輯記在它自己的 skill 與
`paper/<kind>.js`。
**任何變更都要更新視圖**——見 [[route-view-sync]]。
