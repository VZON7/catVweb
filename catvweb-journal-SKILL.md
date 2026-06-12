# catvweb — journal.html 开发 Skill

## 这个 Skill 的用途

每次开始开发 `journal.html` 前必须读这份文件。
它记录了项目的模块结构、已知代码规范、以及禁止重复踩的坑。

---

## 一、文件结构总览

`journal.html` 是一个单文件应用，结构如下：

```
journal.html
├── <head>
│   ├── 外部资源：Chart.js 4.4.1、docx 9.0.0、Google Fonts
│   └── <style> — 所有 CSS，按模块分区注释
│
├── <body>
│   ├── 装饰元素 .deco
│   ├── <nav #site-nav>
│   ├── <div .page #app>  — 页面主体
│   │   ├── .page-header
│   │   ├── .stats-row  — 今日统计 3 格
│   │   └── .main-layout
│   │       ├── .sidebar  — 周导航 + project 列表
│   │       └── #main-area  — 动态内容区（journal / stats / tracker）
│   └── #modal-container  — project 编辑弹窗挂载点
│
└── <script>
    ├── 1. 顶层常量
    ├── 2. 状态变量 (State)
    ├── 3. 数据层 (loadData / saveData / calcCoins / recalcTotalCoins)
    ├── 4. 渲染层 — Sidebar / Journal / Stats / Tracker
    ├── 5. 表单逻辑 (openForm / saveEntry / cancelForm / inline edit)
    ├── 6. Project Modal (renderModal / saveProject / deleteProject)
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

以下常量**只能在 script 最顶部定义一次**，任何地方引用都从这里取，不得在函数内部重新定义。

### 颜色 Palette
```js
// ── Chart Builder 颜色 palette（唯一来源）────────────────
const CB_PALETTES = {
  warm: [
    ['#FFADAD','#FF6B6B','#E63946','#B52131','#7D1421'],
    ['#FFCB91','#FFA040','#F07800','#B85A00','#7A3A00'],
    ['#A8E6B4','#5ECC76','#2DAF4F','#1A8036','#0D5220'],
    ['#D4B8F5','#A97DE0','#7B4FC0','#56349A','#351D6A'],
    ['#A8D4F5','#5BAEE0','#2082C0','#0D5A96','#053460'],
    ['#F5E6A8','#E0C050','#B89820','#8A6E08','#5A4400'],
  ],
  cool: [
    ['#F2B8BB','#D97480','#B84C58','#8A3040','#5C1E2A'],
    ['#F0D4A8','#D4A054','#A87030','#7A4E18','#4E2E08'],
    ['#A8D4C0','#60A882','#368058','#1E5A38','#0C3420'],
    ['#C4BEE8','#8E86CC','#5E56A8','#3C368A','#201C5A'],
    ['#B8D4F0','#6898C8','#3868A0','#1C4878','#082850'],
    ['#E0D8A8','#B8A860','#887830','#5A5010','#342E00'],
  ]
};
```

### Palette 工具函数
```js
// 取当前色调下某个 variable index 的颜色组
function cbGetGroupColors(vi) {
  const pal = CB_PALETTES[window._cbColorMode || 'warm'] || CB_PALETTES.warm;
  return pal[vi % pal.length];
}

// 根据选项数量取均匀分布的 stop（唯一来源）
function cbGetStops(stops, n) {
  if (n === 1) return [stops[2]];
  if (n === 2) return [stops[1], stops[3]];
  if (n === 3) return [stops[1], stops[2], stops[3]];
  if (n === 4) return [stops[0], stops[1], stops[3], stops[4]];
  return stops.slice(0, n);
}
```

> ⚠️ **禁止在 `cbRenderBar`、`cbRenderDonut`、`CB_DonutPlugin` 内部重新定义 palette 或 getStops 变体。**
> 过去出现过 `CB_PALETTES`、`CB_PALETTES2`、`palettes2` 三份相同内容并存的情况，已修复。

### 状态标签
```js
// ── Project 状态标签（唯一来源）──────────────────────────
const STATUS_LABELS = { active: '进行中', done: '已完成', archived: '已归档' };
```

> ⚠️ **禁止在 `renderTracker`、`cbExportDocx`、`exportTracker` 内部各自定义 `statusLabel` 对象。**

---

## 三、工具函数（唯一来源）

### 下载触发器
```js
// 所有文件下载统一用这个函数，不要在各导出函数里手写 createElement('a')
function triggerDownload(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
```

> ⚠️ 过去 `cbExportDocx`、`cbExportPdf`、`exportTracker` 里各自手写了同样的 4 行，已合并。

---

## 四、CSS 规范

### 不允许重复定义同名 class
以下 class 过去曾出现过两次定义（属性互相覆盖，难以追踪）：
- `.cb-step-lbl` — 只保留一份，放在 `/* CHART BUILDER */` 区块
- `.cb-var-chip` — 只保留一份，放在 `/* CHART BUILDER */` 区块

### CSS 区块注释规范
每个功能模块的 CSS 用注释分隔，格式统一：
```css
/* ── MODULE NAME ─────────────────────────────────── */
```

已有的区块顺序（不要打乱）：
1. Reset & CSS variables
2. NAV
3. LAYOUT
4. HEADER
5. STATS
6. SIDEBAR
7. MAIN AREA
8. ENTRY CARD
9. INLINE EDIT
10. FORM
11. PROJ PICKER
12. SELECT DROPDOWN
13. STATS VIEW
14. MODAL
15. CHART BUILDER
16. CALENDAR PICKER
17. COLOR PICKER
18. DECO

---

## 五、已知的高风险区域

### renderModal() — 不要在局部更新时整体重 render
`renderModal()` 会完整重建整个 modal 的 innerHTML，然后 `setTimeout(()=>cpInitPicker(...),0)` 重新绑定 color picker 的所有事件。  
**问题**：用户改状态、改字段名等微小操作也会触发整体重 render，造成：
- color picker 事件监听器叠加（mousemove 叠加最明显）
- 用户正在输入的 input 失去焦点

**规则**：
- 目前维持整体 render 方式，但 `cpInitPicker` 必须在 `renderModal` 结尾只调用一次
- 未来若要优化，应拆成骨架 render（首次）+ 局部 patch（状态/字段变更）

### form 状态变量 — 清空时必须全部清
以下变量是表单的全局 state，`openForm`、`cancelForm`、`saveEntry` 都必须完整重置所有变量，不能漏掉任何一个：
```js
formTitle, formNote, formLink, formLinkLabel  // 文字输入
showForm, showProjPicker                       // 显示状态
formExtras                                     // { note: false, link: false }
window._fv                                     // select field 当前选中值
skippedFields                                  // { [fieldId]: bool }
openDropId                                     // 当前打开的 dropdown id
```

> 未来建议重构为单一 `formState` object，但在重构前保持现有模式，并确保每个重置点都完整清空。

### Chart.js plugin 注册
`CB_NumPlugin`、`CB_TitlePlugin`、`CB_DonutPlugin`、`CB_BgPlugin` 通过 `Chart.register(...)` 全局注册一次。  
**不要**在 `cbRenderBar` 或 `cbRenderDonut` 的 `plugins:[]` 数组里重复传入已全局注册的 plugin（会导致 plugin 执行两次）。

---

## 六、开发流程规范

### 每次修改前
1. 确认要改的功能属于哪个模块（对照第一节的结构总览）
2. 检查要用到的常量是否已在顶层定义，不重复定义
3. 如果要新增 CSS class，先搜索是否已存在同名 class

### 每次修改后
1. 确认没有产生新的同名函数或同名 CSS class
2. 确认所有 `statusLabel`、palette、`getStops` 的引用都指向顶层常量
3. 确认导出类函数都用 `triggerDownload()` 而不是手写下载逻辑

### 新增功能时
- 在 script 的对应模块区块内添加代码，保持区块顺序
- 新增 CSS 放在对应模块的 CSS 区块内
- 如果是全新模块，在 script 顶部的结构注释里登记

---

## 七、localStorage key 一览

| key | 用途 |
|-----|------|
| `cj_projects` | 所有 project 数据 |
| `cj_entries` | 所有日记条目（按 dateKey 分组） |
| `catTokens` | Cat Token 总余额 |
| `cj_mypalette` | color picker 已保存颜色 |

---

## 八、dateKey 格式

`dk(date)` 返回 `YYYY-M-D`（月日不补零），例如 `2026-6-12`。  
所有 `entries` 的 key、比较操作都使用这个格式，不要使用 ISO 格式（`2026-06-12`）以免 key 不匹配。
