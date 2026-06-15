# catvweb — journal.html 开发 Skill

## 这个 Skill 的用途

每次开始开发 `journal.html` 前必须读这份文件。
它记录了项目的模块结构、已知代码规范、以及禁止重复踩的坑。

---

## 一、文件结构总览

```
journal.html
├── <head>
│   ├── 外部资源：Chart.js 4.4.1、docx@7.1.0（见第九节）、Google Fonts
│   └── <style> — 所有 CSS，按模块分区注释
│
├── <body>
│   ├── 装饰元素 .deco
│   ├── <nav #site-nav>
│   ├── <div .page #app>
│   │   ├── .page-header
│   │   ├── .stats-row
│   │   └── .main-layout
│   │       ├── .sidebar  — 周导航 + project 列表
│   │       └── #main-area  — journal / stats / tracker
│   └── #modal-container
│
└── <script>
    ├── 1. 顶层常量（CB_PALETTES / cbGetGroupColors / cbGetStops / STATUS_LABELS / triggerDownload / stripEmoji）
    ├── 2. 状态变量
    ├── 3. 数据层 (loadData / saveData / calcCoins / recalcTotalCoins)
    ├── 4. 渲染层 — Sidebar / Journal / Stats / Tracker
    ├── 5. 表单逻辑 (openForm / saveEntry / cancelForm / inline edit)
    ├── 6. Project Modal (renderModal / saveProject / deleteProject / restoreProject)
    ├── 7. Chart Builder v2
    │   ├── 7a. 顶层 palette 常量 & 工具函数（唯一来源）
    │   ├── 7b. Chart.js Plugins (CB_NumPlugin / CB_TitlePlugin / CB_DonutPlugin / CB_BgPlugin)
    │   ├── 7c. 数据预处理 (initChartBuilder / cbGetVarData)
    │   ├── 7d. 渲染函数 (cbRenderFull / cbRenderBar / cbRenderDonut)
    │   ├── 7e. UI 控制函数 (cbSetType / cbTogNum / cbTogTitles …)
    │   └── 7f. 导出函数 (cbExportDocx / cbExportPdf / exportTracker)
    ├── 8. Calendar Picker
    ├── 9. Color Picker (cp*)
    └── 10. 初始化 (事件绑定 + renderAll)
```

---

## 二、顶层常量（唯一来源规则）

以下常量**只能在 script 最顶部定义一次**，不得在函数内部重新定义。

- `CB_PALETTES` + `cbGetGroupColors()` + `cbGetStops()` — 禁止在 cbRenderBar / cbRenderDonut / CB_DonutPlugin 内重新定义
- `STATUS_LABELS` — 禁止在 renderTracker / cbExportDocx / exportTracker 内各自定义 statusLabel
- `triggerDownload()` — 所有导出统一用此函数，禁止手写 createElement('a') 下载逻辑
- `stripEmoji()` — 所有传入 docx.js TextRun 的文字必须先过此函数（见第九节）

> 涉及全局常量或函数重命名时，必须全文 grep 确认零残留，再输出文件。

---

## 三、CSS 规范

- 禁止重复定义同名 class（.cb-step-lbl / .cb-var-chip 过去曾各有两份，已修复）
- 区块注释格式：`/* ── MODULE NAME ───── */`
- 区块顺序不打乱：Reset → NAV → LAYOUT → HEADER → STATS → SIDEBAR → MAIN AREA → ENTRY CARD → INLINE EDIT → FORM → PROJ PICKER → SELECT DROPDOWN → STATS VIEW → MODAL → CHART BUILDER → CALENDAR PICKER → COLOR PICKER → DECO

---

## 四、已知高风险区域

**renderModal()** — 整体重 render 会造成 color picker 事件监听器叠加，`cpInitPicker` 必须在结尾只调用一次。

**form 状态变量** — openForm / cancelForm / saveEntry 必须完整重置所有变量：
`formTitle, formNote, formLink, formLinkLabel, formProj, showForm, showProjPicker, formExtras, window._fv, skippedFields, openDropId`

**Chart.js plugin** — CB_NumPlugin / CB_TitlePlugin / CB_DonutPlugin / CB_BgPlugin 全局注册一次，禁止在 plugins:[] 里重复传入。

---

## 五、开发流程规范

### 修改前
1. 确认要改的功能属于哪个模块
2. 确认要用到的常量已在当前文件版本的顶层存在（不存在则先加入再引用）
3. 新增 CSS class 前先搜索是否已存在同名

### 修改后
1. grep 验证：无残留旧函数名、无重复定义
2. 所有 statusLabel / palette / getStops 引用指向顶层常量
3. 导出函数用 triggerDownload()，TextRun 传值用 stripEmoji()
4. 涉及重命名时，全文搜索确认零残留

### 新增功能时
- 在对应模块区块内添加代码，保持区块顺序
- 全新模块在 script 顶部结构注释里登记

---

## 六、文件版本管理

- **同一对话继续开发**：直接在 `/home/claude/journal.html` 叠加改动，不需要用户重新上传
- **每次输出标注「第 N 次 update」**，让用户确认版本
- **用户上传文件时**：先 grep 检查关键函数（如 `renameField` / `stripEmoji`）确认是否为最新版本
- **开新对话时**：需要用户同时上传 `journal.html` 和 `catvweb-journal-SKILL.md`

---

## 七、docx.js 浏览器使用规范

⚠️ 这是今天踩了 5 次才找到的正确写法，不要改动。

```html
<!-- 正确：unpkg + @7.1.0 + index.js（非 min） -->
<script src="https://unpkg.com/docx@7.1.0/build/index.js"></script>
<script>
window.addEventListener('load', function(){
  if(typeof docx !== 'undefined') window.docx = docx;
});
</script>
```

- CDN 只用 **unpkg.com**（jsdelivr 在 GitHub Pages 上无法正确暴露全局变量）
- 版本固定 **@7.1.0**（@8 / @9 的全局变量挂载方式不同）
- 文件用 **index.js**（index.min.js 同样有问题）
- 全局变量是 **`docx`**，不是 `window.docx`，需要 load 事件统一挂到 `window.docx`
- 所有 TextRun 传值必须先过 `stripEmoji()`，否则遇到 emoji 会崩溃

---

## 八、localStorage key 一览

| key | 用途 |
|-----|------|
| `cj_projects` | 所有 project 数据 |
| `cj_entries` | 所有日记条目（按 dateKey 分组） |
| `catTokens` | Cat Token 总余额 |
| `cj_mypalette` | color picker 已保存颜色 |

---

## 九、dateKey 格式

`dk(date)` 返回 `YYYY-M-D`（月日不补零），例如 `2026-6-12`。
所有 entries 的 key、比较操作都使用这个格式，不要使用 ISO 格式（`2026-06-12`）以免 key 不匹配。
