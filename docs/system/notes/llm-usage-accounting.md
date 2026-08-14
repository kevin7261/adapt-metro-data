---
description: LLM 的 token 用量與逐輪計時怎麼記（非 skill）——父行程從串流收帶時戳的用量樣本寫進暫存 journal（`LLM_USAGE_LOG`），子行程每次 `apply` 依「上一輪結束→現在」的時窗歸戶，逐輪與整趟一併寫進結果檔的 `usage`／`endedAt`；含三家執行器的能力矩陣（claude 逐則有、cursor 只有整趟、dsc 靠 `-trace-jsonl`）、`totalTokens` 的唯一定義（四項相加）、「沒量到＝null 絕不是 0」的紀律，以及 `checkLlmLayers` 的 B／C 兩段。
layer: straightening
---

# LLM 的 token 用量與逐輪計時（llm-usage-accounting）

本文件是該機制的**規格權威**（系統說明，**不是** skill）。實作必須與它相符。

實作＝`src/lib/llmUsage.js`（純算術與鍵名正規化）＋`scripts/_llmUsage.mjs`（journal I/O
與歸戶）＋三支驅動程式（`vite/claudeSkillTrigger.js`／`scripts/llmChainBatch.mjs`／
`vite/metroRecompute.js`）＋九支鏈腳本。

## 要記什麼

每一支 LLM 結果檔的酬載層（`alignOf(doc)` 讀得到的那一層，與 `elapsedMs` 同層）帶：

```jsonc
{
  "startedAt": 1786497661398,       // spawn 時刻（LLM_STARTED_AT）
  "endedAt":   1786498238191,       // 最後一次 apply
  "endedAtSource": "last-apply",    // 或 "process-close"（收尾補寫時）
  "elapsedMs": 576793,
  "usage": {                        // 整趟；拿不到＝null
    "inputTokens": 25, "outputTokens": 147,
    "cacheReadTokens": 1242373, "cacheWriteTokens": 111509,
    "totalTokens": 1354054,
    "costUsd": null,                // 訂閱制的執行器給不出金額
    "source": "stream",             // "stream" | "trace" | "none"
    "countedThrough": "last-apply",
    "samples": 13                   // 進到這筆加總的事件數（0＝完全沒量到）
  },
  "transcript": [
    { "round": 1, "startedAt": …, "endedAt": …, "elapsedMs": 222364, "usage": { … } }
  ]
}
```

**`totalTokens` 只有一個定義**＝`input + output + cacheRead + cacheWrite`
（`llmUsage.totalTokensOf`，唯一計算點）。Anthropic 的 `input_tokens` **不含**快取讀寫，
只加 in+out 會讓一個讀了 124 萬快取 token 的回合看起來像幾百，成本低估兩三個數量級。

**逐輪 = 整趟。** 同一趟的各輪 `totalTokens` 相加必須等於整趟的 `totalTokens`
（高雄矩形 × Fable 5 實測：349,509＋515,703＋239,638＋249,204 ＝ 1,354,054）。
時窗也必須連續且不重疊：第 *k* 輪的 `startedAt` ＝第 *k−1* 輪的 `endedAt`，第一輪＝
整趟的 `startedAt`。

## 為什麼要繞一份旁路 journal

寫結果檔的是**子行程**（模型下 `node scripts/llm*.mjs apply`），它看不到自己花了多少
token——那是 CLI 對外吐的串流事件，只有**父行程**收得到。反過來，父行程不知道「輪次」
在哪裡切（那是 `apply` 的語意）。兩邊各有一半資訊。

作法：父行程把每一筆帶時戳的用量樣本 append 進一個暫存 JSONL（`os.tmpdir()` 底下，
**不進 repo、不進 `data/`**），路徑經 `LLM_USAGE_LOG` 傳給子行程；子行程每次 `apply`
把「上一輪結束 → 現在」窗內的樣本相加，就是這一輪的用量。整趟則用同一份 journal
**重算**（不是把逐輪相加——重跑時舊輪次還在檔裡）。

**為什麼不是父行程收尾一次寫完**：

1. `finalizeLlmResultFile` 對**成功**的結果其實是死路——版本化之後真結果寫在帶戳檔名，
   那支讀的是無戳 base 名，讀不到就直接 return（磁碟現況：無戳檔全部是 `failed` stub）。
2. dev server 中途重啟／被關掉，close callback 永遠不會執行——`LLM_STARTED_AT` 當初
   就是為了這件事才存在。子行程自己寫，跑到第幾輪就留下第幾輪的數字。

**競態的上限**：帶著 `apply` 那個 Bash 工具呼叫的 assistant 事件，CLI 是在工具真的執行
**之前**吐出來的，所以子行程啟動（>100 ms）時父行程幾乎必然已經寫進 journal。極端情況
最多有一則訊息落到下一輪的窗裡——是歸戶偏移，不是遺失，整趟總量不受影響。

**信任邊界**：journal 在子行程看得到的檔案系統上，模型理論上可以偽造樣本——與它可以
偽造 `LLM_STARTED_AT` 同一個層級，不是新開的洞。`usage.source` 一律記錄數字的來源。

## 三家執行器的能力矩陣

| provider | 逐則用量 | 整趟總量 | 模式（`usageModeOf`） |
|---|---|---|---|
| `claude` | 有（`assistant` 事件的 `message.usage`） | 有（`result` 事件＋`total_cost_usd`） | `stream-delta` |
| `cursor` | **沒有**（assistant 事件只帶文字） | 有（`result` 事件的 `usage`，camelCase 累計值） | `result-total` |
| `deepseek` | 沒有 stream-json | 靠 `-trace-jsonl`（旗標由 `buildLlmSpawn` 帶入，讀完即刪） | `trace-file` |

13 個現役模型有 9 個跑在 cursor／dsc，所以**逐輪 token 只有 claude 那幾列有**，其餘
逐輪一律 `null`、整趟由收尾補寫**一個新版本**（`finalizeLlmUsage`；結果 json 生成後不可
就地修改，見 `checkJsonVersions`）。

`stream-delta` 的整趟**不由收尾補寫**——子行程已經寫完了，再補一版只是每趟多一個版本檔。

同一則訊息重複出事件時**依 `message.id` 去重**（只留最後一筆），否則同一次 API 呼叫
會被算兩次。

## `null` 不是 0

「沒量到」與「真的沒用 token」必須分得開。缺值一律 `null`：

- `usageOf`／`llmTokensOf`（`src/lib/straighteningCells.js`，唯一取值口）缺值回 `null`。
- 清單那一欄（`vite/viewStatusCompute.js` 的 `llmTotals`）另回 `llmTokenUnknown`＝
  有檔卻沒有 token 的圖層支數，**不可以當 0 混進 `llmTokens`**；`CityStatusList` 在
  那種列補一個警告記號，title 講明那是下限值。
- 面板的即時 token（`/status` 的 `usage`）在拿不到時整段不顯示，不寫「已用 0 token」。

安全網＝`node scripts/checkLlmLayers.mjs`（在 `npm run check` 裡）：

- **B 段**：報「沒有 `elapsedMs`」與「沒有 token 用量」的支數。**不算失敗**——token 是
  2026-08-12 才開始記的，在那之前的每一支結果檔都沒有。這一段的用途是讓「總數其實是
  下限」看得見。
- **C 段**：`totalTokens === 0` 而 `samples === 0`＝把未知偽裝成已知，**算失敗**。

## 顯示在哪裡

| 位置 | 顯示什麼 |
|---|---|
| `LlmRecordHead.vue`（十條鏈的結果表頭共用） | 開始時間／結束時間／執行時間／Token |
| `StyleLlmTab.vue` 的逐輪列（`withRoundStamp`） | 每一輪的耗時與 token；絕對時刻在「本輪紀錄」modal 裡 |
| `StyleLlmTab.vue` 的執行鈕（`runBtnLabel`） | 執行中的現場秒數＋目前已用 token |
| `CityStatusList.vue` 的「Token 總數」欄 | 該城全部 LLM 圖層相加；部分量不到時補警告記號 |

格式化只有一份：`fmtTokens`／`fmtElapsed`／`fmtTaipeiAt`（`src/lib/llmFormat.js`；
時鐘＝`YY/MM/DD HH:MM:SS` 台北時間，缺值 `00/00/00 00:00:00`），**新的顯示點禁止自己再算**。
