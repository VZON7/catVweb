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


---

## 十三、I18N 操作安全规则

⚠️ 以下三条各踩过一次，直接导致页面崩溃：

**全局替换前必须排除 I18N 块**
Python 做字符串全局替换时，先定位 I18N 块边界再操作：
```python
i18n_start = content.find('const I18N={')
i18n_end = content.find('\nlet lang=', i18n_start)
# 只在 content[:i18n_start] + content[i18n_end:] 范围内替换
```
不排除会把 I18N 内部的字符串值替换成 `t('key')` 调用，造成循环依赖崩溃。

**Template literal 里禁用字符串拼接语法**
在 backtick template literal 内取 I18N 值，只能用 `${t('key')}`，绝对不能用 `'+t('key')+'`：
```js
// ✅ 正确：template literal 内用 ${}
`<button>${t('form_save')}</button>`
// ❌ 错误：字符串拼接语法在 template literal 内是 SyntaxError
`<button>'+t('form_save')+'</button>`
```

**I18N 必须是 script 最顶部第一段代码**
`const I18N` 使用 `const` 声明，有 Temporal Dead Zone。任何在 I18N 定义前调用 `t()` 的代码都会报 `ReferenceError: Cannot access 'I18N' before initialization`。每次移动代码块后，验证 `const I18N=` 仍然是 script 的第一行有效代码。

---

## 十四、UI 整改安全规则

- `cb-canvas-${pid}` id 和父容器结构不能动，CB_DonutPlugin / CB_BgPlugin 靠它定位
- `cb-side-panel` class 名不能改，统计面板展开动画依赖它
- `.proj-status.active / .done / .archived` class 名不能改，只改 CSS 属性值
- 按钮文字改动必须改 I18N.zh + I18N.en，不能硬编码 HTML
- `border-radius:999px` 保留例外：`.coin-pill` / `.proj-badge` / color 色点 / `#lang-zh` `#lang-en`
- 改颜色先改 `--purple` 等变量的值，不删变量名，全部验证后再清理
- 每次大改后用 Node `--check` 验证 script 块语法无误再输出

---

## 十五、新拟态（Neumorphism）开发规则

⚠️ 凹陷容器内子元素 box-shadow 失效是高频踩坑，务必遵守：

**凹陷容器内的 box-shadow 规则**
父容器为 `inset` 阴影时，子元素的凸起 `box-shadow` 视觉上会被抵消。
正确做法：子元素阴影参数缩小（3px 而非 6px），背景色保持 `var(--lavender)` 不变：
```css
/* 凹陷容器内子元素 — 轻凸起 */
box-shadow: 3px 3px 7px #C8C8D8, -3px -3px 7px #FFFFFF;
/* 凹陷容器内子元素 — hover 加强 */
box-shadow: 4px 4px 9px #C8C8D8, -4px -4px 9px #FFFFFF;
/* 凹陷容器内子元素 — active / selected 凹陷 */
box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF;
```

**蓝底按钮 active 不用白色高光**
蓝底（`var(--purple)`）按钮的 active 状态禁止使用双向 inset（会出现白色穿帮反光）。
正确做法：只用单向深蓝 inset，不加白色那层：
```css
/* ✅ 正确 */
box-shadow: inset 4px 4px 9px #2a4f6e;
/* ❌ 错误 — 白色高光在蓝底上穿帮 */
box-shadow: inset 4px 4px 9px #2a4f6e, inset -4px -4px 9px #FFFFFF;
```

**阴影数值唯一来源**
全站阴影数值以 `catvweb-design-system.md` 第二节为准，不得凭记忆自行填写。

---

## 十六、SVG 图标规则

涉及箭头或日历图标修改时，必须先读取 `catvweb-design-system.md` 第三节「SVG 图标系统」确认定案数据，不得凭训练数据自行生成 SVG。

**定案图标速查：**

| 图标 | 尺寸 | 关键数据 |
|---|---|---|
| 左箭头 | `14×12` | path: `M8 1L2 6L8 11M2 6H13`，stroke `#266ea7`，width 2 |
| 右箭头 | `14×12` | path: `M6 1L12 6L6 11M12 6H1`，stroke `#266ea7`，width 2 |
| 日历 | `26×26` | 顶栏 h=5，横线 y=9，数字 x=13 y=17，`dominant-baseline="central"` |

**图标阴影（统一）：**
```css
/* 默认 */
filter: drop-shadow(2.5px 2.5px 3px rgba(38,110,167,.6)) drop-shadow(-1.5px -1.5px 2px #fff);
/* hover */
filter: drop-shadow(3.5px 3.5px 5px rgba(38,110,167,.8)) drop-shadow(-2px -2px 3px #fff);
/* active */
filter: drop-shadow(.5px .5px 1px rgba(38,110,167,.3)) drop-shadow(-.5px -.5px .5px rgba(255,255,255,.7));
```

**日历日期动态注入：**
`id="cal-icon-day"` 在 `renderAll()` 内写入 `today.getDate()`，不得硬编码数字。

---

## 十七、多单位数字字段规则

数字字段（`type:'number'`）可以拥有多个子单位（如 time → min / hour），数据结构和改动范围分散在 5 处，改动前必须确认全部位置：

**数据结构：**
```js
f.units = ['min','hour']   // 字段定义，数组，可为空
f.unit = ''                 // 旧版单一字符串，保留向后兼容，不删
```

**记录值存储格式：**
- 单单位 / 旧数据：`fields[f.id] = "30"`（字符串）
- 多单位（`f.units.length > 1`）：`fields[f.id] = [{unit:'min',val:'30'}, {unit:'hour',val:'1'}]`（数组）

**改动涉及的 5 个位置，缺一不可：**
1. **项目设置 Modal**（renderModal）— 单位列表 UI：`addUnitInModal` / `removeUnit` / `renameUnit`
2. **填写记录表单**（buildNewForm / saveEntry）— 每个单位一行独立 input，保存时遍历 units 收集数组
3. **Inline Edit**（buildInlineEdit / saveEdit）— 同上，从 DOM 读取多个 `edf-${f.id}-${unit}` input
4. **显示层**（Entry Card / Tracker 卡片）— 数组必须 `.map(o=>o.val+' '+o.unit).join(' · ')`，禁止直接 `${v}` 插值（会变成 `[object Object]`）
5. **统计/计算**（calcCoins / Weekly Stats projStats / Chart Builder `_varData`）— 必须判断 `Array.isArray(v)`，按单位分别处理，不可不同单位直接相加

**Chart Builder 专属规则：**
多单位字段在 `initChartBuilder` 的 `vars` 构建时，拆分成多个独立变量，`key = f.id+'::'+unit`，`label = f.label+' ('+unit+')'`，让颜色分配/图例/统计天然走现有单变量逻辑，不需要改下游渲染代码。

**默认勾选规则：**
- 字段只有 1 个或 0 个单位 → 默认勾选（不变）
- 字段有 ≥2 个单位（拆分后的每个子变量）→ 不默认勾选，用户手动选

**每次改动后必须 grep 确认：**
```bash
grep -n "f.id\]" journal.html   # 确认所有读取点都判断了 Array.isArray
```

---

## 十八、Unicode 转义排查规则

⚠️ 硬编码中文文字可能以 Unicode 转义形式存在（如 `'\u6b21'` = 「次」），**普通 grep 中文字符搜不到**，必须额外排查。

**排查双语硬编码时，同时跑两次搜索：**
```bash
grep -n "次" journal.html          # 搜原始字符
grep -n "u6b21\|u..../u" journal.html  # 搜常见转义形式（按需替换 unicode code point）
```

或更通用，直接搜索转义模式本身：
```bash
grep -nE "\\\\u[0-9a-fA-F]{4}" journal.html
```
找到后人工确认是否为中文转义，逐一替换为 `t('key')`。

---

## 十九、Script 块语法检查固定流程

⚠️ journal.html 含 4 处 `<script>` 标签：CDN 引用小脚本（docx包装）、主逻辑块、以及**字符串内嵌**的 print 用假标签（在 cbExportPdf/exportTracker 函数里，不是真正的 HTML 标签）。

**注意：主逻辑块不是最后一对**——字符串内嵌的假标签在文件更后面，`tail -1` 会抓错。
**注意：文件是 CRLF 换行**（`\r\n`），纯 `grep -n "^<script>$"` 在部分环境下会因 `\r` 卡住匹配不到，必须用 `-P` 模式 + `\r?$`。

正确做法：取第 2 个 `<script>`（独立一行，排除带 `src=` 的引用行）作为起点，取第 2 个 `</script>` 作为终点（第 1 个 `</script>` 是 CDN 包装小脚本的结尾，不是主逻辑块）：

```bash
START=$(grep -nP "^<script>\r?$" journal.html | sed -n '2p' | cut -d: -f1)
END=$(grep -nP "^</script>\r?$" journal.html | sed -n '2p' | cut -d: -f1)
sed -n "$((START+1)),$((END-1))p" journal.html | tr -d '\r' > /tmp/check.js && node --check /tmp/check.js
```

每次大改后用此固定流程跑一次，不必每次重新计算行号。如果文件结构发生变化（比如又加了新的内嵌脚本或 CDN 引用），先用 `grep -nP "<script>"` 重新核对一遍标签数量和位置，再调整 `sed -n` 的取值序号。

---

## 二十、已知的「看起来像 bug 但其实是设计」清单

避免下次对话误判成缺陷去"修复"：

- **`cb_unit_suffix` 只有 zh key，没有 en key**——英文版数字格式走 `lang==='en'?('x'+v):...` 分支，直接拼 `'x'`，不调用这个 key，所以英文不需要对应翻译。不是双语缺失。
- **`f.unit`（旧字符串单位）仍保留在多处代码里，与新的 `f.units`（数组）共存**——这是向后兼容设计，旧项目数据没有 `units` 时回退用 `unit`。不要删除 `f.unit` 相关代码。


---

## 二十一、与 ZONZON 沟通约定

### 效果名称（用「我看到的东西」描述，不用 CSS class 名）

| 说这个 | 不说这个 |
|---|---|
| 「标准凸起效果」 | `var(--neu-raised)` |
| 「sidebar 凹陷效果」 | `var(--neu-inset-val)` |
| 「七日效果」 | 2C/2E 组合 |
| 「新纪录效果」 | 2G |
| 「周报告效果」 | 2H |
| 「竖向雕刻线」 | 2I |
| 「项目徽章效果」 | 2J |
| 「布凹效果」 | 2K |
| 「entry card 选项标签」 | `.ec-selval` |
| 「表单字段标题颜色」 | `.var-label` |
| 「跳过按钮」 | `.skip-btn` |
| 「Note/Link 切换按钮」 | `.extra-toggle` |
| 「新记录/编辑表单外层背景」 | `.form-card` |
| 「entry card 字段分隔线」 | `.ec-vdivider` |
| 「entry card note 文字」 | `.ec-note` |
| 「猫爪币」 | `.ec-coin` |

### 阴影数值来源
全站阴影以 `catvweb-design-system.md` 第二节为准，不凭记忆填写。
设计系统文档改用「效果名称」而非编号，沟通时直接说效果名称。

### 翻译决策
遇到不确定的英文翻译，列出 2-3 个选项问 ZONZON，不自行决定。
