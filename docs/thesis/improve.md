# 論文改善建議

> 目標等級：IEEE TVCG／IEEE VIS full paper・2026 年 7–8 月
> 本文件依 2024–2026 文獻掃描結果撰寫，與 `paper.md`（論文本文）搭配閱讀；各節建議均標明對應的論文章節與具體改法。
> **對照基準**：系統與 `paper.md` 末註 **2026-08-12**（骨架進 1 RAW MAPS、一個 json 一個圖、railway 9 系統、frameParity 980、衍生資料全球保留（2026-08-07）、13 個語言模型三支 CLI）。舊稱 `cell`／`map`／`hc` 鏈夾已退役——一律用 `llm-skeleton2grid`／`llm-working2grid`／`network-loop`。

---

## 0　等級分流：博士論文必要 vs TVCG 加分

本文件多數建議以 TVCG 為標尺；若目標先設定在**通過博士論文口試**，優先序如下。原則：口試委員抓的是「RQ 有沒有回答、論文有沒有完整」，不是「有沒有打贏 Bast & Brosi」。

### 博論必要（沒有就過不了口試）

| # | 項目 | 現況（2026-08-04） | 差距 |
|---|---|---|---|
| 1 | **使用者實驗（RQ2）** | 只有設計與假設，無數據 | 三個 RQ 缺一個實證答案，口委必抓。二選一：執行 5.6 節實驗（30 人可縮到 20–24 人先做）；或正式改寫 RQ 結構把 RQ2 降為探索性——但計畫書已承諾，降級需在口試前與指導教授確認 |
| 2 | **圖表** | 已有 5 張（2026-07-25：管線四階段、旋轉變體、九演算法鏈＋LLM 並列、Frame 前後、爬山改善率分佈） | 尚缺：版面響應序列（同城 4 artboard）、movewise 單步 before/after、LLM 迭代示意、Stage 4 權重／魚眼。**旋轉變體已自計算清單移除**——既有「旋轉變體」圖改標「歷史快照」或重製為來源軸（grid／llm-skeleton2grid／llm-working2grid）對照 |
| 3 | **章節厚度** | 約 **1.7 萬**中文字（濃縮完整版；paper.md 末註） | 中文博論典型 6–10 萬字。現稿當骨架逐章擴寫：第二章逐篇深入、第三章補虛擬碼與逐步圖例、第四章補架構圖／命名鐵律／一個 json 一個圖／Skill 呼叫圖、第五章補完整指標表 |
| 4 | **文獻回顧厚度＋地理學定位** | 57 筆（2026-07-25 補入 7 筆已驗證），CS 味仍重 | 博論文獻常需百筆上下；續補第 10 節 B 表＋2024–2026 NL2VIS。地理系口委會問製圖學／空間認知定位：概括化理論、心智地圖、認知負荷要加厚 |
| 5 | **LLM 消融待整理** | 現有 13 模型跨模型 enforced 樣本（`llm-skeleton2grid` 47 份／`llm-working2grid` 46 份）；全量指標（爬山改善率中位 55.2%、循環後 H/V 80.7% vs 84.8%）已量測；**LLM 消融指標表**（合法率／H/V／格數／耗時同一組）尚待整理成對照表 | 補齊跨模型指標表；擴大 L1/L2 城數；另三層消融（harness／context／loop）待補 |

### 博論加分、TVCG 必要（口試沒有也能過）

- 與 LOOM／Bast 管線的定量對比（第 5 節第 2 項）
- LLM 消融的**其餘三層**（harness／context／loop）＋把跨模型樣本整理成**同一指標對照表**（第 3 節）——graph 層 4 城表＋13 模型 enforced 樣本已有，被問到 3.7.2／5.5 已能答骨架；缺的是「表格式跨模型」與另三層
- 與最佳解差距（optimality gap）
- Benchmark 正式發布（DOI／datasheet）——博論寫「規劃中」即可

### 兩邊都受用、成本低（建議直接做）

- 完成：2.6 畫界節——已寫入 paper.md
- 完成：失敗案例分析——已寫入 paper.md 5.4 節
- 完成：資料管線重新定位（方案 A＋B）——貢獻 4＝MetroBench（v1/2026-07）、5.3 節資料品質收斂
- 完成：術語定義——1.1「示意圖」統一定義（全文逐句換詞仍待擴寫時做）
- 完成（2026-08）：paper.md 已校對骨架＝Stage 1b、`layerRegistry` 圖層代碼、一個 json 一個圖、railway 9、LLM 執行者組成與衍生資料保留政策
- 完成（系統側＋論文）：Skill 呼叫圖分頁＋與資料流同 code／階段色；文件頁選單分流（系統內容 ≠ 資料流／Skills）；**`paper.md` 4.3 節**已寫「資料流圖／呼叫圖／Skills」與選單分流
- 審稿人／口委攻擊預備答案（第 2 節）——口試前做成 Q&A 卡

### 0.1　系統已到位、論文還要寫進正文的（擴寫清單）

口試被問「系統長怎樣」時，下列已在碼與系統介紹／架構頁，但 `paper.md` 尚薄或未成獨立小節——擴寫第四章時優先補：

| 主題 | 系統現況 | 論文建議落點 |
|---|---|---|
| 骨架地圖屬 Stage 1 | `1-raw-maps/skeleton/`；Stage 2 只做網格化 | 3.4／圖 3-1 已改；圖說與投影片同步檢查 |
| 一個 json 一個圖 | `{鏈}/`・`network-loop/`・`llm-network-loop/` 各一檔；endp／line／gather 不落檔 | 4.2 已述；第五章指標表註明讀的是哪種子夾 |
| 消融來源命名 | `llm-skeleton2grid`／`llm-working2grid`（舊 cell／map 退役） | **3.4／3.7.3 已改**；投影片來源軸已同步；擴寫時再掃圖說 |
| 模型標註保證 | `LLM_ENFORCED_MODEL`＋`executor: enforced\|declared\|batch`；batch-hvd ≠ 模型 | 5.1 已揭露；跨模型表**只收 enforced** |
| 三支 CLI × 13 模型 | claude／cursor-agent／dsc；後兩支無 Skill 工具、提示詞自動改寫 | 4.x 補半頁「執行器」；模型無關性實驗設計依此 |
| frameParity 980 | 全球 599 城全量（2026-08-07 重存） | 可重現性／回歸測試寫進 4.2 或附錄 |
| Skill 66 支＋呼叫圖 | 資料流內／管線外約各半；呼叫圖每支恰一次 | **4.3 已寫**；4.5 skill 數已改 66 |

---

## 1　相似論文與畫界策略

掃描結論：**沒有任何一篇同時做到「示意圖佈局 × 響應式版面 × 屬性概括化 × LLM-in-the-loop」的組合**，但每個維度都有強鄰居。Related work 不能只是列出他們，必須替每一篇寫好「畫界句」——審稿人第一輪一定會拿這些來挑戰。

| 相似論文 | 重疊維度 | 建議畫界句（寫進 2.6／related work） |
|---|---|---|
| Bast & Brosi，*Large-scale Generation of Transit Maps from OpenStreetMap Data*（Cartographic J. 2024；最強鄰居） | OSM → 全球規模自動示意圖 | 「該工作以求解器離線生成全球轉乘圖，輸出為固定版面的靜態地圖；本研究的目標相反——版面是輸入變數，每次顯示都在新像素座標重新求解，且以屬性重要性驅動概括化。」 |
| Ti, Li & Xu（2015） | 「adaptive to display sizes」命題的原提出者 | 「其方法離線單次生成、只縮放線段而不處理車站分佈，亦無互動；本研究把同一命題推進到互動即時、多位置縮放、拓撲守恆的層級。」 |
| *How well will LLMs perform for graph layout tasks?*（Visual Informatics 2025）、*Graph Drawing for LLMs*（arXiv 2025）、PlanarBench（arXiv 2026） | LLM × 圖佈局 | 「既有工作為評測型——問 LLM『能不能』排版；本研究提出生產型架構——讓 LLM 在確定性 harness 內『安全地』參與排版，並系統化其工程方法。」 |
| Proteus（arXiv 2026）、*Automated Responsive Thematic Mapping*（arXiv 2026） | responsive visualization 自動化 | 「對象為統計圖表與主題地圖；網絡示意圖因拓撲約束與線路連續性，其響應式重排是質上不同的問題。」 |
| MetroGNN、RL transit network design（2024–2025） | 學習方法 × 捷運網絡 | 「該系列處理網絡設計（線路規劃），本研究處理既有網絡的佈局繪製，兩者輸入輸出均不同。」 |
| Forsch et al.（2024），*Polyline Morphing for Animated Schematic Maps*（J. Geovis. Spat. Anal.；Haunert 團隊） | 示意圖狀態間動畫 | 「其 morphing 假設兩端佈局已給定且拓撲對應；本研究的版面切換為重新求解、兩端折線結構未必對應——互補而非競爭，且提供轉場升級的後續路徑。」（✅ 已寫入 2.6／7.2） |
| Fähndrich（2025），電網圖概括化（TU Wien 碩論，Nöllenburg 指導） | 網絡概括化泛化 | 「其逐域客製管線報告 21.4% 失敗率與近兩小時運行——本研究秒級全量收斂的天然對照組；電網是統一 schema 通用主張的下一個試金石。」（✅ 已寫入 2.4／7.2） |
| Schönberger & Fach（2025），NeTEx → 數學圖（Transp. Res. Procedia） | 開放資料建圖管線 | 「目的為路徑計算而非視覺化、無品質收斂機制；其發表層級（Procedia）也印證『純資料管線當主貢獻』的天花板——支持本研究改包裝為 benchmark 的決策。」（✅ 已寫入 2.6） |
| El Akra（2026），黎巴嫩示意圖 inclusive design（設計碩論） | 人工設計實務 | 非競爭；當**動機素材**——沒有官方示意圖的地區要以月計人工專案才得一張圖，自動生成的價值實證。（✅ 已寫入 1.1） |

**行動**：在 `paper.md` 2.6 節（研究空缺總結）前新增一小節「2.6 近期相關工作與本研究之區隔」，收錄上表五句畫界；第一章動機末段補一句「LLM × 圖佈局的評測研究正快速出現，但生產性架構仍缺席」以強化時效性。

---

## 2　原創性評估

**整體判定：中高。**（2026-07-26 以 `data/thesis/related/` 五篇複核：五篇分別覆蓋資料層、靜態生成、狀態間動畫、概括化泛化、人工設計，**無一觸及 movewise 可稽核壓縮、響應式屬性示意圖、LLM-in-the-loop 三個核心主張——判定不變**。） 「示意圖佈局 × 響應式版面 × 屬性概括化 × LLM-in-the-loop」的組合無人做過，但組合式原創需要每個組件都站得住——逐維度評估如下：

| 維度 | 原創性 | 依據 | 風險 |
|---|---|---|---|
| movewise 四步鏈（可稽核壓縮 local search） | **高** | 「每種移動守單調不變式＋每步後全域壓縮＋每個單一移動可重播」——未找到相近工作；可稽核性當一級設計目標是 VIS 社群會買單的角度 | 需補與最佳解差距的量化，否則「為何不用求解器」難擋 |
| LLM-in-the-loop 確定性把關架構 | **高（時效性最強）** | LLM × graph layout 目前只有評測型論文（能不能排版），沒有生產型架構（怎麼安全參與排版）；五層工程論述是首個系統化，且 graph 層已有消融數據佐證（5.5 節） | 窗口約 1–2 年，晚了會被搶；其餘三層消融待補 |
| **AI Agent 屬性的精確界定（3.7.0 節）** | **中高** | 正面回答「這算不算 agent」：分執行實例層與系統架構層（單一代理多角色，非多代理），並給出**九個 LLM 功能**的 agentic 程度分級；以確定性驗證器取代 Evaluation Agent、以指紋取代 RAG 是有論證的設計改動 | 「多代理協同」未實作，已列限制（6.5 (9)／7.2 (7)） |
| **「契約固定、方法不固定」的方法論界線＋觀察—固化路徑** | **高（本輪新增，最被低估的一項）** | 3.7.4／6.4 節：明確拒絕把 LLM 功能當演算法、拒絕與①〜⑨並列比較，並以 transcript 實證模型每次自創策略；再由此導出「LLM 作為演算法的**發現**工具」——把模型收斂的策略（保距量化＋貪心吸附）回收為確定性第九鏈。多數 LLM 應用論文迴避這個界線，本文正面處理且給出可操作準則 | 需補「同城重跑的策略穩定性與結果變異數」量測（6.5 節限制 (8) 已自陳）；否則「方法不固定」只有質性 transcript 證據 |
| **消融梯度（L0/L1/L2）本身** | **中高（可獨立成一節論述）** | 「把管線逐級交還給模型、量測合法性崩潰點」的設計，在 LLM×layout 文獻中未見；結論可操作（拓撲收縮＝分界線） | 指標表仍僅 4 系統；跨模型檔已有但未收成同指標表。**台北 L2 異常**驗證：對更多含環線城跑 L2（`llm-working2grid`；版控外城需先重跑管線）。優先高雄矩形（已有衍生）再擴外城 |
| 九篇經典同約束並列重實作＋全量（599 系統） | **中高** | 統一輸入、統一硬規則下的全量比較無前例，比較研究本身可發表 | Bast & Brosi 2024 已佔「planet-scale from OSM」名分，畫界句必須到位 |
| 響應式屬性示意圖（版面即輸入、像素座標重解） | **中高** | Ti 2015 之後此命題幾乎無人推進；responsive vis 自動化 2026 熱題但無人做網絡示意圖 | 「有助理解」的主張必須有使用者實驗數據 |
| 資料管線 | **中（不宜獨立當貢獻）** | 見第 4 節重新定位方案 | 直接當貢獻會被打 "engineering effort" |

### 2.1　為何是「中高」而非「高」：「中」的四個來源

評級的「中」不是修辭保守，有四個具體來源；前三個可修、第四個是結構性的：

1. **組合式原創天生打折（結構性）。** 總主張「示意圖佈局 × 響應式 × 屬性 × LLM 的組合無人做過」為真，但每個維度都不是本研究開創的問題——響應式示意圖是 Ti (2015) 立題、propose-and-verify 是 AlphaGeometry 級工作立範式、正交壓縮是 Tamassia (1987) 立題。本研究的類型是**推進**（推到無人到過的位置）而非**開創**（定義新問題／新定理／新範式）；審稿人對前者的標準評語是 "novel combination of existing ideas"。

2. **理論貢獻缺席（可修）。** movewise 的收斂證明靠「有下界的單調量必停」——初等論證，非定理；無近似比、無複雜度結果、無「響應式示意佈局」問題類的形式化定義。理論派審稿人看到的是 "a carefully engineered heuristic"。此領域的「高」通常需要一條可證明的性質或一個被形式化的新問題類。

3. **評的是「現有證據守得住的原創性」（可修，最大單一來源）。** RQ2 零數據、消融僅 4 系統單一模型、optimality gap 未量化、與 LOOM 零對比——未證實的主張在審稿人眼中自動降級。構想層面的原創性可以更高，但評級必須以證據為準。

4. **窗口依賴（可修，靠速度）。** LLM-in-the-loop 的「第一個」地位依賴他人尚未發表，一篇搶先就蒸發一半——時間貼現的原創性必須保守計。

**升級到「高」的路徑（依槓桿排序）**：①使用者實驗數據（補最大證據洞）→ ②optimality gap 量化＋「響應式示意佈局」的形式化問題定義（給 movewise 理論骨頭，哪怕一條「收斂到某類局部最優」的引理）→ ③消融擴樣本＋跨模型 → ④benchmark 發布並被引用。完成 ①② 即可改評「高（證據完備的組合式原創）」。

**校準**：「中高」在博士論文分佈中是好位置——多數通過口試的博論在此，「高」保留給定義領域的工作。問題不是原創性不夠畢業，是證據未追上構想。

**審稿人最可能的四發攻擊與預備答案**：（1）「與 Bast/Brosi 差在哪」→ 版面是輸入變數＋屬性概括化＋可稽核，佐以定量對比；（2）「LLM 部份是不是 gimmick」→ 消融實驗顯示 harness／context 各自貢獻；（3）「adaptive 有沒有用」→ 使用者實驗 H1–H3；（4）「**模型一直在進步，這篇會不會很快過時**」→ 這是 LLM 應用論文的標準殺招，本論文有構造性答案（paper.md 3.7.2 節）：貢獻是分工介面的設計而非模型能力快照——正確性下界由純演算法保證、harness 使模型參與只能單調向上、五層工程與模型解耦；每一代新模型是同一 harness 下的免費重測，跨代曲線本身就是實證數據。前三者在第 5 節必補清單內，第四者需配跨模型重測實驗（見第 3 節）。（6）「**計畫書說要做 AI Agent 與 RAG，你的 agent 在哪、RAG 在哪**」→ 3.7.0 節逐項回答：每次執行都是 agent 實例（自主性／感知—行動迴圈／方法自定三判準皆具備），但架構是單一代理多角色而非多代理協同；Evaluation Agent 換確定性驗證器、RAG 換指紋結果檔，兩者都是「把可靠性從模型判斷移向可驗證機制」的設計決策；唯一未實作的多代理協同已列限制與未來工作。（5）「**你的 LLM 鏈根本不是演算法，怎麼跟①〜⑨比**」→ 本論文**主動先講**：3.7.4 節明言「契約固定、方法不固定」、刻意不編號為⑨、6.4 節給出兩類求解者的選用準則、6.5 節限制 (8) 自陳快照級可重現性——把最可能的攻擊轉為誠實性加分。這是目前防禦最完整的一項。

---

## 3　三個核心主張的強化

| 主張 | 現況 | 強化建議 |
|---|---|---|
| movewise 四步鏈 | 有收斂論證與全量數據 | 把「可稽核性（auditability）作為演算法設計的一級目標」明確立為主張；補「與最佳解差距」的定量實驗（小網格窮舉最佳解 vs 四步鏈結果）讓 local search 的犧牲可量化 |
| LLM-in-the-loop | 五層工程＋模型無關性（3.7.2）＋圖工程消融（3.7.3／5.5：L0/L1/L2；L1＝`llm-skeleton2grid`、L2＝`llm-working2grid`）＋**13 模型 × 三支 CLI**＋`executor: enforced` 機制 | **已完成**：graph 層 4 城指標表；消融來源夾跨模型 enforced 樣本（skeleton-grid 47／working-grid 46 份，涵蓋 13 模型）。**待補**：（1）把跨模型樣本收成**同一組指標的對照表**（合法率／H/V／格數／耗時），勿只報檔案數；（2）擴大 L1/L2 **指標表**城數；（3）**另三層消融**（harness／context／loop）；（4）**策略穩定性**——同城同 prompt 重跑 N 次；（5）**觀察—固化**——保距量化＋貪心吸附寫成**新的**確定性鏈（≠已存在的⑨彈性格網），與排名吸附全量對比 |
| 九篇經典並列比較 | 全量 599 系統結果；⑨彈性格網已含在全量視圖中 | 定義統一指標組；產出逐城表與統計檢定；「依城市特性擇鏈」升級為可檢驗分類 |

---

## 4　資料管線的重新定位（回答「不好當貢獻要怎麼改」）

**問題診斷**：「我們建了一條資料管線」是工程敘述，不是研究主張——它沒有研究問題、沒有可否證的結果，而且 Bast & Brosi（2024）已佔「planet-scale transit maps from OSM」的名分。直接當貢獻，審稿人一句 *"engineering effort, not a research contribution"* 就能打掉。但管線本身價值很高，問題只在**包裝的類型錯了**。四個重新定位方案，可並用：

### 方案 A（主推）：改包裝成公開 Benchmark

把「管線」改成「**第一個全球尺度示意圖佈局基準資料集**」：統一 schema（**599 系統**）、附驗證報告與逐城指標、附**九條**演算法鏈基準結果。Benchmark 是視覺化社群認可的貢獻類型——貢獻主張從「我們建了管線」改成「**我們使公平比較成為可能**」：

> 修改前（第七章貢獻 4）：「開放可重現的資料管線：全球路網資料的 fetch ⇄ audit 閉環……」
> 修改後（paper 已採此方向）：「**MetroBench（暫名）：全球尺度示意圖佈局基準**——統一 schema 的城市系統資料集（**599 系統**）、資料品質不變式與驗證報告、九種經典演算法的基準結果與統一指標……」

配套動作：DOI＋datasheet；datasheet 註明 railway 於 2026-08-02 收斂為台＋日 9 系統、衍生結果預設只烘焙示範城。比較實驗＝benchmark 示範應用。

### 方案 B：提煉成可量化的方法論結果

如果要保留「管線」的敘述，就必須讓它有**結果**而不只有流程。fetch ⇄ audit 閉環其實是「資料品質收斂程序」，可以量化：

- audit 迭代輪數與 error 數下降曲線（逐城）；
- 對 Wikipedia 基準的覆蓋率（目前 228/233，未匹配 5 個）與逐線站數準確率；
- 人工裁決（override）的數量、類型分佈、重放成功率——「人工判斷可重放」是可檢驗的性質。

把這些畫成圖表放第五章，管線就從工程敘述變成「資料品質收斂的實證研究」。

### 方案 C：重新定位為「圖工程層」（graph engineering for LLM）

呼應 3.7.1 節：LLM 能參與佈局的前提是圖已被工程化（拓撲收縮、座標整數化、不變式明文化）。把資料管線納入這個論述——**管線不是獨立貢獻，而是 LLM-in-the-loop 架構的必要組件**（graph engineering 層的實作）。這樣它依附在主張 3 之下，不需要獨立辯護。

### 方案 D：降級為可重現性聲明

最保守：正文 4.2 節壓縮成半頁，細節全部移到 supplementary material 與開源 repo，貢獻列表刪去第 4 條、改為三個貢獻。版面讓給演算法與評估。TVCG 頁數緊時這是務實選擇。

**建議組合**：博士論文用 A＋B（benchmark 當貢獻 4、量化結果進第五章）；TVCG 主論文用 C＋D（管線半頁帶過、benchmark 另投 dataset/short paper track）。

---

## 5　TVCG 必補清單（依優先序）

1. **使用者實驗執行**（最高優先）：5.6 節目前只有設計。TVCG 對「adaptive/responsive 有助理解」的主張幾乎必然要求實證；30 人 × 3 地圖 × 3 裝置的設計已足，需 IRB、預註冊假設、效果量與檢定。
2. **與 LOOM／Bast 管線的定量對比**：同一城市集合上比較輸出品質（彎折、H/V、面積、拓撲錯誤）與時間。沒有這個對比，「為什麼不用現成求解器」會是每一輪審查的必問題。
3. **LLM 消融**（見第 3 節）：graph 層 4 城表＋跨模型 enforced 樣本已有；尚缺**跨模型指標表**、harness／context／loop 三層、策略穩定性。引用成績時一律過濾 `executor !== 'enforced'`（含禁止把 `batch-hvd` 當 LLM）。
4. **與最佳解的差距**：小規模網格上窮舉或 ILP 求最佳，量化四步鏈的 optimality gap。
5. **失敗案例分析**：5.4 節已有架構；可補更多 forced／退回案例截圖（衍生資料全球保留，任一城均可取用）。

---

## 6　建議論文題目（IEEE VIS／TVCG 等級）

### 主論文（系統＋演算法，投 TVCG 或 VIS full paper）

**主推：**

> **Re-solving on Every Screen: Auditable Movewise Compaction for Responsive Attribute-Aware Metro Maps**
> （每次版面都重新求解：可稽核的 movewise 壓縮與響應式屬性地鐵圖）

備選同軌：
- *Adapt-Metro: Deterministic and Stepwise-Auditable Layout of Responsive Schematic Transit Maps at Global Scale*
- *From Geography to Any Display: A Compaction-First Pipeline for Responsive Schematic Network Maps*

### LLM 論文（時效最高，建議先投）

> **Proposals from the Model, Legality from the Rules: LLM-in-the-Loop Layout for Schematic Maps**

備選：
- *Prompt, Context, Harness, Loop, Graph: Engineering LLMs into a Deterministic Metro Map Pipeline*

### 比較研究／Benchmark（投 CGF／EuroVis／PacificVis 也適合）

> **Nine Classics on One Grid: A Unified Re-implementation and Global-Scale Comparison of Octilinear Metro Map Algorithms**

命名原則（供自行調整時參考）：主標語式短句放記憶點（re-solving／auditable／proposals from the model）、副標放可檢索關鍵字（responsive、schematic/metro map、LLM-in-the-loop、compaction）；避免「A Study of / Towards」開頭的弱框架；博士論文題目《自適應版面的地理空間網絡資料視覺化》維持不變，三篇即三個貢獻章的發表版。LLM 論文標題勿暗示「與①〜⑨並列的第十條演算法」——與 3.7.4 界線一致。

---

## 7　投稿拆篇策略

| 篇 | 內容 | 目標 | 時機 |
|---|---|---|---|
| 主論文 | movewise 四步鏈＋響應式管線＋使用者實驗 | TVCG／IEEE VIS | 使用者實驗完成後 |
| LLM 論文 | 提案-把關架構＋五層工程＋消融（含跨模型 enforced 表） | VIS／EuroVis（或 CHI，若偏互動） | **最優先**——LLM×layout 目前只有評測論文，窗口約 1–2 年；材料半成品（4 城表＋13 模型樣本），差指標表與另三層 |
| Benchmark | MetroBench 資料集＋**九鏈**基準結果（①〜⑨） | VIS short／dataset track、PacificVis | 可與 LLM 論文並行；發布包標明 599 系統覆蓋 |

拆篇後博士論文結構不變——三篇即三個貢獻章的發表版。**具體期刊選擇、篇幅換算與投稿時程見第 11 節。**

---

## 8　寫作面改善

- **摘要**：目前偏長（敘述四項貢獻），TVCG 版壓到 200 字內、只留一個核心主張＋最強數字（全量收斂 599 系統、零交叉、42.9% 直線化提升或 55.2% 中位改善率）。
- **圖**：`figs/` 已有 5 張；尚缺 movewise 單步、版面響應序列、LLM 迭代、權重／魚眼。衍生資料全球保留（2026-08-07），任一城均可取用。旋轉變體圖改標歷史快照或重製為來源軸對照。
- **限制誠實度**：6.5 節已列多項（含 LLM 方法不固定、batch-hvd、旋轉移除、⑨未入全量統計）——保持並隨系統改動更新編號。
- **一致性**：統一「示意圖（schematic map）」；掃殘留 `cell`／`map`／`hc` 鏈／「直接網格／直接成圖」舊稱；程式網絡循環結果稱 `network-loop`（勿與爬山法 `hillClimb` 模組混淆）。
- **模型無關性主張的三條措辭紅線**（3.7.2）：
  1. 單調性只對接受準則定義的目標函數成立——不可寫成「品質必然變好」。
  2. 無關的是架構與正確性語意，不是實驗數據數值。
  3. 跨模型**指標表**齊備前，主張仍偏論述；檔案數≠證據。只引用 `executor === 'enforced'`。
  可引 AlphaGeometry（Trinh et al., Nature 2024）作 propose-and-verify 先例——書目已驗證入稿。

---

## 9　本文件與論文／系統的同步

採納任一建議修改 `paper.md` 後，請同步：（1）論文投影片（`data/docs/thesis/index.html`）；（2）**系統介紹**（`data/docs/system/intro/index.html`）與**系統架構**（`data/docs/system/architecture/`）——後兩者在 2026-08 已有一輪對齊，改管線時勿只改論文；（3）本文件勾銷已完成項。`paper.md` 末 `<sub>` 修訂紀錄加一行。

**已對齊（2026-08-04）**：系統架構頁已改寫文件選單分流、來源代碼、ER／`alignOf`／`rm` 重跑規則，與 `docMenu.js`／`paper.md` 4.3 一致。

---

## 10　建議新增引用清單

依用途分類；「完成」＝書目已逐筆驗證（並已寫入 `paper.md` 正文與參考文獻），「待補」＝推薦引用但**書目未驗證**——寫入前務必先查證卷期頁碼與作者，嚴禁直接照抄本表。

### A　已驗證、已入文稿（2026-07-25 本輪）

| 文獻 | 用在 | 為什麼要引 |
|---|---|---|
| Hoffswell, Li, & Liu (2020), *Techniques for flexible responsive visualization design*, CHI '20（Best Paper） | 2.3.1 | 響應式視覺化「編輯工具」代表作——多版面同時編輯；證明響應式設計成本高到需要工具，反襯本研究「重新求解」路線 |
| Horak, Berger, Schumann, Dachselt, & Tominski (2021), *Responsive matrix cells*, TVCG 27(2), 1644–1654 | 2.3.1 | 「局部區域依可用空間與任務改變表徵」——與本研究魚眼／權重欄列同族的 focus+context 思想 |
| Wu, Liu, Liu, & Ma (2013), *ViSizer*, TVCG 19(2), 278–290 | 2.3.1 | 「resize 即最佳化問題」的先聲（知覺模型驅動的變形能量函數）——本研究「版面一變即重解」立場的直接前驅 |
| van Dijk & Haunert (2014), *Interactive focus maps using least-squares optimization*, IJGIS 28, 2052–2075 | 2.3.2 | 即時互動的焦點放大、不裁脈絡不改地圖大小——與魚眼同目標但作用於原始道路網 |
| van Dijk, van Goethem, Haunert, Meulemans, & Speckmann (2013), *Accentuating focus maps via partial schematization*, ACM SIGSPATIAL | 2.3.2 | 「局部示意化」突顯焦點——示意化程度本身當變形手段 |
| Roberts, Newton, Lagattolla, Hughes, & Hasler (2013), *Objective versus subjective measures of Paris Metro map usability*, IJHCS 71(3), 363–386 | 5.5 | 示意圖可用性研究的方法標竿：客觀績效與主觀偏好會解離——正是本研究問卷「績效＋評價」雙軌設計的理據 |
| Trinh, Wu, Le, He, & Luong (2024), *Solving olympiad geometry without human demonstrations*, Nature 625, 476–482 | 6.3 | AlphaGeometry＝「模型提案＋符號驗證」的頂級先例，佐證本研究架構模式已被最高等級期刊接受 |
| Brosi & Bast (2024), Cartographic J. 60(4), 342–366（前輪已入） | 2.6 | 最強鄰居，畫界必引 |
| Forsch, Kemna, Langetepe, & Haunert (2024), *Polyline morphing for animated schematic maps*, J. Geovis. Spat. Anal. 8:37（PDF 首頁驗證，DOI 10.1007/s41651-024-00198-w） | 2.6／7.2 | 保約束示意圖動畫——版面切換轉場的升級路徑 |
| Fähndrich (2025), *Kartographische Generalisierung von Stromleitungsnetzen*, TU Wien Diplomarbeit（PDF 首頁驗證） | 2.4／7.2 | 電網概括化先行者；21.4% 失敗率＋近 2 小時運行是效能對照 |
| Schönberger & Fach (2025), Transp. Res. Procedia 91, 361–368（PDF 首頁驗證，DOI 10.1016/j.trpro.2025.10.047） | 2.6 | 開放資料建圖同行（routing 目的） |
| El Akra (2026), NDU-Louaize 設計碩論（PDF 首頁驗證） | 1.1 | 人工設計成本的當代實證，動機用 |
| Agrawala & Stolte (2001), *Rendering effective route maps*, SIGGRAPH 2001（2026-07-26 網路驗證） | 2.4／5.6 | LineDrive——認知驅動概括化的殿堂級經典＋2200 使用者驗證；地理系口委必識 |
| Jacobsen, Wallinger, Kobourov, & Nöllenburg (2021), *MetroSets*, TVCG 27(2), 1257–1267（網路驗證） | 2.1 | 地鐵圖隱喻視覺化集合系統——示意圖語彙通用性的證據 |
| Feng et al. (2023), *LayoutGPT*, NeurIPS 2023（網路驗證） | 2.5 | LLM 佈局生成先行者（場景/圖像）——但無拓撲約束，畫界即得 |
| Touya, Zhang, & Lokhat (2019), *Is deep learning the new agent for map generalization?*, Int. J. Cartography 5(2–3), 142–157（網路驗證；**PDF 在 __Thesis 資料夾**） | 2.5 | 「學習模型能否當概括化代理人」的綱領文——與本研究 LLM-in-the-loop 形成兩代對話，思想譜系的關鍵一環 |

### B　推薦引用、書目待驗證（查證後再入）

| 文獻（憑印象記錄，須查證） | 用在 | 為什麼要引 |
|---|---|---|
| 待補：Gruget, Touya, et al.（約 2023）pan-scalar maps 概念論文 | 2.3.3 | 跨尺度地圖的概念框架（Touya et al. 2023 已引，補概念源頭） |
| 待補：Dibia (2023), *LIDA*, ACL demo | 2.5 | LLM 生成視覺化的代表性工具（grammar-agnostic、多階段管線） |
| 待補：Luo et al., *nvBench*（NL2VIS 基準） | 2.5 | NL2VIS 標準基準，評估脈絡必引 |
| 待補：Wang et al., *Data Formulator*（Microsoft，TVCG 2024？） | 2.5 | AI 輔助圖表製作的近期代表 |
| 待補：*How well will LLMs perform for graph layout tasks?*, Visual Informatics (2025)——**作者未查** | 2.6 | 目前 2.6 只描述未正式引用；投稿版必須補正式書目 |
| 待補：*Graph Drawing for LLMs: An Empirical Evaluation*, arXiv:2505.03678——作者未查 | 2.6 | 同上 |
| 待補：PlanarBench, arXiv:2606.02010；Proteus, arXiv:2604.23299；Responsive Thematic Mapping, arXiv:2606.12008 | 2.6 | 同上（arXiv 引用也需作者名） |
| 待補：Nöllenburg (2014)，metro map layout 方法綜述（書章） | 2.2 | 佈局方法的系統性綜述，文獻回顧加厚用 |
| 待補：McMaster & Shea (1992), *Generalization in Digital Cartography* | 2.4 | 概括化理論經典，補地理學理論根基 |
| 待補：Töpfer & Pillewizer (1966), radical law | 2.4 | 概括化選取量的古典定律——版面縮小時該留多少物件的理論參照 |
| 待補：MacEachren (1995), *How Maps Work* | 2.1／2.4 | 地圖認知與表徵理論的地理學根基（口委視角） |
| 待補：Sweller（1988 起）認知負荷理論 | 5.5 | 使用者實驗的認知理論依據 |
| 待補：Ware, *Information Visualization: Perception for Design* | 5.5 | 視覺感知設計原則，測驗題設計依據 |
| 待補：Nickel & Nöllenburg（2024），*Computing Data-driven Multilinear Metro Maps*，Cartographic J.——2020 Diagrams 短文的期刊完整版，卷期頁待查 | 2.1 | 已引 2020 版；期刊版更完整，查證後升級引用 |
| 待補：Kopf et al.（約 2010），*Automatic generation of destination maps*，SIGGRAPH Asia | 2.4 | LineDrive 的後繼——目的地地圖自動概括化 |
| 待補：CartoAgent／MapGPT／MapMate／TransitGPT（2024–2025，LLM×製圖 agent 系） | 2.5／2.6 | LLM 進入製圖工作流的最新一批；至少挑 1–2 篇驗證後入畫界節 |
| 待補：*GeoAI for map generalization in multi-scale cartography: foundations, a research agenda*（IJGIS 2026） | 2.4／7.2 | GeoAI×概括化的研究議程——把本研究掛上地理學界的最新路線圖 |
| 待補：*Deep learning in automatic map generalization: achievements and challenges*（2025 綜述） | 2.4 | Touya 2019 之後的進展總結 |
| 待補：Ovenden, *Transit Maps of the World*（書） | 2.1 | 全球示意圖設計史料——文獻回顧加厚時的背景引 |

---

## 11　期刊選擇與篇幅規劃

### 11.1　篇幅診斷：廣度過剩、深度不足

現有 `paper.md` 約 **1.7 萬中文字**（不含參考文獻；2026-08 校對後）；中譯英以 0.65 係數估算約 **1 萬英文詞**。

| 目標 | 典型篇幅 | 現況判定 |
|---|---|---|
| 一篇 GIScience／VIS 期刊論文 | 8,000–10,000 詞 | **量剛好，但主題太雜**——四個貢獻塞一篇必被批 unfocused |
| 一篇會議論文（VIS／EuroVis） | 9 頁正文（約 8,000 詞） | 同上 |
| 中文博士論文 | 6–10 萬字 | **不足 1/4** |

結論是「兩者皆是」：以**單篇論文的廣度**而言太多（須砍到一個核心主張），以**任何目標的深度**而言太少（每個主張只有骨架，缺展開、實驗細節與圖表討論）。拆篇後每篇約需現有相關章節的 **3–4 倍**篇幅——這也是第 0 節「章節擴寫」與本節共用的工作量。

各刊字數上限請以投稿當下的 author guidelines 為準；上表為量級參考。

### 11.2　期刊選擇的證據：引用分布

投稿目標最可靠的指標是「你引誰、誰會引你」。現有 57 筆參考文獻的分布：

| 期刊／論壇 | 筆數 | 代表文獻 |
|---|---|---|
| IEEE TVCG | 7 | Stott 2011、Nöllenburg & Wolff 2011、Wang & Chi 2011、Haunert & Sering 2011、Wu 2013 (ViSizer)、Horak 2021、Chen 2024 (VisEval) |
| Computer Graphics Forum | 6 | Bast 2020、Batik 2022、Kim 2021、Nobre 2019、Wu 2020、Schöttler 2021 |
| IJGIS | 4 | Li & Dong 2010、Ti & Li 2014、van Dijk & Haunert 2014、Yu 2020 |
| The Cartographic Journal | 2 | **Ti 2015、Brosi & Bast 2024**（兩個最強鄰居都在此刊） |
| CaGIS | 2 | Bereuter & Weibel 2013、Galvão 2023 |
| Visual Informatics | 2 | Ye 2024、*How well will LLMs perform for graph layout tasks?* 2025 |

解讀：題目確實跨界，VIS 系（13 筆）與 GIScience 系（8 筆）都是主場。差別在**審稿人組成**與**對使用者實驗的要求強度**——VIS 系要求高、GIScience 系相對寬。

### 11.3　三篇的期刊分流

| 篇 | 首選 | 備選 | 理由 | 風險 |
|---|---|---|---|---|
| **主論文**<br>（四步鏈＋響應式） | **IJGIS** | Cartographic Journal、CaGIS、TVCG | 地理主場，審稿人熟悉 Li & Dong／Ti 一脈的脈絡；對使用者實驗的要求較 TVCG 寬 | 需說服「這不只是工程」——用 6.1 節的 NP-hard 定位與可稽核性主張 |
| **LLM 論文** | **Visual Informatics** 或 **CEUS** | TVCG、IJGIS | Visual Informatics 快且對口（該刊已收 LLM×graph layout 評測）；CEUS 近年大量收 LLM×urban | 注意：**勿投傳統製圖期刊**——審 LLM 架構的能力較弱、審期易拖長 |
| **Benchmark** | **The Cartographic Journal** | CaGIS、VIS short／dataset track | 與 Brosi & Bast 2024 同刊，畫界最直接有力 | 需先完成 DOI 發布與 datasheet（第 4 節方案 A） |

### 11.4　主論文的兩條路線（擇一，影響時程甚鉅）

**路線 A（穩健）：IJGIS。** 使用者實驗可先做較小規模（20–24 人）；文章重心放在演算法框架與全量驗證（599 系統），實驗作為輔證。**優點**：審期較可控、與地理系口委的期待一致、可先於學位考試取得收據。**代價**：影響因子與 VIS 社群曝光度低於 TVCG。

**路線 B（衝刺）：IEEE TVCG。** 需備齊第 5 節必補清單全部五項（尤其完整使用者實驗＋與 LOOM／Brosi & Bast 的定量對比）。**優點**：頂級刊、與 Stott／Nöllenburg／Wang & Chi 同場對話，是這個題目的「正統歸屬」。**代價**：實驗與對比實驗約多耗 4–6 個月；被拒後轉投仍可回路線 A（稿件重疊度高、改寫成本低）。

**折衷建議**：先投 TVCG，設一個明確的停損點（如首輪 major revision 未過即轉 IJGIS）。因為 B → A 的降級改寫成本低，而 A → B 的升級（已發表就不能再投）不可能。

### 11.5　投稿順序與時程

| 順位 | 篇 | 何時可送 | 理由 |
|---|---|---|---|
| 1 | **LLM 論文** | 跨模型**指標表**＋另三層消融雛形後，約 1–2 個月 | 時效窗口最短；4 城表＋13 模型 enforced 樣本已半成品，差整理與補跑 |
| 2 | **Benchmark** | DOI 與 datasheet 就緒後，約 1–2 個月 | 599 系統基準結果已全量；包裝時標明覆蓋範圍 |
| 3 | **主論文** | 使用者實驗完成後，約 4–6 個月 | 卡在 IRB 與實驗執行 |

此順序同時服務一個行政現實：**若系上要求口試前有論文接受或投稿中**（此條需向地理系與指導教授確認），順位 1、2 能最快產出收據，而它們的時程不受 IRB 牽制。

### 11.6　寫作面注意

- **語言**：中文博論＋英文期刊論文是常態；`paper.md` 的中文稿為博論主體，投稿版須另行以英文撰寫（非逐句翻譯——英文期刊的論證節奏與中文不同）。
- **重疊聲明**：三篇之間共用系統描述，投稿時須註明與博士論文的關係，並避免自我抄襲（各刊政策不同，投稿前查證）。
- **圖**：期刊版圖片需重製為向量、加英文標註、符合各刊圖說格式；現有 `figs/` 的 SVG 可直接沿用底稿。

---

## 附錄　文獻掃描來源（2026-07-25）

- Bast & Brosi (2024). *Large-scale generation of transit maps from OpenStreetMap data.* The Cartographic Journal. https://www.tandfonline.com/doi/full/10.1080/00087041.2024.2325761
- Ti, Li & Xu (2015). *Automated generation of schematic network maps adaptive to display sizes.* The Cartographic Journal. https://www.tandfonline.com/doi/full/10.1080/00087041.2015.1119464
- *How well will LLMs perform for graph layout tasks?* Visual Informatics (2025). https://www.sciencedirect.com/science/article/pii/S2468502X25000683
- *Graph Drawing for LLMs: An Empirical Evaluation.* arXiv:2505.03678. https://arxiv.org/pdf/2505.03678
- *PlanarBench: Evaluating LLM Spatial Reasoning via Planar Graph Drawing.* arXiv:2606.02010. https://arxiv.org/pdf/2606.02010
- *Proteus: Shapeshifting Desktop Visualizations for Mobile via Multi-level Intelligent Adaptation.* arXiv:2604.23299. https://arxiv.org/pdf/2604.23299
- *Automated Responsive Thematic Mapping with Layout Guides.* arXiv:2606.12008. https://arxiv.org/html/2606.12008
- *MetroGNN: Metro Network Expansion with Reinforcement Learning.* arXiv:2403.09197. https://arxiv.org/pdf/2403.09197
- *Exploring MLLMs Perception of Network Visualization Principles.* arXiv:2506.14611. https://arxiv.org/pdf/2506.14611

---

<sub>本文件最後更新：**2026-08-12**（對齊系統：599 系統（5,898 線／37,313 站）、railway 9、frameParity 980、衍生資料全球保留（2026-08-07）、13 模型三支 CLI；待辦改為「跨模型指標表」優先於「從零收集跨模型樣本」）。</sub>
