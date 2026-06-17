# catvweb — journal.html 开发 Skill

## 这个 Skill 的用途

每次开始开发 `journal.html` 前必须读这份文件。
它记录了项目的模块结构、已知代码规范、以及禁止重复踩的坑。

---

## 一、文件结构总览

```
journal.html
├── <head>
│   ├── 外部资源：Chart.js 4.4.1、docx@7.1.0（见第七节）、Google Fonts
│   └── <style> — 所有 CSS，按模块分区注释
│
├── <body>
│   ├── 装饰元素 .deco
│   ├── <nav #site-nav>
│   ├── <div .page #app>
│   │   ├── .page-header  — 含语言切换按钮 #lang-zh / #lang-en
│   │   ├── .stats-row
│   │   └── .main-layout
│   │       ├── .sidebar  — 周导航 + project 列表
│   │       └── #main-area  — journal / stats / tracker
│   └── #modal-container
│
└── <script>
    ├── 0. I18N 对象 + t() + setLang()（双语，见第十节）
    ├── 1. 顶层常量（CB_PALETTES / cbGetGroupColors / cbGetStops / getStatusLabels / triggerDownload / stripEmoji）
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
- `getStatusLabels()` — 动态从 I18N 取值，禁止在函数内定义 statusLabel 对象
- `triggerDownload()` — 所有导出统一用此函数，禁止手写 createElement('a') 下载逻辑
- `stripEmoji()` — 所有传入 docx.js TextRun 的文字必须先过此函数

> 涉及全局常量或函数重命名时，必须全文 grep 确认零残留，再输出文件。

---

## 三、CSS 规范

- 禁止重复定义同名 class
- 区块注释格式：`/* ── MODULE NAME ───── */`
- 区块顺序不打乱：Reset → NAV → LAYOUT → HEADER → STATS → SIDEBAR → MAIN AREA → ENTRY CARD → INLINE EDIT → FORM → PROJ PICKER → SELECT DROPDOWN → STATS VIEW → MODAL → CHART BUILDER → CALENDAR PICKER → COLOR PICKER → DECO

---

## 四、已知高风险区域

**renderModal()** — 整体重 render 会造成 color picker 事件监听器叠加，`cpInitPicker` 必须在结尾只调用一次。

**form 状态变量** — openForm / cancelForm / saveEntry 必须完整重置所有变量：
`formTitle, formNote, formLink, formLinkLabel, formProj, showForm, showProjPicker, formExtras, window._fv, skippedFields, openDropId`

**Chart.js plugin** — CB_NumPlugin / CB_TitlePlugin / CB_DonutPlugin / CB_BgPlugin 全局注册一次，禁止在 plugins:[] 里重复传入。

**Template literal 嵌套** — 在 template literal 里嵌套另一个 template literal 时，结尾的 backtick 容易多写或少写一个，导致 SyntaxError。写完后必须检查嵌套层数。

---

## 五、开发流程规范

### 修改前
1. 确认要改的功能属于哪个模块
2. 确认要用到的常量已在当前文件版本的顶层存在（不存在则先加入再引用）
3. 新增 CSS class 前先搜索是否已存在同名

### 修改后
1. grep 验证：无残留旧函数名、无重复定义
2. 所有 statusLabel 引用改为 getStatusLabels()，palette / getStops 引用指向顶层常量
3. 导出函数用 triggerDownload()，TextRun 传值用 stripEmoji()
4. 涉及重命名时，全文搜索确认零残留

### 新增界面元素时（双语强制规则）
- 必须同时在 `I18N.zh` 和 `I18N.en` 加对应 key
- 代码里用 `t('key')` 取值，禁止硬编码中文界面文字
- 遇到不确定的英文翻译，列出 2-3 个选项即时问用户，不要自行决定
- `Cat Token` 中英文都保留原文不翻译

---

## 六、文件版本管理

- **同一对话继续开发**：直接在 `/home/claude/journal.html` 叠加改动，不需要用户重新上传
- **每次输出标注「第 N 次 update」**，让用户确认版本
- **用户上传文件时**：先 grep 检查关键函数（如 `renameField` / `stripEmoji` / `setLang`）确认是否为最新版本
- **开新对话时**：需要用户同时上传 `journal.html` 和 `catvweb-journal-SKILL.md`

---

## 七、docx.js 浏览器使用规范

⚠️ 踩了 5 次才找到的正确写法，不要改动。

```html
<script src="https://unpkg.com/docx@7.1.0/build/index.js"></script>
<script>
window.addEventListener('load', function(){
  if(typeof docx !== 'undefined') window.docx = docx;
});
</script>
```

- CDN 只用 **unpkg.com**（jsdelivr 在 GitHub Pages 上无法正确暴露全局变量）
- 版本固定 **@7.1.0**，文件用 **index.js**（非 min）
- 所有 TextRun 传值必须先过 `stripEmoji()`

---

## 八、localStorage key 一览

| key | 用途 |
|-----|------|
| `cj_projects` | 所有 project 数据 |
| `cj_entries` | 所有日记条目（按 dateKey 分组） |
| `catTokens` | Cat Token 总余额 |
| `cj_mypalette` | color picker 已保存颜色 |
| `cj_lang` | 语言设定（'zh' / 'en'，默认 'zh'） |

---

## 九、dateKey 格式

`dk(date)` 返回 `YYYY-M-D`（月日不补零），例如 `2026-6-12`。
所有 entries 的 key、比较操作都使用这个格式，不要使用 ISO 格式（`2026-06-12`）以免 key 不匹配。

---

## 十、双语（i18n）规范

**架构：**
- `I18N` 对象在 script 最顶部（0 号模块），包含 `zh` 和 `en` 两套 key
- `t(key)` — 取当前语言的字符串，fallback 到 zh
- `setLang(l)` — 切换语言，自动存 localStorage，调用 renderAll()
- `lang` — 当前语言变量，默认 `'zh'`

**强制规则：**
- 禁止在 JS / HTML 里硬编码中文界面文字
- 新增界面元素必须同时加 I18N.zh 和 I18N.en 的 key，用 t('key') 取值
- 数据层（localStorage、field.label、entry 内容）不翻译，保持原样
- 语言切换只改显示，不动数据
- `status_archived` 英文显示为 `ARCHIVED`（全大写，印章样式）
- `Cat Token` 中英文都不翻译

**遇到不确定的翻译：** 列出 2-3 个选项即时问用户，不自行决定。

---

## 十一、Python 替换代码块安全规则

⚠️ 以下错误各踩过一次，务必遵守：

**边界查找** — 禁止用 `find('}};')` 找代码块结束点（会意外包含后续代码）。
正确做法：用函数名或注释作为边界，如 `find('\nconst CB_BgPlugin=')`。

**字符编码** — Python 写入 JS 字符串时，禁止使用 Unicode 弯引号（`\u2018` `\u2019`）和 Unicode 省略号（`\u2026`）。
正确做法：省略号用 `'...'`，引号用直引号 `'` 或 `"`。

---

## 十二、Canvas 坐标系规则

Chart.js doughnut 的圆心是 `chartArea` 中心，`arc.outerRadius` 基于 `chartArea` 计算。
边界检测用 canvas 的 `W/H`（`ch.canvas.width` / `ch.canvas.height`）。

**两者不能混用：**
- `cx/cy` 必须用 `chartArea` 中心
- 边界计算时，`(limitX - cx) / cosA` 里的 `cx` 和 `limitX` 必须在同一坐标系
- `layout.padding` 会让 `chartArea` 比 canvas 小，偏移量 = padding 值

