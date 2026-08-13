# 閱讀清單

> 2026-07-27 初整・**2026-08-04** 與 `paper.md`／`improve.md` 對齊用語（消融代碼＝`llm-skeleton2grid`／`llm-working2grid`；Stage 1 含骨架；鐵路規模＝9 系統）
> **來源標記**：📁書齋＝PDF 已在你手邊（`data/thesis/` 或 `related/`）｜📄計畫書＝在兩份計畫書的參考文獻中｜✍️已引＝已寫進 `paper.md` 正文與參考文獻｜🆕新推薦（標「書目待驗證」者引用前必先查證）
> **優先序**：P1 必讀（口試被問到必須對答如流）｜P2 應讀（方法與畫界的支柱）｜P3 選讀（文獻加厚與背景）
> 連結僅列已驗證者；無連結者以標題搜尋 Google Scholar 即可。
> **定位**：這是活文件——目前約 98 筆（P1×13＋P2×21＋P3 約 64），對「口試優先」已足；博論文獻回顧的完整目標為 100–150 筆，缺口主要在 P3-C 的領域候選，逐筆驗證後升級。系統規模與管線事實以 `paper.md`／`improve.md` 為準，本清單不重複維護。

---

## P1　必讀（13 篇）

### P1-01　Stott, Rodgers, Martínez-Ovando, & Walker (2011) — Automatic Metro Map Layout Using Multicriteria Optimization
- **摘要**：以五個加權美學準則（角解析度、邊長、平衡、平直、八方向）構成適應度函數，配合硬約束做爬山搜尋自動佈局地鐵圖，含標籤佈置。IEEE TVCG 17(1), 101–114。
- **關聯**：你 Stage 3 爬山的**主依據**、②直角爬山鏈的母體——整本論文引用密度最高的一篇，口試必問「你跟 Stott 差在哪」。
- **來源**：📁 `data/thesis/2_*.pdf`｜✍️ 已引

### P1-02　Nöllenburg & Wolff (2011) — Drawing and Labeling High-Quality Metro Maps by Mixed-Integer Programming
- **摘要**：把八向佈局與標籤寫成混合整數規劃，硬約束保拓撲、軟約束求美學，品質接近人工但求解慢。IEEE TVCG 17(5), 626–641。
- **關聯**：③MILP 鏈依據；「求解器 vs local search」取捨論述（6.1–6.2 節）的對照極。
- **來源**：📁 `data/thesis/3_*.pdf`｜✍️ 已引

### P1-03　Li & Dong (2010) — A Stroke-Based Method for Automated Generation of Schematic Network Maps
- **摘要**：把角度相近的線段串成「筆畫」再拉直到 H/V/45°，速度快、適合即時。IJGIS 24(11), 1631–1647。
- **關聯**：①筆畫法鏈依據；也是兩份計畫書當年選定的核心方法——研究源流的起點。
- **來源**：📁 `data/thesis/1_*.pdf`｜📄｜✍️ 已引

### P1-04b　Bast, Brosi, & Storandt (2021) — Metro Maps on Flexible Base Grids
- **摘要**：放寬固定格網為彈性基底格網，候選位置由網絡自身的幾何決定而非預設網格。SSTD 2021, 12–22。
- **關聯**：**⑨彈性格網鏈**的依據（2026-07 新增的第九條演算法鏈）——以八向 Hanan 格網取代固定候選集，是⑥的直接延伸。
- **來源**：📄｜✍️ 已引

### P1-04　Bast, Brosi, & Storandt (2020) — Metro Maps on Octilinear Grid Graphs
- **摘要**：在八向格網圖上以最短路徑式成本逐邊佈局地鐵圖，兼顧速度與品質。CGF 39(3), 357–367。
- **關聯**：⑥八向格網鏈依據；其「一格一站」目標與你的四步鏈最接近，也是 Brosi & Bast 2024 的技術前身。
- **來源**：📁 `data/thesis/6_*.pdf`｜✍️ 已引

### P1-05　Batik, Terziadis, Wang, Nöllenburg, & Wu (2022) — 矩形導引
- **摘要**：讓使用者指定路線貼合給定幾何矩形（如圓形），其餘網絡混合佈局配合。CGF 41(7), 495–506。
- **關聯**：形狀導引／LLM 指定形狀層的依據；你的「規定路段收成指定形狀」是它的 LLM 化（正方為首例，另含 45° 等）。
- **來源**：📁 `data/thesis/9_*.pdf`｜✍️ 已引

### P1-06　Wu, Niedermann, Takahashi, Roberts, & Nöllenburg (2020) — A Survey on Transit Map Layout
- **摘要**：從設計、機器、人類三視角總覽轉乘地圖佈局研究，是本領域最完整綜述。CGF 39(3), 619–646。
- **關聯**：文獻回顧的骨架來源；「無單一最適演算法」——你九條演算法鏈並列比較設計的立論根據。
- **來源**：📄｜✍️ 已引

### P1-07　Brosi & Bast (2024) — Large-scale Generation of Transit Maps from OpenStreetMap Data
- **摘要**：以 SPARQL 自 OSM 抽取路線幾何，求解器離線生成全行星轉乘圖（地理正確或示意化）。Cartographic J. 60(4), 342–366。
- **關聯**：**最強鄰居**——資料來源與規模跟你最像；畫界（版面是輸入變數／屬性概括化／可稽核）與定量對比都以它為對象。
- **來源**：📁 `related/`｜✍️ 已引
- **連結**：https://doi.org/10.1080/00087041.2024.2325761

### P1-08　Ti, Li, & Xu (2015) — Automated Generation of Schematic Network Maps Adaptive to Display Sizes
- **摘要**：依線密度重分配自動生成適應顯示尺寸的示意圖。Cartographic J. 52(2), 168–176。
- **關聯**：「adaptive to display sizes」命題的**原提出者**——你的核心命題承自它、推進它（互動即時、多位置縮放、拓撲守恆）。
- **來源**：📄｜✍️ 已引
- **連結**：https://doi.org/10.1080/00087041.2015.1119464

### P1-09　Kim, Moritz, & Hullman (2021) — Design Patterns and Trade-offs in Responsive Visualization for Communication
- **摘要**：系統整理響應式視覺化的設計模式，提出資訊密度與訊息保留兩大取捨。CGF 40(3), 459–470。
- **關聯**：你的響應式設計理論框架——版面網格最小單位（密度）與拓撲鐵律（保留）都由此對應。
- **來源**：📄｜✍️ 已引

### P1-10　Roberts, Newton, Lagattolla, Hughes, & Hasler (2013) — Objective versus Subjective Measures of Paris Metro Map Usability
- **摘要**：巴黎地鐵圖實驗：全曲線圖作答績效優於八向圖，但主觀偏好未必跟隨——績效與偏好會解離。IJHCS 71(3), 363–386。
- **關聯**：使用者評估（5.6 節）「績效＋評價」雙軌設計的方法論標竿；設計實驗前必讀。
- **來源**：✍️ 已引（本輪新增）
- **連結**：https://www.sciencedirect.com/science/article/abs/pii/S1071581912001528

### P1-11　Trinh, Wu, Le, He, & Luong (2024) — Solving Olympiad Geometry without Human Demonstrations（AlphaGeometry）
- **摘要**：語言模型提出幾何輔助構造、符號引擎演繹驗證，達奧林匹亞級解題。Nature 625, 476–482。
- **關聯**：「提案歸模型、合法性歸規則」的頂級先例——你 6.3 節架構定位的錨；被問「LLM 架構有何依據」時的第一答。
- **來源**：✍️ 已引
- **連結**：https://www.nature.com/articles/s41586-023-06747-5

### P1-12　*How Well Will LLMs Perform for Graph Layout Tasks?*（Visual Informatics, 2025）
- **摘要**：首批系統評估 LLM 做圖佈局能力的研究之一（評測型：問模型「能不能」排版）。
- **關聯**：LLM×佈局的**直接畫界對象**（你是生產型架構）；LLM 論文投稿前必精讀。⚠️ 作者與卷期尚未查證，引用前必補。
- **來源**：🆕（書目待驗證；2.6 節已描述性提及）
- **連結**：https://www.sciencedirect.com/science/article/pii/S2468502X25000683

### P1-13　Guo (2011) — Mind the Map! The Impact of Transit Maps on Path Choice in Public Transit
- **摘要**：以倫敦地鐵 1998–2005 年旅次資料建路徑選擇模型：示意圖幾何扭曲對乘客路徑選擇的影響力約為實際搭乘經驗的兩倍（「地圖效應」），並提出扭曲／還原／編碼／認知四類地圖資訊框架。Transportation Research Part A 45(7), 625–639。
- **關聯**：「示意圖設計會改變真實行為」的最強實證——動機章與空間認知保真度題型的直接依據；地理／運輸背景口委的必然共同語言。
- **來源**：✍️ 已引（本輪新增）
- **連結**：https://wagner.nyu.edu/files/faculty/publications/Mind_the_Map_Guo_Zhan_2010.pdf

---

## P2　應讀（20 篇）

### P2-01　Wang & Chi (2011) — Focus+Context Metro Maps
- **摘要**：依裝置尺寸調整地鐵圖並放大導航路線的最小平方框架。TVCG 17(12), 2528–2535。
- **關聯**：⑤最小平方鏈依據＋區域縮放文獻的代表；Forsch 2024 的 morphing 也拿它當測資。
- **來源**：📁 `data/thesis/5_*.pdf`｜✍️ 已引

### P2-02　Hong, Merrick, & do Nascimento (2006) — Automatic Visualisation of Metro Maps
- **摘要**：磁力彈簧力導向自動佈局地鐵圖，含預處理。JVLC 17(3), 203–224。
- **關聯**：④力導向鏈依據。
- **來源**：📁 `data/thesis/4_*.pdf`｜✍️ 已引
- **連結**：https://doi.org/10.1016/j.jvlc.2005.09.001

### P2-03　Merrick & Gudmundsson (2007) — Path Simplification for Metro Map Layout
- **摘要**：受限方向集合下求最少線段的折線簡化，應用於鐵路網示意化。GD 2006, LNCS 4372, 258–269。
- **關聯**：⑦路徑簡化鏈依據。
- **來源**：📁 `data/thesis/7_*.pdf`｜✍️ 已引

### P2-04　Fuchs (2022) — SAT-based Optimization of Octolinear Metro Map Layouts
- **摘要**：八向佈局的方向指派改以 SAT 求解。TU Wien 學位論文。
- **關聯**：⑧SAT 鏈依據；與③同模型換求解器的對照。
- **來源**：📁 `data/thesis/8_*.pdf`｜✍️ 已引

### P2-05　Boeing (2019) — Urban Spatial Order: Street Network Orientation, Configuration, and Entropy
- **摘要**：以方向熵量測 100 城街道網的方向秩序，提出 φ 指標。Applied Network Science 4:67。
- **關聯**：`orientation.js` 的玫瑰圖／φ 沿用其公式；建議旋轉角另以 H/V 長度佔比最大化決定（見系統說明 `route-orientation`）。曾用於 Straightening 旋轉變體主軸角；`rot` 休眠後仍服務資訊 tab／清單建議與「轉 n 度」。旋轉後整條管線計算改走內建旋轉城市（`route-city-rotation`）。
- **來源**：📁 `data/thesis/2018_*.pdf`｜✍️ 已引
- **連結**：https://doi.org/10.1007/s41109-019-0189-1

### P2-06　Tamassia (1987) — On Embedding a Graph in the Grid with the Minimum Number of Bends
- **摘要**：TSM 框架源頭：網格嵌入最小彎折的網路流演算法。SIAM J. Computing 16(3), 421–444。
- **關聯**：6.1 節正交壓縮 NP-hard 定位的理論根——movewise 的問題譜系從這裡開始。
- **來源**：✍️ 已引
- **連結**：https://doi.org/10.1137/0216030

### P2-07　Misue, Eades, Lai, & Sugiyama (1995) — Layout Adjustment and the Mental Map
- **摘要**：提出佈局調整需保持心智地圖的三準則：正交次序、鄰近、拓撲。JVLC 6(2), 183–210。
- **關聯**：你的硬規則（拓撲＋環繞序）與有意放鬆的正交次序，正是對這三準則的取捨——6.1 節論述核心。
- **來源**：✍️ 已引
- **連結**：https://www.sciencedirect.com/science/article/abs/pii/S1045926X85710105

### P2-08　Agrawala & Stolte (2001) — Rendering Effective Route Maps（LineDrive）
- **摘要**：以認知心理學與手繪地圖分析驅動路線圖自動概括化，2,200+ 使用者驗證。SIGGRAPH 2001。
- **關聯**：「概括化服務於認知」的殿堂級經典；地理系口委必識，你的使用者評估承接此傳統。
- **來源**：✍️ 已引（本輪新增）
- **連結**：https://dl.acm.org/doi/10.1145/383259.383286

### P2-09　Touya, Zhang, & Lokhat (2019) — Is Deep Learning the New Agent for Map Generalization?
- **摘要**：綱領性地問「學習模型能否成為概括化的代理人」，盤點深度學習在概括化的可能與限制。Int. J. Cartography 5(2–3), 142–157。
- **關聯**：你的 LLM-in-the-loop 是同一問題在生成式世代的回答——把 LLM 章接上**地圖學自身的學術脈絡**（而非只掛 CS 系譜）的關鍵一環。
- **來源**：📁 `__Thesis/2019_*.pdf`（上層資料夾）｜✍️ 已引

### P2-10　Forsch, Kemna, Langetepe, & Haunert (2024) — Polyline Morphing for Animated Schematic Maps
- **摘要**：兩個示意佈局間的保約束動畫：保示意化、無自交、自包含、等速。J. Geovis. Spat. Anal. 8:37。
- **關聯**：版面切換轉場的升級路徑（7.2 節）；互補畫界已寫入 2.6。
- **來源**：📁 `related/`｜✍️ 已引
- **連結**：https://doi.org/10.1007/s41651-024-00198-w

### P2-11　*Graph Drawing for LLMs: An Empirical Evaluation*（2025）
- **摘要**：實證評估 LLM 在圖繪製任務的表現（評測型）。arXiv:2505.03678。
- **關聯**：LLM 論文的畫界對象之二。⚠️ 作者未查證。
- **來源**：🆕（書目待驗證）
- **連結**：https://arxiv.org/abs/2505.03678

### P2-12　Feng et al. (2023) — LayoutGPT: Compositional Visual Planning and Generation with LLMs
- **摘要**：LLM 以 style-sheet 形式的 in-context 示範直接規劃 2D 影像／3D 室內場景佈局。NeurIPS 2023。
- **關聯**：LLM 佈局生成先行者——但無拓撲約束；一句畫界即得（已寫入 2.5）。
- **來源**：✍️ 已引（本輪新增）
- **連結**：https://arxiv.org/abs/2305.15393

### P2-13　Yang et al. (2024) — MatPlotAgent（含 MatPlotBench）
- **摘要**：以 AI Agent 模擬人類繪圖流程做科學資料視覺化，並建 GPT-4V 評分基準（與人工高相關）。arXiv:2402.11453。
- **關聯**：LLM 比較（唯讀評審）的方法依據；「模型評模型可信嗎」的證據來源。
- **來源**：📄｜✍️ 已引

### P2-14　Chen et al. (2024) — VisEval
- **摘要**：NL2VIS 的評估基準：有效性、契合性、可讀性三面向。IEEE TVCG。
- **關聯**：同上，評估設計的第二支柱。
- **來源**：📄｜✍️ 已引

### P2-15　Hoffswell, Li, & Liu (2020) — Techniques for Flexible Responsive Visualization Design
- **摘要**：讓設計者同時編輯多版面版本並即時預覽的響應式視覺化設計工具。CHI 2020 Best Paper。
- **關聯**：「逐版面手工調適成本高」的證據——反襯你「重新求解」路線的動機（2.3.1）。
- **來源**：✍️ 已引（本輪新增）
- **連結**：https://idl.cs.washington.edu/files/2020-ResponsiveVis-CHI.pdf

### P2-16　Wu, Liu, Liu, & Ma (2013) — ViSizer: A Visualization Resizing Framework
- **摘要**：以知覺模型（feature congestion）建變形能量函數，自動 resize 視覺化並保護重要區域。TVCG 19(2), 278–290。
- **關聯**：「resize 即最佳化問題」先聲——你「版面一變即重解」立場的前驅（2.3.1）。
- **來源**：✍️ 已引（本輪新增）
- **連結**：https://ieeexplore.ieee.org/document/6189339/

### P2-17　van Dijk & Haunert (2014) — Interactive Focus Maps Using Least-Squares Optimization
- **摘要**：最小平方最佳化實現互動即時的道路網焦點放大，不裁脈絡不改地圖大小。IJGIS 28, 2052–2075。
- **關聯**：與你魚眼放大鏡同目標、不同作用層（原始道路網 vs 示意化整數格）——2.3.2 畫界。
- **來源**：✍️ 已引（本輪新增）

### P2-18　Furnas (1986) — Generalized Fisheye Views
- **摘要**：提出 degree-of-interest（DOI）函數的廣義魚眼理論：依「先驗重要性 − 與焦點的距離」決定每個元素的顯示程度。CHI '86, 16–23。
- **關聯**：你魚眼放大鏡的理論源頭（已補入 3.6 節）；focus+context 整個支系從這裡出發。
- **來源**：✍️ 已引（本輪新增）

### P2-19　Heer (2019) — Agency plus Automation: Designing AI into Interactive Systems
- **摘要**：以資料清理、探索式分析、自然語言翻譯三個系統為例，主張成功的 AI 互動設計在於讓演算法與人的**互補優勢**各就其位，同時保留人的掌控與技藝。PNAS 116(6), 1844–1850。
- **關聯**：6.4 節「兩類求解者分工」的思想框架——你把同一問題從「人 vs 機器」推到「確定性演算法 vs 語言模型」的層次；被問「你的分工哲學有何依據」時的第一答。
- **來源**：✍️ 已引（本輪新增）
- **連結**：https://doi.org/10.1073/pnas.1807184115

### P2-20　Horvitz (1999) — Principles of Mixed-Initiative User Interfaces
- **摘要**：混合主動介面十二原則：自動化應在效益明確時行動、在不確定時交還控制、並維持對話式的主導權轉移。CHI '99, 159–166。
- **關聯**：「模型不確定時由誰接手」的最早系統性論述——你的 harness（違規即退回、正確性不外包）是這條原則在演算法層的實作。
- **來源**：✍️ 已引（本輪新增）

### P2-21　Peucker, Fowler, Little, & Mark (1978) — The Triangulated Irregular Network
- **摘要**：提出 TIN——以不規則三角網表示地形，讓取樣密度隨地表複雜度變化，密處三角形小、平緩處三角形大，且相鄰三角形無縫銜接。ASP-ACSM Digital Terrain Models Symposium, 516–540。
- **關聯**：**3.2.1 節「為何是四邊形」的必要對照組**。該節論證四邊形在局部變動解析度下勝出，理由是可分離軸（版面＝x 分割 × y 分割）使局部縮放化約為兩個一維重配權，因而 H/V 方向與拓撲構造上守恆；TIN 則是空間自適應細分的標準解，在連續場上無縫變密更優，但無可分離結構、細分會改變邊的方向。**要說「四邊形較適合」，就必須先誠實交代 TIN 在什麼條件下較適合**——目前 3.2.1 是純論述、零引用，這是最容易被抓的一節。
- **來源**：🆕 新推薦（書目待驗證：1978 年會議論文，頁碼與會議全名引用前請核對）

---

## P3　選讀（文獻加厚與背景）

### P3-A　已在手邊或已引（讀過摘要、需要時精讀）

| 論文 | 一句摘要與關聯 | 來源 |
|---|---|---|
| Fähndrich (2025) 電網圖概括化，TU Wien 碩論 | 廊道建圖＋平行偏移；21.4% 失敗、近 2 小時——你的效能對照組＋電網擴充先行者 | 📁 related｜✍️ |
| Schönberger & Fach (2025) NeTEx → 數學圖 | 開放資料建圖管線（routing 目的）；印證「純管線」的發表天花板 | 📁 related｜✍️ |
| El Akra (2026) 黎巴嫩示意圖 inclusive design | 人工設計成本的當代實證——動機素材 | 📁 related｜✍️ |
| Cerović (2016) One Metro World | 示意圖標準化元件——動機章的重要引 | 📁 `data/thesis/One Metro World`｜📄｜✍️ |
| Jacobsen et al. (2021) MetroSets, TVCG 27(2) | 地鐵圖隱喻畫集合系統——示意語彙通用性 | ✍️ |
| Horak et al. (2021) Responsive Matrix Cells, TVCG 27(2) | 局部區域依空間與任務自適應——魚眼／權重欄列同族 | ✍️ |
| Yamamoto et al. (2009) Focus+Glue+Context, ACM GIS | 三區結構消除魚眼變形——放大鏡方法族 | ✍️ |
| van Dijk et al. (2013) 局部示意化突顯焦點, SIGSPATIAL | 示意化程度當變形手段 | ✍️ |
| Haunert & Sering (2011) 道路網焦點區域, TVCG | 區域縮放經典 | 📄｜✍️ |
| Ti & Li (2014) 擁擠區偵測放大, IJGIS | Ti 2015 前作 | 📄｜✍️ |
| Yu et al. (2020) 流量驅動道路概括化, IJGIS | 少數屬性驅動網絡概括化——你屬性概括化的近親 | 📄｜✍️（📁 上層資料夾有同名資料夾） |
| Bereuter & Weibel (2013) 四叉樹即時點概括化 | 網格層級驅動概括化 | 📄｜✍️ |
| Murase et al. (2015) 按需概括化導覽圖 | 依查詢語境動態決定顯示 | 📄｜✍️ |
| Touya et al. (2023) pan-scalar 迷航建模 | 版面／尺度變化破壞空間認知——守恆量立場的依據 | 📄｜✍️ |
| Schöttler et al. (2021) 地理網絡視覺化 survey | 「節點＋連結同時抽象化稀少」空缺引 | 📄｜✍️ |
| Nobre et al. (2019) 多變量網絡視覺化 survey | 網絡視覺化總覽 | 📄｜✍️ |
| Cartwright (2015) 重新定義「地圖」 | 圖表×地圖雙重性格 | 📄｜✍️ |
| Roberts (2014) 有效示意圖設計理論 | 設計準則張力 | 📄｜✍️ |
| Chivers & Rodgers (2014) 八向力導向＋心智地圖 | 力導向系補充 | 📄｜✍️ |
| Stott & Rodgers (2005) 自動地鐵圖技術 | 爬山前作 | 📄｜✍️ |
| Dwyer et al. (2008) 路徑簡化快速啟發式 | ⑦的快速版 | 📄｜✍️ |
| Maddigan & Susnjak (2023) Chat2VIS | NL2VIS 直接生碼路線 | 📄｜✍️ |
| Song et al. (2022) RGVisNet | 檢索＋生成混合 | 📄｜✍️ |
| Ye et al. (2024) GenAI4VIS 綜述 | 生成式 AI×視覺化分類框架 | 📄｜✍️ |
| Weiser (1991) 普適運算 | 動機章開場 | ✍️ |
| Bast et al. (2021) Flexible Base Grids, SSTD | ⑥的後續——彈性基底格網 | ✍️ |
| van Dijk & Lutz (2018) Realtime Linear Cartograms, SIGSPATIAL | 即時線性變形地圖——「即時」路線的前例 | ✍️ |
| Galvão et al. (2023) 車行路線＋街網示意化, CaGIS | 導航導向縮放的近作 | 📄｜✍️ |
| Takahashi et al. (2019) 漸進標籤＋心智地圖, IJACDT | 標籤問題的代表（你 out of scope 的依據） | 📄｜✍️ |
| Nickel & Nöllenburg (2020) Data-driven Multilinear, Diagrams | 多線性方向系統——期刊版見 P3-B | 📄｜✍️ |
| Craig & Liu (2019) 地鐵普適視覺化願景, PerCom | 動機章的普適運算橋 | 📄｜✍️ |
| Deng 2023／Feng 2022／Zhang 2020 三篇城市視覺分析 survey | 智慧城市動機的文獻底 | 📄｜✍️ |
| Rathore & Singhal (2024) 響應式 vs 自適應設計 | 行動裝置市佔論據 | 📄｜✍️ |
| Li, G. et al. (2024)／Li, S. et al. (2024) LLM 生成視覺化評估 | NL2VIS 評估近作兩篇 | 📄｜✍️ |
| Lowe (1993)／Woodward & Lewis (1998) | 「圖表」與「地圖」的定義源 | 📄｜✍️ |
| Hassan (2024) RAG／Agentic RAG 綜評 | 計畫書 AI 構想的來源（網媒文，博論版可考慮換學術引） | 📄｜✍️ |

### P3-B　新推薦、書目待驗證（⚠️ 引用前逐筆查證，勿照抄）

| 候選 | 為什麼要看 | 用在 |
|---|---|---|
| PlanarBench（arXiv:2606.02010） | LLM 平面圖繪製空間推理評測——消融梯度的外部對照 | 2.6／5.5 |
| Proteus（arXiv:2604.23299） | 桌機→手機視覺化多層智慧調適——responsive 自動化最新 | 2.6 |
| Automated Responsive Thematic Mapping（arXiv:2606.12008） | 響應式主題地圖首個演算法框架 | 2.6 |
| MetroGNN（arXiv:2403.09197） | RL 路網擴建——「網絡設計 vs 佈局繪製」畫界 | 2.6 |
| Nöllenburg (2014) 地鐵圖佈局方法綜述（書章） | 佈局方法系統性綜述——文獻加厚 | 2.2 |
| Nickel & Nöllenburg (2024) Data-driven Multilinear Metro Maps, Cartographic J. | 你引的 2020 是短文版；期刊完整版查證後升級（https://doi.org/10.1080/00087041.2024.2304476） | 2.1 |
| Kopf et al.（約 2010）Automatic Generation of Destination Maps, SIGGRAPH Asia | LineDrive 後繼 | 2.4 |
| CartoAgent／MapGPT／MapMate／TransitGPT（2024–2025） | LLM×製圖 agent 最新一批——挑 1–2 篇入畫界 | 2.5／2.6 |
| GeoAI for Map Generalization: Research Agenda（IJGIS 2026） | 把你的工作掛上地理學界最新路線圖 | 2.4／7.2 |
| Deep Learning in Automatic Map Generalization: Achievements and Challenges（2025 綜述） | Touya 2019 之後的進展 | 2.4 |
| Ovenden, *Transit Maps of the World*（書） | 全球示意圖設計史料 | 2.1 |
| MacEachren (1995) *How Maps Work* | 地圖認知理論根基——地理系口委視角 | 2.1／2.4 |
| McMaster & Shea (1992) *Generalization in Digital Cartography* | 概括化理論經典 | 2.4 |
| Töpfer & Pillewizer (1966) radical law | 概括化選取量古典定律 | 2.4 |
| Sweller（1988 起）認知負荷理論 | 使用者實驗理據 | 5.6 |
| Ware, *Information Visualization: Perception for Design* | 感知設計原則——測驗題設計 | 5.6 |
| Dibia (2023) LIDA, ACL demo | LLM 生成視覺化代表工具 | 2.5 |
| Luo et al., nvBench | NL2VIS 標準基準 | 2.5 |
| Wang et al., Data Formulator（TVCG 2024？） | AI 輔助圖表製作近期代表 | 2.5 |
| Gruget et al.（約 2023）pan-scalar maps 概念論文 | 跨尺度地圖概念源頭 | 2.3.3 |

### P3-C　領域缺口候選（本輪盤點新增，⚠️ 全部書目待驗證）

先前清單較弱的四個領域——空間認知、圖繪製美學實證、標籤、計算幾何示意化——的補強候選：

| 候選 | 為什麼要看 | 用在 |
|---|---|---|
| Tversky（1993）Cognitive Maps, Cognitive Collages, and Spatial Mental Models, COSIT | 空間記憶系統性扭曲的經典——示意圖扭曲與認知扭曲的對話 | 2.3.3／5.6 |
| Cabello, de Berg, & van Kreveld（約 2005）Schematization of Networks | 示意化的計算幾何形式化——2–3 方向折線的可行性判定 | 2.2／6.1 |
| Garland（1994）*Mr Beck's Underground Map*（書） | Beck 圖的權威史料 | 1.1／2.1 |
| Purchase（1997 起）圖繪製美學準則實證系列 | 「美學準則→可讀性」的實驗傳統——爬山準則的實證根 | 2.2／5.6 |
| Archambault & Purchase（約 2013）動畫與心智地圖實驗 | 佈局變動時心智地圖保持的實證——版面切換動畫的依據 | 2.3.3／7.2 |
| Niedermann & Haunert（約 2019）地鐵圖標籤系列 | 標籤問題近作——out of scope 聲明的支撐 | 1.4／7.2 |
| Sarkar & Brown（1994）Graphical Fisheye Views | Furnas 之後圖形魚眼的實作經典 | 3.6 |
| Newton & Roberts 後續跨城可用性研究 | Roberts 2013 的跨城延伸 | 5.6 |
| Bast, Brosi, & Storandt（2019）Efficient Generation of Geographically Accurate Transit Maps, ACM TSAS | LOOM 期刊版——定量對比實驗的直接對象 | 5 章對比實驗 |
| Li & Openshaw（1993）natural principle 概括化 | 概括化的自然法則——理論加厚 | 2.4 |
| Mackaness, Ruas, & Sarjakoski（2007）*Generalisation of Geographic Information*（書） | 概括化理論手冊 | 2.4 |
| Montello（2002 前後）空間認知與製圖綜述 | 地理系口委視角的認知底 | 2.3.3 |
| nvBench 2.0／VIS 2025–2026 LLM×vis 新批 | 投稿前的最新畫界掃描 | 2.5／2.6 |
| Amershi et al.（2019）Guidelines for Human-AI Interaction, CHI | 人機互動設計準則 18 條——LLM 功能的介面設計依據 | 6.4 |
| Shneiderman（2020）Human-Centered AI／*Human-Centered AI*（書） | 「高自動化＋高人類控制」二維框架——你 harness 立場的定位 | 6.4 |
| Garcez & Lamb（2023）Neurosymbolic AI: The 3rd Wave | 神經符號整合綜述——AlphaGeometry 式架構的理論家族 | 6.3 |
| Mixed-Initiative Visual Analytics 綜述（arXiv 2025） | 混合主動在視覺分析的最新盤點 | 6.4 |

---

## 建議閱讀順序（給接下來四週）

1. **第一週（口試核心）**：P1-01、P1-06（survey 先建地圖）→ P1-07、P1-08（兩個最強鄰居）→ **P1-13（Guo「地圖效應」——最容易被口委問到「你的圖會不會誤導人」）**
2. **第二週（方法防禦）**：P1-02、P2-06、P2-07（求解器與理論定位）→ P1-11、P2-09（LLM 架構的兩條譜系）→ **P2-19、P2-20（Heer／Horvitz：6.4 節「兩類求解者分工」的思想框架）**
3. **第三週（實驗設計）**：P1-10、P2-08（使用者實驗方法）→ P1-09、P2-15、P2-16（響應式理論）→ P2-18（Furnas 魚眼理論）
4. **第四週（畫界收尾）**：P1-12、P2-10〜P2-12（LLM×佈局近鄰新作）→ P3-B／P3-C 逐筆驗證書目

> **口試前一週的最小集**：若時間只夠讀五篇——P1-01（Stott）、P1-07（Brosi & Bast）、P1-08（Ti）、P1-13（Guo）、P1-11（AlphaGeometry）。這五篇分別對應：你的方法母體、最強鄰居、命題原提出者、行為證據、LLM 架構先例。

---

<sub>本文件最後更新：**2026-08-04**。</sub>
