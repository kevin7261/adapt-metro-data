# 文件頁靜態內容（`data/docs/`）

與 header「文件」選單（`src/lib/docMenu.js`）對齊。**設計**是 Vue dock tab，不在此樹。

| 選單群組 | 選單項 | 路徑 |
|---|---|---|
| 系統內容 | 簡介 | `system/brief/`（短版投影片，一頁一個重點） |
| 系統內容 | 介紹 | `system/intro/` |
| 系統內容 | 架構 | `system/architecture/` |
| 系統內容 | 系統說明 | `system/notes/*.md`（Vue 分頁，UI 同 Skills；經 `/sysnotes/` 服務） |
| 資料流／Skills | （應用內分頁） | — 無靜態檔 |
| 論文內容 | 論文投影片 | `thesis/` |
| 論文內容 | 論文本文 | `thesis/paper/`（`?doc=paper`） |
| 論文內容 | 改善建議 | `thesis/paper/?doc=improve` ← `thesis/improve.md` |
| 論文內容 | 閱讀清單 | `thesis/paper/?doc=reading` ← `thesis/reading.md` |

共用殼層：`_shared/`（toolbar／gdocs／gslides／design-shell）。  
`_shared/tokens.css` 在 dev／build 由 `src/tokens.css` 提供（勿手改副本）。

舊網址 `/slides/**` 由 `vite/serveDocs.js` 302 到本樹。
