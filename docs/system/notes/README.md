# 系統說明（`data/docs/system/notes/`）

演算法／管線的**詳細規格**——給人讀、給改碼對照用。**不是 skill**。

## 與程式的關係（鐵律）

**所有文件一定跟程式內容對齊**（2026-08-08 使用者裁決）——這條的範圍是**全部文件**，
不只本資料夾（另含 `.claude/skills/*/{SKILL.md,SKILL.zh.md,EXPLAIN.md}`、根目錄系統報告、
`CLAUDE.md`、`README.md`）。

- **程式是權威**：說明必須與目前 `src/stores/**`（及相關腳本）行為一致。
- **改行為＝先改碼再改說明**；只改說明時不得發明程式沒做的步驟。
- **說明可合併／拆開**以對齊模組結構，但不得因此改寫演算法語意。
- 論文差異另開「與論文差異」小節。
- **安全網＝`node scripts/checkDocRefs.mjs`**（已進 `npm run check`）：查①引用的程式檔路徑
  存在②`someFn()` 在 repo 裡有這個名字③`NAME = 值` 與程式的 `const` 相符④`ns.key` 在
  `src/i18n/ui-locale.md` 裡。刻意提到不存在的名字（被否決的設計、警告不要做的第二份實作、
  已作廢的舊機制）要加進該支的 `INTENTIONAL` 系列並寫明理由。
- ⚠ **通過不等於對齊**：位置敘述（在哪個工具列／哪個分頁）、階段數、UI 開關歸屬、
  演算法語意，機械上都查不到——改完碼**仍要人讀一遍對應的說明**。

## 已遷出的純演算法

| 說明 id | 圖層 | 實作 |
|---|---|---|
| `route-skeleton-connect`／`route-skeleton-river` | `skeleton` | `skeleton.js` |
| `route-skeleton-grid` | `grid` | `schematicGrid.js` |
| `route-paper-align` | `algorithm-stroke`（總覽） | `paperAlign.js`／`paper/_shared.js` |
| `route-stroke-align`…`route-flexgrid-align` | `algorithm-*` | `paper/*.js`／`buildOrthoPolish` |
| `route-hillclimb` | `algorithm-ortho` | `hillClimb.js`（含 `makeMover`） |
| `route-endpoint-move`／`route-span-cap` | `endpoint` | `movewise.js` |
| `route-line-compact` | `linecompact` | `movewise.js` |
| `route-branch-shift` | `branchshift` | `movewise.js` |
| `route-grid-merge` | `gridmerge` | `movewise.js` |
| `route-movewise-loop`／`route-step-verify` | `network-loop` | `movewise.js`／`useStepper.js` |
| `route-grid-straighten-eval` | `network-loop` | `lib/straightenEval.js`（程式評價，非 LLM） |
| `route-frame-draw`／`route-frame-weight` | `frame` | `frameMap.js`／`frame/*`／`frameWeight.js` |
| `route-shape-rect-align` | `llm-shape` | `paper/shape.js` 等（入口仍只留 LLM 指定形狀 skill） |
| `route-orientation` | `working` | `orientation.js`（方位玫瑰／建議旋轉；非旋轉變體休眠公式） |
| `route-city-rotation` | `skeleton` | `cityRotation.js`／`buildRotatedVariants.mjs`（內建旋轉城市：旋轉後算完整管線） |
| `data-file-geojson` | `working` | `buildGeojson.mjs`／`_prescribedShape.mjs`（geojson 存什麼：站／線／`metro_system`；四個槽；覆蓋更新） |
| `data-file-json` | `working` | `lib/embeddedSource.js`／`scripts/_embedSource.mjs`／`_jsonVersions.mjs`（結果 json 存什麼；每份 json 自足；版本化） |

- 網站：`/doc` → 系統內容 → **系統說明**
- 服務：`vite/serveSysNotes.js`
- 分類：`src/lib/sysNoteCatalog.js`（frontmatter `layer:`）
- 語言：台灣繁體中文
- frontmatter：`description:`（單行）＋`layer:`（圖層 code）
- 節點類型／hover 契約（色點＋類型名）以 `route-skeleton-connect` 為準；實作＝`nodeTypes.js`／`popupHtml.js`
